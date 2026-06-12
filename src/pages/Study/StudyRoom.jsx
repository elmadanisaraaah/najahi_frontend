import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, Users, Play, Pause, RotateCcw,
  Copy, Check, Crown, LogOut, Video, VideoOff,
  Mic, MicOff, Settings, Music, Image, Volume2,
  VolumeX, ChevronDown, Timer
} from "lucide-react";
import { requestCamera, getCameraErrorMessage } from "../../lib/webrtc";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { io } from "socket.io-client";

// ── Pomodoro presets ──────────────────────────────────────────────────────────
const PRESETS = [
  { label: "25/5",  focus: 25, break: 5,  longBreak: 15 },
  { label: "50/10", focus: 50, break: 10, longBreak: 30 },
  { label: "90/20", focus: 90, break: 20, longBreak: 45 },
  { label: "Custom", focus: 0, break: 0,  longBreak: 0  },
];

// ── Backgrounds ───────────────────────────────────────────────────────────────
const BACKGROUNDS = [
  { id: "lofi-city",   label: "Ville Lo-fi",     emoji: "🌃", type: "animated" },
  { id: "sakura",      label: "Sakura",           emoji: "🌸", type: "animated" },
  { id: "space",       label: "Espace",           emoji: "🌌", type: "animated" },
  { id: "forest",      label: "Forêt",            emoji: "🌲", type: "animated" },
  { id: "beach",       label: "Plage",            emoji: "🏖️", type: "animated" },
  { id: "rain",        label: "Pluie",            emoji: "🌧️", type: "animated" },
  { id: "cozy-room",   label: "Chambre cozy",     emoji: "🏠", type: "animated" },
  { id: "naruto",      label: "Naruto",           emoji: "🍃", type: "anime"    },
  { id: "luffy",       label: "One Piece",        emoji: "⚓", type: "anime"    },
  { id: "gojo",        label: "Jujutsu Kaisen",   emoji: "👁️", type: "anime"    },
  { id: "tanjiro",     label: "Demon Slayer",     emoji: "🔥", type: "anime"    },
  { id: "totoro",      label: "Totoro",           emoji: "🌿", type: "anime"    },
];

// ── Sounds ────────────────────────────────────────────────────────────────────
const SOUNDS = [
  { id: "lofi",    label: "Lo-fi",         emoji: "🎵", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "piano",   label: "Piano",         emoji: "🎹", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "rain",    label: "Pluie",         emoji: "🌧️", url: null },
  { id: "cafe",    label: "Café",          emoji: "☕", url: null },
  { id: "nature",  label: "Nature",        emoji: "🌿", url: null },
  { id: "ocean",   label: "Océan",         emoji: "🌊", url: null },
  { id: "fire",    label: "Cheminée",      emoji: "🔥", url: null },
  { id: "silence", label: "Silence",       emoji: "🔇", url: null },
];

// ── Quotes ────────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "Le succès, c'est tomber sept fois et se relever huit.", author: "Proverbe japonais" },
  { text: "L'éducation est l'arme la plus puissante pour changer le monde.", author: "Nelson Mandela" },
  { text: "Chaque expert a été un jour un débutant.", author: "Helen Hayes" },
  { text: "La discipline est le pont entre les objectifs et la réussite.", author: "Jim Rohn" },
  { text: "Ne compte pas les jours, rends les jours comptants.", author: "Muhammad Ali" },
  { text: "Le talent sans travail n'est rien.", author: "Zinedine Zidane" },
  { text: "Travaille en silence, laisse ton succès faire du bruit.", author: "Frank Ocean" },
  { text: "Un jour ou un autre, tu remercieras les sacrifices d'aujourd'hui.", author: "Anonyme" },
  { text: "La route vers le succès n'est jamais droite.", author: "Anonyme" },
  { text: "Fais de chaque jour ton chef-d'œuvre.", author: "John Wooden" },
];

