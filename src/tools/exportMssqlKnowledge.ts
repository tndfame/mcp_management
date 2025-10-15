import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AbstractTool } from "./AbstractTool.js";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../common/response.js";
import { queryReadOnly } from "../common/db/mssql.js";

export default class ExportMssqlKnowledge extends AbstractTool {
  register(server: McpServer) {
    const outputPathSchema = z
      .string()
      .default("docs/db-knowledge.md")
      .describe("Output Markdown path (relative), e.g., docs/db-knowledge.md");
    const tableLimitSchema = z
      .number()
      .int()
      .min(1)
      .max(500)
      .default(200)
      .describe("Max number of tables to document");
    const columnLimitSchema = z
      .number()
      .int()
      .min(100)
      .max(5000)
      .default(2000)
      .describe("Max number of columns to document in total");

    server.tool(
      "export_mssql_knowledge",
      "Export MSSQL schema (tables/columns) into a Markdown knowledge file for Q/A.",
      {
        outputPath: outputPathSchema,
        tableLimit: tableLimitSchema,
        columnLimit: columnLimitSchema,
      },
      async ({ outputPath, tableLimit, columnLimit }) => {
        try {
          const tablesRes = await queryReadOnly(
            `SELECT TOP ${tableLimit} s.name AS schema_name, t.name AS table_name
             FROM sys.tables t
             JOIN sys.schemas s ON t.schema_id = s.schema_id
             WHERE t.is_ms_shipped = 0
             ORDER BY s.name, t.name`,
          );
          const tables = tablesRes.rows || [];

          const colsRes = await queryReadOnly(
            `SELECT TOP ${columnLimit}
               TABLE_SCHEMA AS schema_name,
               TABLE_NAME AS table_name,
               COLUMN_NAME,
               DATA_TYPE,
               IS_NULLABLE,
               CHARACTER_MAXIMUM_LENGTH
             FROM INFORMATION_SCHEMA.COLUMNS
             ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION`,
          );
          const cols = colsRes.rows || [];

          const byTable = new Map<string, any[]>();
          for (const c of cols) {
            const key = `${c.schema_name}.${c.table_name}`;
            if (!byTable.has(key)) byTable.set(key, []);
            byTable.get(key)!.push(c);
          }

          const lines: string[] = [];
          lines.push(`# Database Knowledge`);
          lines.push("");
          lines.push(`Generated at: ${new Date().toISOString()}`);
          lines.push("");
          lines.push(`## Tables (${tables.length})`);
          for (const t of tables) {
            lines.push(`- ${t.schema_name}.${t.table_name}`);
          }
          lines.push("");

          for (const t of tables) {
            const key = `${t.schema_name}.${t.table_name}`;
            lines.push(`## ${key}`);
            lines.push(
              `Description: (กรุณาใส่คำอธิบายตารางนี้ เช่น ใช้เก็บอะไร, ความสัมพันธ์สำคัญ)\n`,
            );
            const list = byTable.get(key) || [];
            if (list.length) {
              lines.push(`Columns (${list.length})`);
              lines.push(`| Column | Type | Nullable | Length |`);
              lines.push(`| --- | --- | --- | --- |`);
              for (const c of list) {
                lines.push(
                  `| ${c.COLUMN_NAME} | ${c.DATA_TYPE} | ${c.IS_NULLABLE} | ${c.CHARACTER_MAXIMUM_LENGTH ?? ""} |`,
                );
              }
            } else {
              lines.push(`(no columns fetched)`);
            }
            lines.push("");
            lines.push(`Example questions:`);
            lines.push(`- ตารางนี้มีคอลัมน์อะไรบ้าง`);
            lines.push(
              `- ตัวอย่างข้อมูล 10 แถวแรก (ถ้าต้องการให้แสดงข้อมูลจริง ให้ใช้โหมด DB และพิมพ์เช่น \"เข้าไป ${key} แสดง10 ข้อมูล\")`,
            );
            lines.push("");
          }

          const fs = await import("fs");
          const path = await import("path");
          const abs = path.resolve(process.cwd(), outputPath);
          fs.mkdirSync(path.dirname(abs), { recursive: true });
          fs.writeFileSync(abs, lines.join("\n"), "utf8");
          return createSuccessResponse({
            outputPath: outputPath,
            tables: tables.length,
            columns: cols.length,
          });
        } catch (e: any) {
          return createErrorResponse(
            `Failed to export MSSQL knowledge: ${e?.message || e}`,
          );
        }
      },
    );
  }
}
