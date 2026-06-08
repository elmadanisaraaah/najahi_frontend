import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import {
  ArrowLeft, Pencil, Save, X, Upload, Trash2, Download,
  FileText, User, MapPin, GraduationCap, BookOpen, Compass,
  Clock, Users, CheckCircle, AlertCircle, Camera,
} from "lucide-react";

const API = (path) => `${import.meta.env.VITE_API_URL || ""}/api/profile${path}`;
const token = () => localStorage.getItem("najahi_token") || "";
const authH = () => ({ Authorization: `Bearer ${token()}` });

const BAC_TYPES = [
  "Bac Sciences Maths A",
  "Bac Sciences Maths B",
  "Bac Sciences Physiques",
  "Bac Sciences de la Vie",
  "Bac Sciences Économiques",
  "Bac Lettres & Sciences Humaines",
  "Bac Technologie Électrique",
  "BTS / DUT",
  "Autre",
];

const VILLES = [
  "Casablanca", "Rabat", "Fès", "Marrakech", "Agadir",
  "Tanger", "Oujda", "Meknès", "Kenitra", "Settat", "Autre",
];

// ── helpers ──────────────────────────────────────────────────────────────────

function initials(prenom, nom) {
  return `${(prenom || "?")[0]}${(nom || "?")[0]}`.toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = type === "error" ? "#ef4444" : "#10b981";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 999,
      background: bg, color: "white",
      padding: "12px 22px", borderRadius: 12,
      fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      animation: "slideInRight 0.3s ease",
    }}>
      {msg}
    </div>
  );
}

// ── AvatarZone ────────────────────────────────────────────────────────────────

