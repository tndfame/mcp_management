"use client";
import { useEffect, useMemo, useState } from "react";

type FileItem = string;

export default function KnowledgePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [pathInput, setPathInput] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [out, setOut] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function loadFiles() {
    setError("");
    try {
      const res = await fetch(`/api/files`);
      const data = await res.json();
      const list = Array.isArray(data?.files) ? (data.files as string[]) : [];
      setFiles(list);
      if (!selected && list.length) setSelected(list[0]);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }
  async function loadFile(p: string) {
    setError("");
    if (!p) return;
    try {
      const res = await fetch(`/api/file?path=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (data?.content != null) {
        setPathInput(p);
        setContent(data.content);
      } else {
        setContent("");
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function saveFile() {
    setLoading(true);
    setError("");
    setOut("");
    try {
      if (!pathInput) throw new Error("Please enter a docs/*.md path");
      const res = await fetch(`/api/file`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathInput, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setOut(`Saved: ${data?.path}`);
        await loadFiles();
      } else {
        throw new Error(data?.error || "Failed to save");
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (selected) loadFile(selected);
  }, [selected]);

  const fileOptions = useMemo(
    () => files.map(f => (<option key={f} value={f}>{f}</option>)),
    [files],
  );

  return (
        <section className="card panel" style={{ width: '100%' }}>
          <div className="section">
            <div className="field">
              <label>Docs Files</label>
                            <select value={selected} onChange={e => setSelected(e.target.value)} size={8} style={{ width: "100%", maxWidth: 480 }}>
                {fileOptions}
              </select>
              <div className="row" style={{ marginTop: 8 }}>
                <button
                  className="btn secondary"
                  onClick={async () => {
                    try {
                      const p = window.prompt(
                        'New file path (under docs/data-learning), e.g. "docs/data-learning/new-note.md"',
                        'docs/data-learning/new-note.md',
                      );
                      if (!p) return;
                      const pathOk = p.startsWith('docs/data-learning/') && p.toLowerCase().endsWith('.md');
                      const invalid = /[\\\0\r\n]/.test(p) || p.includes('..');
                      if (!pathOk || invalid) {
                        alert('Invalid path. Must start with "docs/data-learning/" and end with .md, no \'..\' or backslashes.');
                        return;
                      }
                      const initial = `# ${p.split('/').pop() || 'New Note'}\n\nCreated: ${new Date().toISOString()}\n`;
                      const res = await fetch(`/api/file`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: p, content: initial }),
                      });
                      const data = await res.json();
                      if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
                      await loadFiles();
                      setSelected(p);
                      await loadFile(p);
                    } catch (e: any) {
                      setError(e?.message || String(e));
                    }
                  }}
                >New file</button>
              </div>
            </div>
            <div className="field">
              <label>Path</label>
              <input value={pathInput} onChange={e => setPathInput(e.target.value)} placeholder="docs/data-learning/knowledge.md or docs/ai-presets/my-knowledge.md" style={{ width: "100%" }} />
            </div>
            <div className="field">
              <label>Content (Markdown)</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} style={{ minHeight: 360 }} />
            </div>
            <div className="row">
              <button className="btn" onClick={saveFile} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
              {error ? <div className="muted">Error: {error}</div> : null}
              {out ? <div className="muted">{out}</div> : null}
            </div>
          </div>
        </section>
  );
}


