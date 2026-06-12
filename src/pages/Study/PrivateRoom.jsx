import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Play, Pause, RotateCcw, Mic, MicOff, Video, VideoOff, PhoneOff, Copy, Check, Crown, Users, Timer } from "lucide-react";
import { io } from "socket.io-client";
import { requestCamera, getCameraErrorMessage } from "../../lib/webrtc";

const PHASE_COLORS = { focus: "#7c3aed", break: "#10b981", longBreak: "#3b82f6" };
const PHASE_LABELS = { focus: "Focus", break: "Pause", longBreak: "Long break" };

function Avatar({ name, size = 80, isHost, isSpeaking }) {
  const colors = ["#7c3aed","#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];
  const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <div style={{
        width:size, height:size, borderRadius:"50%",
        background:`linear-gradient(135deg,${color},${color}99)`,
        display:"grid", placeItems:"center",
        fontSize:size*0.38, fontWeight:800, color:"#fff",
        fontFamily:"'DM Sans',sans-serif",
        boxShadow:isSpeaking?`0 0 0 3px ${color}, 0 0 20px ${color}60`:"none",
        transition:"box-shadow 0.3s",
      }}>
        {(name||"A")[0].toUpperCase()}
      </div>
      {isHost && (
        <div style={{ position:"absolute", bottom:-2, right:-2, width:20, height:20, borderRadius:"50%", background:"#f59e0b", display:"grid", placeItems:"center", border:"2px solid #0f0a1e" }}>
          <Crown size={10} color="#fff"/>
        </div>
      )}
    </div>
  );
}

function ParticipantTile({ participant, isLocal, camOn, stream, dark }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream && camOn && isLocal) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, camOn, isLocal]);

  return (
    <div style={{
      position:"relative", borderRadius:16, overflow:"hidden",
      background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.08)",
      border:`1px solid ${participant.isSpeaking?"rgba(124,58,237,0.6)":"rgba(255,255,255,0.08)"}`,
      aspectRatio:"16/9",
      display:"flex", alignItems:"center", justifyContent:"center",
      transition:"border-color 0.3s",
      boxShadow:participant.isSpeaking?"0 0 20px rgba(124,58,237,0.3)":"none",
    }}>
      {/* Video */}
      {camOn && isLocal && (
        <video ref={videoRef} autoPlay muted playsInline
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)" }}
        />
      )}

      {/* Avatar fallback */}
      {(!camOn || !isLocal) && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <Avatar name={participant.name} size={64} isHost={participant.isHost} isSpeaking={participant.isSpeaking}/>
        </div>
      )}

      {/* Name tag */}
      <div style={{ position:"absolute", bottom:10, left:10, display:"flex", alignItems:"center", gap:6, padding:"4px 10px", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", borderRadius:99 }}>
        {!participant.micOn && <MicOff size={11} color="#ef4444"/>}
        <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>
          {participant.name}{isLocal ? " (toi)" : ""}
        </span>
      </div>

      {/* Cam off indicator */}
      {!camOn && isLocal && (
        <div style={{ position:"absolute", top:10, right:10, padding:"3px 8px", background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6 }}>
          <VideoOff size={11} color="#ef4444"/>
        </div>
      )}
    </div>
  );
}

const API_URL = import.meta.env.VITE_API_URL || "";

