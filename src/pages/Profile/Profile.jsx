import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import {
  ArrowLeft, Pencil, Save, X, Upload, Trash2, Download,
  FileText, User, MapPin, GraduationCap, BookOpen, Compass,
  Clock, Users, AlertCircle, Camera, Phone, Calendar,
  MessageSquare, TrendingUp,
} from "lucide-react";

// ── constants ─────────────────────────────────────────────────────────────────

const API     = (path) => `${import.meta.env.VITE_API_URL || ""}/api/profile${path}`;
const token   = () => localStorage.getItem("najahi_token") || "";
const authH   = () => ({ Authorization: `Bearer ${token()}` });
const BASE_URL = import.meta.env.VITE_API_URL || "";

const BAC_TYPES = [
  "Bac Sciences Maths A", "Bac Sciences Maths B", "Bac Sciences Physiques",
  "Bac Sciences de la Vie", "Bac Sciences Économiques",
  "Bac Lettres & Sciences Humaines", "Bac Technologie Électrique",
  "BTS / DUT", "Autre",
];

const VILLES = [
  "Casablanca", "Rabat", "Fès", "Marrakech", "Agadir",
  "Tanger", "Oujda", "Meknès", "Kenitra", "Settat", "Autre",
];

const TYPE_EMOJI = {
  engineering: "🏗️", business: "📊", health: "🏥",
  architecture: "🏛️", preparatoire: "📖", university: "🎓",
};
const TYPE_LABEL = {
  engineering: "Ingénierie", business: "Business",
  health: "Médecine & Santé", architecture: "Architecture",
  preparatoire: "Classes Prépa", university: "Université",
};

// ── helpers ───────────────────────────────────────────────────────────────────

const initials = (p, n) => `${(p || "?")[0]}${(n || "?")[0]}`.toUpperCase();

const fmtDate = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
};

// ── CSS injected once ─────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @keyframes spin      { to { transform: rotate(360deg); } }
  @keyframes fadeUp    { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:translateY(0) } }
  @keyframes slideRight{ from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:translateX(0) } }
  input:focus, select:focus { outline: none; border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; }
  .pfx-row:hover { background: rgba(124,58,237,0.05) !important; }
  .pfx-btn-icon:hover { opacity: 0.8; }
  .pfx-bul-row:hover { background: rgba(124,58,237,0.06) !important; }
