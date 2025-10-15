"use client";
import { useEffect, useMemo, useState, useCallback } from "react";

type FileItem = string;

interface PathValidation {
  ok: boolean;
  reason: string;
}

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
    const trimmedPath = path.trim();

    if (!trimmedPath) {
      return { ok: false, reason: "กรุณาระบุ path ของไฟล์" };
    }
    if (!trimmedPath.startsWith("docs/data-learning/")) {
      return { ok: false, reason: "Path ต้องเริ่มด้วย 'docs/data-learning/'" };
    }
    if (!trimmedPath.toLowerCase().endsWith(".md")) {
      return { ok: false, reason: "ไฟล์ต้องมีนามสกุล .md" };
    }
    if (/[\\\0\r\n]/.test(trimmedPath) || trimmedPath.includes("..")) {
      return { ok: false, reason: "พบอักขระที่ไม่อนุญาต" };
    }

    return { ok: true, reason: "✓ Path ถูกต้อง" };
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

      if (data?.content != null) {
        setPathInput(path);
        setContent(data.content);
      } else {
        setContent("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const saveFile = useCallback(async () => {
    if (!pathInput) {
      setError("กรุณาระบุ path ของไฟล์");
      return;
    }

    setLoading(true);
    setError("");
    setOut("");

    try {
      const res = await fetch(`/api/file`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathInput, content }),
      });
      const data = await res.json();

      if (res.ok) {
        setOut(`✓ : ${data?.path}`);
        await loadFiles();
      } else {
        throw new Error(data?.error || "ไม่สามารถบันทึกได้");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [pathInput, content, loadFiles]);

  const createFile = useCallback(async () => {
    const trimmedPath = newPath.trim();
    if (!pathCheck.ok) return;

    setCreateErr("");
    setCreating(true);

    try {
      const fileName = trimmedPath.split("/").pop() || "New Note";
      const initial = `# ${fileName}\n\nสร้างเมื่อ: ${new Date().toLocaleString('th-TH')}\n`;

      const res = await fetch(`/api/file`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: trimmedPath, content: initial }),
      });
      const data = await res.json();

      if (!res.ok || data?.error) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      await loadFiles();
      setSelected(trimmedPath);
      await loadFile(trimmedPath);
      setShowNew(false);
    } catch (e) {
      setCreateErr(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }, [newPath, pathCheck.ok, loadFiles, loadFile]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (selected) loadFile(selected);
  }, [selected, loadFile]);

  const fileOptions = useMemo(
    () => files.map(f => <option key={f} value={f}>{f}</option>),
    [files]
  );

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      {/* <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Knowledge Base</h1>
              <p className="text-sm text-gray-600 mt-0.5">จัดการเอกสารและความรู้ภายในองค์กร</p>
            </div>
            <button
              onClick={() => {
                setCreateErr("");
                setNewPath("docs/data-learning/new-note.md");
                setShowNew(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-600/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              สร้างไฟล์ใหม่
            </button>
          </div>
        </div>
      </div> */}

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Sidebar - File Explorer */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="font-medium">รายการเอกสาร</span>
                  <button
              onClick={() => {
                setCreateErr("");
                setNewPath("docs/data-learning/new-note.md");
                setShowNew(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-600/20"
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
                    className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm transition-all duration-150 ${
                      selected === file
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
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
                  <div className="text-center py-8 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">ไม่มีเอกสาร</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col overflow-hidden shadow-sm">
              {/* Editor Header */}
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <input
                    type="text"
                    value={pathInput}
                    onChange={e => setPathInput(e.target.value)}
                    placeholder="docs/data-learning/filename.md"
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={saveFile}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200 shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 p-5 overflow-hidden">
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="เริ่มเขียนเอกสารของคุณที่นี่..."
                  className="w-full h-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
                />
              </div>

              {/* Status Bar */}
              {(error || out) && (
                <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}
                  {out && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
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
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !creating && setShowNew(false)}
          />
          <div
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onKeyDown={e => {
              if (e.key === "Escape" && !creating) setShowNew(false);
            }}
          >
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                สร้างไฟล์ใหม่
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                เพิ่มเอกสาร Markdown ใหม่ใน docs/data-learning/
              </p>
            </div>

            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Path ของไฟล์
              </label>
              <input
                type="text"
                className={`w-full bg-white border rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 transition-all ${
                  createErr || !pathCheck.ok
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                value={newPath}
                onChange={e => setNewPath(e.target.value)}
                placeholder="docs/data-learning/new-note.md"
                autoFocus
              />
              {createErr ? (
                <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {createErr}
                </p>
              ) : (
                <p
                  className={`mt-3 text-sm px-3 py-2 rounded-lg flex items-start gap-2 ${
                    pathCheck.ok
                      ? "text-green-700 bg-green-50 border border-green-200"
                      : "text-gray-600 bg-gray-50 border border-gray-200"
                  }`}
                >
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pathCheck.reason}
                </p>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNew(false)}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={createFile}
                disabled={creating || !pathCheck.ok}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {creating ? "กำลังสร้าง..." : "สร้างไฟล์"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
