"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Tool = { name: string; description?: string };

type HttpLog = { ts: number; method: string; path: string; status: number };

export default function Sidebar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeTab, setActiveTab] = useState<'admin'|'logs'>('admin');
  const [httpLogs, setHttpLogs] = useState<HttpLog[]>([]);
  useEffect(() => {
    async function loadTools() {
      try {
        const res = await fetch(`/api/tools`);
        const data = await res.json();
        const list: Tool[] = Array.isArray(data?.tools)
          ? data.tools
          : Array.isArray(data)
          ? data
          : [];
        const allow = new Set(["gemini_command", "push_gemini_text"]);
        const filtered = list.filter(t => allow.has(t.name));
        setTools(filtered);
      } catch {}
    }
    loadTools();
  }, []);

  useEffect(() => {
    let id: any;
    async function poll() {
      try {
        const res = await fetch(`/api/stats`, { cache: 'no-store' });
        const data = await res.json();
        const http: HttpLog[] = Array.isArray(data?.httpLogs)
          ? data.httpLogs
          : // fallback: derive from recentEvents if present in message text, e.g., "POST /api/call 200"
            (Array.isArray(data?.recentEvents)
              ? data.recentEvents
                  .map((e: any) => {
                    const m = String(e?.message || '').match(/(GET|POST|PUT|DELETE|PATCH)\s+(\S+)\s+(\d{3})/i);
                    if (!m) return null;
                    return { ts: e?.ts || Date.now(), method: m[1].toUpperCase(), path: m[2], status: parseInt(m[3], 10) } as HttpLog;
                  })
                  .filter(Boolean)
              : []);
        setHttpLogs(http.slice(-12).reverse());
      } catch {}
    }
    poll();
    id = setInterval(poll, 5000);
    return () => id && clearInterval(id);
  }, []);

  const toolLinks = useMemo(() => {
    const activeTool = search?.get("tool");
    return tools.map(t => {
      const isActive = pathname === "/" && activeTool === t.name;
      return (
        <li key={t.name}>
          <Link
            className={`tool-item${isActive ? " active" : ""}`}
            href={`/?tool=${encodeURIComponent(t.name)}`}
          >
            {t.name}
          </Link>
        </li>
      );
    });
  }, [tools, search, pathname]);

  return (
    <div>
      <div className="field">
        <label>Tools</label>
        <ul className="tool-list">{toolLinks}</ul>
      </div>
      <div className="field" style={{ marginTop: 16 }}>
        <label>Admin</label>
        <div className="row" style={{ gap: 8 }}>
          <button className={`tool-item${activeTab==='admin' ? ' active' : ''}`} onClick={() => setActiveTab('admin')} style={{ flex: 1 }}>Admin</button>
          <button className={`tool-item${activeTab==='logs' ? ' active' : ''}`} onClick={() => setActiveTab('logs')} style={{ flex: 1 }}>Recent Log</button>
        </div>
        {activeTab === 'admin' ? (
          <ul className="tool-list" style={{ marginTop: 8 }}>
            <li>
              <Link className={`tool-item${pathname?.startsWith("/knowledge") ? " active" : ""}`} href="/knowledge">
                Knowledge Editor
              </Link>
            </li>
            <li>
              <Link className={`tool-item${pathname?.startsWith("/ai-style") ? " active" : ""}`} href="/ai-style">
                AI Style
              </Link>
            </li>
          </ul>
        ) : (
          <ul className="tool-list" style={{ marginTop: 8 }}>
            {httpLogs.length === 0 ? (
              <li className="tool-item" style={{ opacity: 0.7 }}>No logs</li>
            ) : (
              httpLogs.map((h, i) => (
                <li key={i} className="tool-item" style={{ display: 'grid', gridTemplateColumns: '80px 60px 1fr 60px', gap: 8 }}>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>{new Date(h.ts).toLocaleTimeString()}</span>
                  <span style={{ fontWeight: 600 }}>{h.method}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.path}</span>
                  <span style={{ color: h.status >= 200 && h.status < 400 ? '#22c55e' : '#ef4444', textAlign: 'right' }}>{h.status}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
