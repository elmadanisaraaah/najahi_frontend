import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Users, Activity, Compass, MessageSquare, BookOpen, TrendingUp,
  Search, ChevronLeft, ChevronRight, Trash2, CheckCircle, XCircle,
  LogOut, RefreshCw, LayoutDashboard, Settings, AlertTriangle,
  ChevronDown, Menu, Shield, GraduationCap, CalendarDays, Plus, Pencil, X, Star,
  FileText, Download,
} from "lucide-react";

const CAPI = (path) => `${import.meta.env.VITE_API_URL || ""}/api/concours${path}`;
const TAPI = (path) => `${import.meta.env.VITE_API_URL || ""}/api/temoignages${path}`;

const CONCOURS_CATS = [
  "Ingénierie","Télécommunications","Commerce & Management","Santé",
  "Architecture","Classes Préparatoires","Université Internationale","Université Privée",
];

const API = (path) => `${import.meta.env.VITE_API_URL || ""}/api/admin${path}`;
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("najahi_token") || ""}` });

const fmtDate = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" }); }
  catch { return "—"; }
};
const fmtRelative = (iso) => {
  if (!iso) return "—";
  try {
    // If the backend returns a naive ISO string (no Z / offset), treat it as UTC
    const hasZone = iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso);
    const utcIso = hasZone ? iso : iso + "Z";
    const diff = Date.now() - new Date(utcIso).getTime();
    if (diff < 0) return "À l'instant";
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return fmtDate(iso);
  } catch { return "—"; }
};

const TYPE_COLOR = { login: "#10b981", register: "#7c3aed", orientation: "#f59e0b" };
const TYPE_LABEL = { login: "Connexion", register: "Inscription", orientation: "Orientation" };
const TYPE_ICON  = { login: "🔑", register: "✨", orientation: "🧭" };

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

function Spinner({ size = 20, color = "#7c3aed" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}33`, borderTop: `2px solid ${color}`,
      animation: "adm-spin 0.8s linear infinite", flexShrink: 0,
    }} />
  );
}

