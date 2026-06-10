import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Lock, Phone, ArrowRight, ArrowLeft,
  Eye, EyeOff, Upload, CheckCircle, X, School,
  MapPin, BookOpen, Building2, ChevronDown
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import AuthLeft from "./AuthLeft";
import styles from "./Auth.module.css";
import {
  MOROCCAN_CITIES, MOROCCAN_LEVELS, FILIERES_BY_NIVEAU,
  SCHOOLS_BY_CITY, getFiliereGroup,
} from "../../data/morocco";

const TYPES_ECOLE = [
  { value: "public",  label: "Public",  icon: Building2 },
  { value: "private", label: "Privé",   icon: School },
];

const COUNTRY_CODES = [
  { code: "+93",  iso: "af", name: "Afghanistan" },
  { code: "+355", iso: "al", name: "Albanie" },
  { code: "+213", iso: "dz", name: "Algérie" },
  { code: "+376", iso: "ad", name: "Andorre" },
  { code: "+244", iso: "ao", name: "Angola" },
  { code: "+54",  iso: "ar", name: "Argentine" },
  { code: "+374", iso: "am", name: "Arménie" },
  { code: "+61",  iso: "au", name: "Australie" },
  { code: "+43",  iso: "at", name: "Autriche" },
  { code: "+994", iso: "az", name: "Azerbaïdjan" },
  { code: "+1242",iso: "bs", name: "Bahamas" },
  { code: "+973", iso: "bh", name: "Bahreïn" },
  { code: "+880", iso: "bd", name: "Bangladesh" },
  { code: "+32",  iso: "be", name: "Belgique" },
  { code: "+501", iso: "bz", name: "Belize" },
  { code: "+229", iso: "bj", name: "Bénin" },
  { code: "+975", iso: "bt", name: "Bhoutan" },
  { code: "+591", iso: "bo", name: "Bolivie" },
  { code: "+387", iso: "ba", name: "Bosnie" },
  { code: "+267", iso: "bw", name: "Botswana" },
  { code: "+55",  iso: "br", name: "Brésil" },
  { code: "+673", iso: "bn", name: "Brunei" },
  { code: "+359", iso: "bg", name: "Bulgarie" },
  { code: "+226", iso: "bf", name: "Burkina Faso" },
  { code: "+257", iso: "bi", name: "Burundi" },
  { code: "+855", iso: "kh", name: "Cambodge" },
  { code: "+237", iso: "cm", name: "Cameroun" },
  { code: "+1",   iso: "ca", name: "Canada" },
  { code: "+238", iso: "cv", name: "Cap-Vert" },
  { code: "+236", iso: "cf", name: "Centrafrique" },
  { code: "+56",  iso: "cl", name: "Chili" },
  { code: "+86",  iso: "cn", name: "Chine" },
  { code: "+357", iso: "cy", name: "Chypre" },
  { code: "+57",  iso: "co", name: "Colombie" },
  { code: "+269", iso: "km", name: "Comores" },
  { code: "+242", iso: "cg", name: "Congo" },
  { code: "+243", iso: "cd", name: "Congo RD" },
  { code: "+506", iso: "cr", name: "Costa Rica" },
  { code: "+385", iso: "hr", name: "Croatie" },
  { code: "+53",  iso: "cu", name: "Cuba" },
  { code: "+45",  iso: "dk", name: "Danemark" },
  { code: "+253", iso: "dj", name: "Djibouti" },
  { code: "+20",  iso: "eg", name: "Égypte" },
  { code: "+971", iso: "ae", name: "Émirats" },
  { code: "+593", iso: "ec", name: "Équateur" },
  { code: "+291", iso: "er", name: "Érythrée" },
  { code: "+34",  iso: "es", name: "Espagne" },
  { code: "+372", iso: "ee", name: "Estonie" },
  { code: "+268", iso: "sz", name: "Eswatini" },
  { code: "+251", iso: "et", name: "Éthiopie" },
  { code: "+679", iso: "fj", name: "Fidji" },
  { code: "+358", iso: "fi", name: "Finlande" },
  { code: "+33",  iso: "fr", name: "France" },
  { code: "+241", iso: "ga", name: "Gabon" },
  { code: "+220", iso: "gm", name: "Gambie" },
  { code: "+995", iso: "ge", name: "Géorgie" },
  { code: "+233", iso: "gh", name: "Ghana" },
  { code: "+30",  iso: "gr", name: "Grèce" },
  { code: "+502", iso: "gt", name: "Guatemala" },
  { code: "+224", iso: "gn", name: "Guinée" },
  { code: "+240", iso: "gq", name: "Guinée Éq." },
  { code: "+245", iso: "gw", name: "Guinée-Bissau" },
  { code: "+592", iso: "gy", name: "Guyana" },
  { code: "+509", iso: "ht", name: "Haïti" },
  { code: "+504", iso: "hn", name: "Honduras" },
  { code: "+36",  iso: "hu", name: "Hongrie" },
  { code: "+91",  iso: "in", name: "Inde" },
  { code: "+62",  iso: "id", name: "Indonésie" },
  { code: "+98",  iso: "ir", name: "Iran" },
  { code: "+964", iso: "iq", name: "Irak" },
  { code: "+353", iso: "ie", name: "Irlande" },
  { code: "+354", iso: "is", name: "Islande" },
  { code: "+972", iso: "il", name: "Israël" },
  { code: "+39",  iso: "it", name: "Italie" },
  { code: "+225", iso: "ci", name: "Côte d'Ivoire" },
  { code: "+1876",iso: "jm", name: "Jamaïque" },
  { code: "+81",  iso: "jp", name: "Japon" },
  { code: "+962", iso: "jo", name: "Jordanie" },
  { code: "+7",   iso: "kz", name: "Kazakhstan" },
  { code: "+254", iso: "ke", name: "Kenya" },
  { code: "+996", iso: "kg", name: "Kirghizistan" },
  { code: "+965", iso: "kw", name: "Koweït" },
  { code: "+856", iso: "la", name: "Laos" },
  { code: "+266", iso: "ls", name: "Lesotho" },
  { code: "+371", iso: "lv", name: "Lettonie" },
  { code: "+961", iso: "lb", name: "Liban" },
  { code: "+231", iso: "lr", name: "Libéria" },
  { code: "+218", iso: "ly", name: "Libye" },
  { code: "+423", iso: "li", name: "Liechtenstein" },
  { code: "+370", iso: "lt", name: "Lituanie" },
  { code: "+352", iso: "lu", name: "Luxembourg" },
  { code: "+389", iso: "mk", name: "Macédoine" },
  { code: "+261", iso: "mg", name: "Madagascar" },
  { code: "+265", iso: "mw", name: "Malawi" },
  { code: "+60",  iso: "my", name: "Malaisie" },
  { code: "+960", iso: "mv", name: "Maldives" },
  { code: "+223", iso: "ml", name: "Mali" },
  { code: "+356", iso: "mt", name: "Malte" },
  { code: "+212", iso: "ma", name: "Maroc" },
  { code: "+222", iso: "mr", name: "Mauritanie" },
  { code: "+230", iso: "mu", name: "Maurice" },
  { code: "+52",  iso: "mx", name: "Mexique" },
  { code: "+373", iso: "md", name: "Moldavie" },
  { code: "+976", iso: "mn", name: "Mongolie" },
  { code: "+382", iso: "me", name: "Monténégro" },
  { code: "+258", iso: "mz", name: "Mozambique" },
  { code: "+264", iso: "na", name: "Namibie" },
  { code: "+977", iso: "np", name: "Népal" },
  { code: "+505", iso: "ni", name: "Nicaragua" },
  { code: "+227", iso: "ne", name: "Niger" },
  { code: "+234", iso: "ng", name: "Nigéria" },
  { code: "+47",  iso: "no", name: "Norvège" },
  { code: "+64",  iso: "nz", name: "Nouvelle-Zélande" },
  { code: "+968", iso: "om", name: "Oman" },
  { code: "+256", iso: "ug", name: "Ouganda" },
  { code: "+998", iso: "uz", name: "Ouzbékistan" },
  { code: "+92",  iso: "pk", name: "Pakistan" },
  { code: "+507", iso: "pa", name: "Panama" },
  { code: "+675", iso: "pg", name: "Papouasie" },
  { code: "+595", iso: "py", name: "Paraguay" },
  { code: "+31",  iso: "nl", name: "Pays-Bas" },
  { code: "+51",  iso: "pe", name: "Pérou" },
  { code: "+63",  iso: "ph", name: "Philippines" },
  { code: "+48",  iso: "pl", name: "Pologne" },
  { code: "+351", iso: "pt", name: "Portugal" },
  { code: "+974", iso: "qa", name: "Qatar" },
  { code: "+40",  iso: "ro", name: "Roumanie" },
  { code: "+44",  iso: "gb", name: "Royaume-Uni" },
  { code: "+7",   iso: "ru", name: "Russie" },
  { code: "+250", iso: "rw", name: "Rwanda" },
  { code: "+966", iso: "sa", name: "Arabie Saoudite" },
  { code: "+221", iso: "sn", name: "Sénégal" },
  { code: "+381", iso: "rs", name: "Serbie" },
  { code: "+232", iso: "sl", name: "Sierra Leone" },
  { code: "+65",  iso: "sg", name: "Singapour" },
  { code: "+421", iso: "sk", name: "Slovaquie" },
  { code: "+386", iso: "si", name: "Slovénie" },
  { code: "+252", iso: "so", name: "Somalie" },
  { code: "+249", iso: "sd", name: "Soudan" },
  { code: "+211", iso: "ss", name: "Soudan du Sud" },
  { code: "+94",  iso: "lk", name: "Sri Lanka" },
  { code: "+46",  iso: "se", name: "Suède" },
  { code: "+41",  iso: "ch", name: "Suisse" },
  { code: "+597", iso: "sr", name: "Suriname" },
  { code: "+963", iso: "sy", name: "Syrie" },
  { code: "+992", iso: "tj", name: "Tadjikistan" },
  { code: "+255", iso: "tz", name: "Tanzanie" },
  { code: "+235", iso: "td", name: "Tchad" },
  { code: "+420", iso: "cz", name: "Tchéquie" },
  { code: "+66",  iso: "th", name: "Thaïlande" },
  { code: "+228", iso: "tg", name: "Togo" },
  { code: "+676", iso: "to", name: "Tonga" },
  { code: "+1868",iso: "tt", name: "Trinité-et-Tobago" },
  { code: "+216", iso: "tn", name: "Tunisie" },
  { code: "+993", iso: "tm", name: "Turkménistan" },
  { code: "+90",  iso: "tr", name: "Turquie" },
  { code: "+380", iso: "ua", name: "Ukraine" },
  { code: "+598", iso: "uy", name: "Uruguay" },
  { code: "+1",   iso: "us", name: "USA" },
  { code: "+678", iso: "vu", name: "Vanuatu" },
  { code: "+58",  iso: "ve", name: "Venezuela" },
  { code: "+84",  iso: "vn", name: "Vietnam" },
  { code: "+967", iso: "ye", name: "Yémen" },
  { code: "+260", iso: "zm", name: "Zambie" },
  { code: "+263", iso: "zw", name: "Zimbabwe" },
];

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_LABELS = ["", "Faible", "Moyen", "Bon", "Fort"];
const STRENGTH_COLORS = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

