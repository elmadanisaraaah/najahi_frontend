import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { ArrowLeft, Send, GraduationCap, Sparkles, AlertTriangle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

const SUGGESTIONS = [
  "ENSA admission",
  "ENSIAS filières",
  "ENCG concours",
  "EMI note bac",
  "INPT Rabat",
  "Médecine Maroc",
  "CPGE MPSI",
  "Bourse étude",
];

// ─── Inline markdown: **bold** and *italic* ───────────────────────────────────
function Inline({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("*") && p.endsWith("*"))
          return <em key={i}>{p.slice(1, -1)}</em>;
        return p;
      })}
    </>
  );
}

// ─── Full markdown renderer ───────────────────────────────────────────────────
function MD({ text, dark }) {
  const body   = dark ? "#e8e0ff" : "#1e1633";
  const accent = "#a78bfa";
  const muted  = dark ? "rgba(255,255,255,0.38)" : "rgba(30,22,51,0.42)";
  const hr     = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.12)";
  const bullet = dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.05)";

  const lines = text.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const ln = lines[i];

    // Heading (## or ###)
    if (/^#{1,3} /.test(ln)) {
      const lvl = ln.match(/^(#+)/)[1].length;
      const content = ln.replace(/^#+\s*/, "");
      out.push(
        <div key={i} style={{
          fontWeight: 700,
          fontSize: lvl === 1 ? 15 : 13,
          color: accent,
          marginTop: lvl === 1 ? 16 : 12,
          marginBottom: 5,
          letterSpacing: "0.01em",
        }}>
          <Inline text={content} />
        </div>
      );
    }

    // Horizontal rule
    else if (ln.trim() === "---") {
      out.push(<div key={i} style={{ borderTop: `1px solid ${hr}`, margin: "10px 0" }} />);
    }

    // Bullet: - or • or *
    else if (/^[-•*]\s/.test(ln)) {
      out.push(
        <div key={i} style={{
          display: "flex", gap: 8,
          background: bullet,
          borderRadius: 6, padding: "4px 8px",
          marginBottom: 3,
        }}>
          <span style={{ color: accent, flexShrink: 0, fontWeight: 700, fontSize: 11, marginTop: 3 }}>▸</span>
          <span style={{ color: body, fontSize: 13, lineHeight: 1.65 }}>
            <Inline text={ln.replace(/^[-•*]\s/, "")} />
          </span>
        </div>
      );
    }

    // Table row (markdown pipe tables)
    else if (ln.includes("|") && ln.trim().startsWith("|")) {
      // Collect all table rows
      const tableRows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        const cells = lines[i].split("|").map(c => c.trim()).filter(Boolean);
        if (!lines[i].replace(/[-|:\s]/g, "")) {
          // separator row — skip
        } else {
          tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        out.push(
          <div key={`table-${i}`} style={{ overflowX: "auto", margin: "8px 0" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr key={ri} style={{ background: ri === 0 ? (dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.07)") : "transparent" }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{
                        padding: "5px 10px",
                        border: `1px solid ${hr}`,
                        color: body,
                        fontWeight: ri === 0 ? 600 : 400,
                      }}>
                        <Inline text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue; // already incremented i
    }

    // Footnote / italic-only line (e.g. *⚠️ note*)
    else if (ln.startsWith("*") && ln.endsWith("*") && !ln.startsWith("**")) {
      out.push(
        <div key={i} style={{ fontSize: 11, color: muted, marginTop: 6, fontStyle: "italic" }}>
          {ln.slice(1, -1)}
        </div>
      );
    }

    // Empty line
    else if (ln.trim() === "") {
      out.push(<div key={i} style={{ height: 5 }} />);
    }

    // Normal paragraph
    else {
      out.push(
        <div key={i} style={{ color: body, fontSize: 13, lineHeight: 1.7, marginBottom: 1 }}>
          <Inline text={ln} />
        </div>
      );
    }

    i++;
  }

  return <div style={{ fontFamily: "'DM Sans', sans-serif" }}>{out}</div>;
}

// ─── Individual message bubble ────────────────────────────────────────────────
function Message({ msg, dark, isMobile }) {
  const subCol = dark ? "rgba(255,255,255,0.32)" : "rgba(30,22,51,0.38)";

  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <div style={{
          maxWidth: isMobile ? "88%" : "72%", padding: "11px 15px",
          background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
          borderRadius: "16px 16px 3px 16px",
          color: "#fff", fontSize: 13, lineHeight: 1.6,
          boxShadow: "0 3px 14px rgba(124,58,237,0.35)",
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "loading") {
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
        <Avatar dark={dark} />
        <div style={{
          padding: "13px 16px",
          background: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.92)",
          borderRadius: "3px 16px 16px 16px",
          border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(124,58,237,0.1)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          {[0, 1, 2].map(k => (
            <span key={k} style={{
              display: "block", width: 7, height: 7,
              borderRadius: "50%", background: "#a78bfa",
              animation: `scDot 1.3s ${k * 0.18}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  const isErr = !!msg.isError;

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
      <Avatar dark={dark} error={isErr} />
      <div style={{
        maxWidth: isMobile ? "96%" : "84%", padding: "14px 16px",
        background: isErr
          ? (dark ? "rgba(239,68,68,0.08)" : "rgba(254,226,226,0.55)")
          : (dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.95)"),
        borderRadius: "3px 16px 16px 16px",
        border: isErr
          ? "1px solid rgba(239,68,68,0.22)"
          : (dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(124,58,237,0.1)"),
        boxShadow: isErr ? "none" : (dark ? "none" : "0 2px 14px rgba(124,58,237,0.06)"),
      }}>
        <MD text={msg.content} dark={dark} />

        {msg.fallback && (
          <div style={{
            marginTop: 10, paddingTop: 8,
            borderTop: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(124,58,237,0.1)",
            fontSize: 10, color: subCol, display: "flex", alignItems: "center", gap: 5,
          }}>
            <AlertTriangle size={10} />
            Réponse basée sur données intégrées — IA temporairement indisponible
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ dark, error }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0, marginTop: 2,
      background: error
        ? (dark ? "rgba(239,68,68,0.18)" : "rgba(254,202,202,0.6)")
        : "linear-gradient(135deg,#7c3aed,#a78bfa)",
      border: error ? "1px solid rgba(239,68,68,0.3)" : "none",
      display: "grid", placeItems: "center",
    }}>
      {error
        ? <AlertTriangle size={14} color="#ef4444" />
        : <Sparkles size={13} color="#fff" />
      }
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Schools() {
  const { theme } = useTheme();
  const navigate  = useNavigate();
  const dark = theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  const [messages, setMessages] = useState([{
    role: "assistant",
    content:
      "Bonjour ! 🎓 Je suis ton guide des écoles et universités marocaines.\n\n" +
      "Pose-moi n'importe quelle question sur :\n" +
      "- Conditions d'admission & notes de bac requises\n" +
      "- Filières, villes, frais de scolarité\n" +
      "- Concours d'entrée (CNC, ENCG, Médecine...)\n" +
      "- Orientation, débouchés, bourses\n\n" +
      "Je réponds en français, arabe, anglais ou darija selon ta langue 🌍",
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Theme colours
  const bg      = dark ? "linear-gradient(135deg,#0c0818 0%,#150c2d 60%,#0a1624 100%)" : "linear-gradient(135deg,#f0edff 0%,#ece8ff 50%,#edf2ff 100%)";
  const navBg   = dark ? "rgba(12,8,24,0.88)" : "rgba(255,255,255,0.82)";
  const navBdr  = dark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.1)";
  const textCol = dark ? "#f0ecff" : "#1e1633";
  const subCol  = dark ? "rgba(240,236,255,0.38)" : "rgba(30,22,51,0.4)";
  const inputBg = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const inputBd = dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(124,58,237,0.12)";
  const suggBg  = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)";
  const suggBd  = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.14)";

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (queryArg) => {
    const q = (queryArg || input).trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: q }, { role: "loading" }]);

    try {
      const token = localStorage.getItem("najahi_token");
      const res = await fetch(API_URL + "/api/schools/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: q }),
      });

      let data;
      try { data = await res.json(); }
      catch { throw new Error("Réponse serveur illisible."); }

      const answer = data.answer || "Désolé, je n'ai pas pu obtenir de réponse.";

      setMessages(prev => [
        ...prev.filter(m => m.role !== "loading"),
        { role: "assistant", content: answer, fallback: !!data.fallback },
      ]);
    } catch (err) {
      console.error("[Schools]", err);
      setMessages(prev => [
        ...prev.filter(m => m.role !== "loading"),
        {
          role: "assistant",
          content:
            "Désolé, une erreur s'est produite 😕\n\n" +
            "Vérifie ta connexion internet et réessaie dans quelques secondes.\n\n" +
            `*(Détail : ${err.message || "erreur inconnue"})*`,
          isError: true,
        },
      ]);
    }

    setLoading(false);
  };

  const firstUserMessageSent = messages.some(m => m.role === "user");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes scDot {
          0%,100% { transform:translateY(0); opacity:.5; }
          50%      { transform:translateY(-5px); opacity:1; }
        }
        @keyframes scBlob1 {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(28px,16px) scale(1.07); }
        }
        @keyframes scBlob2 {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(-18px,12px) scale(1.07); }
        }

        .sc-input::placeholder { color:${dark ? "rgba(240,236,255,0.22)" : "rgba(30,22,51,0.25)"}; }
        .sc-send-btn:hover:not(:disabled) { transform:scale(1.1) !important; }
        .sc-sugg-chip:hover:not(:disabled) {
          background:${dark ? "rgba(124,58,237,0.22)" : "rgba(124,58,237,0.09)"} !important;
          border-color:rgba(124,58,237,0.5) !important;
          color:#a78bfa !important;
        }
        ::-webkit-scrollbar       { width:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(124,58,237,0.28); border-radius:4px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden", overflowX: "hidden" }}>

        {/* Ambient blobs */}
        <div style={{ position:"fixed", top:"-90px", left:"-90px", width:"400px", height:"400px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(124,58,237,0.14)":"rgba(124,58,237,0.06)"} 0%,transparent 70%)`, filter:"blur(65px)", pointerEvents:"none", zIndex:0, animation:"scBlob1 9s ease-in-out infinite" }} />
        <div style={{ position:"fixed", bottom:"-70px", right:"-70px", width:"360px", height:"360px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(16,185,129,0.07)":"rgba(16,185,129,0.035)"} 0%,transparent 70%)`, filter:"blur(65px)", pointerEvents:"none", zIndex:0, animation:"scBlob2 12s ease-in-out infinite" }} />
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:`linear-gradient(rgba(124,58,237,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.022) 1px,transparent 1px)`, backgroundSize:"44px 44px" }} />

        {/* ── Navbar ── */}
        <nav style={{ position:"sticky", top:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", height: isMobile ? 56 : isTablet ? 60 : "auto", padding: isMobile ? "0 16px" : isTablet ? "0 20px" : "10px 20px", overflow:"hidden", background:navBg, backdropFilter:"blur(22px)", borderBottom:`1px solid ${navBdr}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button type="button"
              onClick={() => navigate("/app/dashboard")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", background:dark?"rgba(255,255,255,0.05)":"rgba(124,58,237,0.05)", border:dark?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(124,58,237,0.13)", borderRadius:8, color:subCol, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
              <ArrowLeft size={12} /> Dashboard
            </button>

            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"grid", placeItems:"center", boxShadow:"0 2px 10px rgba(124,58,237,0.35)" }}>
                <GraduationCap size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:textCol, fontFamily:"'Fraunces',serif", lineHeight:1.2 }}>
                  Guide des Écoles
                </div>
                <div style={{ fontSize:10, color:subCol, display: isMobile ? "none" : "flex", alignItems:"center", gap:4, marginTop:1 }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />
                  Assistant IA — Écoles Marocaines
                </div>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </nav>

        {/* ── Chat body ── */}
        <div style={{ position:"relative", zIndex:1, flex:1, display:"flex", flexDirection:"column", maxWidth:830, width:"100%", margin:"0 auto", padding:"0 16px" }}>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"22px 0 10px" }}>
            {messages.map((msg, idx) => (
              <Message key={idx} msg={msg} dark={dark} isMobile={isMobile} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips — only before first user message */}
          {!firstUserMessageSent && (
            <div style={{ marginBottom:12 }}>
              <p style={{ fontSize:10, color:subCol, marginBottom:8, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                Suggestions rapides
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} type="button"
                    className="sc-sugg-chip"
                    onClick={() => send(s)}
                    disabled={loading}
                    style={{
                      padding:"5px 13px",
                      background:suggBg,
                      border:`1px solid ${suggBd}`,
                      borderRadius:99, fontSize:12, color:textCol,
                      cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                      transition:"all 0.18s",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div style={{ paddingBottom:20 }}>
            <div style={{
              display:"flex", gap: isMobile ? 6 : 10, padding:"10px 13px",
              background:inputBg, border:inputBd, borderRadius:18,
              backdropFilter:"blur(22px)",
              boxShadow: dark ? "0 4px 28px rgba(0,0,0,0.4)" : "0 4px 22px rgba(124,58,237,0.08)",
              transition:"box-shadow 0.2s",
            }}>
              <GraduationCap size={15} style={{ color:subCol, flexShrink:0, alignSelf:"center" }} />
              <input
                type="text"
                className="sc-input"
                placeholder="Ex : Note bac pour médecine, filières ENCG, CPGE MP..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                disabled={loading}
                style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:textCol, fontFamily:"'DM Sans',sans-serif" }}
              />
              <button
                type="button"
                className="sc-send-btn"
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  width:44, height:44, borderRadius:10, border:"none",
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg,#7c3aed,#a78bfa)"
                    : "rgba(124,58,237,0.15)",
                  display:"grid", placeItems:"center", flexShrink:0,
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  transition:"all 0.18s",
                  boxShadow: input.trim() && !loading ? "0 2px 10px rgba(124,58,237,0.3)" : "none",
                }}>
                <Send size={13} color="#fff" />
              </button>
            </div>
            <p style={{ textAlign:"center", fontSize:10, color:subCol, marginTop:6 }}>
              Informations sur les écoles et universités marocaines · Propulsé par Gemini AI
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
