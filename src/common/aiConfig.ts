import fs from "fs";
import path from "path";

function readText(file: string) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

export type AiStyle = {
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
  includeSticker?: boolean;
  stickerPackageId?: string;
  stickerId?: string;
};

export function loadAiStyle(): AiStyle {
  const defaults: AiStyle = {
    personaName: "Default",
    tone: "friendly",
    language: "th",
    emojiLevel: 1,
    replyLength: "medium",
    includeSignature: false,
    extraGuidelines: "",
    politeParticle: "",
    greetWithName: false,
    signatureText: "",
    includeSticker: false,
    stickerPackageId: "",
    stickerId: "",
  };
  try {
    const p = path.resolve(process.cwd(), "docs/ai-presets/style.json");
    const raw = fs.readFileSync(p, "utf8");
    const obj = JSON.parse(raw);
    return { ...defaults, ...(obj || {}) } as AiStyle;
  } catch {
    return defaults;
  }
}

export function loadBrandVoice(): string {
  const p = path.resolve(process.cwd(), "docs/ai-presets/brand.md");
  const t = readText(p).trim();
  return t || "";
}

export function loadFlexGuidelines(): string {
  const p = path.resolve(process.cwd(), "docs/ai-presets/flex-guidelines.md");
  const t = readText(p).trim();
  return t || "";
}

export function loadTemplates(): any {
  const p = path.resolve(process.cwd(), "docs/ai-presets/templates.json");
  try {
    const t = fs.readFileSync(p, "utf8");
    return JSON.parse(t);
  } catch {
    return {};
  }
}

export function formatStyleGuidelines(style: AiStyle): string {
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
  lines.push(
    "\nEmoji Usage:\n- emojiLevel 0: no emoji.\n- emojiLevel 1: include 1–2 relevant emoji.\n- emojiLevel 2: include 2–4 relevant emoji.\n- emojiLevel 3: include 3–6 relevant emoji.\n- Place emoji at ends of sentences or bullets; keep tone appropriate.",
  );
  if (style.greetWithName) {
    lines.push(
      "\nGreeting Rule:\n- Include a Thai greeting with the user's display name when appropriate.",
    );
  }
  if (
    style.includeSignature &&
    (style as any).signatureText &&
    String((style as any).signatureText).trim()
  ) {
    lines.push(
      "\nSignature Text:\n" + String((style as any).signatureText).trim(),
    );
  }
  return lines.join("\n");
}

export function buildGreetingOverride(style: AiStyle): string {
  return style.greetWithName
    ? "\nGreeting Behavior Override (Overrides Style):\n- Only greet (with display name if available) when the user's intent is a greeting or casual small talk.\n- Do NOT prepend a greeting for direct questions or requests.\n- This override supersedes any prior style/brand rule that implies greeting every message.\n"
    : "\nGreeting Behavior Override (Overrides Style):\n- Do NOT prepend a greeting unless the instruction explicitly asks for it.\n- This override supersedes any prior style/brand rule that implies greeting every message.\n";
}

export function normalizeGreetingIfPresent(
  text: string,
  style: AiStyle,
  displayName?: string,
  maxLen: number = 2000,
): { text: string; normalized: boolean } {
  try {
    const thLike =
      style?.language?.includes("th") || style?.language === "th-en";
    let out = text;
    let normalized = false;
    if (style?.greetWithName && thLike) {
      const polite = style.politeParticle || "";
      const namePart = displayName ? ` คุณ ${displayName}` : "";
      const base = "สวัสดี";
      const expectedGreeting =
        `${base}${polite ? polite : ""}${namePart}`.trim();
      const greetRegex = new RegExp(
        `^\\s*${base}(?:ครับ|ค่ะ)?(?:\\s*คุณ\\s+[^\\n\\r]+)?`,
      );
      if (greetRegex.test(out)) {
        out = out.replace(greetRegex, expectedGreeting);
        normalized = true;
      }
    }
    if (
      style.includeSignature &&
      (style as any).signatureText &&
      String((style as any).signatureText).trim()
    ) {
      const sig = String((style as any).signatureText).replaceAll(
        "{name}",
        displayName || "",
      );
      out = `${out}\n${sig}`;
    }
    if (out.length > maxLen) out = out.slice(0, maxLen);
    return { text: out, normalized };
  } catch {
    return { text: String(text || "").slice(0, maxLen), normalized: false };
  }
}
