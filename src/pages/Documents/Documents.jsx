import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/Avatar";
import ThemeToggle from "../../components/UI/ThemeToggle";
import {
  ArrowLeft, FileText, Upload, Download, Search,
  Clock, CheckCircle, X, Filter,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

const TYPE_LABELS = {
  sujet_concours: "Sujet de concours",
  fiche_revision: "Fiche de révision",
  autre:          "Autre",
};

const TYPE_COLORS = {
  sujet_concours: { bg: "rgba(124,58,237,0.1)", text: "#a78bfa", border: "rgba(124,58,237,0.2)" },
  fiche_revision: { bg: "rgba(16,185,129,0.1)", text: "#10b981", border: "rgba(16,185,129,0.2)" },
  autre:          { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
};

const SCHOOLS = [
  "ENSIAS","ENSA","ENSET","ENIM","EMI","EHTP","ENCG","ISCAE","HEM","UIR","EMSI","INSEA","Autre",
];

export default function Documents() {
  const { theme }  = useTheme();
  const { user, accessToken } = useAuth();
  const navigate   = useNavigate();
  const dark       = theme === "dark";
  const getToken   = () => accessToken || localStorage.getItem("najahi_token");
  const fileRef    = useRef(null);

  const [docs,       setDocs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState("browse"); // browse | upload
  const [filterSchool, setFilterSchool] = useState("");
  const [filterType,   setFilterType]   = useState("");
  const [searchQ,    setSearchQ]    = useState("");
  const [form,       setForm]       = useState({ title: "", school: "", type: "autre" });
  const [file,       setFile]       = useState(null);
  const [dragging,   setDragging]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [toast,      setToast]      = useState({ msg: "", ok: true });
  const [mounted,    setMounted]    = useState(false);

  const bg      = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 50%,#0d1a2e 100%)" : "linear-gradient(135deg,#f0edff 0%,#e8e4ff 50%,#eef2ff 100%)";
  const navBg   = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)";
  const navBdr  = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)";
  const textCol = dark ? "#fff" : "#1a1625";
  const subCol  = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";
  const cardBg  = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const cardBdr = dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(124,58,237,0.12)";
  const inputBg = dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)";
  const inputBd = dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(124,58,237,0.2)";

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);
  useEffect(() => { fetchDocs(); }, [filterSchool, filterType]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSchool) params.set("school", filterSchool);
      if (filterType)   params.set("type",   filterType);
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/documents?${params}`, { headers });
      if (res.ok) setDocs(await res.json());
    } catch {} finally { setLoading(false); }
  };

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3500);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") setFile(f);
    else showToast("Seuls les fichiers PDF sont acceptés", false);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "application/pdf") setFile(f);
    else showToast("Seuls les fichiers PDF sont acceptés", false);
  };

  const handleUpload = async () => {
    if (!file || !form.title.trim()) { showToast("Titre et fichier requis", false); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file",   file);
      fd.append("title",  form.title.trim());
      fd.append("school", form.school);
      fd.append("type",   form.type);
      const res = await fetch(`${API_URL}/api/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Erreur upload", false); return; }
      showToast("Document soumis — en attente de validation !");
      setForm({ title: "", school: "", type: "autre" });
      setFile(null);
      setView("browse");
      fetchDocs();
    } catch { showToast("Erreur réseau", false); }
    finally { setUploading(false); }
  };

  const filtered = docs.filter(d => {
    const q = searchQ.toLowerCase();
    return !q || d.title.toLowerCase().includes(q) || (d.school || "").toLowerCase().includes(q);
  });

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: inputBg, border: inputBd,
    borderRadius: 10, fontSize: 14, color: textCol,
    fontFamily: "'DM Sans',sans-serif", outline: "none",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes doc-fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .doc-card:hover{transform:translateY(-3px);box-shadow:${dark ? "0 12px 40px rgba(0,0,0,0.35)" : "0 12px 40px rgba(124,58,237,0.12)"} !important;}
        .doc-input:focus{border-color:#7c3aed !important;box-shadow:0 0 0 3px rgba(124,58,237,0.12) !important;}
        .doc-input::placeholder{color:${dark ? "rgba(255,255,255,0.2)" : "rgba(26,22,37,0.25)"};}
        .doc-chip{cursor:pointer;transition:all 0.18s;border-radius:99px;padding:6px 14px;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;border:1px solid;}
        .doc-chip:hover{transform:translateY(-1px);}
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans',sans-serif" }}>

        {/* Navbar */}
        <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: navBg, backdropFilter: "blur(18px)", borderBottom: `1px solid ${navBdr}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={() => navigate("/app/dashboard")}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.06)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(124,58,237,0.15)", borderRadius: 8, color: subCol, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              <ArrowLeft size={13} /> Dashboard
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "grid", placeItems: "center" }}>
                <FileText size={16} color="#fff" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: textCol, fontFamily: "'Fraunces',serif" }}>Documents partagés</span>
            </div>
          </div>
          <ThemeToggle />
        </nav>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>

          {/* Header + tabs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28, animation: mounted ? "doc-fadeUp 0.4s ease both" : "none" }}>
            <div>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: textCol, marginBottom: 4, letterSpacing: "-0.5px" }}>
                Bibliothèque de documents
              </h1>
              <p style={{ color: subCol, fontSize: 14 }}>
                Sujets de concours, fiches de révision et ressources partagées par la communauté.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["browse", "upload"].map(v => (
                <button key={v} type="button"
                  onClick={() => setView(v)}
                  style={{ padding: "9px 18px", borderRadius: 10, border: view === v ? "none" : `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.2)"}`, background: view === v ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "transparent", color: view === v ? "#fff" : subCol, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                  {v === "browse" ? <><Filter size={13} /> Explorer</> : <><Upload size={13} /> Partager un doc</>}
                </button>
              ))}
            </div>
          </div>

          {/* ── BROWSE ── */}
          {view === "browse" && (
            <div style={{ animation: "doc-fadeUp 0.35s ease both" }}>

              {/* Filters row */}
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: "1 1 220px" }}>
                  <Search size={14} color={subCol} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="doc-input" type="text"
                    placeholder="Rechercher par titre ou école…"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 34 }}
                  />
                </div>
                <select className="doc-input"
                  value={filterSchool}
                  onChange={e => setFilterSchool(e.target.value)}
                  style={{ ...inputStyle, flex: "0 1 180px", cursor: "pointer" }}>
                  <option value="">Toutes les écoles</option>
                  {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Type chips */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                {[["", "Tous"], ["sujet_concours", "Sujets"], ["fiche_revision", "Fiches"], ["autre", "Autre"]].map(([val, label]) => {
                  const active = filterType === val;
                  return (
                    <button key={val} type="button" className="doc-chip"
                      onClick={() => setFilterType(val)}
                      style={{ background: active ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "transparent", color: active ? "#fff" : subCol, borderColor: active ? "transparent" : dark ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.2)" }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Grid */}
              {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: subCol, fontSize: 14 }}>Chargement…</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: subCol }}>
                  <FileText size={40} style={{ marginBottom: 12, opacity: 0.35 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, color: textCol, marginBottom: 6 }}>Aucun document trouvé</div>
                  <div style={{ fontSize: 13 }}>Sois le premier à partager une ressource !</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 16 }}>
                  {filtered.map(d => {
                    const tc = TYPE_COLORS[d.type] || TYPE_COLORS.autre;
                    const uploader = [d.prenom, d.nom].filter(Boolean).join(" ") || "Anonyme";
                    return (
                      <div key={d.id} className="doc-card"
                        style={{ background: cardBg, backdropFilter: "blur(20px)", border: cardBdr, borderRadius: 16, padding: "20px 18px", transition: "all 0.25s", boxShadow: dark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 4px 16px rgba(124,58,237,0.06)" }}>

                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: tc.bg, border: `1px solid ${tc.border}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                            <FileText size={20} color={tc.text} />
                          </div>
                          {!d.is_approved ? (
                            <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, background: "rgba(245,158,11,0.12)", color: "#f59e0b", fontWeight: 700, border: "1px solid rgba(245,158,11,0.2)", flexShrink: 0 }}>
                              En attente
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, background: tc.bg, color: tc.text, fontWeight: 700, border: `1px solid ${tc.border}`, flexShrink: 0 }}>
                              {TYPE_LABELS[d.type] || "Autre"}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 14, fontWeight: 700, color: textCol, marginBottom: 6, lineHeight: 1.35 }}>
                          {d.title}
                        </div>
                        {d.school && (
                          <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 10 }}>{d.school}</div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingTop: 10, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.06)"}` }}>
                          <Avatar src={d.avatar_url} name={uploader} size={26} borderRadius={8} />
                          <span style={{ fontSize: 11, color: subCol }}>{uploader}</span>
                          <span style={{ marginLeft: "auto", fontSize: 10, color: subCol }}>
                            {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : ""}
                          </span>
                        </div>

                        {d.is_approved && (
                          <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "9px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                            <Download size={13} /> Télécharger PDF
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── UPLOAD ── */}
          {view === "upload" && (
            <div style={{ maxWidth: 560, margin: "0 auto", animation: "doc-fadeUp 0.35s ease both" }}>
              <div style={{ background: cardBg, backdropFilter: "blur(24px)", border: cardBdr, borderRadius: 22, padding: "32px 28px", boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.3)" : "0 8px 40px rgba(124,58,237,0.1)" }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: textCol, marginBottom: 6 }}>Partager un document</h2>
                <p style={{ fontSize: 13, color: subCol, marginBottom: 26, lineHeight: 1.6 }}>
                  Ton document sera examiné par un administrateur avant d'être visible par la communauté.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subCol, display: "block", marginBottom: 6 }}>Titre *</label>
                    <input className="doc-input" type="text"
                      placeholder="Ex: Sujet concours ENSIAS 2024"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: subCol, display: "block", marginBottom: 6 }}>École</label>
                      <select className="doc-input"
                        value={form.school}
                        onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                        style={{ ...inputStyle, cursor: "pointer" }}>
                        <option value="">Aucune</option>
                        {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: subCol, display: "block", marginBottom: 6 }}>Type *</label>
                      <select className="doc-input"
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        style={{ ...inputStyle, cursor: "pointer" }}>
                        {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Drop zone */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subCol, display: "block", marginBottom: 6 }}>Fichier PDF *</label>
                    <div
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      style={{ padding: "32px 20px", borderRadius: 14, border: `2px dashed ${dragging ? "#7c3aed" : dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.25)"}`, background: dragging ? "rgba(124,58,237,0.06)" : "transparent", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
                      <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFileChange} style={{ display: "none" }} />
                      {file ? (
                        <div>
                          <FileText size={28} color="#7c3aed" style={{ marginBottom: 8 }} />
                          <div style={{ fontSize: 14, fontWeight: 600, color: textCol, marginBottom: 4 }}>{file.name}</div>
                          <div style={{ fontSize: 12, color: subCol }}>{(file.size / 1024 / 1024).toFixed(2)} Mo</div>
                          <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                            style={{ marginTop: 10, fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <X size={12} /> Supprimer
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload size={28} color={subCol} style={{ marginBottom: 8 }} />
                          <div style={{ fontSize: 14, fontWeight: 600, color: textCol, marginBottom: 4 }}>Glisse ton PDF ici</div>
                          <div style={{ fontSize: 12, color: subCol }}>ou clique pour choisir un fichier · max 20 Mo</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="button"
                    onClick={handleUpload}
                    disabled={!file || !form.title.trim() || uploading}
                    style={{ padding: "13px", borderRadius: 12, border: "none", background: file && form.title.trim() ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "rgba(124,58,237,0.3)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: file && form.title.trim() ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.25s" }}>
                    {uploading ? "Envoi en cours…" : <><Upload size={16} /> Soumettre le document</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: toast.ok ? "#10b981" : "#ef4444", color: "#fff", padding: "11px 22px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,0.18)", whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
