import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Image, Timer, ChevronDown, Check, Music, Link, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const PRESETS = [
  { label: "25/5",   focus: 25, break: 5,  longBreak: 15 },
  { label: "50/10",  focus: 50, break: 10, longBreak: 30 },
  { label: "90/20",  focus: 90, break: 20, longBreak: 45 },
  { label: "Custom", focus: 0,  break: 0,  longBreak: 0  },
];

const PHASE_COLORS = { focus: "#7c3aed", break: "#10b981", longBreak: "#3b82f6" };
const PHASE_LABELS = { focus: "Focus", break: "Pause courte", longBreak: "Pause longue" };

const WALLPAPERS = [
  { id: "sakura",       label: "Sakura",            type: "nature",   url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80" },
  { id: "forest",       label: "Forêt",             type: "nature",   url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80" },
  { id: "beach",        label: "Plage",             type: "nature",   url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80" },
  { id: "mountains",    label: "Montagnes",         type: "nature",   url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80" },
  { id: "aurora",       label: "Aurore boréale",    type: "nature",   url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80" },
  { id: "desert",       label: "Désert",            type: "nature",   url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80" },
  { id: "waterfall",    label: "Cascade",           type: "nature",   url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80" },
  { id: "lavender",     label: "Lavande",           type: "nature",   url: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1920&q=80" },
  { id: "autumn",       label: "Automne",           type: "nature",   url: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1920&q=80" },
  { id: "snowy",        label: "Neige",             type: "nature",   url: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80" },
  { id: "space",        label: "Galaxie",           type: "space",    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80" },
  { id: "moon",         label: "Lune",              type: "space",    url: "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=1920&q=80" },
  { id: "nebula",       label: "Nébuleuse",         type: "space",    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80" },
  { id: "night-city",   label: "Nuit urbaine",      type: "space",    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80" },
  { id: "starry",       label: "Étoiles",           type: "space",    url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80" },
  { id: "lofi-city",    label: "Ville Lo-fi",       type: "ambiance", url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&q=80" },
  { id: "cozy-cafe",    label: "Café cozy",         type: "ambiance", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80" },
  { id: "neon-city",    label: "Néon city",         type: "ambiance", url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1920&q=80" },
  { id: "rainy-window", label: "Fenêtre pluvieuse", type: "ambiance", url: "https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=1920&q=80" },
  { id: "cozy-room",    label: "Chambre cozy",      type: "ambiance", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80" },
  // Animated CSS themes
  { id: "anim-espace",  label: "Espace",   type: "animated", animated: true, bgColor: "#020817", url: null },
  { id: "anim-ocean",   label: "Océan",    type: "animated", animated: true, bgColor: "#0b1340", url: null },
  { id: "anim-foret",   label: "Forêt",    type: "animated", animated: true, bgColor: "#010c06", url: null },
  { id: "anim-sakura",  label: "Pétales",  type: "animated", animated: true, bgColor: "#0f0520", url: null },
  { id: "anim-ville",   label: "Ville",    type: "animated", animated: true, bgColor: "#020c18", url: null },
  { id: "anim-nuages",  label: "Nuages",   type: "animated", animated: true, bgColor: "#040c1c", url: null },
  { id: "anim-feu",     label: "Feu",      type: "animated", animated: true, bgColor: "#050100", url: null },
  { id: "anim-nuit",    label: "Nuit",     type: "animated", animated: true, bgColor: "#030510", url: null },
];

const SOUNDS = [
  { id: "tick",      label: "Tic-tac",          builtin: true,  url: null },
  { id: "silence",   label: "Silence",           builtin: false, url: null },
  { id: "lofi1",     label: "Lo-fi chill",       builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "lofi2",     label: "Lo-fi beats",       builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "lofi3",     label: "Lo-fi jazz",        builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
  { id: "piano1",    label: "Piano doux",        builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "piano2",    label: "Piano classique",   builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { id: "guitar",    label: "Guitare acoustique",builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: "ambient1",  label: "Ambient doux",      builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { id: "ambient2",  label: "Ambient focus",     builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { id: "jazz",      label: "Jazz café",         builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { id: "classical", label: "Classique",         builtin: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
];

const SND_GROUPS = [
  { ids: ["tick","silence"],                         label: "EFFETS" },
  { ids: ["lofi1","lofi2","lofi3"],                  label: "LO-FI" },
  { ids: ["piano1","piano2","guitar"],               label: "INSTRUMENTAL" },
  { ids: ["ambient1","ambient2","jazz","classical"], label: "AMBIANCE" },
];

const WP_GROUPS = [
  { type: "animated", label: "ANIMÉS (CSS)" },
  { type: "nature",   label: "NATURE & PAYSAGES" },
  { type: "space",    label: "ESPACE & NUIT" },
  { type: "ambiance", label: "AMBIANCE" },
];

const QUOTES = [
  { text: "Le succès, c'est tomber sept fois et se relever huit.", author: "Proverbe japonais" },
  { text: "La discipline est le pont entre les objectifs et la réussite.", author: "Jim Rohn" },
  { text: "Chaque expert a été un jour un débutant.", author: "Helen Hayes" },
  { text: "Travaille en silence, laisse ton succès faire du bruit.", author: "Frank Ocean" },
  { text: "Un jour ou un autre, tu remercieras les sacrifices d'aujourd'hui.", author: "Anonyme" },
  { text: "Le talent sans travail n'est rien.", author: "Zinedine Zidane" },
  { text: "Fais de chaque jour ton chef-d'œuvre.", author: "John Wooden" },
  { text: "Ne compte pas les jours, rends les jours comptants.", author: "Muhammad Ali" },
  { text: "Concentre-toi sur le processus, pas sur le résultat.", author: "Anonyme" },
  { text: "Chaque minute de travail acharné compte.", author: "Anonyme" },
  { text: "La persévérance est la clé du succès.", author: "Proverbe" },
  { text: "Commence là où tu es, utilise ce que tu as, fais ce que tu peux.", author: "Arthur Ashe" },
  { text: "L'éducation est l'arme la plus puissante pour changer le monde.", author: "Nelson Mandela" },
  { text: "Investis en toi-même, c'est le meilleur investissement.", author: "Warren Buffett" },
  { text: "La réussite appartient à ceux qui persévèrent.", author: "Anonyme" },
];

function AnimatedBg({ id }) {
  const data = useMemo(() => {
    let seed = id.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 1);
    const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const stars   = Array.from({ length: 160 }, () => ({ left:`${rng()*100}%`, top:`${rng()*100}%`, size:0.8+rng()*2.5, delay:rng()*5, dur:1.5+rng()*3 }));
    const petals  = Array.from({ length: 30  }, () => ({ left:`${rng()*115-5}%`, delay:rng()*12, dur:5+rng()*8, size:6+rng()*14, rot:rng()*360 }));
    const clouds  = Array.from({ length: 8   }, () => ({ top:`${5+rng()*60}%`, dur:25+rng()*35, delay:-(rng()*25), w:100+rng()*220, h:50+rng()*90, op:0.05+rng()*0.13 }));
    const flies   = Array.from({ length: 24  }, () => ({ left:`${rng()*100}%`, top:`${15+rng()*75}%`, delay:rng()*5, dur:3+rng()*6 }));
    const windows = Array.from({ length: 90  }, () => ({ left:`${rng()*100}%`, top:`${25+rng()*60}%`, w:2+rng()*5, h:3+rng()*8, delay:rng()*8, dur:1+rng()*6, hue:rng() }));
    return { stars, petals, clouds, flies, windows };
  }, [id]);

  const A = { position:"absolute" };

  if (id === "anim-espace") return (
    <div style={{ ...A, inset:0, background:"linear-gradient(180deg,#020817 0%,#0a1230 100%)" }}>
      {[{t:"18%",l:"28%",sz:240,c:"rgba(99,102,241,0.14)"},{t:"65%",l:"72%",sz:300,c:"rgba(16,185,129,0.09)"},{t:"40%",l:"8%",sz:180,c:"rgba(239,68,68,0.08)"}].map((n,i)=>(
        <div key={i} style={{ ...A, top:n.t, left:n.l, width:n.sz, height:n.sz, borderRadius:"50%", background:`radial-gradient(circle,${n.c} 0%,transparent 70%)`, animation:`nebulaPulse ${3+i*2}s ease-in-out infinite`, transform:"translate(-50%,-50%)" }}/>
      ))}
      {data.stars.map((s,i)=>(
        <div key={i} style={{ ...A, left:s.left, top:s.top, width:s.size, height:s.size, borderRadius:"50%", background:"#fff", animation:`${i%3===0?"twinkleFast":"twinkle"} ${s.dur}s ${s.delay}s ease-in-out infinite` }}/>
      ))}
    </div>
  );

  if (id === "anim-ocean") return (
    <div style={{ ...A, inset:0, background:"linear-gradient(180deg,#0b1340 0%,#0a345a 45%,#0d5c7a 100%)" }}>
      {[0,1,2].map(i=>(
        <div key={i} style={{ ...A, bottom:`${i*10-2}%`, left:"-10%", right:"-10%", height:"28%", background:`rgba(14,165,233,${0.13-i*0.035})`, borderRadius:"50% 50% 0 0 / 55% 55% 0 0", animation:`waveRise ${3.5+i*1.5}s ${i*-1.2}s ease-in-out infinite` }}/>
      ))}
      {data.stars.slice(0,40).map((s,i)=>(
        <div key={i} style={{ ...A, left:s.left, top:`${parseFloat(s.top)*0.35}%`, width:1.5, height:1.5, borderRadius:"50%", background:"rgba(255,255,255,0.65)", animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }}/>
      ))}
    </div>
  );

  if (id === "anim-foret") return (
    <div style={{ ...A, inset:0, background:"linear-gradient(180deg,#010c06 0%,#042212 65%,#071a0c 100%)" }}>
      <div style={{ ...A, inset:0, background:"radial-gradient(ellipse at 50% 100%,rgba(16,185,129,0.13) 0%,transparent 60%)" }}/>
      <div style={{ ...A, inset:0, background:"radial-gradient(ellipse at 20% 80%,rgba(5,150,105,0.08) 0%,transparent 50%)" }}/>
      {data.flies.map((f,i)=>(
        <div key={i} style={{ ...A, left:f.left, top:f.top, width:3, height:3, borderRadius:"50%", background:"#a7f3d0", boxShadow:"0 0 7px 3px rgba(167,243,208,0.5)", animation:`fireflyFloat ${f.dur}s ${f.delay}s ease-in-out infinite` }}/>
      ))}
    </div>
  );

  if (id === "anim-sakura") return (
    <div style={{ ...A, inset:0, background:"linear-gradient(180deg,#0f0520 0%,#180832 55%,#0d0218 100%)" }}>
      <div style={{ ...A, inset:0, background:"radial-gradient(ellipse at 50% 0%,rgba(244,114,182,0.16) 0%,transparent 55%)" }}/>
      {data.petals.map((p,i)=>(
        <div key={i} style={{ ...A, left:p.left, top:"-18px", width:p.size, height:p.size*0.55, borderRadius:"60% 10% 60% 10%", background:`rgba(${238+i%10},${100+i%45},${168+i%35},0.72)`, transform:`rotate(${p.rot}deg)`, animation:`petalFall ${p.dur}s ${p.delay}s linear infinite` }}/>
      ))}
    </div>
  );

  if (id === "anim-ville") return (
    <div style={{ ...A, inset:0, background:"linear-gradient(180deg,#020c18 0%,#050f20 65%,#06090f 100%)" }}>
      <div style={{ ...A, bottom:0, left:0, right:0, height:"40%", background:"radial-gradient(ellipse at 50% 100%,rgba(30,64,175,0.22) 0%,transparent 70%)" }}/>
      {data.windows.map((w,i)=>(
        <div key={i} style={{ ...A, left:w.left, top:w.top, width:w.w, height:w.h, background:w.hue>0.6?"#fbbf24":w.hue>0.3?"#a78bfa":"#60a5fa", borderRadius:1, opacity:0.85, animation:`cityBlink ${w.dur}s ${w.delay}s ease-in-out infinite` }}/>
      ))}
    </div>
  );

  if (id === "anim-nuages") return (
    <div style={{ ...A, inset:0, background:"linear-gradient(180deg,#040c1c 0%,#0f1f38 100%)" }}>
      {data.stars.slice(0,70).map((s,i)=>(
        <div key={i} style={{ ...A, left:s.left, top:s.top, width:s.size*0.65, height:s.size*0.65, borderRadius:"50%", background:"rgba(255,255,255,0.75)", animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }}/>
      ))}
      {data.clouds.map((c,i)=>(
        <div key={i} style={{ ...A, top:c.top, left:0, width:c.w, height:c.h, background:"rgba(255,255,255,0.07)", borderRadius:"50%", boxShadow:`0 0 40px 10px rgba(255,255,255,${c.op})`, filter:"blur(10px)", animation:`cloudDrift ${c.dur}s ${c.delay}s linear infinite` }}/>
      ))}
    </div>
  );

  if (id === "anim-feu") return (
    <div style={{ ...A, inset:0, background:"linear-gradient(180deg,#050100 0%,#1c0600 100%)" }}>
      <div style={{ ...A, bottom:0, left:"5%", right:"5%", height:"75%", background:"radial-gradient(ellipse at 50% 100%,rgba(251,146,60,0.45) 0%,rgba(239,68,68,0.3) 30%,transparent 70%)", animation:"nebulaPulse 0.9s ease-in-out infinite" }}/>
      {[{w:"52%",h:"52%",c:"rgba(251,191,36,0.3)",d:"0.85s"},{w:"36%",h:"64%",c:"rgba(249,115,22,0.28)",d:"1.1s"},{w:"22%",h:"74%",c:"rgba(239,68,68,0.22)",d:"0.7s"}].map((f,i)=>(
        <div key={i} style={{ ...A, bottom:0, left:"50%", width:f.w, height:f.h, background:`radial-gradient(ellipse at 50% 100%,${f.c} 0%,transparent 70%)`, animation:`fireFlicker ${f.d} ${i*0.15}s ease-in-out infinite`, filter:"blur(18px)" }}/>
      ))}
      {data.flies.slice(0,18).map((f,i)=>(
        <div key={i} style={{ ...A, left:`${20+parseFloat(f.left)*0.6}%`, top:`${55+(i%18)*1.8}%`, width:2, height:2, borderRadius:"50%", background:"#fcd34d", boxShadow:"0 0 4px 2px rgba(252,211,77,0.7)", animation:`fireflyFloat ${f.dur*0.55}s ${f.delay}s ease-in-out infinite` }}/>
      ))}
    </div>
  );

  // anim-nuit (default)
  return (
    <div style={{ ...A, inset:0, background:"linear-gradient(180deg,#030510 0%,#0a0e24 70%,#06091e 100%)" }}>
      <div style={{ ...A, top:"10%", right:"18%", width:55, height:55, borderRadius:"50%", background:"radial-gradient(circle,#f1f5f9 0%,#e2e8f0 45%,rgba(226,232,240,0.2) 100%)", boxShadow:"0 0 25px rgba(241,245,249,0.5),0 0 70px rgba(241,245,249,0.18)" }}/>
      {data.stars.map((s,i)=>(
        <div key={i} style={{ ...A, left:s.left, top:s.top, width:s.size, height:s.size, borderRadius:"50%", background:"#fff", animation:`${i%4===0?"twinkleFast":"twinkle"} ${s.dur}s ${s.delay}s ease-in-out infinite` }}/>
      ))}
    </div>
  );
}

function Confetti({ active }) {
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999, overflow:"hidden" }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{
          position:"absolute", left:`${Math.random()*100}%`, top:"-20px",
          width:`${6+Math.random()*8}px`, height:`${6+Math.random()*8}px`,
          borderRadius: Math.random()>0.5?"50%":"2px",
          background:`hsl(${Math.random()*360},80%,60%)`,
          animation:`confettiFall ${1+Math.random()*2}s ${Math.random()}s ease-in forwards`,
        }}/>
      ))}
      <style>{`@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}}`}</style>
    </div>
  );
}

// Convert any music URL to embed
function getMusicEmbed(url) {
  if (!url) return null;

  // Spotify — extrait juste le type et l'ID, ignore les query params
  const spotifyMatch = url.match(/spotify\.com\/(playlist|album|artist|track)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    return {
      type: "spotify",
      src: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`
    };
  }

  // YouTube playlist
  const ytPlaylist = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (ytPlaylist) {
    return {
      type: "youtube",
      src: `https://www.youtube.com/embed/videoseries?list=${ytPlaylist[1]}&autoplay=1`
    };
  }

  // YouTube video
  const ytVideo = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (ytVideo) {
    return {
      type: "youtube",
      src: `https://www.youtube.com/embed/${ytVideo[1]}?autoplay=1`
    };
  }

  return null;
}

export default function Solo() {
  const { theme } = useTheme();
  const navigate  = useNavigate();

  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet]           = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [preset, setPreset]               = useState(0);
  const [customFocus, setCustomFocus]     = useState(25);
  const [customBreak, setCustomBreak]     = useState(5);
  const [phase, setPhase]                 = useState("focus");
  const [timeLeft, setTimeLeft]           = useState(25 * 60);
  const [isRunning, setIsRunning]         = useState(false);
  const [pomCount, setPomCount]           = useState(0);
  const [showConfetti, setShowConfetti]   = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [wallpaper, setWallpaper]         = useState(WALLPAPERS[0]);
  const [showWpMenu, setShowWpMenu]       = useState(false);
  const [activeSound, setActiveSound]     = useState(SOUNDS[0]);
  const [showSndMenu, setShowSndMenu]     = useState(false);
  const [volume, setVolume]               = useState(0.5);
  const [imgLoaded, setImgLoaded]         = useState(false);
  const [quote, setQuote]                 = useState(QUOTES[0]);
  const [logoError, setLogoError]         = useState(false);

  // Music link
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [musicInput, setMusicInput]         = useState("");
  const [musicEmbed, setMusicEmbed]         = useState(null);
  const [showPlayer, setShowPlayer]         = useState(false);

  const timerRef      = useRef(null);
  const phaseRef      = useRef("focus");
  const pomRef        = useRef(0);
  const audioRef      = useRef(null);
  const quoteIdxRef   = useRef(0);
  const sessionIdRef  = useRef(null);
  const sessionStartRef = useRef(null);

  const getFocus     = () => preset===3 ? customFocus*60   : PRESETS[preset].focus*60;
  const getBreak     = () => preset===3 ? customBreak*60   : PRESETS[preset].break*60;
  const getLongBreak = () => preset===3 ? customBreak*2*60 : PRESETS[preset].longBreak*60;
  const getDuration  = (p) => p==="focus" ? getFocus() : p==="break" ? getBreak() : getLongBreak();

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Quote rotation every 3 min
  useEffect(() => {
    const t = setInterval(() => {
      quoteIdxRef.current = (quoteIdxRef.current + 1) % QUOTES.length;
      setQuote(QUOTES[quoteIdxRef.current]);
    }, 3 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const startSoloSession = async () => {
    const tkn = localStorage.getItem("najahi_token");
    if (!tkn) return;
    try {
      const res = await fetch(`${API_BASE}/api/study/solo/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tkn}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        sessionIdRef.current = data.session_id;
        sessionStartRef.current = Date.now();
      }
    } catch {}
  };

  const endSoloSession = (durationMinutes) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    sessionIdRef.current = null;
    sessionStartRef.current = null;
    const tkn = localStorage.getItem("najahi_token");
    if (!tkn) return;
    fetch(`${API_BASE}/api/study/solo/end`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tkn}`, "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid, duration_minutes: Math.max(0.01, durationMinutes) }),
    }).catch(() => {});
  };

  const endSoloSessionElapsed = () => {
    if (!sessionIdRef.current) return;
    const elapsed = sessionStartRef.current
      ? (Date.now() - sessionStartRef.current) / 60000
      : 0;
    endSoloSession(elapsed);
  };

  const playBell = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime + t);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + t + 0.5);
        gain.gain.setValueAtTime(0.5, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 1);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 1);
      });
    } catch {}
  };

  const playTick = () => {
    if (activeSound.id !== "tick") return;
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
      }
      const src  = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      filt.type = "highpass"; filt.frequency.value = 2500;
      src.buffer = buf;
      src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      gain.gain.value = volume * 0.9;
      src.start(); src.stop(ctx.currentTime + 0.04);
    } catch {}
  };

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { pomRef.current   = pomCount; }, [pomCount]);

  // End active solo session when user leaves the page
  useEffect(() => {
    return () => { endSoloSessionElapsed(); };
  }, []);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      playTick();
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          playBell();
          const curPhase = phaseRef.current;
          const curPom   = pomRef.current;
          if (curPhase === "focus") {
            endSoloSessionElapsed();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            quoteIdxRef.current = (quoteIdxRef.current + 1) % QUOTES.length;
            setQuote(QUOTES[quoteIdxRef.current]);
            const newPom = curPom + 1;
            setPomCount(newPom);
            pomRef.current = newPom;
            const nextPhase = newPom % 4 === 0 ? "longBreak" : "break";
            setPhase(nextPhase);
            phaseRef.current = nextPhase;
            setTimeout(() => { setTimeLeft(getDuration(nextPhase)); setIsRunning(true); startSoloSession(); }, 2500);
            return 0;
          } else {
            setPhase("focus");
            phaseRef.current = "focus";
            setTimeout(() => { setTimeLeft(getFocus()); setIsRunning(true); startSoloSession(); }, 2500);
            return 0;
          }
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning, preset, customFocus, customBreak, activeSound.id, volume]);

  // Sound
  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
    if (activeSound.url) {
      const a = new Audio(activeSound.url);
      a.loop = true; a.volume = volume;
      a.play().catch(() => {});
      audioRef.current = a;
    }
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, [activeSound.id]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => { setImgLoaded(false); }, [wallpaper.id]);

  const handleMusicSubmit = () => {
    const embed = getMusicEmbed(musicInput.trim());
    if (embed) {
      setMusicEmbed(embed);
      setShowPlayer(true);
      setShowMusicPanel(false);
    }
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const phaseColor = PHASE_COLORS[phase];
  const phaseDur   = getDuration(phase);
  const circ       = 2 * Math.PI * 80;
  const progress   = ((phaseDur - timeLeft) / phaseDur) * 100;

  const changePhase = (p) => {
    if (isRunning && phase==="focus" && (p==="break" || p==="longBreak")) return;
    clearInterval(timerRef.current);
    setIsRunning(false);
    setPhase(p);
    phaseRef.current = p;
    setTimeLeft(getDuration(p));
  };

  const handleReset = () => {
    endSoloSessionElapsed();
    clearInterval(timerRef.current);
    setIsRunning(false);
    setPhase("focus");
    phaseRef.current = "focus";
    setTimeLeft(getFocus());
    setPomCount(0);
    pomRef.current = 0;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes soloGlow{0%,100%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.4),0 0 16px rgba(124,58,237,0.5)}50%{box-shadow:0 0 0 1.5px rgba(124,58,237,0.6),0 0 28px rgba(124,58,237,0.7)}}
        @keyframes soloPulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes soloFadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes timerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}
        @keyframes quoteFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes twinkle{0%,100%{opacity:0.15}50%{opacity:1}}
        @keyframes twinkleFast{0%,100%{opacity:0.08;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes nebulaPulse{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes waveRise{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes petalFall{0%{transform:translateY(-20px) translateX(0) rotate(0deg);opacity:0.9}100%{transform:translateY(105vh) translateX(65px) rotate(540deg);opacity:0}}
        @keyframes fireflyFloat{0%,100%{transform:translate(0,0);opacity:0.2}25%{transform:translate(10px,-22px);opacity:0.9}50%{transform:translate(-6px,-38px);opacity:0.6}75%{transform:translate(14px,-20px);opacity:0.85}}
        @keyframes cloudDrift{from{transform:translateX(-320px)}to{transform:translateX(120vw)}}
        @keyframes fireFlicker{0%,100%{transform:translateX(-50%) scaleY(1) scaleX(1)}50%{transform:translateX(-50%) scaleY(1.09) scaleX(0.93)}}
        @keyframes cityBlink{0%,90%,100%{opacity:0.85}94%{opacity:0.05}}
        .solo-btn:hover{opacity:0.9;transform:translateY(-1px);}
        .solo-menu-item:hover{background:rgba(255,255,255,0.12) !important;}
        .play-btn:hover{transform:scale(1.08) !important;}
        .play-btn:active{transform:scale(0.96) !important;}
        .phase-btn:disabled{opacity:0.35;cursor:not-allowed !important;}
        .music-input:focus{border-color:#1DB954 !important;box-shadow:0 0 0 3px rgba(29,185,84,0.2) !important;outline:none;}
        .music-input::placeholder{color:rgba(255,255,255,0.25);}
      `}</style>

      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, background:wallpaper.bgColor||"#0a0510", overflow:"hidden" }}>
        {wallpaper.animated ? (
          <AnimatedBg id={wallpaper.id}/>
        ) : (
          <>
            <img key={wallpaper.id} src={wallpaper.url} alt=""
              onLoad={() => setImgLoaded(true)}
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:imgLoaded?1:0, transition:"opacity 1s ease" }}
            />
            <div style={{ position:"absolute", inset:0, zIndex:1, background:"rgba(0,0,0,0.52)" }}/>
            <div style={{ position:"absolute", inset:0, zIndex:2, background:"linear-gradient(180deg,rgba(0,0,0,0.25) 0%,rgba(0,0,0,0.05) 50%,rgba(0,0,0,0.35) 100%)" }}/>
          </>
        )}
      </div>

      <Confetti active={showConfetti}/>

      {/* Floating music player */}
      {showPlayer && musicEmbed && (
        <div style={{ position:"fixed", bottom:20, right:20, zIndex:100, borderRadius:16, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", background:"rgba(0,0,0,0.8)", backdropFilter:"blur(16px)" }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
              {musicEmbed.type === "spotify" ? "Spotify" : "YouTube"}
            </span>
            <button type="button" onClick={() => setShowPlayer(false)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", display:"flex", alignItems:"center" }}>
              <X size={13}/>
            </button>
          </div>
          <iframe
            src={musicEmbed.src}
            width={musicEmbed.type==="spotify" ? "300" : "280"}
            height={musicEmbed.type==="spotify" ? "152" : "158"}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ display:"block" }}
          />
        </div>
      )}

      <div style={{ minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", position:"relative", zIndex:1, display:"flex", flexDirection:"column" }}>

        {/* Navbar */}
        <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, height: isMobile ? 56 : isTablet ? 60 : "auto", padding: isMobile ? "0 14px" : isTablet ? "0 20px" : "10px 20px", background:"rgba(0,0,0,0.45)", backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(255,255,255,0.08)", flexShrink:0, zIndex:100, overflow:"visible" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button type="button" onClick={() => navigate("/app/study")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, color:"rgba(255,255,255,0.8)", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
            >
              <ArrowLeft size={13}/> Retour
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width: isMobile ? 28 : 34, height: isMobile ? 28 : 34, borderRadius:9, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:4, animation:"soloGlow 3s ease-in-out infinite alternate", flexShrink:0 }}>
                {!logoError
                  ? <img src="/najahi_logo.png" alt="N" style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={() => setLogoError(true)}/>
                  : <span style={{ color:"#7c3aed", fontSize:15, fontWeight:900, fontFamily:"'Fraunces',serif" }}>N</span>
                }
              </div>
              {!isMobile && <span style={{ fontSize:14, fontWeight:700, color:"#fff", fontFamily:"'Fraunces',serif" }}>Étude solo</span>}
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>

            {/* Wallpaper */}
            <div style={{ position:"relative", zIndex:101 }}>
              <button type="button" className="solo-btn"
                onClick={() => { setShowWpMenu(v=>!v); setShowSndMenu(false); setShowPresetMenu(false); setShowMusicPanel(false); }}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, color:"rgba(255,255,255,0.85)", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                <Image size={13}/> {!isMobile && wallpaper.label}
              </button>
              {showWpMenu && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right: isMobile ? "auto" : 0, left: isMobile ? "50%" : "auto", transform: isMobile ? "translateX(-50%)" : "none", background:"rgba(4,2,12,0.97)", backdropFilter:"blur(28px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:8, minWidth:210, maxWidth:"calc(100vw - 32px)", width: isMobile ? "calc(100vw - 32px)" : undefined, zIndex:9999, maxHeight:360, overflowY:"auto", animation:"soloFadeIn 0.2s ease" }}>
                  {WP_GROUPS.map(group => (
                    <div key={group.type}>
                      <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", padding:"8px 10px 4px", letterSpacing:"1px" }}>{group.label}</div>
                      {WALLPAPERS.filter(w => w.type===group.type).map(wp => (
                        <button key={wp.id} type="button" className="solo-menu-item"
                          onClick={() => { setWallpaper(wp); setShowWpMenu(false); }}
                          style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"7px 10px", border:"none", borderRadius:8, background:wallpaper.id===wp.id?"rgba(124,58,237,0.25)":"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#fff", fontSize:13, transition:"all 0.15s" }}>
                          <div style={{ width:30, height:20, borderRadius:4, overflow:"hidden", flexShrink:0, border:"1px solid rgba(255,255,255,0.1)" }}>
                            {wp.url
                              ? <img src={wp.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                              : <div style={{ width:"100%", height:"100%", background:wp.bgColor||"#111", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>{wp.label.split(" ")[0]}</div>
                            }
                          </div>
                          <span style={{ flex:1, textAlign:"left" }}>{wp.label}</span>
                          {wallpaper.id===wp.id && <Check size={11} color="#a78bfa"/>}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Built-in sounds */}
            <div style={{ position:"relative", zIndex:101 }}>
              <button type="button" className="solo-btn"
                onClick={() => { setShowSndMenu(v=>!v); setShowWpMenu(false); setShowPresetMenu(false); setShowMusicPanel(false); }}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, color:"rgba(255,255,255,0.85)", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                {activeSound.id==="silence" ? <VolumeX size={13}/> : <Volume2 size={13}/>}
                {!isMobile && activeSound.label}
              </button>
              {showSndMenu && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"rgba(4,2,12,0.97)", backdropFilter:"blur(28px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:8, minWidth:200, zIndex:9999, maxHeight:360, overflowY:"auto", animation:"soloFadeIn 0.2s ease" }}>
                  {SND_GROUPS.map(group => (
                    <div key={group.label}>
                      <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", padding:"8px 10px 4px", letterSpacing:"1px" }}>{group.label}</div>
                      {SOUNDS.filter(s => group.ids.includes(s.id)).map(s => (
                        <button key={s.id} type="button" className="solo-menu-item"
                          onClick={() => { setActiveSound(s); setShowSndMenu(false); }}
                          style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"7px 10px", border:"none", borderRadius:8, background:activeSound.id===s.id?"rgba(124,58,237,0.25)":"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#fff", fontSize:13, transition:"all 0.15s" }}>
                          <span style={{ flex:1, textAlign:"left" }}>{s.label}</span>
                          {activeSound.id===s.id && <Check size={11} color="#a78bfa"/>}
                        </button>
                      ))}
                    </div>
                  ))}
                  <div style={{ padding:"10px 10px 4px", borderTop:"1px solid rgba(255,255,255,0.07)", marginTop:4 }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:8, display:"flex", justifyContent:"space-between" }}>
                      <span>Volume</span><span style={{ color:"#a78bfa" }}>{Math.round(volume*100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.05" value={volume}
                      onChange={e => setVolume(+e.target.value)}
                      style={{ width:"100%", accentColor:"#7c3aed" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Music link (Spotify / YouTube) */}
            <div style={{ position:"relative", zIndex:101 }}>
              <button type="button" className="solo-btn"
                onClick={() => { setShowMusicPanel(v=>!v); setShowWpMenu(false); setShowSndMenu(false); setShowPresetMenu(false); }}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background: musicEmbed&&showPlayer?"rgba(29,185,84,0.2)":"rgba(255,255,255,0.1)", border:`1px solid ${musicEmbed&&showPlayer?"rgba(29,185,84,0.4)":"rgba(255,255,255,0.15)"}`, borderRadius:8, color: musicEmbed&&showPlayer?"#1DB954":"rgba(255,255,255,0.85)", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                <Music size={13}/>
                {!isMobile && (musicEmbed && showPlayer ? "Musique active" : "Ma playlist")}
              </button>
              {showMusicPanel && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"rgba(4,2,12,0.97)", backdropFilter:"blur(28px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:16, width: isMobile ? "calc(100vw - 28px)" : 320, minWidth: isMobile ? "unset" : 320, zIndex:9999, animation:"soloFadeIn 0.2s ease" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:4 }}>
                    Colle ton lien
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:12, lineHeight:1.5 }}>
                    Spotify (playlist, album, artiste, titre)<br/>
                    YouTube (vidéo ou playlist)
                  </div>
                  <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                    <input
                      className="music-input"
                      type="text"
                      placeholder="https://open.spotify.com/playlist/..."
                      value={musicInput}
                      onChange={e => setMusicInput(e.target.value)}
                      onKeyDown={e => { if(e.key==="Enter") handleMusicSubmit(); }}
                      style={{ flex:1, padding:"9px 12px", background:"rgba(255,255,255,0.07)", border:"1.5px solid rgba(255,255,255,0.12)", borderRadius:9, fontSize:12, color:"#fff", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
                    />
                    <button type="button" onClick={handleMusicSubmit}
                      disabled={!musicInput.trim()}
                      style={{ padding:"0 14px", background:musicInput.trim()?"#1DB954":"rgba(29,185,84,0.2)", border:"none", borderRadius:9, cursor:musicInput.trim()?"pointer":"not-allowed", color:"#fff", fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                      Lancer
                    </button>
                  </div>

                  {/* Quick suggestions */}
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)", marginBottom:8, letterSpacing:"0.5px" }}>SUGGESTIONS</div>
                  {[
                    { label: "Lo-fi Hip Hop", url: "https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4eZs5Az" },
                    { label: "Focus Flow",     url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ" },
                    { label: "Deep Focus",     url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ" },
                    { label: "Piano Study",    url: "https://open.spotify.com/playlist/37i9dQZF1DX9sIqqvKsjEE" },
                  ].map(s => (
                    <button key={s.label} type="button"
                      onClick={() => { setMusicInput(s.url); }}
                      style={{ display:"block", width:"100%", textAlign:"left", padding:"6px 10px", border:"none", borderRadius:7, background:"rgba(255,255,255,0.05)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.65)", fontSize:12, marginBottom:4, transition:"all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(29,185,84,0.15)"}
                      onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                    >
                      {s.label}
                    </button>
                  ))}

                  {musicEmbed && showPlayer && (
                    <button type="button" onClick={() => setShowPlayer(false)}
                      style={{ width:"100%", marginTop:8, padding:"8px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:9, color:"#ef4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      Fermer le lecteur
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ position:"relative", zIndex:101 }}><ThemeToggle/></div>
          </div>
        </nav>

        {/* Main */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px 24px", gap:18 }}>

          {/* Quote */}
          <div key={quote.text} style={{ textAlign:"center", maxWidth:520, padding:"14px 24px", background:"rgba(0,0,0,0.45)", backdropFilter:"blur(20px)", borderRadius:16, border:"1px solid rgba(255,255,255,0.1)", animation:"quoteFade 0.5s ease" }}>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.88)", lineHeight:1.65, fontStyle:"italic", marginBottom:6 }}>"{quote.text}"</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>— {quote.author}</p>
          </div>

          {/* Phase tabs */}
          <div style={{ display:"flex", gap:6, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(20px)", borderRadius:12, padding:4, border:"1px solid rgba(255,255,255,0.1)" }}>
            {Object.entries(PHASE_COLORS).map(([key, color]) => {
              const locked = isRunning && phase==="focus" && (key==="break" || key==="longBreak");
              return (
                <button key={key} type="button" className="phase-btn"
                  onClick={() => changePhase(key)}
                  disabled={locked}
                  title={locked ? "Termine la session focus d'abord" : ""}
                  style={{ padding:"8px 16px", borderRadius:9, border:"none", fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:locked?"not-allowed":"pointer", transition:"all 0.25s", background:phase===key?color:"transparent", color:phase===key?"#fff":"rgba(255,255,255,0.55)", boxShadow:phase===key?`0 2px 12px ${color}70`:"none" }}>
                  {PHASE_LABELS[key]}
                </button>
              );
            })}
          </div>

          {/* Timer */}
          <div style={{ position:"relative", zIndex:50, width:220, height:220, animation:isRunning?"timerPulse 2s ease-in-out infinite":"none" }}>
            <svg width="220" height="220" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="110" cy="110" r="80" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10"/>
              <circle cx="110" cy="110" r="80" fill="none"
                stroke={phaseColor} strokeWidth="10"
                strokeDasharray={circ}
                strokeDashoffset={circ - (progress/100)*circ}
                strokeLinecap="round"
                style={{ transition:"stroke-dashoffset 1s linear, stroke 0.5s", filter:`drop-shadow(0 0 14px ${phaseColor})` }}
              />
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:52, fontWeight:700, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontVariantNumeric:"tabular-nums", letterSpacing:"-2px", textShadow:`0 0 30px ${phaseColor}` }}>
                {fmt(timeLeft)}
              </span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:4, fontWeight:500 }}>
                {PHASE_LABELS[phase]}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>

            {/* Preset */}
            <div style={{ position:"relative", zIndex:101 }}>
              <button type="button" className="solo-btn"
                onClick={() => { setShowPresetMenu(v=>!v); setShowWpMenu(false); setShowSndMenu(false); setShowMusicPanel(false); }}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 14px", background:"rgba(0,0,0,0.45)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, color:"rgba(255,255,255,0.85)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                <Timer size={13}/> {PRESETS[preset].label} <ChevronDown size={11}/>
              </button>
              {showPresetMenu && (
                <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:0, background:"rgba(4,2,12,0.97)", backdropFilter:"blur(28px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:8, minWidth:200, zIndex:9999, animation:"soloFadeIn 0.2s ease" }}>
                  {PRESETS.map((p, i) => (
                    <button key={i} type="button" className="solo-menu-item"
                      onClick={() => { setPreset(i); changePhase("focus"); setShowPresetMenu(false); if(i!==3) setTimeLeft(p.focus*60); }}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"9px 10px", border:"none", borderRadius:8, background:preset===i?"rgba(124,58,237,0.25)":"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#fff", fontSize:13, transition:"all 0.15s" }}>
                      <span style={{ fontWeight:600 }}>{p.label}</span>
                      {i!==3 && <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{p.focus}m / {p.break}m</span>}
                      {preset===i && <Check size={11} color="#a78bfa"/>}
                    </button>
                  ))}
                  {preset===3 && (
                    <div style={{ padding:"8px 10px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", gap:8 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:4 }}>Focus (min)</div>
                        <input type="number" min="1" max="120" value={customFocus}
                          onChange={e => { setCustomFocus(+e.target.value); setTimeLeft(+e.target.value*60); }}
                          style={{ width:"100%", padding:"6px 8px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#fff", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
                        />
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:4 }}>Pause (min)</div>
                        <input type="number" min="1" max="60" value={customBreak}
                          onChange={e => setCustomBreak(+e.target.value)}
                          style={{ width:"100%", padding:"6px 8px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#fff", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reset */}
            <button type="button" className="solo-btn"
              onClick={handleReset}
              style={{ width:48, height:48, borderRadius:"50%", background:"rgba(0,0,0,0.45)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.15)", display:"grid", placeItems:"center", cursor:"pointer", color:"rgba(255,255,255,0.7)", transition:"all 0.2s" }}>
              <RotateCcw size={17}/>
            </button>

            {/* Play */}
            <button type="button" className="play-btn"
              onClick={() => {
                const going = !isRunning;
                setIsRunning(going);
                if (going && phase === "focus") {
                  startSoloSession();
                } else if (!going && phase === "focus") {
                  endSoloSessionElapsed();
                }
              }}
              style={{ width:74, height:74, borderRadius:"50%", background:`linear-gradient(135deg,${phaseColor},${phaseColor}bb)`, border:"none", display:"grid", placeItems:"center", cursor:"pointer", color:"#fff", transition:"all 0.25s", boxShadow:`0 0 32px ${phaseColor}55, 0 8px 28px ${phaseColor}35` }}>
              {isRunning ? <Pause size={28}/> : <Play size={28} style={{ marginLeft:3 }}/>}
            </button>

            {/* Count */}
            <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(0,0,0,0.45)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:18, fontWeight:700, color:phaseColor, lineHeight:1 }}>{pomCount}</span>
              <span style={{ fontSize:8, color:"rgba(255,255,255,0.35)", fontWeight:600, marginTop:1 }}>pom</span>
            </div>
          </div>

          {/* Dots */}
          <div style={{ display:"flex", gap:7 }}>
            {Array.from({length:4}).map((_,i) => (
              <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:i<(pomCount%4)?phaseColor:"rgba(255,255,255,0.12)", transition:"all 0.35s", boxShadow:i<(pomCount%4)?`0 0 8px ${phaseColor}70`:"none" }}/>
            ))}
          </div>

          {/* Status */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 20px", background:"rgba(0,0,0,0.4)", backdropFilter:"blur(16px)", borderRadius:99, border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:isRunning?"#10b981":"rgba(255,255,255,0.2)", animation:isRunning?"soloPulse 1.5s infinite":"none", transition:"background 0.3s" }}/>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:500 }}>
              {isRunning ? (phase==="focus" ? "En plein focus..." : "Pause en cours...") : "Appuie sur Play pour commencer"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}