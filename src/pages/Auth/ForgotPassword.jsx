import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, ArrowRight, ArrowLeft, CheckCircle, ChevronDown, RefreshCw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { useAuth } from "../../context/AuthContext";

const COUNTRY_CODES = [
  { code: "+212", iso: "ma", name: "Maroc" },
  { code: "+33",  iso: "fr", name: "France" },
  { code: "+32",  iso: "be", name: "Belgique" },
  { code: "+41",  iso: "ch", name: "Suisse" },
  { code: "+1",   iso: "us", name: "USA" },
  { code: "+44",  iso: "gb", name: "UK" },
  { code: "+34",  iso: "es", name: "Espagne" },
  { code: "+49",  iso: "de", name: "Allemagne" },
  { code: "+216", iso: "tn", name: "Tunisie" },
  { code: "+213", iso: "dz", name: "Algérie" },
  { code: "+20",  iso: "eg", name: "Égypte" },
  { code: "+971", iso: "ae", name: "Émirats" },
  { code: "+966", iso: "sa", name: "Arabie Saoudite" },
];

const RESEND_DELAY = 60; // seconds

function ParticlesBackground({ dark }) {
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    position: "absolute",
    width: `${2 + (i % 3)}px`,
    height: `${2 + (i % 3)}px`,
    borderRadius: "50%",
    background: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#818cf8" : "#10b981",
    left: `${5 + (i * 5.1) % 90}%`,
    top: `${5 + (i * 7.7) % 88}%`,
    opacity: dark ? 0.12 + (i % 5) * 0.07 : 0.05 + (i % 5) * 0.03,
    animation: `float${i % 4} ${3 + (i % 4)}s ease-in-out infinite`,
    animationDelay: `${i * 0.35}s`,
    pointerEvents: "none",
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {particles.map((style, i) => <div key={i} style={style} />)}
    </div>
  );
}

