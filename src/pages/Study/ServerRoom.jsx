import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { Video, VideoOff, PhoneOff, Users, Timer } from "lucide-react";
import { io } from "socket.io-client";

const STREAM_ROOM_ID = "najahi_public_stream";

const WALLPAPERS = [
  { id:"dark",   label:"Sombre",  bg:"#0d0d14" },
  { id:"deep",   label:"Profond", bg:"#050510" },
  { id:"forest", label:"Forêt",   bg:"#050f05" },
  { id:"ocean",  label:"Océan",   bg:"#020a14" },
  { id:"purple", label:"Violet",  bg:"#0d051a" },
];

function CamTile({ participant, isLocal, camOn, stream }) {
  const videoRef = useRef(null);
  const colors   = ["#7c3aed","#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];
  const color    = colors[(participant.name?.charCodeAt(0)||0) % colors.length];

  useEffect(() => {
    if (videoRef.current && stream && camOn && isLocal) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, camOn, isLocal]);

  return (
    <div style={{ position:"relative", borderRadius:14, overflow:"hidden", background:"#111118", border:`1px solid ${camOn&&isLocal?color+"50":"rgba(255,255,255,0.06)"}`, aspectRatio:"4/3", display:"flex", alignItems:"center", justifyContent:"center" }}>
      {camOn && isLocal && (
        <video ref={videoRef} autoPlay muted playsInline style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)" }}/>
      )}
      {(!camOn || !isLocal) && (
        <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${color},${color}88)`, display:"grid", placeItems:"center", fontSize:20, fontWeight:800, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>
          {(participant.name||"?")[0].toUpperCase()}
        </div>
      )}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:52, background:"linear-gradient(transparent,rgba(0,0,0,0.85))" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"6px 10px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {participant.name}{isLocal?" (toi)":""}
        </div>
        {participant.subject && <div style={{ fontSize:9, color:"rgba(255,255,255,0.45)", marginTop:1 }}>{participant.subject}</div>}
      </div>
      {camOn && isLocal && <div style={{ position:"absolute", top:8, right:8, width:7, height:7, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 6px #10b981" }}/>}
      {!camOn && isLocal && <div style={{ position:"absolute", top:8, right:8 }}><VideoOff size={11} color="rgba(255,255,255,0.3)"/></div>}
    </div>
  );
}

export default function ServerRoom() {
  const { user, accessToken } = useAuth();
  const navigate  = useNavigate();
  const getToken  = () => accessToken || localStorage.getItem("najahi_token");
  const userName  = user?.prenom || user?.email?.split("@")[0] || "Anonyme";

  const [camOn, setCamOn]               = useState(false);
  const [stream, setStream]             = useState(null);
  const [mySubject, setMySubject]       = useState("");
  const [sessionSecs, setSessionSecs]   = useState(3600);
  const [sessionLeft, setSessionLeft]   = useState(3600);
  const [participants, setParticipants] = useState([]);
  const [wallpaper, setWallpaper]       = useState(WALLPAPERS[0]);
  const [showWpMenu, setShowWpMenu]     = useState(false);
  const [phase, setPhase]               = useState("focus");
  const [timeLeft, setTimeLeft]         = useState(25 * 60);
  const [isRunning, setIsRunning]       = useState(false);
  const [pomCount, setPomCount]         = useState(0);
  const [page, setPage]                 = useState(0);
  const [ready, setReady]               = useState(false);
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768);

  const socketRef  = useRef(null);
  const timerRef   = useRef(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const PER_PAGE     = 12;
  const PHASE_COLORS = { focus:"#7c3aed", break:"#10b981", longBreak:"#3b82f6" };
  const PHASE_LABELS = { focus:"Focus", break:"Pause", longBreak:"Long" };
  const phaseColor   = PHASE_COLORS[phase];
  const fmt    = (s) => `${Math.floor(s/3600).toString().padStart(2,"0")}:${Math.floor((s%3600)/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const fmtPom = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  // ── Read config from sessionStorage ──
  useEffect(() => {
    const raw = sessionStorage.getItem("najahi_stream_config");
    if (!raw) { navigate("/app/servers"); return; }
    const config = JSON.parse(raw);
    sessionStorage.removeItem("najahi_stream_config");
    setMySubject(config.subject || "");
    setSessionSecs(config.totalSecs);
    setSessionLeft(config.totalSecs);

    // Request cam if user wanted it
    if (config.camRequested) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => { setStream(s); setCamOn(true); })
        .catch(() => {});
    }
    setReady(true);
  }, []);

  // ── Socket ──
  useEffect(() => {
    if (!ready) return;
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token: getToken() },
      transports: ["polling", "websocket"],
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("join_room", {
        room_id: STREAM_ROOM_ID,
        user_id: user?.id,
        nom: userName,
        subject: mySubject,
      });
    });
    socket.on("participants_update", d => {
      setParticipants((d.participants||[])
        .filter(p => String(p.id) !== String(user?.id))
        .map(p => ({ ...p, camOn: false }))
      );
    });
    socket.on("timer_state", d => {
      setPhase(d.phase);
      setTimeLeft(d.time_left);
      setIsRunning(d.is_running);
      setPomCount(d.pom_count || 0);
    });
    return () => { socket.disconnect(); clearInterval(timerRef.current); clearInterval(sessionRef.current); };
  }, [ready]);

  // ── Pomodoro ──
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if(t<=1){clearInterval(timerRef.current);setIsRunning(false);return 0;} return t-1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // ── Session countdown ──
  useEffect(() => {
    if (!ready || sessionLeft <= 0) return;
    sessionRef.current = setInterval(() => {
      setSessionLeft(s => { if(s<=1){clearInterval(sessionRef.current);return 0;} return s-1; });
    }, 1000);
    return () => clearInterval(sessionRef.current);
  }, [ready]);

  const toggleCam = async () => {
    if (camOn) {
      stream?.getTracks().forEach(t => t.stop());
      setStream(null); setCamOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(s); setCamOn(true);
      } catch (e) { console.warn("Cam:", e); }
    }
  };

  const leave = () => {
    stream?.getTracks().forEach(t => t.stop());
    socketRef.current?.disconnect();
    clearInterval(timerRef.current);
    clearInterval(sessionRef.current);
    navigate("/app/servers");
  };

  if (!ready) return (
    <div style={{ minHeight:"100vh", background:"#0d0d14", display:"grid", placeItems:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid rgba(124,58,237,0.2)", borderTopColor:"#7c3aed", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const localParticipant = { id:user?.id, name:userName, camOn, subject:mySubject };
  const allParticipants  = [localParticipant, ...participants];
  const totalPages       = Math.ceil(allParticipants.length / PER_PAGE);
  const pageParticipants = allParticipants.slice(page*PER_PAGE, (page+1)*PER_PAGE);
  const count   = Math.max(1, pageParticipants.length);
  const cols    = count===1?1:count<=2?2:count<=4?2:count<=6?3:count<=9?3:4;
  const maxW    = count===1?320:count<=2?640:count<=4?800:count<=6?960:"100%";
  const sessPct = sessionSecs>0?((sessionSecs-sessionLeft)/sessionSecs)*100:0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes livePulse{0%,100%{opacity:0.5}50%{opacity:1}}
        .ctrl:hover{opacity:0.85;transform:scale(1.05);}
        .leave:hover{background:#dc2626 !important;}
        .menu-item:hover{background:rgba(255,255,255,0.1) !important;}
        .page-btn:hover:not(:disabled){background:rgba(255,255,255,0.15) !important;}
      `}</style>

      <div style={{ minHeight:"100vh", background:wallpaper.bg, fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", transition:"background 0.8s ease" }}>
        <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none", zIndex:0 }}/>

        {/* TOP BAR */}
        <div style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 16px", background:"rgba(0,0,0,0.55)", backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(255,255,255,0.05)", flexShrink:0, gap:12, flexWrap:"wrap" }}>

          {/* Left */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 10px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:99 }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"grid", placeItems:"center", fontSize:10, fontWeight:700, color:"#fff" }}>
                {userName[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{userName}</span>
              {mySubject && <span style={{ fontSize:10, color:"#a78bfa", fontWeight:600 }}>· {mySubject}</span>}
            </div>
            <button type="button" className="ctrl" onClick={toggleCam}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:camOn?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.07)", border:`1px solid ${camOn?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:99, cursor:"pointer", color:camOn?"#a78bfa":"rgba(255,255,255,0.5)", fontSize:11, fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
              {camOn ? <Video size={13}/> : <VideoOff size={13}/>}
              {!isMobile && (camOn ? "Cam on" : "Cam off")}
            </button>
          </div>

          {/* Center */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Session countdown */}
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:99, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", bottom:0, left:0, height:2, background:"#7c3aed", width:`${sessPct}%`, transition:"width 1s linear" }}/>
              <Timer size={11} color="rgba(255,255,255,0.35)"/>
              <span style={{ fontSize:14, fontWeight:800, color:"#fff", fontVariantNumeric:"tabular-nums", letterSpacing:"-0.5px" }}>{fmt(sessionLeft)}</span>
              <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>restant</span>
            </div>
            {/* Pagination */}
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <button type="button" className="page-btn" onClick={() => setPage(p=>Math.max(0,p-1))} disabled={page===0}
                style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", cursor:page===0?"not-allowed":"pointer", fontSize:14, display:"grid", placeItems:"center", opacity:page===0?0.4:1 }}>‹</button>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:600, minWidth:40, textAlign:"center" }}>{page+1}/{Math.max(1,totalPages)}</span>
              <button type="button" className="page-btn" onClick={() => setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}
                style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", cursor:page>=totalPages-1?"not-allowed":"pointer", fontSize:14, display:"grid", placeItems:"center", opacity:page>=totalPages-1?0.4:1 }}>›</button>
            </div>
          </div>

          {/* Right */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {/* Pomodoro */}
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:99 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:phaseColor, boxShadow:`0 0 6px ${phaseColor}`, animation:isRunning?"livePulse 1.5s infinite":"none" }}/>
              <span style={{ fontSize:15, fontWeight:800, color:"#fff", fontVariantNumeric:"tabular-nums", letterSpacing:"-0.5px", textShadow:`0 0 10px ${phaseColor}` }}>{fmtPom(timeLeft)}</span>
              <span style={{ fontSize:9, color:phaseColor, fontWeight:700 }}>{PHASE_LABELS[phase]}</span>
              <div style={{ display:"flex", gap:3 }}>
                {Array.from({length:4}).map((_,i) => (
                  <div key={i} style={{ width:4, height:4, borderRadius:"50%", background:i<(pomCount%4)?phaseColor:"rgba(255,255,255,0.1)", transition:"all 0.3s" }}/>
                ))}
              </div>
            </div>
            {/* Online */}
            <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:99 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"#10b981", animation:"livePulse 2s infinite" }}/>
              <Users size={10} color="rgba(255,255,255,0.4)"/>
              <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)" }}>{allParticipants.length}</span>
            </div>
            {/* Theme toggle */}
            <ThemeToggle/>
            {/* Wallpaper */}
            <div style={{ position:"relative" }}>
              <button type="button" onClick={() => setShowWpMenu(v=>!v)}
                style={{ padding:"5px 10px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:99, cursor:"pointer", color:"rgba(255,255,255,0.45)", fontSize:11, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
                {!isMobile && "Ambiance"}
                {isMobile && "🎨"}
              </button>
              {showWpMenu && (
                <div style={{ position:"absolute", top:"calc(100%+6px)", right:0, background:"rgba(5,2,15,0.97)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:6, minWidth:140, zIndex:200 }}>
                  {WALLPAPERS.map(wp => (
                    <button key={wp.id} type="button" className="menu-item"
                      onClick={() => { setWallpaper(wp); setShowWpMenu(false); }}
                      style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 10px", border:"none", borderRadius:8, background:wallpaper.id===wp.id?"rgba(124,58,237,0.2)":"transparent", cursor:"pointer", color:"#fff", fontSize:12, fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                      <div style={{ width:14, height:14, borderRadius:3, background:wp.bg, border:"1px solid rgba(255,255,255,0.15)", flexShrink:0 }}/>
                      {wp.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Leave */}
            <button type="button" className="leave" onClick={leave}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:"rgba(239,68,68,0.15)", border:"1.5px solid rgba(239,68,68,0.3)", borderRadius:99, cursor:"pointer", color:"#ef4444", fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
              <PhoneOff size={12}/> {!isMobile && "Quitter"}
            </button>
          </div>
        </div>

        {/* CAMERA GRID */}
        <div style={{ position:"relative", zIndex:1, flex:1, padding:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {allParticipants.length===1 && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, pointerEvents:"none" }}>
              <div style={{ fontSize:48, opacity:0.07 }}>📚</div>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.08)", fontWeight:500 }}>En attente d'autres étudiants…</p>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:10, width:"100%", maxWidth:maxW, margin:"0 auto" }}>
            {pageParticipants.map((p,i) => (
              <CamTile key={p.id||i} participant={p}
                isLocal={String(p.id)===String(user?.id)}
                camOn={String(p.id)===String(user?.id)?camOn:p.camOn}
                stream={String(p.id)===String(user?.id)?stream:null}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}