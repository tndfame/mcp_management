"use client";
import { useEffect, useState } from "react";

type StyleConfig = {
  personaName: string;
  tone: string; // friendly, formal, playful, concise
  language: string; // th, en, th-en
  emojiLevel: number; // 0..3
  replyLength: string; // short, medium, long
  includeSignature: boolean;
  extraGuidelines: string;
  politeParticle?: string; // "", "à¸„à¸£à¸±à¸š", "à¸„à¹ˆà¸°"
  greetWithName?: boolean;\n  signatureText?: string;\n  includeSticker?: boolean;\n  stickerPackageId?: string;\n  stickerId?: string;
  signatureText?: string;
};

const defaults: StyleConfig = {
  personaName: "Default",
  tone: "friendly",
  language: "th",
  emojiLevel: 1,
  replyLength: "medium",
  includeSignature: false,
  extraGuidelines: "",
  politeParticle: "",
  greetWithName: true,\n  signatureText: "",\n  includeSticker: false,\n  stickerPackageId: "",\n  stickerId: "",
  signatureText: "",
};

export default function AiStylePage() {
  const [cfg, setCfg] = useState<StyleConfig>(defaults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [ok, setOk] = useState<string>("");

  async function load() {
    setError("");
    try {
      const res = await fetch(`/api/ai-style`);
      const data = await res.json();
      setCfg({ ...defaults, ...(data || {}) });
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }
  async function save() {
    setLoading(true);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/ai-style`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setOk("Saved");
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const preview = `Personal: ${cfg.personaName}\nTone: ${cfg.tone}\nLanguage: ${cfg.language}\nEmoji: ${cfg.emojiLevel}\nLength: ${cfg.replyLength}\nSignature: ${cfg.includeSignature ? "Yes" : "No"}\nPolite: ${cfg.politeParticle || "-"}\nGreet with name: ${cfg.greetWithName ? "Yes" : "No"}\n\nGuidelines:\n${cfg.extraGuidelines || "-"}`;



  return (
        <section className="card panel" style={{ width: "100%", maxHeight: "93vh", overflowY: "auto" }}>
          <div className="section">
            <div className="card" style={{ padding: 12 }}>
              <div className="field" style={{ marginBottom: 0 }}>
            <div className="header">
              <div className="title">Custom Style</div>
            </div>
            <div className="row" style={{ gap: 8, marginBottom: 8 }}>
              <button className="btn" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
              <button className="btn secondary" onClick={() => setCfg(defaults)} disabled={loading}>Reset</button>
              {ok ? <span className="badge">{ok}</span> : null}
              {error ? <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Error: {error}</span> : null}
            </div>
            <div className="split">
              <div className="field">
                <label>Personal name</label>
                <input value={cfg.personaName} onChange={e => setCfg({ ...cfg, personaName: e.target.value })} placeholder="e.g., Friendly Assistant" />
              </div>
              <div className="field">
                <label>Tone</label>
                <select value={cfg.tone} onChange={e => setCfg({ ...cfg, tone: e.target.value })}>
                  <option value="friendly">friendly</option>
                  <option value="formal">formal</option>
                  <option value="playful">playful</option>
                  <option value="concise">concise</option>
                </select>
              </div>
              <div className="field">
                <label>Language</label>
                <select value={cfg.language} onChange={e => setCfg({ ...cfg, language: e.target.value })}>
                  <option value="th">Thai</option>
                  <option value="en">English</option>
                  <option value="th-en">Thai-English mix</option>
                </select>
              </div>
              <div className="field">
                <label>Polite Particle</label>
                <select value={cfg.politeParticle || ""} onChange={e => setCfg({ ...cfg, politeParticle: e.target.value })}>
                  <option value="">(none)</option>
                  <option value="à¸„à¸£à¸±à¸š">à¸„à¸£à¸±à¸š</option>
                  <option value="à¸„à¹ˆà¸°">à¸„à¹ˆà¸°</option>
                </select>
              </div>
            </div>
            <div className="split">
              <div className="field">
                <label>Emoji Level</label>
                <input type="range" min={0} max={3} value={cfg.emojiLevel} onChange={e => setCfg({ ...cfg, emojiLevel: parseInt(e.target.value, 10) })} /> <span className="badge" style={{ marginLeft: 8 }}>{cfg.emojiLevel}</span>
              </div>
              <div className="field">
                <label>Reply Length</label>
                <select value={cfg.replyLength} onChange={e => setCfg({ ...cfg, replyLength: e.target.value })}>
                  <option value="short">short</option>
                  <option value="medium">medium</option>
                  <option value="long">long</option>
                </select>
              </div>
            </div>
            <div className="split">
              <div className="field">
                <label>Signature</label>
                <div className="switch">
                  <input id="toggle-signature" type="checkbox" checked={cfg.includeSignature} onChange={e => setCfg({ ...cfg, includeSignature: e.target.checked })} />
                  <label htmlFor="toggle-signature">Include Signature</label>
                </div>
                <input
                  placeholder="Signature text (supports {name})"
                  value={(cfg as any).signatureText || ""}
                  onChange={e => setCfg({ ...cfg, signatureText: e.target.value })}
                  disabled={!cfg.includeSignature}
                />
              </div>
              <div className="field">
                <label>Greeting</label>
                <div className="switch">
                  <input id="toggle-greet" type="checkbox" checked={!!cfg.greetWithName} onChange={e => setCfg({ ...cfg, greetWithName: e.target.checked })} />
                  <label htmlFor="toggle-greet">Greet with user's display name</label>
                </div>
              </div>
            </div>
            <div className="field">
              <label>Extra Guidelines (Markdown)</label>
              <textarea value={cfg.extraGuidelines} onChange={e => setCfg({ ...cfg, extraGuidelines: e.target.value })} placeholder="- à¸«à¸¥à¸µà¸à¹€à¸¥à¸µà¹ˆà¸¢à¸‡à¸„à¸³à¹à¸ªà¸¥à¸‡ - à¹€à¸žà¸´à¹ˆà¸¡à¸„à¸³à¸¥à¸‡à¸—à¹‰à¸²à¸¢à¸ªà¸¸à¸ à¸²à¸žà¹ƒà¸™à¸ à¸²à¸©à¸²à¹„à¸—à¸¢" style={{ minHeight: 200 }} />
            </div>

          </div>
          <div className="section">
            <label>Preview (what weâ€™ll pass as style chunk)</label>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{preview}</pre>
              </div>
            </div>
          </div>
        </section>
  );
}



