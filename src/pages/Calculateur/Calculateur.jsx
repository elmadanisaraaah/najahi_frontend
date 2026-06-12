import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, RotateCcw, Target, CheckCircle,
  GraduationCap, Settings2, Monitor, Settings, Radio,
  BarChart3, TrendingUp, Stethoscope, Zap, Globe,
  Briefcase, Building2, Wrench, Ruler, FlaskConical, Leaf,
  BookOpen, Lightbulb, X,
} from "lucide-react";

// ── Theme ────────────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem("najahi_theme");
    return s ? s === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    localStorage.setItem("najahi_theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark];
}

// ── Schools database ─────────────────────────────────────────────────────────
const SCHOOLS = [
  {
    id: "cpge",
    name: "CPGE",
    full: "Classes Préparatoires aux Grandes Écoles",
    icon: GraduationCap,
    domain: "Prépa",
    domainColor: "#8b5cf6",
    required_note: 17,
    required_bac: ["Sciences Maths", "Sciences Physiques"],
    accepts_all: false,
    requires_cpge: false,
    cpge_bonus: false,
    tip_low:  "La CPGE est très sélective (17+). Consolide tes bases en maths et physique avant le bac.",
    tip_mid:  "Tu es proche du seuil ! Une préparation intensive les derniers mois peut faire la différence.",
    tip_high: "Excellent profil pour la CPGE ! Prépare bien ton dossier et tes lettres de motivation.",
  },
  {
    id: "ensa",
    name: "ENSA",
    full: "École Nationale des Sciences Appliquées",
    icon: Settings2,
    domain: "Ingénierie",
    domainColor: "#3b82f6",
    required_note: 15,
    required_bac: ["Sciences Maths", "Sciences Physiques"],
    accepts_all: false,
    requires_cpge: false,
    cpge_bonus: true,
    tip_low:  "ENSA exige 15+ en bac SM ou SP. Mets l'accent sur les maths et les sciences.",
    tip_mid:  "Profil prometteur ! La CPGE renforcerait considérablement ton dossier pour l'ENSA.",
    tip_high: "Très bon profil pour l'ENSA ! Avec la CPGE, tes chances sont encore plus élevées.",
  },
  {
    id: "ensias",
    name: "ENSIAS",
    full: "École Nationale Supérieure d'Informatique",
    icon: Monitor,
    domain: "Ingénierie",
    domainColor: "#3b82f6",
    required_note: 16,
    required_bac: ["Sciences Maths"],
    accepts_all: false,
    requires_cpge: true,
    cpge_bonus: true,
    tip_low:  "ENSIAS est accessible via le CNC après CPGE (bac SM requis, 16+). C'est un parcours en deux étapes.",
    tip_mid:  "Intègre une CPGE pour passer le CNC — c'est la voie royale vers ENSIAS.",
    tip_high: "Super profil ! Prépare ta CPGE et vise le CNC pour ENSIAS.",
  },
  {
    id: "emi",
    name: "EMI",
    full: "École Mohammadia d'Ingénieurs",
    icon: Settings,
    domain: "Ingénierie",
    domainColor: "#3b82f6",
    required_note: 16,
    required_bac: ["Sciences Maths"],
    accepts_all: false,
    requires_cpge: true,
    cpge_bonus: true,
    tip_low:  "EMI (bac SM 16+) est accessible via le CNC. La CPGE est indispensable.",
    tip_mid:  "La CPGE est ta voie principale pour EMI. Vise le CNC avec un bon classement !",
    tip_high: "Excellent profil ! CPGE → CNC → EMI. Tu es sur la bonne trajectoire.",
  },
  {
    id: "inpt",
    name: "INPT",
    full: "Institut National des Postes et Télécommunications",
    icon: Radio,
    domain: "Ingénierie",
    domainColor: "#3b82f6",
    required_note: 15,
    required_bac: ["Sciences Maths", "Sciences Physiques"],
    accepts_all: false,
    requires_cpge: false,
    cpge_bonus: true,
    tip_low:  "INPT exige 15+ en SM ou SP. Renforce tes bases en mathématiques et physique.",
    tip_mid:  "Bon profil pour INPT ! La CPGE augmente sensiblement tes chances d'admission.",
    tip_high: "Profil solide pour INPT ! Prépare bien le concours ou la CPGE.",
  },
  {
    id: "encg",
    name: "ENCG",
    full: "École Nationale de Commerce et de Gestion",
    icon: BarChart3,
    domain: "Commerce",
    domainColor: "#10b981",
    required_note: 14,
    required_bac: ["Sciences Maths", "Sciences Physiques", "SVT", "Sciences Eco"],
    accepts_all: false,
    requires_cpge: false,
    cpge_bonus: false,
    tip_low:  "ENCG accepte plusieurs bacs (SM, SP, SVT, SE) avec 14+. Travaille ta moyenne générale.",
    tip_mid:  "Profil compatible ! Prépare sérieusement le concours ENCG (culture générale + maths).",
    tip_high: "Excellent pour l'ENCG ! Prépare le concours avec confiance.",
  },
  {
    id: "iscae",
    name: "ISCAE",
    full: "Institut Supérieur de Commerce et d'Administration",
    icon: TrendingUp,
    domain: "Commerce",
    domainColor: "#10b981",
    required_note: 16,
    required_bac: ["Sciences Eco", "Sciences Maths"],
    accepts_all: false,
    requires_cpge: false,
    cpge_bonus: false,
    tip_low:  "ISCAE exige 16+ en Sciences Eco ou Maths. Concentre-toi sur ces deux filières.",
    tip_mid:  "Presque ! Un dernier effort pour atteindre 16+ te met dans la course pour l'ISCAE.",
    tip_high: "Super profil pour l'ISCAE ! Prépare le concours avec sérieux.",
  },
  {
    id: "medecine",
    name: "Médecine",
    full: "Facultés de Médecine & Pharmacie",
    icon: Stethoscope,
    domain: "Santé",
    domainColor: "#ef4444",
    required_note: 17,
    required_bac: ["SVT"],
    accepts_all: false,
    requires_cpge: false,
    cpge_bonus: false,
    tip_low:  "Médecine est la filière la plus sélective du Maroc (17+ en SVT obligatoire). Un très long chemin mais noble !",
    tip_mid:  "Très proche ! Un effort sur la biologie et les SVT peut t'ouvrir les portes de la médecine.",
    tip_high: "Excellent profil médecine ! Prépare le concours national avec rigueur.",
  },
  {
    id: "uir",
    name: "UIR",
    full: "Université Internationale de Rabat",
    icon: Globe,
    domain: "Université Privée",
    domainColor: "#f59e0b",
    required_note: 12,
    required_bac: ["Sciences Maths","Sciences Physiques","SVT","Sciences Eco","Lettres","Technique"],
    accepts_all: true,
    requires_cpge: false,
    cpge_bonus: false,
    tip_low:  "L'UIR est accessible à tous les bacs. Renseigne-toi sur les bourses disponibles.",
    tip_mid:  "Bon profil pour l'UIR ! Explore les programmes et les opportunités de financement.",
    tip_high: "Excellent ! Tu peux viser une bourse partielle à l'UIR. Prépare un dossier solide.",
  },
  {
    id: "alakhawayn",
    name: "Al Akhawayn",
    full: "Université Al Akhawayn d'Ifrane",
    icon: Building2,
    domain: "Université Internationale",
    domainColor: "#f97316",
    required_note: 14,
    required_bac: ["Sciences Maths","Sciences Physiques","SVT","Sciences Eco","Lettres","Technique"],
    accepts_all: true,
    requires_cpge: false,
    cpge_bonus: false,
    english_required: true,
    tip_low:  "Al Akhawayn requiert 14+ et un bon niveau d'anglais. Renforce les deux en parallèle.",
    tip_mid:  "Bon profil ! Prépare bien ton anglais (TOEFL/IELTS) pour maximiser tes chances.",
    tip_high: "Excellent ! Prépare ton dossier en anglais et passe les tests de langue.",
  },
  {
    id: "um6p",
    name: "UM6P",
    full: "Université Mohammed VI Polytechnique",
    icon: Zap,
    domain: "Ingénierie",
    domainColor: "#3b82f6",
    required_note: 15,
    required_bac: ["Sciences Maths", "Sciences Physiques"],
    accepts_all: false,
    requires_cpge: false,
    cpge_bonus: true,
    tip_low:  "UM6P exige 15+ en bac scientifique. Une université très innovante et sélective.",
    tip_mid:  "Intéressant profil ! UM6P valorise aussi les projets personnels et la curiosité.",
    tip_high: "Excellent pour UM6P ! Prépare un dossier qui met en valeur tes projets et motivations.",
  },
  {
    id: "bts",
    name: "BTS",
    full: "Brevet de Technicien Supérieur",
    icon: Wrench,
    domain: "Formation Pro",
    domainColor: "#6b7280",
    required_note: 10,
    required_bac: ["Sciences Maths","Sciences Physiques","SVT","Sciences Eco","Lettres","Technique"],
    accepts_all: true,
    requires_cpge: false,
    cpge_bonus: false,
    tip_low:  "Le BTS est accessible avec n'importe quel bac. Choisis une spécialité alignée avec ton projet pro.",
    tip_mid:  "Bon choix ! Le BTS offre une formation pratique et une insertion rapide dans le marché du travail.",
    tip_high: "Profil plus que solide pour le BTS ! Vise les spécialités les plus demandées.",
  },
  {
    id: "ofppt",
    name: "OFPPT",
    full: "Office de la Formation Professionnelle",
    icon: Building2,
    domain: "Formation Pro",
    domainColor: "#6b7280",
    required_note: 10,
    required_bac: ["Sciences Maths","Sciences Physiques","SVT","Sciences Eco","Lettres","Technique"],
    accepts_all: true,
    requires_cpge: false,
    cpge_bonus: false,
    tip_low:  "L'OFPPT est accessible à tous. Excellent choix pour une insertion professionnelle rapide.",
    tip_mid:  "Bon profil ! Choisis une filière en forte demande sur le marché du travail marocain.",
    tip_high: "Ton profil dépasse les exigences de l'OFPPT. Tu peux viser des établissements plus sélectifs.",
  },
];

