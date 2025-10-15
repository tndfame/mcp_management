import { messagingApi } from "@line/bot-sdk";
// Simple arg parsing: --prompt "..." [--user Uxxx] [--model gemini-1.5-flash]
function parseArgs(argv) {
    const args = {};
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
async function main() {
    const { prompt = "", user = "", model = "gemini-1.5-flash" } = parseArgs(process.argv);
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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini API error: HTTP ${res.status} ${res.statusText} - ${text}`);
    }
    const data = (await res.json());
    const generated = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!generated) {
        throw new Error(data?.error?.message || "Gemini returned empty content");
    }
    const textMessage = generated.slice(0, 2000);
    const response = await client.pushMessage({
        to: destinationId,
        messages: [{ type: "text", text: textMessage }],
    });
    console.log("Pushed message. LINE API response:", JSON.stringify(response));
}
main().catch(err => {
    console.error("Failed:", err?.message || err);
    process.exit(1);
});
//# sourceMappingURL=pushGemini.js.map