"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Tool = { name: string; description?: string };

export default function Sidebar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [tools, setTools] = useState<Tool[]>([]);
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
        <ul className="tool-list">
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
      </div>
    </div>
  );
}