const BAC_TYPES = [
  { id: "Sciences Maths",    label: "Sciences Maths",    icon: Ruler,        short: "SM" },
  { id: "Sciences Physiques",label: "Sciences Physiques",icon: FlaskConical, short: "SP" },
  { id: "SVT",               label: "Sciences de la Vie",icon: Leaf,         short: "SVT" },
  { id: "Sciences Eco",      label: "Sciences Eco",      icon: TrendingUp,   short: "SE" },
  { id: "Lettres",           label: "Lettres",            icon: BookOpen,     short: "LTT" },
  { id: "Technique",         label: "Technique",          icon: Wrench,       short: "TEC" },
];

const DOMAINS = [
  { id: "Ingénierie",           label: "Ingénierie & Informatique", icon: Settings2 },
  { id: "Commerce",             label: "Commerce & Gestion",        icon: BarChart3 },
  { id: "Santé",                label: "Médecine & Santé",          icon: Stethoscope },
  { id: "Prépa",                label: "Classes Préparatoires",     icon: GraduationCap },
  { id: "Université Privée",    label: "Université Privée",         icon: Building2 },
  { id: "Université Internationale", label: "Université Internationale", icon: Globe },
  { id: "Formation Pro",        label: "Formation Professionnelle", icon: Wrench },
];

