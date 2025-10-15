import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { messagingApi } from "@line/bot-sdk";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../common/response.js";
import { AbstractTool } from "./AbstractTool.js";
import { NO_USER_ID_ERROR } from "../common/schema/constants.js";
import { textMessageSchema } from "../common/schema/textMessage.js";
import { flexMessageSchema } from "../common/schema/flexMessage.js";

const lineMessageSchema = z
  .union([textMessageSchema, flexMessageSchema])
  .or(z.any());

export default class PushMessages extends AbstractTool {
  private client: messagingApi.MessagingApiClient;
  private destinationId: string;

  constructor(client: messagingApi.MessagingApiClient, destinationId: string) {
    super();
    this.client = client;
    this.destinationId = destinationId;
  }

  register(server: McpServer) {
    const userId = z
      .string()
      .default(this.destinationId)
      .describe("User ID to receive messages. Defaults to DESTINATION_USER_ID");
    const messages = z
      .array(lineMessageSchema)
      .min(1)
      .describe("Array of LINE messages (text/flex)");

    server.tool(
      "push_messages",
      "Push one or more LINE messages to a user (generic).",
      { userId, messages },
      async ({ userId, messages }) => {
        if (!userId) return createErrorResponse(NO_USER_ID_ERROR);
        try {
          const resp = await this.client.pushMessage({
            to: userId,
            messages: messages as unknown as messagingApi.Message[],
          });
          return createSuccessResponse(resp);
        } catch (e: any) {
          return createErrorResponse(
            `Failed to push messages: ${e?.message || e}`,
          );
        }
      },
    );
  }
}
