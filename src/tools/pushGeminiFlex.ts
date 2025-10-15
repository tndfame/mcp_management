import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { messagingApi } from "@line/bot-sdk";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../common/response.js";
import { AbstractTool } from "./AbstractTool.js";
import { NO_USER_ID_ERROR } from "../common/schema/constants.js";
import { flexMessageSchema } from "../common/schema/flexMessage.js";

type GenerateContentResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

export default class PushGeminiFlex extends AbstractTool {
  private client: messagingApi.MessagingApiClient;
  private destinationId: string;

  constructor(client: messagingApi.MessagingApiClient, destinationId: string) {
    super();
    this.client = client;
    this.destinationId = destinationId;
  }

  register(server: McpServer) {
    const userIdSchema = z
      .string()
      .default(this.destinationId)
      .describe(
        "The user ID to receive a message. Defaults to DESTINATION_USER_ID.",
      );

    const modelSchema = z
      .string()
      .default("gemini-2.0-flash")
      .describe("Gemini model name, e.g., gemini-2.0-flash");

    const promptSchema = z
      .string()
      .min(1)
      .describe("Describe the Flex card you want.");

    const altTextSchema = z
      .string()
      .default("Generated card")
      .describe("Alternative text for Flex message.");

    server.tool(
      "push_gemini_flex",
      "Generate a LINE Flex message (bubble/carousel) from a natural language prompt using Gemini, then push it to a user.",
      {
        userId: userIdSchema,
        prompt: promptSchema,
        model: modelSchema,
        altText: altTextSchema,
      },
      async ({ userId, prompt, model, altText }) => {
        if (!userId) return createErrorResponse(NO_USER_ID_ERROR);

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
          return createErrorResponse(
            "Please set GEMINI_API_KEY (or GOOGLE_API_KEY) in environment variables.",
          );
        }

        try {
          // Guard against LINE quota exhaustion before pushing
          try {
            const g: any = globalThis as any;
            const now = Date.now();
            const CACHE_MS = 30000;
            let quota:
              | { remaining?: number; limited?: number; totalUsage?: number }
              | undefined = g.__lineQuotaCache?.data;
            if (!quota || now - g.__lineQuotaCache.ts >= CACHE_MS) {
              try {
                const q: any = await this.client.getMessageQuota();
                let usage: number | undefined = undefined;
                try {
                  const c: any = await this.client.getMessageQuotaConsumption();
                  usage = c?.totalUsage;
                } catch {}
                const limited: number | undefined = q?.value ?? q?.limited;
                const remaining =
                  typeof limited === "number" && typeof usage === "number"
                    ? Math.max(0, limited - usage)
                    : undefined;
                quota = { limited, totalUsage: usage, remaining };
                g.__lineQuotaCache = { ts: now, data: quota };
              } catch {}
            }
            if (
              quota &&
              typeof quota.remaining === "number" &&
              quota.remaining <= 0
            ) {
              return createErrorResponse(
                `LINE message quota exceeded (used ${quota.totalUsage ?? "?"}/${quota.limited ?? "?"}). Skipped push.`,
              );
            }
          } catch {}
          async function callGeminiOnce(
            modelName: string,
            apiVersion: "v1" | "v1beta",
          ) {
            const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${encodeURIComponent(
              modelName,
            )}:generateContent`;
            const body = {
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text:
                        `You are an assistant that outputs only JSON for LINE Flex Message 'contents'.\n` +
                        `Return a valid 'contents' object (type: 'bubble' or 'carousel'). Do not include markdown or explanations.\n` +
                        `Keep text short. Avoid unsupported fields.\n\n` +
                        `Requirement: ${prompt}`,
                    },
                  ],
                },
              ],
            };
            // retry on rate limit/temporary errors
            let attempt = 0;
            let res: Response | undefined;
            while (attempt < 3) {
              res = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-goog-api-key": apiKey,
                },
                body: JSON.stringify(body),
              });
              if (
                res.ok ||
                (res.status !== 429 && res.status !== 500 && res.status !== 503)
              )
                break;
              const ra = res.headers.get("retry-after");
              const wait = ra
                ? parseInt(ra, 10) * 1000
                : 500 * Math.pow(2, attempt);
              await new Promise(r => setTimeout(r, Math.min(5000, wait)));
              attempt++;
            }
            return res!;
          }

          const strict = /^(1|true|yes)$/i.test(
            String(process.env.GEMINI_NO_FALLBACK || ""),
          );
          const tryModels: string[] = [model];
          if (!strict) {
            if (!model.endsWith("-latest")) tryModels.push(`${model}-latest`);
            for (const m of [
              "gemini-2.0-flash",
              "gemini-2.0-flash-latest",
              "gemini-1.5-flash-latest",
            ]) {
              if (!tryModels.includes(m)) tryModels.push(m);
            }
          }

          let res: Response | undefined;
          let lastErr = "";
          for (const m of tryModels) {
            const versions: ("v1" | "v1beta")[] = strict
              ? ["v1"]
              : ["v1", "v1beta"];
            for (const ver of versions) {
              res = await callGeminiOnce(m, ver);
              if (res.ok) break;
              lastErr = await res.text();
              if (res.status !== 404) break;
            }
            if (res?.ok) break;
          }
          if (!res || !res.ok) {
            return createErrorResponse(
              `Gemini API error: HTTP ${res?.status} ${res?.statusText} - ${lastErr}`,
            );
          }

          const data = (await res.json()) as GenerateContentResponse;
          const raw =
            data?.candidates?.[0]?.content?.parts
              ?.map(p => p.text || "")
              .join("") || "";
          if (!raw)
            return createErrorResponse(
              data?.error?.message || "Empty result from Gemini",
            );

          // Extract plain JSON even if wrapped with ```json fences or extra text
          const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
          let jsonText = fence ? fence[1].trim() : raw;
          if (!fence) {
            const s = raw.indexOf("{");
            const e = raw.lastIndexOf("}");
            if (s !== -1 && e !== -1 && e > s) jsonText = raw.slice(s, e + 1);
          }

          let contents: unknown;
          try {
            contents = JSON.parse(jsonText);
          } catch (e1: any) {
            // Attempt a light sanitization (remove trailing commas) then parse again
            try {
              const sanitized = jsonText.replace(/,\s*([}\]])/g, "$1");
              contents = JSON.parse(sanitized);
            } catch (e2: any) {
              return createErrorResponse(
                `Failed to parse Flex contents JSON from Gemini: ${e1?.message || e1}`,
              );
            }
          }

          const msg = { type: "flex", altText, contents };
          const parsed = flexMessageSchema.safeParse(msg);
          if (!parsed.success) {
            return createErrorResponse(
              `Generated Flex invalid: ${parsed.error.issues.map(i => i.message).join(", ")}`,
            );
          }

          let response: any;
          try {
            response = await this.client.pushMessage({
              to: userId,
              messages: [parsed.data as unknown as messagingApi.Message],
            });
            console.error("[push_gemini_flex] line:push ok", { to: userId });
          } catch (e: any) {
            const msg = e?.message || String(e);
            console.error("[push_gemini_flex] line:push error", {
              to: userId,
              error: msg,
            });
            if (/\b429\b/.test(msg)) {
              return createErrorResponse(
                "LINE message quota exceeded (429). Skipped push.",
              );
            }
            throw e;
          }
          return createSuccessResponse(response);
        } catch (error: any) {
          return createErrorResponse(
            `Failed to push Gemini Flex: ${error.message}`,
          );
        }
      },
    );
  }
}