// ── Background renderer ───────────────────────────────────────────────────────
function AnimatedBackground({ bgId }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);

    let particles = [];
    let frame = 0;

    // Initialize particles based on bg
    const initParticles = () => {
      particles = [];
      const count = bgId === "space" ? 200 : bgId === "rain" ? 150 : bgId === "sakura" ? 60 : 80;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          color: getParticleColor(bgId, i),
          angle: Math.random() * Math.PI * 2,
          wobble: Math.random() * 0.1,
          life: Math.random(),
        });
      }
    };

    const getParticleColor = (bg, i) => {
      switch (bg) {
        case "sakura":   return `hsl(${330 + Math.random()*30},${70+Math.random()*20}%,${75+Math.random()*15}%)`;
        case "space":    return `hsl(${200+Math.random()*160},${50+Math.random()*50}%,${70+Math.random()*30}%)`;
        case "forest":   return `hsl(${100+Math.random()*40},${60+Math.random()*30}%,${40+Math.random()*30}%)`;
        case "rain":     return `rgba(150,200,255,${0.3+Math.random()*0.4})`;
        case "beach":    return `hsl(${40+Math.random()*20},${60+Math.random()*30}%,${70+Math.random()*20}%)`;
        case "naruto":   return `hsl(${30+Math.random()*30},${80+Math.random()*20}%,${50+Math.random()*30}%)`;
        case "luffy":    return `hsl(${0+Math.random()*20},${80+Math.random()*20}%,${50+Math.random()*20}%)`;
        case "gojo":     return `hsl(${200+Math.random()*60},${60+Math.random()*40}%,${60+Math.random()*30}%)`;
        case "tanjiro":  return `hsl(${0+Math.random()*30},${70+Math.random()*30}%,${40+Math.random()*20}%)`;
        case "totoro":   return `hsl(${120+Math.random()*40},${50+Math.random()*30}%,${50+Math.random()*20}%)`;
        default:         return `hsl(${250+Math.random()*60},${60+Math.random()*40}%,${60+Math.random()*30}%)`;
      }
    };

    const getBgGradient = (bg) => {
      const gradients = {
        "lofi-city":  ["#0d0221","#1a0533","#2d1b69"],
        "sakura":     ["#1a0a1e","#2d1435","#4a1a4a"],
        "space":      ["#000005","#050020","#0a0040"],
        "forest":     ["#051a05","#0a2e0a","#0d3d15"],
        "beach":      ["#051020","#0a2040","#0d3060"],
        "rain":       ["#050a15","#0a1525","#0d2035"],
        "cozy-room":  ["#1a0d05","#2e1a0a","#3d2210"],
        "naruto":     ["#0a0500","#1a0d00","#2e1a05"],
        "luffy":      ["#000510","#000d20","#001530"],
        "gojo":       ["#05000a","#0a0015","#10002e"],
        "tanjiro":    ["#0a0000","#200000","#2e0505"],
        "totoro":     ["#020a02","#051505","#0a200a"],
      };
      return gradients[bg] || ["#0f0a1e","#160d2e","#0d1a2e"];
    };

    const drawBackground = (bg) => {
      const colors = getBgGradient(bg);
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0,   colors[0]);
      grad.addColorStop(0.5, colors[1]);
      grad.addColorStop(1,   colors[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Extra ambient light
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.6);
      radGrad.addColorStop(0,   "rgba(124,58,237,0.04)");
      radGrad.addColorStop(1,   "transparent");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawParticle = (p, bg) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      if (bg === "sakura" || bg === "totoro" || bg === "forest") {
        // Petal / leaf shape
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle + frame * 0.01);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (bg === "rain") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.speedX * 3, p.y - p.size * 6);
        ctx.stroke();
      } else if (bg === "space") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Twinkle
        if (Math.random() > 0.99) {
          ctx.globalAlpha = p.opacity * 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const updateParticle = (p, bg) => {
      p.angle += p.wobble;
      if (bg === "rain") {
        p.x += p.speedX * 0.5;
        p.y += p.speedY * 4;
      } else if (bg === "space") {
        p.life += 0.005;
        p.opacity = 0.3 + Math.sin(p.life) * 0.5;
      } else {
        p.x += Math.sin(p.angle) * 0.5 + p.speedX * 0.3;
        p.y += p.speedY * 0.4;
        p.angle += 0.02;
      }
      if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
      if (p.x > canvas.width + 20)  p.x = -20;
      if (p.x < -20)                p.x = canvas.width + 20;
    };

    // Draw anime character SVG shapes
    const drawAnimeAccent = (bg) => {
      const accents = {
        naruto:  { color1:"#FF7F00", color2:"#FFA500", symbol:"🍃" },
        luffy:   { color1:"#FF0000", color2:"#FF6666", symbol:"⚓" },
        gojo:    { color1:"#4169E1", color2:"#87CEEB", symbol:"👁️" },
        tanjiro: { color1:"#8B0000", color2:"#DC143C", symbol:"🔥" },
        totoro:  { color1:"#228B22", color2:"#90EE90", symbol:"🌿" },
      };
      if (!accents[bg]) return;
      const acc = accents[bg];
      // Ambient glow
      const glow = ctx.createRadialGradient(80, canvas.height - 80, 0, 80, canvas.height - 80, 120);
      glow.addColorStop(0, acc.color1 + "30");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    initParticles();

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground(bgId);
      drawAnimeAccent(bgId);
      particles.forEach(p => {
        updateParticle(p, bgId);
        drawParticle(p, bgId);
      });
      // Grid overlay
      ctx.strokeStyle = "rgba(167,139,250,0.02)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 42) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 42) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [bgId]);

  return (
    <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}/>
  );
}