`;

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 24, zIndex: 9999,
      background: type === "error" ? "#ef4444" : "#10b981",
      color: "#fff", padding: "12px 22px", borderRadius: 14,
      fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      animation: "slideRight 0.3s ease",
    }}>
      {msg}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ size = 20, color = "#7c3aed" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `3px solid ${color}33`,
      borderTop: `3px solid ${color}`,
      animation: "spin 0.8s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ── Section card wrapper ───────────────────────────────────────────────────────

function Card({ children, delay = 0, style = {} }) {
  return (
    <div style={{
      borderRadius: 20,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      overflow: "hidden",
      marginBottom: 16,
      animation: `fadeUp 0.5s ${delay}s ease both`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Section header row ────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, accent, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 16px ${accent}55`,
      }}>
        <Icon size={19} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, marginTop: 1, opacity: 0.55 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ profile, onUpload, uploading, size = 100 }) {
  const ref = useRef();
  const src = profile?.avatar_url
    ? (profile.avatar_url.startsWith("http") ? profile.avatar_url : `${BASE_URL}${profile.avatar_url}`)
    : null;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        onClick={() => ref.current?.click()}
        style={{
          width: size, height: size, borderRadius: "50%",
          background: src ? "transparent" : "linear-gradient(135deg, #6d28d9, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.3, fontWeight: 800, color: "#fff",
          overflow: "hidden", cursor: "pointer",
          border: "4px solid rgba(255,255,255,0.9)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          transition: "transform 0.2s",
          position: "relative",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {src ? (
          <img src={src} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials(profile?.prenom, profile?.nom)
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0, transition: "opacity 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <Camera size={22} color="#fff" />
        </div>
      </div>

      {uploading && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "rgba(109,40,217,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Spinner size={22} color="#fff" />
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
    </div>
  );
}

// ── Info field row ────────────────────────────────────────────────────────────

function InfoField({ icon: Icon, label, field, value, editData, editMode, onChange, type = "text", options, border, textMain, textMuted, isDark, noSep }) {
  const inputBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)";
  return (
    <div className="pfx-row" style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 0",
      borderBottom: noSep ? "none" : `1px solid ${border}`,
      transition: "background 0.15s",
    }}>
      <Icon size={15} color="#7c3aed" style={{ flexShrink: 0 }} />
      <span style={{ width: 120, fontSize: 12, color: textMuted, flexShrink: 0 }}>{label}</span>
      {editMode ? (
        options ? (
          <select value={editData[field] ?? ""} onChange={e => onChange(field, e.target.value)}
            style={{
              flex: 1, padding: "7px 10px", fontSize: 14, fontWeight: 500,
              color: textMain, background: inputBg,
              border: `1px solid ${border}`, borderRadius: 9,
            }}
          >
            <option value="">Sélectionner…</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} value={editData[field] ?? ""} onChange={e => onChange(field, e.target.value)}
            min={type === "number" ? 0 : undefined}
            max={type === "number" ? 20 : undefined}
            step={type === "number" ? 0.25 : undefined}
            style={{
              flex: 1, padding: "7px 10px", fontSize: 14, fontWeight: 500,
              color: textMain, background: inputBg,
              border: `1px solid ${border}`, borderRadius: 9,
            }}
          />
        )
      ) : (
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: value ? textMain : textMuted }}>
          {value || "—"}
        </span>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ icon: Icon, title, sub, color = "#7c3aed", border }) {
  return (
    <div style={{
      textAlign: "center", padding: "32px 16px",
      border: `2px dashed ${border}`, borderRadius: 14,
    }}>
      <Icon size={30} style={{ color, opacity: 0.3, marginBottom: 10 }} />
      <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.6 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, opacity: 0.4, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ── state ──────────────────────────────────────────────────────────────────
  const [profile,          setProfile]          = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [editMode,         setEditMode]         = useState(false);
  const [editData,         setEditData]         = useState({});
  const [saving,           setSaving]           = useState(false);
  const [avatarUploading,  setAvatarUploading]  = useState(false);
  const [bulletins,        setBulletins]        = useState([]);
  const [bulletinUploading,setBulletinUploading]= useState(false);
  const [deletingId,       setDeletingId]       = useState(null);
  const [toast,            setToast]            = useState({ msg: "", type: "success" });
  const [orientResult,     setOrientResult]     = useState(undefined);
  const [myRooms,          setMyRooms]          = useState(null);
  const [schoolsHistory,   setSchoolsHistory]   = useState(null);
  const bulletinRef = useRef();

  // ── theme tokens ───────────────────────────────────────────────────────────
  const pageBg   = isDark
    ? "linear-gradient(160deg,#07071a 0%,#0e0826 55%,#071220 100%)"
    : "linear-gradient(160deg,#f5f3ff 0%,#faf7ff 55%,#eef2ff 100%)";
  const cardBg   = isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.88)";
  const cardShadow = isDark
    ? "0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 4px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)";
  const border   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textMain = isDark ? "#f1f5f9" : "#1a1a2e";
  const textMuted= isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.42)";
  const purple   = "#7c3aed";

  const cardStyle = { background: cardBg, border: `1px solid ${border}`, boxShadow: cardShadow, color: textMain };

  // ── toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3200);
  };

  const setField = (f, v) => setEditData(d => ({ ...d, [f]: v }));

  // ── data fetching ──────────────────────────────────────────────────────────
  async function fetchProfile() {
    try {
      const res  = await fetch(API("/me"), { headers: authH() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(data);
      setEditData({
        prenom:           data.prenom           || "",
        nom:              data.nom              || "",
        telephone:        data.telephone        || "",
        ville:            data.ville            || "",
        niveau:           data.niveau           || "",
        moyenne_generale: data.moyenne_generale ?? "",
        filiere_actuelle: data.filiere_actuelle || "",
        note_bac:         data.note_bac         ?? "",
      });
    } catch {
      showToast("Erreur lors du chargement du profil", "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBulletins() {
    try {
      const res  = await fetch(API("/bulletins"), { headers: authH() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBulletins(data.bulletins || []);
    } catch { /* silent */ }
  }

  async function fetchOrientResult() {
    try {
      const res  = await fetch(BASE_URL + "/api/orientation/my-result", { headers: authH() });
      if (!res.ok) { setOrientResult(null); return; }
      const data = await res.json();
      setOrientResult(data.result || null);
    } catch { setOrientResult(null); }
  }

  async function fetchMyRooms() {
    try {
      const res  = await fetch(BASE_URL + "/api/rooms/my-rooms", { headers: authH() });
      if (!res.ok) { setMyRooms([]); return; }
      const data = await res.json();
      setMyRooms(data.rooms || []);
    } catch { setMyRooms([]); }
  }

  async function fetchSchoolsHistory() {
    try {
      const res  = await fetch(BASE_URL + "/api/schools/my-history", { headers: authH() });
      if (!res.ok) { setSchoolsHistory([]); return; }
      const data = await res.json();
      setSchoolsHistory(data.history || []);
    } catch { setSchoolsHistory([]); }
  }

  useEffect(() => {
    fetchProfile();
    fetchBulletins();
    fetchOrientResult();
    fetchMyRooms();
    fetchSchoolsHistory();
  }, []);

  // ── save profile ───────────────────────────────────────────────────────────
  async function saveProfile() {
    setSaving(true);
    try {
      const payload = {
        prenom:           editData.prenom,
        nom:              editData.nom,
        telephone:        editData.telephone,
        ville:            editData.ville,
        niveau:           editData.niveau,
        filiere_actuelle: editData.filiere_actuelle,
      };
      const mg = parseFloat(editData.moyenne_generale);
      if (!isNaN(mg)) payload.moyenne_generale = Math.min(20, Math.max(0, mg));
      const nb = parseFloat(editData.note_bac);
      if (!isNaN(nb)) payload.note_bac = Math.min(20, Math.max(0, nb));

      const res = await fetch(API("/me"), {
        method: "PUT",
        headers: { ...authH(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      await fetchProfile();
      setEditMode(false);
      showToast("Profil mis à jour ✓");
    } catch {
      showToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── avatar upload ──────────────────────────────────────────────────────────
  async function uploadAvatar(file) {
    if (file.size > 10 * 1024 * 1024) { showToast("Image trop grande (max 10 MB)", "error"); return; }
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch(BASE_URL + "/api/profile/avatar", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("najahi_token")}` },
        body: fd,
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Erreur"); }
      await fetchProfile();
      showToast("Photo mise à jour ✓");
    } catch (e) {
      showToast(e.message || "Erreur lors de l'upload", "error");
    } finally {
      setAvatarUploading(false);
    }
  }

  // ── bulletins ──────────────────────────────────────────────────────────────
  async function uploadBulletin(file) {
    if (bulletins.length >= 5) { showToast("Maximum 5 bulletins autorisés", "error"); return; }
    setBulletinUploading(true);
    try {
      const fd = new FormData();
      fd.append("bulletin", file);
      const res  = await fetch(API("/upload-bulletin"), { method: "POST", headers: authH(), body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      await fetchBulletins();
      showToast("Bulletin ajouté ✓");
    } catch (e) {
      showToast(e.message || "Erreur upload", "error");
    } finally {
      setBulletinUploading(false);
      if (bulletinRef.current) bulletinRef.current.value = "";
    }
  }

  async function deleteBulletin(id) {
    setDeletingId(id);
    try {
      const res = await fetch(API(`/bulletin/${id}`), { method: "DELETE", headers: authH() });
      if (!res.ok) throw new Error();
      setBulletins(b => b.filter(x => x.id !== id));
      showToast("Bulletin supprimé");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function downloadBulletin(id, name) {
    try {
      const res  = await fetch(API(`/bulletin/${id}/download`), { headers: authH() });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Erreur lors du téléchargement", "error");
    }
  }

  // ── loading screen ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{GLOBAL_CSS}</style>
      <Spinner size={40} />
    </div>
  );

  const fullName = [profile?.prenom, profile?.nom].filter(Boolean).join(" ") || "Étudiant";

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: pageBg, fontFamily: "'DM Sans', sans-serif", color: textMain }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Sticky Navbar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: isDark ? "rgba(7,7,26,0.82)" : "rgba(248,245,255,0.82)",
        backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${border}`,
        display: "flex", alignItems: "center", gap: 12,
        height: isMobile ? 56 : 64,
        padding: isMobile ? "0 16px" : "0 24px",
      }}>
        <button onClick={() => navigate("/app/dashboard")} style={{
          width: 36, height: 36, borderRadius: "50%",
          background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
          border: `1px solid ${border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: textMain, flexShrink: 0,
        }}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ flex: 1, fontSize: isMobile ? 16 : 18, fontWeight: 800, fontFamily: "'Fraunces', serif" }}>
          Mon Profil
        </span>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: isMobile ? "20px 12px 60px" : "28px 20px 80px" }}>

        {/* ══════════════════════════════════════════════════════════════
            CARD 1 — Hero Header
        ══════════════════════════════════════════════════════════════ */}
        <Card delay={0} style={{ ...cardStyle }}>
          {/* Banner */}
          <div style={{
            height: 160,
            background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 45%, #818cf8 100%)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position:"absolute", top:-50, right:-50, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
            <div style={{ position:"absolute", bottom:-60, left:40,  width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
            <div style={{ position:"absolute", top:20,   left:"50%", width:80,  height:80,  borderRadius:"50%", background:"rgba(255,255,255,0.03)", transform:"translateX(-50%)" }} />
          </div>

          {/* Avatar + identity */}
          <div style={{ padding: "0 24px 28px", textAlign: "center" }}>
            <div style={{ display:"flex", justifyContent:"center", marginTop: -50, marginBottom: 14 }}>
              <Avatar profile={profile} onUpload={uploadAvatar} uploading={avatarUploading} size={100} />
            </div>

            <div style={{ fontFamily:"'Fraunces', serif", fontSize: isMobile ? 22 : 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 6 }}>
              {fullName}
            </div>
            <div style={{ fontSize: 13, color: textMuted, marginBottom: 14, display:"flex", alignItems:"center", justifyContent:"center", gap: 6 }}>
              <User size={13} />
              {profile?.email || "—"}
            </div>

            {/* Tags row */}
            <div style={{ display:"flex", gap: 8, justifyContent:"center", flexWrap:"wrap" }}>
              {profile?.ville && (
                <span style={{
                  display:"flex", alignItems:"center", gap: 4,
                  fontSize: 12, fontWeight: 600, color: purple,
                  background: `${purple}14`, padding:"4px 12px",
                  borderRadius: 99, border:`1px solid ${purple}28`,
                }}>
                  <MapPin size={11} /> {profile.ville}
                </span>
              )}
              {profile?.niveau && (
                <span style={{
                  display:"flex", alignItems:"center", gap: 4,
                  fontSize: 12, fontWeight: 600,
                  color: isDark ? "#a78bfa" : "#6d28d9",
                  background: isDark ? "rgba(167,139,250,0.12)" : "rgba(109,40,217,0.08)",
                  padding:"4px 12px", borderRadius: 99,
                  border:`1px solid ${isDark?"rgba(167,139,250,0.25)":"rgba(109,40,217,0.2)"}`,
                }}>
                  <GraduationCap size={11} /> {profile.niveau}
                </span>
              )}
              {profile?.created_at && (
                <span style={{
                  display:"flex", alignItems:"center", gap: 4,
                  fontSize: 12, fontWeight: 500, color: textMuted,
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  padding:"4px 12px", borderRadius: 99,
                  border:`1px solid ${border}`,
                }}>
                  <Calendar size={11} /> Inscrit le {fmtDate(profile.created_at)}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* ══════════════════════════════════════════════════════════════
            CARD 2 — Info personnelles
        ══════════════════════════════════════════════════════════════ */}
        <Card delay={0.07} style={{ ...cardStyle, padding: "22px 24px" }}>
          <SectionHeader
            icon={User}
            title="Informations personnelles"
            subtitle="Profil académique et contact"
            accent="linear-gradient(135deg, #7c3aed, #a78bfa)"
          >
            {editMode ? (
              <div style={{ display:"flex", gap: 8 }}>
                <button onClick={() => setEditMode(false)} style={{
                  padding:"7px 14px", fontSize:12, fontWeight:600, borderRadius:10,
                  background:"none", border:`1px solid ${border}`,
                  cursor:"pointer", color: textMuted, display:"flex", alignItems:"center", gap:5,
                }}>
                  <X size={13} /> Annuler
                </button>
                <button onClick={saveProfile} disabled={saving} style={{
                  padding:"7px 16px", fontSize:12, fontWeight:700, borderRadius:10,
                  background: purple, color:"#fff", border:"none",
                  cursor: saving ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", gap:5,
                  opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? <Spinner size={12} color="#fff" /> : <Save size={13} />}
                  Enregistrer
                </button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)} style={{
                padding:"7px 16px", fontSize:12, fontWeight:700, borderRadius:10,
                background:`${purple}16`, color: purple,
                border:`1px solid ${purple}36`,
                cursor:"pointer", display:"flex", alignItems:"center", gap:5,
              }}>
                <Pencil size={13} /> Modifier
              </button>
            )}
          </SectionHeader>

          <InfoField icon={User}          label="Prénom"       field="prenom"           value={profile?.prenom}          editData={editData} editMode={editMode} onChange={setField} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
          <InfoField icon={User}          label="Nom"          field="nom"              value={profile?.nom}             editData={editData} editMode={editMode} onChange={setField} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
          <InfoField icon={Phone}         label="Téléphone"    field="telephone"        value={profile?.telephone}       editData={editData} editMode={editMode} onChange={setField} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
          <InfoField icon={MapPin}        label="Ville"        field="ville"            value={profile?.ville}           editData={editData} editMode={editMode} onChange={setField} options={VILLES}    isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
          <InfoField icon={GraduationCap} label="Type de Bac"  field="niveau"           value={profile?.niveau}          editData={editData} editMode={editMode} onChange={setField} options={BAC_TYPES} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
          <InfoField icon={TrendingUp}    label="Note Bac"     field="moyenne_generale" value={profile?.moyenne_generale != null ? `${profile.moyenne_generale}/20` : null} editData={editData} editMode={editMode} onChange={setField} type="number" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
          <InfoField icon={BookOpen}      label="Filière"      field="filiere_actuelle" value={profile?.filiere_actuelle} editData={editData} editMode={editMode} onChange={setField} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} noSep />
        </Card>

        {/* ══════════════════════════════════════════════════════════════
            CARD 3 — Orientation result
        ══════════════════════════════════════════════════════════════ */}
        <Card delay={0.12} style={{ ...cardStyle, padding: "22px 24px" }}>
          <SectionHeader
            icon={Compass}
            title="Test d'Orientation"
            subtitle="Recommandation IA personnalisée"
            accent="linear-gradient(135deg, #059669, #34d399)"
          />

          {orientResult ? (
            <>
              <div style={{
                padding: 16, borderRadius: 14,
                background: isDark ? "rgba(5,150,105,0.08)" : "rgba(5,150,105,0.05)",
                border: "1px solid rgba(5,150,105,0.18)",
                marginBottom: 14,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{TYPE_EMOJI[orientResult.filiere] || "🎓"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, fontFamily:"'Fraunces', serif", lineHeight: 1.3 }}>
                      {orientResult.ecole}
                    </div>
                    <span style={{
                      display:"inline-block", marginTop: 4,
                      fontSize: 10, fontWeight: 700, color: "#059669",
                      background: "rgba(5,150,105,0.12)", padding:"2px 9px",
                      borderRadius: 99, border:"1px solid rgba(5,150,105,0.25)",
                    }}>
                      {TYPE_LABEL[orientResult.filiere] || orientResult.filiere}
                    </span>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: textMuted }}>Compatibilité</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#059669" }}>{orientResult.confidence}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius: 99, transition:"width 1.2s ease",
                    width:`${orientResult.confidence}%`,
                    background:"linear-gradient(90deg,#059669,#34d399)",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: textMuted, marginTop: 8 }}>
                  Testé le {fmtDate(orientResult.created_at)}
                </div>
              </div>
              <button onClick={() => navigate("/app/orientation")} style={{
                width:"100%", padding: "11px", fontSize: 13, fontWeight: 700,
                background: isDark ? "rgba(5,150,105,0.14)" : "rgba(5,150,105,0.09)",
                color:"#059669", border:"1px solid rgba(5,150,105,0.25)",
                borderRadius: 12, cursor:"pointer",
              }}>
                Refaire le test →
              </button>
            </>
          ) : (
            <>
              <div style={{
                display:"flex", alignItems:"center", gap: 12,
                padding: 16, borderRadius: 14, marginBottom: 14,
                background: isDark ? "rgba(5,150,105,0.06)" : "rgba(5,150,105,0.04)",
                border:"1px solid rgba(5,150,105,0.15)",
              }}>
                <AlertCircle size={20} color="#059669" style={{ flexShrink:0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Aucun test effectué</div>
                  <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>Découvre l'école qui te correspond</div>
                </div>
              </div>
              <button onClick={() => navigate("/app/orientation")} style={{
                width:"100%", padding: "11px", fontSize: 13, fontWeight: 700,
                background:"linear-gradient(135deg,#059669,#34d399)",
                color:"#fff", border:"none", borderRadius: 12, cursor:"pointer",
              }}>
                Faire le test d'orientation →
              </button>
            </>
          )}
        </Card>

        {/* ══════════════════════════════════════════════════════════════
            CARD 4 — Study stats
        ══════════════════════════════════════════════════════════════ */}
        <Card delay={0.17} style={{ ...cardStyle, padding: "22px 24px" }}>
          <SectionHeader
            icon={Clock}
            title="Statistiques d'étude"
            subtitle="Study With Me · Sessions de travail"
            accent="linear-gradient(135deg, #7c3aed, #a78bfa)"
          />

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { icon: Clock,  label: "Heures étudiées", value: "—" },
              { icon: Users,  label: "Sessions",        value: "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                padding: "16px 14px", borderRadius: 14, textAlign:"center",
                background: isDark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)",
                border:`1px solid rgba(124,58,237,0.15)`,
              }}>
                <Icon size={18} color={purple} style={{ marginBottom: 8, opacity: 0.8 }} />
                <div style={{ fontSize: 26, fontWeight: 800, color: purple, fontFamily:"'Fraunces', serif" }}>{value}</div>
                <div style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding: "12px 14px", borderRadius: 12,
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
            border:`1px solid ${border}`,
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 13, color: textMuted }}>Dernière session</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>—</span>
          </div>

          <button onClick={() => navigate("/app/servers")} style={{
            width:"100%", padding: "11px", fontSize: 13, fontWeight: 700,
            background:"linear-gradient(135deg,#7c3aed,#a78bfa)",
            color:"#fff", border:"none", borderRadius: 12, cursor:"pointer",
          }}>
            Rejoindre un stream d'étude →
          </button>
        </Card>

        {/* ══════════════════════════════════════════════════════════════
            CARD 5 — Bulletins
        ══════════════════════════════════════════════════════════════ */}
        <Card delay={0.22} style={{ ...cardStyle, padding: "22px 24px" }}>
          <SectionHeader
            icon={FileText}
            title="Bulletins Scolaires"
            subtitle={`${bulletins.length} / 5 bulletins`}
            accent="linear-gradient(135deg, #dc2626, #f87171)"
          >
            <button
              onClick={() => bulletinRef.current?.click()}
              disabled={bulletinUploading || bulletins.length >= 5}
              style={{
                padding:"8px 16px", fontSize: 12, fontWeight: 700,
                background: bulletins.length >= 5
                  ? (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)")
                  : "linear-gradient(135deg,#7c3aed,#a78bfa)",
                color: bulletins.length >= 5 ? textMuted : "#fff",
                border:"none", borderRadius: 10,
                cursor: (bulletinUploading || bulletins.length >= 5) ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", gap: 6,
                opacity: bulletinUploading ? 0.7 : 1,
              }}
            >
              {bulletinUploading ? <Spinner size={12} color="#fff" /> : <Upload size={13} />}
              {bulletins.length >= 5 ? "Limite atteinte" : "Ajouter"}
            </button>
            <input ref={bulletinRef} type="file" accept="application/pdf,.pdf" style={{ display:"none" }}
              onChange={e => e.target.files?.[0] && uploadBulletin(e.target.files[0])} />
          </SectionHeader>

          {/* progress bar */}
          <div style={{ height: 5, borderRadius: 5, marginBottom: 18, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
            <div style={{
              height:"100%", borderRadius: 5, transition:"width 0.4s ease",
              width:`${(bulletins.length / 5) * 100}%`,
              background:"linear-gradient(90deg,#7c3aed,#a78bfa)",
            }} />
          </div>

          {bulletins.length === 0 ? (
            <Empty icon={FileText} title="Aucun bulletin ajouté" sub="PDF · max 10 MB · max 5 fichiers" color="#dc2626" border={border} />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
              {bulletins.map(b => (
                <div key={b.id} className="pfx-bul-row" style={{
                  display:"flex", alignItems:"center", gap: 12,
                  padding:"12px 14px", borderRadius: 12,
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  border:`1px solid ${border}`, transition:"background 0.15s",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background:"rgba(220,38,38,0.1)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <FileText size={16} color="#dc2626" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {b.original_name}
                    </div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{fmtDate(b.uploaded_at)}</div>
                  </div>
                  <div style={{ display:"flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => downloadBulletin(b.id, b.original_name)}
                      style={{ width:32, height:32, borderRadius:8, border:`1px solid ${border}`, background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color: textMuted }}
                      onMouseEnter={e => { e.currentTarget.style.color=purple; e.currentTarget.style.borderColor=purple; }}
                      onMouseLeave={e => { e.currentTarget.style.color=textMuted; e.currentTarget.style.borderColor=border; }}
                    >
                      <Download size={14} />
                    </button>
                    <button onClick={() => deleteBulletin(b.id)} disabled={deletingId === b.id}
                      style={{ width:32, height:32, borderRadius:8, border:"1px solid rgba(220,38,38,0.25)", background:"none", cursor: deletingId===b.id?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#dc2626", opacity: deletingId===b.id?0.5:1 }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(220,38,38,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background="none"}
                    >
                      {deletingId === b.id ? <Spinner size={12} color="#dc2626" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ══════════════════════════════════════════════════════════════
            CARD 6 — Room history
        ══════════════════════════════════════════════════════════════ */}
        <Card delay={0.27} style={{ ...cardStyle, padding: "22px 24px" }}>
          <SectionHeader
            icon={Users}
            title="Salles privées"
            subtitle={myRooms === null ? "Chargement…" : `${myRooms.length} salle${myRooms.length !== 1 ? "s" : ""}`}
            accent="linear-gradient(135deg, #7c3aed, #a78bfa)"
          />

          {myRooms === null ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"24px 0" }}>
              <Spinner />
            </div>
          ) : myRooms.length === 0 ? (
            <Empty icon={Users} title="Aucune salle privée" sub="Crée ou rejoins une salle pour commencer" border={border} />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
              {myRooms.map(room => (
                <div key={room.id} style={{
                  display:"flex", alignItems:"center", gap: 12,
                  padding:"12px 14px", borderRadius: 12,
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  border:`1px solid ${border}`, flexWrap:"wrap",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: room.is_active ? "rgba(16,185,129,0.15)" : `${purple}14`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <Users size={16} color={room.is_active ? "#10b981" : purple} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {room.name}
                      {room.is_host && (
                        <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color:"#f59e0b", background:"rgba(245,158,11,0.12)", padding:"2px 7px", borderRadius: 99, border:"1px solid rgba(245,158,11,0.22)" }}>
                          Hôte
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 3, display:"flex", gap: 8, flexWrap:"wrap" }}>
                      <span>{fmtDate(room.created_at)}</span>
                      <span>· {room.participant_count} participant{room.participant_count !== 1 ? "s" : ""}</span>
                      <span>· {room.total_minutes} min</span>
                    </div>
                  </div>
                  {room.is_active && (
                    <button onClick={() => navigate(`/app/study/private/${room.id}`)} style={{
                      padding:"7px 14px", fontSize: 12, fontWeight: 700, flexShrink: 0,
                      background:"linear-gradient(135deg,#7c3aed,#a78bfa)",
                      color:"#fff", border:"none", borderRadius: 9, cursor:"pointer",
                    }}>
                      Rejoindre
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ══════════════════════════════════════════════════════════════
            CARD 7 — Schools chat history
        ══════════════════════════════════════════════════════════════ */}
        <Card delay={0.32} style={{ ...cardStyle, padding: "22px 24px" }}>
          <SectionHeader
            icon={MessageSquare}
            title="Guide des Écoles"
            subtitle={schoolsHistory === null ? "Chargement…" : `${schoolsHistory.length} question${schoolsHistory.length !== 1 ? "s" : ""} récentes`}
            accent="linear-gradient(135deg, #3b82f6, #60a5fa)"
          />

          {schoolsHistory === null ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"24px 0" }}>
              <Spinner color="#3b82f6" />
            </div>
          ) : schoolsHistory.length === 0 ? (
            <Empty icon={MessageSquare} title="Aucune conversation" sub="Pose une question dans le Guide des Écoles" color="#3b82f6" border={border} />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
              {schoolsHistory.map((h, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"flex-start", gap: 12,
                  padding:"12px 14px", borderRadius: 12,
                  background: isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.04)",
                  border:`1px solid ${isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)"}`,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 1,
                    background:"rgba(59,130,246,0.15)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: 11, fontWeight: 800, color:"#3b82f6",
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {h.question}
                    </div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 3 }}>{fmtDate(h.created_at)}</div>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate("/app/schools")} style={{
                marginTop: 4, width:"100%", padding:"10px", fontSize: 13, fontWeight: 700,
                background: isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.07)",
                color:"#3b82f6", border:"1px solid rgba(59,130,246,0.2)",
                borderRadius: 12, cursor:"pointer",
              }}>
                Continuer à explorer les écoles →
              </button>
            </div>
          )}
        </Card>

      </div>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
