import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Send, ChevronDown, ChevronUp, CheckCircle, Trash2, Plus, X } from "lucide-react";

const TAPI = (p) => `${import.meta.env.VITE_API_URL}/api/temoignages${p}`;
const tok  = () => localStorage.getItem("najahi_token");
const user = () => { try { return JSON.parse(localStorage.getItem("najahi_user") || "{}"); } catch { return {}; } };

function useTheme() {
  const [dark] = useState(() => {
    const s = localStorage.getItem("najahi_theme");
    return s ? s === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  return dark;
}

const SCHOOL_COLORS = {
  "ENSA": "#3b82f6", "ENSIAS": "#6366f1", "EMI": "#8b5cf6", "INPT": "#06b6d4",
  "ENCG": "#10b981", "ISCAE": "#059669", "Médecine": "#ef4444", "CPGE": "#f59e0b",
  "UIR": "#f97316", "Al Akhawayn": "#ec4899", "UM6P": "#7c3aed", "EHTP": "#3b82f6",
  "BTS": "#6b7280", "OFPPT": "#6b7280",
};
const schoolColor = (s) => SCHOOL_COLORS[s] || "#7c3aed";

function initials(name) {
  if (!name || name === "Étudiant anonyme") return "👤";
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function fmtDate(iso) {
  if (!iso) return "";
  const str = iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z";
  return new Date(str).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });
}

// ── Stars display ──────────────────────────────────────────────────────────────
function Stars({ rating, size = 14, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || rating) : rating;
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= display ? "#f59e0b" : "none"}
          color={i <= display ? "#f59e0b" : "#d1d5db"}
          style={{ cursor: interactive ? "pointer" : "default", transition:"all 0.1s" }}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange && onChange(i)}
        />
      ))}
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ url, name, color, size = 42 }) {
  const [err, setErr] = useState(false);
  if (url && !err) {
    return <img src={url} onError={() => setErr(true)} alt={name} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />;
  }
  const ini = initials(name);
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: color + "22", border:`1.5px solid ${color}44`, fontSize: ini.length > 1 ? size * 0.32 : size * 0.42, fontWeight:800, color, fontFamily:"'DM Sans',sans-serif" }}>
      {ini}
    </div>
  );
}

