import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { ArrowLeft, ArrowRight, CheckCircle, ChevronDown, ChevronUp, Home } from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────

const BAC_OPTIONS = [
  { id: "Bac Sciences Maths A",            label: "Bac Sciences Maths A",            emoji: "📐" },
  { id: "Bac Sciences Maths B",            label: "Bac Sciences Maths B",            emoji: "📐" },
  { id: "Bac Sciences Physiques",          label: "Bac Sciences Physiques",          emoji: "⚗️" },
  { id: "Bac Sciences de la Vie",          label: "Bac Sciences de la Vie",          emoji: "🧬" },
  { id: "Bac Sciences Économiques",        label: "Bac Sciences Économiques",        emoji: "📊" },
  { id: "Bac Lettres & Sciences Humaines", label: "Bac Lettres & Sciences Humaines", emoji: "📖" },
  { id: "Bac Technologie Électrique",      label: "Bac Technologie Électrique",      emoji: "⚡" },
  { id: "BTS / DUT",                       label: "BTS / DUT (bac+2)",               emoji: "🎓" },
];

const DOMAINES = [
  { id: "technologie",             label: "Technologie & Informatique",   emoji: "💻", desc: "Dev, IA, cybersécurité" },
  { id: "ingenierie",              label: "Ingénierie & BTP",             emoji: "⚙️", desc: "Génie civil, mécanique" },
  { id: "business",                label: "Business & Finance",           emoji: "📊", desc: "Commerce, management" },
  { id: "sante",                   label: "Santé & Médecine",             emoji: "🏥", desc: "Médecine, pharmacie" },
  { id: "arts_design",             label: "Architecture & Design",        emoji: "🏛️", desc: "Architecture, urbanisme" },
  { id: "sciences",                label: "Sciences Fondamentales",       emoji: "🔬", desc: "Maths, physique, chimie" },
  { id: "droit_sciences_sociales", label: "Droit & Sciences Sociales",    emoji: "⚖️", desc: "Droit, économie" },
  { id: "communication",           label: "Communication & Marketing",    emoji: "📢", desc: "Média, publicité" },
  { id: "education",               label: "Éducation & Enseignement",     emoji: "📚", desc: "Pédagogie, formation" },
  { id: "environnement",           label: "Environnement & Énergie",      emoji: "🌿", desc: "Développement durable" },
  { id: "tourisme",                label: "Tourisme & Hôtellerie",        emoji: "🏨", desc: "Hôtellerie, restauration" },
];

const PERSONNALITE = [
  { id: "analytique",     label: "Analytique",      emoji: "🧠", desc: "J'adore résoudre des problèmes complexes" },
  { id: "creatif",        label: "Créatif",          emoji: "🎨", desc: "J'aime créer et innover" },
  { id: "leader",         label: "Leader",           emoji: "🌟", desc: "J'aime diriger et motiver les autres" },
  { id: "empathique",     label: "Empathique",       emoji: "💙", desc: "Aider les autres me passionne" },
  { id: "rigoureux",      label: "Rigoureux",        emoji: "📐", desc: "J'aime la précision et l'ordre" },
  { id: "communicant",    label: "Communicant",      emoji: "🗣️", desc: "J'aime parler et convaincre" },
  { id: "entrepreneurial",label: "Entrepreneurial",  emoji: "🚀", desc: "J'aime prendre des risques calculés" },
  { id: "chercheur",      label: "Curieux/Chercheur",emoji: "🔍", desc: "J'aime explorer et apprendre" },
];

const CARRIERES = [
  { id: "ingenieur_dev",      label: "Ingénieur / Développeur",              emoji: "👨‍💻" },
  { id: "medecin",            label: "Médecin / Pharmacien / Dentiste",       emoji: "👨‍⚕️" },
  { id: "manager",            label: "Manager / Directeur",                   emoji: "💼" },
  { id: "entrepreneur",       label: "Entrepreneur",                          emoji: "🚀" },
  { id: "chercheur",          label: "Chercheur / Scientifique",              emoji: "🔬" },
  { id: "enseignant",         label: "Enseignant / Formateur",                emoji: "👨‍🏫" },
  { id: "fonctionnaire",      label: "Fonctionnaire / Diplomate",             emoji: "🏛️" },
  { id: "architecte_designer",label: "Architecte / Designer / Créatif",       emoji: "🎨" },
  { id: "juriste",            label: "Juriste / Avocat / Notaire",            emoji: "⚖️" },
  { id: "economiste",         label: "Économiste / Comptable / Financier",    emoji: "📊" },
  { id: "paramedical",        label: "Infirmier / Paramédical",               emoji: "🏥" },
  { id: "telecoms_cyber",     label: "Télécom / Réseaux / Cybersécurité",     emoji: "📡" },
  { id: "data_ia",            label: "Data Scientist / IA Engineer",          emoji: "🤖" },
  { id: "environnementaliste",label: "Environnementaliste / Agronome",        emoji: "🌿" },
  { id: "tourisme",           label: "Tourisme / Hôtellerie / Restauration",  emoji: "🏨" },
  { id: "product_ux",         label: "Product Manager / UX Designer",         emoji: "📱" },
];

