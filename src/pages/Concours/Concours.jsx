import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, ExternalLink, Calendar, CalendarDays, ChevronLeft, Search, SlidersHorizontal, ClipboardList, Target, BarChart3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "";
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("najahi_token") || ""}` });

const CAT_COLOR = {
  "Ingénierie":              "#7c3aed",
  "Télécommunications":      "#3b82f6",
  "Commerce & Management":   "#f59e0b",
  "Santé":                   "#ef4444",
  "Architecture":            "#10b981",
  "Classes Préparatoires":   "#06b6d4",
  "Université Internationale":"#8b5cf6",
  "Université Privée":       "#a78bfa",
};

const FILTERS = [
  { label: "Tous",          match: null },
  { label: "Ingénierie",    match: ["Ingénierie","Télécommunications"] },
  { label: "Commerce",      match: ["Commerce & Management"] },
  { label: "Santé",         match: ["Santé"] },
  { label: "Architecture",  match: ["Architecture"] },
  { label: "Prépa",         match: ["Classes Préparatoires"] },
];

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-MA", { day: "numeric", month: "short", year: "numeric" });
};

function countdownStyle(days) {
  if (days === null) return { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", label: "Date inconnue" };
  if (days < 0)      return { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", label: "Terminé" };
  if (days === 0)    return { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Aujourd'hui !" };
  if (days < 30)     return { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: `Dans ${days}j` };
  if (days < 60)     return { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: `Dans ${days}j` };
  return               { color: "#10b981", bg: "rgba(16,185,129,0.12)",  label: `Dans ${days}j` };
}

function regStatus(regEnd) {
  if (!regEnd) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  const end = new Date(regEnd);
  end.setHours(0,0,0,0);
  if (end >= today) return "open";
  return "closed";
}

// ─────────────────────────────────────────────────────────────────────────────

function ConcoursCard({ c, dark, subscribed, onSubscribe }) {
  const color  = CAT_COLOR[c.category] || "#7c3aed";
  const cd     = countdownStyle(c.days_until_exam);
  const isUrgent = c.days_until_exam !== null && c.days_until_exam >= 0 && c.days_until_exam < 30;
  const regOpen  = regStatus(c.registration_end) === "open";

  const tc  = dark ? "#fff"                    : "#1a1a2e";
  const sc  = dark ? "rgba(255,255,255,0.45)"  : "rgba(26,22,37,0.5)";
  const bg  = dark ? "rgba(255,255,255,0.05)"  : "#fff";
  const bdr = dark ? `1px solid rgba(255,255,255,0.09)` : `1px solid rgba(0,0,0,0.06)`;

  return (
    <div style={{ background: bg, border: bdr, borderRadius: 20, overflow: "hidden", boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.25)" : "0 2px 16px rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s", display: "flex", flexDirection: "column" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = dark ? `0 12px 40px rgba(0,0,0,0.35)` : `0 8px 32px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = dark ? "0 4px 24px rgba(0,0,0,0.25)" : "0 2px 16px rgba(0,0,0,0.06)"; }}
    >
      {/* Top accent */}
      <div style={{ height: 4, background: `linear-gradient(90deg,${color},${color}88)` }} />

      <div style={{ padding: "20px 22px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "18", padding: "3px 9px", borderRadius: 99 }}>
                {c.category}
              </span>
              {isUrgent && (
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "3px 8px", borderRadius: 99, border: "1px solid rgba(239,68,68,0.25)", letterSpacing: "0.5px" }}>
                  URGENT
                </span>
              )}
              {regOpen && (
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "3px 8px", borderRadius: 99 }}>
                  Inscriptions ouvertes
                </span>
              )}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: tc, fontFamily: "'Fraunces',serif", margin: 0, lineHeight: 1.35 }}>
              {c.name}
            </h3>
            <p style={{ fontSize: 12.5, color: sc, marginTop: 4, fontWeight: 500 }}>{c.school}</p>
          </div>
          {/* Countdown bubble */}
          <div style={{ flexShrink: 0, background: cd.bg, borderRadius: 12, padding: "8px 12px", textAlign: "center", minWidth: 72 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: cd.color, fontFamily: "'Fraunces',serif", letterSpacing: "-0.5px" }}>{cd.label}</div>
            <div style={{ fontSize: 10, color: cd.color, opacity: 0.75, marginTop: 1 }}>examen</div>
          </div>
        </div>

        {/* Description */}
        {c.description && (
          <p style={{ fontSize: 12.5, color: sc, lineHeight: 1.55, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {c.description}
          </p>
        )}

        {/* Date rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <DateRow icon={ClipboardList} label="Inscriptions" start={c.registration_start} end={c.registration_end} color={color} dark={dark} />
          <DateRow icon={Target} label="Examen" start={c.exam_date} highlight color={color} dark={dark} />
          <DateRow icon={BarChart3} label="Résultats" start={c.results_date} color={color} dark={dark} />
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ padding: "12px 22px 18px", display: "flex", gap: 8, borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)" }}>
        <button onClick={() => onSubscribe(c.id)}
          title={subscribed ? "Annuler le rappel" : "S'inscrire aux rappels"}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${subscribed ? color + "50" : (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)")}`, background: subscribed ? color + "18" : "transparent", color: subscribed ? color : (dark ? "rgba(255,255,255,0.5)" : "#6b7280"), fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", flex: 1, justifyContent: "center" }}>
          {subscribed ? <Bell size={13} /> : <BellOff size={13} />}
          {subscribed ? "Rappel activé" : "S'inscrire aux rappels"}
        </button>
        {c.official_link && (
          <a href={c.official_link} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10, border: `1px solid ${color}40`, background: color + "12", color, fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            <ExternalLink size={12} /> Site officiel
          </a>
        )}
      </div>
    </div>
  );
}

function DateRow({ icon: Icon, label, start, end, highlight, color, dark }) {
  const sc = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";
  const tc = dark ? "#fff" : "#1a1a2e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ flexShrink: 0, display:"flex" }}>{Icon && <Icon size={13} color={color} />}</span>
      <span style={{ fontSize: 12, color: sc, width: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: highlight ? 700 : 500, color: highlight ? color : tc, background: highlight ? color + "12" : "transparent", padding: highlight ? "2px 8px" : "0", borderRadius: highlight ? 99 : 0 }}>
        {end ? `${fmtDate(start)} → ${fmtDate(end)}` : fmtDate(start)}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Concours() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [concours,     setConcours]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState(0);
  const [sortBy,       setSortBy]       = useState("exam_date");
  const [search,       setSearch]       = useState("");
  const [subscribed,   setSubscribed]   = useState({});
  const [subLoading,   setSubLoading]   = useState({});
  const [toast,        setToast]        = useState("");

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/concours`)
      .then(r => r.json())
      .then(data => { setConcours(Array.isArray(data) ? data : []); })
      .catch(() => setConcours([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSubscribe = async (id) => {
    if (!user) { showToast("Connecte-toi pour activer les rappels"); return; }
    setSubLoading(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${API}/api/concours/subscribe`, {
        method: "POST",
        headers: { ...authH(), "Content-Type": "application/json" },
        body: JSON.stringify({ concours_id: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(p => ({ ...p, [id]: data.subscribed }));
        showToast(data.message);
      } else {
        showToast(data.error || "Erreur");
      }
    } catch { showToast("Erreur réseau"); }
    finally { setSubLoading(p => ({ ...p, [id]: false })); }
  };

  // ── Filtering + sorting ──
  const filterDef = FILTERS[filter];
  let visible = concours.filter(c => {
    if (filterDef.match && !filterDef.match.includes(c.category)) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.school.toLowerCase().includes(search.toLowerCase()) &&
        !c.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (sortBy === "exam_date") {
    visible = [...visible].sort((a, b) => {
      if (!a.exam_date) return 1;
      if (!b.exam_date) return -1;
      return new Date(a.exam_date) - new Date(b.exam_date);
    });
  } else {
    visible = [...visible].sort((a, b) => {
      if (!a.registration_start) return 1;
      if (!b.registration_start) return -1;
      return new Date(a.registration_start) - new Date(b.registration_start);
    });
  }

  // ── Theme ──
  const bg     = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 50%,#0d1a2e 100%)" : "linear-gradient(135deg,#f8f7ff 0%,#f0eeff 50%,#f5f3ff 100%)";
  const navBg  = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const navBdr = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.15)";
  const tc     = dark ? "#fff" : "#1a1a2e";
  const sc     = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes cnc-fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes cnc-spin   { to { transform: rotate(360deg); } }
        @keyframes cnc-pulse  { 0%,100%{opacity:1} 50%{opacity:0.45} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#1e1b4b", color: "#fff", padding: "11px 22px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", whiteSpace: "nowrap", animation: "cnc-fadeUp 0.3s ease" }}>
          {toast}
        </div>
      )}

      <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans',sans-serif", transition: "background 0.5s" }}>

        {/* Navbar */}
        <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 14px" : "14px 28px", height: isMobile ? 56 : "auto", background: navBg, backdropFilter: "blur(18px)", borderBottom: `1px solid ${navBdr}` }}>
          <button onClick={() => navigate("/app/dashboard")} style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", border: "none", cursor: "pointer", color: sc, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
            <ChevronLeft size={16} />
            {!isMobile && "Dashboard"}
          </button>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 16 : 18, fontWeight: 800, color: tc }}>
            Calendrier des Concours
          </span>
          <div style={{ width: 80 }} />
        </nav>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 14px 48px" : "32px 28px 64px" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 36, animation: "cnc-fadeUp 0.5s ease both" }}>
            <div style={{ marginBottom: 12 }}><CalendarDays size={isMobile ? 36 : 48} color="#7c3aed" /></div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 24 : 32, fontWeight: 800, color: tc, margin: "0 0 10px", letterSpacing: "-0.5px" }}>
              Calendrier des Concours 2026
            </h1>
            <p style={{ fontSize: 14, color: sc, maxWidth: 520, margin: "0 auto" }}>
              Tous les concours marocains en un seul endroit — ne rate aucune date importante.
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28, animation: "cnc-fadeUp 0.5s 0.1s ease both" }}>
            {/* Search */}
            <div style={{ position: "relative", maxWidth: 460, margin: "0 auto", width: "100%" }}>
              <Search size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: sc, pointerEvents: "none" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Chercher un concours, une école…"
                style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(124,58,237,0.15)", background: dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)", color: tc, fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none" }}
              />
            </div>

            {/* Filters + Sort */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              {/* Filter tabs */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {FILTERS.map((f, i) => (
                  <button key={i} onClick={() => setFilter(i)}
                    style={{ padding: "7px 15px", borderRadius: 99, border: filter === i ? "none" : `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.15)"}`, background: filter === i ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : (dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)"), color: filter === i ? "#fff" : sc, fontSize: 12.5, fontWeight: filter === i ? 700 : 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", boxShadow: filter === i ? "0 4px 14px rgba(124,58,237,0.35)" : "none" }}>
                    {f.label}
                  </button>
                ))}
              </div>
              {/* Sort */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <SlidersHorizontal size={13} color={sc} />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: 9, border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(124,58,237,0.15)", background: dark ? "rgba(255,255,255,0.07)" : "#fff", color: tc, fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer" }}>
                  <option value="exam_date">Trier par : date d'examen</option>
                  <option value="reg_start">Trier par : inscription ouverte</option>
                </select>
              </div>
            </div>
          </div>

          {/* Count */}
          <p style={{ fontSize: 13, color: sc, marginBottom: 20, textAlign: "center", animation: "cnc-fadeUp 0.5s 0.15s ease both" }}>
            {loading ? "Chargement…" : `${visible.length} concours${visible.length !== 1 ? "" : ""}`}
            {filter > 0 && !loading && ` · ${FILTERS[filter].label}`}
            {search && !loading && ` · "${search}"`}
          </p>

          {/* Grid */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 280, borderRadius: 20, background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)", animation: "cnc-pulse 1.4s ease-in-out infinite" }} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px", color: sc, animation: "cnc-fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 16 }}><Search size={48} color={sc} /></div>
              <p style={{ fontSize: 16, fontWeight: 700, color: tc, fontFamily: "'Fraunces',serif" }}>Aucun concours trouvé</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Essaie un autre filtre ou terme de recherche.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(360px,1fr))", gap: 20, animation: "cnc-fadeUp 0.4s ease" }}>
              {visible.map(c => (
                <ConcoursCard
                  key={c.id}
                  c={c}
                  dark={dark}
                  subscribed={!!subscribed[c.id]}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          )}

          {/* Legend */}
          {!loading && visible.length > 0 && (
            <div style={{ marginTop: 40, padding: "16px 20px", background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)", borderRadius: 14, border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(124,58,237,0.1)", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", animation: "cnc-fadeUp 0.5s 0.2s ease both" }}>
              <LegendItem color="#10b981" label="Plus de 60 jours" />
              <LegendItem color="#f59e0b" label="30 à 60 jours" />
              <LegendItem color="#ef4444" label="Moins de 30 jours (urgent)" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
    </div>
  );
}