// ── Testimonial card ───────────────────────────────────────────────────────────
function TestimonialCard({ t, dark, isAdmin, onApprove, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const card  = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.82)";
  const brd   = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.12)";
  const txt   = dark ? "#f3f4f6" : "#1e1b4b";
  const sub   = dark ? "rgba(255,255,255,0.45)" : "rgba(30,27,75,0.45)";
  const color = schoolColor(t.school);
  const long  = t.content.length > 200;

  return (
    <div style={{
      background: card, border: `1px solid ${brd}`, borderRadius: 16,
      padding: "18px 18px 14px",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      transition: "transform 0.2s, box-shadow 0.2s",
      borderTop: `3px solid ${color}`,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
    >
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:11, marginBottom:12 }}>
        <Avatar url={t.user_avatar} name={t.user_name} color={color} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, color:txt, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>
            {t.user_name}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99, background:color+"18", color }}>
              {t.school}
            </span>
            {t.filiere && (
              <span style={{ fontSize:11, color:sub, fontFamily:"'DM Sans',sans-serif" }}>{t.filiere}</span>
            )}
            {t.annee_entree && (
              <span style={{ fontSize:11, fontWeight:600, color:sub }}>· {t.annee_entree}</span>
            )}
          </div>
        </div>
        <Stars rating={t.rating} size={13} />
      </div>

      {/* Content */}
      <p style={{
        margin:"0 0 10px", fontSize:13.5, color:txt, lineHeight:1.65,
        fontFamily:"'DM Sans',sans-serif",
        display: "-webkit-box", WebkitBoxOrient:"vertical",
        WebkitLineClamp: expanded ? "unset" : 4,
        overflow: expanded ? "visible" : "hidden",
      }}>
        "{t.content}"
      </p>
      {long && (
        <button onClick={() => setExpanded(x => !x)} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", color: color, fontSize:12, fontWeight:700, cursor:"pointer", padding:"0 0 6px", fontFamily:"'DM Sans',sans-serif" }}>
          {expanded ? <><ChevronUp size={13}/> Voir moins</> : <><ChevronDown size={13}/> Lire la suite</>}
        </button>
      )}

      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8, paddingTop:8, borderTop:`1px solid ${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"}` }}>
        <span style={{ fontSize:11, color:sub }}>{fmtDate(t.created_at)}</span>
        {isAdmin && (
          <div style={{ display:"flex", gap:6 }}>
            {!t.is_approved && (
              <button onClick={() => onApprove(t.id)}
                style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:8, border:"none", background:"rgba(16,185,129,0.12)", color:"#10b981", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                <CheckCircle size={12}/> Approuver
              </button>
            )}
            <button onClick={() => onDelete(t.id)}
              style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 9px", borderRadius:8, border:"none", background:"rgba(239,68,68,0.1)", color:"#ef4444", fontSize:11, fontWeight:700, cursor:"pointer" }}>
              <Trash2 size={12}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Submit form ────────────────────────────────────────────────────────────────
const SCHOOL_OPTIONS = [
  "ENSA","ENSIAS","EMI","INPT","EHTP","ENCG","ISCAE","Médecine","CPGE",
  "UIR","Al Akhawayn","UM6P","BTS","OFPPT","Autre",
];

function SubmitForm({ dark, onSuccess }) {
  const card = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)";
  const brd  = dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.2)";
  const txt  = dark ? "#f3f4f6" : "#1e1b4b";
  const sub  = dark ? "rgba(255,255,255,0.45)" : "rgba(30,27,75,0.45)";
  const inp  = { background: dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.9)", border:`1px solid ${brd}`, borderRadius:10, padding:"10px 13px", color:txt, fontSize:13, fontFamily:"'DM Sans',sans-serif", width:"100%", outline:"none", boxSizing:"border-box" };

  const [form, setForm]   = useState({ school:"", filiere:"", annee_entree:"", content:"", rating:5 });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [ok,     setOk]     = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError(""); setOk("");
    if (!form.school || !form.content) { setError("École et témoignage requis."); return; }
    if (form.content.length < 20) { setError("Le témoignage doit faire au moins 20 caractères."); return; }
    setSaving(true);
    try {
      const r = await fetch(TAPI(""), {
        method:"POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${tok()}` },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Erreur"); return; }
      setOk(d.message || "Témoignage soumis !");
      setForm({ school:"", filiere:"", annee_entree:"", content:"", rating:5 });
      onSuccess && onSuccess();
    } catch { setError("Erreur réseau"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ background:card, border:`1px solid ${brd}`, borderRadius:18, padding:"22px 20px", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", marginBottom:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(124,58,237,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Plus size={18} color="#7c3aed"/>
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:txt, fontFamily:"'DM Sans',sans-serif" }}>Partager ton expérience</div>
          <div style={{ fontSize:12, color:sub }}>Aide les futurs étudiants à choisir leur école</div>
        </div>
      </div>

      {ok && (
        <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.25)", color:"#10b981", fontSize:13, fontWeight:600, marginBottom:14 }}>
          ✅ {ok}
        </div>
      )}
      {error && (
        <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#ef4444", fontSize:13, fontWeight:600, marginBottom:14 }}>
          {error}
        </div>
      )}

      <form onSubmit={submit}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10, marginBottom:12 }}>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:sub, marginBottom:5 }}>École *</label>
            <select value={form.school} onChange={e => set("school", e.target.value)} style={{ ...inp, cursor:"pointer" }} required>
              <option value="">Choisir une école…</option>
              {SCHOOL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:sub, marginBottom:5 }}>Filière</label>
            <input value={form.filiere} onChange={e => set("filiere", e.target.value)} placeholder="Ex: Génie Informatique" style={inp} />
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:sub, marginBottom:5 }}>Année d'entrée</label>
            <input value={form.annee_entree} onChange={e => set("annee_entree", e.target.value)} placeholder="Ex: 2023" maxLength={4} style={inp} />
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:700, color:sub, marginBottom:5 }}>Ton témoignage * <span style={{ fontWeight:400 }}>({form.content.length}/1000)</span></label>
          <textarea
            value={form.content}
            onChange={e => set("content", e.target.value)}
            placeholder="Parle de ton expérience : ambiance, qualité des cours, vie étudiante, conseils aux futurs admis…"
            maxLength={1000} required
            style={{ ...inp, minHeight:100, resize:"vertical", lineHeight:1.6 }}
          />
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:12, fontWeight:700, color:sub }}>Note globale</span>
            <Stars rating={form.rating} size={20} interactive onChange={v => set("rating", v)} />
          </div>
          <button type="submit" disabled={saving}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 22px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", color:"#fff", fontSize:13, fontWeight:700, cursor: saving?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", opacity:saving?0.7:1, boxShadow:"0 4px 16px rgba(124,58,237,0.3)" }}>
            <Send size={14}/> {saving ? "Envoi…" : "Envoyer"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Temoignages() {
  const navigate     = useNavigate();
  const dark         = useTheme();
  const currentUser  = user();
  const isAdmin      = currentUser?.role === "admin";
  const isLoggedIn   = !!tok();

  const [items,    setItems]    = useState([]);
  const [schools,  setSchools]  = useState([]);
  const [filter,   setFilter]   = useState("");
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);

  const bg   = dark ? "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" : "linear-gradient(135deg,#e9e4ff,#f0f4ff,#fdf6ff)";
  const txt  = dark ? "#f3f4f6" : "#1e1b4b";
  const sub  = dark ? "rgba(255,255,255,0.45)" : "rgba(30,27,75,0.45)";
  const brd  = dark ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.13)";

  const fetchItems = useCallback(async (school = filter, p = page) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page:p, limit:12, ...(school ? { school } : {}) });
      const r = await fetch(TAPI(`?${q}`));
      if (!r.ok) return;
      const d = await r.json();
      setItems(d.temoignages || []);
      setSchools(d.schools || []);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
    } catch (_) {}
    finally { setLoading(false); }
  }, [filter, page]);

  useEffect(() => { fetchItems(filter, page); }, [filter, page]);

  function handleFilter(s) {
    setFilter(s);
    setPage(1);
  }

  async function approveItem(id) {
    const t = tok(); if (!t) return;
    await fetch(TAPI(`/${id}/approve`), { method:"PUT", headers:{ Authorization:`Bearer ${t}` } });
    fetchItems(filter, page);
  }

  async function deleteItem(id) {
    const t = tok(); if (!t) return;
    if (!confirm("Supprimer ce témoignage ?")) return;
    await fetch(TAPI(`/${id}`), { method:"DELETE", headers:{ Authorization:`Bearer ${t}` } });
    setItems(prev => prev.filter(i => i.id !== id));
    setTotal(n => Math.max(0, n-1));
  }

  const pillStyle = (active) => ({
    padding:"6px 14px", borderRadius:99, fontSize:12, fontWeight:700, cursor:"pointer",
    border: active ? "2px solid #7c3aed" : `1.5px solid ${brd}`,
    background: active ? (dark?"rgba(124,58,237,0.2)":"rgba(124,58,237,0.08)") : "transparent",
    color: active ? "#7c3aed" : sub,
    fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s", flexShrink:0,
  });

  return (
    <div style={{ minHeight:"100vh", background:bg, padding:"0 16px 60px", fontFamily:"'DM Sans',sans-serif" }}>
      {/* Blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%)", top:"-8%", right:"-4%" }} />
        <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,0.07),transparent 70%)", bottom:"5%", left:"-5%" }} />
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:900, margin:"0 auto" }}>
        {/* Top nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"24px 0 20px" }}>
          <button onClick={() => navigate("/app/dashboard")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:`1px solid ${brd}`, background:"transparent", color:txt, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ArrowLeft size={14}/> Tableau de bord
          </button>
          {isLoggedIn && (
            <button onClick={() => setShowForm(x => !x)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, border:"none", background: showForm ? "rgba(124,58,237,0.15)" : "linear-gradient(135deg,#7c3aed,#5b21b6)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 14px rgba(124,58,237,0.25)" }}>
              {showForm ? <><X size={13}/> Fermer</> : <><Plus size={13}/> Partager</>}
            </button>
          )}
        </div>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
              ⭐
            </div>
            <div>
              <h1 style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"clamp(20px,5vw,30px)", color:txt, lineHeight:1.1 }}>
                Témoignages d'étudiants
              </h1>
              <p style={{ margin:"4px 0 0", fontSize:13, color:sub }}>
                {total > 0 ? `${total} témoignage${total > 1?"s":""} · ` : ""}Retours d'expérience d'étudiants marocains
              </p>
            </div>
          </div>
        </div>

        {/* Submit form (toggleable) */}
        {showForm && isLoggedIn && (
          <SubmitForm dark={dark} onSuccess={() => { setShowForm(false); fetchItems(filter, 1); setPage(1); }} />
        )}
        {!isLoggedIn && !showForm && (
          <div style={{ padding:"14px 18px", borderRadius:12, background: dark?"rgba(124,58,237,0.08)":"rgba(124,58,237,0.05)", border:`1px solid rgba(124,58,237,0.18)`, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <span style={{ fontSize:13, color:txt }}>Connecte-toi pour partager ton expérience.</span>
            <button onClick={() => navigate("/login")} style={{ padding:"7px 16px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              Se connecter
            </button>
          </div>
        )}

        {/* Filter pills */}
        {schools.length > 0 && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
            <button onClick={() => handleFilter("")} style={pillStyle(filter === "")}>Toutes</button>
            {schools.map(s => (
              <button key={s} onClick={() => handleFilter(s)} style={pillStyle(filter === s)}>{s}</button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"60px 0", color:sub }}>
            <div style={{ fontSize:32, marginBottom:8 }}>⭐</div>
            <p style={{ margin:0, fontSize:13 }}>Chargement des témoignages…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div style={{ textAlign:"center", padding:"70px 30px", background: dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.7)", border:`1px solid ${brd}`, borderRadius:18 }}>
            <div style={{ fontSize:52, marginBottom:14 }}>💬</div>
            <h3 style={{ margin:"0 0 8px", fontFamily:"'Fraunces',serif", fontSize:20, color:txt }}>
              {filter ? `Aucun témoignage pour ${filter}` : "Aucun témoignage pour l'instant"}
            </h3>
            <p style={{ margin:0, color:sub, fontSize:14, lineHeight:1.6 }}>
              {filter ? "Essaie un autre filtre ou sois le premier à partager !" : "Sois le premier à partager ton expérience !"}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && items.length > 0 && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
              {items.map(t => (
                <TestimonialCard
                  key={t.id} t={t} dark={dark}
                  isAdmin={isAdmin}
                  onApprove={approveItem}
                  onDelete={deleteItem}
                />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:10, marginTop:28 }}>
                <button disabled={page <= 1} onClick={() => setPage(p => p-1)}
                  style={{ padding:"7px 16px", borderRadius:9, border:`1px solid ${brd}`, background:"transparent", color:txt, cursor:page<=1?"not-allowed":"pointer", opacity:page<=1?0.4:1, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
                  ← Précédent
                </button>
                <span style={{ fontSize:13, color:sub, fontFamily:"'DM Sans',sans-serif" }}>
                  Page {page} / {pages}
                </span>
                <button disabled={page >= pages} onClick={() => setPage(p => p+1)}
                  style={{ padding:"7px 16px", borderRadius:9, border:`1px solid ${brd}`, background:"transparent", color:txt, cursor:page>=pages?"not-allowed":"pointer", opacity:page>=pages?0.4:1, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
