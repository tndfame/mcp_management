export type UiStats = {
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  calls: number;
  lastModel?: string;
  mcpConnected: boolean;
  lineWebhookActive: boolean;
  aiReady?: boolean;
  lastUpdated: number; // epoch ms
  recentEvents?: Array<{ ts: number; type: string; ok: boolean; message: string }>;
};

declare global {
  // eslint-disable-next-line no-var
  var __uiStats: UiStats | undefined;
}

export function getStats(): UiStats {
  if (!globalThis.__uiStats) {
    globalThis.__uiStats = {
      tokensUsed: 0,
      inputTokens: 0,
      outputTokens: 0,
      calls: 0,
      mcpConnected: false,
      lineWebhookActive: false,
      aiReady: !!process.env.GEMINI_API_KEY,
      lastUpdated: Date.now(),
      recentEvents: [],
    };
  }
  return globalThis.__uiStats!;
}

export function updateStats(patch: Partial<UiStats>) {
  const s = getStats();
  Object.assign(s, patch, { lastUpdated: Date.now() });
}

// Very rough token estimator; works reasonably across languages
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const len = text.length;
  // Tune for CJK/Thai (no spaces) vs latin spacing
  const divisor = /[\u0E00-\u0E7F\u4E00-\u9FFF]/.test(text) ? 2.8 : 3.8;
  return Math.max(1, Math.ceil(len / divisor));
}

export function countResultTokens(result: any): number {
  try {
    let sum = 0;
    const walk = (obj: any) => {
      if (!obj) return;
      if (typeof obj === 'string') { sum += estimateTokens(obj); return; }
      if (Array.isArray(obj)) { obj.forEach(walk); return; }
      if (typeof obj === 'object') {
        for (const k of Object.keys(obj)) {
          const v = (obj as any)[k];
          // Prioritize typical text fields
          if (k === 'text' || k === 'message' || k === 'content') walk(v);
          else if (typeof v === 'string' || typeof v === 'object') walk(v);
        }
      }
    };
    walk(result);
    return sum;
  } catch { return 0; }
}

export function addEvent(ev: { ts?: number; type: string; ok: boolean; message: string }) {
  const s = getStats();
  if (!s.recentEvents) s.recentEvents = [];
  s.recentEvents.push({ ts: ev.ts ?? Date.now(), type: ev.type, ok: ev.ok, message: ev.message });
  if (s.recentEvents.length > 50) s.recentEvents = s.recentEvents.slice(-50);
  s.lastUpdated = Date.now();
}
