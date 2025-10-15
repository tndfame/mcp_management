export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { getStats, updateStats, estimateTokens, countResultTokens, addEvent } from "../../../lib/stats";

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
  // mark MCP connected
  updateStats({ mcpConnected: true });
  return client;
}

export async function POST(req: Request) {
  try {
    const client = await getClient();
    const { name, args } = (await req.json()) as { name: string; args?: any };
    // track input
    try {
      const model = (args as any)?.model || (args as any)?.arguments?.model;
      const tIn = estimateTokens(JSON.stringify(args || {}));
      const s = getStats();
      updateStats({
        calls: s.calls + 1,
        inputTokens: s.inputTokens + tIn,
        tokensUsed: s.tokensUsed + tIn,
        lastModel: model || s.lastModel,
      });
    } catch {}

    const result = await client.callTool({ name, arguments: args || {} });

    // track output
    try {
      const tOut = countResultTokens(result);
      const s = getStats();
      updateStats({
        outputTokens: s.outputTokens + tOut,
        tokensUsed: s.tokensUsed + tOut,
      });
      // basic push/broadcast event logging for sidebar
      try {
        const action = String(name || '');
        const type = action.includes('broadcast') ? 'broadcast' : action.includes('push') || action === 'gemini_command' ? 'push' : 'other';
        let ok = !(result as any)?.isError;
        let msg = '';
        const text = (result as any)?.content?.[0]?.text;
        if (typeof text === 'string') {
          msg = text.slice(0, 300);
          try {
            const obj = JSON.parse(text);
            if (obj?.linePushSkipped) ok = false;
          } catch {}
        }
        addEvent({ type, ok, message: msg || (ok ? 'ok' : 'error') });
      } catch {}
    } catch {}
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
