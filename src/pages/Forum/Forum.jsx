import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Heart, Eye, Plus, Search, X, ChevronRight, BookOpen, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../../components/Avatar";

const API = import.meta.env.VITE_API_URL || "";

const ALL_SUGGESTIONS = [
  "ENSA", "ENSIAS", "EMI", "INPT", "EHTP", "ENCG", "ISCAE",
  "Médecine", "Pharmacie", "CPGE", "Al Akhawayn", "UIR", "UM6P",
  "Orientation", "Vie étudiante", "Bourses & Aides", "Témoignages",
  "Stage", "Emploi", "Logement",
];

const CATEGORY_COLORS = {
  ensa: "#7c3aed", ensias: "#7c3aed", emi: "#7c3aed", inpt: "#7c3aed", ehtp: "#7c3aed",
  medecine: "#ef4444", pharmacie: "#ef4444",
  encg: "#f59e0b", iscae: "#f59e0b",
  cpge: "#3b82f6",
  orientation: "#10b981", vie_etudiante: "#10b981",
  bourses: "#06b6d4", temoignages: "#a78bfa",
};

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`;
  return d.toLocaleDateString("fr-MA", { day: "numeric", month: "short" });
}


function PostCard({ post, onClick, dark }) {
  const color = CATEGORY_COLORS[post.category] || "#7c3aed";
  const tc = dark ? "#fff" : "#1a1625";
  const sc = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";

  return (
    <div onClick={onClick} style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.95)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(124,58,237,0.1)", borderRadius: 16, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s", marginBottom: 10 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + "60"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = dark ? `0 8px 24px rgba(0,0,0,0.3)` : `0 8px 24px ${color}15`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Avatar src={post.author?.avatar_url} name={[post.author?.prenom, post.author?.nom].filter(Boolean).join(" ")} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "18", padding: "2px 9px", borderRadius: 99, letterSpacing: "0.3px" }}>
              {post.category?.toUpperCase()}
            </span>
            {post.school && (
              <span style={{ fontSize: 11, fontWeight: 600, color: dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.4)", background: dark ? "rgba(255,255,255,0.07)" : "rgba(26,22,37,0.06)", padding: "2px 8px", borderRadius: 99 }}>
                {post.school}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: tc, fontFamily: "'Fraunces',serif", marginBottom: 8, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {post.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: sc }}>
              {post.author?.prenom} {post.author?.nom}
            </span>
            <span style={{ fontSize: 11, color: sc }}>·</span>
            <span style={{ fontSize: 12, color: sc }}>{fmtDate(post.created_at)}</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: sc }}>
                <Heart size={12} /> {post.likes}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: sc }}>
                <MessageSquare size={12} /> {post.reply_count}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: sc }}>
                <Eye size={12} /> {post.views}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewPostModal({ onClose, onCreated, dark }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", content: "", category: "", school: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sugg, setSugg] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const catRef = useRef(null);

  const tc = dark ? "#fff" : "#1a1625";
  const sc = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";
  const inputBg = dark ? "rgba(255,255,255,0.06)" : "#fafaf9";
  const inputBdr = dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid #e8e4de";

  const inputStyle = { width: "100%", padding: "10px 12px", background: inputBg, border: inputBdr, borderRadius: 10, fontSize: 13, color: tc, fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.2s", boxSizing: "border-box" };
  const focus = e => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; };
  const blur  = e => { e.target.style.borderColor = dark ? "rgba(255,255,255,0.1)" : "#e8e4de"; e.target.style.boxShadow = "none"; };

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.category) {
      setError("Titre, contenu et catégorie sont requis"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/forum/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("najahi_token")}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      onCreated(data.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 520, background: dark ? "#160d2e" : "#fff", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(124,58,237,0.15)", borderRadius: 22, padding: "32px 28px", boxShadow: "0 24px 80px rgba(0,0,0,0.4)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, color: tc, margin: 0 }}>Nouvelle discussion</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: sc, display: "flex", padding: 4 }}><X size={18} /></button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: sc, display: "block", marginBottom: 6 }}>Titre *</label>
            <input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="De quoi veux-tu parler ?" onFocus={focus} onBlur={blur} maxLength={300} />
          </div>

          <div style={{ position: "relative" }} ref={catRef}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: sc, display: "block", marginBottom: 6 }}>Catégorie *</label>
            <input
              style={inputStyle}
              value={form.category}
              onChange={e => {
                const v = e.target.value;
                setForm(p => ({ ...p, category: v }));
                const q = v.trim().toLowerCase();
                setSugg(q ? ALL_SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 5) : ALL_SUGGESTIONS.slice(0, 5));
                setShowSugg(true);
              }}
              onFocus={e => {
                focus(e);
                const q = form.category.trim().toLowerCase();
                setSugg(q ? ALL_SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 5) : ALL_SUGGESTIONS.slice(0, 5));
                setShowSugg(true);
              }}
              onBlur={e => {
                blur(e);
                setTimeout(() => setShowSugg(false), 150);
              }}
              placeholder="ex: ENSA, Orientation, Médecine…"
              autoComplete="off"
              maxLength={100}
            />
            {showSugg && sugg.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 300, background: dark ? "#1a0f3a" : "#fff", border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(124,58,237,0.2)", borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 28px rgba(0,0,0,0.22)" }}>
                {sugg.map(s => (
                  <div key={s} onMouseDown={() => { setForm(p => ({ ...p, category: s })); setSugg([]); setShowSugg(false); }}
                    style={{ padding: "9px 14px", fontSize: 13, color: dark ? "#fff" : "#1a1625", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.12)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: sc, display: "block", marginBottom: 6 }}>École / Établissement <span style={{ fontWeight: 400, opacity: 0.6 }}>(optionnel)</span></label>
            <input style={inputStyle} value={form.school} onChange={e => setForm(p => ({ ...p, school: e.target.value }))} placeholder="ex: ENSA Rabat, FST Fès…" onFocus={focus} onBlur={blur} maxLength={150} />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: sc, display: "block", marginBottom: 6 }}>Contenu *</label>
            <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical", lineHeight: 1.6 }} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Décris ta situation, pose ta question…" onFocus={focus} onBlur={blur} />
          </div>

          <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "13px 20px", background: loading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}>
            {loading ? "Publication…" : "Publier la discussion"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/forum/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const loadPosts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page });
    if (activeCategory) params.set("category", activeCategory);
    if (search) params.set("search", search);
    fetch(`${API}/api/forum/posts?${params}`)
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setTotal(d.total || 0); })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [page, activeCategory, search]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleSearch = e => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const pickCategory = cat => { setActiveCategory(cat === activeCategory ? "" : cat); setPage(1); };

  // ── Theme tokens ──
  const bg      = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 50%,#0d1a2e 100%)" : "linear-gradient(135deg,#f8f7ff 0%,#f0eeff 50%,#f5f3ff 100%)";
  const navBg   = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const navBdr  = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.15)";
  const tc      = dark ? "#fff" : "#1a1625";
  const sc      = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";
  const sideBg  = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const sideBdr = dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(124,58,237,0.1)";


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.3);border-radius:99px}
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans',sans-serif", transition: "background 0.5s" }}>

        {/* Navbar */}
        <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 16px" : "14px 28px", height: isMobile ? 56 : "auto", background: navBg, backdropFilter: "blur(18px)", borderBottom: `1px solid ${navBdr}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/app/dashboard")}>
            <BookOpen size={20} color="#7c3aed" />
            <span style={{ fontSize: 17, fontWeight: 700, color: tc, fontFamily: "'Fraunces',serif" }}>Najahi</span>
          </div>
          <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 6px 22px rgba(124,58,237,0.55)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(124,58,237,0.4)"}
          >
            <Plus size={14} /> {isMobile ? "" : "Nouvelle discussion"}
          </button>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: isMobile ? "32px 16px 20px" : "48px 24px 28px", animation: "fadeUp 0.5s ease both" }}>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 26 : 34, fontWeight: 700, color: tc, marginBottom: 10, letterSpacing: "-0.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <GraduationCap size={isMobile ? 24 : 30} color="#7c3aed" style={{ flexShrink: 0 }} /> Communauté Najahi
          </h1>
          <p style={{ fontSize: 15, color: sc, maxWidth: 480, margin: "0 auto 24px" }}>
            Pose tes questions, partage ton expérience et aide les autres étudiants marocains.
          </p>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, maxWidth: 460, margin: "0 auto" }}>
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} style={{ position: "absolute", left: 12, color: sc, pointerEvents: "none" }} />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Rechercher une discussion…"
                style={{ width: "100%", padding: "11px 12px 11px 36px", background: dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)", border: dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(124,58,237,0.15)", borderRadius: 12, fontSize: 13, color: tc, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" }}
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} style={{ position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", color: sc, display: "flex" }}>
                  <X size={13} />
                </button>
              )}
            </div>
            <button type="submit" style={{ padding: "11px 18px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Chercher
            </button>
          </form>
        </div>

        {/* Layout */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0 12px 48px" : "0 24px 48px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 24, alignItems: "start" }}>

          {/* Sidebar / Category tabs */}
          <div style={{ background: sideBg, border: sideBdr, borderRadius: 18, padding: "16px 12px", position: isMobile ? "static" : "sticky", top: 80 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: sc, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 10, paddingLeft: 8 }}>Catégories</p>
            <button onClick={() => pickCategory("")} style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 10, border: "none", background: !activeCategory ? "rgba(124,58,237,0.15)" : "transparent", color: !activeCategory ? "#7c3aed" : tc, fontSize: 13, fontWeight: !activeCategory ? 700 : 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: 4, transition: "all 0.15s" }}>
              Toutes les discussions
            </button>
            {categories.length === 0 && (
              <p style={{ fontSize: 12, color: sc, paddingLeft: 8, fontStyle: "italic" }}>Aucune catégorie active</p>
            )}
            {categories.map(c => {
              const color = CATEGORY_COLORS[c.id?.toLowerCase()] || "#7c3aed";
              const active = activeCategory === c.id;
              return (
                <button key={c.id} onClick={() => pickCategory(c.id)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 9, border: "none", background: active ? color + "18" : "transparent", color: active ? color : tc, fontSize: 13, fontWeight: active ? 700 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{c.label}</span>
                  <span style={{ fontSize: 11, color: active ? color : sc, background: active ? color + "20" : dark ? "rgba(255,255,255,0.07)" : "rgba(26,22,37,0.06)", padding: "1px 7px", borderRadius: 99, flexShrink: 0 }}>{c.count}</span>
                </button>
              );
            })}
          </div>

          {/* Post list */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: sc }}>
                {loading ? "Chargement…" : `${total} discussion${total !== 1 ? "s" : ""}${activeCategory ? ` · ${activeCategory.toUpperCase()}` : ""}${search ? ` · "${search}"` : ""}`}
              </p>
            </div>

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)", border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(124,58,237,0.07)", borderRadius: 16, height: 96, marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 24px", color: sc }}>
                <MessageSquare size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                <p style={{ fontSize: 15, fontWeight: 600 }}>Aucune discussion trouvée</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Sois le premier à lancer la conversation !</p>
                <button onClick={() => setShowModal(true)} style={{ marginTop: 20, padding: "11px 22px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  <Plus size={13} style={{ marginRight: 6 }} />Créer une discussion
                </button>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} dark={dark} onClick={() => navigate(`/app/forum/${post.id}`)} />
              ))
            )}

            {/* Pagination */}
            {total > 20 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
                {page > 1 && (
                  <button onClick={() => setPage(p => p - 1)} style={{ padding: "8px 16px", background: dark ? "rgba(255,255,255,0.07)" : "#fff", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(124,58,237,0.15)", borderRadius: 10, color: tc, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    ← Précédent
                  </button>
                )}
                {page * 20 < total && (
                  <button onClick={() => setPage(p => p + 1)} style={{ padding: "8px 16px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    Suivant →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <NewPostModal
          dark={dark}
          onClose={() => setShowModal(false)}
          onCreated={id => { setShowModal(false); navigate(`/app/forum/${id}`); }}
        />
      )}
    </>
  );
}
