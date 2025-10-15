export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";

type AiStyle = {
  personaName: string;
  tone: string;
  language: string;
  emojiLevel: number;
  replyLength: string;
  includeSignature: boolean;
  extraGuidelines: string;
  politeParticle?: string;
  greetWithName?: boolean;
  signatureText?: string;
};

function loadBrand(projectRoot: string): string {
  const p = path.join(projectRoot, "docs", "ai-presets", "brand.md");
  try {
    const t = fs.readFileSync(p, "utf8");
    const MAX = 2000;
    return t.length > MAX ? t.slice(0, MAX) + "\n... (truncated)" : t;
  } catch {
    return "";
  }
}

function loadStyle(projectRoot: string): AiStyle {
  const defaults: AiStyle = {
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
  };
  const p = path.join(projectRoot, "docs", "ai-presets", "style.json");
  try {
    const raw = fs.readFileSync(p, "utf8");
    const obj = JSON.parse(raw);
    return { ...defaults, ...(obj || {}) } as AiStyle;
  } catch {
    return defaults;
  }
}

function formatStyleGuidelines(style: AiStyle): string {
  const lines: string[] = [];
  lines.push(`# Brand/Style Rules`);
  if (style.personaName) lines.push(`Persona: ${style.personaName}`);
  if (style.tone) lines.push(`Tone: ${style.tone}`);
  if (style.language) lines.push(`Language preference: ${style.language}`);
  lines.push(`Emoji: ${style.emojiLevel}`);
  if (style.replyLength) lines.push(`Reply length: ${style.replyLength}`);
  lines.push(`Signature: ${style.includeSignature ? "Yes" : "No"}`);
  if (style.extraGuidelines?.trim()) {
    lines.push("\nExtra Guidelines:\n" + style.extraGuidelines.trim());
  }
  if (style.greetWithName) {
    const polite = style.politeParticle || "";
    lines.push(
      `\nGreeting Rule:\n- Start replies with a Thai greeting including the user's display name if available, e.g., "à¸ªà¸§à¸±à¸ªà¸”à¸µ${polite} à¸„à¸¸à¸“ {name}".`,
    );
  }
  if (style.includeSignature && style.signatureText?.trim()) {
    lines.push("\nSignature Text:\n" + style.signatureText.trim());
  }
  return lines.join("\n");
}

export async function GET() {
  try {
    const projectRoot = path.resolve(process.cwd(), "..");
    const brand = loadBrand(projectRoot);
    const style = loadStyle(projectRoot);
    const styleText = formatStyleGuidelines(style);
    const precedenceNote =
      "If any rule conflicts, obey Style Rules (JSON) over Brand Voice.";
    return new Response(
      JSON.stringify({ brand, style, styleText, precedenceNote }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

