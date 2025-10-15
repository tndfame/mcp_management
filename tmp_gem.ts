error?: { message?: string };
};

export default class GeminiCommand extends AbstractTool {
  private client: messagingApi.MessagingApiClient;
  private destinationId: string;

  constructor(client: messagingApi.MessagingApiClient, destinationId: string) {
    super();
    this.client = client;
    this.destinationId = destinationId;
  }

  register(server: McpServer) {
    const instructionSchema = z
      .string()
      .min(1)
      .describe(
        "Natural language command, e.g., 'ดึงโปรไฟล์ของผู้ใช้', 'ส่งข้อความว่า สวัสดี', 'ดูรายการ rich menu'",
      );

    const modelSchema = z
      .string()
      .default("gemini-2.0-flash")
      .describe("Gemini model name, e.g., gemini-2.0-flash");
    const filePathSchema = z
      .string()
      .optional()
      .describe(
        "Optional relative Markdown path (e.g., docs/data-learning/knowledge.md) to use as knowledge context",
      );
    const knowledgeSourceSchema = z
      .enum(["file", "mssql"])
      .optional()
      .default("file")
      .describe(
        "Choose knowledge source: 'file' (Markdown via filePath) or 'ms

