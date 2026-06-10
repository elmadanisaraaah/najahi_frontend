import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import {
  Users, Activity, Compass, MessageSquare, BookOpen, TrendingUp,
  Search, ChevronLeft, ChevronRight, Trash2, Shield, User,
  ArrowLeft, CheckCircle, XCircle, LogOut, RefreshCw,
} from "lucide-react";

const API = (path) => `${import.meta.env.VITE_API_URL || ""}/api/admin${path}`;
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("najahi_token") || ""}` });

const fmtDate = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
};
const fmtRelative = (iso) => {
  if (!iso) return "—";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "À l'instant";
    if (m < 60) return `Il y a ${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Il y a ${h}h`;
    return fmtDate(iso);
  } catch { return "—"; }
};

const TYPE_COLOR  = { login: "#10b981", register: "#7c3aed", orientation: "#f59e0b" };
const TYPE_LABEL  = { login: "Connexion", register: "Inscription", orientation: "Orientation" };
const TYPE_ICON   = { login: "🔑", register: "✨", orientation: "🧭" };

function Spinner({ size = 20, color = "#7c3aed" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}33`, borderTop: `2px solid ${color}`,
      animation: "adm-spin 0.8s linear infinite", flexShrink: 0,
    }} />
  );
}

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div style={{
      padding: "20px 22px", borderRadius: 18, flex: "1 1 150px",
      background: `linear-gradient(135deg, ${color}18, ${color}08)`,
      border: `1px solid ${color}30`,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div>
        {loading
          ? <Spinner size={22} color={color} />
          : <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Fraunces', serif", color }}>{value ?? "—"}</div>
        }
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      background: isAdmin ? "rgba(124,58,237,0.15)" : "rgba(16,185,129,0.12)",
      color: isAdmin ? "#a78bfa" : "#10b981",
      border: `1px solid ${isAdmin ? "rgba(124,58,237,0.3)" : "rgba(16,185,129,0.25)"}`,
    }}>
      {isAdmin ? <Shield size={10} /> : <User size={10} />}
      {isAdmin ? "Admin" : "Étudiant"}
    </span>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dark = theme === "dark";

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "admin") navigate("/app/dashboard", { replace: true });
  }, [user]);

  const isDark = dark;
  const pageBg   = isDark ? "linear-gradient(160deg,#07071a 0%,#0e0826 55%,#071220 100%)" : "linear-gradient(160deg,#f5f3ff 0%,#faf7ff 55%,#eef2ff 100%)";
  const cardBg   = isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.92)";
  const cardBdr  = isDark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.07)";
  const cardShadow = isDark ? "0 4px 28px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.07)";
  const textMain = isDark ? "#f1f5f9" : "#1a1a2e";
  const textMuted= isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.42)";
  const navBg    = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const inputBg  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)";

  // ── State ──
  const [stats,       setStats]       = useState(null);
  const [statsLoading,setStatsLoading]= useState(true);
  const [users,       setUsers]       = useState([]);
  const [usersTotal,  setUsersTotal]  = useState(0);
  const [usersPages,  setUsersPages]  = useState(1);
  const [usersPage,   setUsersPage]   = useState(1);
  const [usersLoading,setUsersLoading]= useState(true);
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activity,    setActivity]    = useState([]);
  const [actLoading,  setActLoading]  = useState(true);
  const [deletingId,  setDeletingId]  = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);
  const [toast,       setToast]       = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  // ── Fetch stats ──
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(API("/stats"), { headers: authH() });
      if (res.ok) setStats(await res.json());
    } catch {}
    finally { setStatsLoading(false); }
  };

  // ── Fetch users ──
  const fetchUsers = useCallback(async (page = 1, q = "") => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, ...(q ? { search: q } : {}) });
      const res = await fetch(API(`/users?${params}`), { headers: authH() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setUsersTotal(data.total || 0);
        setUsersPages(data.pages || 1);
      }
    } catch {}
    finally { setUsersLoading(false); }
  }, []);

  // ── Fetch activity ──
  const fetchActivity = async () => {
    setActLoading(true);
    try {
      const res = await fetch(API("/activity"), { headers: authH() });
      if (res.ok) {
        const data = await res.json();
        setActivity(data.activity || []);
      }
    } catch {}
    finally { setActLoading(false); }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers(1, "");
    fetchActivity();
  }, []);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setUsersPage(1);
      fetchUsers(1, searchInput);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Page change
  const goPage = (p) => {
    setUsersPage(p);
    fetchUsers(p, search);
  };

  // ── Change role ──
  const changeRole = async (userId, newRole) => {
    try {
      const res = await fetch(API(`/users/${userId}/role`), {
        method: "PUT",
        headers: { ...authH(), "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
        showToast(`Rôle mis à jour : ${newRole}`);
      } else {
        const d = await res.json();
        showToast(d.error || "Erreur", "error");
      }
    } catch { showToast("Erreur réseau", "error"); }
  };

  // ── Delete user ──
  const deleteUser = async (userId) => {
    setDeletingId(userId);
    try {
      const res = await fetch(API(`/users/${userId}`), { method: "DELETE", headers: authH() });
      if (res.ok) {
        setUsers(us => us.filter(u => u.id !== userId));
        setUsersTotal(t => t - 1);
        showToast("Utilisateur supprimé");
        fetchStats();
      } else {
        const d = await res.json();
        showToast(d.error || "Erreur", "error");
      }
    } catch { showToast("Erreur réseau", "error"); }
    finally { setDeletingId(null); setConfirmId(null); }
  };

  const STATS_CARDS = [
    { icon: Users,        label: "Total utilisateurs",  value: stats?.total_users,       color: "#7c3aed" },
    { icon: Activity,     label: "Actifs aujourd'hui",  value: stats?.active_today,      color: "#10b981" },
    { icon: Compass,      label: "Orientations faites", value: stats?.total_orientations,color: "#f59e0b" },
    { icon: MessageSquare,label: "Chats écoles",        value: stats?.total_chats,       color: "#3b82f6" },
    { icon: BookOpen,     label: "Sessions solo",       value: stats?.total_sessions,    color: "#ec4899" },
    { icon: TrendingUp,   label: "Nouveaux cette semaine", value: stats?.new_this_week,  color: "#06b6d4" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes adm-spin { to { transform: rotate(360deg); } }
        @keyframes adm-fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes adm-slide { from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:translateX(0) } }
        .adm-row:hover { background: rgba(124,58,237,0.05) !important; }
        .adm-btn:hover { opacity:0.8; transform:translateY(-1px); }
        .adm-page-btn:hover { background: rgba(124,58,237,0.15) !important; }
        input:focus { outline:none; border-color:#7c3aed !important; box-shadow:0 0 0 3px rgba(124,58,237,0.15) !important; }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:9999,
          background: toast.type === "error" ? "#ef4444" : "#10b981",
          color:"#fff", padding:"11px 20px", borderRadius:12,
          fontSize:13, fontWeight:600, boxShadow:"0 8px 28px rgba(0,0,0,0.25)",
          animation:"adm-slide 0.3s ease",
        }}>{toast.msg}</div>
      )}

      {/* Confirm delete modal */}
      {confirmId && (
        <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background: isDark ? "#1a1030" : "#fff", borderRadius:20, padding:"28px 32px", maxWidth:360, width:"90%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.4)", animation:"adm-fadeUp 0.25s ease" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:8, color:textMain }}>Supprimer cet utilisateur ?</div>
            <div style={{ fontSize:13, color:textMuted, marginBottom:24 }}>Cette action est irréversible. Toutes les données liées seront supprimées.</div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setConfirmId(null)} style={{ padding:"9px 20px", borderRadius:10, border:`1px solid ${cardBdr}`, background:"transparent", color:textMuted, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Annuler
              </button>
              <button onClick={() => deleteUser(confirmId)} disabled={deletingId === confirmId} style={{ padding:"9px 20px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                {deletingId === confirmId ? <Spinner size={14} color="#fff" /> : <Trash2 size={14} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ minHeight:"100vh", background:pageBg, fontFamily:"'DM Sans',sans-serif", color:textMain }}>

        {/* Navbar */}
        <nav style={{ position:"sticky", top:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", height:58, background:navBg, backdropFilter:"blur(18px)", borderBottom:`1px solid ${cardBdr}`, boxShadow: isDark?"none":"0 1px 0 rgba(124,58,237,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => navigate("/app/dashboard")} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:"transparent", border:`1px solid ${cardBdr}`, borderRadius:9, color:textMuted, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              <ArrowLeft size={13} /> Dashboard
            </button>
            <span style={{ fontFamily:"'Fraunces',serif", fontSize:17, fontWeight:700, color:textMain }}>Admin Panel</span>
            <span style={{ padding:"3px 10px", borderRadius:99, background:"rgba(124,58,237,0.15)", color:"#a78bfa", fontSize:11, fontWeight:700, border:"1px solid rgba(124,58,237,0.3)" }}>ADMIN</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => { fetchStats(); fetchUsers(usersPage, search); fetchActivity(); }} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"transparent", border:`1px solid ${cardBdr}`, borderRadius:9, color:textMuted, fontSize:12, cursor:"pointer" }}>
              <RefreshCw size={13} /> Actualiser
            </button>
            <ThemeToggle />
            <button onClick={async () => { await logout(); navigate("/login"); }} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:9, color:"#ef4444", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              <LogOut size={13} /> Déco
            </button>
          </div>
        </nav>

        <div style={{ maxWidth:1400, margin:"0 auto", padding:"24px 20px" }}>

          {/* Stats grid */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:24, animation:"adm-fadeUp 0.4s ease" }}>
            {STATS_CARDS.map(s => (
              <StatCard key={s.label} {...s} loading={statsLoading} />
            ))}
          </div>

          {/* Main area: table + activity */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" }}>

            {/* Users table */}
            <div style={{ background:cardBg, border:`1px solid ${cardBdr}`, borderRadius:20, boxShadow:cardShadow, overflow:"hidden", animation:"adm-fadeUp 0.5s 0.05s ease both" }}>

              {/* Table header */}
              <div style={{ padding:"18px 20px", borderBottom:`1px solid ${cardBdr}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:800 }}>Utilisateurs</div>
                  <div style={{ fontSize:11, color:textMuted, marginTop:2 }}>{usersTotal} comptes au total</div>
                </div>
                <div style={{ position:"relative", flex:"1 1 200px", maxWidth:320 }}>
                  <Search size={14} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:textMuted, pointerEvents:"none" }} />
                  <input
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Chercher par email, prénom, nom..."
                    style={{ width:"100%", paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8, borderRadius:10, border:`1px solid ${cardBdr}`, background:inputBg, color:textMain, fontSize:13, fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }}
                  />
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${cardBdr}` }}>
                      {["Utilisateur","Email","Rôle","Inscrit","Dernière connexion","Vérifié","Actions"].map(h => (
                        <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:textMuted, whiteSpace:"nowrap", letterSpacing:"0.3px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr><td colSpan={7} style={{ padding:40, textAlign:"center" }}><Spinner size={28} /></td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:textMuted }}>Aucun utilisateur trouvé</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} className="adm-row" style={{ borderBottom:`1px solid ${cardBdr}`, transition:"background 0.15s" }}>
                        {/* Avatar + name */}
                        <td style={{ padding:"10px 14px", whiteSpace:"nowrap" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                            {u.avatar_url
                              ? <img src={u.avatar_url} alt="" style={{ width:30, height:30, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                              : <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"grid", placeItems:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>
                                  {(u.prenom?.[0] || u.email?.[0] || "?").toUpperCase()}
                                </div>
                            }
                            <span style={{ fontWeight:600, maxWidth:110, overflow:"hidden", textOverflow:"ellipsis" }}>
                              {u.prenom || u.nom ? `${u.prenom} ${u.nom}`.trim() : "—"}
                            </span>
                          </div>
                        </td>
                        {/* Email */}
                        <td style={{ padding:"10px 14px", color:textMuted, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</td>
                        {/* Role */}
                        <td style={{ padding:"10px 14px" }}><RoleBadge role={u.role} /></td>
                        {/* Joined */}
                        <td style={{ padding:"10px 14px", color:textMuted, whiteSpace:"nowrap" }}>{fmtDate(u.created_at)}</td>
                        {/* Last login */}
                        <td style={{ padding:"10px 14px", color:textMuted, whiteSpace:"nowrap" }}>{fmtRelative(u.last_login_at)}</td>
                        {/* Verified */}
                        <td style={{ padding:"10px 14px" }}>
                          {u.is_email_verified
                            ? <CheckCircle size={16} color="#10b981" />
                            : <XCircle size={16} color="#ef4444" />
                          }
                        </td>
                        {/* Actions */}
                        <td style={{ padding:"10px 14px", whiteSpace:"nowrap" }}>
                          <div style={{ display:"flex", gap:6 }}>
                            <button
                              className="adm-btn"
                              onClick={() => changeRole(u.id, u.role === "admin" ? "student" : "admin")}
                              title={u.role === "admin" ? "Rétrograder en étudiant" : "Promouvoir en admin"}
                              style={{ padding:"5px 10px", borderRadius:8, border:`1px solid rgba(124,58,237,0.3)`, background:"rgba(124,58,237,0.1)", color:"#a78bfa", fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:4 }}
                            >
                              <Shield size={11} />
                              {u.role === "admin" ? "→ Étudiant" : "→ Admin"}
                            </button>
                            <button
                              className="adm-btn"
                              onClick={() => setConfirmId(u.id)}
                              disabled={deletingId === u.id}
                              style={{ padding:"5px 8px", borderRadius:8, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.1)", color:"#ef4444", fontSize:11, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center" }}
                            >
                              {deletingId === u.id ? <Spinner size={11} color="#ef4444" /> : <Trash2 size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersPages > 1 && (
                <div style={{ padding:"14px 20px", borderTop:`1px solid ${cardBdr}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, color:textMuted }}>Page {usersPage} / {usersPages} · {usersTotal} utilisateurs</span>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="adm-page-btn" onClick={() => goPage(usersPage - 1)} disabled={usersPage <= 1}
                      style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${cardBdr}`, background:"transparent", color:textMuted, cursor:usersPage<=1?"not-allowed":"pointer", opacity:usersPage<=1?0.4:1, transition:"all 0.2s" }}>
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(5, usersPages) }).map((_, i) => {
                      const p = Math.max(1, Math.min(usersPages - 4, usersPage - 2)) + i;
                      return (
                        <button key={p} className="adm-page-btn" onClick={() => goPage(p)}
                          style={{ padding:"6px 11px", borderRadius:8, fontSize:12, fontWeight:700, border:`1px solid ${p===usersPage?"#7c3aed":cardBdr}`, background:p===usersPage?"#7c3aed":"transparent", color:p===usersPage?"#fff":textMuted, cursor:"pointer", transition:"all 0.2s" }}>
                          {p}
                        </button>
                      );
                    })}
                    <button className="adm-page-btn" onClick={() => goPage(usersPage + 1)} disabled={usersPage >= usersPages}
                      style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${cardBdr}`, background:"transparent", color:textMuted, cursor:usersPage>=usersPages?"not-allowed":"pointer", opacity:usersPage>=usersPages?0.4:1, transition:"all 0.2s" }}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Activity feed */}
            <div style={{ background:cardBg, border:`1px solid ${cardBdr}`, borderRadius:20, boxShadow:cardShadow, overflow:"hidden", animation:"adm-fadeUp 0.5s 0.1s ease both" }}>
              <div style={{ padding:"18px 20px", borderBottom:`1px solid ${cardBdr}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:15, fontWeight:800 }}>Activité récente</div>
                <Activity size={16} color="#7c3aed" />
              </div>
              <div style={{ maxHeight:600, overflowY:"auto", padding:"8px 0" }}>
                {actLoading ? (
                  <div style={{ padding:40, display:"flex", justifyContent:"center" }}><Spinner /></div>
                ) : activity.length === 0 ? (
                  <div style={{ padding:32, textAlign:"center", color:textMuted, fontSize:13 }}>Aucune activité</div>
                ) : activity.map((ev, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:11, padding:"10px 18px", borderBottom:`1px solid ${cardBdr}` }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:`${TYPE_COLOR[ev.type]}20`, display:"grid", placeItems:"center", fontSize:15, flexShrink:0, marginTop:1 }}>
                      {TYPE_ICON[ev.type]}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:TYPE_COLOR[ev.type] }}>{TYPE_LABEL[ev.type]}</div>
                      <div style={{ fontSize:12, color:textMain, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {ev.prenom ? `${ev.prenom} · ` : ""}{ev.email}
                      </div>
                      <div style={{ fontSize:11, color:textMuted, marginTop:2 }}>{fmtRelative(ev.ts)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
