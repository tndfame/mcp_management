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
  // Modal state for creating a new file
  const [showNew, setShowNew] = useState(false);
  const [newPath, setNewPath] = useState<string>("docs/data-learning/new-note.md");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string>("");
  const pathCheck = useMemo(() => {
    const p = (newPath || "").trim();
    if (!p) return { ok: false, reason: "Please enter a file path." };
    if (!p.startsWith("docs/data-learning/"))
      return { ok: false, reason: "Path must start with 'docs/data-learning/'." };
    if (!p.toLowerCase().endsWith(".md"))
      return { ok: false, reason: "File must end with .md" };
    if (/[\\\0\r\n]/.test(p) || p.includes(".."))
      return { ok: false, reason: "Invalid characters (no .., backslashes, or control chars)." };
    return { ok: true, reason: "testก." };
  }, [newPath]);

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
  }, [selected]) ;\n\n  const [webhookDefault, setWebhookDefault] = useState<string>("");\n\n  useEffect(() => { (async () => { try { const res = await fetch(`/api/knowledge-default`); const data = await res.json(); setWebhookDefault(String(data?.filePath || "")); } catch {} })(); }, []);\n\n  const fileOptions = useMemo(
    () => files.map(f => (<option key={f} value={f}>{f}</option>)),
    [files],
  );

  return (
        <section className="card panel w-full">
          {/* <div className="bg-red-500 text-white p-4 rounded">fame test</div>
          <div className="p-4 bg-red-500 text-white rounded">TW OK</div> */}
          <div className="section">
            <div className="field space-y-2">
              <label className="block text-sm font-medium">Docs Files</label>
              <select value={selected} onChange={e => setSelected(e.target.value)} size={8} className="w-full max-w-xl border rounded p-2 bg-white">
                {fileOptions}
              </select>
              <div className="row mt-2">
                <button
                  className="btn secondary px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50"
                  onClick={() => {
                    setCreateErr("");
                    setNewPath("docs/data-learning/new-note.md");
                    setShowNew(true);
                  }}
                >New file</button>
                <button
                  className="px-3 py-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={async () => {
                    try {
                      const p = selected || pathInput;
                      if (!p) { setError("Select a file or enter a path first"); return; }
                      if (!p.startsWith('docs/') || !p.toLowerCase().endsWith('.md')) { setError("Path must start with 'docs/' and end with .md"); return; }
                      const res = await fetch(`/api/knowledge-default`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filePath: p }),
                      });
                      const data = await res.json();
                      if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
                      setWebhookDefault(p);
                      setOut(`LINE webhook default set to: ${p}`);
                    } catch (e: any) {
                      setError(e?.message || String(e));
                    }
                  }}
                >Use as LINE default</button>
              </div>
              {webhookDefault ? (
                <div className="mt-1 text-xs text-gray-600">Current LINE webhook default: <code className="px-1 py-0.5 rounded bg-gray-100">{webhookDefault}</code></div>
              ) : null}
            </div>
            <div className="field space-y-2 mt-4">
              <label className="block text-sm font-medium">Path (relative to project root)</label>
              <input value={pathInput} onChange={e => setPathInput(e.target.value)} placeholder="docs/data-learning/knowledge.md or docs/ai-presets/my-knowledge.md" className="w-full border rounded px-3 py-2" />
            </div>
            <div className="field space-y-2 mt-4">
              <label className="block text-sm font-medium">Content (Markdown)</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full min-h-[360px] border rounded px-3 py-2 font-mono" />
            </div>
            <div className="row flex items-center gap-3 mt-4">
              <button className="btn px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={saveFile} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
              {error ? <div className="muted text-sm text-red-600">Error: {error}</div> : null}
              {out ? <div className="muted text-sm text-gray-600">{out}</div> : null}
            </div>
          </div>

          {/* Modal: Create new knowledge file */}
          {showNew ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !creating && setShowNew(false)} />
              <div
                className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl ring-1 ring-black/10 p-6"
                role="dialog"
                aria-modal="true"
                onKeyDown={e => { if (e.key === 'Escape' && !creating) setShowNew(false); }}
              >
                <h2 className="text-base font-semibold leading-6 text-gray-900">Create Knowledge File</h2>
                <p className="mt-1 text-sm text-gray-600">Add a new Markdown under <code className="px-1 py-0.5 rounded bg-gray-100">docs/data-learning/</code>.</p>
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Path</label>
                  <input
                    className={`w-full border rounded px-3 py-2 outline-none focus:ring-2 ${createErr || !pathCheck.ok ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-300'}`}
                    value={newPath}
                    onChange={e => setNewPath(e.target.value)}
                    placeholder="docs/data-learning/new-note.md"
                    autoFocus
                  />
                  {createErr ? (
                    <div className="text-sm text-red-600">{createErr}</div>
                  ) : (
                    <div className={`text-sm ${pathCheck.ok ? 'text-green-600' : 'text-gray-600'}`}>{pathCheck.reason}</div>
                  )}
                </div>
                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50"
                    disabled={creating}
                    onClick={() => setShowNew(false)}
                  >Cancel</button>
                  <button
                    className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={creating || !pathCheck.ok}
                    onClick={async () => {
                      try {
                        setCreateErr("");
                        const p = (newPath || "").trim();
                        if (!pathCheck.ok) return;
                        setCreating(true);
                        const initial = `# ${p.split("/").pop() || "New Note"}\n\nCreated: ${new Date().toISOString()}\n`;
                        const res = await fetch(`/api/file`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ path: p, content: initial }),
                        });
                        const data = await res.json();
                        if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
                        await loadFiles();
                        setSelected(p);
                        await loadFile(p);
                        setShowNew(false);
                      } catch (e: any) {
                        setCreateErr(e?.message || String(e));
                      } finally {
                        setCreating(false);
                      }
                    }}
                  >Create</button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
  );
}


