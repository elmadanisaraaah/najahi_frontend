import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Lock, Radio, ArrowRight } from "lucide-react";

const MODES = [
  {
    id: "solo",
    Icon: BookOpen,
    title: "Étude solo",
    desc: "Concentre-toi seul avec ton timer Pomodoro, ta musique et ton ambiance préférée.",
    tags: ["Pomodoro", "Musique", "Wallpaper"],
    color: "#10b981",
    glow: "rgba(16,185,129,0.4)",
    bg: "rgba(16,185,129,0.08)",
    route: "/app/study/solo",
  },
  {
    id: "private",
    Icon: Lock,
    title: "Salle privée",
    desc: "Crée une salle et invite tes amis avec un code. Timer, chat et caméra inclus.",
    tags: ["Code privé", "Chat", "Caméra"],
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.4)",
    bg: "rgba(124,58,237,0.08)",
    route: "/app/study/rooms",
  },
  {
    id: "stream",
    Icon: Radio,
    title: "Stream public",
    desc: "Rejoins une communauté d'étudiants. Sessions publiques avec caméra et chat de groupe.",
    tags: ["Public", "Caméra", "Communauté"],
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.4)",
    bg: "rgba(245,158,11,0.08)",
    route: "/app/servers",
  },
];

function ParticlesBackground({ dark }) {
  const particles = Array.from({ length: 14 }).map((_, i) => ({
    position: "absolute",
    width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
    borderRadius: "50%",
    background: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#10b981" : "#f59e0b",
    left: `${5 + (i * 6.5) % 90}%`, top: `${5 + (i * 7.7) % 88}%`,
    opacity: dark ? 0.08 + (i % 5) * 0.04 : 0.03 + (i % 5) * 0.02,
    animation: `smfloat${i % 4} ${3 + (i % 4)}s ease-in-out infinite`,
    animationDelay: `${i * 0.4}s`, pointerEvents: "none",
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {particles.map((s, i) => <div key={i} style={s} />)}
    </div>
  );
}

export default function Study() {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dark = theme === "dark";

  const [mounted, setMounted]     = useState(false);
  const [hovered, setHovered]     = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const bg      = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 50%,#0d1a2e 100%)" : "linear-gradient(135deg,#f0edff 0%,#e8e4ff 50%,#eef2ff 100%)";
  const navBg   = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)";
  const navBdr  = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)";
  const textCol = dark ? "#fff" : "#1a1625";
  const subCol  = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";
  const cardBg  = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)";
  const cardBdr = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.1)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes smfloat0{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes smfloat1{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,-15px)}}
        @keyframes smfloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-25px)}}
        @keyframes smfloat3{0%,100%{transform:translate(0,0)}50%{transform:translate(-10px,-12px)}}
        @keyframes smblob1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,20px) scale(1.1)}}
        @keyframes smblob2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-20px,15px) scale(1.1)}}
        @keyframes smfadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes smglow{0%,100%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.3),0 0 16px rgba(124,58,237,0.4)}50%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.5),0 0 28px rgba(124,58,237,0.6)}}
        @keyframes smpulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
        .sm-card{transition:all 0.35s cubic-bezier(0.34,1.2,0.64,1) !important;}
        .sm-card:hover{transform:translateY(-8px) scale(1.02) !important;}
        .sm-btn:hover{transform:translateY(-1px) !important;opacity:0.9;}
      `}</style>

      <div style={{ minHeight:"100vh", background:bg, fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden", transition:"background 0.5s ease" }}>

        {/* Blobs */}
        <div style={{ position:"absolute", top:"-100px", left:"-100px", width:"450px", height:"450px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(124,58,237,0.2)":"rgba(124,58,237,0.07)"} 0%,transparent 70%)`, filter:"blur(60px)", pointerEvents:"none", animation:"smblob1 8s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-80px", right:"-80px", width:"380px", height:"380px", borderRadius:"50%", background:`radial-gradient(circle,${dark?"rgba(16,185,129,0.15)":"rgba(16,185,129,0.06)"} 0%,transparent 70%)`, filter:"blur(60px)", pointerEvents:"none", animation:"smblob2 10s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`linear-gradient(rgba(124,58,237,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.025) 1px,transparent 1px)`, backgroundSize:"42px 42px" }}/>
        <ParticlesBackground dark={dark} />

        {/* Navbar */}
        <nav style={{ position:"relative", zIndex:20, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 28px", background:navBg, backdropFilter:"blur(18px)", borderBottom:`1px solid ${navBdr}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:4, animation:"smglow 3s ease-in-out infinite alternate" }}>
              {!logoError
                ? <img src="/najahi_logo.png" alt="N" style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={() => setLogoError(true)}/>
                : <span style={{ color:"#7c3aed", fontSize:16, fontWeight:900, fontFamily:"'Fraunces',serif" }}>N</span>
              }
            </div>
            <span style={{ fontSize:17, fontWeight:700, color:textCol, fontFamily:"'Fraunces',serif", letterSpacing:"-0.3px" }}>Najahi</span>
            <span style={{ fontSize:12, color:"#7c3aed", fontWeight:600, padding:"3px 10px", background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:99 }}>Study</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <ThemeToggle />
            <button type="button" onClick={() => navigate("/app/dashboard")}
              style={{ padding:"7px 14px", background:dark?"rgba(255,255,255,0.06)":"rgba(124,58,237,0.06)", border:dark?"1px solid rgba(255,255,255,0.1)":"1px solid rgba(124,58,237,0.15)", borderRadius:9, color:textCol, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background=dark?"rgba(255,255,255,0.12)":"rgba(124,58,237,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background=dark?"rgba(255,255,255,0.06)":"rgba(124,58,237,0.06)"}
            >← Dashboard</button>
          </div>
        </nav>

        {/* Content */}
        <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 67px)", padding:"40px 24px" }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:52, animation: mounted?"smfadeUp 0.5s 0.1s ease both":"none" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", background:dark?"rgba(124,58,237,0.14)":"rgba(124,58,237,0.07)", border:`1px solid ${dark?"rgba(124,58,237,0.3)":"rgba(124,58,237,0.15)"}`, borderRadius:99, marginBottom:18 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"smpulse 2s infinite" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"#7c3aed", letterSpacing:"0.3px" }}>
                Choisis ton mode d'étude
              </span>
            </div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:700, color:textCol, letterSpacing:"-0.5px", marginBottom:10, lineHeight:1.2 }}>
              Study With Me 
            </h1>
            <p style={{ color:subCol, fontSize:15, lineHeight:1.6, maxWidth:480, margin:"0 auto" }}>
              Solo, entre amis, ou avec la communauté — à toi de choisir comment tu veux étudier aujourd'hui.
            </p>
          </div>

          {/* Cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24, width:"100%", maxWidth:960, animation: mounted?"smfadeUp 0.5s 0.2s ease both":"none" }}>
            {MODES.map((mode) => (
              <div key={mode.id} className="sm-card"
                style={{ background:cardBg, backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:`1px solid ${hovered===mode.id?mode.color+"60":cardBdr}`, borderRadius:24, padding:"36px 32px", cursor:"pointer", position:"relative", overflow:"hidden", boxShadow: hovered===mode.id?`0 24px 60px ${mode.glow}30, 0 0 0 1px ${mode.color}20`:dark?"0 8px 24px rgba(0,0,0,0.2)":"0 4px 20px rgba(124,58,237,0.06)" }}
                onMouseEnter={() => setHovered(mode.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(mode.route)}
              >
                {/* Glow bg */}
                <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:`radial-gradient(circle,${mode.color}15 0%,transparent 70%)`, pointerEvents:"none", transition:"opacity 0.3s", opacity: hovered===mode.id?1:0 }}/>

                <div style={{ width:72, height:72, borderRadius:20, background:mode.bg, border:`1.5px solid ${mode.color}30`, display:"grid", placeItems:"center", marginBottom:22, boxShadow: hovered===mode.id?`0 0 24px ${mode.glow}40`:"none", transition:"all 0.3s" }}>
                  <mode.Icon size={30} color={mode.color}/>
                </div>

                {/* Title */}
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:textCol, letterSpacing:"-0.3px", marginBottom:10, transition:"color 0.3s" }}>
                  {mode.title}
                </h2>

                {/* Desc */}
                <p style={{ fontSize:14, color:subCol, lineHeight:1.7, marginBottom:20 }}>
                  {mode.desc}
                </p>

                {/* Tags */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:24 }}>
                  {mode.tags.map(tag => (
                    <span key={tag} style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, background:mode.bg, color:mode.color, border:`1px solid ${mode.color}25` }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button type="button" className="sm-btn"
                  onClick={e => { e.stopPropagation(); navigate(mode.route); }}
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"13px 20px", background:`linear-gradient(135deg,${mode.color},${mode.color}cc)`, color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.25s", boxShadow:`0 4px 18px ${mode.glow}35` }}>
                  Commencer <ArrowRight size={15}/>
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:48, animation: mounted?"smfadeUp 0.5s 0.3s ease both":"none" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"smpulse 2s ease-in-out infinite" }}/>
            <span style={{ fontSize:11, color:dark?"rgba(255,255,255,0.2)":"rgba(26,22,37,0.3)", fontWeight:400 }}>
              Connecté à Najahi
            </span>
          </div>
        </div>
      </div>
    </>
  );
}