function AvatarZone({ profile, onUpload, uploading }) {
  const fileRef = useRef();
  const src = profile?.avatar_url
    ? (profile.avatar_url.startsWith("http") ? profile.avatar_url : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${profile.avatar_url}`)
    : null;

  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          width: 88, height: 88, borderRadius: "50%", cursor: "pointer",
          background: src ? "transparent" : "linear-gradient(135deg, #7c3aed, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 800, color: "white",
          overflow: "hidden",
          boxShadow: "0 0 0 3px rgba(124,58,237,0.4)",
          transition: "box-shadow 0.2s",
          position: "relative",
        }}
      >
        {src ? (
          <img src={src} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials(profile?.prenom, profile?.nom)
        )}
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0, transition: "opacity 0.2s",
        }}
          className="avatar-overlay"
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
        >
          <Camera size={20} color="white" />
        </div>
      </div>
      {uploading && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "rgba(124,58,237,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.3)",
            borderTop: "3px solid white",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
    </div>
  );
}

// ── Field Row ─────────────────────────────────────────────────────────────────

function Field({ icon: Icon, label, value, editMode, field, editData, onChange, type = "text", options, isDark, border, textMain, textMuted }) {
  const inputBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)";
  const displayed = value || "—";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 0",
      borderBottom: `1px solid ${border}`,
    }}>
      <Icon size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
      <span style={{ width: 110, fontSize: 12, color: textMuted, flexShrink: 0 }}>{label}</span>
      {editMode ? (
        options ? (
          <select
            value={editData[field] ?? ""}
            onChange={(e) => onChange(field, e.target.value)}
            style={{
              flex: 1, padding: "6px 10px", fontSize: 14, fontWeight: 500,
              color: textMain, background: inputBg,
              border: `1px solid ${border}`, borderRadius: 8, outline: "none",
            }}
          >
            <option value="">Sélectionner…</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={editData[field] ?? ""}
            onChange={(e) => onChange(field, e.target.value)}
            min={type === "number" ? 0 : undefined}
            max={type === "number" ? 20 : undefined}
            step={type === "number" ? 0.25 : undefined}
            style={{
              flex: 1, padding: "6px 10px", fontSize: 14, fontWeight: 500,
              color: textMain, background: inputBg,
              border: `1px solid ${border}`, borderRadius: 8, outline: "none",
            }}
          />
        )
      ) : (
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: textMain }}>{displayed}</span>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bulletins, setBulletins] = useState([]);
  const [bulletinLoading, setBulletinLoading] = useState(false);
  const [bulletinUploading, setBulletinUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [orientResult, setOrientResult] = useState(undefined);
  const bulletinRef = useRef();

  // colors
  const bg = isDark
    ? "linear-gradient(160deg, #0d0d1f 0%, #110d2b 50%, #0d1a1f 100%)"
    : "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0fdf4 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const border = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
  const textMain = isDark ? "#fff" : "#1a1a2e";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const purple = "#7c3aed";

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  }

  // ── fetch ──────────────────────────────────────────────────────────────────

  async function fetchProfile() {
    try {
      const res = await fetch(API("/me"), { headers: authH() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(data);
      setEditData({
        prenom: data.prenom || "",
        nom: data.nom || "",
        ville: data.ville || "",
        niveau: data.niveau || "",
        moyenne_generale: data.moyenne_generale ?? "",
        telephone: data.telephone || "",
      });
    } catch {
      showToast("Erreur lors du chargement du profil", "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBulletins() {
    try {
      const res = await fetch(API("/bulletins"), { headers: authH() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBulletins(data.bulletins || []);
    } catch {
      // silent
    }
  }

  async function fetchOrientResult() {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/orientation/my-result", { headers: authH() });
      if (!res.ok) { setOrientResult(null); return; }
      const data = await res.json();
      setOrientResult(data.result || null);
    } catch {
      setOrientResult(null);
    }
  }

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => {
    fetchProfile();
    fetchBulletins();
    fetchOrientResult();
  }, []);

  // ── save profile ───────────────────────────────────────────────────────────

  async function saveProfile() {
    setSaving(true);
    try {
      const payload = {
        prenom: editData.prenom,
        nom: editData.nom,
        ville: editData.ville,
        niveau: editData.niveau,
        telephone: editData.telephone,
      };
      if (editData.moyenne_generale !== "" && editData.moyenne_generale !== null) {
        const v = parseFloat(editData.moyenne_generale);
        if (!isNaN(v)) payload.moyenne_generale = Math.min(20, Math.max(0, v));
      }

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

  // ── avatar ─────────────────────────────────────────────────────────────────

  async function uploadAvatar(file) {
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/profile/avatar", {
        method: "POST",
        headers: authH(),
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erreur");
      }
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
    if (bulletins.length >= 5) {
      showToast("Maximum 5 bulletins autorisés", "error");
      return;
    }
    setBulletinUploading(true);
    try {
      const fd = new FormData();
      fd.append("bulletin", file);
      const res = await fetch(API("/upload-bulletin"), {
        method: "POST",
        headers: authH(),
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      await fetchBulletins();
      showToast("Bulletin ajouté ✓");
    } catch (e) {
      showToast(e.message || "Erreur lors de l'upload", "error");
    } finally {
      setBulletinUploading(false);
      if (bulletinRef.current) bulletinRef.current.value = "";
    }
  }

  async function deleteBulletin(id) {
    setDeletingId(id);
    try {
      const res = await fetch(API(`/bulletin/${id}`), {
        method: "DELETE",
        headers: authH(),
      });
      if (!res.ok) throw new Error();
      setBulletins((b) => b.filter((x) => x.id !== id));
      showToast("Bulletin supprimé");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function downloadBulletin(id, name) {
    try {
      const res = await fetch(API(`/bulletin/${id}/download`), { headers: authH() });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Erreur lors du téléchargement", "error");
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(124,58,237,0.2)",
          borderTop: "3px solid #7c3aed",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const fullName = [profile?.prenom, profile?.nom].filter(Boolean).join(" ") || "Étudiant";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        input:focus, select:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
        .bulletin-row:hover { background: rgba(124,58,237,0.06) !important; }
      `}</style>

      {/* ── Navbar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: isDark ? "rgba(13,13,31,0.85)" : "rgba(245,243,255,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${border}`,
        display: "flex", alignItems: "center", gap: 14,
        padding: isMobile ? "10px 14px" : "14px 24px",
        overflow: "hidden",
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
        <span style={{
          fontSize: 18, fontWeight: 800, color: textMain,
          fontFamily: "'Fraunces', serif", flex: 1,
        }}>
          Mon Profil
        </span>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — Profile Info
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 20,
          backdropFilter: "blur(16px)",
          overflow: "hidden",
          marginBottom: 20,
          animation: "fadeUp 0.5s ease both",
          boxShadow: isDark
            ? "0 8px 40px rgba(124,58,237,0.12)"
            : "0 4px 24px rgba(0,0,0,0.07)",
        }}>
          {/* Card header gradient */}
          <div style={{
            height: 80,
            background: "linear-gradient(135deg, #7c3aed22, #a78bfa11)",
            borderBottom: `1px solid ${border}`,
          }} />

          <div style={{ padding: "0 24px 24px" }}>
            {/* Avatar + name row */}
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 18, flexWrap: "wrap",
              marginTop: isMobile ? -20 : -44, marginBottom: 20,
            }}>
              <AvatarZone
                profile={profile}
                onUpload={uploadAvatar}
                uploading={avatarUploading}
              />
              <div style={{ paddingBottom: 4 }}>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: textMain,
                  fontFamily: "'Fraunces', serif",
                }}>{fullName}</div>
                <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>
                  {profile?.email}
                </div>
              </div>
              <div style={{ marginLeft: "auto", paddingBottom: 4, display: "flex", gap: 8 }}>
                {editMode ? (
                  <>
                    <button
                      onClick={() => { setEditMode(false); }}
                      style={{
                        padding: "8px 16px", fontSize: 13, fontWeight: 600,
                        background: "none", border: `1px solid ${border}`,
                        borderRadius: 10, cursor: "pointer", color: textMuted,
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      <X size={14} /> Annuler
                    </button>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      style={{
                        padding: "8px 16px", fontSize: 13, fontWeight: 700,
                        background: purple, color: "white",
                        border: "none", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? (
                        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", animation: "spin 0.8s linear infinite" }} />
                      ) : <Save size={14} />}
                      Enregistrer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    style={{
                      padding: "8px 16px", fontSize: 13, fontWeight: 700,
                      background: `${purple}18`, color: purple,
                      border: `1px solid ${purple}44`,
                      borderRadius: 10, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <Pencil size={14} /> Modifier
                  </button>
                )}
              </div>
            </div>

            {/* Fields */}
            <Field icon={User}         label="Prénom"     field="prenom"           value={profile?.prenom}          editMode={editMode} editData={editData} onChange={(f,v) => setEditData(d => ({...d,[f]:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
            <Field icon={User}         label="Nom"        field="nom"              value={profile?.nom}             editMode={editMode} editData={editData} onChange={(f,v) => setEditData(d => ({...d,[f]:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
            <Field icon={MapPin}       label="Ville"      field="ville"            value={profile?.ville}           editMode={editMode} editData={editData} onChange={(f,v) => setEditData(d => ({...d,[f]:v}))} options={VILLES}  isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
            <Field icon={GraduationCap} label="Type de Bac" field="niveau"         value={profile?.niveau}          editMode={editMode} editData={editData} onChange={(f,v) => setEditData(d => ({...d,[f]:v}))} options={BAC_TYPES} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
            <Field icon={BookOpen}     label="Note Bac"   field="moyenne_generale" value={profile?.moyenne_generale != null ? `${profile.moyenne_generale}/20` : null} editMode={editMode} editData={editData} onChange={(f,v) => setEditData(d => ({...d,[f]:v}))} type="number" isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />

            <div style={{
              padding: "12px 0 0",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <User size={16} color={purple} style={{ flexShrink: 0 }} />
              <span style={{ width: 130, fontSize: 13, color: textMuted, flexShrink: 0 }}>Email</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: textMain }}>{profile?.email}</span>
            </div>

            {editMode && (
              <div style={{ marginTop: 16 }}>
                <Field icon={User} label="Téléphone" field="telephone" value={profile?.telephone} editMode={editMode} editData={editData} onChange={(f,v) => setEditData(d => ({...d,[f]:v}))} isDark={isDark} border={border} textMain={textMain} textMuted={textMuted} />
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — Dashboard mini cards
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 20,
          animation: "fadeUp 0.5s 0.1s ease both",
        }}>
          {/* Study With Me card */}
          <div style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 22,
            backdropFilter: "blur(16px)",
            boxShadow: isDark ? "0 4px 24px rgba(124,58,237,0.08)" : "0 2px 16px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BookOpen size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: textMain }}>Study With Me 📚</div>
                <div style={{ fontSize: 11, color: textMuted }}>Statistiques de travail</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {[
                { icon: Clock, label: "Heures", value: "—" },
                { icon: Users, label: "Sessions", value: "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{
                  flex: 1, padding: "10px 12px", borderRadius: 12,
                  background: isDark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)",
                  border: `1px solid rgba(124,58,237,0.15)`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: purple }}>{value}</div>
                  <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: textMuted, marginBottom: 14 }}>
              Dernière session : <span style={{ color: textMain, fontWeight: 600 }}>—</span>
            </div>

            <button
              onClick={() => navigate("/app/servers")}
              style={{
                width: "100%", padding: "10px", fontSize: 13, fontWeight: 700,
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                color: "white", border: "none", borderRadius: 12, cursor: "pointer",
              }}
            >
              Rejoindre un stream →
            </button>
          </div>

          {/* Orientation card */}
          <div style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 22,
            backdropFilter: "blur(16px)",
            boxShadow: isDark ? "0 4px 24px rgba(124,58,237,0.08)" : "0 2px 16px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg, #059669, #34d399)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Compass size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: textMain }}>Test d'Orientation 🧭</div>
                <div style={{ fontSize: 11, color: textMuted }}>Recommandations IA</div>
              </div>
            </div>

            {orientResult ? (
              <>
                <div style={{
                  padding: "14px", borderRadius: 12,
                  background: isDark ? "rgba(5,150,105,0.08)" : "rgba(5,150,105,0.05)",
                  border: "1px solid rgba(5,150,105,0.15)",
                  marginBottom: 14,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 20 }}>
                      {{"engineering":"🏗️","business":"📊","health":"🏥","architecture":"🏛️","preparatoire":"📖","university":"🎓"}[orientResult.filiere] || "🎓"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: textMain, lineHeight: 1.3 }}>
                        {orientResult.ecole}
                      </div>
                      <span style={{
                        display: "inline-block", marginTop: 4,
                        fontSize: 10, fontWeight: 700, color: purple,
                        background: `${purple}18`, padding: "2px 8px",
                        borderRadius: 99, border: `1px solid ${purple}33`,
                      }}>
                        {{"engineering":"Ingénierie","business":"Business","health":"Médecine & Santé","architecture":"Architecture","preparatoire":"Classes Prépa","university":"Université"}[orientResult.filiere] || orientResult.filiere}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: textMuted }}>Compatibilité</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>{orientResult.confidence}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${orientResult.confidence}%`, background: "linear-gradient(90deg, #059669, #34d399)", borderRadius: 99, transition: "width 1s ease" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: textMuted }}>
                    Testé le {orientResult.created_at ? new Date(orientResult.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </div>
                </div>
                <button
                  onClick={() => navigate("/app/orientation")}
                  style={{
                    width: "100%", padding: "10px", fontSize: 13, fontWeight: 700,
                    background: isDark ? "rgba(5,150,105,0.15)" : "rgba(5,150,105,0.1)",
                    color: "#059669", border: "1px solid rgba(5,150,105,0.25)",
                    borderRadius: 12, cursor: "pointer",
                  }}
                >
                  Refaire le test →
                </button>
              </>
            ) : (
              <>
                <div style={{
                  padding: "14px", borderRadius: 12,
                  background: isDark ? "rgba(5,150,105,0.08)" : "rgba(5,150,105,0.05)",
                  border: "1px solid rgba(5,150,105,0.15)",
                  marginBottom: 14,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <AlertCircle size={18} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textMain }}>
                      Aucun test effectué
                    </div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>
                      Découvre l'école qui te correspond
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/app/orientation")}
                  style={{
                    width: "100%", padding: "10px", fontSize: 13, fontWeight: 700,
                    background: "linear-gradient(135deg, #059669, #34d399)",
                    color: "white", border: "none", borderRadius: 12, cursor: "pointer",
                  }}
                >
                  Faire le test →
                </button>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — Bulletins
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 20,
          padding: 24,
          backdropFilter: "blur(16px)",
          animation: "fadeUp 0.5s 0.2s ease both",
          boxShadow: isDark ? "0 4px 24px rgba(124,58,237,0.08)" : "0 2px 16px rgba(0,0,0,0.05)",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg, #dc2626, #f87171)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileText size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: textMain }}>Bulletins Scolaires</div>
                <div style={{ fontSize: 11, color: textMuted }}>{bulletins.length} / 5 bulletins</div>
              </div>
            </div>

            <button
              onClick={() => bulletinRef.current?.click()}
              disabled={bulletinUploading || bulletins.length >= 5}
              style={{
                padding: "9px 18px", fontSize: 13, fontWeight: 700,
                background: bulletins.length >= 5 ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)") : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                color: bulletins.length >= 5 ? textMuted : "white",
                border: "none", borderRadius: 12,
                cursor: (bulletinUploading || bulletins.length >= 5) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 7,
                opacity: bulletinUploading ? 0.7 : 1,
              }}
            >
              {bulletinUploading ? (
                <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", animation: "spin 0.8s linear infinite" }} />
              ) : <Upload size={13} />}
              {bulletins.length >= 5 ? "Limite atteinte" : "Ajouter un bulletin"}
            </button>
            <input
              ref={bulletinRef}
              type="file"
              accept="application/pdf,.pdf"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && uploadBulletin(e.target.files[0])}
            />
          </div>

          {/* Progress bar */}
          <div style={{
            height: 4, borderRadius: 4, marginBottom: 20,
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${(bulletins.length / 5) * 100}%`,
              background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
              transition: "width 0.4s ease",
            }} />
          </div>

          {/* List */}
          {bulletins.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "36px 0",
              border: `2px dashed ${border}`, borderRadius: 14,
            }}>
              <FileText size={36} color={textMuted} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 14, color: textMuted }}>Aucun bulletin ajouté</div>
              <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>
                Formats acceptés : PDF · Max 10 MB · Max 5 bulletins
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bulletins.map((b) => (
                <div
                  key={b.id}
                  className="bulletin-row"
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${border}`,
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: "rgba(220,38,38,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FileText size={16} color="#dc2626" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: textMain,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {b.original_name}
                    </div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>
                      {fmtDate(b.uploaded_at)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => downloadBulletin(b.id, b.original_name)}
                      title="Télécharger"
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`,
                        background: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: textMuted, transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = purple; e.currentTarget.style.borderColor = purple; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; e.currentTarget.style.borderColor = border; }}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => deleteBulletin(b.id)}
                      disabled={deletingId === b.id}
                      title="Supprimer"
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(220,38,38,0.25)",
                        background: "none", cursor: deletingId === b.id ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#dc2626", transition: "all 0.15s",
                        opacity: deletingId === b.id ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                    >
                      {deletingId === b.id ? (
                        <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(220,38,38,0.3)", borderTop: "2px solid #dc2626", animation: "spin 0.8s linear infinite" }} />
                      ) : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
