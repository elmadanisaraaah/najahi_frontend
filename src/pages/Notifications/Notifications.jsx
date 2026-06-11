import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCheck, Trash2, BellOff } from "lucide-react";

const API = (p) => `${import.meta.env.VITE_API_URL}/api/notifications${p}`;
const token = () => localStorage.getItem("najahi_token");

function useTheme() {
  const [dark] = useState(() => {
    const s = localStorage.getItem("najahi_theme");
    return s ? s === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  return dark;
}

const TYPE_META = {
  info:        { emoji: "ℹ️",  label: "Info",        color: "#6b7280" },
  success:     { emoji: "✅",  label: "Succès",       color: "#10b981" },
  warning:     { emoji: "⚠️",  label: "Attention",    color: "#f59e0b" },
  concours:    { emoji: "📅",  label: "Concours",     color: "#3b82f6" },
  orientation: { emoji: "🧭",  label: "Orientation",  color: "#8b5cf6" },
  forum:       { emoji: "💬",  label: "Forum",        color: "#ec4899" },
};

const FILTERS = [
  { id: "all",         label: "Toutes" },
  { id: "unread",      label: "Non lues" },
  { id: "concours",    label: "Concours" },
  { id: "orientation", label: "Orientation" },
  { id: "forum",       label: "Forum" },
];

function fmtAgo(iso) {
  if (!iso) return "";
  const str = iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z";
  const diff = Date.now() - new Date(str).getTime();
  if (diff < 0)        return "À l'instant";
  if (diff < 60000)    return "À l'instant";
  if (diff < 3600000)  return `Il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000)return `Il y a ${Math.floor(diff / 86400000)}j`;
  return new Date(str).toLocaleDateString("fr-FR", { day:"2-digit", month:"short" });
}

export default function Notifications() {
  const navigate = useNavigate();
  const dark     = useTheme();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [deleting, setDeleting] = useState(null);

  const bg   = dark ? "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" : "linear-gradient(135deg,#e9e4ff,#f0f4ff,#fdf6ff)";
  const card = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.75)";
  const brd  = dark ? "rgba(255,255,255,0.1)"  : "rgba(124,58,237,0.15)";
  const txt  = dark ? "#f3f4f6"                 : "#1e1b4b";
  const sub  = dark ? "rgba(255,255,255,0.45)"  : "rgba(30,27,75,0.45)";

  const fetchAll = useCallback(async () => {
    const tok = token();
    if (!tok) return;
    try {
      const r = await fetch(API("?limit=100"), {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (!r.ok) return;
      const d = await r.json();
      setItems(d.notifications || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function markRead(id) {
    const tok = token();
    if (!tok) return;
    try {
      await fetch(API(`/${id}/read`), { method: "PUT", headers: { Authorization: `Bearer ${tok}` } });
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (_) {}
  }

  async function markAllRead() {
    const tok = token();
    if (!tok) return;
    try {
      await fetch(API("/read-all"), { method: "PUT", headers: { Authorization: `Bearer ${tok}` } });
      setItems(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (_) {}
  }

  async function deleteNotif(id) {
    const tok = token();
    if (!tok) return;
    setDeleting(id);
    try {
      await fetch(API(`/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${tok}` } });
      setItems(prev => prev.filter(n => n.id !== id));
    } catch (_) {}
    finally { setDeleting(null); }
  }

  function handleClick(n) {
    if (!n.is_read) markRead(n.id);
    if (n.link) navigate(n.link);
  }

  const filtered = items.filter(n => {
    if (filter === "all")    return true;
    if (filter === "unread") return !n.is_read;
    return n.type === filter;
  });

  const unreadCount = items.filter(n => !n.is_read).length;

  const pillStyle = (active) => ({
    padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
    border: active ? "2px solid #7c3aed" : `1.5px solid ${brd}`,
    background: active ? (dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.08)") : "transparent",
    color: active ? "#7c3aed" : sub,
    cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "0 16px 60px", fontFamily: "'DM Sans',sans-serif" }}>
      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%)", top: "-10%", right: "-5%" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.07),transparent 70%)", bottom: "5%", left: "-5%" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0 20px" }}>
          <button onClick={() => navigate("/app/dashboard")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${brd}`, background: "transparent", color: txt, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ArrowLeft size={14} /> Tableau de bord
          </button>

          {unreadCount > 0 && (
            <button onClick={markAllRead}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: "rgba(124,58,237,0.1)", color: "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
            >
              <CheckCheck size={14} /> Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(124,58,237,0.12)", border: `1px solid rgba(124,58,237,0.2)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={20} color="#7c3aed" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: 24, color: txt }}>
              Notifications
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: sub }}>
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est lu"}
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={pillStyle(filter === f.id)}>
              {f.label}
              {f.id === "unread" && unreadCount > 0 && (
                <span style={{ marginLeft: 5, background: "#7c3aed", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10 }}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: sub }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            <p style={{ margin: 0, fontSize: 14 }}>Chargement…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "70px 30px",
            background: card, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${brd}`, borderRadius: 18,
          }}>
            <BellOff size={48} color={sub} style={{ marginBottom: 14 }} />
            <h3 style={{ margin: "0 0 8px", fontFamily: "'Fraunces',serif", fontSize: 20, color: txt }}>
              Aucune notification
            </h3>
            <p style={{ margin: 0, color: sub, fontSize: 14, lineHeight: 1.6 }}>
              {filter === "unread"
                ? "Tu as tout lu — bien joué !"
                : "Rien ici pour l'instant. Les notifications apparaîtront au fil de ton activité."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(n => {
              const meta = TYPE_META[n.type] || TYPE_META.info;
              return (
                <div key={n.id}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "14px 16px",
                    background: n.is_read ? card : (dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)"),
                    border: `1px solid ${n.is_read ? brd : "rgba(124,58,237,0.25)"}`,
                    borderRadius: 14,
                    cursor: n.link ? "pointer" : "default",
                    transition: "all 0.18s",
                    position: "relative",
                  }}
                  onClick={() => handleClick(n)}
                  onMouseEnter={e => { if (n.link) e.currentTarget.style.transform = "translateX(3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  {/* Unread dot */}
                  {!n.is_read && (
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      width: 8, height: 8, borderRadius: "50%", background: "#7c3aed",
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: meta.color + "18", fontSize: 18,
                  }}>
                    {meta.emoji}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: n.is_read ? 600 : 800, fontSize: 14, color: txt, fontFamily: "'DM Sans',sans-serif" }}>
                        {n.title}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                        background: meta.color + "18", color: meta.color, flexShrink: 0,
                      }}>
                        {meta.label}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 5px", fontSize: 13, color: sub, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: 11, color: sub, opacity: 0.7 }}>{fmtAgo(n.created_at)}</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                    disabled={deleting === n.id}
                    style={{
                      flexShrink: 0, alignSelf: "flex-start",
                      padding: "6px", borderRadius: 8, border: "none",
                      background: "transparent", cursor: "pointer",
                      color: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
