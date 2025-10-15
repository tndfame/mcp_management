import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AbstractTool } from "./AbstractTool.js";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../common/response.js";
import { isReadOnlySelect, queryReadOnly } from "../common/db/mssql.js";

type GenerateContentResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

export default class AiQueryMssql extends AbstractTool {
  register(server: McpServer) {
    const instructionSchema = z
      .string()
      .min(1)
      .describe("Natural language request to query MSSQL (Thai/English)");
    const maxRowsSchema = z
      .number()
      .int()
      .min(1)
      .max(200)
      .default(10)
      .describe("Max rows to return");
    const allowedSchemasSchema = z
      .array(z.string())
      .optional()
      .describe("Optional whitelist of schemas (e.g., ['dbo','sales'])");
    const allowedTablesSchema = z
      .array(z.string())
      .optional()
      .describe(
        "Optional whitelist of fully qualified tables (e.g., ['dbo.customer_dummy'])",
      );

    server.tool(
      "ai_query_mssql",
      "Generate a safe read-only MSSQL SELECT from instruction via Gemini, validate, execute, and return rows.",
      {
        instruction: instructionSchema,
        maxRows: maxRowsSchema,
        allowedSchemas: allowedSchemasSchema,
        allowedTables: allowedTablesSchema,
      },
      async ({ instruction, maxRows, allowedSchemas, allowedTables }) => {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey)
          return createErrorResponse(
            "Please set GEMINI_API_KEY (or GOOGLE_API_KEY)",
          );

        // Optionally fetch top tables/columns to guide the LLM
        let schemaSnippet = "";
        try {
          const tablesRes = await queryReadOnly(
            "SELECT TOP 50 s.name AS schema_name, t.name AS table_name FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE t.is_ms_shipped = 0 ORDER BY s.name, t.name",
          );
          const tables = tablesRes.rows || [];
          schemaSnippet +=
            `Tables (top 50)\n` +
            tables.map(r => `- ${r.schema_name}.${r.table_name}`).join("\n");
        } catch {
          // ignore
        }

        function buildPrompt() {
          return (
            `You are a SQL assistant for Microsoft SQL Server.\n` +
            `Task: Convert the user's instruction into ONE safe SELECT/WITH query.\n` +
            `Rules:\n` +
            `- OUTPUT STRICT JSON only: {"sql":"...","params":{},"limit":N}. No markdown, no explanation.\n` +
            `- Only SELECT or WITH; single statement; NO DML/DDL (INSERT/UPDATE/DELETE/ALTER/DROP).\n` +
            `- Use fully qualified table names if possible (e.g., dbo.table).\n` +
            `- If schemas/tables are provided as allowlists, only use those.\n` +
            `- Limit rows to ${maxRows} (or fewer) using TOP for MSSQL if not specified.\n` +
            (allowedSchemas?.length
              ? `Allowed schemas: ${allowedSchemas.join(", ")}\n`
              : ``) +
            (allowedTables?.length
              ? `Allowed tables: ${allowedTables.join(", ")}\n`
              : ``) +
            (schemaSnippet ? `\nSchema snippet:\n${schemaSnippet}\n` : ``) +
            `\nInstruction: ${instruction}`
          );
        }

        async function callGemini(): Promise<string> {
          const endpoint = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
            "gemini-2.0-flash",
          )}:generateContent`;
          const body = {
            contents: [{ role: "user", parts: [{ text: buildPrompt() }] }],
          };
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": apiKey,
            },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
          const data = (await res.json()) as GenerateContentResponse;
          const raw =
            data?.candidates?.[0]?.content?.parts
              ?.map(p => p.text || "")
              .join("") || "";
          if (!raw) throw new Error("Empty response from model");
          const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
          let jsonText = fence ? fence[1].trim() : raw;
          if (!fence) {
            const s = raw.indexOf("{");
            const e = raw.lastIndexOf("}");
            if (s !== -1 && e !== -1 && e > s) jsonText = raw.slice(s, e + 1);
          }
          return jsonText;
        }

        try {
          const jsonText = await callGemini();
          let plan: {
            sql?: string;
            params?: Record<string, any>;
            limit?: number;
          };
          try {
            plan = JSON.parse(jsonText);
          } catch (e: any) {
            return createErrorResponse(
              `Failed to parse SQL plan JSON: ${e?.message || e}`,
            );
          }
          if (!plan?.sql)
            return createErrorResponse("Model did not provide sql");
          let sql = plan.sql.trim();
          // Basic safety
          if (!isReadOnlySelect(sql))
            return createErrorResponse(
              "Only read-only SELECT/WITH queries are allowed",
            );
          if (/[;]/.test(sql))
            return createErrorResponse("Multiple statements are not allowed");
          // Whitelist checks
          if (allowedSchemas?.length) {
            const ok = allowedSchemas.some(s =>
              new RegExp(`\\b${s}\\.`, "i").test(sql),
            );
            if (!ok)
              return createErrorResponse("Query references disallowed schema");
          }
          if (allowedTables?.length) {
            const ok = allowedTables.some(t =>
              new RegExp(`\\b${t}\\b`, "i").test(sql),
            );
            if (!ok)
              return createErrorResponse("Query references disallowed table");
          }
          // Enforce TOP limit for MSSQL if missing
          if (/^select\s+/i.test(sql) && !/^select\s+top\s+\d+/i.test(sql)) {
            sql = sql.replace(/^select\s+/i, `SELECT TOP ${maxRows} `);
          }

          const result = await queryReadOnly(sql, plan.params || {});
          const rows = result.rows?.slice(0, maxRows) || [];
          return createSuccessResponse({
            sql,
            params: plan.params || {},
            columns: result.columns,
            rowCount: result.rows?.length || 0,
            rows,
          });
        } catch (e: any) {
          return createErrorResponse(
            `ai_query_mssql failed: ${e?.message || e}`,
          );
        }
      },
    );
  }
}