export default function PrivateRoom() {
  const { roomId } = useParams();
  const { theme }  = useTheme();
  const { user, accessToken } = useAuth();
  const navigate   = useNavigate();
  const dark       = theme === "dark";
  const getToken   = () => accessToken || localStorage.getItem("najahi_token");
  const userName   = user?.prenom || user?.email?.split("@")[0] || "Anonyme";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  useEffect(() => {
    const handle = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  // Room
  const [room, setRoom]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [members, setMembers]   = useState([]);
  const [isHost, setIsHost]     = useState(false);
  const [copied, setCopied]     = useState(false);

  // Timer
  const [phase, setPhase]       = useState("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomCount, setPomCount] = useState(0);
  const timerRef  = useRef(null);
  const phaseRef  = useRef("focus");

  // Media
  const [micOn, setMicOn]       = useState(false);
  const [camOn, setCamOn]       = useState(false);
  const [stream, setStream]     = useState(null);
  const [camError, setCamError] = useState("");
  const [micError, setMicError] = useState("");
  const localVideoRef = useRef(null);

  // Socket
  const socketRef = useRef(null);

  // Participants (local state for UI)
  const [participants, setParticipants] = useState([]);

  const getPhaseColor = () => PHASE_COLORS[phase];

  // ── Load room ──
  useEffect(() => {
    const token = getToken();
    fetch(`${API_URL}/api/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        let d;
        try { d = await r.json(); } catch { d = {}; }
        if (!r.ok) {
          const msg = d.error || (r.status === 404 ? "Salle introuvable" : "Erreur serveur");
          setError(msg);
          setLoading(false);
          return;
        }
        if (d.error) { setError(d.error); setLoading(false); return; }
        setRoom(d.room);
        setIsHost(String(d.room.host_id) === String(user?.id));
        setTimeLeft((d.room.total_minutes || 25) * 60);
        const mems = (d.members || []).map(m => ({
          ...m, micOn: false, camOn: false, isSpeaking: false,
        }));
        setMembers(mems);
        setParticipants(mems);
        setLoading(false);
      })
      .catch(() => { setError("Erreur réseau — impossible de charger la salle"); setLoading(false); });
  }, [roomId]);

  // ── Socket ──
  useEffect(() => {
    if (loading || error) return;
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token: getToken() },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_private_room", {
        room_id: roomId, user_id: user?.id, name: userName,
      });
    });

    socket.on("room_members", d => {
      const mems = (d.members || []).map(m => ({
        ...m, micOn: false, camOn: false, isSpeaking: false,
      }));
      setParticipants(mems);
    });

    socket.on("timer_state", d => {
      setPhase(d.phase); phaseRef.current = d.phase;
      setTimeLeft(d.time_left);
      setIsRunning(d.is_running);
      setPomCount(d.pom_count || 0);
    });

    return () => { socket.disconnect(); clearInterval(timerRef.current); };
  }, [loading, error, roomId]);

  // ── Local timer ──
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setIsRunning(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const emitTimer = (action) => {
    if (!isHost) return;
    socketRef.current?.emit("timer_control", { room_id: roomId, action });
  };

  // ── Camera ──
  const toggleCam = async () => {
    if (camOn) {
      stream?.getVideoTracks().forEach(t => t.stop());
      setStream(null); setCamOn(false);
      setCamError("");
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    } else {
      setCamError("");
      try {
        const s = await requestCamera({ video: true, audio: micOn });
        setStream(s); setCamOn(true);
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
      } catch (e) {
        setCamError(e.userMessage || getCameraErrorMessage(e));
      }
    }
  };

  const toggleMic = async () => {
    if (micOn) {
      stream?.getAudioTracks().forEach(t => t.stop());
      setMicOn(false);
      setMicError("");
    } else {
      setMicError("");
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicError("Votre navigateur ne supporte pas l'accès au microphone.");
        return;
      }
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicOn(true);
      } catch (e) {
        const n = e?.name || "";
        if (n === "NotAllowedError" || n === "PermissionDeniedError")
          setMicError("Permission micro refusée. Autorisez l'accès dans les paramètres du navigateur.");
        else if (n === "NotFoundError")
          setMicError("Aucun microphone détecté sur cet appareil.");
        else
          setMicError("Impossible d'accéder au microphone.");
      }
    }
  };

  const leaveRoom = async () => {
    const token = getToken();
    stream?.getTracks().forEach(t => t.stop());
    socketRef.current?.disconnect();
    try {
      await fetch(`${API_URL}/api/rooms/${roomId}/leave`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    navigate("/app/study/rooms");
  };

  const copyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const phaseColor  = PHASE_COLORS[phase];
  const phaseDurSec = (room?.total_minutes || 25) * 60;
  const circ        = 2 * Math.PI * 20;
  const progress    = ((phaseDurSec - timeLeft) / phaseDurSec) * 100;

  // Grid layout based on participant count
  const count = Math.max(1, participants.length);
  const cols  = count === 1 ? 1 : count <= 2 ? 2 : count <= 4 ? 2 : count <= 6 ? 3 : count <= 9 ? 3 : 4;

  const localParticipant = {
    id: user?.id, name: userName,
    isHost, micOn, camOn, isSpeaking: false,
  };

  const allParticipants = [
    localParticipant,
    ...participants.filter(p => String(p.id) !== String(user?.id)),
  ];

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0510", display:"grid", placeItems:"center" }}>
      <div style={{ width:36, height:36, border:"3px solid rgba(124,58,237,0.2)", borderTopColor:"#7c3aed", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#0a0510", display:"grid", placeItems:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:18, color:"#fff", marginBottom:16 }}>{error}</p>
        <button type="button" onClick={() => navigate("/app/study/rooms")}
          style={{ padding:"10px 24px", background:"#7c3aed", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>
          Retour
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        .ctrl-btn:hover{transform:scale(1.08) !important;}
        .leave-btn:hover{background:#dc2626 !important;}
        .phase-btn:hover{opacity:0.8;}
      `}</style>

      <div style={{ minHeight:"100vh", background:"#0d0d14", fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* ── HEADER ── */}
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: isMobile ? "8px 14px" : "10px 20px", height: isMobile ? 56 : "auto", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0, zIndex:20 }}>

          {/* Left: Room name + code */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#fff", fontFamily:"'Fraunces',serif" }}>
                {room?.name || "Salle privée"}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"flex", alignItems:"center", gap:4 }}>
                <Users size={10}/>
                {allParticipants.length} participant{allParticipants.length > 1 ? "s" : ""}
              </div>
            </div>

            {/* Code */}
            <button type="button" onClick={copyCode}
              style={{ display: isMobile ? "none" : "flex", alignItems:"center", gap:6, padding:"5px 12px", background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:8, color:"#a78bfa", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.12em", transition:"all 0.2s" }}>
              {copied ? <Check size={12}/> : <Copy size={12}/>}
              {room?.code}
            </button>

            {isHost && !isMobile && (
              <span style={{ fontSize:10, fontWeight:700, color:"#f59e0b", background:"rgba(245,158,11,0.12)", padding:"3px 8px", borderRadius:99, border:"1px solid rgba(245,158,11,0.2)" }}>
                Hôte
              </span>
            )}
          </div>

          {/* Center: Pomodoro Timer */}
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"8px 16px" }}>

            {/* Mini ring */}
            <div style={{ position:"relative", width:44, height:44, display: isMobile ? "none" : "block" }}>
              <svg width="44" height="44" style={{ transform:"rotate(-90deg)" }}>
                <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
                <circle cx="22" cy="22" r="20" fill="none"
                  stroke={phaseColor} strokeWidth="3"
                  strokeDasharray={circ}
                  strokeDashoffset={circ - (progress/100)*circ}
                  strokeLinecap="round"
                  style={{ transition:"stroke-dashoffset 1s linear, stroke 0.5s", filter:`drop-shadow(0 0 6px ${phaseColor})` }}
                />
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:9, fontWeight:800, color:phaseColor, fontVariantNumeric:"tabular-nums" }}>
                  {Math.floor(timeLeft/60)}
                </span>
              </div>
            </div>

            {/* Time + phase */}
            <div>
              <div style={{ fontSize: isMobile ? 16 : 22, fontWeight:800, color:"#fff", fontVariantNumeric:"tabular-nums", letterSpacing:"-1px", lineHeight:1, textShadow:`0 0 16px ${phaseColor}` }}>
                {fmt(timeLeft)}
              </div>
              <div style={{ fontSize:10, color:phaseColor, fontWeight:600, marginTop:2 }}>
                {PHASE_LABELS[phase]}
              </div>
            </div>

            {/* Phase buttons */}
            <div style={{ display: isMobile ? "none" : "flex", gap:4 }}>
              {Object.entries(PHASE_COLORS).map(([key, color]) => (
                <button key={key} type="button" className="phase-btn"
                  onClick={() => { if(!isHost) return; emitTimer("set_phase_"+key); setPhase(key); phaseRef.current=key; }}
                  style={{ width:8, height:8, borderRadius:"50%", border:`2px solid ${color}`, background:phase===key?color:"transparent", cursor:isHost?"pointer":"default", transition:"all 0.2s", padding:0 }}
                  title={PHASE_LABELS[key]}
                />
              ))}
            </div>

            {/* Timer controls */}
            <div style={{ display:"flex", gap:6 }}>
              {isHost && (
                <button type="button" className="ctrl-btn"
                  onClick={() => { setIsRunning(false); setTimeLeft((room?.total_minutes||25)*60); setPhase("focus"); emitTimer("reset"); }}
                  style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", display:"grid", placeItems:"center", cursor:"pointer", color:"rgba(255,255,255,0.6)", transition:"all 0.2s" }}>
                  <RotateCcw size={13}/>
                </button>
              )}
              <button type="button" className="ctrl-btn"
                onClick={() => { if(!isHost) return; const next=!isRunning; setIsRunning(next); emitTimer(next?"start":"pause"); }}
                disabled={!isHost}
                title={!isHost?"Seul l'hôte contrôle le timer":""}
                style={{ width:36, height:36, borderRadius:"50%", background:isHost?`linear-gradient(135deg,${phaseColor},${phaseColor}bb)`:"rgba(107,114,128,0.3)", border:"none", display:"grid", placeItems:"center", cursor:isHost?"pointer":"not-allowed", color:"#fff", transition:"all 0.2s", boxShadow:isHost?`0 0 16px ${phaseColor}50`:"none", opacity:isHost?1:0.6 }}>
                {isRunning ? <Pause size={15}/> : <Play size={15} style={{ marginLeft:1 }}/>}
              </button>
            </div>

            {/* Pom count */}
            <div style={{ display: isMobile ? "none" : "flex", gap:4 }}>
              {Array.from({length:4}).map((_,i) => (
                <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:i<(pomCount%4)?phaseColor:"rgba(255,255,255,0.1)", transition:"all 0.3s" }}/>
              ))}
            </div>

            {!isHost && !isMobile && (
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", maxWidth:80, lineHeight:1.4 }}>
                Timer contrôlé par l'hôte
              </div>
            )}
          </div>

          {/* Right: Leave */}
          <button type="button" className="leave-btn"
            onClick={leaveRoom}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, color:"#ef4444", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
            <PhoneOff size={15}/> Quitter
          </button>
        </header>

        {/* ── BODY: Video grid ── */}
        <div style={{ flex:1, padding:"16px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:`repeat(${cols}, 1fr)`,
            gap:12,
            width:"100%",
            maxWidth:"100%",
            height:"100%",
          }}>
            {allParticipants.map((p, i) => (
              <ParticipantTile
                key={p.id || i}
                participant={p}
                isLocal={String(p.id) === String(user?.id)}
                camOn={String(p.id) === String(user?.id) ? camOn : p.camOn}
                stream={String(p.id) === String(user?.id) ? stream : null}
                dark={dark}
              />
            ))}
          </div>
        </div>

        {/* ── FOOTER: Controls ── */}
        {(camError || micError) && (
          <div style={{ padding:"8px 16px", background:"rgba(239,68,68,0.15)", borderTop:"1px solid rgba(239,68,68,0.25)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexShrink:0 }}>
            <span style={{ fontSize:12, color:"#fca5a5", fontFamily:"'DM Sans',sans-serif" }}>
              ⚠️ {camError || micError}
            </span>
            <button type="button" onClick={() => { setCamError(""); setMicError(""); }} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", cursor:"pointer", fontSize:16, padding:0 }}>×</button>
          </div>
        )}
        <footer style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, padding:"14px 20px", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>

          {/* Mic */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <button type="button" className="ctrl-btn"
              onClick={toggleMic}
              title={micError || (micOn ? "Couper le micro" : "Activer le micro")}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 18px", background:micError?"rgba(239,68,68,0.18)":micOn?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.08)", border:`1px solid ${micError?"rgba(239,68,68,0.4)":micOn?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.12)"}`, borderRadius:12, cursor:"pointer", color:micError?"#fca5a5":micOn?"#a78bfa":"rgba(255,255,255,0.7)", transition:"all 0.2s" }}>
              {micOn ? <Mic size={20}/> : <MicOff size={20} color={micError?"#ef4444":"#ef4444"}/>}
              <span style={{ fontSize:10, fontWeight:500 }}>{micError ? "Erreur" : micOn ? "Micro" : "Muet"}</span>
            </button>
          </div>

          {/* Camera */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <button type="button" className="ctrl-btn"
              onClick={toggleCam}
              title={camError || (camOn ? "Désactiver la caméra" : "Activer la caméra")}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 18px", background:camError?"rgba(239,68,68,0.18)":camOn?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.08)", border:`1px solid ${camError?"rgba(239,68,68,0.4)":camOn?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.12)"}`, borderRadius:12, cursor:"pointer", color:camError?"#fca5a5":camOn?"#a78bfa":"rgba(255,255,255,0.7)", transition:"all 0.2s" }}>
              {camOn ? <Video size={20}/> : <VideoOff size={20} color={camError?"#ef4444":"#ef4444"}/>}
              <span style={{ fontSize:10, fontWeight:500 }}>{camError ? "Erreur" : camOn ? "Caméra" : "Caméra off"}</span>
            </button>
          </div>

          {/* Separator */}
          <div style={{ width:1, height:40, background:"rgba(255,255,255,0.08)" }}/>

          {/* Status */}
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", background:"rgba(255,255,255,0.05)", borderRadius:99, border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:isRunning?"#10b981":"rgba(255,255,255,0.3)", animation:isRunning?"pulse 1.5s infinite":"none" }}/>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontWeight:500 }}>
              {isRunning ? (phase==="focus"?"Focus en cours":"Pause") : "En attente"}
            </span>
          </div>

          {/* Separator */}
          <div style={{ width:1, height:40, background:"rgba(255,255,255,0.08)" }}/>

          {/* Leave big */}
          <button type="button" className="leave-btn"
            onClick={leaveRoom}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 24px", background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:12, cursor:"pointer", color:"#ef4444", transition:"all 0.2s" }}>
            <PhoneOff size={20}/>
            <span style={{ fontSize:10, fontWeight:600 }}>Quitter</span>
          </button>
        </footer>
      </div>
    </>
  );
}