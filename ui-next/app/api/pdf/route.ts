export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";

type PdfPayload = {
  title?: string;
  content: string;
  filename?: string; // optional custom filename (will be sanitized)
};

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_\.]+/g, "_").slice(0, 80) || "report";
}

// Very small, single-page PDF generator (no external deps), Latin text only.
// For Thai or complex layout, switch to a real PDF lib later.
function generateSimplePdf(title: string, text: string): Buffer {
  // Minimal PDF with Helvetica font
  // We'll split text into lines and draw down the page.
  const lines = String(text || "").split(/\r?\n/);
  const pageWidth = 595.28; // A4 width (pt)
  const pageHeight = 841.89; // A4 height (pt)
  const left = 50;
  let cursorY = pageHeight - 80;
  const leading = 16;
  const escapeStr = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const contentStream: string[] = [];
  // Title
  if (title) {
    contentStream.push("BT /F1 16 Tf 0 g");
    contentStream.push(`${left} ${cursorY} Td (${escapeStr(title)}) Tj`);
    contentStream.push("ET");
    cursorY -= 24;
  }
  // Body lines (limit ~45 lines)
  contentStream.push("BT /F1 12 Tf 0 g");
  let drawn = 0;
  for (const ln of lines) {
    if (cursorY < 80 || drawn > 60) break;
    const textLine = ln || " ";
    contentStream.push(`${left} ${cursorY} Td (${escapeStr(textLine)}) Tj`);
    cursorY -= leading;
    drawn++;
  }
  contentStream.push("ET");

  const contentStr = contentStream.join("\n");
  const contentBytes = Buffer.from(contentStr, "utf8");

  // Build PDF objects
  const objects: string[] = [];
  // 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  // 2: Pages
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  // 3: Page
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`,
  );
  // 4: Contents stream
  objects.push(
    `4 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${contentStr}\nendstream\nendobj\n`,
  );
  // 5: Font
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  // Assemble xref
  let pdf = "%PDF-1.4\n";
  let offsets: number[] = [];
  const add = (s: string) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += s;
  };
  for (const obj of objects) add(obj);
  const xrefPos = Buffer.byteLength(pdf, "utf8");
  pdf += "xref\n";
  pdf += `0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const off of offsets) {
    pdf += off.toString().padStart(10, "0") + " 00000 n \n";
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PdfPayload;
    const title = String(body?.title || "Report");
    const content = String(body?.content || "");
    const customName = body?.filename ? sanitizeName(body.filename) : undefined;

    const buf = generateSimplePdf(title, content);

    const projectRoot = path.resolve(process.cwd(), "..");
    const pub = path.join(projectRoot, "ui-next", "public");
    const reportsDir = path.join(pub, "reports");
    fs.mkdirSync(reportsDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:T]/g, "-").replace(/\..+/, "");
    const fname = `${customName || "report"}-${stamp}.pdf`;
    const abs = path.join(reportsDir, fname);
    fs.writeFileSync(abs, buf);

    const url = `/reports/${fname}`;
    return new Response(JSON.stringify({ ok: true, url, filename: fname }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

