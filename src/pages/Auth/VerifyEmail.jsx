import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck, ArrowLeft, RefreshCw, CheckCircle, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";

const RESEND_DELAY = 60;

function ParticlesBackground({ dark }) {
  const particles = Array.from({ length: 16 }).map((_, i) => ({
    position: "absolute",
    width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
    borderRadius: "50%",
    background: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#818cf8" : "#10b981",
    left: `${5 + (i * 5.1) % 90}%`, top: `${5 + (i * 7.7) % 88}%`,
    opacity: dark ? 0.12 + (i % 5) * 0.07 : 0.05 + (i % 5) * 0.03,
    animation: `vefloat${i % 4} ${3 + (i % 4)}s ease-in-out infinite`,
    animationDelay: `${i * 0.35}s`, pointerEvents: "none",
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {particles.map((s, i) => <div key={i} style={s} />)}
    </div>
  );
}

const API_URL = import.meta.env.VITE_API_URL || "";

export default function VerifyEmail() {
  const { theme } = useTheme();
  const location  = useLocation();
  const navigate  = useNavigate();
  const dark      = theme === "dark";

  const email = location.state?.email || localStorage.getItem("najahi_email") || "";
  console.log("EMAIL:", email, "STATE:", location.state);

  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [timer, setTimer]       = useState(0);
  const [mounted, setMounted]   = useState(false);
  const [logoError, setLogoError] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(v => v <= 1 ? (clearInterval(t), 0) : v - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  useEffect(() => {
    if (success) {
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [success]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto submit when all filled
    if (value && index === 5) {
      const code = [...newOtp.slice(0, 5), value.slice(-1)].join("");
      if (code.length === 6) handleVerify(code);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    const finalCode = code || otp.join("");
    if (finalCode.length !== 6) return setError("Entre les 6 chiffres du code.");
    if (!email) return setError("Email manquant — retourne à l'inscription.");

    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL + "/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: finalCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Code invalide.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await fetch(API_URL + "/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setTimer(RESEND_DELAY);
    } catch {}
    setResending(false);
  };

  // ── Theme ──
  const bg      = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 45%,#0d1a2e 100%)" : "linear-gradient(135deg,#f0edff 0%,#e8e4ff 45%,#eef2ff 100%)";
  const cardBg  = dark ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.82)";
  const cardBdr = dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(124,58,237,0.12)";
  const cardSh  = dark ? "0 30px 90px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.08)" : "0 20px 60px rgba(124,58,237,0.1)";
  const textCol = dark ? "#fff" : "#1a1625";
  const subCol  = dark ? "rgba(255,255,255,0.4)" : "rgba(26,22,37,0.5)";
  const timerColor = timer > 40 ? "#10b981" : timer > 20 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes vefloat0{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
        @keyframes vefloat1{0%,100%{transform:translate(0,0)}33%{transform:translate(10px,-16px)}66%{transform:translate(-8px,10px)}}
        @keyframes vefloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-28px)}}
        @keyframes vefloat3{0%,100%{transform:translate(0,0)}50%{transform:translate(14px,-10px)}}
        @keyframes veblob1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,25px) scale(1.18)}}
        @keyframes veblob2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,18px) scale(1.12)}}
        @keyframes veCardIn{from{opacity:0;transform:translateY(40px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes veBounce{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
        @keyframes vePulse{0%,100%{box-shadow:0 0 6px rgba(16,185,129,0.7)}50%{box-shadow:0 0 14px rgba(16,185,129,1)}}
        @keyframes veGlow{0%,100%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.3),0 0 16px rgba(124,58,237,0.4)}50%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.5),0 0 28px rgba(124,58,237,0.6)}}
        @keyframes veShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes veSpin{to{transform:rotate(360deg)}}
        .otp-input:focus{border-color:#7c3aed !important;box-shadow:0 0 0 3px rgba(124,58,237,0.2) !important;outline:none;transform:scale(1.05);}
        .ve-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 30px rgba(124,58,237,0.45) !important;}
        .ve-btn:disabled{opacity:0.55;cursor:not-allowed;}
        .ve-resend:hover:not(:disabled){background:rgba(124,58,237,0.1) !important;color:#7c3aed !important;}
      `}</style>

      <div style={{ minHeight:"100vh", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden", transition:"background 0.5s ease" }}>

        {/* Blobs */}
        <div style={{ position:"absolute", top:"-120px", left:"-120px", width:"550px", height:"550px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(124,58,237,0.28)":"rgba(124,58,237,0.1)"} 0%,transparent 70%)`, filter:"blur(70px)", pointerEvents:"none", animation:"veblob1 9s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-100px", right:"-100px", width:"450px", height:"450px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(16,185,129,0.18)":"rgba(16,185,129,0.07)"} 0%,transparent 70%)`, filter:"blur(70px)", pointerEvents:"none", animation:"veblob2 11s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`linear-gradient(rgba(124,58,237,${dark?0.035:0.03}) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,${dark?0.035:0.03}) 1px,transparent 1px)`, backgroundSize:"42px 42px" }}/>
        <ParticlesBackground dark={dark} />

        <div style={{ position:"absolute", top:20, right:20, zIndex:20 }}>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:"420px", margin:"24px", background:cardBg, backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", border:cardBdr, borderRadius:"26px", padding:"40px 36px", boxShadow:cardSh, transition:"all 0.4s ease", animation:mounted?"veCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both":"none" }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:5, animation:"veGlow 3s ease-in-out infinite alternate", flexShrink:0 }}>
              {!logoError
                ? <img src="/najahi_logo.png" alt="N" style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={() => setLogoError(true)}/>
                : <span style={{ color:"#7c3aed", fontSize:20, fontWeight:900, fontFamily:"'Fraunces',serif" }}>N</span>
              }
            </div>
            <div>
              <div style={{ fontSize:19, fontWeight:700, color:textCol, fontFamily:"'Fraunces',serif", letterSpacing:"-0.3px" }}>Najahi</div>
              <div style={{ fontSize:10, color:subCol, letterSpacing:"0.3px" }}>Plateforme scolaire marocaine</div>
            </div>
          </div>

          {!success ? (
            <>
              {/* Header */}
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:dark?"rgba(124,58,237,0.12)":"rgba(124,58,237,0.08)", border:"2px solid rgba(124,58,237,0.2)", display:"grid", placeItems:"center", margin:"0 auto 18px" }}>
                  <MailCheck size={32} color="#7c3aed"/>
                </div>
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:textCol, letterSpacing:"-0.4px", marginBottom:8 }}>
                  Vérifie ton email
                </h1>
                <p style={{ color:subCol, fontSize:13.5, lineHeight:1.7 }}>
                  On a envoyé un code à 6 chiffres à<br/>
                  <strong style={{ color:"#a78bfa" }}>{email || "ton adresse email"}</strong>
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display:"flex", alignItems:"center", gap:8, background:dark?"rgba(239,68,68,0.12)":"#fef2f2", border:dark?"1px solid rgba(239,68,68,0.3)":"1px solid #fecaca", color:dark?"#fca5a5":"#ef4444", borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:16, animation:"veShake 0.4s ease" }}>
                  <X size={13} /> {error}
                </div>
              )}

              {/* OTP inputs */}
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:24 }} onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    style={{
                      width:48, height:56,
                      textAlign:"center",
                      fontSize:22, fontWeight:700,
                      color:textCol,
                      background:dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.9)",
                      border:digit
                        ? "1.5px solid #7c3aed"
                        : dark?"1.5px solid rgba(255,255,255,0.1)":"1.5px solid rgba(124,58,237,0.15)",
                      borderRadius:12,
                      outline:"none",
                      fontFamily:"'DM Sans',sans-serif",
                      transition:"all 0.2s",
                      boxShadow:digit?`0 0 0 3px rgba(124,58,237,0.15)`:"none",
                    }}
                  />
                ))}
              </div>

              {/* Verify button */}
              <button type="button" className="ve-btn"
                onClick={() => handleVerify()}
                disabled={otp.join("").length !== 6 || loading}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px 20px", background:otp.join("").length===6?"linear-gradient(135deg,#7c3aed,#a78bfa)":"rgba(124,58,237,0.3)", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:otp.join("").length===6?"pointer":"not-allowed", transition:"all 0.25s", boxShadow:otp.join("").length===6?"0 4px 20px rgba(124,58,237,0.3)":"none", marginBottom:16 }}>
                {loading
                  ? <><div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"veSpin 0.8s linear infinite" }}/> Vérification…</>
                  : "Vérifier mon email"
                }
              </button>

              {/* Timer */}
              {timer > 0 && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:12, padding:"8px 16px", background:dark?"rgba(255,255,255,0.04)":"rgba(124,58,237,0.04)", borderRadius:10, border:dark?"1px solid rgba(255,255,255,0.07)":"1px solid rgba(124,58,237,0.08)" }}>
                  <svg width="28" height="28" style={{ flexShrink:0, transform:"rotate(-90deg)" }}>
                    <circle cx="14" cy="14" r="10" fill="none" stroke={dark?"rgba(255,255,255,0.08)":"rgba(124,58,237,0.1)"} strokeWidth="3"/>
                    <circle cx="14" cy="14" r="10" fill="none" stroke={timerColor} strokeWidth="3"
                      strokeDasharray="62.8"
                      strokeDashoffset={62.8 - (timer / RESEND_DELAY) * 62.8}
                      strokeLinecap="round"
                      style={{ transition:"stroke-dashoffset 1s linear, stroke 0.5s" }}
                    />
                  </svg>
                  <span style={{ fontSize:12, color:subCol }}>
                    Renvoyer dans <strong style={{ color:timerColor }}>{timer}s</strong>
                  </span>
                </div>
              )}

              {/* Resend */}
              <button type="button" className="ve-resend"
                onClick={handleResend}
                disabled={timer > 0 || resending}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px", background:"transparent", border:dark?"1.5px solid rgba(255,255,255,0.09)":"1.5px solid rgba(124,58,237,0.12)", borderRadius:12, color:subCol, fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif", cursor:timer>0||resending?"not-allowed":"pointer", transition:"all 0.2s", opacity:timer>0?0.5:1 }}>
                <RefreshCw size={13} style={{ animation:resending?"veSpin 1s linear infinite":"none" }}/>
                {resending?"Envoi…":"Renvoyer le code"}
              </button>
            </>
          ) : (
            /* ── Success ── */
            <div style={{ textAlign:"center", padding:"10px 0" }}>
              <div style={{ animation:"veBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both", marginBottom:20 }}>
                <div style={{ width:88, height:88, borderRadius:"50%", background:dark?"rgba(16,185,129,0.12)":"#f0fdf4", border:"2px solid rgba(16,185,129,0.4)", display:"grid", placeItems:"center", margin:"0 auto" }}>
                  <CheckCircle size={40} color="#10b981"/>
                </div>
              </div>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:textCol, marginBottom:10 }}>
                Email vérifié !
              </h3>
              <p style={{ color:subCol, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
                Ton compte Najahi est maintenant actif.<br/>
                Tu vas être redirigé vers la connexion…
              </p>
              <Link to="/login"
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", borderRadius:12, textDecoration:"none", fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 16px rgba(124,58,237,0.3)" }}>
                Se connecter
              </Link>
            </div>
          )}

          {!success && (
            <div style={{ marginTop:20, borderTop:dark?"1px solid rgba(255,255,255,0.07)":"1px solid rgba(124,58,237,0.08)", paddingTop:16 }}>
              <Link to="/login"
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px", borderRadius:10, color:subCol, textDecoration:"none", fontSize:13, fontWeight:500, transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color=dark?"#fff":"#1a1625"; e.currentTarget.style.background=dark?"rgba(255,255,255,0.05)":"rgba(124,58,237,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.color=subCol; e.currentTarget.style.background="transparent"; }}
              >
                <ArrowLeft size={14}/> Retour à la connexion
              </Link>
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:16 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"vePulse 2s ease-in-out infinite" }}/>
            <span style={{ fontSize:11, color:dark?"rgba(255,255,255,0.22)":"rgba(26,22,37,0.3)", fontWeight:400 }}>
              Plateforme scolaire marocaine
            </span>
          </div>
        </div>
      </div>
    </>
  );
}