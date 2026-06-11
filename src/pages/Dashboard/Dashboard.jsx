import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Users, FlaskConical, School,
  ArrowRight, ChevronLeft, ChevronRight, Shield, MessageSquare, CalendarDays, Target,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Study With Me",
    desc: "Salles privées, serveurs communautaires, timer Pomodoro et chat en temps réel.",
    to: "/app/study",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.12)",
    glow: "rgba(124,58,237,0.4)",
    hasSubMenu: true,
  },
  {
    icon: FlaskConical,
    title: "Test d'orientation",
    desc: "Réponds à un questionnaire pour découvrir les filières qui correspondent à ton profil.",
    to: "/app/orientation",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    glow: "rgba(16,185,129,0.4)",
  },
  {
    icon: School,
    title: "Guide des écoles",
    desc: "Explore toutes les écoles et universités marocaines avec leurs conditions d'admission.",
    to: "/app/schools",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    glow: "rgba(245,158,11,0.4)",
  },
  {
    icon: Users,
    title: "Mon profil",
    desc: "Complète ton profil, upload ton bulletin et suis ta progression.",
    to: "/app/profile",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    glow: "rgba(59,130,246,0.4)",
  },
];

function Particle({ style }) { return <div style={style} />; }

function ParticlesBackground({ dark }) {
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    position: "absolute",
    width: `${2 + (i % 3)}px`,
    height: `${2 + (i % 3)}px`,
    borderRadius: "50%",
    background: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#818cf8" : "#10b981",
    left: `${5 + (i * 5.1) % 90}%`,
    top: `${5 + (i * 7.7) % 88}%`,
    opacity: dark ? 0.1 + (i % 5) * 0.06 : 0.06 + (i % 5) * 0.03,
    animation: `pfloat${i % 4} ${3 + (i % 4)}s ease-in-out infinite`,
    animationDelay: `${i * 0.35}s`,
    pointerEvents: "none",
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {particles.map((style, i) => <Particle key={i} style={style} />)}
    </div>
  );
}

