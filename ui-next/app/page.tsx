"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // use Next's own API

type Tool = { name: string; description?: string };

export default function Page() {
  const search = useSearchParams();
  const [tools, setTools] = useState<Tool[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [args, setArgs] = useState<string>(JSON.stringify({ instruction: "", model: "gemini-2.0-flash", mode: "auto", knowledgeSource: "file" }, null, 2));
  const [out, setOut] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [files, setFiles] = useState<string[]>([]);
  const [fileKey, setFileKey] = useState<string>("");
  const [geminiMode, setGeminiMode] = useState<"auto" | "qa" | "actions">("auto");
  const [knowledgeSource, setKnowledgeSource] = useState<"file" | "mssql">("file");
  const [question, setQuestion] = useState<string>("");

  // Quick templates for known tools so users don't have to guess args
  const templates: Record<string, any> = {
    gemini_command: { instruction: "", model: "gemini-2.0-flash", mode: "auto", knowledgeSource: "file" },
    push_gemini_text: { prompt: "", model: "gemini-1.5-flash" },
    push_text_message: { message: { type: "text", text: "สวัสดีจาก UI" } },
    push_flex_message: {
      message: {
        type: "flex",
        altText: "Hello",
        contents: { type: "bubble", body: { type: "box", layout: "vertical", contents: [{ type: "text", text: "Hello" }] } },
      },
    },
    broadcast_text_message: { message: { type: "text", text: "" } },
    broadcast_flex_message: {
      message: {
        type: "flex",
        altText: "Broadcast",
        contents: { type: "bubble", body: { type: "box", layout: "vertical", contents: [{ type: "text", text: "" }] } },
      },
    },
    getProfile: { userId: "" },
    getMessageQuota: {},
    getRichMenuList: {},
    deleteRichMenu: { richMenuId: "" },
    setRichMenuDefault: { richMenuId: "" },
    cancelRichMenuDefault: {},
  };

  async function loadTools() {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/tools`);
      const data = await res.json();
      const list: Tool[] = Array.isArray(data?.tools) ? data.tools : Array.isArray(data) ? data : [];
      const allow = new Set(["gemini_command", "push_gemini_text"]);
      const filtered = list.filter(t => allow.has(t.name));
      setTools(filtered);
      if (filtered.length && !selected) setSelected(filtered[0].name);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function loadFiles() {
    try {
      const res = await fetch(`${API_BASE}/api/files`);
      const data = await res.json();
      const list = Array.isArray(data?.files) ? (data.files as string[]) : [];
      // Only show files under docs/data-learning
      const filtered = list.filter((f: string) => f.startsWith("docs/data-learning/"));
      setFiles(filtered);
      if (!fileKey && list.length) setFileKey("");
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadTools();
    loadFiles();
  }, []);

  useEffect(() => {
    const t = search?.get("tool");
    if (t) setSelected(t);
  }, [search]);

  // Auto-build args for gemini_command in Q/A mode
  useEffect(() => {
    if (selected !== "gemini_command") return;
    if (geminiMode !== "qa") return;
    const obj: any = { instruction: question || "", model: "gemini-2.0-flash", mode: "qa", knowledgeSource };
    if (knowledgeSource === "file") {
      if (fileKey) obj.filePath = fileKey; else delete obj.filePath;
    } else {
      delete obj.filePath;
    }
    try {
      setArgs(JSON.stringify(obj, null, 2));
    } catch {
      // ignore
    }
  }, [selected, geminiMode, question, fileKey, knowledgeSource]);

  // Keep args JSON in sync for gemini_command when not in QA mode
  useEffect(() => {
    if (selected !== "gemini_command") return;
    if (geminiMode === "qa") return; // handled by the other effect
    try {
      const obj = args ? JSON.parse(args) : {};
      const updated: any = {
        ...(typeof obj === "object" && obj ? obj : {}),
        model: obj?.model || "gemini-2.0-flash",
        mode: geminiMode,
        knowledgeSource,
      };
      if (knowledgeSource === "file") {
        if (fileKey) updated.filePath = fileKey; else delete updated.filePath;
      } else {
        delete updated.filePath;
      }
      if (updated.instruction === undefined) updated.instruction = "";
      setArgs(JSON.stringify(updated, null, 2));
    } catch {
      const base: any = { instruction: "", model: "gemini-2.0-flash", mode: geminiMode, knowledgeSource };
      if (knowledgeSource === "file" && fileKey) base.filePath = fileKey;
      setArgs(JSON.stringify(base, null, 2));
    }
  }, [selected, geminiMode, knowledgeSource, fileKey]);

  const options = useMemo(
    () => tools.map(t => (
      <option key={t.name} value={t.name}>{t.name}</option>
    )),
    [tools],
  );

  const run = async () => {
    setLoading(true);
    setOut("");
    setError("");
    try {
      const parsed = args ? JSON.parse(args) : {};
      const res = await fetch(`${API_BASE}/api/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selected, args: parsed }),
      });
      const data = await res.json();
      setOut(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
        <section className="card panel">
          <div className="section">
            <div className="field">
              {selected === 'gemini_command' ? (
                <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ marginRight: 8 }}>Mode</label>
                  <select value={geminiMode} onChange={e => setGeminiMode(e.target.value as any)}>
                    <option value="auto">Auto (model decides)</option>
                    <option value="qa">Q/A from file</option>
                    <option value="actions">LINE actions</option>
                  </select>
                </div>
              ) : null}
              {selected === 'gemini_command' && geminiMode === 'qa' ? (
                <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="search..."
                    style={{ flex: 1, minWidth: 260 }}
                  />
                  <label style={{ marginLeft: 8 }}>Source</label>
                  <select value={knowledgeSource} onChange={e => setKnowledgeSource(e.target.value as any)}>
                    <option value="file">From file</option>
                    <option value="mssql">From database (MSSQL)</option>
                  </select>
                </div>
              ) : null}
              <label>Arguments (JSON)</label>
              <textarea value={args} onChange={e => setArgs(e.target.value)} placeholder='{"prompt":""}' />
              <div className="row">
                <button className="btn" onClick={run} disabled={loading || !selected}>{loading ? 'Running...' : 'Run'}</button>
                <button
                  className="btn secondary"
                  onClick={() => {
                    const t = selected || 'push_gemini_text';
                    if (t === 'gemini_command') {
                      const base: any = { instruction: "", model: "gemini-2.0-flash", mode: geminiMode, knowledgeSource };
                      if (knowledgeSource === 'file' && fileKey) base.filePath = fileKey;
                      setArgs(JSON.stringify(base, null, 2));
                    } else {
                      const tpl = templates[t] ?? templates['push_gemini_text'];
                      setArgs(JSON.stringify(tpl, null, 2));
                    }
                  }}
                  disabled={!selected || (selected === 'gemini_command' && geminiMode === 'qa')}
                >Load template</button>
              </div>
              {selected === 'gemini_command' ? (
                <div className="row">
                  <select
                    value={fileKey}
                    onChange={e => {
                      const val = e.target.value;
                      setFileKey(val);
                      // Always reflect selection into args as filePath for gemini_command
                      try {
                        const obj = args ? JSON.parse(args) : {};
                        if (val) obj.filePath = val; else delete obj.filePath;
                        setArgs(JSON.stringify(obj, null, 2));
                      } catch {
                        // ignore malformed args
                      }
                    }}
                    style={{ maxWidth: 320 }}
                  >
                    <option value="">-- normal infomation --</option>
                    {files.map(f => (<option key={f} value={f}>{f}</option>))}
                  </select>
                  <button
                    className="btn secondary"
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                      try {
                        const p = window.prompt(
                          'New file path (under docs/data-learning), e.g. "docs/data-learning/new-note.md"',
                          'docs/data-learning/new-note.md',
                        );
                        if (!p) return;
                        const pathOk = p.startsWith('docs/data-learning/') && p.toLowerCase().endsWith('.md');
                        const invalid = /\\|\:\\|\0|\r|\n/.test(p) || p.includes('..');
                        if (!pathOk || invalid) {
                          alert('Invalid path. Must start with "docs/data-learning/" and end with .md, no \'..\' or backslashes.');
                          return;
                        }
                        const initial = `# ${p.split('/').pop() || 'New Note'}\n\nCreated: ${new Date().toISOString()}\n`;
                        const res = await fetch(`${API_BASE}/api/file`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ path: p, content: initial }),
                        });
                        const data = await res.json();
                        if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
                        await loadFiles();
                        setFileKey(p);
                        try {
                          const obj = args ? JSON.parse(args) : {};
                          obj.filePath = p;
                          setArgs(JSON.stringify(obj, null, 2));
                        } catch {}
                      } catch (e: any) {
                        setError(e?.message || String(e));
                      }
                    }}
                  >New file</button>
                </div>
              ) : null}
                  {/* presets removed for gemini_command */}
              {error ? <div className="muted">Error: {error}</div> : null}
            </div>
          </div>
          <div className="result">
            <pre style={{ margin: 0 }}>{out || '// Results'}</pre>
          </div>
        </section>
  );
}



