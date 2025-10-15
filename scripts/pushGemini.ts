import { messagingApi } from "@line/bot-sdk";
import loadEnvFromDotenv from "../src/common/loadEnv.ts";

// Simple arg parsing: --prompt "..." [--user Uxxx] [--model gemini-2.0-flash]
function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      args[key] = val;
    }
  }
  return args;
}

type GenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

function looksLikeGeminiModel(t: string) {
  return /^gemini[\w\.-]*$/i.test(t);
}

async function main() {
  // Load .env so CHANNEL_ACCESS_TOKEN / DESTINATION_USER_ID / GEMINI_API_KEY are available
  loadEnvFromDotenv();

  const parsed = parseArgs(process.argv);
  // Support both flag and positional usage. If last positional looks like a Gemini model,
  // treat it as model and the rest as prompt.
  const positionals = process.argv.slice(2).filter(a => !a.startsWith("--"));
  let prompt = parsed.prompt || "";
  let user = parsed.user || "";
  let model = parsed.model || "";

  if (!prompt) {
    if (positionals.length > 0) {
      if (looksLikeGeminiModel(positionals[positionals.length - 1])) {
        model ||= positionals.pop() as string;
      }
      prompt = positionals.join(" ");
    }
  }
  if (!model) model = "gemini-2.0-flash";

  const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN || "";
  const destinationId = user || process.env.DESTINATION_USER_ID || "";
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

  if (!channelAccessToken) {
    console.error("Missing CHANNEL_ACCESS_TOKEN env");
    process.exit(1);
  }
  if (!destinationId) {
    console.error("Missing DESTINATION_USER_ID (or --user) env");
    process.exit(1);
  }
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY) env");
    process.exit(1);
  }
  if (!prompt) {
    console.error("Provide --prompt \"your question\"");
    process.exit(1);
  }

  const client = new messagingApi.MessagingApiClient({ channelAccessToken });

  async function callGeminiOnce(modelName: string, apiVersion: "v1" | "v1beta") {
    const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${encodeURIComponent(
      modelName,
    )}:generateContent`;
    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
    return res;
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };
  
  // Try requested model, then try "-latest" suffix if 404
  let tried: string[] = [];
  const tryModels: string[] = [model];
  if (!model.endsWith("-latest")) tryModels.push(`${model}-latest`);
  // Additional broad fallbacks
  for (const m of ["gemini-2.0-flash", "gemini-2.0-flash-latest", "gemini-1.5-flash-latest"]) {
    if (!tryModels.includes(m)) tryModels.push(m);
  }

  let res: Response | undefined;
  let lastErrorBody = "";
  for (const m of tryModels) {
    // Try v1 first, then v1beta
    for (const ver of ["v1", "v1beta"] as const) {
      tried.push(`${m} (${ver})`);
      res = await callGeminiOnce(m, ver);
      if (res.ok) {
        model = m; // effective model used
        break;
      }
      lastErrorBody = await res.text();
      if (res.status !== 404) break; // if not 404, don't keep trying versions
    }
    if (res?.ok) break;
  }
  if (!res || !res.ok) {
    throw new Error(
      `Gemini API error after trying [${tried.join(", ")}] => ` +
        `HTTP ${res?.status} ${res?.statusText} - ${lastErrorBody}`,
    );
  }

  const data = (await res.json()) as GenerateContentResponse;
  const generated =
    data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  if (!generated) {
    throw new Error(data?.error?.message || "Gemini returned empty content");
  }

  const textMessage = generated.slice(0, 2000);

  const response = await client.pushMessage({
    to: destinationId,
    messages: [{ type: "text", text: textMessage } as unknown as messagingApi.Message],
  });

  console.log("Pushed message. LINE API response:", JSON.stringify(response));
}

main().catch(err => {
  console.error("Failed:", err?.message || err);
  process.exit(1);
});
