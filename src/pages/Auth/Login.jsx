import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";

function ParticlesBackground({ dark }) {
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    position: "absolute",
    width: `${2 + (i % 3)}px`,
    height: `${2 + (i % 3)}px`,
    borderRadius: "50%",
    background: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#818cf8" : "#10b981",
    left: `${5 + (i * 5.1) % 90}%`,
    top: `${5 + (i * 7.7) % 88}%`,
    opacity: dark ? 0.12 + (i % 5) * 0.07 : 0.06 + (i % 5) * 0.03,
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

export default function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dark = theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const from = location.state?.from?.pathname || "/app/dashboard";
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Le serveur met trop de temps à répondre. Réessaie.")), 10000)
      );
      await Promise.race([login(form), timeout]);
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg        = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 45%,#0d1a2e 100%)" : "linear-gradient(135deg,#f0edff 0%,#e8e4ff 45%,#eef2ff 100%)";
  const cardBg    = dark ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.82)";
  const cardBdr   = dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(124,58,237,0.12)";
  const cardSh    = dark ? "0 30px 90px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.08)" : "0 20px 60px rgba(124,58,237,0.1),0 4px 20px rgba(0,0,0,0.05)";
  const textCol   = dark ? "#fff" : "#1a1625";
  const subCol    = dark ? "rgba(255,255,255,0.4)" : "rgba(26,22,37,0.5)";
  const labelCol  = dark ? "rgba(255,255,255,0.6)" : "rgba(26,22,37,0.65)";
  const inputBg   = dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)";
  const inputBdr  = dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(124,58,237,0.15)";
  const inputCol  = dark ? "#fff" : "#1a1625";
  const iconCol   = dark ? "rgba(255,255,255,0.3)" : "rgba(26,22,37,0.3)";
  const eyeCol    = dark ? "rgba(255,255,255,0.35)" : "rgba(26,22,37,0.35)";
  const eyeHov    = dark ? "rgba(255,255,255,0.75)" : "rgba(26,22,37,0.75)";
  const divBg     = dark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.08)";
  const divText   = dark ? "rgba(255,255,255,0.25)" : "rgba(26,22,37,0.35)";
  const regBg     = dark ? "rgba(255,255,255,0.04)" : "rgba(124,58,237,0.05)";
  const regBdr    = dark ? "1.5px solid rgba(255,255,255,0.09)" : "1.5px solid rgba(124,58,237,0.15)";
  const regCol    = dark ? "#a78bfa" : "#7c3aed";
  const dotText   = dark ? "rgba(255,255,255,0.22)" : "rgba(26,22,37,0.3)";
  const blob1     = dark ? "rgba(124,58,237,0.28)" : "rgba(124,58,237,0.1)";
  const blob2     = dark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.07)";
  const googleBg  = dark ? "rgba(255,255,255,0.95)" : "#fff";
  const googleBdr = dark ? "1.5px solid rgba(255,255,255,0.2)" : "1.5px solid #e5e7eb";
  const googleSh  = dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.06)";
  const googleShH = dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.12)";
  const placeholderCol = dark ? "rgba(255,255,255,0.2)" : "rgba(26,22,37,0.25)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes float0{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-22px) scale(1.15)}}
        @keyframes float1{0%,100%{transform:translate(0,0)}33%{transform:translate(10px,-16px)}66%{transform:translate(-8px,10px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-28px)}}
        @keyframes float3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(14px,-10px) scale(1.2)}}
        @keyframes blob1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,25px) scale(1.18)}}
        @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,18px) scale(1.12)}}
        @keyframes blob3{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.25)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(40px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes logoIn{from{opacity:0;transform:scale(0.8) rotate(-10deg)}to{opacity:1;transform:scale(1) rotate(0deg)}}
        @keyframes textIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.3),0 0 20px rgba(124,58,237,0.4)}50%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.5),0 0 35px rgba(124,58,237,0.6)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 6px rgba(16,185,129,0.7)}50%{box-shadow:0 0 14px rgba(16,185,129,1)}}

        .l-input {
          width:100%; padding:12px 12px 12px 40px;
          border-radius:12px; font-size:14px;
          font-family:'DM Sans',sans-serif;
          transition:all 0.25s; outline:none;
        }
        .l-input::placeholder { color: ${placeholderCol}; }
        .l-input:focus {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important;
        }
        .l-wrap:focus-within .l-icon { color: #a78bfa !important; }

        .l-btn {
          width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
          padding:13px 20px; min-height:44px; background:linear-gradient(135deg,#7c3aed,#a78bfa);
          color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:600;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.25s;
          box-shadow:0 4px 20px rgba(124,58,237,0.3); letter-spacing:0.2px;
        }
        .l-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 30px rgba(124,58,237,0.45);}
        .l-btn:active:not(:disabled){transform:translateY(0);}
        .l-btn:disabled{opacity:0.55;cursor:not-allowed;}

        .l-forgot{font-size:12px;color:#a78bfa;text-decoration:none;font-weight:500;opacity:0.85;transition:opacity 0.2s;}
        .l-forgot:hover{opacity:1;text-decoration:underline;}
      `}</style>

      <div style={{
        minHeight:"100vh", background:bg,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden",
        transition:"background 0.5s ease",
      }}>

        {/* Blobs */}
        <div style={{ position:"absolute", top:"-120px", left:"-120px", width:"550px", height:"550px", borderRadius:"50%", background:`radial-gradient(circle,${blob1} 0%,transparent 70%)`, filter:"blur(70px)", pointerEvents:"none", animation:"blob1 9s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-100px", right:"-100px", width:"450px", height:"450px", borderRadius:"50%", background:`radial-gradient(circle,${blob2} 0%,transparent 70%)`, filter:"blur(70px)", pointerEvents:"none", animation:"blob2 11s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"50%", left:"50%", width:"350px", height:"350px", borderRadius:"50%", background:`radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)`, filter:"blur(90px)", pointerEvents:"none", animation:"blob3 7s ease-in-out infinite" }}/>

        {/* Grid */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`linear-gradient(rgba(124,58,237,${dark?0.035:0.03}) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,${dark?0.035:0.03}) 1px,transparent 1px)`, backgroundSize:"42px 42px" }}/>

        <ParticlesBackground dark={dark} />

        {/* ThemeToggle */}
        <div style={{ position:"absolute", top:20, right:20, zIndex:20 }}>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div style={{
          position:"relative", zIndex:10, width:"100%", maxWidth:"420px", margin:"24px",
          background:cardBg, backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
          border:cardBdr, borderRadius:"26px", padding: isMobile ? "28px 20px" : "44px 38px",
          boxShadow:cardSh, transition:"all 0.4s ease",
          animation: mounted ? "cardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
        }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:32, animation: mounted?"logoIn 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both":"none" }}>
            <div style={{ width:46, height:46, borderRadius:14, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0, padding:5, animation:"glow 3s ease-in-out infinite alternate" }}>
              {!logoError ? (
                <img src="/najahi_logo.png" alt="Najahi"
                  style={{ width:"100%", height:"100%", objectFit:"contain" }}
                  onError={() => setLogoError(true)} />
              ) : (
                <span style={{ color:"#7c3aed", fontSize:22, fontWeight:900, fontFamily:"'Fraunces',serif" }}>N</span>
              )}
            </div>
            <div>
              <div style={{ fontSize:21, fontWeight:700, color:textCol, fontFamily:"'Fraunces',serif", letterSpacing:"-0.4px", lineHeight:1.1, transition:"color 0.4s" }}>Najahi</div>
              <div style={{ fontSize:11, color:subCol, fontWeight:400, marginTop:2, letterSpacing:"0.3px", transition:"color 0.4s" }}>Plateforme scolaire marocaine</div>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:24, animation: mounted?"textIn 0.4s 0.2s ease both":"none" }}>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:27, fontWeight:700, color:textCol, letterSpacing:"-0.5px", marginBottom:6, lineHeight:1.25, transition:"color 0.4s" }}>
              Bon retour
            </h1>
            <p style={{ color:subCol, fontSize:14, lineHeight:1.55, transition:"color 0.4s" }}>
              Connecte-toi pour accéder à ton espace
            </p>
          </div>

          {/* Google button */}
          <button type="button"
            onClick={() => { window.location.href = apiUrl + "/api/auth/google"; }}
            style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              padding:"12px 20px", marginBottom:12, minHeight:"44px",
              background:googleBg, border:googleBdr,
              borderRadius:12, fontSize:14, fontWeight:600,
              color:"#1a1625", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              transition:"all 0.2s", boxShadow:googleSh,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow=googleShH; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow=googleSh; e.currentTarget.style.transform="translateY(0)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Or divider */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:divBg, transition:"background 0.4s" }}/>
            <span style={{ fontSize:12, color:divText, fontWeight:500, whiteSpace:"nowrap", transition:"color 0.4s" }}>ou avec ton email</span>
            <div style={{ flex:1, height:1, background:divBg, transition:"background 0.4s" }}/>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {error && (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color: dark?"#fca5a5":"#ef4444", borderRadius:10, padding:"10px 14px", fontSize:13, animation:"shake 0.4s ease" }}>
                <span style={{ fontSize:11 }}>✕</span> {error}
              </div>
            )}

            {/* Email */}
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <label style={{ fontSize:12.5, fontWeight:500, color:labelCol, letterSpacing:"0.2px", transition:"color 0.4s" }}>Adresse email</label>
              <div className="l-wrap" style={{ position:"relative", display:"flex", alignItems:"center" }}>
                <Mail size={14} className="l-icon" style={{ position:"absolute", left:13, color:iconCol, pointerEvents:"none", transition:"color 0.2s" }}/>
                <input className="l-input" type="email" name="email"
                  value={form.email} onChange={handleChange} required
                  placeholder="exemple@email.com"
                  style={{ background:inputBg, border:inputBdr, color:inputCol }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <label style={{ fontSize:12.5, fontWeight:500, color:labelCol, transition:"color 0.4s" }}>Mot de passe</label>
                <Link to="/forgot-password" className="l-forgot">Mot de passe oublié ?</Link>
              </div>
              <div className="l-wrap" style={{ position:"relative", display:"flex", alignItems:"center" }}>
                <Lock size={14} className="l-icon" style={{ position:"absolute", left:13, color:iconCol, pointerEvents:"none", transition:"color 0.2s" }}/>
                <input className="l-input" style={{ paddingRight:42, background:inputBg, border:inputBdr, color:inputCol }}
                  type={showPassword?"text":"password"} name="password"
                  value={form.password} onChange={handleChange} required placeholder="••••••••"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                  style={{ position:"absolute", right:11, background:"none", border:"none", cursor:"pointer", color:eyeCol, display:"flex", alignItems:"center", padding:4, borderRadius:6, transition:"color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color=eyeHov}
                  onMouseLeave={e => e.currentTarget.style.color=eyeCol}
                >
                  {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>

            <button className="l-btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? "Connexion en cours…" : "Se connecter"}
              {!loading && <ArrowRight size={15}/>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"20px 0" }}>
            <div style={{ flex:1, height:1, background:divBg }}/>
            <span style={{ fontSize:11.5, color:divText, letterSpacing:"0.3px", whiteSpace:"nowrap" }}>Pas encore de compte</span>
            <div style={{ flex:1, height:1, background:divBg }}/>
          </div>

          {/* Register link */}
          <Link to="/register"
            style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:"12px 20px", background:regBg, border:regBdr,
              borderRadius:12, fontSize:14, fontWeight:600, color:regCol,
              textDecoration:"none", fontFamily:"'DM Sans',sans-serif", transition:"all 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(124,58,237,0.1)"; e.currentTarget.style.borderColor="rgba(124,58,237,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background=regBg; e.currentTarget.style.borderColor=dark?"rgba(255,255,255,0.09)":"rgba(124,58,237,0.15)"; }}
          >
            <Sparkles size={13}/>
            Créer un compte Najahi
          </Link>

          {/* Status */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:22 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s ease-in-out infinite" }}/>
            <span style={{ fontSize:11, color:dotText, fontWeight:400, letterSpacing:"0.3px", transition:"color 0.4s" }}>
              Plateforme scolaire marocaine
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
