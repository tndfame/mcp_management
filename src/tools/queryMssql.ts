import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AbstractTool } from "./AbstractTool.js";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../common/response.js";
import { queryReadOnly } from "../common/db/mssql.js";

export default class QueryMssql extends AbstractTool {
  register(server: McpServer) {
    const sqlSchema = z
      .string()
      .min(1)
      .describe(
        "Read-only SQL beginning with SELECT or WITH. Parameters as @name.",
      );
    const paramsSchema = z
      .record(z.any())
      .optional()
      .describe("Key-value parameters for @name placeholders in SQL.");
    const limitSchema = z
      .number()
      .int()
      .min(1)
      .max(500)
      .default(100)
      .describe("Maximum rows to return (client-side slice).");
    const maxCharsSchema = z
      .number()
      .int()
      .min(1000)
      .max(200000)
      .default(12000)
      .describe("Max characters in serialized preview.");

    server.tool(
      "query_mssql",
      "Run a read-only MSSQL query (SELECT/WITH). Returns columns, rowCount, and sliced rows for preview.",
      {
        sql: sqlSchema,
        params: paramsSchema,
        limit: limitSchema,
        maxChars: maxCharsSchema,
      },
      async ({ sql, params, limit, maxChars }) => {
        try {
          const { rows, columns } = await queryReadOnly(sql, params);
          const sliced = rows.slice(0, limit);
          const payload = { columns, rowCount: rows.length, rows: sliced };
          let text = JSON.stringify(payload);
          if (text.length > maxChars) {
            text = text.slice(0, maxChars) + "... (truncated)";
          }
          return createSuccessResponse({
            columns,
            rowCount: rows.length,
            rows: sliced,
          });
        } catch (e: any) {
          return createErrorResponse(`MSSQL query failed: ${e?.message || e}`);
        }
      },
    );
  }
}
