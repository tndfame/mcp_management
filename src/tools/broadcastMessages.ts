import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { messagingApi } from "@line/bot-sdk";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../common/response.js";
import { AbstractTool } from "./AbstractTool.js";
import { textMessageSchema } from "../common/schema/textMessage.js";
import { flexMessageSchema } from "../common/schema/flexMessage.js";

const lineMessageSchema = z
  .union([textMessageSchema, flexMessageSchema])
  .or(z.any());

export default class BroadcastMessages extends AbstractTool {
  private client: messagingApi.MessagingApiClient;

  constructor(client: messagingApi.MessagingApiClient) {
    super();
    this.client = client;
  }

  register(server: McpServer) {
    const messages = z
      .array(lineMessageSchema)
      .min(1)
      .describe("Array of LINE messages (text/flex)");

    server.tool(
      "broadcast_messages",
      "Broadcast one or more LINE messages to all followers (generic).",
      { messages },
      async ({ messages }) => {
        try {
          const resp = await this.client.broadcast({
            messages: messages as unknown as messagingApi.Message[],
          });
          return createSuccessResponse(resp);
        } catch (e: any) {
          return createErrorResponse(
            `Failed to broadcast messages: ${e?.message || e}`,
          );
        }
      },
    );
  }
}