function StepBar({ current, total, dark }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", fontSize: 12, fontWeight: 600,
            display: "grid", placeItems: "center", flexShrink: 0,
            background: i < current ? "#10b981" : i === current ? "#7c3aed" : dark ? "rgba(255,255,255,0.08)" : "#f3f0ff",
            border: i < current ? "2px solid #10b981" : i === current ? "2px solid #7c3aed" : dark ? "2px solid rgba(255,255,255,0.15)" : "2px solid #e8e4de",
            color: i <= current ? "#fff" : dark ? "rgba(255,255,255,0.4)" : "rgba(26,22,37,0.4)",
            boxShadow: i === current ? "0 0 0 4px rgba(124,58,237,0.15)" : "none",
            transition: "all 0.3s",
          }}>
            {i < current ? <CheckCircle size={12}/> : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ width: 32, height: 2, background: i < current ? "#10b981" : dark ? "rgba(255,255,255,0.1)" : "#e8e4de", transition: "background 0.3s" }}/>
          )}
        </div>
      ))}
    </div>
  );
}

function TypeToggle({ value, onChange, dark }) {
  return (
    <div style={{ display:"flex", gap:8 }}>
      {TYPES_ECOLE.map((t) => {
        const Icon = t.icon;
        const active = value === t.value;
        return (
          <button key={t.value} type="button" onClick={() => onChange(t.value)}
            style={{
              flex: 1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              padding:"10px 14px",
              border: active ? "1.5px solid #7c3aed" : dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid #e8e4de",
              borderRadius: 10,
              background: active ? "rgba(124,58,237,0.12)" : dark ? "rgba(255,255,255,0.04)" : "#fafaf9",
              color: active ? "#7c3aed" : dark ? "rgba(255,255,255,0.5)" : "rgba(26,22,37,0.5)",
              fontWeight: active ? 600 : 500, fontSize: 14,
              fontFamily: "'DM Sans',sans-serif", cursor:"pointer",
              transition:"all 0.2s",
              boxShadow: active ? "0 0 0 3px rgba(124,58,237,0.1)" : "none",
            }}>
            <Icon size={14}/> {t.label}
          </button>
        );
      })}
    </div>
  );
}

