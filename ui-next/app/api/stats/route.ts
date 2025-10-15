export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getStats } from "../../../lib/stats";

export async function GET() {
  try {
    const stats = getStats();
    return new Response(JSON.stringify(stats), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

