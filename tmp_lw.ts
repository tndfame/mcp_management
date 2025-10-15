export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

declare global {
  // eslint-disable-next-line no-var
  var __mcpClientWebhook: Client | undefined;
  // eslint-disable-next-line no-var
  var __userPrefs:
    | Map<
        string,
        {
          knowledgeSource: "file" | "mssql";
          lastTable?: string;
          lastLimit?: number;
          lastRowCount?: number;
        }
      >
    | undefined;
}

// Attempt to load parent project .env so server routes can see required secrets
function loadParentEnvOnce() {
  try {
    const loadedFlag = (globalThis as any).__parentEnvLoaded;
    if (loadedFlag) return;
    const parentEnv = path.resolve(process.cwd(), "..", ".env");
    if (fs.existsSync(parentEnv)) {
      const text = fs.readFileSync(parentEnv, "utf8");
      for (const line of text.split(/\r?\n/)) {
        if (!line || line.trim().startsWith("#")) continue;
        const idx = line.indexOf("=");
        if (idx <= 0) continue;
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
    (globalThis as any).__parentEnvLoaded = true;
  } catch {
    // ignore
  }
}
loadParentEnvOnce();

async function getClient(): Promise<Client> {
  if (globalThis.__mcpClientWebhook) return globalThis.__mcpClientWebhook;

  const projectRoot = path.resolve(process.cwd(), "..");
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
    cwd: projectRoot,
    env: process.env as Record<string, string>,
  });
  const client = new Client({ name: "line-bot-webhook", version: "0.1.0" });
  await client.connect(transport);
  globalThis.__mcpClientWebhook = client;
  return client;
}