// ── Calculation logic ─────────────────────────────────────────────────────────
function calcChance(school, bacType, noteBAC, hasCPGE, noteCPGE) {
  const correctBac = school.accepts_all || school.required_bac.includes(bacType);
  const req = school.required_note;
  let score = ((noteBAC - req) / (20 - req)) * 100;

  if (correctBac) {
    score += 20;
  } else {
    score -= 50;
  }

  if (hasCPGE && noteCPGE >= 10) {
    if (school.requires_cpge) {
      score += 35;
    } else if (school.cpge_bonus) {
      score += 20;
    }
  } else if (school.requires_cpge) {
    score -= 40;
  }

  return Math.round(Math.max(0, Math.min(95, score)));
}

function getLabel(pct) {
  if (pct >= 70) return { text: "Forte chance", color: "#10b981" };
  if (pct >= 40) return { text: "Chance moyenne", color: "#f59e0b" };
  return { text: "Difficile", color: "#ef4444" };
}

function getTip(school, pct) {
  if (pct >= 70) return school.tip_high;
  if (pct >= 40) return school.tip_mid;
  return school.tip_low;
}

// ── Stepper indicator ─────────────────────────────────────────────────────────
function Stepper({ step, dark }) {
  const steps = ["Type de Bac", "Note du Bac", "CPGE ?", "Filières"];
  const trackColor = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:32 }}>
      {steps.map((label, i) => {
        const active = i === step;
        const done   = i < step;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif",
                transition: "all 0.3s",
                background: done ? "#10b981" : active ? "#7c3aed" : trackColor,
                color: (done || active) ? "#fff" : dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
                boxShadow: active ? "0 0 0 4px rgba(124,58,237,0.2)" : "none",
              }}>
                {done ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                color: active ? "#7c3aed" : dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)",
                whiteSpace: "nowrap",
              }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 40, height: 2, marginBottom: 16,
                background: i < step ? "#10b981" : trackColor,
                transition: "background 0.4s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Animated result bar ────────────────────────────────────────────────────────