// ── Sound engine ──────────────────────────────────────────────────────────────
function useSoundEngine() {
  const audioRef   = useRef(null);
  const contextRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume]   = useState(0.3);

  const play = (sound) => {
    if (sound.id === "silence" || !sound.url) {
      stop(); return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(sound.url);
    audio.loop   = true;
    audio.volume = volume;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPlaying(true);
  };

  const stop = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
  };

  const setVol = (v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  // Pomodoro end sound
  const playBell = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch {}
  };

  return { play, stop, setVol, volume, playing, playBell };
}

// ── Confetti ──────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999, overflow:"hidden" }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{
          position:"absolute",
          left: `${Math.random()*100}%`,
          top: "-20px",
          width: `${6+Math.random()*8}px`,
          height: `${6+Math.random()*8}px`,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          background: `hsl(${Math.random()*360},80%,60%)`,
          animation: `confettiFall ${1+Math.random()*2}s ${Math.random()*1}s ease-in forwards`,
          transform: `rotate(${Math.random()*360}deg)`,
        }}/>
      ))}
      <style>{`
        @keyframes confettiFall {
          to { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudyRoom() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const { theme } = useTheme();
  const navigate  = useNavigate();
  const getToken  = () => localStorage.getItem("najahi_token");

  // ── State ──
  const [room, setRoom]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isHost, setIsHost]           = useState(false);
  const [participants, setParticipants] = useState([]);
  const [copied, setCopied]           = useState(false);
  const [logoError, setLogoError]     = useState(false);

  // Timer
  const [preset, setPreset]           = useState(0);
  const [customFocus, setCustomFocus] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [phase, setPhase]             = useState("focus");
  const [timeLeft, setTimeLeft]       = useState(25 * 60);
  const [isRunning, setIsRunning]     = useState(false);
  const [pomCount, setPomCount]       = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const timerRef = useRef(null);

  // Quote
  const [quote, setQuote]             = useState(QUOTES[0]);

  // Background & Sound
  const [bgId, setBgId]               = useState("lofi-city");
  const [showBgMenu, setShowBgMenu]   = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [activeSound, setActiveSound] = useState(null);
  const sound = useSoundEngine();

  // Chat
  const [messages, setMessages]       = useState([]);
  const [msgInput, setMsgInput]       = useState("");
  const [showChat, setShowChat]       = useState(true);
  const chatEndRef = useRef(null);

  // Media
  const [roomPerms, setRoomPerms]     = useState({ camera: false, mic: false });
  const [myCamera, setMyCamera]       = useState(false);
  const [mediaError, setMediaError]   = useState("");
  const [myMic, setMyMic]             = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const streamRef = useRef(null);
  const videoRef  = useRef(null);

  // Socket
  const socketRef = useRef(null);

  // ── Fetch room ──
  useEffect(() => {
    fetch("/api/study/rooms", {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(r => r.json())
      .then(d => {
        const list  = Array.isArray(d) ? d : (d.rooms || []);
        const found = list.find(r => r.id === id);
        if (found) {
          setRoom({ ...found, name: found.nom || found.name, subject: found.sujet || found.subject });
          setTimeLeft((found.pomodoro_work || 25) * 60);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ── Socket ──
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token: getToken() }, transports: ["websocket"],
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("join_room", { room_id: id, user_id: user?.id, nom: user?.prenom || user?.email?.split("@")[0] || "Moi" });
    });
    socket.on("participants_update",  d => setParticipants(d.participants || []));
    socket.on("permissions_update",   d => { setRoomPerms(d); if(!d.camera){setMyCamera(false);stopStream("video");} if(!d.mic){setMyMic(false);stopStream("audio");} });
    socket.on("room_message",         msg => setMessages(p => [...p, msg]));
    socket.on("timer_update",         d => { setIsRunning(d.is_running); setTimeLeft(d.time_left); setPhase(d.phase||"focus"); });
    return () => { socket.emit("leave_room",{room_id:id}); socket.disconnect(); };
  }, [id, user]);

  // ── Host detection ──
  useEffect(() => {
    if (!room || !user) return;
    const me = participants.find(p => p.user_id === user.id);
    setIsHost(me?.is_host || room.host_id === user.id);
  }, [room, user, participants]);

  // ── Timer ──
  const getFocusDuration = () => {
    if (preset === 3) return customFocus * 60;
    return PRESETS[preset].focus * 60;
  };
  const getBreakDuration = () => {
    if (preset === 3) return customBreak * 60;
    return PRESETS[preset].break * 60;
  };
  const getLongBreakDuration = () => {
    if (preset === 3) return customBreak * 2 * 60;
    return PRESETS[preset].longBreak * 60;
  };

  useEffect(() => {
    clearInterval(timerRef.current);
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          sound.playBell();
          if (phase === "focus") {
            setPomCount(c => {
              const next = c + 1;
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
              setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
              if (next % 4 === 0) { setPhase("longBreak"); setTimeLeft(getLongBreakDuration()); }
              else                { setPhase("break");     setTimeLeft(getBreakDuration());     }
              return next;
            });
          } else {
            setPhase("focus");
            setTimeLeft(getFocusDuration());
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning, phase, preset, customFocus, customBreak]);

  // ── Auto scroll ──
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  // ── Helpers ──
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const phaseColors = { focus:"#7c3aed", break:"#10b981", longBreak:"#3b82f6" };
  const phaseLabels = { focus:"Focus", break:"Pause", longBreak:"Longue pause" };
  const phaseColor  = phaseColors[phase];
  const phaseDur    = phase==="focus" ? getFocusDuration() : phase==="break" ? getBreakDuration() : getLongBreakDuration();
  const circ        = 2 * Math.PI * 70;
  const progress    = ((phaseDur - timeLeft) / phaseDur) * 100;

  const timerControl = (action, extra={}) => {
    socketRef.current?.emit("timer_control",{room_id:id,action,...extra});
    if (action==="start")   setIsRunning(true);
    if (action==="pause")   setIsRunning(false);
    if (action==="reset")   { setIsRunning(false); setTimeLeft(getFocusDuration()); setPhase("focus"); }
  };

  const stopStream = (kind) => streamRef.current?.getTracks().filter(t=>t.kind===kind).forEach(t=>t.stop());

  const toggleMedia = async (type) => {
    if (type==="camera"&&!roomPerms.camera) return;
    if (type==="mic"&&!roomPerms.mic) return;
    setMediaError("");
    try {
      if (type==="camera") {
        if (myCamera) {
          stopStream("video"); setMyCamera(false);
          if(videoRef.current) videoRef.current.srcObject=null;
          socketRef.current?.emit("media_state",{room_id:id,camera:false});
        } else {
          const s = await requestCamera({video:true});
          streamRef.current=s;
          if(videoRef.current) videoRef.current.srcObject=s;
          setMyCamera(true);
          socketRef.current?.emit("media_state",{room_id:id,camera:true});
        }
      } else {
        if (myMic) {
          stopStream("audio"); setMyMic(false);
          socketRef.current?.emit("media_state",{room_id:id,mic:false});
        } else {
          if (!navigator.mediaDevices?.getUserMedia) {
            setMediaError("Votre navigateur ne supporte pas l'accès au microphone.");
            return;
          }
          const s = await navigator.mediaDevices.getUserMedia({audio:true});
          streamRef.current=s; setMyMic(true);
          socketRef.current?.emit("media_state",{room_id:id,mic:true});
        }
      }
    } catch (e) {
      setMediaError(e.userMessage || getCameraErrorMessage(e));
    }
  };

  const toggleHostPerm = (type) => {
    if (!isHost) return;
    const next = {...roomPerms,[type]:!roomPerms[type]};
    setRoomPerms(next);
    socketRef.current?.emit("update_permissions",{room_id:id,...next});
  };

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    const msg = { room_id:id, text:msgInput.trim(), sender_name:user?.prenom||user?.email?.split("@")[0]||"Moi", sender_id:user?.id, timestamp:new Date().toISOString() };
    socketRef.current?.emit("room_message",msg);
    setMessages(p=>[...p,{...msg,isOwn:true}]);
    setMsgInput("");
  };

  const copyCode = () => { if(room?.code_acces){navigator.clipboard.writeText(room.code_acces);setCopied(true);setTimeout(()=>setCopied(false),2000);} };
  const leaveRoom = async () => { stopStream("video");stopStream("audio"); await fetch(`/api/study/rooms/${id}/leave`,{method:"POST",headers:{Authorization:`Bearer ${getToken()}`}}).catch(()=>{}); navigate("/app/study"); };

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#0f0a1e",display:"grid",placeItems:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:"center",color:"#fff"}}>
        <div style={{width:40,height:40,border:"3px solid rgba(124,58,237,0.2)",borderTopColor:"#7c3aed",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
        <p style={{color:"rgba(255,255,255,0.4)"}}>Chargement…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes timerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
        @keyframes phaseChange{0%{opacity:0;transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}
        @keyframes pomDone{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
        .chat-input:focus{border-color:#7c3aed !important;box-shadow:0 0 0 3px rgba(124,58,237,0.15) !important;outline:none;}
        .chat-input::placeholder{color:rgba(255,255,255,0.2);}
        .menu-item:hover{background:rgba(255,255,255,0.1) !important;}
        .ctrl-btn:hover{transform:scale(1.08);}
        .ctrl-btn:active{transform:scale(0.96);}
      `}</style>

      {/* Animated canvas background */}
      <AnimatedBackground bgId={bgId} />

      {/* Confetti */}
      <Confetti active={showConfetti} />

      <div style={{ minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>

        {/* ── Navbar ── */}
        <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", background:"rgba(0,0,0,0.4)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0, zIndex:50 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button type="button" onClick={()=>navigate("/app/study")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"rgba(255,255,255,0.7)", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
            >
              <ArrowLeft size={13}/> Salles
            </button>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#fff", fontFamily:"'Fraunces',serif" }}>{room?.name||"Salle"}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", display:"flex", alignItems:"center", gap:4 }}>
                {room?.subject} · <strong style={{ color:"#a78bfa" }}>{room?.code_acces}</strong>
                <button type="button" onClick={copyCode} style={{ background:"none", border:"none", cursor:"pointer", color:copied?"#10b981":"#a78bfa", display:"flex", alignItems:"center" }}>
                  {copied?<Check size={11}/>:<Copy size={11}/>}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {/* Background picker */}
            <div style={{ position:"relative" }}>
              <button type="button" onClick={()=>{setShowBgMenu(v=>!v);setShowSoundMenu(false);setShowSettings(false);}}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"rgba(255,255,255,0.7)", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                <Image size={13}/> {BACKGROUNDS.find(b=>b.id===bgId)?.emoji} Décor
              </button>
              {showBgMenu && (
                <div style={{ position:"absolute", top:"calc(100%+8px)", right:0, background:"rgba(15,10,30,0.95)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:8, minWidth:220, zIndex:100, animation:"fadeIn 0.2s ease" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", padding:"4px 10px 8px", letterSpacing:"0.5px" }}>NATURE & AMBIANCES</div>
                  {BACKGROUNDS.filter(b=>b.type==="animated").map(b => (
                    <button key={b.id} type="button" className="menu-item"
                      onClick={()=>{setBgId(b.id);setShowBgMenu(false);}}
                      style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 10px", border:"none", borderRadius:8, background:bgId===b.id?"rgba(124,58,237,0.2)":"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#fff", fontSize:13 }}>
                      <span style={{ fontSize:18 }}>{b.emoji}</span> {b.label}
                      {bgId===b.id && <Check size={12} style={{ marginLeft:"auto", color:"#a78bfa" }}/>}
                    </button>
                  ))}
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", padding:"8px 10px 4px", letterSpacing:"0.5px", marginTop:4, borderTop:"1px solid rgba(255,255,255,0.07)" }}>ANIME</div>
                  {BACKGROUNDS.filter(b=>b.type==="anime").map(b => (
                    <button key={b.id} type="button" className="menu-item"
                      onClick={()=>{setBgId(b.id);setShowBgMenu(false);}}
                      style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 10px", border:"none", borderRadius:8, background:bgId===b.id?"rgba(124,58,237,0.2)":"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#fff", fontSize:13 }}>
                      <span style={{ fontSize:18 }}>{b.emoji}</span> {b.label}
                      {bgId===b.id && <Check size={12} style={{ marginLeft:"auto", color:"#a78bfa" }}/>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sound picker */}
            <div style={{ position:"relative" }}>
              <button type="button" onClick={()=>{setShowSoundMenu(v=>!v);setShowBgMenu(false);setShowSettings(false);}}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"rgba(255,255,255,0.7)", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                {sound.playing ? <Volume2 size={13}/> : <VolumeX size={13}/>}
                {activeSound ? SOUNDS.find(s=>s.id===activeSound)?.emoji : "Son"}
              </button>
              {showSoundMenu && (
                <div style={{ position:"absolute", top:"calc(100%+8px)", right:0, background:"rgba(15,10,30,0.95)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:8, minWidth:200, zIndex:100, animation:"fadeIn 0.2s ease" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", padding:"4px 10px 8px", letterSpacing:"0.5px" }}>AMBIANCE SONORE</div>
                  {SOUNDS.map(s => (
                    <button key={s.id} type="button" className="menu-item"
                      onClick={()=>{ setActiveSound(s.id); sound.play(s); setShowSoundMenu(false); }}
                      style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 10px", border:"none", borderRadius:8, background:activeSound===s.id?"rgba(124,58,237,0.2)":"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#fff", fontSize:13 }}>
                      <span style={{ fontSize:16 }}>{s.emoji}</span> {s.label}
                      {activeSound===s.id && <Check size={12} style={{ marginLeft:"auto", color:"#a78bfa" }}/>}
                    </button>
                  ))}
                  {/* Volume slider */}
                  <div style={{ padding:"8px 10px", borderTop:"1px solid rgba(255,255,255,0.07)", marginTop:4 }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>Volume</div>
                    <input type="range" min="0" max="1" step="0.05" value={sound.volume}
                      onChange={e=>sound.setVol(+e.target.value)}
                      style={{ width:"100%", accentColor:"#7c3aed" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {isHost && <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:99 }}><Crown size={11} color="#f59e0b"/><span style={{ fontSize:11, fontWeight:700, color:"#f59e0b" }}>Hôte</span></div>}

            <ThemeToggle/>

            <button type="button" onClick={leaveRoom}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, color:"#ef4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              <LogOut size={12}/> Quitter
            </button>
          </div>
        </nav>

        {/* ── Main layout ── */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:`1fr ${showChat?"340px":"0px"}`, overflow:"hidden" }}>

          {/* ── Center: Timer ── */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", gap:20, overflowY:"auto" }}>

            {/* Quote */}
            <div style={{ textAlign:"center", maxWidth:500, padding:"14px 20px", background:"rgba(0,0,0,0.3)", backdropFilter:"blur(12px)", borderRadius:14, border:"1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.8)", lineHeight:1.6, fontStyle:"italic", marginBottom:6 }}>
                "{quote.text}"
              </p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>— {quote.author}</p>
            </div>

            {/* Phase tabs */}
            <div style={{ display:"flex", gap:6, background:"rgba(0,0,0,0.3)", backdropFilter:"blur(12px)", borderRadius:12, padding:4, border:"1px solid rgba(255,255,255,0.07)" }}>
              {Object.entries(phaseColors).map(([key, color]) => (
                <button key={key} type="button"
                  onClick={() => { if(isHost){setPhase(key);setIsRunning(false);setTimeLeft(key==="focus"?getFocusDuration():key==="break"?getBreakDuration():getLongBreakDuration());} }}
                  style={{ padding:"8px 16px", borderRadius:9, border:"none", fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:isHost?"pointer":"default", transition:"all 0.3s", background:phase===key?color:"transparent", color:phase===key?"#fff":"rgba(255,255,255,0.5)", boxShadow:phase===key?`0 2px 12px ${color}60`:"none", animation:phase===key?"phaseChange 0.3s ease":"none" }}>
                  {phaseLabels[key]}
                </button>
              ))}
            </div>

            {/* Timer ring */}
            <div style={{ position:"relative", width:200, height:200, animation:isRunning?"timerPulse 2s ease-in-out infinite":"none" }}>
              <svg width="200" height="200" style={{ transform:"rotate(-90deg)" }}>
                <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                <circle cx="100" cy="100" r="70" fill="none" stroke={phaseColor} strokeWidth="10"
                  strokeDasharray={circ} strokeDashoffset={circ-(progress/100)*circ}
                  strokeLinecap="round" style={{ transition:"stroke-dashoffset 1s linear, stroke 0.5s", filter:`drop-shadow(0 0 8px ${phaseColor}80)` }}
                />
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:48, fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontVariantNumeric:"tabular-nums", letterSpacing:"-2px", textShadow:`0 0 20px ${phaseColor}80` }}>
                  {fmt(timeLeft)}
                </span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:4, fontWeight:500 }}>
                  {phaseLabels[phase]}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display:"flex", gap:14, alignItems:"center" }}>
              {/* Preset picker */}
              <div style={{ position:"relative" }}>
                <button type="button" className="ctrl-btn"
                  onClick={()=>{ if(isHost) setShowPresetMenu(v=>!v); }}
                  disabled={!isHost}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, color:"rgba(255,255,255,0.7)", fontSize:12, fontWeight:600, cursor:isHost?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", opacity:isHost?1:0.4 }}>
                  <Timer size={13}/> {PRESETS[preset].label} <ChevronDown size={11}/>
                </button>
                {showPresetMenu && isHost && (
                  <div style={{ position:"absolute", bottom:"calc(100%+8px)", left:0, background:"rgba(15,10,30,0.95)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:8, minWidth:200, zIndex:100, animation:"fadeIn 0.2s ease" }}>
                    {PRESETS.map((p, i) => (
                      <button key={i} type="button" className="menu-item"
                        onClick={()=>{ setPreset(i); setPhase("focus"); setIsRunning(false); setShowPresetMenu(false); if(i!==3) setTimeLeft(p.focus*60); }}
                        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"8px 10px", border:"none", borderRadius:8, background:preset===i?"rgba(124,58,237,0.2)":"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#fff", fontSize:13 }}>
                        <span style={{ fontWeight:600 }}>{p.label}</span>
                        {i!==3 && <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{p.focus}min / {p.break}min</span>}
                        {preset===i && <Check size={12} color="#a78bfa"/>}
                      </button>
                    ))}
                    {preset===3 && (
                      <div style={{ padding:"8px 10px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", gap:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:4 }}>Focus (min)</div>
                          <input type="number" min="1" max="120" value={customFocus}
                            onChange={e=>{setCustomFocus(+e.target.value);setTimeLeft(+e.target.value*60);}}
                            style={{ width:"100%", padding:"6px 8px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#fff", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
                          />
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:4 }}>Pause (min)</div>
                          <input type="number" min="1" max="60" value={customBreak}
                            onChange={e=>setCustomBreak(+e.target.value)}
                            style={{ width:"100%", padding:"6px 8px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#fff", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reset */}
              <button type="button" className="ctrl-btn"
                onClick={()=>{if(isHost)timerControl("reset");}}
                disabled={!isHost}
                style={{ width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", display:"grid", placeItems:"center", cursor:isHost?"pointer":"not-allowed", color:isHost?"#fff":"rgba(255,255,255,0.3)", transition:"all 0.2s" }}>
                <RotateCcw size={17}/>
              </button>

              {/* Play/Pause */}
              <button type="button" className="ctrl-btn"
                onClick={()=>{if(isHost)timerControl(isRunning?"pause":"start");}}
                disabled={!isHost}
                style={{ width:72, height:72, borderRadius:"50%", background:isHost?`linear-gradient(135deg,${phaseColor},${phaseColor}cc)`:"rgba(107,114,128,0.3)", border:"none", display:"grid", placeItems:"center", cursor:isHost?"pointer":"not-allowed", color:"#fff", transition:"all 0.2s", boxShadow:isHost?`0 0 24px ${phaseColor}60,0 8px 28px ${phaseColor}40`:"none" }}>
                {isRunning ? <Pause size={28}/> : <Play size={28} style={{ marginLeft:4 }}/>}
              </button>

              {/* Pomodoro count */}
              <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                <span style={{ fontSize:18, fontWeight:700, color:phaseColor, lineHeight:1 }}>{pomCount}</span>
                <span style={{ fontSize:8, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>🍅</span>
              </div>

              {/* Pomodoro dots */}
              <div style={{ display:"flex", gap:5 }}>
                {Array.from({length:4}).map((_,i) => (
                  <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:i<(pomCount%4)?"#7c3aed":"rgba(255,255,255,0.1)", transition:"all 0.3s", boxShadow:i<(pomCount%4)?`0 0 8px #7c3aed60`:"none" }}/>
                ))}
              </div>
            </div>

            {!isHost && <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>Seul l'hôte contrôle le timer</p>}

            {/* Video preview */}
            {myCamera && (
              <div style={{ width:240, borderRadius:14, overflow:"hidden", border:"1px solid rgba(255,255,255,0.1)", position:"relative" }}>
                <video ref={videoRef} autoPlay muted playsInline style={{ width:"100%", height:160, objectFit:"cover", display:"block" }}/>
                <div style={{ position:"absolute", bottom:6, left:8, fontSize:11, color:"#fff", background:"rgba(0,0,0,0.6)", padding:"2px 8px", borderRadius:99 }}>
                  {user?.prenom||"Toi"}
                </div>
              </div>
            )}

            {/* Participants row */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", maxWidth:600 }}>
              {(participants.length > 0 ? participants : [{name:user?.prenom||"Toi",is_host:true}]).map((p,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:"rgba(0,0,0,0.3)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:99 }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:`hsl(${i*60+250},60%,60%)`, display:"grid", placeItems:"center", fontSize:10, fontWeight:700, color:"#fff" }}>
                    {(p.name||"U")[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontWeight:500 }}>{p.name}</span>
                  {p.is_host && <Crown size={10} color="#f59e0b"/>}
                  {p.camera  && <Video  size={10} color="#10b981"/>}
                  {p.mic     && <Mic    size={10} color="#10b981"/>}
                </div>
              ))}
            </div>

            {/* Media + Settings */}
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              {/* Camera */}
              <button type="button"
                onClick={()=>toggleMedia("camera")}
                disabled={!roomPerms.camera}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:myCamera?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.06)", border:`1px solid ${myCamera?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:10, color:myCamera?"#a78bfa":roomPerms.camera?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.2)", fontSize:12, fontWeight:600, cursor:roomPerms.camera?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                {myCamera?<Video size={14}/>:<VideoOff size={14}/>}
                {myCamera?"Caméra ON":"Caméra"}
              </button>

              {/* Mic */}
              <button type="button"
                onClick={()=>toggleMedia("mic")}
                disabled={!roomPerms.mic}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:myMic?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.06)", border:`1px solid ${myMic?"rgba(16,185,129,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:10, color:myMic?"#10b981":roomPerms.mic?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.2)", fontSize:12, fontWeight:600, cursor:roomPerms.mic?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                {myMic?<Mic size={14}/>:<MicOff size={14}/>}
                {myMic?"Micro ON":"Micro"}
              </button>

              {/* Host settings */}
              {isHost && (
                <div style={{ position:"relative" }}>
                  <button type="button" onClick={()=>setShowSettings(v=>!v)}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:10, color:"#f59e0b", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    <Settings size={13}/> Permissions
                  </button>
                  {showSettings && (
                    <div style={{ position:"absolute", bottom:"calc(100%+8px)", left:0, background:"rgba(15,10,30,0.95)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:16, minWidth:220, zIndex:100, animation:"fadeIn 0.2s ease" }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.6)", marginBottom:12 }}>Autoriser pour tous</div>
                      {[{type:"camera",label:"Caméra",Icon:Video},{type:"mic",label:"Micro",Icon:Mic}].map(({type,label,Icon})=>(
                        <div key={type} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <Icon size={14} color={roomPerms[type]?"#10b981":"rgba(255,255,255,0.4)"}/>
                            <span style={{ fontSize:13, color:"#fff" }}>{label}</span>
                          </div>
                          <div style={{ width:40, height:22, borderRadius:99, background:roomPerms[type]?"#7c3aed":"rgba(107,114,128,0.3)", cursor:"pointer", position:"relative", transition:"background 0.2s" }}
                            onClick={()=>toggleHostPerm(type)}>
                            <div style={{ position:"absolute", top:3, left:roomPerms[type]?20:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Toggle chat */}
              <button type="button"
                onClick={()=>setShowChat(v=>!v)}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", background:showChat?"rgba(124,58,237,0.15)":"rgba(255,255,255,0.06)", border:`1px solid ${showChat?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.1)"}`, borderRadius:10, color:showChat?"#a78bfa":"rgba(255,255,255,0.5)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                💬 {showChat?"Chat ON":"Chat"}
              </button>
            </div>
          </div>

          {/* ── Right: Chat ── */}
          {showChat && (
            <div style={{ borderLeft:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", background:"rgba(0,0,0,0.35)", backdropFilter:"blur(16px)" }}>
              <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>Chat</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Messages en temps réel</div>
              </div>

              <div style={{ flex:1, overflowY:"auto", padding:"14px", display:"flex", flexDirection:"column", gap:10 }}>
                {messages.length===0 && (
                  <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(255,255,255,0.25)", fontSize:13, lineHeight:1.8 }}>
                    Pas encore de messages<br/>Dis bonjour ! 👋
                  </div>
                )}
                {messages.map((msg,i) => (
                  <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:msg.isOwn?"flex-end":"flex-start", animation:"msgIn 0.2s ease both" }}>
                    {!msg.isOwn && <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:3, paddingLeft:4 }}>{msg.sender_name}</span>}
                    <div style={{ maxWidth:"82%", padding:"8px 12px", borderRadius:msg.isOwn?"14px 14px 4px 14px":"14px 14px 14px 4px", background:msg.isOwn?"linear-gradient(135deg,#7c3aed,#a78bfa)":"rgba(255,255,255,0.08)", color:"#fff", fontSize:13, lineHeight:1.5, wordBreak:"break-word", backdropFilter:"blur(8px)" }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:2, paddingLeft:msg.isOwn?0:4, paddingRight:msg.isOwn?4:0 }}>
                      {msg.timestamp?new Date(msg.timestamp).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):""}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>

              <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", gap:8, flexShrink:0 }}>
                <input className="chat-input" type="text"
                  placeholder="Écris un message…"
                  value={msgInput}
                  onChange={e=>setMsgInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}
                  style={{ flex:1, padding:"10px 14px", background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:13, color:"#fff", fontFamily:"'DM Sans',sans-serif", outline:"none", transition:"all 0.2s" }}
                />
                <button type="button" onClick={sendMsg} disabled={!msgInput.trim()}
                  style={{ width:40, height:40, borderRadius:10, background:msgInput.trim()?"linear-gradient(135deg,#7c3aed,#a78bfa)":"rgba(255,255,255,0.08)", border:"none", display:"grid", placeItems:"center", cursor:msgInput.trim()?"pointer":"not-allowed", transition:"all 0.2s", color:"#fff", flexShrink:0 }}>
                  <Send size={15}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media error banner */}
      {mediaError && (
        <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", padding:"10px 18px", borderRadius:12, background:"rgba(239,68,68,0.18)", border:"1px solid rgba(239,68,68,0.3)", color:"#fca5a5", fontSize:13, fontFamily:"'DM Sans',sans-serif", zIndex:9999, display:"flex", alignItems:"center", gap:10, maxWidth:"90vw" }}>
          ⚠️ {mediaError}
          <button type="button" onClick={() => setMediaError("")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:16, padding:0, lineHeight:1 }}>×</button>
        </div>
      )}
    </>
  );
}