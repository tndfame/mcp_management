import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { messagingApi } from "@line/bot-sdk";
import fs from "fs";
import path from "path";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../common/response.js";
import { AbstractTool } from "./AbstractTool.js";
import { NO_USER_ID_ERROR } from "../common/schema/constants.js";
import {
  buildActionsPlannerPrompt,
  buildQaPrompt,
} from "../common/plannerPrompts.js";
import { loadAiStyle, normalizeGreetingIfPresent } from "../common/aiConfig.js";

type GenerateContentResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

// Debug/file logger (stderr + optional file with rotation)
const __DEBUG_GEMINI = /^(1|true|yes)$/i.test(
  String(process.env.GEMINI_COMMAND_DEBUG || process.env.DEBUG_GEMINI || ""),
);
const __LOG_FILE = String(process.env.GEMINI_COMMAND_LOG_FILE || "").trim();
const __LOG_MAX_BYTES = Math.max(
  1024 * 256,
  parseInt(String(process.env.GEMINI_COMMAND_LOG_MAX_BYTES || "1048576"), 10) ||
    1048576,
); // min 256KB, default 1MB
const __LOG_BACKUPS = Math.max(
  0,
  parseInt(String(process.env.GEMINI_COMMAND_LOG_BACKUPS || "3"), 10) || 3,
);
const __LOG_ENABLED = __LOG_FILE.length > 0;

function ensureDir(file: string) {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch {}
}

function rotateIfNeeded(file: string) {
  try {
    if (!fs.existsSync(file)) return;
    const st = fs.statSync(file);
    if (st.size < __LOG_MAX_BYTES) return;
    // rotate: file.(n) -> file.(n+1), file -> file.1
    for (let i = __LOG_BACKUPS - 1; i >= 1; i--) {
      const src = `${file}.${i}`;
      const dst = `${file}.${i + 1}`;
      if (fs.existsSync(src)) {
        try {
          fs.renameSync(src, dst);
        } catch {}
      }
    }
    if (__LOG_BACKUPS > 0) {
      const first = `${file}.1`;
      try {
        fs.renameSync(file, first);
      } catch {}
    } else {
      try {
        fs.truncateSync(file, 0);
      } catch {}
    }
  } catch {}
}

function writeFileLog(line: string) {
  if (!__LOG_ENABLED) return;
  try {
    const abs = path.isAbsolute(__LOG_FILE)
      ? __LOG_FILE
      : path.resolve(process.cwd(), __LOG_FILE);
    ensureDir(abs);
    rotateIfNeeded(abs);
    fs.appendFileSync(abs, line + "\n", { encoding: "utf8" });
  } catch {}
}

function dbg(...args: any[]) {
  if (!(__DEBUG_GEMINI || __LOG_ENABLED)) return;
  try {
    const ts = new Date().toISOString();
    const text = `[gemini_command] ${ts} ${args
      .map(a => {
        try {
          return typeof a === "string" ? a : JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(" ")}`;
    // stderr to avoid interfering with MCP stdout
    if (__DEBUG_GEMINI) console.error(text);
    writeFileLog(text);
  } catch {}
}

let __LOG_ANNOUNCED = false;
function announceLogConfig() {
  if (__LOG_ANNOUNCED) return;
  __LOG_ANNOUNCED = true;
  try {
    const abs = __LOG_ENABLED
      ? path.isAbsolute(__LOG_FILE)
        ? __LOG_FILE
        : path.resolve(process.cwd(), __LOG_FILE)
      : null;
    dbg("log:config", {
      toFile: __LOG_ENABLED,
      file: abs,
      maxBytes: __LOG_MAX_BYTES,
      backups: __LOG_BACKUPS,
    });
  } catch {}
}

export default class GeminiCommand extends AbstractTool {
  private client: messagingApi.MessagingApiClient;
  private destinationId: string;

  constructor(client: messagingApi.MessagingApiClient, destinationId: string) {
    super();
    this.client = client;
    this.destinationId = destinationId;
  }