function clamp(min, preferred, max) {
  return `clamp(${min}px, ${preferred}vw, ${max}px)`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dark = theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  const [activeIdx, setActiveIdx]   = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [logoError, setLogoError]   = useState(false);
  const [mounted, setMounted]       = useState(false);
  const autoRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startAuto = () => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActiveIdx(i => (i + 1) % FEATURES.length);
    }, 3500);
  };

  useEffect(() => { startAuto(); return () => clearInterval(autoRef.current); }, []);

  const go = (dir) => {
    clearInterval(autoRef.current);
    setActiveIdx(i => (i + dir + FEATURES.length) % FEATURES.length);
    startAuto();
  };

  const pick = (i) => {
    clearInterval(autoRef.current);
    setActiveIdx(i);
    startAuto();
  };

  // ── Theme tokens ──
  const bg      = dark
    ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 50%,#0d1a2e 100%)"
    : "linear-gradient(135deg,#f8f7ff 0%,#f0eeff 50%,#f5f3ff 100%)";
  const navBg   = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const navBdr  = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.15)";
  const textCol = dark ? "#ffffff" : "#0f0a1e";
  const subCol  = dark ? "rgba(255,255,255,0.4)" : "rgba(15,10,30,0.55)";
  const cardBg  = dark ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.98)";
  const cardBdr = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.18)";

  const getCardProps = (i) => {
    const total  = FEATURES.length;
    const offset = ((i - activeIdx + total) % total);
    const pos    = offset <= total / 2 ? offset : offset - total;
    const isActive   = pos === 0;
    const isAdjacent = Math.abs(pos) === 1;
    const isVisible  = Math.abs(pos) <= 1;
    const hovered    = hoveredIdx === i;
    const scale      = isActive ? (hovered ? 1.06 : 1) : isAdjacent ? (hovered ? 0.88 : 0.82) : 0.6;
    return {
      isActive, isAdjacent, isVisible,
      style: {
        position: "absolute", left: "50%",
        transform: `translateX(calc(-50% + ${pos * (isMobile ? 160 : 230)}px)) scale(${scale})`,
        zIndex: isActive ? 10 : isAdjacent ? 5 : 1,
        opacity: isVisible ? (isActive ? 1 : 0.72) : 0,
        filter: `blur(${isActive ? 0 : isAdjacent ? 1 : 5}px)`,
        transition: "all 0.5s cubic-bezier(0.34,1.2,0.64,1)",
        cursor: "pointer", pointerEvents: isVisible ? "auto" : "none",
        willChange: "transform, opacity",
      }
    };
  };

  const displayName = user?.prenom || user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "là";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes pfloat0{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.1)}}
        @keyframes pfloat1{0%,100%{transform:translate(0,0)}33%{transform:translate(10px,-15px)}66%{transform:translate(-8px,8px)}}
        @keyframes pfloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-25px)}}
        @keyframes pfloat3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(12px,-10px) scale(1.15)}}
        @keyframes dblob1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,25px) scale(1.15)}}
        @keyframes dblob2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-25px,15px) scale(1.1)}}
        @keyframes dfadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dpulse{0%,100%{box-shadow:0 0 6px rgba(16,185,129,0.7)}50%{box-shadow:0 0 16px rgba(16,185,129,1)}}
        @keyframes dglow{0%,100%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.3),0 0 16px rgba(124,58,237,0.4)}50%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.5),0 0 28px rgba(124,58,237,0.6)}}
        .dash-nav-btn:hover{background:rgba(124,58,237,0.15) !important;border-color:#7c3aed !important;}
        .dash-sub-btn:hover{transform:translateY(-1px) !important;opacity:0.9;}
      `}</style>

      <div style={{ minHeight:"100vh", background:bg, fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden", overflowX:"hidden", transition:"background 0.5s ease" }}>

        {/* Blobs */}
        <div style={{ position:"absolute", top:"-100px", left:"-100px", width:"500px", height:"500px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(124,58,237,0.25)":"rgba(124,58,237,0.14)"} 0%,transparent 70%)`, filter:"blur(60px)", pointerEvents:"none", animation:"dblob1 8s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-80px", right:"-80px", width:"400px", height:"400px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(16,185,129,0.15)":"rgba(16,185,129,0.1)"} 0%,transparent 70%)`, filter:"blur(60px)", pointerEvents:"none", animation:"dblob2 10s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`linear-gradient(rgba(124,58,237,${dark?0.03:0.04}) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,${dark?0.03:0.04}) 1px,transparent 1px)`, backgroundSize:"42px 42px" }}/>
        <ParticlesBackground dark={dark} />

        {/* Navbar */}
        <nav style={{ position:"sticky", top:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", height: isMobile ? 56 : isTablet ? 60 : "auto", padding: isMobile ? "0 16px" : isTablet ? "0 20px" : "14px 28px", overflow:"hidden", background:navBg, backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", borderBottom:`1px solid ${navBdr}`, boxShadow:dark?"none":"0 1px 0 rgba(124,58,237,0.06)", transition:"all 0.4s ease" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width: isMobile ? 28 : 38, height: isMobile ? 28 : 38, borderRadius: isMobile ? 8 : 11, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:5, flexShrink:0, animation:"dglow 3s ease-in-out infinite alternate" }}>
              {!logoError
                ? <img src="/najahi_logo.png" alt="N" style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={() => setLogoError(true)}/>
                : <span style={{ color:"#7c3aed", fontSize:17, fontWeight:900, fontFamily:"'Fraunces',serif" }}>N</span>
              }
            </div>
            <span style={{ fontSize: isMobile ? 15 : 18, fontWeight:700, color:textCol, fontFamily:"'Fraunces',serif", letterSpacing:"-0.3px", transition:"color 0.4s" }}>
              Najahi
            </span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <ThemeToggle />
            <button type="button" onClick={() => navigate("/app/forum")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", background:"rgba(124,58,237,0.09)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:9, color:"#7c3aed", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(124,58,237,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(124,58,237,0.09)"}
            >
              <MessageSquare size={12} /> Communauté
            </button>
            <button type="button" onClick={() => navigate("/app/concours")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", background:"rgba(16,185,129,0.09)", border:"1px solid rgba(16,185,129,0.22)", borderRadius:9, color:"#10b981", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(16,185,129,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(16,185,129,0.09)"}
            >
              <CalendarDays size={12} /> Concours
            </button>
            <button type="button" onClick={() => navigate("/app/calculateur")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", background:"rgba(124,58,237,0.09)", border:"1px solid rgba(124,58,237,0.22)", borderRadius:9, color:"#7c3aed", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(124,58,237,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(124,58,237,0.09)"}
            >
              <Target size={12} /> Chances
            </button>
            {user?.role === "admin" && (
              <button type="button" onClick={() => navigate("/app/admin")}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:9, color:"#a78bfa", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(124,58,237,0.22)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(124,58,237,0.12)"}
              >
                <Shield size={12} /> Admin
              </button>
            )}
          </div>
        </nav>

        {/* Content */}
        <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 67px)", padding: isMobile ? "20px 12px" : "40px 24px", textAlign:"center" }}>

          {/* Welcome */}
          <div style={{ marginBottom: isMobile ? 24 : 52, animation: mounted?"dfadeUp 0.5s 0.1s ease both":"none" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:dark?"rgba(124,58,237,0.14)":"rgba(124,58,237,0.09)", border:`1px solid ${dark?"rgba(124,58,237,0.3)":"rgba(124,58,237,0.2)"}`, borderRadius:99, marginBottom:18 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"dpulse 2s infinite" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"#7c3aed", letterSpacing:"0.3px" }}>Plateforme scolaire marocaine</span>
            </div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:clamp(28,4,40), fontWeight:700, color:textCol, letterSpacing:"-0.5px", marginBottom:10, lineHeight:1.2, transition:"color 0.4s" }}>
              Bonjour, <span style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{displayName}</span>
            </h1>
            <p style={{ color:subCol, fontSize:15, lineHeight:1.6, fontWeight:500, transition:"color 0.4s" }}>
              Que veux-tu faire aujourd'hui ?
            </p>
          </div>

          {/* Carousel */}
          <div
            style={{ position:"relative", width:"100%", maxWidth:780, height: isMobile ? 400 : 320, animation: mounted?"dfadeUp 0.5s 0.25s ease both":"none" }}
            onMouseEnter={() => clearInterval(autoRef.current)}
            onMouseLeave={startAuto}
          >
            {FEATURES.map((f, i) => {
              const { isActive, isVisible, style } = getCardProps(i);
              const Icon = f.icon;
              return (
                <div key={i} style={style}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => !isActive && pick(i)}
                >
                  <div style={{ width: isMobile ? "min(256px, 88vw)" : 256, background:cardBg, backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:`1px solid ${isActive?f.color+"50":cardBdr}`, borderRadius:24, padding:"28px 24px", boxShadow:isActive
                    ? `0 24px 64px ${f.glow}35, 0 0 0 1px ${f.color}20, inset 0 1px 0 rgba(255,255,255,0.15)`
                    : dark
                      ? "0 8px 24px rgba(0,0,0,0.25)"
                      : "0 4px 24px rgba(124,58,237,0.09), 0 1px 3px rgba(0,0,0,0.06)",
                    transition:"all 0.4s ease" }}>

                    <div style={{ width:62, height:62, borderRadius:18, background:f.bg, display:"grid", placeItems:"center", margin:"0 auto 16px", border:`1.5px solid ${f.color}30`, boxShadow:isActive?`0 0 28px ${f.glow}45`:"none", transition:"all 0.4s" }}>
                      <Icon size={26} color={f.color}/>
                    </div>

                    <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:17, fontWeight:700, color:textCol, marginBottom:8, letterSpacing:"-0.2px", transition:"color 0.4s" }}>
                      {f.title}
                    </h3>
                    <p style={{ fontSize:12.5, color:subCol, lineHeight:1.65, marginBottom:isActive?16:0, transition:"all 0.4s" }}>
                      {f.desc}
                    </p>

                    {isActive && f.hasSubMenu && (
                      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                        <button type="button" className="dash-sub-btn"
                          onClick={e => { e.stopPropagation(); navigate("/app/study"); }}
                          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, width:"100%", padding:"11px 16px", background:`linear-gradient(135deg,${f.color},${f.color}bb)`, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.25s", boxShadow:`0 4px 18px ${f.glow}45` }}>
                          Commencer <ArrowRight size={14}/>
                        </button>
                      </div>
                    )}

                    {isActive && !f.hasSubMenu && (
                      <button type="button" className="dash-sub-btn"
                        onClick={e => { e.stopPropagation(); navigate(f.to); }}
                        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, width:"100%", padding:"11px 16px", background:`linear-gradient(135deg,${f.color},${f.color}bb)`, color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.25s", boxShadow:`0 4px 18px ${f.glow}45` }}>
                        Accéder <ArrowRight size={14}/>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:36, animation: mounted?"dfadeUp 0.5s 0.35s ease both":"none" }}>
            <button type="button" className="dash-nav-btn"
              onClick={() => go(-1)}
              style={{ width:38, height:38, borderRadius:"50%", background:cardBg, border:`1px solid ${cardBdr}`, display:"grid", placeItems:"center", cursor:"pointer", color:textCol, transition:"all 0.2s", backdropFilter:"blur(12px)", boxShadow:dark?"none":"0 2px 8px rgba(124,58,237,0.08)" }}>
              <ChevronLeft size={18}/>
            </button>
            <div style={{ display:"flex", gap:7, alignItems:"center" }}>
              {FEATURES.map((f, i) => (
                <button key={i} type="button" onClick={() => pick(i)}
                  style={{ width:i===activeIdx?26:8, height:8, borderRadius:99, border:"none", background:i===activeIdx?f.color:dark?"rgba(255,255,255,0.2)":"rgba(15,10,30,0.18)", cursor:"pointer", transition:"all 0.35s", padding:0, boxShadow:i===activeIdx?`0 0 8px ${f.glow}`:"none" }}
                />
              ))}
            </div>
            <button type="button" className="dash-nav-btn"
              onClick={() => go(1)}
              style={{ width:38, height:38, borderRadius:"50%", background:cardBg, border:`1px solid ${cardBdr}`, display:"grid", placeItems:"center", cursor:"pointer", color:textCol, transition:"all 0.2s", backdropFilter:"blur(12px)", boxShadow:dark?"none":"0 2px 8px rgba(124,58,237,0.08)" }}>
              <ChevronRight size={18}/>
            </button>
          </div>

          <p style={{ marginTop:16, fontSize:13, fontWeight:600, color:FEATURES[activeIdx].color, letterSpacing:"0.3px", transition:"color 0.3s", animation: mounted?"dfadeUp 0.5s 0.4s ease both":"none" }}>
            {FEATURES[activeIdx].title}
          </p>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:32 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"dpulse 2s ease-in-out infinite" }}/>
            <span style={{ fontSize:11, color:dark?"rgba(255,255,255,0.2)":"rgba(15,10,30,0.35)", fontWeight:500 }}>
              Connecté à Najahi
            </span>
          </div>
        </div>
      </div>
    </>
  );
}