function TimerRing({ seconds, total }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = (seconds / total) * circ;
  const pct = Math.round((seconds / total) * 100);
  const color = seconds > 30 ? "#10b981" : seconds > 15 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 16px" }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ - progress}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1, fontFamily: "'DM Sans',sans-serif" }}>
          {seconds}
        </span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.3px" }}>sec</span>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === "dark";

  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+212");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const timerRef = useRef(null);
  const countryRef = useRef();

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // Auto-fill from stored user info
  useEffect(() => {
    const storedEmail = localStorage.getItem("najahi_email") || user?.email || "";
    const storedPhone = localStorage.getItem("najahi_phone") || user?.phone_number || "";
    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) {
      const match = COUNTRY_CODES.find(c => storedPhone.startsWith(c.code));
      if (match) {
        setSelectedCountry(match);
        setCountryCode(match.code);
        setPhone(storedPhone.replace(match.code, ""));
      }
    }
  }, [user]);

  // Close country dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (countryRef.current && !countryRef.current.contains(e.target)) setCountryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Timer countdown
  const startTimer = () => {
    setTimer(RESEND_DELAY);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Theme tokens ──
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
  const iconCl  = dark ? "rgba(255,255,255,0.3)" : "rgba(26,22,37,0.3)";

  const inputStyle = {
    width:"100%", padding:"12px 12px 12px 40px",
    background:inputBg, border:inputBd, borderRadius:12,
    fontSize:14, color:inputCl, fontFamily:"'DM Sans',sans-serif",
    transition:"all 0.25s", outline:"none",
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    if (method === "email" && (!email || !/\S+@\S+\.\S+/.test(email)))
      return setError("Adresse email invalide");
    if (method === "sms" && !phone)
      return setError("Numéro de téléphone requis");

    setLoading(true);
    try {
      const body = method === "email"
        ? { email }
        : { phone: `${countryCode}${phone.replace(/^0/, "")}`, method: "sms" };

      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSent(true);
      setResendCount(c => c + 1);
      startTimer();
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    await handleSubmit(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes float0{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-22px) scale(1.15)}}
        @keyframes float1{0%,100%{transform:translate(0,0)}33%{transform:translate(10px,-16px)}66%{transform:translate(-8px,10px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-28px)}}
        @keyframes float3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(14px,-10px) scale(1.2)}}
        @keyframes blob1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,25px) scale(1.18)}}
        @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,18px) scale(1.12)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(40px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes checkBounce{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.2) rotate(10deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 6px rgba(16,185,129,0.7)}50%{box-shadow:0 0 14px rgba(16,185,129,1)}}
        @keyframes resendPop{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
        .fp-input:focus{border-color:#7c3aed !important;box-shadow:0 0 0 3px rgba(124,58,237,0.15) !important;}
        .fp-input::placeholder{color:${dark?"rgba(255,255,255,0.2)":"rgba(26,22,37,0.25)"};}
        .fp-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 30px rgba(124,58,237,0.45) !important;}
        .fp-btn:disabled{opacity:0.55;cursor:not-allowed;}
        .resend-btn:hover{transform:scale(1.02);}
      `}</style>

      <div style={{ minHeight:"100vh", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden", transition:"background 0.5s ease" }}>

        {/* Blobs */}
        <div style={{ position:"absolute", top:"-120px", left:"-120px", width:"550px", height:"550px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(124,58,237,0.28)":"rgba(124,58,237,0.1)"} 0%,transparent 70%)`, filter:"blur(70px)", pointerEvents:"none", animation:"blob1 9s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-100px", right:"-100px", width:"450px", height:"450px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(16,185,129,0.18)":"rgba(16,185,129,0.07)"} 0%,transparent 70%)`, filter:"blur(70px)", pointerEvents:"none", animation:"blob2 11s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`linear-gradient(rgba(124,58,237,${dark?0.035:0.03}) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,${dark?0.035:0.03}) 1px,transparent 1px)`, backgroundSize:"42px 42px" }}/>

        <ParticlesBackground dark={dark} />

        <div style={{ position:"absolute", top:20, right:20, zIndex:20 }}>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:"420px", margin:"24px", background:cardBg, backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", border:cardBdr, borderRadius:"26px", padding:"40px 36px", boxShadow:cardSh, transition:"all 0.4s ease", animation: mounted?"cardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both":"none" }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:5, boxShadow:"0 0 0 1.5px rgba(124,58,237,0.3),0 0 18px rgba(124,58,237,0.4)", flexShrink:0 }}>
              {!logoError ? (
                <img src="/najahi_logo.png" alt="Najahi" style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={() => setLogoError(true)}/>
              ) : (
                <span style={{ color:"#7c3aed", fontSize:20, fontWeight:900, fontFamily:"'Fraunces',serif" }}>N</span>
              )}
            </div>
            <div>
              <div style={{ fontSize:19, fontWeight:700, color:textCol, fontFamily:"'Fraunces',serif", letterSpacing:"-0.3px" }}>Najahi</div>
              <div style={{ fontSize:10, color:subCol, letterSpacing:"0.3px" }}>Plateforme scolaire marocaine</div>
            </div>
          </div>

          {!sent ? (
            <>
              <div style={{ marginBottom:22 }}>
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:25, fontWeight:700, color:textCol, letterSpacing:"-0.5px", marginBottom:6 }}>
                  Mot de passe oublié ?
                </h1>
                <p style={{ color:subCol, fontSize:13.5, lineHeight:1.6 }}>
                  On t'envoie un lien ou un SMS pour récupérer ton accès.
                </p>
              </div>

              {/* Method toggle */}
              <div style={{ display:"flex", gap:6, marginBottom:18, background:dark?"rgba(255,255,255,0.05)":"rgba(124,58,237,0.05)", borderRadius:12, padding:4 }}>
                {[
                  { key:"email", label:"Par email",  icon:<Mail size={13}/> },
                  { key:"sms",   label:"Par SMS",     icon:<Phone size={13}/> },
                ].map(tab => (
                  <button key={tab.key} type="button"
                    onClick={() => { setMethod(tab.key); setError(""); }}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 12px", border:"none", borderRadius:9, fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", background: method===tab.key?(dark?"rgba(124,58,237,0.45)":"#7c3aed"):"transparent", color: method===tab.key?"#fff":dark?"rgba(255,255,255,0.5)":"rgba(26,22,37,0.5)", boxShadow: method===tab.key?"0 2px 12px rgba(124,58,237,0.35)":"none", transition:"all 0.2s", cursor:"pointer" }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {error && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, background:dark?"rgba(239,68,68,0.12)":"#fef2f2", border:dark?"1px solid rgba(239,68,68,0.3)":"1px solid #fecaca", color:dark?"#fca5a5":"#ef4444", borderRadius:10, padding:"10px 14px", fontSize:13, animation:"shake 0.4s ease" }}>
                    ✕ {error}
                  </div>
                )}

                {method === "email" ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:12.5, fontWeight:500, color:labCol }}>Adresse email</label>
                    <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                      <Mail size={14} style={{ position:"absolute", left:13, color:iconCl, pointerEvents:"none" }}/>
                      <input className="fp-input" type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="exemple@email.com" required autoFocus
                        style={inputStyle}
                      />
                    </div>
                    <p style={{ fontSize:11.5, color:subCol }}>
                      Saisi automatiquement depuis ton compte.
                    </p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontSize:12.5, fontWeight:500, color:labCol }}>Numéro de téléphone</label>
                    <div style={{ display:"flex", gap:8 }} ref={countryRef}>
                      <div style={{ position:"relative", flexShrink:0 }}>
                        <button type="button" onClick={() => setCountryOpen(v => !v)}
                          style={{ display:"flex", alignItems:"center", gap:7, height:46, padding:"0 12px", border:inputBd, borderRadius:12, background:inputBg, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, color:"#7c3aed", transition:"all 0.2s", whiteSpace:"nowrap" }}>
                          <img src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} alt="" style={{ width:22, height:15, objectFit:"cover", borderRadius:3, boxShadow:"0 1px 3px rgba(0,0,0,0.15)" }} onError={e => e.target.style.display="none"}/>
                          <span>{selectedCountry.code}</span>
                          <ChevronDown size={11} style={{ opacity:0.5 }}/>
                        </button>
                        {countryOpen && (
                          <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:200, background:dark?"#1a1035":"#fff", border:dark?"1.5px solid rgba(255,255,255,0.1)":"1.5px solid #e8e4de", borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.18)", minWidth:210, maxHeight:240, overflowY:"auto", padding:6 }}>
                            {COUNTRY_CODES.map(c => (
                              <button key={c.code} type="button"
                                onClick={() => { setSelectedCountry(c); setCountryCode(c.code); setCountryOpen(false); }}
                                style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 10px", border:"none", borderRadius:8, background:selectedCountry.code===c.code?"rgba(124,58,237,0.12)":"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                                onMouseEnter={e => e.currentTarget.style.background="rgba(124,58,237,0.08)"}
                                onMouseLeave={e => e.currentTarget.style.background=selectedCountry.code===c.code?"rgba(124,58,237,0.12)":"transparent"}
                              >
                                <img src={`https://flagcdn.com/w40/${c.iso}.png`} alt={c.name} style={{ width:22, height:15, objectFit:"cover", borderRadius:3 }} onError={e => e.target.style.display="none"}/>
                                <span style={{ flex:1, fontSize:13, color:dark?"rgba(255,255,255,0.8)":"#1a1625", fontWeight:500 }}>{c.name}</span>
                                <span style={{ fontSize:12, color:"#7c3aed", fontWeight:700 }}>{c.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ flex:1, position:"relative", display:"flex", alignItems:"center" }}>
                        <Phone size={14} style={{ position:"absolute", left:13, color:iconCl, pointerEvents:"none" }}/>
                        <input className="fp-input" type="tel" value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="6XX XXX XXX" required
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    {phone && (
                      <div style={{ fontSize:11, color:subCol, paddingLeft:4, display:"flex", alignItems:"center", gap:4 }}>
                        <Phone size={10}/> {countryCode} {phone}
                      </div>
                    )}
                    <p style={{ fontSize:11.5, color:subCol }}>
                      Numéro récupéré depuis ton compte. Un SMS sera envoyé.
                    </p>
                  </div>
                )}

                <button className="fp-btn" type="submit" disabled={loading}
                  style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px 20px", background:loading?"rgba(124,58,237,0.5)":"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:loading?"not-allowed":"pointer", transition:"all 0.25s", boxShadow:"0 4px 20px rgba(124,58,237,0.3)", marginTop:4 }}>
                  <span>{loading?"Envoi…":method==="email"?"Envoyer le lien de réinitialisation":"Envoyer le SMS"}</span>
                  {!loading && <ArrowRight size={16}/>}
                </button>
              </form>
            </>
          ) : (
            /* ── SUCCESS STATE ── */
            <div style={{ textAlign:"center", animation:"fadeUp 0.4s ease both" }}>

              {/* Animated check */}
              <div style={{ animation:"checkBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both", marginBottom:16 }}>
                <div style={{ width:80, height:80, borderRadius:"50%", background:dark?"rgba(16,185,129,0.12)":"#f0fdf4", border:"2px solid rgba(16,185,129,0.4)", display:"grid", placeItems:"center", margin:"0 auto" }}>
                  <CheckCircle size={36} color="#10b981"/>
                </div>
              </div>

              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:textCol, marginBottom:10 }}>
                {method==="email" ? "Email envoyé !" : "SMS envoyé !"}
              </h3>
              <p style={{ color:subCol, fontSize:13.5, lineHeight:1.7, marginBottom:6 }}>
                {method==="email" ? (
                  <>Lien envoyé à <strong style={{ color:"#a78bfa" }}>{email}</strong>.<br/>Vérifie ta boîte et tes spams.</>
                ) : (
                  <>SMS envoyé au <strong style={{ color:"#a78bfa" }}>{countryCode} {phone}</strong>.<br/>Le code expire dans <strong style={{ color:"#f59e0b" }}>10 minutes</strong>.</>
                )}
              </p>

              {/* Timer ring */}
              {timer > 0 && (
                <div style={{ margin:"20px 0 8px" }}>
                  <TimerRing seconds={timer} total={RESEND_DELAY} />
                  <p style={{ fontSize:12, color:subCol }}>
                    Renvoyer dans <strong style={{ color: timer > 30 ? "#10b981" : timer > 15 ? "#f59e0b" : "#ef4444" }}>{timer}s</strong>
                  </p>
                </div>
              )}

              {/* Resend button */}
              <button type="button" className="resend-btn"
                onClick={handleResend}
                disabled={timer > 0 || loading}
                style={{
                  display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
                  padding:"12px 28px", marginTop: timer > 0 ? 8 : 20,
                  background: timer > 0
                    ? dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"
                    : "linear-gradient(135deg,#7c3aed,#a78bfa)",
                  border: timer > 0
                    ? dark?"1.5px solid rgba(255,255,255,0.1)":"1.5px solid rgba(124,58,237,0.15)"
                    : "none",
                  borderRadius:12,
                  color: timer > 0 ? subCol : "#fff",
                  fontSize:14, fontWeight:600,
                  fontFamily:"'DM Sans',sans-serif",
                  cursor: timer > 0 ? "not-allowed" : "pointer",
                  transition:"all 0.3s",
                  boxShadow: timer > 0 ? "none" : "0 4px 20px rgba(124,58,237,0.35)",
                  animation: timer === 0 && resendCount > 0 ? "resendPop 0.4s ease" : "none",
                }}>
                <RefreshCw size={14} style={{ animation: loading?"spin 1s linear infinite":"none" }}/>
                {loading ? "Renvoi…" : timer > 0 ? `Renvoyer dans ${timer}s` : `Renvoyer le ${method==="email"?"lien":"SMS"}`}
              </button>

              {resendCount > 1 && (
                <p style={{ fontSize:11.5, color:subCol, marginTop:10 }}>
                  Envoyé {resendCount} fois — vérifie tes spams ou contacte le support.
                </p>
              )}
            </div>
          )}

          {/* Back */}
          <div style={{ marginTop:24, borderTop:dark?"1px solid rgba(255,255,255,0.07)":"1px solid rgba(124,58,237,0.08)", paddingTop:18 }}>
            <Link to="/login"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px", borderRadius:10, color:subCol, textDecoration:"none", fontSize:13, fontWeight:500, transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color=dark?"#fff":"#1a1625"; e.currentTarget.style.background=dark?"rgba(255,255,255,0.05)":"rgba(124,58,237,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.color=subCol; e.currentTarget.style.background="transparent"; }}
            >
              <ArrowLeft size={14}/> Retour à la connexion
            </Link>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:18 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s ease-in-out infinite" }}/>
            <span style={{ fontSize:11, color:dark?"rgba(255,255,255,0.22)":"rgba(26,22,37,0.3)", fontWeight:400 }}>
              Plateforme scolaire marocaine
            </span>
          </div>
        </div>
      </div>
    </>
  );
}