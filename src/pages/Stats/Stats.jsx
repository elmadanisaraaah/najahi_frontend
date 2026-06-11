import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Flame, BarChart3, Lock, BookOpen, Zap, Trophy, Star } from "lucide-react";

const SAPI = (p) => `${import.meta.env.VITE_API_URL}/api/study${p}`;
const tok   = () => localStorage.getItem("najahi_token");

function useTheme() {
  const [dark] = useState(() => {
    const s = localStorage.getItem("najahi_theme");
    return s ? s === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  return dark;
}

const DAYS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function fmtMin(mins) {
  const m = Math.round(mins || 0);
  if (m === 0)  return "0 min";
  if (m < 60)   return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r > 0 ? `${h}h ${r}min` : `${h}h`;
}

function fmtDate(iso) {
  if (!iso) return "";
  const str = iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z";
  const d = new Date(str);
  return d.toLocaleDateString("fr-FR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
}

function DeltaBadge({ current, previous, unit = "min" }) {
  if (!previous || previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
      background: up ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
      color: up ? "#10b981" : "#ef4444",
    }}>
      {up ? "+" : ""}{pct}% vs sem. préc.
    </span>
  );
}

// ── Overview card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, color, label, value, sub, dark }) {
  const card = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
  const brd  = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.13)";
  const txt  = dark ? "#f3f4f6" : "#1e1b4b";
  const subC = dark ? "rgba(255,255,255,0.45)" : "rgba(30,27,75,0.5)";
  return (
    <div style={{
      background: card, border: `1px solid ${brd}`, borderRadius: 16,
      padding: "20px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ width:40, height:40, borderRadius:11, background: color + "18", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={19} color={color} />
        </div>
        {sub}
      </div>
      <div style={{ fontSize:26, fontWeight:900, fontFamily:"'Fraunces',serif", color:txt, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:subC, marginTop:5, fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>{label}</div>
    </div>
  );
}

// ── Weekly bar chart ───────────────────────────────────────────────────────────
function WeekChart({ daily, dark }) {
  const [tooltip, setTooltip] = useState(null);
  const [animated, setAnimated] = useState(false);
  const brd  = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.13)";
  const txt  = dark ? "#f3f4f6" : "#1e1b4b";
  const subC = dark ? "rgba(255,255,255,0.4)" : "rgba(30,27,75,0.45)";
  const card = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const maxMins = Math.max(...daily.map(d => d.minutes), 1);

  return (
    <div style={{ background:card, border:`1px solid ${brd}`, borderRadius:16, padding:"22px 20px", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:txt, fontFamily:"'DM Sans',sans-serif" }}>Activité de la semaine</div>
          <div style={{ fontSize:12, color:subC, marginTop:2 }}>Heures d'étude par jour (7 derniers jours)</div>
        </div>
        <BarChart3 size={18} color="#7c3aed" />
      </div>

      <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:140, position:"relative" }}>
        {/* Y-axis guide lines */}
        {[0.25,0.5,0.75,1].map(p => (
          <div key={p} style={{ position:"absolute", left:0, right:0, bottom:`${p*100}%`, borderTop:`1px dashed ${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`, pointerEvents:"none" }} />
        ))}

        {daily.map((d, i) => {
          const heightPct = maxMins > 0 ? (d.minutes / maxMins) * 100 : 0;
          const isToday   = i === daily.length - 1;
          const dayLabel  = DAYS_FR[d.weekday];
          return (
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, height:"100%" }}>
              {/* Bar column */}
              <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end", position:"relative" }}>
                <div
                  style={{
                    width:"100%", borderRadius:"6px 6px 2px 2px",
                    background: isToday
                      ? "linear-gradient(180deg,#a78bfa,#7c3aed)"
                      : dark ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.22)",
                    height: animated ? `${Math.max(heightPct, d.minutes > 0 ? 4 : 0)}%` : "0%",
                    transition: `height 0.7s cubic-bezier(0.34,1.1,0.64,1) ${i * 0.06}s`,
                    cursor: d.minutes > 0 ? "pointer" : "default",
                    boxShadow: isToday ? "0 4px 14px rgba(124,58,237,0.3)" : "none",
                  }}
                  onMouseEnter={() => d.minutes > 0 && setTooltip(i)}
                  onMouseLeave={() => setTooltip(null)}
                />
                {tooltip === i && (
                  <div style={{
                    position:"absolute", bottom:"calc(100% + 6px)", left:"50%",
                    transform:"translateX(-50%)", whiteSpace:"nowrap",
                    background: dark ? "#1e1b4b" : "#fff",
                    border:`1px solid ${brd}`, borderRadius:8, padding:"5px 10px",
                    fontSize:12, fontWeight:700, color:txt,
                    boxShadow:"0 4px 14px rgba(0,0,0,0.15)", zIndex:10,
                  }}>
                    {fmtMin(d.minutes)}
                  </div>
                )}
              </div>
              {/* Day label */}
              <div style={{
                fontSize:11, fontWeight: isToday ? 800 : 500,
                color: isToday ? "#7c3aed" : subC,
                fontFamily:"'DM Sans',sans-serif",
              }}>
                {dayLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Breakdown ──────────────────────────────────────────────────────────────────
function Breakdown({ stats, dark }) {
  const card = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
  const brd  = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.13)";
  const txt  = dark ? "#f3f4f6" : "#1e1b4b";
  const subC = dark ? "rgba(255,255,255,0.45)" : "rgba(30,27,75,0.5)";

  const total    = (stats.solo_minutes || 0) + (stats.room_minutes || 0);
  const soloPct  = total > 0 ? Math.round((stats.solo_minutes / total) * 100) : 0;
  const roomPct  = total > 0 ? 100 - soloPct : 0;
  const monthDiff = ((stats.this_month_minutes || 0) - (stats.last_month_minutes || 0));
  const monthUp   = monthDiff >= 0;

  return (
    <div style={{ background:card, border:`1px solid ${brd}`, borderRadius:16, padding:"22px 20px", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}>
      <div style={{ fontWeight:800, fontSize:15, color:txt, marginBottom:20, fontFamily:"'DM Sans',sans-serif" }}>Répartition des sessions</div>

      {/* Solo vs Room split bar */}
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#7c3aed" }}>Solo — {fmtMin(stats.solo_minutes)}</span>
          <span style={{ fontSize:13, fontWeight:700, color:"#3b82f6" }}>Salles — {fmtMin(stats.room_minutes)}</span>
        </div>
        <div style={{ height:10, borderRadius:99, background: dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)", overflow:"hidden", display:"flex" }}>
          <div style={{ width:`${soloPct}%`, background:"linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius:"99px 0 0 99px", transition:"width 0.8s ease" }} />
          <div style={{ width:`${roomPct}%`, background:"linear-gradient(90deg,#3b82f6,#60a5fa)", borderRadius:"0 99px 99px 0", transition:"width 0.8s ease" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          <span style={{ fontSize:11, color:subC }}>{soloPct}% solo</span>
          <span style={{ fontSize:11, color:subC }}>{roomPct}% salles</span>
        </div>
      </div>

      {/* Month comparison + best day */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div style={{ background: dark?"rgba(255,255,255,0.04)":"rgba(124,58,237,0.04)", borderRadius:12, padding:"13px 14px" }}>
          <div style={{ fontSize:11, color:subC, marginBottom:6, fontWeight:600 }}>Ce mois-ci</div>
          <div style={{ fontSize:18, fontWeight:900, fontFamily:"'Fraunces',serif", color:txt }}>{fmtMin(stats.this_month_minutes)}</div>
          <div style={{ fontSize:11, marginTop:4, color: monthUp?"#10b981":"#ef4444", fontWeight:700 }}>
            {monthDiff >= 0 ? "+" : ""}{fmtMin(Math.abs(monthDiff))} vs mois préc.
          </div>
        </div>
        <div style={{ background: dark?"rgba(255,255,255,0.04)":"rgba(16,185,129,0.04)", borderRadius:12, padding:"13px 14px" }}>
          <div style={{ fontSize:11, color:subC, marginBottom:6, fontWeight:600 }}>Meilleur jour</div>
          <div style={{ fontSize:18, fontWeight:900, fontFamily:"'Fraunces',serif", color:txt }}>
            {stats.best_day || "—"}
          </div>
          <div style={{ fontSize:11, marginTop:4, color:subC }}>Jour le plus productif</div>
        </div>
      </div>
    </div>
  );
}

// ── Achievements ───────────────────────────────────────────────────────────────
const BADGES = [
  { id:"first",    emoji:"🎯", label:"Première session",    desc:"Lance ta première session d'étude",          check: (s) => s.total_sessions >= 1 },
  { id:"five",     emoji:"⚡", label:"5 sessions",          desc:"Complète 5 sessions d'étude",                check: (s) => s.total_sessions >= 5 },
  { id:"streak3",  emoji:"🔥", label:"Streak 3 jours",      desc:"3 jours consécutifs d'étude",                check: (s) => s.streak_days >= 3 },
  { id:"ten_h",    emoji:"📚", label:"10 heures totales",   desc:"Accumule 10 heures d'étude",                 check: (s) => s.total_minutes >= 600 },
  { id:"thirty",   emoji:"🏆", label:"30 sessions",         desc:"Complète 30 sessions d'étude",               check: (s) => s.total_sessions >= 30 },
  { id:"fifty_h",  emoji:"💎", label:"50 heures totales",   desc:"Accumule 50 heures d'étude",                 check: (s) => s.total_minutes >= 3000 },
];

function Achievements({ stats, dark }) {
  const card = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
  const brd  = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.13)";
  const txt  = dark ? "#f3f4f6" : "#1e1b4b";
  const subC = dark ? "rgba(255,255,255,0.4)" : "rgba(30,27,75,0.45)";

  return (
    <div style={{ background:card, border:`1px solid ${brd}`, borderRadius:16, padding:"22px 20px", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
        <Star size={16} color="#f59e0b" fill="#f59e0b" />
        <span style={{ fontWeight:800, fontSize:15, color:txt, fontFamily:"'DM Sans',sans-serif" }}>Badges & Succès</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
        {BADGES.map(b => {
          const unlocked = stats && b.check(stats);
          return (
            <div key={b.id} style={{
              padding:"14px 12px", borderRadius:13, textAlign:"center",
              background: unlocked
                ? (dark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)")
                : (dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"),
              border: `1.5px solid ${unlocked ? "rgba(245,158,11,0.3)" : (dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)")}`,
              opacity: unlocked ? 1 : 0.5,
              transition:"all 0.2s",
            }}>
              <div style={{ fontSize:28, marginBottom:6, filter: unlocked ? "none" : "grayscale(1) opacity(0.4)" }}>
                {unlocked ? b.emoji : <Lock size={22} color={subC} style={{ display:"inline-block" }} />}
              </div>
              <div style={{ fontSize:12, fontWeight:700, color: unlocked ? (dark?"#fbbf24":"#d97706") : subC, fontFamily:"'DM Sans',sans-serif", lineHeight:1.3 }}>
                {b.label}
              </div>
              <div style={{ fontSize:10, color:subC, marginTop:4, lineHeight:1.4, fontFamily:"'DM Sans',sans-serif" }}>
                {b.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Recent sessions list ───────────────────────────────────────────────────────
function RecentSessions({ sessions, dark }) {
  const card = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
  const brd  = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.13)";
  const txt  = dark ? "#f3f4f6" : "#1e1b4b";
  const subC = dark ? "rgba(255,255,255,0.4)" : "rgba(30,27,75,0.45)";

  if (!sessions || sessions.length === 0) return null;

  return (
    <div style={{ background:card, border:`1px solid ${brd}`, borderRadius:16, padding:"22px 20px", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}>
      <div style={{ fontWeight:800, fontSize:15, color:txt, marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>Sessions récentes</div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {sessions.map((s, i) => (
          <div key={i} style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"10px 12px", borderRadius:10,
            background: dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",
            border:`1px solid ${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"}`,
          }}>
            <div style={{
              width:34, height:34, borderRadius:9, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
              background: s.type === "solo" ? "rgba(124,58,237,0.12)" : "rgba(59,130,246,0.12)",
              fontSize:16,
            }}>
              {s.type === "solo" ? "📖" : "👥"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:13, color:txt, fontFamily:"'DM Sans',sans-serif" }}>
                {s.type === "solo" ? "Session solo" : "Salle d'étude"}
                {s.subject && <span style={{ color:subC, fontWeight:400 }}> · {s.subject}</span>}
              </div>
              <div style={{ fontSize:11, color:subC, marginTop:1 }}>{fmtDate(s.ts)}</div>
            </div>
            <div style={{
              fontSize:12, fontWeight:700, color: s.type === "solo" ? "#7c3aed" : "#3b82f6",
              background: s.type === "solo" ? "rgba(124,58,237,0.1)" : "rgba(59,130,246,0.1)",
              padding:"3px 9px", borderRadius:99, whiteSpace:"nowrap",
            }}>
              {fmtMin(s.minutes)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ dark }) {
  const navigate = useNavigate();
  const txt  = dark ? "#f3f4f6" : "#1e1b4b";
  const subC = dark ? "rgba(255,255,255,0.45)" : "rgba(30,27,75,0.5)";
  const card = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
  const brd  = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.13)";
  return (
    <div style={{ background:card, border:`1px solid ${brd}`, borderRadius:16, padding:"60px 30px", textAlign:"center", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}>
      <div style={{ fontSize:52, marginBottom:16 }}>📊</div>
      <h3 style={{ margin:"0 0 10px", fontFamily:"'Fraunces',serif", fontSize:20, color:txt }}>Aucune session pour l'instant</h3>
      <p style={{ margin:"0 0 22px", color:subC, fontSize:14, lineHeight:1.6 }}>
        Lance ta première session d'étude pour voir tes statistiques apparaître ici.
      </p>
      <button
        onClick={() => navigate("/app/study/solo")}
        style={{ padding:"11px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
      >
        Commencer une session →
      </button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Stats() {
  const navigate = useNavigate();
  const dark     = useTheme();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const bg   = dark ? "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" : "linear-gradient(135deg,#e9e4ff,#f0f4ff,#fdf6ff)";
  const txt  = dark ? "#f3f4f6" : "#1e1b4b";
  const subC = dark ? "rgba(255,255,255,0.45)" : "rgba(30,27,75,0.5)";

  const fetchStats = useCallback(async () => {
    const t = tok();
    if (!t) { setLoading(false); return; }
    try {
      const r = await fetch(SAPI("/stats"), { headers: { Authorization: `Bearer ${t}` } });
      if (!r.ok) throw new Error("Erreur serveur");
      const d = await r.json();
      setStats(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const hasData = stats && stats.total_sessions > 0;

  const btnBack = {
    display:"flex", alignItems:"center", gap:6,
    padding:"8px 14px", borderRadius:10,
    border:`1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.2)"}`,
    background:"transparent", color:txt, fontSize:13, fontWeight:600,
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
  };

  return (
    <div style={{ minHeight:"100vh", background:bg, padding:"0 16px 60px", fontFamily:"'DM Sans',sans-serif" }}>
      {/* Ambient blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", width:440, height:440, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.11),transparent 70%)", top:"-10%", right:"-5%" }} />
        <div style={{ position:"absolute", width:340, height:340, borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,0.07),transparent 70%)", bottom:"5%", left:"-5%" }} />
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:800, margin:"0 auto" }}>
        {/* Top nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"24px 0 20px" }}>
          <button onClick={() => navigate("/app/dashboard")} style={btnBack}
            onMouseEnter={e => e.currentTarget.style.background = dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ArrowLeft size={14} /> Tableau de bord
          </button>
          <button onClick={fetchStats} style={{ ...btnBack, gap:5, fontSize:12 }}
            onMouseEnter={e => e.currentTarget.style.background = dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            ↻ Actualiser
          </button>
        </div>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:"rgba(124,58,237,0.12)", border:`1px solid rgba(124,58,237,0.2)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BarChart3 size={22} color="#7c3aed" />
            </div>
            <div>
              <h1 style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"clamp(20px,5vw,28px)", color:txt, lineHeight:1.1 }}>
                Mes Statistiques d'étude
              </h1>
              <p style={{ margin:0, fontSize:13, color:subC, marginTop:3 }}>Suis ta progression et reste motivé</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:36, marginBottom:10, animation:"spin 1s linear infinite", display:"inline-block" }}>⏳</div>
            <p style={{ margin:0, color:subC, fontSize:14 }}>Chargement des statistiques…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#ef4444" }}>
            <p style={{ fontSize:14 }}>Erreur : {error}</p>
            <button onClick={fetchStats} style={{ marginTop:12, padding:"8px 18px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>
              Réessayer
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && stats && (
          <>
            {/* SECTION 1 — Overview cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:12, marginBottom:16 }}>
              <StatCard dark={dark} icon={Clock}    color="#7c3aed" label="Heures étudiées"          value={fmtMin(stats.total_minutes)}
                sub={<DeltaBadge current={stats.this_week_minutes} previous={stats.last_week_minutes} />} />
              <StatCard dark={dark} icon={BookOpen} color="#8b5cf6" label="Sessions solo cette sem." value={stats.week_solo_sessions}
                sub={null} />
              <StatCard dark={dark} icon={Users}    color="#3b82f6" label="Sessions salle cette sem." value={stats.week_room_sessions}
                sub={null} />
              <StatCard dark={dark} icon={Flame}    color="#f59e0b" label="Streak actuel"
                value={stats.streak_days > 0 ? `${stats.streak_days}j 🔥` : "0j"}
                sub={stats.streak_days >= 3 ? <span style={{ fontSize:10, fontWeight:700, color:"#f59e0b", background:"rgba(245,158,11,0.12)", padding:"2px 7px", borderRadius:99 }}>En feu !</span> : null} />
            </div>

            {/* SECTION 2 — Weekly chart */}
            {hasData
              ? <div style={{ marginBottom:16 }}><WeekChart daily={stats.daily_stats} dark={dark} /></div>
              : null
            }

            {/* SECTION 3 — Breakdown */}
            {hasData && (
              <div style={{ marginBottom:16 }}>
                <Breakdown stats={stats} dark={dark} />
              </div>
            )}

            {/* SECTION 4 — Achievements */}
            <div style={{ marginBottom:16 }}>
              <Achievements stats={stats} dark={dark} />
            </div>

            {/* SECTION 5 — Recent sessions */}
            {hasData
              ? <RecentSessions sessions={stats.recent_sessions} dark={dark} />
              : <EmptyState dark={dark} />
            }
          </>
        )}
      </div>
    </div>
  );
}