const VILLES = [
  "Casablanca", "Rabat", "Fès", "Marrakech", "Agadir",
  "Tanger", "Oujda", "Meknès", "Kenitra", "Settat", "Autre",
];

const BUDGETS = [
  { id: "public",          label: "Public uniquement",      emoji: "🏛️", desc: "Frais < 1 000 MAD/an" },
  { id: "semi_public",     label: "Semi-public / Boursier", emoji: "📜", desc: "Avec bourse ou aide financière" },
  { id: "prive_abordable", label: "Privé abordable",        emoji: "💳", desc: "15 000 – 40 000 MAD/an" },
  { id: "prive_premium",   label: "Privé premium",          emoji: "💎", desc: "40 000 MAD/an et plus" },
];

const STEP_LABELS = ["Bac & Moyenne", "Domaine", "Personnalité", "Carrière", "Localisation", "Budget"];
const TOTAL_STEPS = 6;

const LOADING_MESSAGES = [
  "🔍 Analyse de ton profil scolaire...",
  "🏫 Comparaison avec 50+ écoles marocaines...",
  "🤖 Calcul de ta compatibilité par IA...",
  "✨ Finalisation de tes recommandations...",
  "📝 Rédaction de tes conseils personnalisés...",
];

const FLOATING_SCHOOLS = ["EMI", "ENSIAS", "ENSA", "Médecine", "ENCG", "CPGE", "INPT", "UM6P", "HEM", "UIR"];

const TYPE_COLORS = {
  engineering:  "#6366f1",
  business:     "#10b981",
  health:       "#ef4444",
  architecture: "#f59e0b",
  preparatoire: "#8b5cf6",
  university:   "#3b82f6",
};
const TYPE_LABELS = {
  engineering:  "Ingénierie",
  business:     "Commerce",
  health:       "Santé",
  architecture: "Architecture",
  preparatoire: "Préparatoire",
  university:   "Université",
};

