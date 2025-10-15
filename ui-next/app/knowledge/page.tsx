"use client";
import { useEffect, useMemo, useState, useCallback } from "react";

type FileItem = string;

interface PathValidation { ok: boolean; reason: string; }

export default function KnowledgePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [pathInput, setPathInput] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [out, setOut] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showNew, setShowNew] = useState(false);
  const [newPath, setNewPath] = useState<string>("docs/data-learning/new-note.md");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string>("");

  const validatePath = useCallback((path: string): PathValidation => {
    const trimmed = path.trim();
    if (!trimmed) return { ok: false, reason: "กรุณาระบุ path ของไฟล์" };
    if (!trimmed.startsWith("docs/data-learning/")) return { ok: false, reason: "Path ต้องเริ่มด้วย 'docs/data-learning/'" };
    if (!trimmed.toLowerCase().endsWith(".md")) return { ok: false, reason: "ต้องเป็นไฟล์ .md" };
    if (/[\\\0\r\n]/.test(trimmed) || trimmed.includes("..")) return { ok: false, reason: "รูปแบบ path ไม่ถูกต้อง" };
    return { ok: true, reason: "Path ถูกต้อง" };
  }, []);

  const pathCheck = useMemo(() => validatePath(newPath), [newPath, validatePath]);

  const loadFiles = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`/api/files`);
      const data = await res.json();
      const list = Array.isArray(data?.files) ? data.files : [];
      setFiles(list);
      if (!selected && list.length) setSelected(list[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [selected]);

  const loadFile = useCallback(async (path: string) => {
    if (!path) return;
    setError("");
    try {
      const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data?.content != null) { setPathInput(path); setContent(data.content); }
      else { setContent(""); }
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }, []);

  const saveFile = useCallback(async () => {
    if (!pathInput) { setError("กรุณาใส่ path ของไฟล์"); return; }
    setLoading(true); setError(""); setOut("");
    try {
      const res = await fetch(`/api/file`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: pathInput, content }) });
      const data = await res.json();
      if (res.ok) { setOut(`บันทึกแล้ว: ${data?.path}`); await loadFiles(); }
      else { throw new Error(data?.error || "Save failed"); }
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }, [pathInput, content, loadFiles]);

  const createFile = useCallback(async () => {
    const trimmedPath = newPath.trim();
    if (!pathCheck.ok) return;
    setCreateErr(""); setCreating(true);
    try {
      const fileName = trimmedPath.split("/").pop() || "New Note";
      const initial = `# ${fileName}\n\nสร้างเมื่อ: ${new Date().toLocaleString('th-TH')}\n`;
      const res = await fetch(`/api/file`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: trimmedPath, content: initial }) });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Create failed");
      await loadFiles(); setSelected(trimmedPath); await loadFile(trimmedPath); setShowNew(false);
    } catch (e) { setCreateErr(e instanceof Error ? e.message : String(e)); }
    finally { setCreating(false); }
  }, [newPath, pathCheck.ok, loadFiles, loadFile]);

  useEffect(() => { loadFiles(); }, [loadFiles]);
  useEffect(() => { if (selected) loadFile(selected); }, [selected, loadFile]);

  useMemo(() => files.map(f => f), [files]);

  return (
    <div>
      <div className="max-w-[1800px] mx-auto px-6 py-2">
        <div className="flex gap-4" style={{minHeight: '60vh'}}>
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="card h-full flex flex-col overflow-hidden">
              <div className="card-head">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="font-medium">Knowledge Files</span>
                  <button
                    onClick={() => { setCreateErr(""); setNewPath("docs/data-learning/new-note.md"); setShowNew(true); }}
                    className="btn"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {files.map(file => (
                  <button
                    key={file}
                    onClick={() => setSelected(file)}
                    className="w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm transition-all duration-150"
                    style={{ background: selected === file ? '#12203a' : 'transparent', color: 'var(--text)', border: '1px solid #253046' }}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate">{file.split('/').pop()}</span>
                    </div>
                    <div className={`text-xs mt-1 truncate ${selected === file ? 'opacity-80' : 'opacity-60'}`}>{file}</div>
                  </button>
                ))}
                {files.length === 0 && (
                  <div className="text-center py-8" style={{color: 'var(--muted)'}}>
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No knowledge files</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="card flex-1 flex flex-col overflow-hidden">
              <div className="card-head">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <input
                    type="text"
                    className="flex-1"
                    style={{ background: '#0e1528', border: '1px solid #253046', color: 'var(--text)', borderRadius: 8, padding: '8px 10px' }}
                    value={pathInput}
                    onChange={e => setPathInput(e.target.value)}
                    placeholder="docs/data-learning/filename.md"
                  />
                  <button className="btn" onClick={saveFile} disabled={loading}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-hidden">
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="แก้ไขเนื้อหา Markdown ของคุณที่นี่..."
                  className="w-full"
                  style={{ height: '60vh' }}
                />
              </div>

              {(error || out) && (
                <div className="card-foot">
                  {error && (
                    <div className="flex items-center gap-2 text-sm" style={{color: '#fca5a5'}}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}
                  {out && (
                    <div className="flex items-center gap-2 text-sm" style={{color: '#86efac'}}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {out}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create File Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !creating && setShowNew(false)} />
          <div className="relative z-10 w-full max-w-md card overflow-hidden"
            onKeyDown={e => { if (e.key === "Escape" && !creating) setShowNew(false); }}
          >
            <div className="card-head" style={{padding: '16px'}}>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                สร้างไฟล์ใหม่
              </h3>
              <p className="mt-1 text-sm" style={{color: 'var(--muted)'}}>
                สร้างไฟล์ Markdown ใต้โฟลเดอร์ docs/data-learning/
              </p>
            </div>

            <div className="px-6 py-5">
              <label className="block text-sm font-medium mb-2">Path ของไฟล์</label>
              <input
                type="text"
                className="w-full"
                style={{ background: '#0e1528', border: `1px solid ${createErr || !pathCheck.ok ? '#7f1d1d' : '#253046'}`, color: 'var(--text)', borderRadius: 8, padding: '10px 12px' }}
                value={newPath}
                onChange={e => setNewPath(e.target.value)}
                placeholder="docs/data-learning/new-note.md"
                autoFocus
              />
              {createErr ? (
                <p className="mt-3 text-sm px-3 py-2 rounded-lg border flex items-start gap-2" style={{color: '#fecaca', background: '#2b0b0b', borderColor: '#7f1d1d'}}>
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {createErr}
                </p>
              ) : (
                <p className="mt-3 text-sm px-3 py-2 rounded-lg flex items-start gap-2 border"
                   style={{ color: pathCheck.ok ? '#86efac' : 'var(--muted)', background: pathCheck.ok ? '#052e1a' : '#0e1528', borderColor: pathCheck.ok ? '#14532d' : '#253046' }}>
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pathCheck.reason}
                </p>
              )}
            </div>

            <div className="card-foot" style={{display:'flex', alignItems:'center', justifyContent:'end', gap:12}}>
              <button onClick={() => setShowNew(false)} disabled={creating} className="btn secondary">ยกเลิก</button>
              <button onClick={createFile} disabled={creating || !pathCheck.ok} className="btn">{creating ? "กำลังสร้าง..." : "สร้างไฟล์"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

