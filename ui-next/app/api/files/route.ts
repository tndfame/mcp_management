export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";

function listMarkdownFiles(root: string, baseDir: string): string[] {
  const results: string[] = [];
  const stack: string[] = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        stack.push(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) {
        const rel = path.relative(baseDir, full).replace(/\\/g, "/");
        results.push(rel);
      }
    }
  }
  return results.sort();
}

export async function GET() {
  try {
    const projectRoot = path.resolve(process.cwd(), "..");
    const docsDir = path.join(projectRoot, "docs");
    const all: string[] = fs.existsSync(docsDir)
      ? listMarkdownFiles(docsDir, projectRoot)
      : [];
    // Keep API general but exclude ai-presets and README by default
    const files: string[] = all.filter(
      (rel: string) => !rel.startsWith("docs/ai-presets/") && rel !== "README.md",
    );
    // No extra additions to avoid noise in dropdowns
    return new Response(JSON.stringify({ files }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
