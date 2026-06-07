import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, KeyRound } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";

function ParticlesBackground({ dark }) {
  const particles = Array.from({ length: 16 }).map((_, i) => ({
    position: "absolute",
    width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
    borderRadius: "50%",
    background: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#818cf8" : "#10b981",
    left: `${5 + (i * 5.8) % 90}%`, top: `${5 + (i * 7.2) % 88}%`,
    opacity: dark ? 0.1 + (i % 5) * 0.06 : 0.04 + (i % 5) * 0.02,
    animation: `rpfloat${i % 4} ${3 + (i % 4)}s ease-in-out infinite`,
    animationDelay: `${i * 0.35}s`, pointerEvents: "none",
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {particles.map((s, i) => <div key={i} style={s} />)}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une majuscule", ok: /[A-Z]/.test(password) },
    { label: "Un chiffre", ok: /[0-9]/.test(password) },
    { label: "Un caractère spécial", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["#ef4444", "#f59e0b", "#10b981", "#10b981"];
  const labels = ["Très faible", "Faible", "Bon", "Fort"];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < score ? colors[score-1] : "rgba(255,255,255,0.1)", transition: "background 0.3s" }}/>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: score > 0 ? colors[score-1] : "rgba(255,255,255,0.3)", fontWeight: 600 }}>
          {score > 0 ? labels[score-1] : ""}
        </span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {checks.map((c, i) => (
            <span key={i} style={{ fontSize: 10, color: c.ok ? "#10b981" : "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 3 }}>
              {c.ok ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [logoError, setLogoError]       = useState(false);
  const [countdown, setCountdown]       = useState(5);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  useEffect(() => {
    if (!success) return;
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); navigate("/login"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) return setError("Token manquant — utilise le lien reçu par email.");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Lien invalide ou expiré.");
      setSuccess(true);
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  // ── Theme ──
  const bg      = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 45%,#0d1a2e 100%)" : "linear-gradient(135deg,#f0edff 0%,#e8e4ff 45%,#eef2ff 100%)";
  const cardBg  = dark ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.82)";
  const cardBdr = dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(124,58,237,0.12)";
  const cardSh  = dark ? "0 30px 90px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.08)" : "0 20px 60px rgba(124,58,237,0.1)";
  const textCol = dark ? "#fff" : "#1a1625";
  const subCol  = dark ? "rgba(255,255,255,0.4)" : "rgba(26,22,37,0.5)";
  const labCol  = dark ? "rgba(255,255,255,0.65)" : "rgba(26,22,37,0.65)";
  const inputBg = dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)";
  const inputBd = dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(124,58,237,0.15)";
  const inputCl = dark ? "#fff" : "#1a1625";

  const inputBase = {
    width: "100%", padding: "12px 44px 12px 40px",
    background: inputBg, border: inputBd, borderRadius: 12,
    fontSize: 14, color: inputCl, fontFamily: "'DM Sans',sans-serif",
    outline: "none", transition: "all 0.25s",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes rpfloat0{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
        @keyframes rpfloat1{0%,100%{transform:translate(0,0)}33%{transform:translate(10px,-16px)}66%{transform:translate(-8px,10px)}}
        @keyframes rpfloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-28px)}}
        @keyframes rpfloat3{0%,100%{transform:translate(0,0)}50%{transform:translate(14px,-10px)}}
        @keyframes rpblob1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,25px) scale(1.18)}}
        @keyframes rpblob2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,18px) scale(1.12)}}
        @keyframes rpCardIn{from{opacity:0;transform:translateY(40px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes rpBounce{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
        @keyframes rpPulse{0%,100%{box-shadow:0 0 6px rgba(16,185,129,0.7)}50%{box-shadow:0 0 14px rgba(16,185,129,1)}}
        @keyframes rpGlow{0%,100%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.3),0 0 16px rgba(124,58,237,0.4)}50%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.5),0 0 28px rgba(124,58,237,0.6)}}
        @keyframes rpShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
        @keyframes rpCountdown{from{stroke-dashoffset:0}to{stroke-dashoffset:125.6}}
        .rp-input:focus{border-color:#7c3aed !important;box-shadow:0 0 0 3px rgba(124,58,237,0.15) !important;}
        .rp-input::placeholder{color:${dark?"rgba(255,255,255,0.2)":"rgba(26,22,37,0.25)"};}
        .rp-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 30px rgba(124,58,237,0.45) !important;}
        .rp-btn:disabled{opacity:0.55;cursor:not-allowed;}
      `}</style>

      <div style={{ minHeight:"100vh", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden", transition:"background 0.5s ease" }}>

        {/* Blobs */}
        <div style={{ position:"absolute", top:"-120px", left:"-120px", width:"550px", height:"550px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(124,58,237,0.28)":"rgba(124,58,237,0.1)"} 0%,transparent 70%)`, filter:"blur(70px)", pointerEvents:"none", animation:"rpblob1 9s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-100px", right:"-100px", width:"450px", height:"450px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(16,185,129,0.18)":"rgba(16,185,129,0.07)"} 0%,transparent 70%)`, filter:"blur(70px)", pointerEvents:"none", animation:"rpblob2 11s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`linear-gradient(rgba(124,58,237,${dark?0.035:0.03}) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,${dark?0.035:0.03}) 1px,transparent 1px)`, backgroundSize:"42px 42px" }}/>
        <ParticlesBackground dark={dark} />

        <div style={{ position:"absolute", top:20, right:20, zIndex:20 }}>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:"430px", margin:"24px", background:cardBg, backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", border:cardBdr, borderRadius:"26px", padding:"40px 36px", boxShadow:cardSh, transition:"all 0.4s ease", animation:mounted?"rpCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both":"none" }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:5, animation:"rpGlow 3s ease-in-out infinite alternate", flexShrink:0 }}>
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
              <div style={{ marginBottom:24 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:dark?"rgba(124,58,237,0.15)":"rgba(124,58,237,0.08)", border:`1.5px solid rgba(124,58,237,0.25)`, display:"grid", placeItems:"center", marginBottom:16 }}>
                  <KeyRound size={22} color="#7c3aed"/>
                </div>
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:textCol, letterSpacing:"-0.5px", marginBottom:6 }}>
                  Nouveau mot de passe
                </h1>
                <p style={{ color:subCol, fontSize:13.5, lineHeight:1.6 }}>
                  Choisis un mot de passe sécurisé pour ton compte Najahi.
                </p>
              </div>

              {!token && (
                <div style={{ background:dark?"rgba(239,68,68,0.12)":"#fef2f2", border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444", borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:16 }}>
                  ⚠️ Token manquant — utilise le lien reçu par email.
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {error && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, background:dark?"rgba(239,68,68,0.12)":"#fef2f2", border:dark?"1px solid rgba(239,68,68,0.3)":"1px solid #fecaca", color:dark?"#fca5a5":"#ef4444", borderRadius:10, padding:"10px 14px", fontSize:13, animation:"rpShake 0.4s ease" }}>
                    ✕ {error}
                  </div>
                )}

                {/* New password */}
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:12.5, fontWeight:500, color:labCol }}>Nouveau mot de passe</label>
                  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                    <Lock size={14} style={{ position:"absolute", left:13, color:dark?"rgba(255,255,255,0.3)":"rgba(26,22,37,0.3)", pointerEvents:"none" }}/>
                    <input className="rp-input" type={showPass?"text":"password"}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 caractères" required autoFocus
                      style={inputBase}
                    />
                    <button type="button" onClick={() => setShowPass(v=>!v)}
                      style={{ position:"absolute", right:13, background:"none", border:"none", cursor:"pointer", color:dark?"rgba(255,255,255,0.3)":"rgba(26,22,37,0.3)", display:"flex", alignItems:"center" }}>
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm password */}
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:12.5, fontWeight:500, color:labCol }}>Confirmer le mot de passe</label>
                  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                    <Lock size={14} style={{ position:"absolute", left:13, color:dark?"rgba(255,255,255,0.3)":"rgba(26,22,37,0.3)", pointerEvents:"none" }}/>
                    <input className="rp-input" type={showConfirm?"text":"password"}
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Répète ton mot de passe" required
                      style={{ ...inputBase, borderColor: confirm && confirm !== password ? "#ef4444" : undefined }}
                    />
                    <button type="button" onClick={() => setShowConfirm(v=>!v)}
                      style={{ position:"absolute", right:13, background:"none", border:"none", cursor:"pointer", color:dark?"rgba(255,255,255,0.3)":"rgba(26,22,37,0.3)", display:"flex", alignItems:"center" }}>
                      {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p style={{ fontSize:11, color:"#ef4444", marginTop:2 }}>Les mots de passe ne correspondent pas</p>
                  )}
                  {confirm && confirm === password && password.length >= 8 && (
                    <p style={{ fontSize:11, color:"#10b981", marginTop:2 }}>✓ Les mots de passe correspondent</p>
                  )}
                </div>

                <button className="rp-btn" type="submit"
                  disabled={loading || !token || !password || !confirm || password !== confirm}
                  style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px 20px", background:loading?"rgba(124,58,237,0.5)":"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.25s", boxShadow:"0 4px 20px rgba(124,58,237,0.3)", marginTop:4 }}>
                  {loading ? (
                    <><div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Réinitialisation…</>
                  ) : (
                    <><KeyRound size={15}/> Réinitialiser le mot de passe</>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── SUCCESS ── */
            <div style={{ textAlign:"center", padding:"10px 0" }}>
              <div style={{ animation:"rpBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both", marginBottom:20 }}>
                <div style={{ width:88, height:88, borderRadius:"50%", background:dark?"rgba(16,185,129,0.12)":"#f0fdf4", border:"2px solid rgba(16,185,129,0.4)", display:"grid", placeItems:"center", margin:"0 auto" }}>
                  <CheckCircle size={40} color="#10b981"/>
                </div>
              </div>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:textCol, marginBottom:10 }}>
                Mot de passe mis à jour !
              </h3>
              <p style={{ color:subCol, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
                Ton mot de passe a été réinitialisé avec succès.<br/>
                Tu vas être redirigé vers la connexion dans <strong style={{ color:"#7c3aed" }}>{countdown}s</strong>.
              </p>

              {/* Countdown ring */}
              <svg width="60" height="60" style={{ transform:"rotate(-90deg)", margin:"0 auto 20px", display:"block" }}>
                <circle cx="30" cy="30" r="20" fill="none" stroke={dark?"rgba(255,255,255,0.08)":"rgba(124,58,237,0.1)"} strokeWidth="4"/>
                <circle cx="30" cy="30" r="20" fill="none" stroke="#7c3aed" strokeWidth="4"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (countdown / 5) * 125.6}
                  strokeLinecap="round"
                  style={{ transition:"stroke-dashoffset 1s linear" }}
                />
              </svg>

              <Link to="/login"
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", borderRadius:12, textDecoration:"none", fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 16px rgba(124,58,237,0.3)" }}>
                Se connecter maintenant
              </Link>
            </div>
          )}

          {!success && (
            <div style={{ marginTop:22, borderTop:dark?"1px solid rgba(255,255,255,0.07)":"1px solid rgba(124,58,237,0.08)", paddingTop:16 }}>
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
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"rpPulse 2s ease-in-out infinite" }}/>
            <span style={{ fontSize:11, color:dark?"rgba(255,255,255,0.22)":"rgba(26,22,37,0.3)", fontWeight:400 }}>
              Plateforme scolaire marocaine
            </span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}