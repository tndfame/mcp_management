import fs from "fs";
import path from "path";

/** Returns absolute file path and public URL (relative if base unknown). */
export function getPublicPaths(subdir: "reports" | "images", filename: string) {
  const projectRoot = path.resolve(process.cwd(), "..");
  const pub = path.join(projectRoot, "ui-next", "public");
  const dir = path.join(pub, subdir);
  fs.mkdirSync(dir, { recursive: true });
  const abs = path.join(dir, filename);
  const relUrl = `/${subdir}/${filename}`;
  const base = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") || "";
  const url = base ? `${base}${relUrl}` : relUrl;
  return { abs, url };
}

export function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_\.]+/g, "_").slice(0, 80) || "report";
}

// Minimal single-page PDF (Type1 Helvetica; limited Unicode). For full Unicode, swap to a real PDF lib + font.
export function generateSimplePdfBuffer(title: string, text: string): Buffer {
  const lines = String(text || "").split(/\r?\n/);
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const left = 50;
  let cursorY = pageHeight - 80;
  const leading = 16;
  const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const cs: string[] = [];
  if (title) {
    cs.push("BT /F1 16 Tf 0 g");
    cs.push(`${left} ${cursorY} Td (${esc(title)}) Tj`);
    cs.push("ET");
    cursorY -= 24;
  }
  cs.push("BT /F1 12 Tf 0 g");
  let drawn = 0;
  for (const ln of lines) {
    if (cursorY < 80 || drawn > 60) break;
    cs.push(`${left} ${cursorY} Td (${esc(ln || " ")}) Tj`);
    cursorY -= leading;
    drawn++;
  }
  cs.push("ET");
  const contentStr = cs.join("\n");
  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`,
  );
  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(contentStr, "utf8")} >>\nstream\n${contentStr}\nendstream\nendobj\n`,
  );
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  );
  let pdf = "%PDF-1.4\n";
  const offs: number[] = [];
  const add = (s: string) => {
    offs.push(Buffer.byteLength(pdf, "utf8"));
    pdf += s;
  };
  for (const o of objects) add(o);
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += "xref\n";
  pdf += `0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const off of offs)
    pdf += off.toString().padStart(10, "0") + " 00000 n \n";
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

// Unicode-capable PDF using PDFKit + external font (Thai supported)
export async function generateUnicodePdfBuffer(
  title: string,
  text: string,
): Promise<Buffer> {
  // Lazy import to avoid type requirements
  const PDFDocument: any =
    (await import("pdfkit")).default ?? (await import("pdfkit"));
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const fontPath = String(process.env.THAI_FONT_PATH || "").trim();
  const fontUrl = String(process.env.THAI_FONT_URL || "").trim();
  try {
    if (fontPath && fs.existsSync(fontPath)) {
      doc.font(fontPath);
    } else if (fontUrl && /^https?:\/\//i.test(fontUrl)) {
      try {
        const res = await fetch(fontUrl);
        if (res.ok) {
          const ab = await res.arrayBuffer();
          const buf = Buffer.from(ab);
          doc.font(buf);
        } else {
          doc.font("Helvetica");
        }
      } catch {
        doc.font("Helvetica");
      }
    } else {
      // Fallback: standard font (may not render Thai fully)
      doc.font("Helvetica");
    }
  } catch {
    doc.font("Helvetica");
  }

  // Title
  if (title) {
    doc.fontSize(18).text(title, { align: "left" });
    doc.moveDown();
  }
  // Body
  doc.fontSize(12).text(String(text || ""), { align: "left" });
  doc.end();
  return await new Promise<Buffer>(resolve => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export function writeSimplePdf(
  title: string,
  content: string,
  baseName?: string,
) {
  const stamp = new Date()
    .toISOString()
    .replace(/[:T]/g, "-")
    .replace(/\..+/, "");
  const safe = sanitizeName(baseName || "report");
  const filename = `${safe}-${stamp}.pdf`;
  const { abs, url } = getPublicPaths("reports", filename);
  const buf = generateSimplePdfBuffer(title, content);
  fs.writeFileSync(abs, buf);
  return { abs, url, filename };
}

export async function renderPngBannerBuffer(
  title: string,
  content: string,
  opts?: { width?: number; height?: number; fontPath?: string },
) {
  const width = opts?.width ?? 1024;
  const height = opts?.height ?? 512;
  const PImage = await import("pureimage");
  const img = PImage.make(width, height);
  const ctx = img.getContext("2d");
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, width, height);
  let font: any;
  if (opts?.fontPath && fs.existsSync(opts.fontPath)) {
    font = await PImage.registerFont(opts.fontPath, "Custom");
    await font.load();
    ctx.font = "32pt 'Custom'";
  } else {
    ctx.font = "28pt 'Source Sans Pro'";
  }
  ctx.fillStyle = "#e5e7eb";
  ctx.fillText(title, 40, 80);
  ctx.font = font ? "18pt 'Custom'" : "16pt 'Source Sans Pro'";
  ctx.fillStyle = "#cbd5e1";
  const words = String(content || "").split(/\s+/);
  let x = 40,
    y = 130,
    line = "";
  const max = width - 80;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    const metrics = ctx.measureText(test);
    if ((metrics.width || 0) > max) {
      ctx.fillText(line, x, y);
      y += 30;
      line = w;
      if (y > height - 60) break;
    } else {
      line = test;
    }
  }
  if (y <= height - 60 && line) ctx.fillText(line, x, y);
  // PureImage doesn't always expose encodePNGToBuffer at runtime.
  // Prefer buffer API when available; otherwise fall back to stream API.
  const anyPI: any = PImage as any;
  if (typeof anyPI.encodePNGToBuffer === "function") {
    const buf: Buffer = await anyPI.encodePNGToBuffer(img);
    return buf;
  }
  const { PassThrough } = await import("stream");
  const pass = new PassThrough();
  const chunks: Buffer[] = [];
  pass.on("data", (c: Buffer) => chunks.push(c));
  await anyPI.encodePNGToStream(img, pass);
  // ensure stream flush
  await new Promise<void>(resolve => pass.on("finish", () => resolve()));
  return Buffer.concat(chunks);
}

export async function uploadViaNextApi(
  buffer: Buffer,
  contentType: string,
  baseName: string,
) {
  const base = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") || "";
  if (!base) throw new Error("PUBLIC_BASE_URL is required for upload");
  const ts = new Date().toISOString().replace(/[:T]/g, "-").replace(/\..+/, "");
  let ext = "";
  if (contentType === "application/pdf") ext = ".pdf";
  else if (contentType === "image/png") ext = ".png";
  const filename = `${sanitizeName(baseName)}-${ts}${ext}`;
  const res = await fetch(`${base}/api/object`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename,
      contentType,
      dataBase64: buffer.toString("base64"),
    }),
  });
  const data = await res.json();
  if (!res.ok || (data as any)?.error)
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  return data as { url: string; id: string; filename: string };
}
