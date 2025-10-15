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
    const client = await getClient();
    const tools = await client.listTools();
    return new Response(JSON.stringify(tools), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

