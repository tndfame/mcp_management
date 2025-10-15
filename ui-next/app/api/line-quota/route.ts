export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

declare global {
  // eslint-disable-next-line no-var
  var __mcpClient: Client | undefined;
}

async function getClient(): Promise<Client> {
  if (globalThis.__mcpClient) return globalThis.__mcpClient;

  const projectRoot = path.resolve(process.cwd(), "..");
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
    cwd: projectRoot,
    env: process.env as Record<string, string>,
  });
  const client = new Client({ name: "line-bot-ui-next", version: "0.1.0" });
  await client.connect(transport);
  globalThis.__mcpClient = client;
  return client;
}

export async function GET() {
  try {
    // simple in-memory cache (60s)
    const g: any = globalThis as any;
    const now = Date.now();
    const CACHE_MS = 60_000;
    if (g.__lineQuota && now - g.__lineQuota.ts < CACHE_MS) {
      return new Response(JSON.stringify(g.__lineQuota.data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await getClient();
    const result = await client.callTool({ name: "get_message_quota", arguments: {} });
    // result.content[0].text is JSON string per createSuccessResponse
    const text = (result as any)?.content?.[0]?.text || "{}";
    const base = JSON.parse(text);
    const limited = Number(base?.limited ?? 0) || 0;
    const totalUsage = Number(base?.totalUsage ?? 0) || 0;
    const remaining = limited > 0 ? Math.max(0, limited - totalUsage) : 0;
    const data = { limited, totalUsage, remaining };
    g.__lineQuota = { ts: now, data };
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    // If cached value exists, return it even on error
    const g: any = globalThis as any;
    if (g.__lineQuota?.data) {
      return new Response(JSON.stringify(g.__lineQuota.data), {
        headers: { "Content-Type": "application/json", "X-Cache-Fallback": "1" },
      });
    }
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
