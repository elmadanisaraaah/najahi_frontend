import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { ArrowLeft, Plus, Hash, Copy, Check, Users, Timer, ArrowRight, Globe, MapPin, School } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

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
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet]     = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  // Explore tab state
  const [exploreRooms,    setExploreRooms]    = useState([]);
  const [exploreLoading,  setExploreLoading]  = useState(false);
  const [exploreCategory, setExploreCategory] = useState("general");
  const [exploreTag,      setExploreTag]      = useState("");
  const [joiningRoom,     setJoiningRoom]     = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const fetchExploreRooms = async (cat = exploreCategory, tag = exploreTag) => {
    setExploreLoading(true);
    try {
      const params = new URLSearchParams({ category: cat });
      if (tag.trim()) params.set("tag", tag.trim());
      const res = await fetch(`${API_URL}/api/study/rooms?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setExploreRooms(await res.json());
    } catch {} finally { setExploreLoading(false); }
  };

  const handleJoinStudyRoom = async (roomId) => {
    setJoiningRoom(roomId);
    try {
      const res = await fetch(`${API_URL}/api/study/rooms/${roomId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Impossible de rejoindre"); return; }
      navigate(`/app/servers/${roomId}`);
    } catch { setError("Erreur réseau"); }
    finally { setJoiningRoom(null); }
  };
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const totalMinutes = heures * 60 + minutes;

  const handleCreate = async () => {
    if (!roomName.trim()) { setError("Donne un nom à ta salle"); return; }
    if (totalMinutes < 5) { setError("La durée minimum est 5 minutes"); return; }

    const token = accessToken || localStorage.getItem("najahi_token");
    if (!token) { setError("Tu n'es pas connecté — reconnecte-toi"); return; }

    setCreating(true); setError("");
    try {
      const res = await fetch(API_URL + "/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: roomName.trim(),
          total_minutes: totalMinutes,
          max_participants: maxPers,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur création"); return; }
      const roomId = data.room_id;
      if (!roomId) { setError("Erreur serveur: ID de salle manquant"); return; }
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
      const res = await fetch(API_URL + "/api/rooms/join", {
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
        <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", height: isMobile ? 56 : isTablet ? 60 : "auto", padding: isMobile ? "0 16px" : isTablet ? "0 20px" : "12px 24px", overflow: "hidden", background: navBg, backdropFilter: "blur(18px)", borderBottom: `1px solid ${navBdr}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button"
              onClick={() => {
                if (step === "choice") navigate("/app/study");
                else if (step === "created") setStep("form");
                else setStep("choice");
                setError("");
              }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.06)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(124,58,237,0.15)", borderRadius: 8, color: subCol, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              <ArrowLeft size={13} /> {step === "choice" ? "Study" : "Retour"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: isMobile ? 28 : 34, height: isMobile ? 28 : 34, borderRadius: 9, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 4, animation: "prglow 3s ease-in-out infinite alternate" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16 }}>
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
                <div className="pr-choice"
                  onClick={() => { setStep("explore"); setExploreCategory("general"); setExploreTag(""); fetchExploreRooms("general", ""); setError(""); }}
                  style={{ background: cardBg, backdropFilter: "blur(20px)", border: cardBdr, borderRadius: 20, padding: "28px 24px", cursor: "pointer", transition: "all 0.3s", boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(124,58,237,0.07)", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(245,158,11,0.12)", border: "1.5px solid rgba(245,158,11,0.2)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                    <Globe size={24} color="#f59e0b" />
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: textCol, marginBottom: 6 }}>Explorer</h3>
                  <p style={{ fontSize: 12, color: subCol, lineHeight: 1.6 }}>Rejoins un groupe par ville ou lycée.</p>
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
                  onClick={() => createdRoom?.room_id && navigate(`/app/study/room/${createdRoom.room_id}`)}
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

          {/* ── EXPLORE ── */}
          {step === "explore" && (
            <div style={{ width: "100%", maxWidth: 680, animation: "prfadeUp 0.4s ease both" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, color: textCol, marginBottom: 6 }}>Explorer les groupes d'étude</h2>
                <p style={{ color: subCol, fontSize: 13 }}>Rejoins un groupe organisé par ville ou lycée.</p>
              </div>

              {/* Category chips */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
                {[["general", <Globe size={13} />, "Général"], ["ville", <MapPin size={13} />, "Par ville"], ["lycee", <School size={13} />, "Par lycée"]].map(([val, icon, label]) => (
                  <button key={val} type="button"
                    onClick={() => { setExploreCategory(val); setExploreTag(""); fetchExploreRooms(val, ""); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 99, border: exploreCategory === val ? "none" : `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.2)"}`, background: exploreCategory === val ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "transparent", color: exploreCategory === val ? "#fff" : subCol, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* Tag filter for ville/lycee */}
              {(exploreCategory === "ville" || exploreCategory === "lycee") && (
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <input type="text"
                    placeholder={exploreCategory === "ville" ? "Filtrer par ville…" : "Filtrer par lycée…"}
                    value={exploreTag}
                    onChange={e => setExploreTag(e.target.value)}
                    style={{ flex: 1, padding: "10px 14px", background: inputBg, border: inputBd, borderRadius: 10, fontSize: 14, color: textCol, fontFamily: "'DM Sans',sans-serif", outline: "none" }}
                  />
                  <button type="button" onClick={() => fetchExploreRooms(exploreCategory, exploreTag)}
                    style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    Filtrer
                  </button>
                </div>
              )}

              {exploreLoading ? (
                <div style={{ textAlign: "center", padding: 48, color: subCol, fontSize: 14 }}>Chargement…</div>
              ) : exploreRooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px" }}>
                  <Globe size={36} style={{ marginBottom: 12, color: subCol, opacity: 0.4 }} />
                  <div style={{ fontSize: 15, fontWeight: 600, color: textCol, marginBottom: 6 }}>Aucun groupe trouvé</div>
                  <div style={{ fontSize: 12, color: subCol }}>Crée le premier groupe de cette catégorie !</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {exploreRooms.map(room => (
                    <div key={room.id} style={{ background: cardBg, backdropFilter: "blur(20px)", border: cardBdr, borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, boxShadow: dark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 4px 16px rgba(124,58,237,0.06)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: textCol, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.nom}</div>
                          {room.tag && (
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(245,158,11,0.12)", color: "#f59e0b", fontWeight: 700, border: "1px solid rgba(245,158,11,0.2)", flexShrink: 0 }}>
                              {room.tag}
                            </span>
                          )}
                        </div>
                        {room.sujet && <div style={{ fontSize: 12, color: subCol, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.sujet}</div>}
                        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                          <span style={{ fontSize: 11, color: subCol, display: "flex", alignItems: "center", gap: 4 }}>
                            <Users size={10} /> {room.participant_count || 0}/{room.max_participants}
                          </span>
                          <span style={{ fontSize: 11, color: subCol }}>🍅 {room.pomodoro_work}m</span>
                        </div>
                      </div>
                      <button type="button"
                        onClick={() => handleJoinStudyRoom(room.id)}
                        disabled={joiningRoom === room.id}
                        style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: joiningRoom === room.id ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>
                        {joiningRoom === room.id ? "…" : "Rejoindre"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
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