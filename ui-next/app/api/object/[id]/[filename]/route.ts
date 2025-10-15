export const runtime = "nodejs";
export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var __objectStore:
    | Map<string, { buf: Buffer; contentType: string; filename: string; ts: number }>
    | undefined;
}

export async function GET(_req: Request, ctx: { params: { id: string; filename: string } }) {
  try {
    const id = ctx?.params?.id;
    if (!id || !globalThis.__objectStore?.has(id)) {
      return new Response("Not found", { status: 404 });
    }
    const item = globalThis.__objectStore.get(id)!;
    return new Response(item.buf, {
      headers: {
        "Content-Type": item.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=300",
        "Content-Disposition": `inline; filename="${item.filename || "file"}"`,
      },
    });
  } catch (e: any) {
    return new Response(e?.message || "error", { status: 500 });
  }
}
