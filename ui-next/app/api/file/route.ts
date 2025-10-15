export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";

function resolveSafe(relPath: string) {
  const projectRoot = path.resolve(process.cwd(), "..");
  const docsRoot = path.join(projectRoot, "docs");
  const abs = path.resolve(projectRoot, relPath);
  if (!abs.startsWith(docsRoot)) throw new Error("Only docs/* can be accessed");
  return { abs, projectRoot, docsRoot };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const p = url.searchParams.get("path");
    if (!p) return new Response(JSON.stringify({ error: "Missing path" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const { abs } = resolveSafe(p);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      return new Response(JSON.stringify({ error: "File not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    const content = fs.readFileSync(abs, "utf8");
    return new Response(JSON.stringify({ path: p, content }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as { path: string; content: string };
    if (!body?.path) return new Response(JSON.stringify({ error: "Missing path" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const { abs } = resolveSafe(body.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body.content ?? "", "utf8");
    return new Response(JSON.stringify({ ok: true, path: body.path }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

