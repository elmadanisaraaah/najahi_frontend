import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { ArrowLeft, Users, Video, VideoOff, ArrowRight, Timer } from "lucide-react";
import { io } from "socket.io-client";
import { requestCamera, getCameraErrorMessage } from "../../lib/webrtc";

const STREAM_ROOM_ID = "najahi_public_stream";
const SUBJECTS = ["Maths","Physique","SVT","Français","Anglais","Informatique","Histoire","Philosophie","Général","CPGE","Bac"];

function PreviewTile({ participant }) {
  const colors = ["#7c3aed","#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];
  const color  = colors[(participant.name?.charCodeAt(0)||0) % colors.length];
  return (
    <div style={{ position:"relative", borderRadius:12, overflow:"hidden", background:"#111118", border:"1px solid rgba(255,255,255,0.07)", aspectRatio:"4/3", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${color},${color}88)`, display:"grid", placeItems:"center", fontSize:18, fontWeight:800, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>
        {(participant.name||"?")[0].toUpperCase()}
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:44, background:"linear-gradient(transparent,rgba(0,0,0,0.85))" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"5px 8px" }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{participant.name}</div>
        {participant.subject && <div style={{ fontSize:8, color:"rgba(255,255,255,0.4)" }}>{participant.subject}</div>}
      </div>
    </div>
  );
}

function JoinModal({ onClose, onJoin }) {
  const [camOn, setCamOn]           = useState(false);
  const [stream, setStream]         = useState(null);
  const [camError, setCamError]     = useState("");
  const [subject, setSubject]       = useState("");
  const [showSubjects, setShowSubjects] = useState(false);
  const [heures, setHeures]         = useState(1);
  const [minutes, setMinutes]       = useState(0);
  const videoRef = useRef(null);

  const totalSecs = heures * 3600 + minutes * 60;

  const toggleCam = async () => {
    if (camOn) {
      stream?.getTracks().forEach(t => t.stop());
      setStream(null); setCamOn(false);
      setCamError("");
      if (videoRef.current) videoRef.current.srcObject = null;
    } else {
      setCamError("");
      try {
        const s = await requestCamera({ video: true });
        setStream(s); setCamOn(true);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (e) {
        setCamError(e.userMessage || getCameraErrorMessage(e));
      }
    }
  };

  const handleJoin = () => {
  const totalSecs = heures * 3600 + minutes * 60;
  if (totalSecs < 300) return;
  stream?.getTracks().forEach(t => t.stop());
  sessionStorage.setItem("najahi_stream_config", JSON.stringify({
    subject,
    totalSecs,
    camRequested: camOn,
  }));
  onJoin();
  };

  const cBtn = { width:34, height:34, borderRadius:9, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.07)", color:"#fff", fontSize:18, fontWeight:700, cursor:"pointer", display:"grid", placeItems:"center", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" };

  return (
    <>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .jm-subj:hover{background:rgba(124,58,237,0.2) !important;}
        .jm-counter:hover{border-color:#7c3aed !important;background:rgba(124,58,237,0.12) !important;}
        .jm-join:hover:not(:disabled){transform:translateY(-2px) !important;box-shadow:0 12px 32px rgba(124,58,237,0.5) !important;}
      `}</style>
      <div onClick={e => { if(e.target===e.currentTarget){stream?.getTracks().forEach(t=>t.stop());onClose();}}}
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(16px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ width:"100%", maxWidth:520, background:"#0f0a1e", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:"28px 24px", animation:"modalIn 0.35s cubic-bezier(0.34,1.2,0.64,1) both", maxHeight:"90vh", overflowY:"auto" }}>

          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:"#fff", marginBottom:4 }}>Configurer ta session</h2>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginBottom:24 }}>Ces infos seront visibles par les autres étudiants</p>

          <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

            {/* Camera */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.5px" }}>CAMÉRA</label>
              <div style={{ position:"relative", borderRadius:12, overflow:"hidden", background:"#111118", border:`1.5px solid ${camOn?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.07)"}`, aspectRatio:"16/9", display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.3s" }}>
                {camOn
                  ? <video ref={videoRef} autoPlay muted playsInline style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)" }}/>
                  : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                      <VideoOff size={28} color="rgba(255,255,255,0.12)"/>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.2)" }}>Caméra désactivée</span>
                    </div>
                }
                {camOn && <div style={{ position:"absolute", top:10, right:10, width:8, height:8, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 8px #10b981" }}/>}
              </div>
              <button type="button" onClick={toggleCam}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px", background:camOn?"rgba(124,58,237,0.15)":"rgba(255,255,255,0.06)", border:`1px solid ${camOn?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.1)"}`, borderRadius:12, cursor:"pointer", color:camOn?"#a78bfa":"rgba(255,255,255,0.5)", fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                {camOn ? <><Video size={14}/> Caméra activée — cliquer pour désactiver</> : <><VideoOff size={14}/> Activer la caméra</>}
              </button>
              {camError && (
                <p style={{ margin:"6px 0 0", padding:"8px 12px", borderRadius:9, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#fca5a5", fontSize:12, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>
                  ⚠️ {camError}
                </p>
              )}
            </div>

            {/* Subject */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.5px" }}>MA MATIÈRE</label>
              <div style={{ position:"relative" }}>
                <input type="text" placeholder="Ex: Maths, Bac, CPGE…"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  onFocus={() => setShowSubjects(true)}
                  onBlur={() => setTimeout(() => setShowSubjects(false), 150)}
                  style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"#fff", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" }}
                  onFocusCapture={e => e.target.style.borderColor="#7c3aed"}
                  onBlurCapture={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}
                />
                {showSubjects && (
                  <div style={{ position:"absolute", top:"calc(100%+4px)", left:0, right:0, background:"rgba(5,2,15,0.97)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:6, zIndex:100, maxHeight:180, overflowY:"auto" }}>
                    {SUBJECTS.filter(s => !subject||s.toLowerCase().includes(subject.toLowerCase())).map(s => (
                      <button key={s} type="button" className="jm-subj"
                        onMouseDown={() => { setSubject(s); setShowSubjects(false); }}
                        style={{ display:"block", width:"100%", textAlign:"left", padding:"7px 12px", border:"none", borderRadius:8, background:subject===s?"rgba(124,58,237,0.2)":"transparent", cursor:"pointer", color:"#fff", fontSize:13, fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Duration */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.5px", display:"flex", alignItems:"center", gap:5 }}>
                <Timer size={11}/> DURÉE DE SESSION
              </label>
              <div style={{ display:"flex", gap:20, alignItems:"center", justifyContent:"center", padding:"16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)", fontWeight:700, letterSpacing:"1px" }}>HEURES</span>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <button type="button" className="jm-counter" onClick={() => setHeures(h=>Math.max(0,h-1))} style={cBtn}>−</button>
                    <span style={{ fontSize:36, fontWeight:800, color:"#fff", minWidth:48, textAlign:"center", fontVariantNumeric:"tabular-nums", textShadow:"0 0 20px rgba(124,58,237,0.5)" }}>{String(heures).padStart(2,"0")}</span>
                    <button type="button" className="jm-counter" onClick={() => setHeures(h=>Math.min(12,h+1))} style={cBtn}>+</button>
                  </div>
                </div>
                <div style={{ fontSize:36, fontWeight:800, color:"rgba(255,255,255,0.15)", paddingTop:20 }}>:</div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)", fontWeight:700, letterSpacing:"1px" }}>MINUTES</span>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <button type="button" className="jm-counter" onClick={() => setMinutes(m=>m<=0?55:m-5)} style={cBtn}>−</button>
                    <span style={{ fontSize:36, fontWeight:800, color:"#fff", minWidth:48, textAlign:"center", fontVariantNumeric:"tabular-nums", textShadow:"0 0 20px rgba(124,58,237,0.5)" }}>{String(minutes).padStart(2,"0")}</span>
                    <button type="button" className="jm-counter" onClick={() => setMinutes(m=>m>=55?0:m+5)} style={cBtn}>+</button>
                  </div>
                </div>
              </div>
              {totalSecs >= 300 && (
                <div style={{ textAlign:"center", fontSize:12, color:"#7c3aed", fontWeight:600, padding:"6px", background:"rgba(124,58,237,0.08)", borderRadius:8, border:"1px solid rgba(124,58,237,0.15)" }}>
                  Session de {heures>0?`${heures}h `:""}{minutes>0?`${minutes}min`:""} — compte à rebours visible par tous
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:10 }}>
              <button type="button"
                onClick={() => { stream?.getTracks().forEach(t=>t.stop()); onClose(); }}
                style={{ flex:1, padding:"12px", background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>
                Annuler
              </button>
              <button type="button" className="jm-join"
                onClick={handleJoin}
                disabled={totalSecs < 300}
                style={{ flex:2, padding:"13px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:totalSecs<300?"rgba(124,58,237,0.3)":"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:800, fontFamily:"'DM Sans',sans-serif", cursor:totalSecs<300?"not-allowed":"pointer", transition:"all 0.25s", boxShadow:totalSecs<300?"none":"0 4px 20px rgba(124,58,237,0.35)" }}>
                <Video size={16}/> Entrer dans le stream
              </button>
            </div>
            {totalSecs < 300 && (
              <p style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:-8 }}>Minimum 5 minutes</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Servers() {
  const { theme } = useTheme();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const getToken = () => accessToken || localStorage.getItem("najahi_token");

  const [onlineCount, setOnlineCount]     = useState(0);
  const [previewPeople, setPreviewPeople] = useState([]);
  const [showModal, setShowModal]         = useState(false);
  const [logoError, setLogoError]         = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet]           = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const socketRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token: getToken() },
      transports: ["polling", "websocket"],
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("get_room_preview", { room_id: STREAM_ROOM_ID });
    });
    socket.on("room_preview", d => {
      const list = d.participants || [];
      setOnlineCount(list.length);
      setPreviewPeople(list.slice(0, 12));
    });
    socket.on("participants_update", d => {
      const list = d.participants || [];
      setOnlineCount(list.length);
      setPreviewPeople(list.slice(0, 12));
    });
    return () => socket.disconnect();
  }, []);

  const count = Math.max(2, previewPeople.length);
  const cols  = count<=2?2:count<=4?2:count<=6?3:4;

  const dark    = theme === "dark";
  const bg      = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 50%,#0d1a2e 100%)" : "linear-gradient(135deg,#f8f7ff 0%,#f0eeff 50%,#f5f3ff 100%)";
  const navBg   = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)";
  const navBd   = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.15)";
  const textCol = dark ? "#fff" : "#0f0a1e";
  const subCol  = dark ? "rgba(255,255,255,0.45)" : "rgba(15,10,30,0.5)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes svblob1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,20px) scale(1.1)}}
        @keyframes svblob2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-20px,15px) scale(1.1)}}
        @keyframes svfadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes livePulse{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes svglow{0%,100%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.3),0 0 16px rgba(124,58,237,0.4)}50%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.5),0 0 28px rgba(124,58,237,0.6)}}
        @keyframes livering{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(2);opacity:0}}
        .join-btn:hover{transform:translateY(-3px) !important;box-shadow:0 16px 48px rgba(124,58,237,0.5) !important;}
      `}</style>

      <div style={{ minHeight:"100vh", background:bg, fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-100px", left:"-100px", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)", filter:"blur(70px)", pointerEvents:"none", animation:"svblob1 8s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-80px", right:"-80px", width:"420px", height:"420px", borderRadius:"50%", background:"radial-gradient(circle,rgba(239,68,68,0.08) 0%,transparent 70%)", filter:"blur(70px)", pointerEvents:"none", animation:"svblob2 10s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize:"48px 48px" }}/>

        {/* Navbar */}
        <nav style={{ position:"sticky", top:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", height: isMobile ? 56 : isTablet ? 60 : "auto", padding: isMobile ? "0 16px" : isTablet ? "0 20px" : "12px 24px", background:navBg, backdropFilter:"blur(18px)", borderBottom:`1px solid ${navBd}`, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button type="button" onClick={() => navigate("/app/study")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:subCol, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              <ArrowLeft size={13}/> Study
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:4, animation:"svglow 3s ease-in-out infinite alternate" }}>
                {!logoError
                  ? <img src="/najahi_logo.png" alt="N" style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={() => setLogoError(true)}/>
                  : <span style={{ color:"#7c3aed", fontSize:15, fontWeight:900, fontFamily:"'Fraunces',serif" }}>N</span>
                }
              </div>
              <span style={{ fontSize:15, fontWeight:700, color:textCol, fontFamily:"'Fraunces',serif" }}>Stream public</span>
              <span style={{ fontSize:11, color:"#ef4444", fontWeight:700, padding:"2px 8px", background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:99, display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#ef4444", animation:"livePulse 1.5s infinite" }}/>
                LIVE
              </span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display: isMobile ? "none" : "flex", alignItems:"center", gap:6, padding:"5px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:99 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"#10b981", animation:"livePulse 2s infinite" }}/>
              <Users size={11} color={subCol}/>
              <span style={{ fontSize:12, fontWeight:700, color:textCol }}>{onlineCount}</span>
              {!isMobile && <span style={{ fontSize:11, color:subCol }}>en ligne</span>}
            </div>
            <ThemeToggle/>
          </div>
        </nav>

        {/* Content */}
        <div style={{ position:"relative", zIndex:10, maxWidth:1100, margin:"0 auto", padding: isMobile ? "16px" : "32px 24px" }}>

          <div style={{ textAlign:"center", marginBottom:36, animation:mounted?"svfadeUp 0.5s 0.1s ease both":"none" }}>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:700, color:textCol, letterSpacing:"-1px", marginBottom:10 }}>
              Étudie avec la communauté
            </h1>
            <p style={{ color:subCol, fontSize:15, lineHeight:1.6, maxWidth:480, margin:"0 auto 24px" }}>
              Rejoins des étudiants marocains qui étudient ensemble en ce moment. Caméra optionnelle, micro désactivé.
            </p>
            <button type="button" className="join-btn"
              onClick={() => setShowModal(true)}
              style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"16px 40px", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:16, fontSize:17, fontWeight:800, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.3s", boxShadow:"0 6px 28px rgba(124,58,237,0.4)" }}>
              <Video size={20}/> Rejoindre le stream <ArrowRight size={18}/>
            </button>
          </div>

          {previewPeople.length > 0 ? (
            <div style={{ animation:mounted?"svfadeUp 0.5s 0.2s ease both":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ position:"absolute", width:16, height:16, borderRadius:"50%", background:"rgba(239,68,68,0.25)", animation:"livering 2s ease-out infinite" }}/>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", position:"relative" }}/>
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:subCol, marginLeft:6 }}>
                  En ce moment — {onlineCount} étudiant{onlineCount>1?"s":""}
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:8, maxWidth:800 }}>
                {previewPeople.map((p,i) => <PreviewTile key={p.id||i} participant={p}/>)}
                {onlineCount > 12 && (
                  <div style={{ aspectRatio:"4/3", borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:16, fontWeight:700, color:subCol }}>+{onlineCount-12}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"48px 0", animation:mounted?"svfadeUp 0.5s 0.2s ease both":"none" }}>
              <div style={{ fontSize:56, opacity:0.08, marginBottom:16 }}>📚</div>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.12)", fontWeight:500 }}>Personne en ligne pour l'instant</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.07)", marginTop:6 }}>Sois le premier à rejoindre !</p>
            </div>
          )}
        </div>

        {showModal && (
          <JoinModal
            onClose={() => setShowModal(false)}
            onJoin={() => {
              setShowModal(false);
              navigate("/app/servers/public");
            }}
          />
        )}
      </div>
    </>
  );
}