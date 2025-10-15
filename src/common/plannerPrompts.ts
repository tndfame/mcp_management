import {
  loadBrandVoice,
  loadAiStyle,
  formatStyleGuidelines,
  buildGreetingOverride,
} from "./aiConfig.js";

export function buildActionsPlannerPrompt(
  instruction: string,
  knowledgeChunk: string,
  userDisplayName?: string,
): string {
  const brandRaw = loadBrandVoice();
  const MAX_BRAND = 2000; // guard token budget
  const brand = brandRaw
    ? brandRaw.slice(0, MAX_BRAND) +
      (brandRaw.length > MAX_BRAND ? "\n... (truncated)" : "")
    : "";
  const style = loadAiStyle();
  const styleText = formatStyleGuidelines(style);
  const greetingOverride = buildGreetingOverride(style);
  const precedenceNote =
    "If any rule conflicts, obey Style Rules (JSON) over Brand Voice.";
  const knowledgePart = knowledgeChunk
    ? `Use ONLY the following Knowledge as factual source if relevant. If knowledge is unrelated, rely on general knowledge.\n\nKnowledge (Markdown):\n${knowledgeChunk}\n\n`
    : `\n`;

  return (
    `You are a planner for LINE MCP tools. Choose exactly ONE action and output STRICT JSON only.\n` +
    (brand ? `\nBrand Voice (Markdown):\n${brand}\n\n` : ``) +
    (styleText ? `${styleText}\n` : ``) +
    greetingOverride +
    "\n" +
    `${precedenceNote}\n\n` +
    (userDisplayName
      ? `User Context:\nDisplayName: ${userDisplayName}\n\n`
      : ``) +
    `Actions:\n` +
    `- get_profile(userId?)\n` +
    `- get_rich_menu_list()\n` +
    `- get_message_quota()\n` +
    `- push_text(userId?, text)\n` +
    `- push_flex(userId?, altText, contents)\n` +
    `- broadcast_text(text)\n` +
    `- broadcast_flex(altText, contents)\n` +
    `Rules:\n` +
    `- Respond ONLY with JSON {"action":"...","args":{...}} — no markdown, no explanation.\n` +
    `- If the instruction is a QUESTION or asks for information, ANSWER it and send the answer. Prefer action: push_text.\n` +
    `  - args.text MUST be the composed answer (Thai if appropriate), NOT an echo of the instruction.\n` +
    `  - If the provided Knowledge is insufficient, say briefly that you don't know.\n` +
    `- Prefer push_* over broadcast_* unless user explicitly asks to announce to everyone (e.g., "broadcast", "ประกาศ", "ทุกคน").\n` +
    `- For push_flex/broadcast_flex you MUST provide both altText and a valid contents (bubble or carousel).\n` +
    `- If the instruction mentions making a Flex (e.g., "flex", "เฟล็กซ์", "การ์ด", or structure like working hours/เวลาทำการ), choose push_flex (or broadcast_flex if explicitly asked).\n` +
    `  - Compose altText as a short Thai summary (e.g., "เวลาทำการร้าน").\n` +
    `  - Compose contents ONLY from the Knowledge when provided; do NOT invent hours/branches that are not in Knowledge.\n` +
    `  - Use a minimal valid bubble: {"type":"bubble","body":{"type":"box","layout":"vertical","contents":[...]}} with labels and values.\n` +
    knowledgePart +
    `Instruction: ${instruction}`
  );
}

export function buildQaPrompt(
  instruction: string,
  knowledgeChunk: string,
  userDisplayName?: string,
): string {
  const brandRaw = loadBrandVoice();
  const MAX_BRAND = 2000;
  const brand = brandRaw
    ? brandRaw.slice(0, MAX_BRAND) +
      (brandRaw.length > MAX_BRAND ? "\n... (truncated)" : "")
    : "";
  const style = loadAiStyle();
  const styleText = formatStyleGuidelines(style);
  const greetingOverride = buildGreetingOverride(style);
  const precedenceNote =
    "If any rule conflicts, obey Style Rules (JSON) over Brand Voice.";
  if (knowledgeChunk) {
    return (
      (brand ? `Brand Voice (Markdown):\n${brand}\n\n` : ``) +
      (styleText ? `${styleText}\n` : ``) +
      greetingOverride +
      "\n" +
      `${precedenceNote}\n\n` +
      (userDisplayName
        ? `User Context:\nDisplayName: ${userDisplayName}\n\n`
        : ``) +
      `Answer the question concisely using ONLY the provided Knowledge. If missing, say you don't know. Use Thai if the question is Thai.\n\n` +
      `Knowledge (Markdown):\n${knowledgeChunk}\n\n` +
      `Question: ${instruction}`
    );
  }
  return (
    (brand ? `Brand Voice (Markdown):\n${brand}\n\n` : ``) +
    (styleText ? `${styleText}\n` : ``) +
    greetingOverride +
    "\n" +
    `${precedenceNote}\n\n` +
    (userDisplayName
      ? `User Context:\nDisplayName: ${userDisplayName}\n\n`
      : ``) +
    `Answer the question concisely. Use Thai if the question is Thai. If information is missing, say you don't know.\n\n` +
    `Question: ${instruction}`
  );
}
