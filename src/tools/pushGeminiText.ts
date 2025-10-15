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

          const tryModels: string[] = [model];
          if (!model.endsWith("-latest")) tryModels.push(`${model}-latest`);
          for (const m of [
            "gemini-2.0-flash",
            "gemini-2.0-flash-latest",
            "gemini-1.5-flash-latest",
          ]) {
            if (!tryModels.includes(m)) tryModels.push(m);
          }

          let res: Response | undefined;
          let lastErrorText = "";
          for (const m of tryModels) {
            for (const ver of ["v1", "v1beta"] as const) {
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

          const response = await this.client.pushMessage({
            to: userId,
            messages: [
              {
                type: "text",
                text: textMessage,
              } as unknown as messagingApi.Message,
            ],
          });

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