function CountryPicker({ value, onChange, dark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const selected = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ position:"relative", flexShrink:0 }} ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{
          display:"flex", alignItems:"center", gap:7, height:40, padding:"0 12px",
          border: dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid #e8e4de",
          borderRadius: 10,
          background: dark ? "rgba(255,255,255,0.06)" : "#fafaf9",
          cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
          fontSize:13, fontWeight:700, color: "#7c3aed",
          transition:"all 0.2s", whiteSpace:"nowrap",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="#7c3aed"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor=dark?"rgba(255,255,255,0.1)":"#e8e4de"; }}
      >
        <img src={`https://flagcdn.com/w40/${selected.iso}.png`} alt={selected.name}
          style={{ width:22, height:15, objectFit:"cover", borderRadius:3, boxShadow:"0 1px 3px rgba(0,0,0,0.15)" }}
          onError={e => { e.target.style.display="none"; }} />
        <span>{selected.code}</span>
        <ChevronDown size={11} style={{ opacity:0.5 }}/>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:200,
          background: dark ? "#1a1035" : "#fff",
          border: dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid #e8e4de",
          borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
          minWidth:210, maxHeight:240, overflowY:"auto", padding:6,
        }}>
          {COUNTRY_CODES.map(c => (
            <button key={c.code} type="button"
              onClick={() => { onChange(c.code); setOpen(false); }}
              style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"8px 10px", border:"none", borderRadius:8,
                background: value===c.code ? "rgba(124,58,237,0.12)" : "transparent",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                outline: value===c.code ? "1.5px solid #7c3aed" : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(124,58,237,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background=value===c.code?"rgba(124,58,237,0.12)":"transparent"}
            >
              <img src={`https://flagcdn.com/w40/${c.iso}.png`} alt={c.name}
                style={{ width:22, height:15, objectFit:"cover", borderRadius:3 }}
                onError={e => { e.target.style.display="none"; }} />
              <span style={{ flex:1, fontSize:13, color: dark?"rgba(255,255,255,0.8)":"#1a1625", fontWeight:500 }}>{c.name}</span>
              <span style={{ fontSize:12, color:"#7c3aed", fontWeight:700 }}>{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileRef = useRef();
  const dark = theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [step, setStep]                 = useState(0);
  const [slideDir, setSlideDir]         = useState("");
  const [animating, setAnimating]       = useState(false);
  const [swapState, setSwapState]       = useState("");
  const [panelSwapped, setPanelSwapped] = useState(false);
  const [flipped, setFlipped]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [countryCode, setCountryCode]   = useState("+212");
  const [logoError, setLogoError]       = useState(false);

  const [form, setForm] = useState({
    prenom:"", nom:"", email:"", telephone:"",
    password:"", confirmPassword:"",
    niveau:"", filiere:"", ville:"", type_ecole:"", nom_ecole:"",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleChange = (e) => set(e.target.name, e.target.value);
  const handleNameChange = (e) =>
    set(e.target.name, e.target.value.replace(/\b\w/g, c => c.toUpperCase()));

  const strength       = getStrength(form.password);
  const filiereGroup   = getFiliereGroup(form.niveau);
  const filiereOptions = filiereGroup ? FILIERES_BY_NIVEAU[filiereGroup]?.options ?? [] : [];
  const filiereLabel   = filiereGroup ? FILIERES_BY_NIVEAU[filiereGroup]?.label ?? "Filière" : "Filière";

  const availableSchools = useMemo(() => {
    if (!form.ville) return [];
    let list = SCHOOLS_BY_CITY[form.ville] ?? [];
    if (form.type_ecole) list = list.filter(s => s.type === form.type_ecole);
    if (filiereGroup)    list = list.filter(s => s.niveau.includes(filiereGroup));
    if (schoolSearch.trim()) {
      const q = schoolSearch.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [form.ville, form.type_ecole, filiereGroup, schoolSearch]);

  const handleVilleChange  = e => { set("ville", e.target.value); set("nom_ecole",""); setSchoolSearch(""); };
  const handleTypeChange   = v => { set("type_ecole", v); set("nom_ecole",""); setSchoolSearch(""); };
  const handleNiveauChange = e => { set("niveau", e.target.value); set("filiere",""); set("nom_ecole",""); };

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!form.prenom || !form.nom) return setError("Prénom et nom requis"), false;
      if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Email invalide"), false;
      if (!form.telephone) return setError("Numéro de téléphone requis"), false;
      if (form.password.length < 8) return setError("Mot de passe : 8 caractères minimum"), false;
      if (form.password !== form.confirmPassword) return setError("Mots de passe différents"), false;
    }
    if (step === 1) {
      if (!form.niveau) return setError("Veuillez sélectionner votre niveau"), false;
      if (!form.ville)  return setError("Veuillez sélectionner votre ville"), false;
    }
    return true;
  };

  const animateStep = (dir, newStep) => {
    if (animating) return;
    setSlideDir(dir); setAnimating(true);
    setTimeout(() => {
      setStep(newStep);
      setSlideDir(dir === "forward" ? "enter-forward" : "enter-back");
      setTimeout(() => { setAnimating(false); setSlideDir(""); }, 320);
    }, 280);
  };

  const triggerSwap = (newStep, direction) => {
    if (animating) return;
    setAnimating(true);
    setSwapState(direction === "forward" ? "outLeft" : "outRight");
    setTimeout(() => {
      setStep(newStep);
      setPanelSwapped(prev => !prev);
      setSwapState(direction === "forward" ? "inRight" : "inLeft");
      setTimeout(() => { setSwapState(""); setAnimating(false); }, 460);
    }, 460);
  };

  const next = () => {
    if (!validateStep()) return;
    if (step === 0) triggerSwap(1, "forward");
    else animateStep("forward", step + 1);
  };

  const back = () => {
    setError("");
    if (step === 1) triggerSwap(0, "back");
    else animateStep("back", step - 1);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!["application/pdf","image/jpeg","image/png"].includes(file.type))
      return setError("Format : PDF, JPG, PNG");
    if (file.size > 5 * 1024 * 1024) return setError("Max 5 Mo");
    setError(""); setUploadedFile(file);
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      let recaptcha_token = null;
      try {
        recaptcha_token = await window.grecaptcha.execute(
          import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh57mZSNqbm_-MJDR-2H",
          { action: "register" }
        );
      } catch {}
      await register({
        ...form,
        telephone: `${countryCode}${form.telephone.replace(/^0/, "")}`,
        recaptcha_token,
      });
      localStorage.setItem("najahi_email", form.email); // ← ajoute ça
      setSuccess(true);
      setTimeout(() => navigate("/verify-email", { state: { email: form.email } }), 2000);
    } catch (err) {
      if (err.status === 409) {
        setError(err.message);
      } else if (err.status === 500) {
        setError("Erreur serveur. Réessaie plus tard.");
      } else {
        setError(err.message || "Erreur lors de la création du compte");
      }
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => { setFlipped(true); setTimeout(() => navigate("/login"), 400); };
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Animation classes ──
  const slideClass =
    slideDir === "forward"       ? styles.slideExitLeft :
    slideDir === "back"          ? styles.slideExitRight :
    slideDir === "enter-forward" ? styles.slideEnterRight :
    slideDir === "enter-back"    ? styles.slideEnterLeft : "";

  const leftWrapClass = `${styles.leftPanelWrap} ${
    swapState === "outLeft" ? styles.swapOutLeft :
    swapState === "inLeft"  ? styles.swapInLeft  : ""
  }`;

  const rightWrapClass = `${styles.rightPanelWrap} ${
    swapState === "outRight" ? styles.swapOutRight :
    swapState === "inRight"  ? styles.swapInRight  : ""
  }`;

  // ── Theme tokens ──
  const pageBg   = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 45%,#0d1a2e 100%)" : "linear-gradient(135deg,#f0edff 0%,#e8e4ff 45%,#eef2ff 100%)";
  const rightBg  = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 45%,#0d1a2e 100%)" : "linear-gradient(135deg,#f0edff 0%,#e8e4ff 45%,#eef2ff 100%)";
  const cardBg  = dark ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.82)";
  const cardBdr = dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(124,58,237,0.12)";
  const cardSh  = dark ? "0 30px 90px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.08)" : "0 20px 60px rgba(124,58,237,0.1),0 4px 20px rgba(0,0,0,0.05)";
  const textCol  = dark ? "#ffffff" : "#1a1625";
  const subCol   = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";
  const labelCol = dark ? "rgba(255,255,255,0.7)" : "rgba(26,22,37,0.65)";
  const inputBg  = dark ? "rgba(255,255,255,0.06)" : "#fafaf9";
  const inputBdr = dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid #e8e4de";
  const inputCol = dark ? "#ffffff" : "#1a1625";
  const iconCol  = dark ? "rgba(255,255,255,0.35)" : "rgba(26,22,37,0.35)";
  const divBg    = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)";
  const divText  = dark ? "rgba(255,255,255,0.3)" : "rgba(26,22,37,0.4)";
  const errBg    = dark ? "rgba(239,68,68,0.12)" : "#fef2f2";
  const errBdr   = dark ? "1px solid rgba(239,68,68,0.3)" : "1px solid #fecaca";
  const errCol   = dark ? "#fca5a5" : "#ef4444";
  const footerC  = dark ? "rgba(255,255,255,0.4)" : "rgba(26,22,37,0.5)";

  const inputStyle = {
    width:"100%", padding:"10px 10px 10px 34px",
    background: inputBg, border: inputBdr,
    borderRadius: 10, fontSize: 13, color: inputCol,
    fontFamily:"'DM Sans',sans-serif", outline:"none", transition:"all 0.2s",
  };

  const handleInputFocus = e => {
    e.target.style.borderColor = "#7c3aed";
    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
    e.target.style.background = dark ? "rgba(255,255,255,0.09)" : "#fff";
  };
  const handleInputBlur = e => {
    e.target.style.borderColor = dark ? "rgba(255,255,255,0.1)" : "#e8e4de";
    e.target.style.boxShadow = "none";
    e.target.style.background = inputBg;
  };

  const selectStyle = {
    width:"100%", padding:"10px 32px 10px 12px",
    background: inputBg, border: inputBdr, color: inputCol,
    borderRadius: 10, fontSize: 13,
    fontFamily:"'DM Sans',sans-serif", outline:"none", appearance:"none",
    cursor:"pointer", transition:"all 0.2s",
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6580' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center",
  };

  // ── Form panel ──
  const formPanel = (
    <div className={rightWrapClass}>
      <div style={{
        width:"100%", minHeight:"100vh",
        background: rightBg,
        display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative",
        padding: isMobile ? "32px 16px" : "40px 24px",
        transition:"background 0.5s ease",
      }}>
        <div style={{
          position:"relative", zIndex:10,
          width:"100%", maxWidth:420,
          background: cardBg,
          backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
          border: cardBdr,
          borderRadius:"26px",
          padding: isMobile ? "28px 20px" : "44px 38px",
          boxShadow: cardSh,
          transition:"all 0.4s ease",
        }}>

          {success ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background: dark?"rgba(16,185,129,0.12)":"#f0fdf4", border:"2px solid rgba(16,185,129,0.3)", display:"grid", placeItems:"center", margin:"0 auto 20px" }}>
                <CheckCircle size={32} color="#10b981"/>
              </div>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:textCol, marginBottom:8 }}>Compte créé !</h3>
              <p style={{ color:subCol, fontSize:14 }}>Vérifie ton email pour activer ton compte Najahi.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:38, height:38, borderRadius:11, background:"#fff",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    overflow:"hidden", padding:5, flexShrink:0,
                    boxShadow:"0 0 0 1.5px rgba(124,58,237,0.25),0 0 14px rgba(124,58,237,0.3)",
                  }}>
                    {!logoError ? (
                      <img src="/najahi_logo.png" alt="Najahi"
                        style={{ width:"100%", height:"100%", objectFit:"contain" }}
                        onError={() => setLogoError(true)} />
                    ) : (
                      <span style={{ color:"#7c3aed", fontSize:18, fontWeight:900, fontFamily:"'Fraunces',serif" }}>N</span>
                    )}
                  </div>
                  <span style={{ fontSize:17, fontWeight:700, color:textCol, fontFamily:"'Fraunces',serif", letterSpacing:"-0.3px", transition:"color 0.4s" }}>
                    Najahi
                  </span>
                </div>
                <ThemeToggle style={{
                  background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)",
                }}/>
              </div>

              {/* StepBar */}
              <StepBar current={step} total={3} dark={dark} />

              {/* Title */}
              <div style={{ margin:"16px 0 18px" }}>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:textCol, letterSpacing:"-0.3px", marginBottom:4, transition:"color 0.4s" }}>
                  {step === 0 && "Informations personnelles"}
                  {step === 1 && "Ton parcours scolaire"}
                  {step === 2 && "Document scolaire"}
                </h2>
                <p style={{ fontSize:13, color:subCol, transition:"color 0.4s" }}>
                  {step === 0 && "Dis-nous qui tu es pour personnaliser ton expérience."}
                  {step === 1 && "Indique ton niveau, ta filière et ton établissement."}
                  {step === 2 && "Uploade ton bulletin ou relevé de notes (optionnel)."}
                </p>
              </div>

              {/* Google — step 0 */}
              {step === 0 && (
                <>
                  <button type="button"
                    onClick={() => window.location.href = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/google"}
                    style={{
                      width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                      padding:"11px 20px", marginBottom:10,
                      background:"#fff", border:"1.5px solid #e5e7eb",
                      borderRadius:10, fontSize:14, fontWeight:600, color:"#1a1625",
                      cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                      transition:"all 0.2s", boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.12)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)"; e.currentTarget.style.transform="translateY(0)"; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continuer avec Google
                  </button>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ flex:1, height:1, background:divBg }}/>
                    <span style={{ fontSize:12, color:divText, fontWeight:500 }}>ou avec ton email</span>
                    <div style={{ flex:1, height:1, background:divBg }}/>
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div style={{ display:"flex", alignItems:"center", gap:8, background:errBg, border:errBdr, color:errCol, borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:12 }}>
                  <X size={14}/> {error}
                </div>
              )}

              {/* Steps */}
              <div className={`${styles.stepSlide} ${slideClass}`}>

                {/* STEP 0 */}
                {step === 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {[["prenom","Prénom"], ["nom","Nom"]].map(([name, label]) => (
                        <div key={name} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          <label style={{ fontSize:12.5, fontWeight:500, color:labelCol }}>{label}</label>
                          <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                            <User size={13} style={{ position:"absolute", left:11, color:iconCol, pointerEvents:"none" }}/>
                            <input type="text" name={name} value={form[name]}
                              onChange={handleNameChange} autoFocus={name==="prenom"}
                              style={inputStyle}
                              onFocus={handleInputFocus} onBlur={handleInputBlur}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      <label style={{ fontSize:12.5, fontWeight:500, color:labelCol }}>Email</label>
                      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                        <Mail size={13} style={{ position:"absolute", left:11, color:iconCol, pointerEvents:"none" }}/>
                        <input type="email" name="email" value={form.email} onChange={handleChange}
                          placeholder="exemple@email.com" style={inputStyle}
                          onFocus={handleInputFocus} onBlur={handleInputBlur}
                        />
                      </div>
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      <label style={{ fontSize:12.5, fontWeight:500, color:labelCol }}>Téléphone</label>
                      <div style={{ display:"flex", gap:8 }}>
                        <CountryPicker value={countryCode} onChange={setCountryCode} dark={dark}/>
                        <div style={{ flex:1, position:"relative", display:"flex", alignItems:"center" }}>
                          <Phone size={13} style={{ position:"absolute", left:11, color:iconCol, pointerEvents:"none" }}/>
                          <input type="tel" name="telephone" value={form.telephone}
                            onChange={handleChange} placeholder="6XX XXX XXX" style={inputStyle}
                            onFocus={handleInputFocus} onBlur={handleInputBlur}
                          />
                        </div>
                      </div>
                      {form.telephone && (
                        <div style={{ fontSize:11, color:subCol, paddingLeft:4, display:"flex", alignItems:"center", gap:4 }}>
                          <Phone size={10}/> {countryCode} {form.telephone}
                        </div>
                      )}
                    </div>

                    {[["password","Mot de passe",showPassword,setShowPassword],["confirmPassword","Confirmer",showConfirm,setShowConfirm]].map(([name,label,show,setShow]) => (
                      <div key={name} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <label style={{ fontSize:12.5, fontWeight:500, color:labelCol }}>{label}</label>
                        <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                          <Lock size={13} style={{ position:"absolute", left:11, color:iconCol, pointerEvents:"none" }}/>
                          <input type={show?"text":"password"} name={name} value={form[name]}
                            onChange={handleChange} placeholder="••••••••"
                            style={{ ...inputStyle, paddingRight:36 }}
                            onFocus={handleInputFocus} onBlur={handleInputBlur}
                          />
                          <button type="button" onClick={() => setShow(v => !v)} tabIndex={-1}
                            style={{ position:"absolute", right:10, background:"none", border:"none", cursor:"pointer", color:iconCol, display:"flex", alignItems:"center", padding:4, borderRadius:6 }}>
                            {show ? <EyeOff size={13}/> : <Eye size={13}/>}
                          </button>
                        </div>
                        {name === "password" && form.password && (
                          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                            {[1,2,3,4].map(i => (
                              <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i<=strength?STRENGTH_COLORS[strength]:"#e5e7eb", transition:"background 0.3s" }}/>
                            ))}
                            <span style={{ fontSize:11, fontWeight:600, color:STRENGTH_COLORS[strength], marginLeft:4, minWidth:36 }}>{STRENGTH_LABELS[strength]}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      <label style={{ fontSize:12.5, fontWeight:500, color:labelCol, display:"flex", alignItems:"center", gap:5 }}>
                        <BookOpen size={13}/> Niveau scolaire
                      </label>
                      <select value={form.niveau} onChange={handleNiveauChange} style={selectStyle}
                        onFocus={handleInputFocus} onBlur={handleInputBlur}>
                        <option value="">Sélectionner ton niveau</option>
                        {MOROCCAN_LEVELS.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>

                    {form.niveau && filiereOptions.length > 0 && (
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <label style={{ fontSize:12.5, fontWeight:500, color:labelCol }}>{filiereLabel}</label>
                        <select value={form.filiere} onChange={handleChange} name="filiere" style={selectStyle}
                          onFocus={handleInputFocus} onBlur={handleInputBlur}>
                          <option value="">Sélectionner ta filière</option>
                          {filiereOptions.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    )}

                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      <label style={{ fontSize:12.5, fontWeight:500, color:labelCol, display:"flex", alignItems:"center", gap:5 }}>
                        <MapPin size={13}/> Ville
                      </label>
                      <select value={form.ville} onChange={handleVilleChange} style={selectStyle}
                        onFocus={handleInputFocus} onBlur={handleInputBlur}>
                        <option value="">Sélectionner ta ville</option>
                        {MOROCCAN_CITIES.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>

                    {form.ville && (
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <label style={{ fontSize:12.5, fontWeight:500, color:labelCol, display:"flex", alignItems:"center", gap:5 }}>
                          <Building2 size={13}/> Type d'établissement
                        </label>
                        <TypeToggle value={form.type_ecole} onChange={handleTypeChange} dark={dark}/>
                      </div>
                    )}

                    {form.ville && (
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <label style={{ fontSize:12.5, fontWeight:500, color:labelCol, display:"flex", alignItems:"center", gap:5 }}>
                          <School size={13}/> Nom de l'établissement
                        </label>
                        {availableSchools.length > 0 ? (
                          <>
                            <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                              <input type="text" placeholder="Rechercher…" value={schoolSearch}
                                style={{ ...inputStyle, paddingLeft:12 }}
                                onChange={e => { setSchoolSearch(e.target.value); set("nom_ecole",""); }}
                                onFocus={handleInputFocus} onBlur={handleInputBlur}
                              />
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:180, overflowY:"auto", border: dark?"1.5px solid rgba(255,255,255,0.1)":"1.5px solid #e8e4de", borderRadius:10, padding:6, background: dark?"rgba(255,255,255,0.03)":"#fafaf9" }}>
                              {availableSchools.map(s => (
                                <button key={s.name} type="button"
                                  onClick={() => { set("nom_ecole",s.name); setSchoolSearch(""); }}
                                  style={{
                                    display:"flex", alignItems:"center", justifyContent:"space-between",
                                    padding:"8px 10px", border:"none", borderRadius:7,
                                    background: form.nom_ecole===s.name ? "rgba(124,58,237,0.12)" : "transparent",
                                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                                    outline: form.nom_ecole===s.name ? "1.5px solid #7c3aed" : "none",
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background="rgba(124,58,237,0.08)"}
                                  onMouseLeave={e => e.currentTarget.style.background=form.nom_ecole===s.name?"rgba(124,58,237,0.12)":"transparent"}
                                >
                                  <span style={{ fontSize:13, color:textCol, fontWeight:500 }}>{s.name}</span>
                                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:99, background: s.type==="public"?"#e0f2fe":"#fef3c7", color: s.type==="public"?"#0369a1":"#92400e" }}>
                                    {s.type==="public"?"Public":"Privé"}
                                  </span>
                                </button>
                              ))}
                            </div>
                            {form.nom_ecole && (
                              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:"#10b981", padding:"4px 8px", background:"rgba(16,185,129,0.08)", borderRadius:6 }}>
                                <CheckCircle size={13}/> {form.nom_ecole}
                              </div>
                            )}
                            <p style={{ fontSize:12, color:subCol, textAlign:"center" }}>
                              Pas dans la liste ?{" "}
                              <button type="button" style={{ color:"#7c3aed", fontWeight:600, background:"none", border:"none", cursor:"pointer", fontSize:12, padding:0, fontFamily:"'DM Sans',sans-serif" }}
                                onClick={() => { set("nom_ecole",schoolSearch.trim()||"Autre"); setSchoolSearch(""); }}>
                                Saisir manuellement
                              </button>
                            </p>
                          </>
                        ) : (
                          <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                            <School size={13} style={{ position:"absolute", left:11, color:iconCol, pointerEvents:"none" }}/>
                            <input type="text" name="nom_ecole" value={form.nom_ecole} onChange={handleChange}
                              placeholder={form.ville?`Établissement à ${form.ville}`:"Nom de l'établissement"}
                              style={inputStyle}
                              onFocus={handleInputFocus} onBlur={handleInputBlur}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                      style={{
                        border: dragOver ? "2px dashed #7c3aed" : uploadedFile ? "2px dashed #10b981" : dark ? "2px dashed rgba(255,255,255,0.15)" : "2px dashed #e8e4de",
                        borderRadius: 14, padding:"32px 24px", textAlign:"center", cursor:"pointer",
                        background: dragOver ? "rgba(124,58,237,0.06)" : uploadedFile ? "rgba(16,185,129,0.05)" : dark ? "rgba(255,255,255,0.02)" : "#fafaf9",
                        transition:"all 0.2s",
                      }}>
                      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])} />
                      {uploadedFile ? (
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, color:textCol }}>
                          <CheckCircle size={32} color="#10b981"/>
                          <strong style={{ fontSize:14 }}>{uploadedFile.name}</strong>
                          <span style={{ fontSize:12, color:subCol }}>{(uploadedFile.size/1024).toFixed(0)} Ko</span>
                          <button type="button" onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
                            style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444", borderRadius:6, padding:"4px 10px", fontSize:12, cursor:"pointer", marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>
                            <X size={12}/> Supprimer
                          </button>
                        </div>
                      ) : (
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, color:subCol }}>
                          <Upload size={28} color="#7c3aed"/>
                          <strong style={{ fontSize:14, color:textCol }}>Glisse ton bulletin ici</strong>
                          <span style={{ fontSize:13 }}>ou clique pour parcourir</span>
                          <div style={{ marginTop:6, padding:"4px 12px", background:"rgba(124,58,237,0.1)", borderRadius:99, fontSize:11, color:"#7c3aed", fontWeight:600 }}>
                            PDF · JPG · PNG · max 5 Mo
                          </div>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize:12, color:subCol, textAlign:"center" }}>
                      Optionnel — tu peux l'ajouter plus tard depuis ton profil.
                    </p>
                  </div>
                )}

              </div>

              {/* Nav buttons */}
              <div style={{ display:"flex", gap:10, marginTop:16, alignItems:"center" }}>
                {step > 0 && (
                  <button type="button" onClick={back}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"11px 16px", background: dark?"rgba(124,58,237,0.15)":"#f3f0ff", color:"#7c3aed", border:"none", borderRadius:10, fontSize:14, fontWeight:500, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}
                    onMouseEnter={e => e.currentTarget.style.background=dark?"rgba(124,58,237,0.25)":"#ebe5ff"}
                    onMouseLeave={e => e.currentTarget.style.background=dark?"rgba(124,58,237,0.15)":"#f3f0ff"}
                  >
                    <ArrowLeft size={15}/> Retour
                  </button>
                )}
                {step < 2 ? (
                  <button type="button" onClick={next}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 20px", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", transition:"all 0.2s", boxShadow:"0 4px 16px rgba(124,58,237,0.3)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(124,58,237,0.45)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(124,58,237,0.3)"; }}
                  >
                    <span>Continuer</span> <ArrowRight size={15}/>
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 20px", background:loading?"rgba(124,58,237,0.5)":"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor:loading?"not-allowed":"pointer", transition:"all 0.2s", boxShadow:"0 4px 16px rgba(124,58,237,0.3)" }}>
                    <span>{loading?"Création…":"Créer mon compte"}</span> <ArrowRight size={15}/>
                  </button>
                )}
              </div>
            </>
          )}

          <p style={{ textAlign:"center", marginTop:18, fontSize:13, color:footerC }}>
            Déjà un compte ?{" "}
            <button type="button" onClick={goLogin}
              style={{ color:"#7c3aed", fontWeight:600, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:0 }}>
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const leftPanel = (
    <div className={leftWrapClass} style={{ display: isMobile ? "none" : undefined, minHeight: "100vh", height: "100%" }}>
      <AuthLeft step={step} />
    </div>
  );

  return (
    <div className={styles.page} style={{ minHeight:"100vh", background:pageBg, display:"flex", transition:"background 0.5s ease" }}>
      <div style={{ display:"flex", minHeight:"100vh", width:"100%", background:pageBg, transition:"all 0.4s" }}>
        {panelSwapped
          ? <>{formPanel}{leftPanel}</>
          : <>{leftPanel}{formPanel}</>
        }
      </div>
    </div>
  );
}