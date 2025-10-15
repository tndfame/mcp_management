export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";

const STYLE_PATH = "docs/ai-presets/style.json";

function styleDefaults() {
  return {
    personaName: "Default",
    tone: "friendly",
    language: "th",
    emojiLevel: 1,
    replyLength: "medium",
    includeSignature: false,
    extraGuidelines: "",
    politeParticle: "",
    greetWithName: true,
    signatureText: "",
    includeSticker: false,
    stickerPackageId: "",
    stickerId: "",
  };
}

function resolveStyle() {
  const projectRoot = path.resolve(process.cwd(), "..");
  const abs = path.resolve(projectRoot, STYLE_PATH);
  return { abs, projectRoot };
}

export async function GET() {
  try {
    const { abs } = resolveStyle();
    if (!fs.existsSync(abs)) {
      return new Response(JSON.stringify(styleDefaults()), { headers: { "Content-Type": "application/json" } });
    }
    const raw = fs.readFileSync(abs, "utf8");
    const obj = JSON.parse(raw);
    return new Response(JSON.stringify({ ...styleDefaults(), ...obj }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const merged = { ...styleDefaults(), ...(data || {}) };
    const { abs } = resolveStyle();
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, JSON.stringify(merged, null, 2), "utf8");
    return new Response(JSON.stringify(merged), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
