"use client";
import { useEffect, useMemo, useState } from "react";

type Stats = {
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  calls: number;
  lastModel?: string;
  mcpConnected: boolean;
  lineWebhookActive: boolean;
  aiReady?: boolean;
  lastUpdated: number;
};

type Quota = { limited: number; totalUsage: number; remaining: number };

function Dot({ cls }: { cls?: string }) {
  return <div className={`kpi-dot ${cls || ""}`} />;
}

export default function KpiStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string>("");
  const [quota, setQuota] = useState<Quota | null>(null);

  async function load() {
    setErr("");
    try {
      const res = await fetch(`/api/stats`, { cache: "no-store" });
      const data = await res.json();
      setStats(data);
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
    try {
      const q = await fetch(`/api/line-quota`, { cache: "no-store" });
      const jd = await q.json();
      if (!q.ok) throw new Error(jd?.error || `HTTP ${q.status}`);
      setQuota(jd);
    } catch (e: any) {
      // don't break cards if quota fails
    }
  }

  useEffect(() => {
    let statsId: any | null = null;
    let quotaId: any | null = null;

    const start = () => {
      // stats every 5s (lightweight)
      statsId = setInterval(() => {
        if (document.visibilityState === 'visible') load();
      }, 5000);
      // quota every 30s (server caches 60s)
      quotaId = setInterval(() => {
        if (document.visibilityState === 'visible') load();
      }, 30000);
    };
    const stop = () => {
      if (statsId) clearInterval(statsId);
      if (quotaId) clearInterval(quotaId);
      statsId = quotaId = null;
    };

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        load();
        stop();
        start();
      } else {
        stop();
      }
    };

    load();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const tokenDots = useMemo(() => {
    const total = stats?.tokensUsed ?? 0;
    // Map usage to 24 dots: more tokens => more green
    const filled = Math.max(0, Math.min(24, Math.round(Math.log10(total + 1) * 8)));
    return Array.from({ length: 24 }).map((_, i) => (
      <Dot key={i} cls={i < filled ? "ok" : ""} />
    ));
  }, [stats?.tokensUsed]);

  const connDots = useMemo(() => {
    const ok = (stats?.mcpConnected ? 1 : 0) + (stats?.lineWebhookActive ? 1 : 0);
    return Array.from({ length: 24 }).map((_, i) => (
      <Dot key={i} cls={i < ok * 12 ? "ok" : i < 18 ? "warn" : "bad"} />
    ));
  }, [stats?.mcpConnected, stats?.lineWebhookActive]);

  const aiDots = useMemo(() => {
    const ok = stats?.aiReady ? 24 : 0;
    return Array.from({ length: 24 }).map((_, i) => (
      <Dot key={i} cls={i < ok ? "ok" : "bad"} />
    ));
  }, [stats?.aiReady]);

  const quotaDots = useMemo(() => {
    const lim = quota?.limited ?? 0;
    const used = quota?.totalUsage ?? 0;
    const pct = lim > 0 ? used / lim : 0;
    const fill = Math.max(0, Math.min(24, Math.round(24 * pct)));
    return Array.from({ length: 24 }).map((_, i) => (
      <Dot key={i} cls={i < fill ? (pct < 0.75 ? "ok" : pct < 0.9 ? "warn" : "bad") : ""} />
    ));
  }, [quota?.limited, quota?.totalUsage]);

  return (
    <div>
      <div className="topbar">
        <div className="brand">
          <div className="badge">{stats?.mcpConnected ? "Ready" : "Init"}</div>
          <div>
            <div className="brand-title">Test Fame MCP</div>
            <div className="brand-sub">Last update: {stats ? new Date(stats.lastUpdated).toLocaleTimeString() : "-"}</div>
          </div>
        </div>
        {err ? <div className="muted">{err}</div> : null}
      </div>

      <div className="overview">
        <div className="kpi-card">
          <div className="kpi-title">Tokens used</div>
          <div className="kpi-value">{(stats?.tokensUsed ?? 0).toLocaleString()}</div>
          <div className="kpi-meter">{tokenDots}</div>
          <div className="muted" style={{ marginTop: 6 }}>in: {(stats?.inputTokens ?? 0).toLocaleString()} · out: {(stats?.outputTokens ?? 0).toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Connections</div>
          <div className="kpi-value">
            MCP: {stats?.mcpConnected ? "Connected" : "Offline"} · LINE: {stats?.lineWebhookActive ? "Active" : "Idle"}
          </div>
          <div className="kpi-meter">{connDots}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">AI Model</div>
          <div className="kpi-value">{stats?.lastModel || "-"} {stats?.aiReady ? "(ready)" : "(no key)"}</div>
          <div className="kpi-meter">{aiDots}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">LINE Quota</div>
          <div className="kpi-value">
            {quota ? `${quota.totalUsage.toLocaleString()} / ${quota.limited.toLocaleString()} (rem ${quota.remaining.toLocaleString()})` : "-"}
          </div>
          <div className="kpi-meter">{quotaDots}</div>
        </div>
      </div>
    </div>
  );
}
