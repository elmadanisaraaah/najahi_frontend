import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/Avatar";
import ThemeToggle from "../../components/UI/ThemeToggle";
import {
  ArrowLeft, GraduationCap, Search, MapPin, Send,
  CheckCircle, ToggleLeft, ToggleRight, X, Plus,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

const SCHOOLS = [
  "ENSIAS", "ENSA", "ENSET", "ENIM", "EMI", "EHTP",
  "ENCG", "ISCAE", "HEM", "UIR", "EMSI", "INSEA",
  "Faculté des Sciences", "Faculté de Médecine", "Autre",
];

const FILIERES = [
  "Génie Informatique", "Génie Civil", "Génie Électrique",
  "Génie Mécanique", "Commerce & Management", "Finance",
  "Médecine", "Pharmacie", "Architecture", "Droit", "Autre",
];

export default function Mentors() {
  const { theme }  = useTheme();
  const { user, accessToken } = useAuth();
  const navigate   = useNavigate();
  const dark       = theme === "dark";
  const getToken   = () => accessToken || localStorage.getItem("najahi_token");

  const [mentors,      setMentors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [myMentor,     setMyMentor]     = useState(null);
  const [view,         setView]         = useState("browse"); // browse | register
  const [searchSchool, setSearchSchool] = useState("");
  const [searchFil,    setSearchFil]    = useState("");
  const [contactId,    setContactId]    = useState(null);
  const [contactMsg,   setContactMsg]   = useState("");
  const [sending,      setSending]      = useState(false);
  const [sentIds,      setSentIds]      = useState(new Set());
  const [form,         setForm]         = useState({ school: "", filiere: "", bio: "" });
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState("");
  const [mounted,      setMounted]      = useState(false);

  const bg       = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 50%,#0d1a2e 100%)" : "linear-gradient(135deg,#f0edff 0%,#e8e4ff 50%,#eef2ff 100%)";
  const navBg    = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)";
  const navBdr   = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)";
  const textCol  = dark ? "#fff" : "#1a1625";
  const subCol   = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";
  const cardBg   = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const cardBdr  = dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(124,58,237,0.12)";
  const inputBg  = dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)";
  const inputBd  = dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(124,58,237,0.2)";

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => { fetchMentors(); fetchMyMentor(); }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchSchool) params.set("school", searchSchool);
      if (searchFil)    params.set("filiere", searchFil);
      const res = await fetch(`${API_URL}/api/mentors?${params}`);
      if (res.ok) setMentors(await res.json());
    } catch {} finally { setLoading(false); }
  };

  const fetchMyMentor = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/mentors/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMyMentor(data);
        if (data) setForm({ school: data.school || "", filiere: data.filiere || "", bio: data.bio || "" });
      }
    } catch {}
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const handleSaveProfile = async () => {
    if (!form.school.trim() || !form.filiere.trim()) {
      showToast("École et filière requis"); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/mentors/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Erreur"); return; }
      showToast("Profil mentor enregistré !");
      fetchMyMentor();
      fetchMentors();
      setView("browse");
    } catch { showToast("Erreur réseau"); }
    finally { setSaving(false); }
  };

  const handleToggle = async () => {
    if (!myMentor?.id) return;
    try {
      const res = await fetch(`${API_URL}/api/mentors/${myMentor.id}/toggle`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyMentor(p => ({ ...p, available: data.available }));
        fetchMentors();
      }
    } catch {}
  };

  const handleContact = async () => {
    if (!contactMsg.trim() || !contactId) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/mentors/${contactId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ message: contactMsg }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Erreur"); return; }
      setSentIds(s => new Set([...s, contactId]));
      showToast("Demande envoyée !");
      setContactId(null);
      setContactMsg("");
    } catch { showToast("Erreur réseau"); }
    finally { setSending(false); }
  };

  const filtered = mentors.filter(m => {
    const s = searchSchool.toLowerCase();
    const f = searchFil.toLowerCase();
    return (!s || m.school.toLowerCase().includes(s)) &&
           (!f || m.filiere.toLowerCase().includes(f));
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
        @keyframes mnt-fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .mnt-card:hover{transform:translateY(-3px);box-shadow:${dark ? "0 12px 40px rgba(0,0,0,0.35)" : "0 12px 40px rgba(124,58,237,0.12)"} !important;}
        .mnt-input:focus{border-color:#7c3aed !important;box-shadow:0 0 0 3px rgba(124,58,237,0.12) !important;}
        .mnt-input::placeholder{color:${dark ? "rgba(255,255,255,0.2)" : "rgba(26,22,37,0.25)"};}
        .mnt-btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,0.4);}
        .mnt-tab{transition:all 0.2s;}
        .mnt-tab:hover{color:${textCol} !important;}
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
                <GraduationCap size={16} color="#fff" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: textCol, fontFamily: "'Fraunces',serif" }}>Mentors</span>
            </div>
          </div>
          <ThemeToggle />
        </nav>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>

          {/* Header + tabs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28, animation: mounted ? "mnt-fadeUp 0.4s ease both" : "none" }}>
            <div>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: textCol, marginBottom: 4, letterSpacing: "-0.5px" }}>
                Réseau de mentors Najahi
              </h1>
              <p style={{ color: subCol, fontSize: 14 }}>
                Des étudiants expérimentés prêts à t'accompagner dans ton orientation.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["browse", "register"].map(v => (
                <button key={v} type="button" className="mnt-tab"
                  onClick={() => setView(v)}
                  style={{ padding: "9px 18px", borderRadius: 10, border: view === v ? "none" : `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.2)"}`, background: view === v ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "transparent", color: view === v ? "#fff" : subCol, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  {v === "browse" ? "Explorer" : myMentor ? "Mon profil mentor" : "Devenir mentor"}
                </button>
              ))}
            </div>
          </div>

          {/* ── BROWSE ── */}
          {view === "browse" && (
            <div style={{ animation: "mnt-fadeUp 0.35s ease both" }}>

              {/* My mentor status bar */}
              {myMentor && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "14px 20px", borderRadius: 14, marginBottom: 22, background: dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)", border: `1px solid rgba(124,58,237,0.2)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle size={16} color="#7c3aed" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: textCol }}>Tu es mentor — {myMentor.school} · {myMentor.filiere}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: myMentor.available ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: myMentor.available ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                      {myMentor.available ? "Disponible" : "Indisponible"}
                    </span>
                  </div>
                  <button type="button" onClick={handleToggle}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.2)"}`, background: "transparent", color: subCol, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    {myMentor.available ? <ToggleRight size={14} color="#10b981" /> : <ToggleLeft size={14} />}
                    {myMentor.available ? "Passer indisponible" : "Passer disponible"}
                  </button>
                </div>
              )}

              {/* Filters */}
              <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1 1 220px" }}>
                  <Search size={14} color={subCol} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="mnt-input" type="text"
                    placeholder="Filtrer par école…"
                    value={searchSchool}
                    onChange={e => setSearchSchool(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 34 }}
                  />
                </div>
                <div style={{ position: "relative", flex: "1 1 220px" }}>
                  <Search size={14} color={subCol} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="mnt-input" type="text"
                    placeholder="Filtrer par filière…"
                    value={searchFil}
                    onChange={e => setSearchFil(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 34 }}
                  />
                </div>
                <button type="button" onClick={fetchMentors}
                  style={{ padding: "11px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>
                  Rechercher
                </button>
              </div>

              {/* Grid */}
              {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: subCol, fontSize: 14 }}>Chargement…</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: subCol }}>
                  <GraduationCap size={40} style={{ marginBottom: 12, opacity: 0.35 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, color: textCol, marginBottom: 6 }}>Aucun mentor trouvé</div>
                  <div style={{ fontSize: 13 }}>Sois le premier à devenir mentor !</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
                  {filtered.map(m => {
                    const name = [m.prenom, m.nom].filter(Boolean).join(" ") || "Mentor";
                    const isMine = myMentor?.id === m.id;
                    return (
                      <div key={m.id} className="mnt-card"
                        style={{ background: cardBg, backdropFilter: "blur(20px)", border: cardBdr, borderRadius: 18, padding: "22px 20px", transition: "all 0.25s", boxShadow: dark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 4px 16px rgba(124,58,237,0.06)" }}>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                          <Avatar src={m.avatar_url} name={name} size={48} borderRadius={13} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: textCol, marginBottom: 2 }}>{name}</div>
                            <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 4 }}>{m.school}</div>
                            {m.ville && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: subCol }}>
                                <MapPin size={10} /> {m.ville}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, background: m.available ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: m.available ? "#10b981" : "#ef4444", fontWeight: 700, flexShrink: 0 }}>
                            {m.available ? "Dispo" : "Occupé"}
                          </span>
                        </div>

                        <div style={{ padding: "8px 12px", borderRadius: 9, background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)", marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, marginBottom: 3 }}>Filière</div>
                          <div style={{ fontSize: 13, color: textCol }}>{m.filiere}</div>
                        </div>

                        {m.bio && (
                          <p style={{ fontSize: 13, color: subCol, lineHeight: 1.55, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {m.bio}
                          </p>
                        )}

                        {!isMine && m.available && (
                          <button type="button"
                            onClick={() => { setContactId(m.id); setContactMsg(""); }}
                            disabled={sentIds.has(m.id)}
                            style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: sentIds.has(m.id) ? "rgba(16,185,129,0.12)" : "linear-gradient(135deg,#7c3aed,#a78bfa)", color: sentIds.has(m.id) ? "#10b981" : "#fff", fontSize: 13, fontWeight: 600, cursor: sentIds.has(m.id) ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                            {sentIds.has(m.id) ? <><CheckCircle size={14} /> Demande envoyée</> : <><Send size={13} /> Contacter</>}
                          </button>
                        )}
                        {isMine && (
                          <div style={{ textAlign: "center", fontSize: 12, color: subCol, padding: "8px 0" }}>Ton profil mentor</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── REGISTER / EDIT ── */}
          {view === "register" && (
            <div style={{ maxWidth: 520, margin: "0 auto", animation: "mnt-fadeUp 0.35s ease both" }}>
              <div style={{ background: cardBg, backdropFilter: "blur(24px)", border: cardBdr, borderRadius: 22, padding: "32px 28px", boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.3)" : "0 8px 40px rgba(124,58,237,0.1)" }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: textCol, marginBottom: 6 }}>
                  {myMentor ? "Modifier mon profil mentor" : "Devenir mentor"}
                </h2>
                <p style={{ fontSize: 13, color: subCol, marginBottom: 26, lineHeight: 1.6 }}>
                  Partage ton expérience avec d'autres étudiants. Tu recevras des notifications lorsque quelqu'un souhaite te contacter.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subCol, display: "block", marginBottom: 6 }}>École *</label>
                    <select className="mnt-input"
                      value={form.school}
                      onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                      style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="">Choisir une école…</option>
                      {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subCol, display: "block", marginBottom: 6 }}>Filière *</label>
                    <select className="mnt-input"
                      value={form.filiere}
                      onChange={e => setForm(f => ({ ...f, filiere: e.target.value }))}
                      style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="">Choisir une filière…</option>
                      {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: subCol, display: "block", marginBottom: 6 }}>
                      Bio <span style={{ color: subCol, fontWeight: 400 }}>(optionnelle, max 500 caractères)</span>
                    </label>
                    <textarea className="mnt-input"
                      placeholder="Décris ton parcours, tes conseils, ta disponibilité…"
                      value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      maxLength={500}
                      rows={4}
                      style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                    />
                    <div style={{ textAlign: "right", fontSize: 11, color: subCol, marginTop: 4 }}>{form.bio.length}/500</div>
                  </div>

                  <button type="button" className="mnt-btn-primary"
                    onClick={handleSaveProfile}
                    disabled={!form.school || !form.filiere || saving}
                    style={{ padding: "13px", borderRadius: 12, border: "none", background: form.school && form.filiere ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "rgba(124,58,237,0.3)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: form.school && form.filiere ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", transition: "all 0.25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {saving ? "Enregistrement…" : <><CheckCircle size={16} /> {myMentor ? "Mettre à jour" : "Devenir mentor"}</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact modal */}
      {contactId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: dark ? "#1a1030" : "#fff", borderRadius: 20, padding: "28px 28px", maxWidth: 460, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", animation: "mnt-fadeUp 0.25s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: textCol, margin: 0 }}>Envoyer une demande</h3>
              <button type="button" onClick={() => setContactId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: subCol, display: "flex" }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: subCol, marginBottom: 16, lineHeight: 1.55 }}>
              Explique brièvement ta situation et pourquoi tu souhaites être accompagné. Le mentor recevra une notification.
            </p>
            <textarea
              className="mnt-input"
              placeholder="Bonjour, je prépare le concours ENSIAS et j'aimerais avoir des conseils sur…"
              value={contactMsg}
              onChange={e => setContactMsg(e.target.value)}
              maxLength={500}
              rows={5}
              autoFocus
              style={{ ...inputStyle, resize: "vertical", marginBottom: 16, width: "100%" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setContactId(null)}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, background: "transparent", color: subCol, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                Annuler
              </button>
              <button type="button" onClick={handleContact}
                disabled={!contactMsg.trim() || sending}
                style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: contactMsg.trim() ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "rgba(124,58,237,0.3)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: contactMsg.trim() ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                {sending ? "Envoi…" : <><Send size={14} /> Envoyer la demande</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#10b981", color: "#fff", padding: "11px 22px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,0.18)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </>
  );
}