function UserAvatar({ u, size = 34 }) {
  const letter = (u.prenom?.[0] || u.email?.[0] || "?").toUpperCase();
  const palette = ["#7c3aed","#10b981","#f59e0b","#3b82f6","#ef4444","#06b6d4"];
  const bg = palette[letter.charCodeAt(0) % palette.length];
  if (u.avatar_url) return <img src={u.avatar_url} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${bg},${bg}bb)`, display: "grid", placeItems: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
      {letter}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f0eeff", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={19} color={color} strokeWidth={2} />
      </div>
      <div>
        {loading
          ? <div style={{ height: 30, width: 56, background: "#f3f0ff", borderRadius: 6, animation: "adm-pulse 1.4s ease-in-out infinite" }} />
          : <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Fraunces',serif", color: "#1a1a2e", letterSpacing: "-1.5px", lineHeight: 1 }}>{value ?? "—"}</div>
        }
        <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 5, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview — charts
// ─────────────────────────────────────────────────────────────────────────────

function ActivityBars({ activity }) {
  const counts = { login: 0, register: 0, orientation: 0 };
  activity.forEach(e => { if (e.type in counts) counts[e.type]++; });
  const max = Math.max(1, counts.login, counts.register, counts.orientation);
  const rows = [
    { label: "Connexions",   count: counts.login,       color: "#10b981" },
    { label: "Inscriptions", count: counts.register,    color: "#7c3aed" },
    { label: "Orientations", count: counts.orientation, color: "#f59e0b" },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f0eeff", flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 6, fontFamily: "'Fraunces',serif" }}>Répartition de l'activité</div>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>Basé sur les 40 derniers événements</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rows.map(r => (
          <div key={r.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: r.color, fontFamily: "'Fraunces',serif" }}>{r.count}</span>
            </div>
            <div style={{ height: 8, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(r.count / max) * 100}%`, background: r.color, borderRadius: 99, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricsBars({ stats }) {
  if (!stats) return null;
  const total = Math.max(1, stats.total_users);
  const rows = [
    { label: "Actifs aujourd'hui", value: stats.active_today, pct: Math.min(100, Math.round((stats.active_today / total) * 100)), color: "#10b981" },
    { label: "Orientations / inscrits", value: stats.total_orientations, pct: Math.min(100, Math.round((stats.total_orientations / total) * 100)), color: "#f59e0b" },
    { label: "Nouveaux cette semaine", value: stats.new_this_week, pct: Math.min(100, Math.round((stats.new_this_week / total) * 100)), color: "#7c3aed" },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f0eeff", flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 6, fontFamily: "'Fraunces',serif" }}>Métriques clés</div>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>En pourcentage du total ({stats.total_users} utilisateurs)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rows.map(r => (
          <div key={r.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: r.color, fontFamily: "'Fraunces',serif" }}>{r.pct}%</span>
            </div>
            <div style={{ height: 8, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${r.pct}%`, background: r.color, borderRadius: 99, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Section
// ─────────────────────────────────────────────────────────────────────────────

function OverviewSection({ stats, statsLoading, activity, actLoading, onRefresh, isMobile }) {
  const CARDS = [
    { icon: Users,         label: "Utilisateurs",        value: stats?.total_users,        color: "#7c3aed" },
    { icon: Activity,      label: "Actifs aujourd'hui",  value: stats?.active_today,       color: "#10b981" },
    { icon: Compass,       label: "Orientations",        value: stats?.total_orientations, color: "#f59e0b" },
    { icon: MessageSquare, label: "Chats écoles",        value: stats?.total_chats,        color: "#3b82f6" },
    { icon: BookOpen,      label: "Sessions solo",       value: stats?.total_sessions,     color: "#ec4899" },
    { icon: TrendingUp,    label: "Nouveaux / semaine",  value: stats?.new_this_week,      color: "#06b6d4" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 26, gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0, letterSpacing: "-0.5px" }}>Vue d'ensemble</h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "5px 0 0" }}>Tableau de bord de la plateforme Najahi</p>
        </div>
        <button onClick={onRefresh} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, color: "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", whiteSpace: "nowrap", flexShrink: 0 }}>
          <RefreshCw size={12} /> Actualiser
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        {CARDS.map(c => <StatCard key={c.label} {...c} loading={statsLoading} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 320px", gap: 16 }}>
        <ActivityBars activity={activity} />
        {!statsLoading && <MetricsBars stats={stats} />}

        {/* Activity feed */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f0eeff", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f3ff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", fontFamily: "'Fraunces',serif" }}>Activité récente</span>
            <Activity size={15} color="#7c3aed" />
          </div>
          <div style={{ maxHeight: 310, overflowY: "auto" }}>
            {actLoading
              ? <div style={{ padding: 32, display: "flex", justifyContent: "center" }}><Spinner /></div>
              : activity.length === 0
              ? <div style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Aucune activité</div>
              : activity.slice(0, 14).map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 16px", borderBottom: "1px solid #faf9ff" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${TYPE_COLOR[ev.type]}14`, display: "grid", placeItems: "center", fontSize: 13, flexShrink: 0 }}>
                    {TYPE_ICON[ev.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: TYPE_COLOR[ev.type] }}>{TYPE_LABEL[ev.type]}</div>
                    <div style={{ fontSize: 12, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ev.prenom ? `${ev.prenom} · ` : ""}{ev.email}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{fmtRelative(ev.ts)}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Users Section
// ─────────────────────────────────────────────────────────────────────────────

function UsersSection({ users, usersTotal, usersPages, usersPage, usersLoading, searchInput, setSearchInput, goPage, deleteUser, deletingId, confirmId, setConfirmId }) {
  const [dangerOpen, setDangerOpen] = useState(false);
  const cols = dangerOpen ? 7 : 6;

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0, letterSpacing: "-0.5px" }}>Utilisateurs</h2>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "5px 0 0" }}>{usersTotal} compte{usersTotal !== 1 ? "s" : ""} enregistré{usersTotal !== 1 ? "s" : ""}</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f0eeff", overflow: "hidden", marginBottom: 16 }}>
        {/* Search */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f3ff" }}>
          <div style={{ position: "relative", maxWidth: 380 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Chercher par email, prénom, nom…"
              style={{ width: "100%", paddingLeft: 35, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: "1px solid #e5e7eb", background: "#fafafa", color: "#1a1a2e", fontSize: 13, fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", outline: "none" }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "2px solid #f0eeff" }}>
                {["Utilisateur","Email","Rôle","Inscrit","Dernière connexion","Vérifié"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "#9ca3af", whiteSpace: "nowrap", letterSpacing: "0.6px", textTransform: "uppercase" }}>{h}</th>
                ))}
                {dangerOpen && (
                  <th style={{ padding: "11px 16px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "#ef4444", letterSpacing: "0.6px", textTransform: "uppercase" }}>Supprimer</th>
                )}
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr><td colSpan={cols} style={{ padding: 48, textAlign: "center" }}><div style={{ display: "flex", justifyContent: "center" }}><Spinner /></div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={cols} style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Aucun utilisateur trouvé</td></tr>
              ) : users.map(u => (
                <tr key={u.id}
                  style={{ borderBottom: "1px solid #f9f8ff", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fdfcff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <UserAvatar u={u} size={32} />
                      <span style={{ fontWeight: 600, color: "#1a1a2e", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {(u.prenom || u.nom) ? `${u.prenom || ""} ${u.nom || ""}`.trim() : "—"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", color: "#6b7280", maxWidth: 210, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: u.role === "admin" ? "rgba(124,58,237,0.1)" : "rgba(16,185,129,0.1)", color: u.role === "admin" ? "#7c3aed" : "#10b981" }}>
                      {u.role === "admin" && <Shield size={10} />}
                      {u.role === "admin" ? "Admin" : "Étudiant"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", color: "#9ca3af", whiteSpace: "nowrap", fontSize: 12.5 }}>{fmtDate(u.created_at)}</td>
                  <td style={{ padding: "13px 16px", color: "#9ca3af", whiteSpace: "nowrap", fontSize: 12.5 }}>{fmtRelative(u.last_login_at)}</td>
                  <td style={{ padding: "13px 16px" }}>
                    {u.is_email_verified
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: "#10b981" }}><CheckCircle size={13} /> Vérifié</span>
                      : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: "#f59e0b" }}><XCircle size={13} /> En attente</span>
                    }
                  </td>
                  {dangerOpen && (
                    <td style={{ padding: "13px 16px" }}>
                      {u.role !== "admin" && (
                        <button onClick={() => setConfirmId(u.id)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", color: "#ef4444", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                          <Trash2 size={11} /> Supprimer
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersPages > 1 && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #f5f3ff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Page {usersPage} sur {usersPages} · {usersTotal} utilisateurs</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => goPage(usersPage - 1)} disabled={usersPage <= 1}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "transparent", color: "#6b7280", cursor: usersPage <= 1 ? "not-allowed" : "pointer", opacity: usersPage <= 1 ? 0.4 : 1 }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, usersPages) }).map((_, i) => {
                const p = Math.max(1, Math.min(usersPages - 4, usersPage - 2)) + i;
                return (
                  <button key={p} onClick={() => goPage(p)}
                    style={{ padding: "6px 11px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: p === usersPage ? "none" : "1px solid #e5e7eb", background: p === usersPage ? "#7c3aed" : "transparent", color: p === usersPage ? "#fff" : "#6b7280", cursor: "pointer" }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => goPage(usersPage + 1)} disabled={usersPage >= usersPages}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "transparent", color: "#6b7280", cursor: usersPage >= usersPages ? "not-allowed" : "pointer", opacity: usersPage >= usersPages ? 0.4 : 1 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div style={{ borderRadius: 14, border: `1.5px solid ${dangerOpen ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.14)"}`, overflow: "hidden", transition: "border-color 0.25s" }}>
        <button onClick={() => setDangerOpen(d => !d)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", background: dangerOpen ? "rgba(239,68,68,0.05)" : "rgba(239,68,68,0.02)", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>Zone dangereuse</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>— activer les suppressions</span>
          </div>
          <ChevronDown size={14} color="#ef4444" style={{ transform: dangerOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
        {dangerOpen && (
          <div style={{ padding: "4px 18px 14px", background: "rgba(239,68,68,0.02)" }}>
            <p style={{ fontSize: 12.5, color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>
              ⚠️ Les boutons de suppression sont maintenant visibles dans le tableau ci-dessus.{" "}
              <strong style={{ color: "#ef4444" }}>La suppression est irréversible</strong> — toutes les données de l'utilisateur seront effacées.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Orientations Section
// ─────────────────────────────────────────────────────────────────────────────

function OrientationsSection({ orientations, orientLoading }) {
  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0, letterSpacing: "-0.5px" }}>Orientations</h2>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "5px 0 0" }}>Résultats des tests d'orientation passés par les étudiants</p>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #f0eeff", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "2px solid #f0eeff" }}>
                {["Étudiant","Email","Écoles recommandées","Date"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.6px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orientLoading ? (
                <tr><td colSpan={4} style={{ padding: 48, textAlign: "center" }}><div style={{ display: "flex", justifyContent: "center" }}><Spinner /></div></td></tr>
              ) : orientations.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Aucune orientation enregistrée</td></tr>
              ) : orientations.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #f9f8ff" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fdfcff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "13px 16px", fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap" }}>
                    {(o.prenom || o.nom) ? `${o.prenom || ""} ${o.nom || ""}`.trim() : "—"}
                  </td>
                  <td style={{ padding: "13px 16px", color: "#6b7280", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.email}</td>
                  <td style={{ padding: "13px 16px" }}>
                    {Array.isArray(o.top_schools) ? (
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {o.top_schools.slice(0, 3).map((s, i) => (
                          <span key={i} style={{ padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: "rgba(124,58,237,0.08)", color: "#7c3aed", whiteSpace: "nowrap" }}>{s}</span>
                        ))}
                        {o.top_schools.length > 3 && <span style={{ fontSize: 11, color: "#9ca3af" }}>+{o.top_schools.length - 3}</span>}
                      </div>
                    ) : <span style={{ color: "#9ca3af" }}>—</span>}
                  </td>
                  <td style={{ padding: "13px 16px", color: "#9ca3af", whiteSpace: "nowrap", fontSize: 12.5 }}>{fmtDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Concours Modal (create / edit)
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = { name:"", school:"", category:"", registration_start:"", registration_end:"", exam_date:"", results_date:"", description:"", official_link:"" };

function ConcoursModal({ mode, initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [err,  setErr]  = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim() || !form.school.trim() || !form.category) {
      setErr("Nom, établissement et catégorie sont requis"); return;
    }
    setErr("");
    onSave(form);
  };

  const iStyle = { width:"100%", padding:"9px 11px", borderRadius:9, border:"1px solid #e5e7eb", background:"#fafafa", color:"#1a1a2e", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" };
  const lStyle = { fontSize:12, fontWeight:700, color:"#6b7280", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.4px" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9100, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:20, padding:"28px 30px", maxWidth:580, width:"100%", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.18)", animation:"adm-fadeUp 0.22s ease" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
          <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:19, fontWeight:800, color:"#1a1a2e", margin:0 }}>
            {mode === "create" ? "Ajouter un concours" : "Modifier le concours"}
          </h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex" }}><X size={18}/></button>
        </div>

        {err && <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#ef4444", borderRadius:9, padding:"9px 13px", fontSize:13, marginBottom:16 }}>{err}</div>}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={lStyle}>Nom du concours *</label>
            <input style={iStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="ex: CNC - Concours National Commun" maxLength={200} />
          </div>
          <div>
            <label style={lStyle}>Établissement *</label>
            <input style={iStyle} value={form.school} onChange={e => set("school", e.target.value)} placeholder="ex: ENSA Rabat" maxLength={150} />
          </div>
          <div>
            <label style={lStyle}>Catégorie *</label>
            <select style={{ ...iStyle, cursor:"pointer" }} value={form.category} onChange={e => set("category", e.target.value)}>
              <option value="">Sélectionner…</option>
              {CONCOURS_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lStyle}>Début inscriptions</label>
            <input type="date" style={iStyle} value={form.registration_start || ""} onChange={e => set("registration_start", e.target.value)} />
          </div>
          <div>
            <label style={lStyle}>Fin inscriptions</label>
            <input type="date" style={iStyle} value={form.registration_end || ""} onChange={e => set("registration_end", e.target.value)} />
          </div>
          <div>
            <label style={lStyle}>Date d'examen</label>
            <input type="date" style={iStyle} value={form.exam_date || ""} onChange={e => set("exam_date", e.target.value)} />
          </div>
          <div>
            <label style={lStyle}>Date des résultats</label>
            <input type="date" style={iStyle} value={form.results_date || ""} onChange={e => set("results_date", e.target.value)} />
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={lStyle}>Description</label>
            <textarea style={{ ...iStyle, minHeight:70, resize:"vertical", lineHeight:1.55 }} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Brève description du concours…" />
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={lStyle}>Lien officiel</label>
            <input style={iStyle} value={form.official_link || ""} onChange={e => set("official_link", e.target.value)} placeholder="https://…" type="url" />
          </div>
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
          <button onClick={onClose} style={{ padding:"10px 22px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding:"10px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", fontSize:13, fontWeight:700, cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:7, fontFamily:"'DM Sans',sans-serif", opacity:saving?0.7:1 }}>
            {saving ? <Spinner size={14} color="#fff"/> : null}
            {mode === "create" ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Concours Section
// ─────────────────────────────────────────────────────────────────────────────

const CAT_DOT = {
  "Ingénierie":"#7c3aed","Télécommunications":"#3b82f6","Commerce & Management":"#f59e0b",
  "Santé":"#ef4444","Architecture":"#10b981","Classes Préparatoires":"#06b6d4",
  "Université Internationale":"#8b5cf6","Université Privée":"#a78bfa",
};

function ConcoursSection({ concours, loading, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:26, gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:800, color:"#1a1a2e", margin:0, letterSpacing:"-0.5px" }}>Calendrier des Concours</h2>
          <p style={{ fontSize:13, color:"#6b7280", margin:"5px 0 0" }}>{concours.length} concours enregistré{concours.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={onAdd} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:11, fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(124,58,237,0.35)", whiteSpace:"nowrap", flexShrink:0, fontFamily:"'DM Sans',sans-serif" }}>
          <Plus size={14}/> Ajouter un concours
        </button>
      </div>

      <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 1px 3px rgba(0,0,0,0.05),0 4px 16px rgba(0,0,0,0.04)", border:"1px solid #f0eeff", overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#fafafa", borderBottom:"2px solid #f0eeff" }}>
                {["Concours","Établissement","Catégorie","Fin inscriptions","Date examen","Actions"].map(h => (
                  <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:10.5, fontWeight:700, color:"#9ca3af", whiteSpace:"nowrap", letterSpacing:"0.6px", textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding:48, textAlign:"center" }}><div style={{ display:"flex", justifyContent:"center" }}><Spinner/></div></td></tr>
              ) : concours.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:48, textAlign:"center", color:"#9ca3af" }}>Aucun concours enregistré</td></tr>
              ) : concours.map(c => {
                const dot = CAT_DOT[c.category] || "#7c3aed";
                const fmtD = iso => iso ? new Date(iso).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"2-digit"}) : "—";
                return (
                  <tr key={c.id} style={{ borderBottom:"1px solid #f9f8ff" }}
                    onMouseEnter={e => e.currentTarget.style.background="#fdfcff"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <td style={{ padding:"12px 16px", fontWeight:700, color:"#1a1a2e", maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</td>
                    <td style={{ padding:"12px 16px", color:"#6b7280", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.school}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:99, fontSize:11, fontWeight:700, background:dot+"14", color:dot }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:dot, flexShrink:0 }}/>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px", color:"#9ca3af", whiteSpace:"nowrap", fontSize:12.5 }}>{fmtD(c.registration_end)}</td>
                    <td style={{ padding:"12px 16px", whiteSpace:"nowrap", fontSize:12.5 }}>
                      {c.exam_date ? (
                        <span style={{ fontWeight:700, color: c.days_until_exam !== null && c.days_until_exam < 30 ? "#ef4444" : c.days_until_exam !== null && c.days_until_exam < 60 ? "#f59e0b" : "#1a1a2e" }}>
                          {fmtD(c.exam_date)}{c.days_until_exam !== null && c.days_until_exam >= 0 && ` (J-${c.days_until_exam})`}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => onEdit(c)} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, border:"1px solid rgba(124,58,237,0.25)", background:"rgba(124,58,237,0.07)", color:"#7c3aed", fontSize:11.5, fontWeight:600, cursor:"pointer" }}>
                          <Pencil size={11}/> Modifier
                        </button>
                        <button onClick={() => onDelete(c.id)} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.06)", color:"#ef4444", fontSize:11.5, fontWeight:600, cursor:"pointer" }}>
                          <Trash2 size={11}/> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Temoignages section
// ─────────────────────────────────────────────────────────────────────────────

function StarsDisplay({ rating }) {
  return (
    <span style={{ display:"inline-flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} fill={i<=rating?"#f59e0b":"none"} color={i<=rating?"#f59e0b":"#d1d5db"} />
      ))}
    </span>
  );
}

function TemoignagesSection({ pending, loading, onApprove, onDelete, onRefresh }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:800, color:"#1a1a2e", margin:0, letterSpacing:"-0.5px" }}>
            Témoignages en attente
          </h2>
          <p style={{ fontSize:13, color:"#6b7280", margin:"5px 0 0" }}>
            {loading ? "Chargement…" : `${pending.length} témoignage${pending.length!==1?"s":""} en attente de validation`}
          </p>
        </div>
        <button onClick={onRefresh} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:12, fontWeight:600, cursor:"pointer" }}>
          <RefreshCw size={13}/> Actualiser
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"60px", color:"#9ca3af" }}>
          <Spinner size={28} color="#7c3aed" />
        </div>
      ) : pending.length === 0 ? (
        <div style={{ background:"#fff", borderRadius:16, padding:"72px 32px", textAlign:"center", border:"1px solid #f0eeff" }}>
          <div style={{ fontSize:44, marginBottom:14 }}>✅</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#1a1a2e", fontFamily:"'Fraunces',serif", marginBottom:6 }}>
            Tout est validé !
          </div>
          <div style={{ fontSize:13, color:"#9ca3af" }}>Aucun témoignage en attente de modération.</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {pending.map(t => (
            <div key={t.id} style={{ background:"#fff", borderRadius:14, padding:"18px 20px", border:"1px solid #f0eeff", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", borderLeft:"4px solid #f59e0b" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                {/* Avatar */}
                <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(124,58,237,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"#7c3aed", flexShrink:0 }}>
                  {t.user_name?.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                    <span style={{ fontWeight:700, fontSize:14, color:"#1a1a2e" }}>{t.user_name || "Anonyme"}</span>
                    <span style={{ padding:"2px 8px", borderRadius:99, background:"rgba(124,58,237,0.1)", color:"#7c3aed", fontSize:11, fontWeight:700 }}>{t.school}</span>
                    {t.filiere && <span style={{ fontSize:12, color:"#6b7280" }}>{t.filiere}</span>}
                    {t.annee_entree && <span style={{ fontSize:12, color:"#9ca3af" }}>· {t.annee_entree}</span>}
                    <StarsDisplay rating={t.rating} />
                  </div>
                  <p style={{ margin:"6px 0 10px", fontSize:13, color:"#374151", lineHeight:1.6, fontStyle:"italic" }}>
                    "{t.content}"
                  </p>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{fmtDate(t.created_at)}</div>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button onClick={() => onApprove(t.id)}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:9, border:"none", background:"rgba(16,185,129,0.1)", color:"#10b981", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    <CheckCircle size={13}/> Approuver
                  </button>
                  <button onClick={() => onDelete(t.id)}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:9, border:"none", background:"rgba(239,68,68,0.08)", color:"#ef4444", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    <Trash2 size={13}/> Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_LABELS_DOC = { sujet_concours: "Sujet de concours", fiche_revision: "Fiche de révision", autre: "Autre" };

function DocumentsSection({ docs, loading, onApprove, onDelete, onRefresh }) {
  const pending  = docs.filter(d => !d.is_approved);
  const approved = docs.filter(d => d.is_approved);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>Documents partagés</h2>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>
            {pending.length} en attente · {approved.length} approuvés
          </p>
        </div>
        <button onClick={onRefresh} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 14 }}>Chargement…</div>
      ) : docs.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: "60px 32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0eeff" }}>
          <FileText size={36} color="#d1d5db" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>Aucun document</div>
          <div style={{ fontSize: 13, color: "#9ca3af" }}>Les documents soumis par les utilisateurs apparaîtront ici.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pending.length > 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", padding: "6px 14px", background: "rgba(245,158,11,0.08)", borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)", display: "inline-block", marginBottom: 4 }}>
              EN ATTENTE D'APPROBATION ({pending.length})
            </div>
          )}
          {docs.map(d => {
            const uploader = [d.prenom, d.nom].filter(Boolean).join(" ") || "—";
            return (
              <div key={d.id} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: d.is_approved ? "1px solid #f0eeff" : "1px solid rgba(245,158,11,0.3)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(124,58,237,0.08)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <FileText size={20} color="#7c3aed" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{d.title}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: d.is_approved ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: d.is_approved ? "#10b981" : "#f59e0b", fontWeight: 700, border: `1px solid ${d.is_approved ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}` }}>
                      {d.is_approved ? "Approuvé" : "En attente"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
                    {TYPE_LABELS_DOC[d.type] || "Autre"} {d.school ? `· ${d.school}` : ""} · Par {uploader} · {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "'DM Sans',sans-serif" }}>
                    <Download size={12} /> PDF
                  </a>
                  {!d.is_approved && (
                    <button onClick={() => onApprove(d.id)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: "none", background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                      <CheckCircle size={12} /> Approuver
                    </button>
                  )}
                  <button onClick={() => onDelete(d.id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: "none", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    <Trash2 size={12} /> Suppr.
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ComingSoon({ title, emoji }) {
  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 800, color: "#1a1a2e", margin: 0, letterSpacing: "-0.5px" }}>{title}</h2>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: "72px 32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0eeff" }}>
        <div style={{ fontSize: 52, marginBottom: 18 }}>{emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: 8, fontFamily: "'Fraunces',serif" }}>Bientôt disponible</div>
        <div style={{ fontSize: 13, color: "#9ca3af" }}>Cette section est en cours de développement.</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const NAV = [
  { id: "overview",     icon: LayoutDashboard, label: "Vue d'ensemble", emoji: "📊" },
  { id: "users",        icon: Users,           label: "Utilisateurs",   emoji: "👥" },
  { id: "orientations", icon: Compass,         label: "Orientations",   emoji: "🧭" },
  { id: "concours",     icon: CalendarDays,    label: "Concours",       emoji: "📅" },
  { id: "temoignages",  icon: Star,            label: "Témoignages",    emoji: "⭐" },
  { id: "forum",        icon: MessageSquare,   label: "Forum",          emoji: "💬" },
  { id: "documents",    icon: FileText,        label: "Documents",      emoji: "📄" },
  { id: "schools",      icon: BookOpen,        label: "Écoles",         emoji: "📚" },
  { id: "settings",     icon: Settings,        label: "Paramètres",     emoji: "⚙️" },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab,   setActiveTab]   = useState("overview");
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/app/dashboard", { replace: true });
  }, [user]);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const [stats,         setStats]         = useState(null);
  const [statsLoading,  setStatsLoading]  = useState(true);
  const [users,         setUsers]         = useState([]);
  const [usersTotal,    setUsersTotal]    = useState(0);
  const [usersPages,    setUsersPages]    = useState(1);
  const [usersPage,     setUsersPage]     = useState(1);
  const [usersLoading,  setUsersLoading]  = useState(true);
  const [search,        setSearch]        = useState("");
  const [searchInput,   setSearchInput]   = useState("");
  const [activity,      setActivity]      = useState([]);
  const [actLoading,    setActLoading]    = useState(true);
  const [orientations,      setOrientations]      = useState([]);
  const [orientLoading,     setOrientLoading]     = useState(false);
  const [concoursList,      setConcoursList]      = useState([]);
  const [concoursLoading,   setConcoursLoading]   = useState(false);
  const [concoursModal,     setConcoursModal]     = useState(null); // null | "create" | concoursObj
  const [concoursSaving,    setConcoursSaving]    = useState(false);
  const [confirmConcoursId, setConfirmConcoursId] = useState(null);
  const [temPending,        setTemPending]        = useState([]);
  const [temLoading,        setTemLoading]        = useState(false);
  const [docsAdmin,         setDocsAdmin]         = useState([]);
  const [docsLoading,       setDocsLoading]       = useState(false);
  const [deletingId,        setDeletingId]        = useState(null);
  const [confirmId,         setConfirmId]         = useState(null);
  const [toast,             setToast]             = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type }), 3200);
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try { const r = await fetch(API("/stats"), { headers: authH() }); if (r.ok) setStats(await r.json()); }
    catch {} finally { setStatsLoading(false); }
  };

  const fetchUsers = useCallback(async (page = 1, q = "") => {
    setUsersLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 20, ...(q ? { search: q } : {}) });
      const r = await fetch(API(`/users?${p}`), { headers: authH() });
      if (r.ok) { const d = await r.json(); setUsers(d.users || []); setUsersTotal(d.total || 0); setUsersPages(d.pages || 1); }
    } catch {} finally { setUsersLoading(false); }
  }, []);

  const fetchActivity = async () => {
    setActLoading(true);
    try { const r = await fetch(API("/activity"), { headers: authH() }); if (r.ok) setActivity((await r.json()).activity || []); }
    catch {} finally { setActLoading(false); }
  };

  const fetchOrientations = async () => {
    setOrientLoading(true);
    try { const r = await fetch(API("/orientations"), { headers: authH() }); if (r.ok) setOrientations((await r.json()).results || []); }
    catch {} finally { setOrientLoading(false); }
  };

  const fetchConcours = async () => {
    setConcoursLoading(true);
    try { const r = await fetch(CAPI("")); if (r.ok) setConcoursList(await r.json()); }
    catch {} finally { setConcoursLoading(false); }
  };

  const saveConcours = async (form) => {
    setConcoursSaving(true);
    const isEdit = concoursModal && concoursModal !== "create";
    const url    = isEdit ? CAPI(`/${concoursModal.id}`) : CAPI("");
    const method = isEdit ? "PUT" : "POST";
    try {
      const r = await fetch(url, { method, headers: { ...authH(), "Content-Type":"application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (r.ok) {
        if (isEdit) setConcoursList(prev => prev.map(c => c.id === d.id ? d : c));
        else        setConcoursList(prev => [...prev, d]);
        setConcoursModal(null);
        showToast(isEdit ? "Concours mis à jour" : "Concours créé !");
      } else {
        showToast(d.error || "Erreur", "error");
      }
    } catch { showToast("Erreur réseau", "error"); }
    finally { setConcoursSaving(false); }
  };

  const deleteConcours = async (id) => {
    try {
      const r = await fetch(CAPI(`/${id}`), { method:"DELETE", headers: authH() });
      if (r.ok) { setConcoursList(prev => prev.filter(c => c.id !== id)); showToast("Concours supprimé"); }
      else { const d = await r.json(); showToast(d.error || "Erreur", "error"); }
    } catch { showToast("Erreur réseau", "error"); }
    finally { setConfirmConcoursId(null); }
  };

  const fetchTemPending = async () => {
    setTemLoading(true);
    try {
      const r = await fetch(TAPI("/pending"), { headers: authH() });
      if (r.ok) setTemPending((await r.json()).temoignages || []);
    } catch {} finally { setTemLoading(false); }
  };

  const approveTem = async (id) => {
    try {
      const r = await fetch(TAPI(`/${id}/approve`), { method: "PUT", headers: authH() });
      if (r.ok) { setTemPending(prev => prev.filter(t => t.id !== id)); showToast("Témoignage approuvé !"); }
      else showToast("Erreur", "error");
    } catch { showToast("Erreur réseau", "error"); }
  };

  const deleteTem = async (id) => {
    try {
      const r = await fetch(TAPI(`/${id}`), { method: "DELETE", headers: authH() });
      if (r.ok) { setTemPending(prev => prev.filter(t => t.id !== id)); showToast("Témoignage supprimé"); }
      else showToast("Erreur", "error");
    } catch { showToast("Erreur réseau", "error"); }
  };

  const fetchDocsAdmin = async () => {
    setDocsLoading(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/documents/admin`, { headers: authH() });
      if (r.ok) setDocsAdmin(await r.json());
    } catch {} finally { setDocsLoading(false); }
  };

  const approveDoc = async (id) => {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/documents/admin/${id}/approve`, { method: "PUT", headers: authH() });
      if (r.ok) { showToast("Document approuvé"); fetchDocsAdmin(); }
      else showToast("Erreur", "error");
    } catch { showToast("Erreur réseau", "error"); }
  };

  const deleteDoc = async (id) => {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/documents/admin/${id}`, { method: "DELETE", headers: authH() });
      if (r.ok) { showToast("Document supprimé"); fetchDocsAdmin(); }
      else showToast("Erreur", "error");
    } catch { showToast("Erreur réseau", "error"); }
  };

  useEffect(() => { fetchStats(); fetchUsers(1, ""); fetchActivity(); }, []);
  useEffect(() => { if (activeTab === "orientations"  && orientations.length === 0)  fetchOrientations(); }, [activeTab]);
  useEffect(() => { if (activeTab === "concours"      && concoursList.length === 0)  fetchConcours();      }, [activeTab]);
  useEffect(() => { if (activeTab === "temoignages")  fetchTemPending();                                   }, [activeTab]);
  useEffect(() => { if (activeTab === "documents")    fetchDocsAdmin();                                     }, [activeTab]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setUsersPage(1); fetchUsers(1, searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const goPage = (p) => { setUsersPage(p); fetchUsers(p, search); };

  const deleteUser = async (uid) => {
    setDeletingId(uid);
    try {
      const r = await fetch(API(`/users/${uid}`), { method: "DELETE", headers: authH() });
      if (r.ok) { setUsers(us => us.filter(u => u.id !== uid)); setUsersTotal(t => t - 1); showToast("Utilisateur supprimé"); fetchStats(); }
      else { const d = await r.json(); showToast(d.error || "Erreur", "error"); }
    } catch { showToast("Erreur réseau", "error"); }
    finally { setDeletingId(null); setConfirmId(null); }
  };

  const switchTab = (id) => { setActiveTab(id); if (isMobile) setSidebarOpen(false); };

  // ── Sidebar content ──
  const SidebarInner = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" }}>
            <GraduationCap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Fraunces',serif", letterSpacing: "-0.3px" }}>Najahi</div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 10px", marginBottom: 6 }}>Navigation</div>
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => switchTab(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: active ? "rgba(124,58,237,0.28)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", position: "relative", outline: "none" }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}}
            >
              {active && <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: 99, background: "#a78bfa" }} />}
              <item.icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User + actions */}
      <div style={{ padding: "10px 10px 18px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.05)", marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {(user?.email?.[0] || "A").toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.prenom || user?.email?.split("@")[0] || "Admin"}
            </div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={() => navigate("/app/dashboard")}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, border: "none", background: "transparent", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: 3, outline: "none" }}
          onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
        >
          <ChevronLeft size={13} /> Retour au dashboard
        </button>
        <button onClick={async () => { await logout(); navigate("/login"); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, border: "none", background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
          <LogOut size={13} /> Se déconnecter
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes adm-spin    { to { transform: rotate(360deg); } }
        @keyframes adm-fadeUp  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes adm-pulse   { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes adm-slide   { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.2); border-radius: 99px; }
      `}</style>

      {/* Concours modal (create / edit) */}
      {concoursModal && (
        <ConcoursModal
          mode={concoursModal === "create" ? "create" : "edit"}
          initial={concoursModal === "create" ? undefined : concoursModal}
          onSave={saveConcours}
          onClose={() => setConcoursModal(null)}
          saving={concoursSaving}
        />
      )}

      {/* Concours delete confirm */}
      {confirmConcoursId && (
        <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#fff", borderRadius:20, padding:"30px 32px", maxWidth:360, width:"100%", textAlign:"center", boxShadow:"0 24px 60px rgba(0,0,0,0.18)", animation:"adm-fadeUp 0.22s ease" }}>
            <div style={{ width:54, height:54, borderRadius:"50%", background:"rgba(239,68,68,0.1)", display:"grid", placeItems:"center", margin:"0 auto 18px" }}>
              <AlertTriangle size={24} color="#ef4444"/>
            </div>
            <div style={{ fontSize:18, fontWeight:800, color:"#1a1a2e", marginBottom:8, fontFamily:"'Fraunces',serif" }}>Supprimer ce concours ?</div>
            <div style={{ fontSize:13, color:"#6b7280", marginBottom:26, lineHeight:1.6 }}>Les abonnements liés seront également supprimés. Cette action est irréversible.</div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setConfirmConcoursId(null)} style={{ padding:"10px 22px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Annuler
              </button>
              <button onClick={() => deleteConcours(confirmConcoursId)} style={{ padding:"10px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, fontFamily:"'DM Sans',sans-serif" }}>
                <Trash2 size={14}/> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "30px 32px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", animation: "adm-fadeUp 0.22s ease" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginBottom: 8, fontFamily: "'Fraunces',serif" }}>Supprimer cet utilisateur ?</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 26, lineHeight: 1.6 }}>Cette action est irréversible. Toutes les données liées à ce compte seront définitivement supprimées.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setConfirmId(null)} style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                Annuler
              </button>
              <button onClick={() => deleteUser(confirmId)} disabled={!!deletingId}
                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: !!deletingId ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans',sans-serif" }}>
                {deletingId ? <Spinner size={14} color="#fff" /> : <Trash2 size={14} />}
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.msg && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: toast.type === "error" ? "#ef4444" : "#10b981", color: "#fff", padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", animation: "adm-slide 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", minHeight: "100vh", background: "#f4f3ff", fontFamily: "'DM Sans',sans-serif" }}>

        {/* Sidebar — desktop */}
        {!isMobile && (
          <aside style={{ width: 240, flexShrink: 0, background: "#1e1b4b", height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}>
            <SidebarInner />
          </aside>
        )}

        {/* Sidebar — mobile overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)" }} onClick={() => setSidebarOpen(false)} />
            <aside style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 240, zIndex: 201, background: "#1e1b4b", animation: "adm-slide 0.22s ease" }}>
              <SidebarInner />
            </aside>
          </>
        )}

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

          {/* Mobile topbar */}
          {isMobile && (
            <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #f0eeff", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <button onClick={() => setSidebarOpen(true)} style={{ display: "flex", padding: 7, border: "1px solid #e5e7eb", borderRadius: 9, background: "transparent", cursor: "pointer" }}>
                <Menu size={17} color="#6b7280" />
              </button>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>Admin Panel</span>
              <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 99, background: "rgba(124,58,237,0.1)", color: "#7c3aed", fontSize: 11, fontWeight: 700 }}>ADMIN</span>
            </div>
          )}

          {/* Page content */}
          <div style={{ flex: 1, padding: isMobile ? "20px 14px 40px" : "32px 36px 48px", animation: "adm-fadeUp 0.28s ease" }} key={activeTab}>
            {activeTab === "overview" && (
              <OverviewSection
                stats={stats} statsLoading={statsLoading}
                activity={activity} actLoading={actLoading}
                onRefresh={() => { fetchStats(); fetchActivity(); }}
                isMobile={isMobile}
              />
            )}
            {activeTab === "users" && (
              <UsersSection
                users={users} usersTotal={usersTotal} usersPages={usersPages}
                usersPage={usersPage} usersLoading={usersLoading}
                searchInput={searchInput} setSearchInput={setSearchInput}
                goPage={goPage}
                deleteUser={deleteUser} deletingId={deletingId}
                confirmId={confirmId} setConfirmId={setConfirmId}
              />
            )}
            {activeTab === "orientations" && (
              <OrientationsSection orientations={orientations} orientLoading={orientLoading} />
            )}
            {activeTab === "concours" && (
              <ConcoursSection
                concours={concoursList} loading={concoursLoading}
                onAdd={() => setConcoursModal("create")}
                onEdit={c => setConcoursModal(c)}
                onDelete={id => setConfirmConcoursId(id)}
              />
            )}
            {activeTab === "temoignages" && (
              <TemoignagesSection
                pending={temPending} loading={temLoading}
                onApprove={approveTem} onDelete={deleteTem}
                onRefresh={fetchTemPending}
              />
            )}
            {activeTab === "forum"    && <ComingSoon title="Forum"      emoji="💬" />}
            {activeTab === "documents" && (
              <DocumentsSection
                docs={docsAdmin} loading={docsLoading}
                onApprove={approveDoc} onDelete={deleteDoc}
                onRefresh={fetchDocsAdmin}
              />
            )}
            {activeTab === "schools"  && <ComingSoon title="Écoles"     emoji="📚" />}
            {activeTab === "settings" && <ComingSoon title="Paramètres" emoji="⚙️" />}
          </div>
        </main>
      </div>
    </>
  );
}
