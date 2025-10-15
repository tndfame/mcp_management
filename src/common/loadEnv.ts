import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export default function loadEnvFromDotenv() {
  try {
    const candidates: string[] = [];
    candidates.push(path.join(process.cwd(), ".env"));
    try {
      const here = path.dirname(fileURLToPath(import.meta.url));
      candidates.push(path.resolve(here, "../.env"));
      candidates.push(path.resolve(here, "../../.env"));
    } catch {}
    const envPath = candidates.find(p => fs.existsSync(p));
    if (!envPath) return;

    const content = fs.readFileSync(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    console.error("Error ENV", err);
  }
}