function verifyLineSignature(rawBody: string, signature: string | null): boolean {
  try {
    const secret = process.env.CHANNEL_SECRET || "";
    if (!secret || !signature) return false;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const digest = hmac.digest("base64");
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type?: string; text?: string };
};

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-line-signature");
    const raw = await req.text();
    const disableVerify = String(process.env.DISABLE_LINE_SIGNATURE_VERIFY || "").toLowerCase() === "true";
    if (!disableVerify && !verifyLineSignature(raw, signature)) {
      return new Response(JSON.stringify({ error: "invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = JSON.parse(raw) as { events?: LineEvent[] };
    const events = Array.isArray(body?.events) ? body.events : [];

    const client = await getClient();
    if (!globalThis.__userPrefs) globalThis.__userPrefs = new Map();
    const prefs = globalThis.__userPrefs;

    for (const ev of events) {
      const userId = ev?.source?.userId || "";
      if (ev?.type === "message" && ev?.message?.type === "text") {
        let text = ev.message.text || "";
        const dest = userId || (process.env.DESTINATION_USER_ID || "");
        let t = text.toLowerCase();
        if (t.includes("login db")) {
          if (userId) prefs!.set(userId, { knowledgeSource: "mssql" });
          try {
            await client.callTool({
              name: "push_text_message",
              arguments: {
                userId,
                message: { type: "text", text: "à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­à¸à¸²à¸™à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ (MSSQL) à¸ªà¸³à¸«à¸£à¸±à¸šà¹‚à¸«à¸¡à¸”à¸–à¸²à¸¡/à¸•à¸­à¸šà¹à¸¥à¹‰à¸§" },
              },
            });
          } catch {}
          continue;
        }
        if (t.includes("logout db")) {
          if (userId) prefs!.set(userId, { knowledgeSource: "file" });
          try {
            await client.callTool({
              name: "push_text_message",
              arguments: {
                userId,
                message: { type: "text", text: "à¸¢à¸à¹€à¸¥à¸´à¸à¹‚à¸«à¸¡à¸”à¸à¸²à¸™à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ à¹ƒà¸Šà¹‰à¹„à¸Ÿà¸¥à¹Œà¸„à¸§à¸²à¸¡à¸£à¸¹à¹‰à¹à¸—à¸™" },
              },
            });
          } catch {}
          continue;
        }

        // Build args honoring user preference (default to file)
        const pref =
          (userId && prefs!.get(userId)) ||
          ({ knowledgeSource: "file" } as {
            knowledgeSource: "file" | "mssql";
            lastTable?: string;
            lastLimit?: number;
          });
        const knowledgeSource = pref.knowledgeSource;

        // Heuristic: remember explicit table mentions and support pronoun "à¸•à¸²à¸£à¸²à¸‡à¸™à¸µà¹‰/table à¸™à¸µà¹‰/this table"
        const explicitTableMatch = t.match(/(?:table|à¸ˆà¸²à¸|à¹€à¸‚à¹‰à¸²à¹„à¸›|à¹„à¸›|from)\s+([a-z0-9_\.]+)/i);
        if (explicitTableMatch && explicitTableMatch[1] && userId) {
          const raw = explicitTableMatch[1];
          const full = raw.includes(".") ? raw : `dbo.${raw}`;
          prefs!.set(userId, { ...pref, lastTable: full });
        }
        if (/(à¸•à¸²à¸£à¸²à¸‡à¸™à¸µà¹‰|table\s*à¸™à¸µà¹‰|this\s*table)/i.test(text) && pref.lastTable) {
          text = text.replace(/à¸•à¸²à¸£à¸²à¸‡à¸™à¸µà¹‰|table\s*à¸™à¸µà¹‰|this\s*table/gi, pref.lastTable);
          t = text.toLowerCase();
        }


        if (
          knowledgeSource === "mssql" &&
          /(à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¸à¸µà¹ˆà¸£à¸²à¸¢à¸à¸²à¸£|à¸¡à¸µà¸à¸µà¹ˆà¸£à¸²à¸¢à¸à¸²à¸£|count\s*(all)?)/i.test(text)
        ) {
          if (pref.lastTable) {
            try {
              const q = await client.callTool({
                name: "query_mssql",
                arguments: { sql: `SELECT COUNT(1) AS total_count FROM ${pref.lastTable}`, limit: 1 },
              });
              const parsed = JSON.parse((q as any).content?.[0]?.text || "{}");
              const rows: any[] = Array.isArray(parsed?.rows) ? parsed.rows : [];
              const cnt = rows[0]?.total_count ?? pref.lastRowCount ?? 0;
              const msg = `à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” ${cnt} à¸£à¸²à¸¢à¸à¸²à¸£ (à¸ˆà¸²à¸ ${pref.lastTable})`;
              await client.callTool({
                name: "push_text_message",
                arguments: { userId: dest, message: { type: "text", text: msg } },
              });
              continue;
            } catch {
              // ignore and fall through
            }
          }
        }

        // 2) Ask which table?
        if (knowledgeSource === "mssql" && /(à¸ˆà¸²à¸à¸•à¸²à¸£à¸²à¸‡à¹„à¸«à¸™|what\s*table)/i.test(text)) {
          const msg = pref.lastTable ? `à¸ˆà¸²à¸à¸•à¸²à¸£à¸²à¸‡ ${pref.lastTable}` : "à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸—à¸£à¸²à¸šà¸•à¸²à¸£à¸²à¸‡ (à¹‚à¸›à¸£à¸”à¸£à¸°à¸šà¸¸)";
          try {
            await client.callTool({
              name: "push_text_message",
              arguments: { userId: dest, message: { type: "text", text: msg } },
            });
            continue;
          } catch {}
        }

        // If user asks for all tables summary
        if (knowledgeSource === "mssql" && /(à¹à¸ªà¸”à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥.*à¸•à¸²à¸£à¸²à¸‡.*à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”|à¹à¸ªà¸”à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹à¸•à¹ˆà¸¥à¸°\s*à¸•à¸²à¸£à¸²à¸‡|à¸—à¸¸à¸\s*à¸•à¸²à¸£à¸²à¸‡)/i.test(text)) {
          try {
            // Use MCP tool query_mssql to fetch table list
            const q = await client.callTool({
              name: "query_mssql",
              arguments: {
                sql:
                  "SELECT TOP 50 s.name AS schema_name, t.name AS table_name FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE t.is_ms_shipped = 0 ORDER BY s.name, t.name",
                limit: 50,
              },
            });
            const parsed = JSON.parse((q as any).content?.[0]?.text || "{}");
            const rows: any[] = Array.isArray(parsed?.rows) ? parsed.rows : [];
            const out = rows
              .map((r: any) => `- ${r.schema_name}.${r.table_name}`)
              .slice(0, 50)
              .join("\n");
            const textMsg = out || "(à¹„à¸¡à¹ˆà¸žà¸šà¸•à¸²à¸£à¸²à¸‡)";
            await client.callTool({
              name: "push_text_message",
              arguments: { userId, message: { type: "text", text: textMsg } },
            });
            continue;
          } catch {}
        }

        // If user says "à¹à¸ªà¸”à¸‡à¸¡à¸²/à¹‚à¸Šà¸§à¹Œà¸«à¸™à¹ˆà¸­à¸¢/à¹€à¸­à¸²à¸¡à¸²" and we have lastTable (+ optional lastLimit)
        if (knowledgeSource === "mssql" && /(à¹à¸ªà¸”à¸‡à¸¡à¸²|à¹‚à¸Šà¸§à¹Œà¸«à¸™à¹ˆà¸­à¸¢|à¹€à¸­à¸²à¸¡à¸²)/i.test(text) && pref.lastTable) {
          const lim = pref.lastLimit && pref.lastLimit > 0 ? pref.lastLimit : 10;
          text = `à¹€à¸‚à¹‰à¸²à¹„à¸› ${pref.lastTable} à¹à¸ªà¸”à¸‡${lim} à¸‚à¹‰à¸­à¸¡à¸¹à¸¥`;
          t = text.toLowerCase();
        }

        // If user says "à¹à¸ªà¸”à¸‡ {N} (à¸£à¸²à¸¢à¸à¸²à¸£|à¹à¸–à¸§)" and we have lastTable, rewrite
        const mShowN = t.match(/à¹à¸ªà¸”à¸‡(?:à¸‚à¹‰à¸­à¸¡à¸¹à¸¥)?\s*(\d{1,4})\s*(?:à¸£à¸²à¸¢à¸à¸²à¸£|à¹à¸–à¸§)?/i);
        if (knowledgeSource === "mssql" && mShowN && pref.lastTable) {
          const lim = parseInt(mShowN[1], 10);
          text = `à¹€à¸‚à¹‰à¸²à¹„à¸› ${pref.lastTable} à¹à¸ªà¸”à¸‡${lim} à¸‚à¹‰à¸­à¸¡à¸¹à¸¥`;
          prefs!.set(userId, { ...pref, lastLimit: lim });
        }
        // Try AI-driven SQL first when using DB knowledge
        if (knowledgeSource === "mssql") {
          try {
            const q = await client.callTool({
              name: "ai_query_mssql",
              arguments: {
                instruction: text,
                maxRows: 10,
                allowedTables: pref.lastTable ? [pref.lastTable] : undefined,
              },
            });
            const raw = (q as any)?.content?.[0]?.text || "";
            try {
              const payload = raw ? JSON.parse(raw) : null;
              if (payload && Array.isArray(payload.rows)) {
                const rows: any[] = payload.rows as any[];
                const cols: string[] = Array.isArray(payload.columns)
                  ? (payload.columns as string[])
                  : rows[0]
                    ? Object.keys(rows[0])
                    : [];
                const previewCols = cols.slice(0, 3);
                const head = `à¸œà¸¥à¸¥à¸±à¸žà¸˜à¹Œ ${Math.min(rows.length, 10)} / ${payload.rowCount ?? rows.length} à¹à¸–à¸§`;
                const body = rows
                  .slice(0, 10)
                  .map((r, i) => `${i + 1}. ${previewCols.map(c => `${c}: ${String(r[c] ?? "")}`).join(", ")}`)
                  .join("\n");
                const txt = [head, body].filter(Boolean).join("\n").slice(0, 2000);
                await client.callTool({
                  name: "push_text_message",
                  arguments: { userId: dest, message: { type: "text", text: txt } },
                });
                // Try to extract table name from SQL and store context
                try {
                  const sql: string = String(payload.sql || "");
                  const mFrom = sql.match(/from\s+([a-z0-9_\.]+)/i);
                  const tbl = mFrom && mFrom[1] ? mFrom[1] : pref.lastTable;
                  const newPref = { ...pref, lastTable: tbl, lastLimit: 10, lastRowCount: payload.rowCount ?? rows.length };
                  if (userId) prefs!.set(userId, newPref);
                } catch {}
                continue;
              }
            } catch {
              // parsing failed; fall back below
            }
          } catch {
            // ai_query_mssql failed; fall back below
          }
        }

        const args: any = {
          instruction: text,
          model: "gemini-2.0-flash",
          mode: "auto",
          userId: dest,
          knowledgeSource,
        };
        if (knowledgeSource === "file") {
          const defaultKnowledge = process.env.DEFAULT_KNOWLEDGE_FILE || "docs/data-learning/knowledge.md";
          args.filePath = defaultKnowledge;
        }

        try {
          await client.callTool({ name: "gemini_command", arguments: args });
        } catch (e) {
          // swallow to not break webhook pipeline
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

