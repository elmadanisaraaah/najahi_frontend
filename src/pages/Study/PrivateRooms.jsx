import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { ArrowLeft, Plus, Hash, Copy, Check, Users, Timer, ArrowRight } from "lucide-react";

function ParticlesBackground({ dark }) {
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    position: "absolute",
    width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
    borderRadius: "50%",
    background: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#818cf8" : "#7c3aed",
    left: `${5 + (i * 7.1) % 90}%`, top: `${5 + (i * 8.7) % 88}%`,
    opacity: dark ? 0.08 + (i % 5) * 0.04 : 0.03 + (i % 5) * 0.02,
    animation: `prfloat${i % 4} ${3 + (i % 4)}s ease-in-out infinite`,
    animationDelay: `${i * 0.4}s`, pointerEvents: "none",
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {particles.map((s, i) => <div key={i} style={s} />)}
    </div>
  );
}

export default function PrivateRooms() {
  const { theme } = useTheme();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const dark = theme === "dark";
  const getToken = () => accessToken || localStorage.getItem("najahi_token");

  const [step, setStep]             = useState("choice");
  const [roomName, setRoomName]     = useState("");
  const [heures, setHeures]         = useState(0);
  const [minutes, setMinutes]       = useState(25);
  const [maxPers, setMaxPers]       = useState(4);
  const [joinCode, setJoinCode]     = useState("");
  const [creating, setCreating]     = useState(false);
  const [joining, setJoining]       = useState(false);
  const [error, setError]           = useState("");
  const [createdRoom, setCreatedRoom] = useState(null);
  const [copied, setCopied]         = useState(false);
  const [logoError, setLogoError]   = useState(false);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const totalMinutes = heures * 60 + minutes;

  const handleCreate = async () => {
  if (!roomName.trim()) return setError("Donne un nom à ta salle");
  if (totalMinutes < 5) return setError("La durée minimum est 5 minutes");
  
  const token = accessToken || localStorage.getItem("najahi_token");
  console.log("TOKEN:", token); // debug
  
  if (!token) return setError("Tu n'es pas connecté — reconnecte-toi");
  
  setCreating(true); setError("");
  try {
    const res = await fetch("/api/rooms/create", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: roomName.trim(),
        total_minutes: totalMinutes,
        max_participants: maxPers,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Erreur création");
    setCreatedRoom(data);
    setStep("created");
  } catch {
    setError("Erreur réseau");
  } finally {
    setCreating(false);
  }
};

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) return setError("Entre le code de la salle");
    setJoining(true); setError("");
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Code invalide");
      navigate(`/app/study/room/${data.room_id}`);
    } catch {
      setError("Erreur réseau");
    } finally {
      setJoining(false);
    }
  };

  const copyCode = () => {
    if (!createdRoom?.code) return;
    navigator.clipboard.writeText(createdRoom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const bg      = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 50%,#0d1a2e 100%)" : "linear-gradient(135deg,#f0edff 0%,#e8e4ff 50%,#eef2ff 100%)";
  const navBg   = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)";
  const navBdr  = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)";
  const textCol = dark ? "#fff" : "#1a1625";
  const subCol  = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";
  const cardBg  = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const cardBdr = dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(124,58,237,0.12)";
  const inputBg = dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)";
  const inputBd = dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(124,58,237,0.2)";

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    background: inputBg, border: inputBd,
    borderRadius: 12, fontSize: 14, color: textCol,
    fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.2s",
  };

  const counterBtnStyle = {
    width: 40, height: 40, borderRadius: 10,
    border: inputBd, background: inputBg,
    color: textCol, fontSize: 22, fontWeight: 700,
    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    display: "grid", placeItems: "center", transition: "all 0.15s",
    flexShrink: 0,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes prfloat0{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes prfloat1{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,-15px)}}
        @keyframes prfloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-25px)}}
        @keyframes prfloat3{0%,100%{transform:translate(0,0)}50%{transform:translate(-10px,-12px)}}
        @keyframes prblob1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,20px) scale(1.1)}}
        @keyframes prblob2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-20px,15px) scale(1.1)}}
        @keyframes prfadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes prglow{0%,100%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.3),0 0 16px rgba(124,58,237,0.4)}50%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.5),0 0 28px rgba(124,58,237,0.6)}}
        @keyframes prpulse{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes prcodeBounce{0%{transform:scale(0.8) translateY(10px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}
        @keyframes prcheckBounce{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
        .pr-input:focus{border-color:#7c3aed !important;box-shadow:0 0 0 3px rgba(124,58,237,0.15) !important;}
        .pr-input::placeholder{color:${dark ? "rgba(255,255,255,0.2)" : "rgba(26,22,37,0.25)"};}
        .pr-btn:hover:not(:disabled){transform:translateY(-2px) !important;box-shadow:0 10px 28px rgba(124,58,237,0.4) !important;}
        .pr-choice:hover{transform:translateY(-4px) !important;border-color:#7c3aed !important;box-shadow:0 12px 36px rgba(124,58,237,0.2) !important;}
        .pr-counter:hover{border-color:#7c3aed !important;background:rgba(124,58,237,0.1) !important;}
        .pr-copy:hover{background:rgba(124,58,237,0.2) !important;}
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden", transition: "background 0.5s ease" }}>
        <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "450px", height: "450px", borderRadius: "50%", background: `radial-gradient(circle,${dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.07)"} 0%,transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", animation: "prblob1 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-80px", right: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: `radial-gradient(circle,${dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.05)"} 0%,transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", animation: "prblob2 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(124,58,237,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.025) 1px,transparent 1px)`, backgroundSize: "42px 42px" }} />
        <ParticlesBackground dark={dark} />

        {/* Navbar */}
        <nav style={{ position: "relative", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: navBg, backdropFilter: "blur(18px)", borderBottom: `1px solid ${navBdr}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button"
              onClick={() => {
                if (step === "choice") navigate("/app/study");
                else if (step === "created") setStep("form");
                else setStep("choice");
              }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.06)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(124,58,237,0.15)", borderRadius: 8, color: subCol, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              <ArrowLeft size={13} /> {step === "choice" ? "Study" : "Retour"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 4, animation: "prglow 3s ease-in-out infinite alternate" }}>
                {!logoError
                  ? <img src="/najahi_logo.png" alt="N" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={() => setLogoError(true)} />
                  : <span style={{ color: "#7c3aed", fontSize: 15, fontWeight: 900, fontFamily: "'Fraunces',serif" }}>N</span>
                }
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: textCol, fontFamily: "'Fraunces',serif" }}>Salles privées</span>
            </div>
          </div>
          <ThemeToggle />
        </nav>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: "32px 24px" }}>

          {/* ── CHOICE ── */}
          {step === "choice" && (
            <div style={{ width: "100%", maxWidth: 560, animation: mounted ? "prfadeUp 0.5s ease both" : "none" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: textCol, letterSpacing: "-0.5px", marginBottom: 8 }}>
                  Étudie avec tes amis
                </h1>
                <p style={{ color: subCol, fontSize: 14, lineHeight: 1.6 }}>
                  Crée une salle privée ou rejoins celle d'un ami.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="pr-choice"
                  onClick={() => { setStep("form"); setError(""); }}
                  style={{ background: cardBg, backdropFilter: "blur(20px)", border: cardBdr, borderRadius: 20, padding: "28px 24px", cursor: "pointer", transition: "all 0.3s", boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(124,58,237,0.07)", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(124,58,237,0.12)", border: "1.5px solid rgba(124,58,237,0.2)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                    <Plus size={24} color="#7c3aed" />
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: textCol, marginBottom: 6 }}>Créer une salle</h3>
                  <p style={{ fontSize: 12, color: subCol, lineHeight: 1.6 }}>Configure ta salle et invite tes amis avec un code.</p>
                </div>
                <div className="pr-choice"
                  onClick={() => { setStep("join"); setError(""); }}
                  style={{ background: cardBg, backdropFilter: "blur(20px)", border: cardBdr, borderRadius: 20, padding: "28px 24px", cursor: "pointer", transition: "all 0.3s", boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(124,58,237,0.07)", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.2)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                    <Hash size={24} color="#10b981" />
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: textCol, marginBottom: 6 }}>Rejoindre</h3>
                  <p style={{ fontSize: 12, color: subCol, lineHeight: 1.6 }}>Entre le code partagé par ton ami.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── FORM ── */}
          {step === "form" && (
            <div style={{ width: "100%", maxWidth: 480, animation: "prfadeUp 0.4s ease both" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, color: textCol, marginBottom: 6 }}>Configure ta salle</h2>
                <p style={{ color: subCol, fontSize: 13 }}>Remplis les infos et partage le code avec tes amis.</p>
              </div>

              <div style={{ background: cardBg, backdropFilter: "blur(24px)", border: cardBdr, borderRadius: 24, padding: "28px 24px", boxShadow: dark ? "0 24px 64px rgba(0,0,0,0.35)" : "0 8px 40px rgba(124,58,237,0.1)" }}>

                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: dark ? "rgba(239,68,68,0.12)" : "#fef2f2", border: "1px solid rgba(239,68,68,0.3)", color: dark ? "#fca5a5" : "#ef4444", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
                    ✕ {error}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

                  {/* Nom */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: subCol }}>Nom de la salle</label>
                    <input className="pr-input" type="text"
                      placeholder="Ex: Révision Bac avec les amis"
                      value={roomName}
                      onChange={e => setRoomName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                      autoFocus
                      style={inputStyle}
                    />
                  </div>

                  {/* Durée */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: subCol, display: "flex", alignItems: "center", gap: 5 }}>
                      <Timer size={13} /> Durée de la session
                    </label>

                    <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                      {/* Heures */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        <span style={{ fontSize: 11, color: subCol, textAlign: "center", fontWeight: 500 }}>Heures</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                          <button type="button" className="pr-counter"
                            onClick={() => setHeures(h => Math.max(0, h - 1))}
                            style={counterBtnStyle}>−</button>
                          <span style={{ fontSize: 32, fontWeight: 800, color: textCol, minWidth: 40, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{heures}</span>
                          <button type="button" className="pr-counter"
                            onClick={() => setHeures(h => Math.min(12, h + 1))}
                            style={counterBtnStyle}>+</button>
                        </div>
                      </div>

                      <div style={{ fontSize: 32, fontWeight: 700, color: subCol, paddingBottom: 6, flexShrink: 0 }}>:</div>

                      {/* Minutes */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        <span style={{ fontSize: 11, color: subCol, textAlign: "center", fontWeight: 500 }}>Minutes</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                          <button type="button" className="pr-counter"
                            onClick={() => setMinutes(m => m <= 0 ? 55 : m - 5)}
                            style={counterBtnStyle}>−</button>
                          <span style={{ fontSize: 32, fontWeight: 800, color: textCol, minWidth: 40, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{String(minutes).padStart(2, "0")}</span>
                          <button type="button" className="pr-counter"
                            onClick={() => setMinutes(m => m >= 55 ? 0 : m + 5)}
                            style={counterBtnStyle}>+</button>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, padding: "8px 14px", background: "rgba(124,58,237,0.08)", borderRadius: 10, border: "1px solid rgba(124,58,237,0.15)", textAlign: "center" }}>
                      {totalMinutes >= 5
                        ? `Session de ${heures > 0 ? `${heures}h ` : ""}${minutes > 0 ? `${minutes}min` : ""}`
                        : "Choisir une durée (minimum 5 min)"
                      }
                    </div>
                  </div>

                  {/* Participants */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: subCol, display: "flex", alignItems: "center", gap: 5 }}>
                    <Users size={13} /> Participants maximum
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                    <button type="button" className="pr-counter"
                    onClick={() => setMaxPers(p => Math.max(1, p - 1))}
                    style={{ ...counterBtnStyle, width: 44, height: 44, fontSize: 22, flexShrink: 0 }}>−</button>

                    <input
                    type="number"
                    min="1"
                    value={maxPers}
                    onChange={e => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1) setMaxPers(val);
                    }}
                    style={{
                        width: 90, height: 52, textAlign: "center",
                        fontSize: 28, fontWeight: 800, color: "#7c3aed",
                        background: inputBg, border: "2px solid rgba(124,58,237,0.3)",
                        borderRadius: 12, outline: "none",
                        fontFamily: "'DM Sans',sans-serif",
                        fontVariantNumeric: "tabular-nums",
                    }}
                    />

                    <button type="button" className="pr-counter"
                    onClick={() => setMaxPers(p => p + 1)}
                    style={{ ...counterBtnStyle, width: 44, height: 44, fontSize: 22, flexShrink: 0 }}>+</button>
                </div>

                <div style={{ textAlign: "center", fontSize: 12, color: subCol }}>
                    {maxPers === 1 ? "Toi seul"
                    : maxPers <= 5 ? `Toi + ${maxPers - 1} ami${maxPers > 2 ? "s" : ""} — petit groupe`
                    : maxPers <= 15 ? `${maxPers} participants — groupe classe`
                    : maxPers <= 50 ? `${maxPers} participants — grande classe`
                    : `${maxPers} participants — amphi`}
                </div>
                </div>
                  {/* Submit */}
                  <button type="button" className="pr-btn"
                    onClick={handleCreate}
                    disabled={!roomName.trim() || creating || totalMinutes < 5}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", background: roomName.trim() && totalMinutes >= 5 ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "rgba(124,58,237,0.3)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: roomName.trim() && totalMinutes >= 5 ? "pointer" : "not-allowed", transition: "all 0.25s", boxShadow: roomName.trim() && totalMinutes >= 5 ? "0 4px 20px rgba(124,58,237,0.35)" : "none", marginTop: 4 }}>
                    {creating ? "Création…" : <><Plus size={16} /> Créer la salle</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CREATED ── */}
          {step === "created" && createdRoom && (
            <div style={{ width: "100%", maxWidth: 460, animation: "prfadeUp 0.4s ease both" }}>
              <div style={{ background: cardBg, backdropFilter: "blur(24px)", border: cardBdr, borderRadius: 24, padding: "36px 28px", boxShadow: dark ? "0 24px 64px rgba(0,0,0,0.35)" : "0 8px 40px rgba(124,58,237,0.1)", textAlign: "center" }}>

                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "2px solid rgba(16,185,129,0.3)", display: "grid", placeItems: "center", margin: "0 auto 20px", animation: "prcheckBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                  <Check size={32} color="#10b981" />
                </div>

                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: textCol, marginBottom: 6 }}>
                  Salle créée !
                </h2>
                <p style={{ fontSize: 14, fontWeight: 600, color: textCol, marginBottom: 4 }}>
                  {createdRoom.name || roomName}
                </p>
                <p style={{ fontSize: 12, color: subCol, marginBottom: 28 }}>
                  {heures > 0 ? `${heures}h ` : ""}{minutes > 0 ? `${minutes}min` : ""} · {maxPers === 1 ? "Toi seul" : `max ${maxPers} personnes`}
                </p>

                <p style={{ fontSize: 12, fontWeight: 600, color: subCol, marginBottom: 12 }}>
                  Code à partager avec tes amis
                </p>

                {/* Code letters */}
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                  {(createdRoom.code || "NAJAHI").split("").map((c, i) => (
                    <div key={i} style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 50, height: 62,
                      background: "rgba(124,58,237,0.12)",
                      border: "2px solid rgba(124,58,237,0.3)",
                      borderRadius: 12,
                      fontSize: 26, fontWeight: 800, color: "#a78bfa",
                      fontFamily: "'DM Sans',sans-serif",
                      animation: `prcodeBounce 0.4s ${i * 0.07}s cubic-bezier(0.34,1.56,0.64,1) both`,
                    }}>{c}</div>
                  ))}
                </div>

                {/* Copy */}
                <button type="button" className="pr-copy"
                  onClick={copyCode}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 22px", background: copied ? "rgba(16,185,129,0.12)" : "rgba(124,58,237,0.1)", border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(124,58,237,0.2)"}`, borderRadius: 10, color: copied ? "#10b981" : "#a78bfa", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s", marginBottom: 24 }}>
                  {copied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier le code</>}
                </button>

                {/* Enter */}
                <button type="button" className="pr-btn"
                  onClick={() => navigate(`/app/study/room/${createdRoom.room_id}`)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.25s", boxShadow: "0 4px 20px rgba(124,58,237,0.35)", marginBottom: 12 }}>
                  <Users size={16} /> Entrer dans la salle <ArrowRight size={15} />
                </button>

                <button type="button"
                  onClick={() => { setStep("form"); setCreatedRoom(null); setRoomName(""); setHeures(0); setMinutes(25); setMaxPers(4); }}
                  style={{ fontSize: 12, color: subCol, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textDecoration: "underline" }}>
                  Créer une autre salle
                </button>
              </div>
            </div>
          )}

          {/* ── JOIN ── */}
          {step === "join" && (
            <div style={{ width: "100%", maxWidth: 420, animation: "prfadeUp 0.4s ease both" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, color: textCol, marginBottom: 6 }}>Rejoindre une salle</h2>
                <p style={{ color: subCol, fontSize: 13 }}>Entre le code partagé par ton ami.</p>
              </div>

              <div style={{ background: cardBg, backdropFilter: "blur(24px)", border: cardBdr, borderRadius: 24, padding: "28px 24px", boxShadow: dark ? "0 24px 64px rgba(0,0,0,0.35)" : "0 8px 40px rgba(124,58,237,0.1)" }}>

                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: dark ? "rgba(239,68,68,0.12)" : "#fef2f2", border: "1px solid rgba(239,68,68,0.3)", color: dark ? "#fca5a5" : "#ef4444", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
                    ✕ {error}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: subCol }}>Code de la salle</label>
                    <input className="pr-input" type="text"
                      placeholder="NAJAHI"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === "Enter") handleJoin(); }}
                      autoFocus maxLength={8}
                      style={{ ...inputStyle, textAlign: "center", fontSize: 28, fontWeight: 800, letterSpacing: "0.35em" }}
                    />
                  </div>

                  <button type="button" className="pr-btn"
                    onClick={handleJoin}
                    disabled={joinCode.trim().length < 4 || joining}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", background: joinCode.trim().length >= 4 ? "linear-gradient(135deg,#10b981,#34d399)" : "rgba(16,185,129,0.3)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: joinCode.trim().length >= 4 ? "pointer" : "not-allowed", transition: "all 0.25s", boxShadow: joinCode.trim().length >= 4 ? "0 4px 20px rgba(16,185,129,0.35)" : "none" }}>
                    {joining ? "Connexion…" : <><Hash size={16} /> Rejoindre la salle</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}