function ResultBar({ school, pct, animated, dark }) {
  const { text: labelText, color: barColor } = getLabel(pct);
  const tip = getTip(school, pct);
  return (
    <div style={{
      background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
      border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
      borderRadius: 14, padding: "16px 18px",
      transition: "transform 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {school.icon && <school.icon size={18} />}
            <span style={{ fontWeight:700, fontSize:15, color: dark ? "#f3f4f6" : "#1e1b4b", fontFamily:"'DM Sans',sans-serif" }}>
              {school.name}
            </span>
            <span style={{
              fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20,
              background: school.domainColor + "22", color: school.domainColor,
              fontFamily:"'DM Sans',sans-serif",
            }}>{school.domain}</span>
          </div>
          <div style={{ fontSize:11, color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)", marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>
            {school.full}
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
          <div style={{ fontSize:22, fontWeight:800, color: barColor, fontFamily:"'Fraunces',serif" }}>{pct}%</div>
          <div style={{ fontSize:10, fontWeight:700, color: barColor, fontFamily:"'DM Sans',sans-serif" }}>{labelText}</div>
        </div>
      </div>

      {/* Bar track */}
      <div style={{ height:8, borderRadius:99, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow:"hidden", marginBottom:10 }}>
        <div style={{
          height:"100%", borderRadius:99,
          background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
          width: animated ? `${pct}%` : "0%",
          transition: "width 1.1s cubic-bezier(0.34,1.1,0.64,1)",
        }} />
      </div>

      {/* Tip */}
      <p style={{ margin:0, fontSize:12, color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>
        <Lightbulb size={13} style={{verticalAlign:"middle", marginRight:4}} /> {tip}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Calculateur() {
  const navigate   = useNavigate();
  const [dark]     = useTheme();

  const [step, setStep]           = useState(0);   // 0-3 → wizard, 4 → results
  const [bacType, setBacType]     = useState("");
  const [noteBAC, setNoteBAC]     = useState(14);
  const [hasCPGE, setHasCPGE]     = useState(false);
  const [noteCPGE, setNoteCPGE]   = useState(13);
  const [domains, setDomains]     = useState([]);   // selected domain ids
  const [animated, setAnimated]   = useState(false);
  const [inAnim, setInAnim]       = useState(true);

  // Pre-fill bac type and note from profile
  useEffect(() => {
    const token = localStorage.getItem("najahi_token");
    if (!token) return;
    const base = import.meta.env.VITE_API_URL || "";
    fetch(`${base}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        if (d.type_bac) setBacType(d.type_bac);
        if (d.note_bac != null && parseFloat(d.note_bac) > 0) setNoteBAC(parseFloat(d.note_bac));
      })
      .catch(() => {});
  }, []);

  // Debounced bar animation — re-triggers 500 ms after any input change in results view
  const debounceRef = useRef(null);
  useEffect(() => {
    if (step !== 4) return;
    setAnimated(false);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(debounceRef.current);
  }, [step, noteBAC, noteCPGE, bacType, hasCPGE, domains]);

  // Step transition animation
  const goTo = (next) => {
    setInAnim(false);
    setTimeout(() => { setStep(next); setInAnim(true); }, 180);
  };

  // Filtered + sorted results
  const results = SCHOOLS
    .filter(s => domains.length === 0 || domains.includes(s.domain))
    .map(s => ({ school: s, pct: calcChance(s, bacType, noteBAC, hasCPGE, noteCPGE) }))
    .sort((a, b) => b.pct - a.pct);

  const bg    = dark ? "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" : "linear-gradient(135deg,#e9e4ff,#f0f4ff,#fdf6ff)";
  const card  = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)";
  const border= dark ? "rgba(255,255,255,0.1)"  : "rgba(124,58,237,0.15)";
  const txt   = dark ? "#f3f4f6"                 : "#1e1b4b";
  const sub   = dark ? "rgba(255,255,255,0.5)"   : "rgba(30,27,75,0.5)";
  const input = dark ? "rgba(255,255,255,0.06)"  : "rgba(255,255,255,0.8)";
  const inputB= dark ? "rgba(255,255,255,0.12)"  : "rgba(124,58,237,0.25)";

  const canNext0 = !!bacType;
  const canNext1 = noteBAC >= 10;
  const canNext2 = true;
  const canNext3 = true;

  const btnNext = {
    display:"flex", alignItems:"center", gap:8,
    padding:"11px 28px", borderRadius:12, border:"none",
    background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
    color:"#fff", fontSize:14, fontWeight:700,
    fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
    boxShadow:"0 4px 18px rgba(124,58,237,0.35)",
    transition:"all 0.2s",
  };
  const btnBack = {
    display:"flex", alignItems:"center", gap:6,
    padding:"11px 20px", borderRadius:12,
    border: `1px solid ${border}`,
    background:"transparent",
    color: txt, fontSize:14, fontWeight:600,
    fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
    transition:"all 0.2s",
  };

  return (
    <div style={{ minHeight:"100vh", background:bg, padding:"0 16px 48px", fontFamily:"'DM Sans',sans-serif" }}>
      {/* Ambient blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)", top:"-10%", right:"-5%" }} />
        <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,0.08),transparent 70%)", bottom:"5%", left:"-5%" }} />
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:660, margin:"0 auto" }}>
        {/* Top nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 0 0" }}>
          <button
            onClick={() => navigate("/app/dashboard")}
            style={{ ...btnBack, padding:"8px 14px", fontSize:13 }}
            onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ArrowLeft size={14} /> Tableau de bord
          </button>
          {step > 0 && step < 4 && (
            <button
              onClick={() => goTo(0)}
              style={{ ...btnBack, padding:"8px 14px", fontSize:13, gap:6, color:"rgba(124,58,237,0.8)" }}
              onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <RotateCcw size={13} /> Recommencer
            </button>
          )}
        </div>

        {/* Header */}
        <div style={{ textAlign:"center", padding:"28px 0 10px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#7c3aed22,#5b21b622)", border:`1px solid ${border}`, marginBottom:14 }}>
            <Target size={26} color="#7c3aed" />
          </div>
          <h1 style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"clamp(22px,5vw,32px)", color:txt, lineHeight:1.15 }}>
            Calcule tes chances d'admission
          </h1>
          <p style={{ margin:"8px 0 0", color:sub, fontSize:14, lineHeight:1.5 }}>
            {step < 4
              ? "Réponds à 4 questions simples pour estimer tes probabilités d'admission."
              : `Résultats pour ${results.length} établissement${results.length > 1 ? "s" : ""} · Note bac ${noteBAC}/20`
            }
          </p>
        </div>

        {/* Stepper (hidden on results) */}
        {step < 4 && <Stepper step={step} dark={dark} />}

        {/* Card */}
        <div style={{
          background: card,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${border}`,
          borderRadius: 20,
          padding: step === 4 ? "28px 24px" : "32px 28px",
          boxShadow: dark ? "0 8px 40px rgba(0,0,0,0.4)" : "0 8px 40px rgba(124,58,237,0.08)",
          opacity: inAnim ? 1 : 0,
          transform: inAnim ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}>

          {/* ─── STEP 0: Bac type ─── */}
          {step === 0 && (
            <div>
              <h2 style={{ margin:"0 0 6px", fontSize:18, fontWeight:700, color:txt }}>Quel est ton type de Bac ?</h2>
              <p style={{ margin:"0 0 22px", fontSize:13, color:sub }}>Sélectionne la filière de ton baccalauréat.</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))", gap:10 }}>
                {BAC_TYPES.map(b => {
                  const sel = bacType === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBacType(b.id)}
                      style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"12px 14px", borderRadius:12, cursor:"pointer",
                        border: sel ? "2px solid #7c3aed" : `1.5px solid ${border}`,
                        background: sel ? (dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.08)") : input,
                        color: sel ? "#7c3aed" : txt,
                        fontWeight: sel ? 700 : 500, fontSize:14,
                        fontFamily:"'DM Sans',sans-serif",
                        transition:"all 0.18s",
                        boxShadow: sel ? "0 2px 12px rgba(124,58,237,0.2)" : "none",
                        textAlign:"left",
                      }}
                    >
                      {b.icon && <b.icon size={20} />}
                      <div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{b.short}</div>
                        <div style={{ fontSize:11, opacity:0.6, fontWeight:400 }}>{b.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:26 }}>
                <button
                  disabled={!canNext0}
                  onClick={() => goTo(1)}
                  style={{ ...btnNext, opacity: canNext0 ? 1 : 0.4, cursor: canNext0 ? "pointer" : "not-allowed" }}
                >
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 1: Note du Bac ─── */}
          {step === 1 && (
            <div>
              <h2 style={{ margin:"0 0 6px", fontSize:18, fontWeight:700, color:txt }}>Quelle est ta note du Bac ?</h2>
              <p style={{ margin:"0 0 28px", fontSize:13, color:sub }}>Déplace le curseur pour ajuster ta note (ou celle que tu vises).</p>

              <div style={{ textAlign:"center", marginBottom:12 }}>
                <span style={{ fontSize:52, fontWeight:900, fontFamily:"'Fraunces',serif", color:"#7c3aed", lineHeight:1 }}>{noteBAC.toFixed(1)}</span>
                <span style={{ fontSize:22, fontWeight:700, color:sub, marginLeft:4 }}>/20</span>
              </div>
              <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:24 }}>
                {noteBAC < 12 && <span style={{ background:"#ef444422", color:"#ef4444", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>Résultats limités</span>}
                {noteBAC >= 12 && noteBAC < 15 && <span style={{ background:"#f59e0b22", color:"#f59e0b", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>Filières accessibles</span>}
                {noteBAC >= 15 && noteBAC < 17 && <span style={{ background:"#10b98122", color:"#10b981", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>Bon dossier</span>}
                {noteBAC >= 17 && <span style={{ background:"#7c3aed22", color:"#7c3aed", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>Excellent dossier</span>}
              </div>

              <input
                type="range" min={10} max={20} step={0.5}
                value={noteBAC}
                onChange={e => setNoteBAC(parseFloat(e.target.value))}
                style={{ width:"100%", accentColor:"#7c3aed", height:6, cursor:"pointer" }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span style={{ fontSize:11, color:sub }}>10</span>
                <span style={{ fontSize:11, color:sub }}>15</span>
                <span style={{ fontSize:11, color:sub }}>20</span>
              </div>

              {/* Quick picks */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:18 }}>
                {[10,12,14,15,16,17,18,20].map(v => (
                  <button key={v} onClick={() => setNoteBAC(v)}
                    style={{
                      padding:"6px 13px", borderRadius:99, fontSize:12, fontWeight:700,
                      border: noteBAC === v ? "2px solid #7c3aed" : `1.5px solid ${border}`,
                      background: noteBAC === v ? "rgba(124,58,237,0.1)" : input,
                      color: noteBAC === v ? "#7c3aed" : txt, cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
                    }}
                  >{v}/20</button>
                ))}
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
                <button onClick={() => goTo(0)} style={btnBack}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <ArrowLeft size={14} /> Précédent
                </button>
                <button onClick={() => goTo(2)} style={btnNext}>
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: CPGE ─── */}
          {step === 2 && (
            <div>
              <h2 style={{ margin:"0 0 6px", fontSize:18, fontWeight:700, color:txt }}>As-tu fait une CPGE ?</h2>
              <p style={{ margin:"0 0 22px", fontSize:13, color:sub }}>
                Les Classes Préparatoires donnent accès à des concours très sélectifs (CNC, etc.).
              </p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:22 }}>
                {[{ val:true, label:"Oui, j'ai / je vais faire une CPGE", icon: CheckCircle },
                  { val:false, label:"Non, je passe directement", icon: ArrowRight }].map(o => (
                  <button key={String(o.val)} onClick={() => setHasCPGE(o.val)}
                    style={{
                      padding:"18px 16px", borderRadius:14, cursor:"pointer", textAlign:"left",
                      border: hasCPGE === o.val ? "2px solid #7c3aed" : `1.5px solid ${border}`,
                      background: hasCPGE === o.val ? (dark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.07)") : input,
                      color: txt, fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
                      boxShadow: hasCPGE === o.val ? "0 2px 14px rgba(124,58,237,0.18)" : "none",
                    }}
                  >
                    <div style={{ marginBottom:8 }}><o.icon size={24} color={hasCPGE === o.val ? "#7c3aed" : undefined} /></div>
                    <div style={{ fontWeight:700, fontSize:13, color: hasCPGE === o.val ? "#7c3aed" : txt }}>{o.label}</div>
                  </button>
                ))}
              </div>

              {hasCPGE && (
                <div style={{ padding:"20px", borderRadius:14, background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)", border:`1px solid rgba(124,58,237,0.2)`, marginBottom:22 }}>
                  <label style={{ display:"block", fontWeight:700, fontSize:13, color:txt, marginBottom:10 }}>
                    Ta moyenne en CPGE (approximative)
                  </label>
                  <div style={{ textAlign:"center", marginBottom:8 }}>
                    <span style={{ fontSize:38, fontWeight:900, fontFamily:"'Fraunces',serif", color:"#7c3aed" }}>{noteCPGE.toFixed(1)}</span>
                    <span style={{ fontSize:18, fontWeight:700, color:sub, marginLeft:3 }}>/20</span>
                  </div>
                  <input
                    type="range" min={10} max={20} step={0.5}
                    value={noteCPGE}
                    onChange={e => setNoteCPGE(parseFloat(e.target.value))}
                    style={{ width:"100%", accentColor:"#7c3aed", cursor:"pointer" }}
                  />
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <button onClick={() => goTo(1)} style={btnBack}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <ArrowLeft size={14} /> Précédent
                </button>
                <button onClick={() => goTo(3)} style={btnNext}>
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Domains ─── */}
          {step === 3 && (
            <div>
              <h2 style={{ margin:"0 0 6px", fontSize:18, fontWeight:700, color:txt }}>Quelles filières t'intéressent ?</h2>
              <p style={{ margin:"0 0 22px", fontSize:13, color:sub }}>
                Choisis une ou plusieurs filières. Laisse tout vide pour voir tous les résultats.
              </p>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:9 }}>
                {DOMAINS.map(d => {
                  const sel = domains.includes(d.id);
                  return (
                    <button key={d.id}
                      onClick={() => setDomains(prev => sel ? prev.filter(x => x !== d.id) : [...prev, d.id])}
                      style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"13px 14px", borderRadius:12, cursor:"pointer",
                        border: sel ? "2px solid #7c3aed" : `1.5px solid ${border}`,
                        background: sel ? (dark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.07)") : input,
                        color: sel ? "#7c3aed" : txt, fontWeight: sel ? 700 : 500,
                        fontFamily:"'DM Sans',sans-serif", fontSize:13,
                        transition:"all 0.18s",
                        boxShadow: sel ? "0 2px 12px rgba(124,58,237,0.18)" : "none",
                        textAlign:"left",
                      }}
                    >
                      {d.icon && <d.icon size={20} />}
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>

              {domains.length > 0 && (
                <div style={{ marginTop:12, textAlign:"center" }}>
                  <button onClick={() => setDomains([])} style={{ fontSize:12, color:"rgba(124,58,237,0.7)", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    Effacer la sélection
                  </button>
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"space-between", marginTop:26 }}>
                <button onClick={() => goTo(2)} style={btnBack}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <ArrowLeft size={14} /> Précédent
                </button>
                <button onClick={() => goTo(4)} style={{ ...btnNext, background:"linear-gradient(135deg,#10b981,#059669)", boxShadow:"0 4px 18px rgba(16,185,129,0.35)" }}>
                  Voir mes résultats <Target size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ─── RESULTS ─── */}
          {step === 4 && (
            <div>
              {/* Live adjustment panel */}
              <div style={{ background: dark ? "rgba(124,58,237,0.09)" : "rgba(124,58,237,0.05)", border:`1px solid rgba(124,58,237,0.18)`, borderRadius:14, padding:"16px 18px", marginBottom:22 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:14 }}>
                  <Zap size={11} style={{verticalAlign:"middle", marginRight:4}} /> Ajuster en direct — résultats mis à jour automatiquement
                </div>

                {/* Note BAC */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:txt }}>Note du Bac</span>
                    <span style={{ fontSize:18, fontWeight:800, color:"#7c3aed", fontFamily:"'Fraunces',serif" }}>{noteBAC.toFixed(1)}/20</span>
                  </div>
                  <input type="range" min={10} max={20} step={0.5}
                    value={noteBAC} onChange={e => setNoteBAC(parseFloat(e.target.value))}
                    style={{ width:"100%", accentColor:"#7c3aed", cursor:"pointer" }}
                  />
                </div>

                {/* CPGE toggle + note */}
                <div style={{ marginBottom: hasCPGE ? 14 : 0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: hasCPGE ? 10 : 0 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:txt }}>CPGE</span>
                    <button onClick={() => setHasCPGE(v => !v)} style={{
                      padding:"3px 12px", borderRadius:99, fontSize:12, fontWeight:700, cursor:"pointer",
                      background: hasCPGE ? "rgba(16,185,129,0.15)" : (dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
                      border: hasCPGE ? "1.5px solid rgba(16,185,129,0.4)" : `1.5px solid ${border}`,
                      color: hasCPGE ? "#10b981" : sub, fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
                    }}>
                      {hasCPGE ? <><CheckCircle size={12} style={{verticalAlign:"middle",marginRight:4}} />Oui</> : "Non"}
                    </button>
                    {hasCPGE && (
                      <span style={{ marginLeft:"auto", fontSize:16, fontWeight:800, color:"#10b981", fontFamily:"'Fraunces',serif" }}>{noteCPGE.toFixed(1)}/20</span>
                    )}
                  </div>
                  {hasCPGE && (
                    <input type="range" min={10} max={20} step={0.5}
                      value={noteCPGE} onChange={e => setNoteCPGE(parseFloat(e.target.value))}
                      style={{ width:"100%", accentColor:"#10b981", cursor:"pointer" }}
                    />
                  )}
                </div>

                {/* Domain filter chips */}
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:sub, marginBottom:8 }}>Filières (filtre) :</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {DOMAINS.map(d => {
                      const sel = domains.includes(d.id);
                      return (
                        <button key={d.id} onClick={() => setDomains(prev => sel ? prev.filter(x => x !== d.id) : [...prev, d.id])}
                          style={{
                            padding:"4px 11px", borderRadius:99, fontSize:11, fontWeight:700, cursor:"pointer",
                            border: sel ? "1.5px solid #7c3aed" : `1.5px solid ${border}`,
                            background: sel ? "rgba(124,58,237,0.12)" : input,
                            color: sel ? "#7c3aed" : sub, fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
                          }}>
                          {d.icon && <d.icon size={11} style={{verticalAlign:"middle", marginRight:4}} />}{d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:24 }}>
                {[
                  { label:"Forte chance", count: results.filter(r => r.pct >= 70).length, color:"#10b981" },
                  { label:"Moyenne",      count: results.filter(r => r.pct >= 40 && r.pct < 70).length, color:"#f59e0b" },
                  { label:"Difficile",   count: results.filter(r => r.pct < 40).length, color:"#ef4444" },
                ].map(s => (
                  <div key={s.label} style={{
                    padding:"12px 10px", borderRadius:12, textAlign:"center",
                    background: s.color + "14", border:`1px solid ${s.color}30`,
                  }}>
                    <div style={{ fontSize:22, fontWeight:900, fontFamily:"'Fraunces',serif", color:s.color }}>{s.count}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:s.color, fontFamily:"'DM Sans',sans-serif" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Result bars */}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {results.map(({ school, pct }) => (
                  <ResultBar key={school.id} school={school} pct={pct} animated={animated} dark={dark} />
                ))}
              </div>

              {/* Bottom actions */}
              <div style={{ display:"flex", gap:12, marginTop:26, flexWrap:"wrap" }}>
                <button onClick={() => goTo(0)}
                  style={{ ...btnBack, flex:1, justifyContent:"center", minWidth:140 }}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <RotateCcw size={14} /> Nouveau calcul
                </button>
                <button onClick={() => navigate("/app/concours")}
                  style={{ ...btnNext, flex:1, justifyContent:"center", minWidth:140, background:"linear-gradient(135deg,#10b981,#059669)", boxShadow:"0 4px 18px rgba(16,185,129,0.3)" }}
                >
                  Voir les concours <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        {step === 4 && (
          <p style={{ textAlign:"center", fontSize:11, color:sub, marginTop:16, lineHeight:1.5, padding:"0 8px" }}>
            ℹ️ Ces estimations sont indicatives et basées sur des critères généraux. Les conditions d'admission réelles peuvent varier selon les établissements et les années. Consulte toujours les sites officiels.
          </p>
        )}
      </div>
    </div>
  );
}
