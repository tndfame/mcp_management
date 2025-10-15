import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { messagingApi } from "@line/bot-sdk";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../common/response.js";
import { AbstractTool } from "./AbstractTool.js";
import { NO_USER_ID_ERROR } from "../common/schema/constants.js";

type GenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

export default class PushGeminiText extends AbstractTool {
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
      .default("gemini-1.5-flash")
      .describe("Gemini model name, e.g., gemini-1.5-flash");

    const promptSchema = z.string().min(1).describe("Prompt to send to Gemini");

    server.tool(
      "push_gemini_text",
      "Generate text with Gemini and push it to a LINE user as a text message.",
      {
        userId: userIdSchema,
        prompt: promptSchema,
        model: modelSchema,
      },
      async ({ userId, prompt, model }) => {
        if (!userId) {
          return createErrorResponse(NO_USER_ID_ERROR);
        }

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
                  parts: [{ text: prompt }],
                },
              ],
            };
            // retry for rate limits/temporary errors
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
            const final = res!;
            return final;
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
          let lastErrorText = "";
          for (const m of tryModels) {
            const versions: ("v1" | "v1beta")[] = strict
              ? ["v1"]
              : ["v1", "v1beta"];
            for (const ver of versions) {
              res = await callGeminiOnce(m, ver);
              if (res.ok) {
                break;
              }
              lastErrorText = await res.text();
              if (res.status !== 404) break;
            }
            if (res?.ok) break;
          }

          if (!res || !res.ok) {
            return createErrorResponse(
              `Gemini API error: HTTP ${res?.status} ${res?.statusText} - ${lastErrorText}`,
            );
          }

          const data = (await res.json()) as GenerateContentResponse;
          const generated =
            data?.candidates?.[0]?.content?.parts
              ?.map(p => p.text || "")
              .join("") || "";

          if (!generated) {
            return createErrorResponse(
              data?.error?.message || "Gemini returned empty content.",
            );
          }

          // LINE text message limit is 2000 chars
          const textMessage = generated.slice(0, 2000);

          let response: any;
          try {
            response = await this.client.pushMessage({
              to: userId,
              messages: [
                {
                  type: "text",
                  text: textMessage,
                } as unknown as messagingApi.Message,
              ],
            });
            console.error("[push_gemini_text] line:push ok", {
              to: userId,
              len: textMessage.length,
            });
          } catch (e: any) {
            const msg = e?.message || String(e);
            console.error("[push_gemini_text] line:push error", {
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
            `Failed to push Gemini text: ${error.message}`,
          );
        }
      },
    );
  }
}