// ─── Global CSS (injected once) ───────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes confettiFall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
  @keyframes floatUp { 0%{transform:translateY(0) rotate(-4deg);opacity:0.7} 50%{transform:translateY(-22px) rotate(4deg);opacity:1} 100%{transform:translateY(0) rotate(-4deg);opacity:0.7} }
  @keyframes glowPulse { 0%,100%{box-shadow:0 0 30px rgba(124,58,237,0.4),0 0 0 0 rgba(124,58,237,0.2)} 50%{box-shadow:0 0 60px rgba(124,58,237,0.7),0 0 40px rgba(124,58,237,0.15)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
  @keyframes bounceIn { 0%{transform:scale(0.7)} 60%{transform:scale(1.08)} 80%{transform:scale(0.97)} 100%{transform:scale(1)} }
  @keyframes cardHover { from{transform:translateY(0)} to{transform:translateY(-5px)} }
  .ori-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(124,58,237,0.25) !important; }
  .ori-card-sel { animation: bounceIn 0.35s ease both !important; }
`;

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti() {
  const colors = ["#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#3b82f6", "#ec4899", "#fbbf24"];
  const pieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 2.5 + Math.random() * 2,
    size: 5 + Math.random() * 9,
    round: Math.random() > 0.5,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: "-16px",
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.round ? "50%" : "2px",
          animation: `confettiFall ${p.duration}s ${p.delay}s linear forwards`,
        }} />
      ))}
    </div>
  );
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 45 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= text.length) return;
    const t = setTimeout(() => setI((n) => n + 1), speed);
    return () => clearTimeout(t);
  }, [i, text, speed]);
  return (
    <>
      {text.slice(0, i)}
      {i < text.length && <span style={{ animation: "blink 0.8s infinite", opacity: 0.6 }}>|</span>}
    </>
  );
}

// ─── AnimatedRing ─────────────────────────────────────────────────────────────
function AnimatedRing({ target, color, size = 96 }) {
  const [val, setVal] = useState(0);
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  useEffect(() => {
    const start = Date.now();
    const dur = 1600;
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / dur);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (elapsed >= dur) { setVal(target); clearInterval(id); }
    }, 16);
    return () => clearInterval(id);
  }, [target]);
  const offset = circ - (val / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={11} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={11}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.05s linear" }}
      />
      <text x={size/2} y={size/2 + 7} textAnchor="middle" fill="white"
        fontSize={size > 85 ? 20 : 15} fontWeight="800"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}>
        {val}%
      </text>
    </svg>
  );
}

// ─── Collapsible ─────────────────────────────────────────────────────────────
function Collapsible({ label, color, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 14 }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "none", border: "none", cursor: "pointer",
        fontSize: 13, fontWeight: 700, color,
        padding: 0,
      }}>
        💡 {label}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <ul style={{ margin: "10px 0 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
          {children}
        </ul>
      )}
    </div>
  );
}

// ─── GradeInput ───────────────────────────────────────────────────────────────
function GradeInput({ label, value, onChange, emoji, isDark, border }) {
  const num = parseFloat(value);
  const valid = !isNaN(num) && num >= 0 && num <= 20;
  const color = valid ? (num >= 15 ? "#10b981" : num >= 12 ? "#7c3aed" : num >= 10 ? "#f59e0b" : "#ef4444") : "#ef4444";
  function handleBlur(e) {
    const n = parseFloat(e.target.value);
    onChange(isNaN(n) ? "10" : String(Math.min(20, Math.max(0, Math.round(n * 2) / 2))));
  }
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      borderRadius: 12, border: `1px solid ${valid ? border : "rgba(239,68,68,0.4)"}`,
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      transition: "border 0.2s",
    }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isDark ? "#fff" : "#1a1a2e" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <input type="number" min={0} max={20} step={0.5} value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          style={{
            width: 60, padding: "5px 8px", fontSize: 17, fontWeight: 800,
            textAlign: "center", color, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
            borderRadius: 8, outline: "none", appearance: "textfield", MozAppearance: "textfield",
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)" }}>/20</span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || "";

export default function OrientationTest() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [phase, setPhase]           = useState("welcome");
  const [step, setStep]             = useState(1);
  const [direction, setDirection]   = useState(1);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [loadingPct, setLoadingPct] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [results, setResults]       = useState(null);
  const [error, setError]           = useState("");
  const [profileData, setProfileData] = useState(null);

  const [form, setForm] = useState({
    bac: "", moyenne: "14",
    note_maths: "14", note_physique: "14", note_svt: "14", note_francais: "14",
    domaine: "", personnalite: [], carriere: "",
    ville: "", mobility: true, budget: "",
  });

  // ── Pre-fill from profile ──────────────────────────────────────────────────
  useEffect(() => {
    const t = localStorage.getItem("najahi_token");
    if (!t) { setProfileData({}); return; }
    fetch(API_URL + "/api/profile/me", { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const filled = {};
        if (d?.niveau)                   filled.bac     = d.niveau;
        if (d?.moyenne_generale != null) filled.moyenne = String(d.moyenne_generale);
        if (d?.ville)                    filled.ville   = d.ville;
        setProfileData(filled);
        if (Object.keys(filled).length > 0) {
          setForm((f) => ({
            ...f,
            ...(filled.bac     ? { bac: filled.bac }         : {}),
            ...(filled.moyenne ? { moyenne: filled.moyenne }  : {}),
            ...(filled.ville   ? { ville: filled.ville }     : {}),
          }));
        }
      })
      .catch(() => setProfileData({}));
  }, []);

  // ── Loading rotations ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "loading") return;
    const msgId = setInterval(() => setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length), 1100);
    const start = Date.now();
    const barId = setInterval(() => {
      const pct = Math.min(95, ((Date.now() - start) / 4200) * 100);
      setLoadingPct(pct);
      if (pct >= 95) clearInterval(barId);
    }, 50);
    return () => { clearInterval(msgId); clearInterval(barId); };
  }, [phase]);

  // ── Derived step data ──────────────────────────────────────────────────────
  const skipSteps = new Set();
  if (profileData && profileData.bac)   skipSteps.add(1);
  if (profileData && profileData.ville) skipSteps.add(5);
  const visibleSteps    = [1,2,3,4,5,6].filter(s => !skipSteps.has(s));
  const EFFECTIVE_TOTAL = visibleSteps.length;
  const originalStep    = visibleSteps[step - 1] ?? step;

  // ── Navigation ─────────────────────────────────────────────────────────────
  function goNext() {
    setDirection(1);
    if (step < EFFECTIVE_TOTAL) setStep((s) => s + 1);
    else submit();
  }
  function goPrev() {
    setDirection(-1);
    if (step > 1) setStep((s) => s - 1);
    else setPhase("welcome");
  }

  function canNext() {
    if (originalStep === 1) return !!form.bac;
    if (originalStep === 2) return !!form.domaine;
    if (originalStep === 3) return form.personnalite.length > 0;
    if (originalStep === 4) return !!form.carriere;
    if (originalStep === 5) return !!form.ville;
    if (originalStep === 6) return !!form.budget;
    return true;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function submit() {
    setPhase("loading");
    setLoadingMsg(0);
    setLoadingPct(0);

    const t = localStorage.getItem("najahi_token");
    const payload = {
      bac:           form.bac,
      moyenne:       parseFloat(form.moyenne) || 14,
      note_maths:    parseFloat(form.note_maths) || 14,
      note_physique: parseFloat(form.note_physique) || 14,
      note_svt:      parseFloat(form.note_svt) || 14,
      note_francais: parseFloat(form.note_francais) || 14,
      domaine:       form.domaine,
      personnalite:  form.personnalite,
      carriere:      form.carriere,
      ville:         form.ville,
      mobility:      form.mobility,
      budget:        form.budget,
    };

    try {
      await new Promise((r) => setTimeout(r, 4200));
      const res = await fetch(API_URL + "/api/orientation/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoadingPct(100);
      await new Promise((r) => setTimeout(r, 300));
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setPhase("results");
        setTimeout(() => setShowConfetti(true), 200);
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        setError("Aucun résultat. Réessaie en modifiant tes réponses.");
        setPhase("step");
        setStep(TOTAL_STEPS);
      }
    } catch {
      setError("Erreur de connexion au serveur. Réessaie.");
      setPhase("step");
      setStep(TOTAL_STEPS);
    }
  }

  function restart() {
    setPhase("welcome");
    setStep(1);
    setDirection(1);
    setResults(null);
    setError("");
    const base = { bac: "", moyenne: "14", note_maths: "14", note_physique: "14", note_svt: "14", note_francais: "14", domaine: "", personnalite: [], carriere: "", ville: "", mobility: true, budget: "" };
    if (profileData) {
      if (profileData.bac)     base.bac     = profileData.bac;
      if (profileData.moyenne) base.moyenne = profileData.moyenne;
      if (profileData.ville)   base.ville   = profileData.ville;
    }
    setForm(base);
  }

  function togglePersonnalite(id) {
    setForm((f) => {
      const has = f.personnalite.includes(id);
      if (has) return { ...f, personnalite: f.personnalite.filter((x) => x !== id) };
      if (f.personnalite.length >= 2) return f;
      return { ...f, personnalite: [...f.personnalite, id] };
    });
  }

  // ── Theme tokens ───────────────────────────────────────────────────────────
  const bg = isDark
    ? "linear-gradient(145deg, #0a0a1a 0%, #120a2e 40%, #0a1520 100%)"
    : "linear-gradient(145deg, #f5f3ff 0%, #fdf4ff 50%, #f0fdf4 100%)";
  const cardBg  = isDark ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.9)";
  const border  = isDark ? "rgba(255,255,255,0.09)"  : "rgba(0,0,0,0.08)";
  const purple  = "#7c3aed";
  const textMain = isDark ? "#ffffff" : "#1a1a2e";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";

  // ─────────────────────────────────────────────────────────────────────────
  // WELCOME
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>

        {/* Floating school chips */}
        {FLOATING_SCHOOLS.map((name, i) => (
          <div key={name} style={{
            position: "absolute",
            top: `${8 + (i * 9) % 78}%`,
            left: i % 2 === 0 ? `${2 + (i * 6) % 10}%` : `${78 + (i * 4) % 16}%`,
            padding: "5px 14px", borderRadius: 20,
            background: isDark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: purple, fontSize: 12, fontWeight: 700,
            animation: `floatUp ${3.2 + i * 0.35}s ease-in-out infinite`,
            animationDelay: `${i * 0.28}s`,
            backdropFilter: "blur(8px)",
            userSelect: "none",
          }}>{name}</div>
        ))}

        {/* Navbar */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: isDark ? "rgba(10,10,26,0.7)" : "rgba(245,243,255,0.7)", backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${border}`,
        }}>
          <button onClick={() => navigate("/app/dashboard")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <ThemeToggle />
        </div>

        {/* Hero */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 580, animation: "fadeUp 0.7s ease both" }}>
          <div style={{ fontSize: 52, marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(124,58,237,0.4))" }}>🧭</div>
          <h1 style={{
            fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 900, color: textMain,
            marginBottom: 14, lineHeight: 1.2, fontFamily: "'Fraunces', serif",
          }}>
            <Typewriter text="Découvre ta voie idéale" speed={42} />
          </h1>
          <p style={{ fontSize: 16, color: textMuted, marginBottom: 10, lineHeight: 1.65 }}>
            Un test d'orientation intelligent basé sur ton profil, tes passions et tes ambitions.
          </p>
          <p style={{ fontSize: 13, color: textMuted, marginBottom: 36, fontWeight: 600, letterSpacing: 0.5 }}>
            6 étapes · 5 minutes · Résultats IA personnalisés
          </p>

          {profileData && (profileData.bac || profileData.ville) && (
            <div onClick={() => navigate("/app/profile")} style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
              padding: "10px 18px", borderRadius: 20, cursor: "pointer",
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
              color: "#10b981", fontSize: 13, fontWeight: 700,
              transition: "opacity 0.2s",
            }}>
              <CheckCircle size={15} />
              ✓ Nous avons récupéré ton profil :
              {profileData.bac     && ` ${profileData.bac}`}
              {profileData.moyenne && ` · ${profileData.moyenne}/20`}
              {profileData.ville   && ` · ${profileData.ville}`}
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7, marginLeft: 2 }}>→ modifier</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
            {[
              { emoji: "🏫", label: "50+ écoles analysées" },
              { emoji: "🤖", label: "IA Groq llama-70b" },
              { emoji: "🏆", label: "Top 3 recommandations" },
            ].map((f) => (
              <div key={f.label} style={{
                padding: "9px 16px", borderRadius: 12,
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${border}`, fontSize: 13, color: textMain,
                display: "flex", alignItems: "center", gap: 7, fontWeight: 500,
              }}>
                {f.emoji} {f.label}
              </div>
            ))}
          </div>

          <button
            onClick={() => { setPhase("step"); setStep(1); }}
            style={{
              padding: isMobile ? "15px 32px" : "17px 52px", fontSize: 17, fontWeight: 800, width: isMobile ? "100%" : undefined,
              background: `linear-gradient(135deg, ${purple}, #a78bfa)`,
              color: "white", border: "none", borderRadius: 50, cursor: "pointer",
              animation: "glowPulse 2.2s ease-in-out infinite",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.06)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Commencer →
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #0a0a1a, #120a2e)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
        <style>{GLOBAL_CSS}</style>

        {/* Floating school names */}
        {FLOATING_SCHOOLS.map((name, i) => (
          <div key={name} style={{
            position: "absolute",
            top: `${10 + (i * 9) % 75}%`,
            left: i % 2 === 0 ? `${4 + i * 7}%` : `${60 + i * 4}%`,
            color: `rgba(167,139,250,${0.3 + (i % 3) * 0.15})`,
            fontSize: 13, fontWeight: 700,
            animation: `floatUp ${2.5 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.35}s`,
            userSelect: "none",
          }}>{name}</div>
        ))}

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 420 }}>
          {/* Spinning N logo */}
          <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 32px" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              border: "3px solid rgba(124,58,237,0.15)",
              borderTop: `3px solid ${purple}`,
              animation: "spin 1s linear infinite",
              position: "absolute",
            }} />
            <div style={{
              position: "absolute", inset: 8, borderRadius: "50%",
              background: `linear-gradient(135deg, ${purple}, #a78bfa)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 900, color: "white",
              fontFamily: "'Fraunces', serif",
            }}>N</div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 12 }}>
            Analyse en cours…
          </h2>

          <p key={loadingMsg} style={{
            fontSize: 15, color: "#a78bfa", fontWeight: 600,
            minHeight: 26, animation: "fadeUp 0.4s ease both",
          }}>
            {LOADING_MESSAGES[loadingMsg]}
          </p>

          {/* Progress bar */}
          <div style={{ marginTop: 28, height: 6, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 6,
              width: `${loadingPct}%`,
              background: `linear-gradient(90deg, ${purple}, #a78bfa)`,
              transition: "width 0.1s linear",
            }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            {Math.round(loadingPct)}%
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESULTS
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "results" && results) {
    const top      = results[0];
    const topColor = TYPE_COLORS[top.type] || purple;

    return (
      <div style={{ minHeight: "100vh", background: bg, padding: "0 0 60px" }}>
        <style>{GLOBAL_CSS}</style>
        {showConfetti && <Confetti />}

        {/* Navbar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: isDark ? "rgba(10,10,26,0.85)" : "rgba(245,243,255,0.85)", backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${border}`,
        }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: textMain, fontFamily: "'Fraunces', serif" }}>
            🧭 Tes Résultats
          </span>
          <ThemeToggle />
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 16px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32, animation: "fadeUp 0.5s ease both" }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, color: textMain, marginBottom: 8, fontFamily: "'Fraunces', serif" }}>
              Tes résultats sont prêts !
            </h1>
            <p style={{ color: textMuted, fontSize: 15 }}>
              Voici les écoles marocaines qui correspondent le mieux à ton profil
            </p>
          </div>

          {/* TOP CARD */}
          <div style={{
            background: isDark ? `linear-gradient(135deg, ${topColor}20, ${topColor}0d)` : `linear-gradient(135deg, ${topColor}15, ${topColor}08)`,
            border: `2px solid ${topColor}50`,
            borderRadius: 22, padding: 26, marginBottom: 18,
            backdropFilter: "blur(14px)",
            animation: "scaleIn 0.6s ease both",
            boxShadow: `0 12px 48px ${topColor}22`,
          }}>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{
                  display: "inline-block", padding: "4px 13px", borderRadius: 20,
                  background: topColor, color: "white",
                  fontSize: 11, fontWeight: 700, marginBottom: 12,
                  textTransform: "uppercase", letterSpacing: 1,
                }}>
                  ⭐ Meilleure correspondance · {TYPE_LABELS[top.type] || top.type}
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: textMain, marginBottom: 10, lineHeight: 1.3 }}>
                  {top.name}
                </h2>

                {/* Meta badges */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {[
                    `📍 ${top.city.slice(0, 3).join(", ")}${top.city.length > 3 ? "…" : ""}`,
                    top.concours ? "📋 Concours" : "📝 Sur dossier",
                    top.budget === "public" ? "🏛️ Public" : top.budget === "prive" ? "🏢 Privé" : "🤝 Semi-public",
                    top.duration && `⏱️ ${top.duration}`,
                    top.salary_range && `💰 ${top.salary_range}`,
                  ].filter(Boolean).map((m) => (
                    <span key={m} style={{ fontSize: 11, fontWeight: 600, color: textMuted, padding: "3px 8px", borderRadius: 8, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
                      {m}
                    </span>
                  ))}
                </div>

                {/* Pourquoi */}
                <p style={{ fontSize: 14, color: isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.72)", lineHeight: 1.65, marginBottom: 0 }}>
                  {top.pourquoi}
                </p>

                {/* Conseils collapsible */}
                {top.conseils_admission && top.conseils_admission.length > 0 && (
                  <Collapsible label="Conseils d'admission" color={topColor}>
                    {top.conseils_admission.map((c, i) => (
                      <li key={i} style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.73)" : "rgba(0,0,0,0.63)", lineHeight: 1.55 }}>{c}</li>
                    ))}
                  </Collapsible>
                )}

                {/* Career paths */}
                {top.career_paths && top.career_paths.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: textMuted, marginBottom: 7 }}>DÉBOUCHÉS :</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {top.career_paths.map((c) => (
                        <span key={c} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: `${topColor}20`, color: topColor, fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ring */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 4 }}>
                <AnimatedRing target={top.match_pct} color={topColor} size={96} />
                <span style={{ fontSize: 11, color: textMuted, fontWeight: 600 }}>Compatibilité</span>
              </div>
            </div>
          </div>

          {/* ALTERNATIVES */}
          {results.slice(1).map((school, idx) => {
            const color = TYPE_COLORS[school.type] || purple;
            return (
              <div key={school.id} style={{
                background: cardBg, border: `1px solid ${border}`,
                borderRadius: 18, padding: 20, marginBottom: 14,
                backdropFilter: "blur(12px)",
                animation: `slideRight 0.5s ${0.2 + idx * 0.12}s ease both`,
              }}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 20,
                      background: `${color}20`, color, fontSize: 11, fontWeight: 700,
                      marginBottom: 8, textTransform: "uppercase",
                    }}>
                      {idx === 0 ? "🥈 2ème choix" : "🥉 3ème choix"} · {TYPE_LABELS[school.type] || school.type}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: textMain, marginBottom: 7, lineHeight: 1.3 }}>
                      {school.name}
                    </h3>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 9 }}>
                      {[
                        `📍 ${school.city.slice(0, 2).join(", ")}${school.city.length > 2 ? "…" : ""}`,
                        school.concours ? "📋 Concours" : "📝 Dossier",
                      ].map((m) => (
                        <span key={m} style={{ fontSize: 11, fontWeight: 600, color: textMuted }}>{m}</span>
                      ))}
                    </div>
                    <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.55 }}>{school.pourquoi}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <AnimatedRing target={school.match_pct} color={color} size={76} />
                    <span style={{ fontSize: 11, color: textMuted, fontWeight: 600 }}>Compatibilité</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <button onClick={restart} style={{
              padding: "12px 24px", fontSize: 14, fontWeight: 700,
              background: "none", color: textMain,
              border: `1.5px solid ${border}`, borderRadius: 50, cursor: "pointer",
            }}>
              🔄 Refaire le test
            </button>
            <button onClick={() => navigate("/app/schools")} style={{
              padding: "12px 24px", fontSize: 14, fontWeight: 700,
              background: "none", color: purple,
              border: `1.5px solid ${purple}55`, borderRadius: 50, cursor: "pointer",
            }}>
              🏫 Explorer les écoles
            </button>
            <button onClick={() => navigate("/app/dashboard")} style={{
              padding: "12px 24px", fontSize: 14, fontWeight: 700,
              background: `linear-gradient(135deg, ${purple}, #a78bfa)`,
              color: "white", border: "none", borderRadius: 50, cursor: "pointer",
            }}>
              <Home size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEPS
  // ─────────────────────────────────────────────────────────────────────────

  const stepContent = () => {
    const sH = { fontSize: "clamp(17px,3vw,22px)", fontWeight: 800, color: textMain, marginBottom: 8 };
    const sP = { fontSize: 14, color: textMuted, marginBottom: 16 };

    // Step 1 — Bac & Moyenne
    if (originalStep === 1) return (
      <div>
        <h2 style={sH}>Ton niveau scolaire</h2>
        <p style={sP}>Sélectionne ton bac ou diplôme</p>

        {profileData && profileData.bac && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
            padding: "9px 14px", borderRadius: 10,
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            color: "#10b981", fontSize: 13, fontWeight: 600, flexWrap: "wrap",
          }}>
            <CheckCircle size={14} /> Bac et moyenne pré-remplis depuis ton profil — modifiable ci-dessous
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {BAC_OPTIONS.map((b) => {
            const sel = form.bac === b.id;
            return (
              <button key={b.id}
                onClick={() => setForm((f) => ({ ...f, bac: b.id }))}
                className={`ori-card ${sel ? "ori-card-sel" : ""}`}
                style={{
                  padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  background: sel ? `linear-gradient(135deg, ${purple}28, ${purple}14)` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  border: sel ? `2px solid ${purple}` : `1px solid ${border}`,
                  color: textMain, transition: "all 0.18s", textAlign: "left",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{b.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{b.label}</span>
                </div>
                {sel && <CheckCircle size={16} color={purple} />}
              </button>
            );
          })}
        </div>

        {form.bac && (
          <div style={{ padding: "16px", borderRadius: 14, background: isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)", border: `1px solid ${purple}25` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: purple, marginBottom: 12 }}>Moyenne du bac</p>
            <GradeInput label="Moyenne générale" value={form.moyenne} onChange={(v) => setForm((f) => ({ ...f, moyenne: v }))} emoji="📊" isDark={isDark} border={border} />
          </div>
        )}
      </div>
    );

    // Step 2 — Domaine
    if (originalStep === 2) return (
      <div>
        <h2 style={sH}>Quel domaine t'attire le plus ?</h2>
        <p style={sP}>Ce choix est le plus important — sois honnête avec toi-même</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 10 }}>
          {DOMAINES.map((d) => {
            const sel = form.domaine === d.id;
            return (
              <button key={d.id}
                onClick={() => setForm((f) => ({ ...f, domaine: d.id }))}
                className={`ori-card ${sel ? "ori-card-sel" : ""}`}
                style={{
                  padding: "14px 12px", borderRadius: 13, cursor: "pointer", textAlign: "left",
                  background: sel ? `linear-gradient(135deg, ${purple}30, ${purple}18)` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  border: sel ? `2px solid ${purple}` : `1px solid ${border}`,
                  transition: "all 0.18s",
                }}>
                <div style={{ fontSize: 24, marginBottom: 7 }}>{d.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>{d.label}</div>
                <div style={{ fontSize: 11, color: textMuted, marginTop: 3 }}>{d.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    );

    // Step 3 — Personnalité
    if (originalStep === 3) return (
      <div>
        <h2 style={sH}>Quelle est ta personnalité ?</h2>
        <p style={sP}>Choisis jusqu'à 2 traits qui te décrivent le mieux ({form.personnalite.length}/2)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
          {PERSONNALITE.map((p) => {
            const sel = form.personnalite.includes(p.id);
            const disabled = !sel && form.personnalite.length >= 2;
            return (
              <button key={p.id}
                onClick={() => !disabled && togglePersonnalite(p.id)}
                className={`ori-card ${sel ? "ori-card-sel" : ""}`}
                style={{
                  padding: "14px 12px", borderRadius: 13, cursor: disabled ? "not-allowed" : "pointer",
                  textAlign: "left", opacity: disabled ? 0.38 : 1,
                  background: sel ? `linear-gradient(135deg, ${purple}30, ${purple}18)` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  border: sel ? `2px solid ${purple}` : `1px solid ${border}`,
                  transition: "all 0.18s",
                }}>
                <div style={{ fontSize: 24, marginBottom: 7 }}>{p.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>{p.label}</div>
                <div style={{ fontSize: 11, color: textMuted, marginTop: 3 }}>{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    );

    // Step 4 — Carrière
    if (originalStep === 4) return (
      <div>
        <h2 style={sH}>Ton objectif de carrière</h2>
        <p style={sP}>Quel métier te fait rêver ? ({CARRIERES.length} options)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))", gap: 9 }}>
          {CARRIERES.map((c) => {
            const sel = form.carriere === c.id;
            return (
              <button key={c.id}
                onClick={() => setForm((f) => ({ ...f, carriere: c.id }))}
                className={`ori-card ${sel ? "ori-card-sel" : ""}`}
                style={{
                  padding: "13px 11px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                  background: sel ? `linear-gradient(135deg, ${purple}30, ${purple}18)` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  border: sel ? `2px solid ${purple}` : `1px solid ${border}`,
                  transition: "all 0.18s",
                }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{c.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: textMain, lineHeight: 1.3 }}>{c.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    );

    // Step 5 — Localisation
    if (originalStep === 5) return (
      <div>
        <h2 style={sH}>Ta localisation</h2>
        <p style={sP}>Où est-ce que tu habites actuellement ?</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8, marginBottom: 18 }}>
          {VILLES.map((v) => {
            const sel = form.ville === v;
            return (
              <button key={v}
                onClick={() => setForm((f) => ({ ...f, ville: v }))}
                className={`ori-card ${sel ? "ori-card-sel" : ""}`}
                style={{
                  padding: "11px 14px", borderRadius: 11, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: sel ? `linear-gradient(135deg, ${purple}28, ${purple}14)` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  border: sel ? `2px solid ${purple}` : `1px solid ${border}`,
                  color: textMain, transition: "all 0.18s",
                }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>📍 {v}</span>
                {sel && <CheckCircle size={13} color={purple} />}
              </button>
            );
          })}
        </div>

        {form.ville && (
          <div style={{
            padding: "14px 18px", borderRadius: 13,
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            border: `1px solid ${border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: textMain }}>Prêt(e) à déménager ?</div>
              <div style={{ fontSize: 12, color: textMuted }}>Étudier dans une autre ville du Maroc</div>
            </div>
            <button onClick={() => setForm((f) => ({ ...f, mobility: !f.mobility }))} style={{
              width: 46, height: 25, borderRadius: 13, border: "none", cursor: "pointer",
              background: form.mobility ? purple : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"),
              position: "relative", transition: "background 0.25s", flexShrink: 0,
            }}>
              <div style={{
                width: 19, height: 19, borderRadius: "50%", background: "white",
                position: "absolute", top: 3, left: form.mobility ? 24 : 3,
                transition: "left 0.25s",
              }} />
            </button>
          </div>
        )}
      </div>
    );

    // Step 6 — Budget
    if (originalStep === 6) return (
      <div>
        <h2 style={sH}>Ton budget pour les études</h2>
        <p style={sP}>Cela nous aide à filtrer les options réalistes pour toi</p>
        {error && (
          <div style={{ padding: "11px 15px", borderRadius: 10, marginBottom: 14, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {BUDGETS.map((b) => {
            const sel = form.budget === b.id;
            return (
              <button key={b.id}
                onClick={() => setForm((f) => ({ ...f, budget: b.id }))}
                className={`ori-card ${sel ? "ori-card-sel" : ""}`}
                style={{
                  padding: "15px 17px", borderRadius: 13, cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 14,
                  background: sel ? `linear-gradient(135deg, ${purple}28, ${purple}14)` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  border: sel ? `2px solid ${purple}` : `1px solid ${border}`,
                  transition: "all 0.18s",
                }}>
                <span style={{ fontSize: 24 }}>{b.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: textMain }}>{b.label}</div>
                  <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{b.desc}</div>
                </div>
                {sel && <CheckCircle size={17} color={purple} />}
              </button>
            );
          })}
        </div>
      </div>
    );

    return null;
  };

  const animClass = direction > 0 ? "slideRight" : "slideLeft";

  return (
    <div style={{ minHeight: "100vh", background: bg }}>
      <style>{GLOBAL_CSS}</style>

      {/* Sticky top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: isDark ? "rgba(10,10,26,0.88)" : "rgba(245,243,255,0.88)",
        backdropFilter: "blur(16px)", borderBottom: `1px solid ${border}`,
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button onClick={goPrev} style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `1px solid ${border}`, background: cardBg,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: textMain, flexShrink: 0, backdropFilter: "blur(8px)",
        }}>
          <ArrowLeft size={15} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: textMuted }}>Étape {step} / {EFFECTIVE_TOTAL}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: purple }}>{STEP_LABELS[originalStep - 1]}</span>
          </div>
          <div style={{ height: 5, borderRadius: 5, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
            <div style={{
              height: "100%", borderRadius: 5,
              width: `${(step / EFFECTIVE_TOTAL) * 100}%`,
              background: `linear-gradient(90deg, ${purple}, #a78bfa)`,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Profile pre-fill banner */}
        {profileData && (profileData.bac || profileData.ville) && (
          <div style={{ marginBottom: 12, padding: "9px 14px", borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>
              <CheckCircle size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Profil récupéré :{profileData.bac && ` ${profileData.bac}`}{profileData.moyenne && ` · ${profileData.moyenne}/20`}{profileData.ville && ` · ${profileData.ville}`}
            </span>
            <button onClick={() => navigate("/app/profile")} style={{ background: "none", border: "none", cursor: "pointer", color: "#10b981", fontSize: 12, fontWeight: 600, textDecoration: "underline", padding: 0 }}>
              ← Mettre à jour mon profil
            </button>
          </div>
        )}

        {/* Step card */}
        <div
          key={`${step}-${direction}`}
          style={{
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: 20, padding: "26px 22px",
            backdropFilter: "blur(14px)",
            animation: `${animClass} 0.3s ease both`,
            minHeight: 280,
            boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.07)",
          }}
        >
          {stepContent()}
        </div>

        {/* Next button */}
        <div style={{ marginTop: 18, display: "flex", justifyContent: isMobile ? "stretch" : "flex-end" }}>
          <button
            onClick={goNext}
            disabled={!canNext()}
            style={{
              padding: "14px 38px", fontSize: 15, fontWeight: 800, width: isMobile ? "100%" : undefined,
              background: canNext() ? `linear-gradient(135deg, ${purple}, #a78bfa)` : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
              color: canNext() ? "white" : textMuted,
              border: "none", borderRadius: 50,
              cursor: canNext() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s",
              boxShadow: canNext() ? "0 6px 24px rgba(124,58,237,0.35)" : "none",
            }}
          >
            {step === EFFECTIVE_TOTAL ? "Voir mes résultats ✨" : "Suivant"}
            {step < TOTAL_STEPS && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
