export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = { filename?: string; contentType: string; dataBase64: string };

declare global {
  // eslint-disable-next-line no-var
  var __objectStore: Map<string, { buf: Buffer; contentType: string; filename: string; ts: number }> | undefined;
}

function storeInit() {
  if (!globalThis.__objectStore) globalThis.__objectStore = new Map();
  return globalThis.__objectStore!;
}

function makeId(len = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    const ct = String(body?.contentType || '').trim();
    const b64 = String(body?.dataBase64 || '');
    const filename = String(body?.filename || 'file');
    if (!ct || !b64) return new Response(JSON.stringify({ error: 'missing content' }), { status: 400 });
    const buf = Buffer.from(b64, 'base64');
    const id = makeId();
    const store = storeInit();
    store.set(id, { buf, contentType: ct, filename, ts: Date.now() });
    // cleanup old (older than 24h)
    const TTL = 24 * 3600 * 1000;
    for (const [k, v] of store.entries()) {
      if (Date.now() - v.ts > TTL) store.delete(k);
    }
    const url = `/api/object/${id}/${encodeURIComponent(filename)}`;
    return new Response(JSON.stringify({ ok: true, id, filename, url }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
}