  register(server: McpServer) {
    const instructionSchema = z
      .string()
      .min(1)
      .describe(
        "Natural language command, e.g., 'à¸”à¸¶à¸‡à¹‚à¸›à¸£à¹„à¸Ÿà¸¥à¹Œà¸‚à¸­à¸‡à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰', 'à¸ªà¹ˆà¸‡à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸§à¹ˆà¸² à¸ªà¸§à¸±à¸ªà¸”à¸µ', 'à¸”à¸¹à¸£à¸²à¸¢à¸à¸²à¸£ rich menu'",
      );

    const modelSchema = z
      .string()
      .default("gemini-2.0-flash")
      .describe("Gemini model name, e.g., gemini-2.0-flash");
    const filePathSchema = z
      .string()
      .optional()
      .describe(
        "Optional relative Markdown path (e.g., docs/data-learning/knowledge.md) to use as knowledge context",
      );
    const knowledgeSourceSchema = z
      .enum(["file", "mssql"])
      .optional()
      .default("file")
      .describe(
        "Choose knowledge source: 'file' (Markdown via filePath) or 'mssql' (database schema snapshot)",
      );
    const userIdSchema = z
      .string()
      .optional()
      .describe(
        "Optional LINE userId to target. Overrides DESTINATION_USER_ID if provided.",
      );
    const modeSchema = z
      .enum(["auto", "actions", "qa"]) // auto lets the planner decide
      .optional()
      .default("auto")
      .describe(
        "Mode: 'auto' (planner decides), 'actions' (force planner), 'qa' (answer from knowledge and push text)",
      );
    const dbQuerySchema = z
      .string()
      .optional()
      .describe(
        "Optional read-only SQL (SELECT/WITH) to fetch data from MSSQL and include as knowledge (Markdown table).",
      );
    const dbParamsSchema = z
      .record(z.any())
      .optional()
      .describe(
        "Optional parameters for dbQuery (mapped to @name placeholders)",
      );
    const dbLimitSchema = z
      .number()
      .int()
      .min(1)
      .max(200)
      .default(100)
      .describe(
        "Max rows to include from dbQuery in knowledge (default 100, max 200)",
      );

    server.tool(
      "gemini_command",
      "Use Gemini to plan and execute one LINE action (get profile, get rich menu list, get message quota, push/broadcast text or flex).",
      {
        instruction: instructionSchema,
        model: modelSchema,
        filePath: filePathSchema,
        knowledgeSource: knowledgeSourceSchema,
        userId: userIdSchema,
        mode: modeSchema,
        dbQuery: dbQuerySchema,
        dbParams: dbParamsSchema,
        dbLimit: dbLimitSchema,
      },
      async ({
        instruction,
        model,
        filePath,
        knowledgeSource,
        userId,
        mode,
        dbQuery,
        dbParams,
        dbLimit,
      }) => {
        announceLogConfig();
        dbg("invoke", {
          mode,
          knowledgeSource,
          userId: userId || this.destinationId,
          filePath,
          hasDbQuery: Boolean(dbQuery),
          model,
        });
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
          return createErrorResponse(
            "Please set GEMINI_API_KEY (or GOOGLE_API_KEY)",
          );

        // Build knowledge chunk from selected source
        let knowledgeChunk = "";
        const MAX = 12000;
        async function loadKnowledgeFromFile(fp?: string) {
          if (!fp) return "";
          try {
            const fs = await import("fs");
            const path = await import("path");
            const abs = path.resolve(process.cwd(), fp);
            if (fs.existsSync(abs)) {
              const text = fs.readFileSync(abs, "utf8");
              return text.length > MAX
                ? text.slice(0, MAX) + "\n... (truncated)"
                : text;
            }
          } catch {}
          return "";
        }
        async function loadKnowledgeFromMssql(): Promise<string> {
          try {
            const { queryReadOnly } = await import("../common/db/mssql.js");
            const parts: string[] = [];
            // Tables count
            const c = await queryReadOnly(
              "SELECT COUNT(*) AS tableCount FROM sys.tables WHERE is_ms_shipped = 0",
            );
            const count =
              Array.isArray(c.rows) && c.rows[0]?.tableCount != null
                ? c.rows[0].tableCount
                : undefined;
            parts.push(`# Database Snapshot`);
            if (typeof count === "number")
              parts.push(`Tables (user): ${count}`);
            // List tables (top N)
            const t = await queryReadOnly(
              "SELECT TOP 100 s.name AS schema_name, t.name AS table_name FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE t.is_ms_shipped = 0 ORDER BY t.name",
            );
            if (t.rows?.length) {
              parts.push("\n## Tables (top 100)");
              for (const r of t.rows) {
                parts.push(`- ${r.schema_name}.${r.table_name}`);
              }
            }
            // List columns (top N)
            const cols = await queryReadOnly(
              "SELECT TOP 300 TABLE_SCHEMA AS schema_name, TABLE_NAME AS table_name, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION",
            );
            if (cols.rows?.length) {
              parts.push("\n## Columns (top 300)");
              for (const r of cols.rows) {
                parts.push(
                  `- ${r.schema_name}.${r.table_name}.${r.COLUMN_NAME} (${r.DATA_TYPE})`,
                );
              }
            }
            const text = parts.join("\n");
            return text.length > MAX
              ? text.slice(0, MAX) + "\n... (truncated)"
              : text;
          } catch {
            return "";
          }
        }

        function rowsToMarkdown(rows: any[], maxRows: number): string {
          if (!Array.isArray(rows) || !rows.length) return "(no rows)";
          const cols = Object.keys(rows[0]);
          const head = `| ${cols.join(" | ")} |\n| ${cols
            .map(() => "---")
            .join(" | ")} |`;
          const body = rows
            .slice(0, maxRows)
            .map(r => `| ${cols.map(c => String(r[c] ?? "")).join(" | ")} |`)
            .join("\n");
          return `${head}\n${body}`;
        }

        async function loadKnowledgeFromDbQuery(
          sql?: string,
          params?: any,
          limit: number = 100,
        ): Promise<string> {
          if (!sql) return "";
          try {
            const { queryReadOnly } = await import("../common/db/mssql.js");
            const result = await queryReadOnly(sql, params);
            const md = rowsToMarkdown(
              (result.rows as any[]) || [],
              Math.min(200, Math.max(1, limit)),
            );
            let text = `# Query Result\nColumns: ${result.columns.join(", ")}\nRow count: ${
              (result.rows as any[])?.length ?? 0
            }\n\n${md}`;
            return text.length > MAX
              ? text.slice(0, MAX) + "\n... (truncated)"
              : text;
          } catch (e: any) {
            return `Query error: ${e?.message || e}`;
          }
        }

        function inferSimpleSelectFromInstruction(txt: string): {
          sql?: string;
          limit?: number;
        } {
          try {
            const t = txt.toLowerCase();
            const m = t.match(
              /(?:table|à¸ˆà¸²à¸|à¹„à¸›|à¹€à¸‚à¹‰à¸²à¹„à¸›)?\s*([a-zA-Z0-9_\.]+).*?(?:à¹à¸ªà¸”à¸‡|show|top|\b)\s*(\d{1,4})/,
            );
            const m2 = t.match(
              /(?:à¹à¸ªà¸”à¸‡|show)\s*(\d{1,4}).*?from\s*([a-zA-Z0-9_\.]+)/,
            );
            let table: string | undefined;
            let lim: number | undefined;
            if (m) {
              table = m[1];
              lim = parseInt(m[2], 10);
            } else if (m2) {
              table = m2[2];
              lim = parseInt(m2[1], 10);
            } else {
              const m3 = t.match(
                /(?:à¹€à¸‚à¹‰à¸²à¹„à¸›|à¹„à¸›|table)\s+([a-zA-Z0-9_\.]+)/,
              );
              if (m3) table = m3[1];
            }
            if (!table) return {};
            if (!lim || !Number.isFinite(lim)) lim = 10;
            if (!table.includes(".")) table = `dbo.${table}`;
            return { sql: `SELECT TOP ${lim} * FROM ${table}`, limit: lim };
          } catch {
            return {};
          }
        }
        console.log("ðŸš€ ~ GeminiCommand ~ register ~ mode:", mode);

        if (knowledgeSource === "mssql") {
          const parts: string[] = [];
          const snapshot = await loadKnowledgeFromMssql();
          if (snapshot) parts.push(snapshot);
          const inferred = inferSimpleSelectFromInstruction(instruction);
          const q = await loadKnowledgeFromDbQuery(
            dbQuery || inferred.sql,
            dbParams,
            dbLimit || inferred.limit || 100,
          );
          if (q) parts.push(q);
          knowledgeChunk = parts.join("\n\n");
        } else {
          knowledgeChunk = await loadKnowledgeFromFile(filePath);
        }
        dbg("knowledge", {
          source: knowledgeSource,
          length: knowledgeChunk ? knowledgeChunk.length : 0,
          filePath,
        });

        if (mode === "qa") {
          dbg("qa:start");
          try {
            const to = (userId as string) || this.destinationId;
            if (!to) return createErrorResponse(NO_USER_ID_ERROR);

            // Fast-path for MSSQL Q/A: if instruction indicates a simple table sample, fetch directly and reply.
            if (knowledgeSource === "mssql") {
              try {
                // Reuse simple inference to detect table + limit from instruction
                function inferSimpleSelectFromInstruction(txt: string): {
                  table?: string;
                  limit?: number;
                } {
                  const t = (txt || "").toLowerCase();
                  const m = t.match(
                    /(?:table|à¸ˆà¸²à¸|à¹„à¸›|à¹€à¸‚à¹‰à¸²à¹„à¸›)?\s*([a-z0-9_\.]+).*?(?:à¹à¸ªà¸”à¸‡|show|top|\b)\s*(\d{1,4})/i,
                  );
                  const m2 = t.match(
                    /(?:à¹à¸ªà¸”à¸‡|show)\s*(\d{1,4}).*?from\s*([a-z0-9_\.]+)/i,
                  );
                  let table: string | undefined;
                  let lim: number | undefined;
                  if (m) {
                    table = m[1];
                    lim = parseInt(m[2], 10);
                  } else if (m2) {
                    table = m2[2];
                    lim = parseInt(m2[1], 10);
                  } else {
                    const m3 = t.match(
                      /(?:à¹€à¸‚à¹‰à¸²à¹„à¸›|à¹„à¸›|table)\s+([a-z0-9_\.]+)/i,
                    );
                    if (m3) table = m3[1];
                  }
                  if (table && !table.includes(".")) table = `dbo.${table}`;
                  if (!lim || !Number.isFinite(lim)) lim = 10;
                  return { table, limit: lim };
                }

                const inferred = inferSimpleSelectFromInstruction(instruction);
                if (inferred.table) {
                  const { queryReadOnly } = await import(
                    "../common/db/mssql.js"
                  );
                  const sql = `SELECT TOP ${inferred.limit} * FROM ${inferred.table}`;
                  const result = await queryReadOnly(sql);
                  const rows: any[] = Array.isArray((result as any).rows)
                    ? ((result as any).rows as any[])
                    : [];
                  const cols: string[] = rows[0] ? Object.keys(rows[0]) : [];
                  const previewCols = cols.slice(0, 3);
                  const outLines: string[] = [];
                  outLines.push(
                    `à¸•à¸²à¸£à¸²à¸‡ ${inferred.table} à¹à¸–à¸§à¸•à¸±à¸§à¸­à¸¢à¹ˆà¸²à¸‡ ${Math.min(rows.length, inferred.limit || 10)} à¹à¸–à¸§`,
                  );
                  rows.slice(0, inferred.limit || 10).forEach((r, i) => {
                    const parts = previewCols.map(
                      c => `${c}: ${String(r[c] ?? "")}`,
                    );
                    outLines.push(`${i + 1}. ${parts.join(", ")}`);
                  });
                  const textSample = outLines.join("\n").slice(0, 2000);
                  const resp = await this.client.pushMessage({
                    to,
                    messages: [
                      {
                        type: "text",
                        text: textSample,
                      } as unknown as messagingApi.Message,
                    ],
                  });
                  return createSuccessResponse({
                    pushed: resp,
                    preview: textSample.slice(0, 500),
                  });
                }
              } catch {
                // fall through to LLM-based answer if direct fetch fails
              }
            }

            let userDisplayName = "";
            try {
              const to = (userId as string) || this.destinationId;
              if (to) {
                const prof = await this.client.getProfile(to);
                userDisplayName = (prof as any)?.displayName || "";
              }
            } catch {}
            const endpoint = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
              model,
            )}:generateContent`;
            const body = {
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: buildQaPrompt(
                        instruction,
                        knowledgeChunk,
                        userDisplayName,
                      ),
                    },
                  ],
                },
              ],
            };

            const res = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": apiKey,
              },
              body: JSON.stringify(body),
            });
            dbg("qa:gemini_response", { ok: res.ok, status: res.status });
            if (!res.ok) {
              const t = await res.text();
              return createErrorResponse(
                `Gemini API error (qa): HTTP ${res.status} ${res.statusText} - ${t}`,
              );
            }
            const data = (await res.json()) as GenerateContentResponse;
            const answer =
              data?.candidates?.[0]?.content?.parts
                ?.map(p => p.text || "")
                .join("") || "";
            if (!answer)
              return createErrorResponse("Empty answer from Gemini (qa)");

            let text = answer.slice(0, 2000);
            try {
              const style = loadAiStyle();
              const __normQA = normalizeGreetingIfPresent(
                text,
                style,
                userDisplayName,
                2000,
              );
              dbg("qa:normalize_greeting", __normQA.normalized);
              text = __normQA.text;
            } catch {}
            dbg("qa:push_text");
            const style = loadAiStyle();
            const msgs: any[] = [{ type: "text", text }];
            if (
              style?.includeSticker &&
              String((style as any).stickerPackageId || "").trim() &&
              String((style as any).stickerId || "").trim()
            ) {
              msgs.push({
                type: "sticker",
                packageId: String((style as any).stickerPackageId).trim(),
                stickerId: String((style as any).stickerId).trim(),
              });
            }
            const resp = await this.client.pushMessage({
              to,
              messages: msgs as unknown as messagingApi.Message[],
            });
            return createSuccessResponse({
              pushed: resp,
              preview: text.slice(0, 500),
            });
          } catch (e: any) {
            return createErrorResponse(`Failed in qa mode: ${e?.message || e}`);
          }
        }
        // actions planner using centralized prompt helper
        async function callPlannerOnce(
          modelName: string,
          apiVersion: "v1" | "v1beta",
        ) {
          const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${encodeURIComponent(
            modelName,
          )}:generateContent`;
          let userDisplayName = "";
          try {
            const planTo = (userId as string) || this.destinationId;
            if (planTo) {
              const prof = await this.client.getProfile(planTo);
              userDisplayName = (prof as any)?.displayName || "";
            }
          } catch {}
          const prompt = buildActionsPlannerPrompt(
            instruction,
            knowledgeChunk,
            userDisplayName,
          );
          dbg("plan:call", { modelName, apiVersion });
          const body = {
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          };
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": apiKey,
            },
            body: JSON.stringify(body),
          });
          return res;
        }

        try {
          const tryModels: string[] = [model];
          if (!model.endsWith("-latest")) tryModels.push(`${model}-latest`);
          for (const m of [
            "gemini-2.0-flash",
            "gemini-2.0-flash-latest",
            "gemini-1.5-flash-latest",
          ]) {
            if (!tryModels.includes(m)) tryModels.push(m);
          }

          let res: Response | undefined;
          let lastErr = "";
          for (const m of tryModels) {
            for (const ver of ["v1", "v1beta"] as const) {
              res = await callPlannerOnce(m, ver);
              if (res.ok) break;
              lastErr = await res.text();
              if (res.status !== 404) break;
            }
            if (res?.ok) break;
          }
          if (!res || !res.ok) {
            return createErrorResponse(
              `Gemini API error: HTTP ${res?.status} ${res?.statusText} - ${lastErr}`,
            );
          }

          const data = (await res.json()) as GenerateContentResponse;
          const raw =
            data?.candidates?.[0]?.content?.parts
              ?.map(p => p.text || "")
              .join("") || "";
          if (!raw)
            return createErrorResponse(
              data?.error?.message || "Empty result from Gemini",
            );

          function tryParse(text: string): any | undefined {
            try {
              const obj = JSON.parse(text);
              return obj;
            } catch {
              return undefined;
            }
          }

          function findBalancedJsonContainingAction(
            text: string,
          ): string | undefined {
            let inStr = false;
            let escape = false;
            let depth = 0;
            let start = -1;
            for (let i = 0; i < text.length; i++) {
              const ch = text[i];
              if (inStr) {
                if (escape) {
                  escape = false;
                } else if (ch === "\\") {
                  escape = true;
                } else if (ch === '"') {
                  inStr = false;
                }
                continue;
              }
              if (ch === '"') {
                inStr = true;
                continue;
              }
              if (ch === "{") {
                if (depth === 0) start = i;
                depth++;
              } else if (ch === "}") {
                if (depth > 0) {
                  depth--;
                  if (depth === 0 && start !== -1) {
                    const candidate = text.slice(start, i + 1).trim();
                    if (/\"action\"\s*:/i.test(candidate)) {
                      const obj = tryParse(candidate);
                      if (obj && typeof obj === "object" && (obj as any).action)
                        return candidate;
                    }
                    start = -1;
                  }
                }
              }
            }
            return undefined;
          }

          let jsonText: string | undefined;
          const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
          if (fence) {
            const block = fence[1].trim();
            // try direct
            const direct = tryParse(block);
            if (
              direct &&
              typeof direct === "object" &&
              (direct as any).action
            ) {
              jsonText = block;
            } else {
              jsonText = findBalancedJsonContainingAction(block);
            }
          }
          if (!jsonText) {
            const scan = findBalancedJsonContainingAction(raw);
            if (scan) jsonText = scan;
          }
          if (!jsonText) {
            const s = raw.indexOf("{");
            const e = raw.lastIndexOf("}");
            if (s !== -1 && e !== -1 && e > s) {
              const sliced = raw.slice(s, e + 1).trim();
              const obj = tryParse(sliced);
              if (obj && typeof obj === "object" && (obj as any).action)
                jsonText = sliced;
            }
          }
          if (!jsonText) {
            return createErrorResponse(
              "Failed to extract plan JSON from model output",
            );
          }

          let plan: { action: string; args?: any } | undefined;
          try {
            plan = JSON.parse(jsonText);
          } catch (e: any) {
            return createErrorResponse(
              `Failed to parse plan JSON: ${e?.message || e}`,
            );
          }
          if (!plan?.action)
            return createErrorResponse("Missing action in plan");
          dbg("plan:parsed", { action: plan.action });

          // Execute
          const to =
            (plan.args?.userId as string) ||
            (userId as string) ||
            this.destinationId;
          switch (plan.action) {
            case "get_profile": {
              if (!to) return createErrorResponse(NO_USER_ID_ERROR);
              const profile = await this.client.getProfile(to);
              // Also push a readable summary to LINE so the user "sees" it in chat
              const lines: string[] = [];
              if ((profile as any)?.displayName)
                lines.push(`à¸Šà¸·à¹ˆà¸­: ${(profile as any).displayName}`);
              lines.push(`User ID: ${to}`);
              if ((profile as any)?.statusMessage)
                lines.push(
                  `à¸ªà¸–à¸²à¸™à¸°: ${(profile as any).statusMessage}`,
                );
              const text = lines.join("\n");
              try {
                await this.client.pushMessage({
                  to,
                  messages: [
                    { type: "text", text } as unknown as messagingApi.Message,
                  ],
                });
              } catch {
                // ignore push failure, still return profile
              }
              return createSuccessResponse(profile);
            }
            case "get_rich_menu_list": {
              const list = (await this.client.getRichMenuList()) as any;
              // Prepare a short summary and push to chat if possible
              try {
                if (to) {
                  const menus: any[] = (list as any)?.richmenus || [];
                  const count = menus.length;
                  const head = `Rich Menu à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”: ${count} à¸£à¸²à¸¢à¸à¸²à¸£`;
                  const details = menus
                    .slice(0, 3)
                    .map(
                      (m: any, i: number) =>
                        `- ${m?.name || m?.richMenuId || `menu-${i + 1}`}`,
                    )
                    .join("\n");
                  const text = details ? `${head}\n${details}` : head;
                  await this.client.pushMessage({
                    to,
                    messages: [
                      { type: "text", text } as unknown as messagingApi.Message,
                    ],
                  });
                }
              } catch {
                // ignore push failure
              }
              return createSuccessResponse(list);
            }
            case "get_message_quota": {
              const q = (await this.client.getMessageQuota()) as any;
              // Try to fetch consumption for better summary if available
              let usage: number | undefined = undefined;
              try {
                const c =
                  (await this.client.getMessageQuotaConsumption()) as any;
                usage = (c as any)?.totalUsage;
              } catch {}
              try {
                if (to) {
                  const limited =
                    (q as any)?.value ?? (q as any)?.limited ?? undefined;
                  const lines: string[] = [];
                  if (typeof limited === "number")
                    lines.push(
                      `à¹‚à¸„à¸§à¸•à¸²à¸•à¹ˆà¸­à¹€à¸”à¸·à¸­à¸™: ${limited.toLocaleString()}`,
                    );
                  if (typeof usage === "number")
                    lines.push(`à¹ƒà¸Šà¹‰à¹„à¸›: ${usage.toLocaleString()}`);
                  const remaining =
                    typeof limited === "number" && typeof usage === "number"
                      ? Math.max(0, limited - usage)
                      : undefined;
                  if (typeof remaining === "number")
                    lines.push(
                      `à¸„à¸‡à¹€à¸«à¸¥à¸·à¸­: ${remaining.toLocaleString()}`,
                    );
                  const text =
                    lines.join("\n") ||
                    "à¸”à¸¹à¹‚à¸„à¸§à¸•à¸²à¸ªà¸³à¹€à¸£à¹‡à¸ˆ";
                  await this.client.pushMessage({
                    to,
                    messages: [
                      { type: "text", text } as unknown as messagingApi.Message,
                    ],
                  });
                }
              } catch {
                // ignore push failure
              }
              return createSuccessResponse({ quota: q, totalUsage: usage });
            }
            case "push_text": {
              dbg("action:push_text", { to });
              if (!to) return createErrorResponse(NO_USER_ID_ERROR);
              let text = plan.args?.text as string;
              if (!text)
                return createErrorResponse("Missing args.text for push_text");
              try {
                const style = loadAiStyle();
                let __display = "";
                try {
                  if (to) {
                    const __p = await this.client.getProfile(to);
                    __display = (__p as any)?.displayName || "";
                  }
                } catch {}
                const __normPT = normalizeGreetingIfPresent(
                  text,
                  style,
                  __display,
                  2000,
                );
                dbg("push_text:normalize_greeting", __normPT.normalized);
                text = __normPT.text;
              } catch {}
              dbg("push_text:push");
              const style = loadAiStyle();
              const msgs: any[] = [{ type: "text", text }];
              if (
                style?.includeSticker &&
                String((style as any).stickerPackageId || "").trim() &&
                String((style as any).stickerId || "").trim()
              ) {
                msgs.push({
                  type: "sticker",
                  packageId: String((style as any).stickerPackageId).trim(),
                  stickerId: String((style as any).stickerId).trim(),
                });
              }
              const resp = await this.client.pushMessage({
                to,
                messages: msgs as unknown as messagingApi.Message[],
              });
              return createSuccessResponse(resp);
            }
            case "push_flex": {
              dbg("action:push_flex", { to });
              if (!to) return createErrorResponse(NO_USER_ID_ERROR);
              const altText = plan.args?.altText as string;
              const contents = plan.args?.contents;
              if (!altText || !contents)
                return createErrorResponse(
                  "Missing altText or contents for push_flex",
                );
              const message = { type: "flex", altText, contents } as any;
              dbg("push_flex:push");
              const resp = await this.client.pushMessage({
                to,
                messages: [message as unknown as messagingApi.Message],
              });
              return createSuccessResponse(resp);
            }
            case "broadcast_text": {
              const text = plan.args?.text as string;
              if (!text)
                return createErrorResponse(
                  "Missing args.text for broadcast_text",
                );
              const resp = await this.client.broadcast({
                messages: [
                  { type: "text", text } as unknown as messagingApi.Message,
                ],
              });
              return createSuccessResponse(resp);
            }
            case "broadcast_flex": {
              const altText = plan.args?.altText as string;
              const contents = plan.args?.contents;
              if (!altText || !contents)
                return createErrorResponse(
                  "Missing altText or contents for broadcast_flex",
                );
              const resp = await this.client.broadcast({
                messages: [
                  {
                    type: "flex",
                    altText,
                    contents,
                  } as unknown as messagingApi.Message,
                ],
              });
              return createSuccessResponse(resp);
            }
            default:
              return createErrorResponse(`Unknown action: ${plan.action}`);
          }
        } catch (e: any) {
          return createErrorResponse(
            `Failed to run gemini_command: ${e?.message || e}`,
          );
        }
      },
    );
  }
}
