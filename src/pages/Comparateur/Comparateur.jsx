import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, X, Search, ExternalLink, Plus, GraduationCap, Settings2, Monitor, Settings, Radio, Plug, BarChart3, TrendingUp, Stethoscope, Building2, Globe, Laptop, Store, Landmark } from "lucide-react";

function useTheme() {
  const [dark] = useState(() => {
    const s = localStorage.getItem("najahi_theme");
    return s ? s === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  return dark;
}

// ── Complete school database for comparison ───────────────────────────────────
const SCHOOLS_DB = [
  {
    id: "cpge", name: "CPGE", color: "#8b5cf6", icon: GraduationCap,
    full: "Classes Préparatoires aux Grandes Écoles",
    ville: "Rabat, Casablanca, Fès, Marrakech…",
    duree: "2 ans",
    frais: "~500 MAD/an (public)",
    filieres: "Maths Sup/Spé (MP, PC, PSI), BCPST, ECE, ECS",
    conditions: "Bac SM ou SP · 17+/20 · Excellent dossier scolaire",
    debouches: "Grandes écoles via CNC (EMI, ENSIAS, ENSA, INPT, EHTP…)",
    website: "https://www.men.gov.ma",
  },
  {
    id: "ensa", name: "ENSA", color: "#3b82f6", icon: Settings2,
    full: "École Nationale des Sciences Appliquées",
    ville: "Rabat, Agadir, Fès, Oujda, Marrakech, Tanger…",
    duree: "5 ans (accès direct bac ou via CPGE)",
    frais: "~1 000–2 000 MAD/an (public)",
    filieres: "Génie Civil, Génie Électrique, Génie Industriel, Informatique",
    conditions: "Bac SM ou SP · 15+/20",
    debouches: "Ingénieur BTP, énergie, industrie, informatique",
    website: "https://ensa.um5.ac.ma",
  },
  {
    id: "ensias", name: "ENSIAS", color: "#3b82f6", icon: Monitor,
    full: "École Nationale Supérieure d'Informatique et d'Analyse des Systèmes",
    ville: "Rabat",
    duree: "2 ans après CPGE (cycle ingénieur)",
    frais: "~1 000 MAD/an (public)",
    filieres: "Génie Logiciel, Systèmes Intelligents, RSSI, Génie Décisionnel",
    conditions: "Bac SM · CPGE · Concours CNC",
    debouches: "Ingénieur logiciel, data scientist, architecte SI, cybersécurité",
    website: "http://www.ensias.um5.ac.ma",
  },
  {
    id: "emi", name: "EMI", color: "#3b82f6", icon: Settings,
    full: "École Mohammadia d'Ingénieurs",
    ville: "Rabat",
    duree: "2 ans après CPGE (cycle ingénieur)",
    frais: "~1 500 MAD/an (public)",
    filieres: "Génie Civil, Génie Électrique, Génie Mécanique, Génie Informatique",
    conditions: "Bac SM · CPGE · Concours CNC",
    debouches: "Ingénieur dans le BTP, énergie, industrie, conseil",
    website: "http://www.emi.ac.ma",
  },
  {
    id: "inpt", name: "INPT", color: "#06b6d4", icon: Radio,
    full: "Institut National des Postes et Télécommunications",
    ville: "Rabat",
    duree: "3 ans (cycle ingénieur)",
    frais: "~3 000 MAD/an (public)",
    filieres: "Télécommunications, Réseaux, Cybersécurité, Data Science",
    conditions: "Bac SM ou SP · 15+/20 · Concours INPT",
    debouches: "Ingénieur télécom, réseau, sécurité informatique, IA",
    website: "https://www.inpt.ac.ma",
  },
  {
    id: "ehtp", name: "EHTP", color: "#3b82f6", icon: Plug,
    full: "École Hassania des Travaux Publics",
    ville: "Casablanca",
    duree: "2 ans après CPGE (cycle ingénieur)",
    frais: "~2 000 MAD/an (public)",
    filieres: "Travaux Publics, Génie Civil, Génie Électrique, Hydraulique",
    conditions: "Bac SM · CPGE · Concours CNC",
    debouches: "Ingénieur en infrastructure, BTP, énergie, transports",
    website: "http://www.ehtp.ac.ma",
  },
  {
    id: "encg", name: "ENCG", color: "#10b981", icon: BarChart3,
    full: "École Nationale de Commerce et de Gestion",
    ville: "Settat, Casablanca, Agadir, Tanger, Fès, Marrakech…",
    duree: "5 ans (Licence + Master)",
    frais: "~2 000 MAD/an (public)",
    filieres: "Commerce, Finance, Marketing, Management, RH, Logistique",
    conditions: "Bac SM/SP/SVT/SE · 14+/20 · Concours ENCG",
    debouches: "Cadre commercial, contrôleur de gestion, marketing, banque",
    website: "https://www.encg-settat.ac.ma",
  },
  {
    id: "iscae", name: "ISCAE", color: "#10b981", icon: TrendingUp,
    full: "Institut Supérieur de Commerce et d'Administration des Entreprises",
    ville: "Casablanca / Rabat",
    duree: "5 ans (Licence + MBA)",
    frais: "~5 000–8 000 MAD/an (semi-public)",
    filieres: "Finance, Marketing, Audit, RH, Commerce International, Entrepreneuriat",
    conditions: "Bac SM/SP/SVT/SE · 14+/20 · Concours",
    debouches: "Manager, auditeur, directeur financier, consultant, DAF",
    website: "https://www.iscae.ac.ma",
  },
  {
    id: "medecine", name: "Médecine", color: "#ef4444", icon: Stethoscope,
    full: "Faculté de Médecine et de Pharmacie",
    ville: "Rabat, Casablanca, Fès, Marrakech, Oujda",
    duree: "7 ans (généraliste) à 11+ ans (spécialiste)",
    frais: "~700 MAD/an (public)",
    filieres: "Médecine générale, Pharmacie, Médecine dentaire",
    conditions: "Bac SM/SP/SVT · 16+/20 · Concours national de Médecine",
    debouches: "Médecin généraliste, spécialiste, pharmacien, chirurgien",
    website: "https://fmp.um5.ac.ma",
  },
  {
    id: "um6p", name: "UM6P", color: "#f59e0b", icon: Building2,
    full: "Université Mohammed VI Polytechnique",
    ville: "Ben Guerir (Marrakech)",
    duree: "3 à 5 ans selon le programme",
    frais: "Bourse mérite possible, sinon 40 000–80 000 MAD/an",
    filieres: "Sciences des Matériaux, Agriculture, Énergie, Data Science, Génie Industriel",
    conditions: "Bac SM/SP · 16+/20 · Dossier + entretien en anglais",
    debouches: "Chercheur, ingénieur R&D, agri-tech, énergie renouvelable",
    website: "https://www.um6p.ma",
  },
  {
    id: "uir", name: "UIR", color: "#f97316", icon: Globe,
    full: "Université Internationale de Rabat",
    ville: "Rabat (campus Technopolis)",
    duree: "3 à 5 ans",
    frais: "35 000–60 000 MAD/an",
    filieres: "Aéronautique, Énergie, Digital & IA, Business, Droit, Architecture",
    conditions: "Bac toutes filières · 14+/20 · Entretien",
    debouches: "Ingénieur aéronautique, pilote, juriste, manager, analyste",
    website: "https://www.uir.ac.ma",
  },
  {
    id: "emsi", name: "EMSI", color: "#f59e0b", icon: Laptop,
    full: "École Marocaine des Sciences de l'Ingénieur",
    ville: "Casablanca, Rabat, Marrakech, Fès, Oujda",
    duree: "5 ans",
    frais: "25 000–40 000 MAD/an",
    filieres: "Informatique, Réseaux & Télécoms, Génie Civil, Génie Électrique",
    conditions: "Bac SM/SP · 13+/20",
    debouches: "Ingénieur, développeur, architecte réseau, chef de projet IT",
    website: "https://www.emsi.ma",
  },
  {
    id: "hem", name: "HEM", color: "#06b6d4", icon: Store,
    full: "Hautes Études de Management",
    ville: "Casablanca, Rabat, Marrakech, Tanger",
    duree: "5 ans (Bachelor + Master)",
    frais: "30 000–45 000 MAD/an",
    filieres: "Management Général, Finance, Marketing, Entrepreneuriat, RH",
    conditions: "Bac toutes filières · 13+/20 · Test d'admission + entretien",
    debouches: "Manager, entrepreneur, directeur commercial, consultant RH",
    website: "https://www.hem.ac.ma",
  },
  {
    id: "architecture", name: "Architecture", color: "#8b5cf6", icon: Landmark,
    full: "École Nationale d'Architecture",
    ville: "Rabat (+ antennes à Tétouan, Marrakech, Fès)",
    duree: "5 ans (cycle ingénieur) + 1 an DESA",
    frais: "~1 000 MAD/an (public)",
    filieres: "Architecture, Urbanisme et Aménagement du Territoire",
    conditions: "Bac SM/SP/Lettres · 13+/20 · Concours ENA (dessin + culture)",
    debouches: "Architecte, urbaniste, chef de projet immobilier, patrimoine",
    website: "https://www.ena.ac.ma",
  },
];

const ROWS = [
  { key: "full",       label: "Nom complet" },
  { key: "ville",      label: "Ville(s)" },
  { key: "duree",      label: "Durée" },
  { key: "frais",      label: "Frais annuels" },
  { key: "filieres",   label: "Filières" },
  { key: "conditions", label: "Conditions d'admission" },
  { key: "debouches",  label: "Débouchés" },
  { key: "website",    label: "Site officiel" },
];

const MAX = 3;

export default function Comparateur() {
  const navigate = useNavigate();
  const dark     = useTheme();

  const [selected, setSelected] = useState([]);
  const [query, setQuery]       = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const searchRef = useRef(null);

  const bg    = dark ? "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" : "linear-gradient(135deg,#e9e4ff,#f0f4ff,#fdf6ff)";
  const card  = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)";
  const border= dark ? "rgba(255,255,255,0.1)"  : "rgba(124,58,237,0.15)";
  const txt   = dark ? "#f3f4f6" : "#1e1b4b";
  const sub   = dark ? "rgba(255,255,255,0.5)" : "rgba(30,27,75,0.5)";
  const inp   = dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.9)";

  const filtered = SCHOOLS_DB.filter(s =>
    !selected.find(x => x.id === s.id) &&
    (s.name.toLowerCase().includes(query.toLowerCase()) ||
     s.full.toLowerCase().includes(query.toLowerCase()))
  );

  const add = (school) => {
    if (selected.length >= MAX) return;
    setSelected(p => [...p, school]);
    setQuery("");
    setShowDrop(false);
  };

  const remove = (id) => setSelected(p => p.filter(s => s.id !== id));

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (!searchRef.current?.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:bg, padding:"0 16px 60px", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 3px; }
        .comp-drop::-webkit-scrollbar { height: 4px; }
      `}</style>

      {/* Ambient blobs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%)", top:"-10%", right:"-5%" }} />
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,0.07),transparent 70%)", bottom:"5%", left:"-5%" }} />
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:1100, margin:"0 auto" }}>
        {/* Top nav */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"20px 0 0" }}>
          <button onClick={() => navigate("/app/dashboard")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"transparent", border:`1px solid ${border}`, borderRadius:12, color:txt, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            <ArrowLeft size={14} /> Tableau de bord
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign:"center", padding:"28px 0 24px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, borderRadius:16, background:"rgba(124,58,237,0.12)", border:`1px solid ${border}`, marginBottom:14 }}>
            <Scale size={26} color="#7c3aed" />
          </div>
          <h1 style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"clamp(22px,5vw,32px)", color:txt, lineHeight:1.15 }}>
            Comparateur d'écoles
          </h1>
          <p style={{ margin:"8px 0 0", color:sub, fontSize:14 }}>
            Sélectionne jusqu'à {MAX} établissements pour les comparer côte à côte.
          </p>
        </div>

        {/* Search + selected chips */}
        <div style={{ background:card, backdropFilter:"blur(16px)", border:`1px solid ${border}`, borderRadius:20, padding:"22px 24px", marginBottom:28, boxShadow: dark?"0 8px 40px rgba(0,0,0,0.35)":"0 8px 40px rgba(124,58,237,0.08)" }}>
          {/* Selected chips */}
          {selected.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
              {selected.map(s => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px", borderRadius:99, background:s.color+"22", border:`1.5px solid ${s.color}55`, fontSize:13, fontWeight:700, color:s.color, fontFamily:"'DM Sans',sans-serif" }}>
                  {s.icon && <s.icon size={13} />}
                  <span>{s.name}</span>
                  <button onClick={() => remove(s.id)} style={{ display:"flex", alignItems:"center", background:"none", border:"none", cursor:"pointer", color:s.color, padding:0, marginLeft:2 }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search input */}
          {selected.length < MAX && (
            <div ref={searchRef} style={{ position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:inp, border:`1.5px solid ${border}`, borderRadius:12 }}>
                <Search size={16} color={sub} style={{ flexShrink:0 }} />
                <input
                  value={query}
                  onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
                  onFocus={() => setShowDrop(true)}
                  placeholder="Chercher un établissement…"
                  style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:14, color:txt, fontFamily:"'DM Sans',sans-serif" }}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setShowDrop(false); }} style={{ background:"none", border:"none", cursor:"pointer", color:sub, display:"flex", alignItems:"center", padding:0 }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {showDrop && filtered.length > 0 && (
                <div className="comp-drop" style={{ position:"absolute", top:"calc(100%+6px)", left:0, right:0, background: dark?"rgba(20,14,40,0.98)":"#fff", border:`1px solid ${border}`, borderRadius:14, zIndex:99, maxHeight:260, overflowY:"auto", boxShadow:"0 12px 40px rgba(0,0,0,0.2)", padding:"6px 0" }}>
                  {filtered.map(s => (
                    <button key={s.id} onClick={() => add(s)}
                      style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"10px 16px", background:"none", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e => e.currentTarget.style.background = dark?"rgba(255,255,255,0.06)":"rgba(124,58,237,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      {s.icon && <s.icon size={20} />}
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color: dark?"#f3f4f6":"#1e1b4b" }}>{s.name}</div>
                        <div style={{ fontSize:11, color:sub }}>{s.full}</div>
                      </div>
                      <Plus size={14} color="#7c3aed" style={{ marginLeft:"auto", flexShrink:0 }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selected.length === 0 && (
            <p style={{ textAlign:"center", color:sub, fontSize:13, margin:"8px 0 0" }}>
              Commence par chercher une école ci-dessus.
            </p>
          )}
          {selected.length === MAX && (
            <p style={{ textAlign:"center", color:"#f59e0b", fontSize:12, fontWeight:600, margin:"0", padding:"8px 0 0" }}>
              Maximum {MAX} écoles atteint. Retire une école pour en ajouter une autre.
            </p>
          )}
        </div>

        {/* Comparison table */}
        {selected.length >= 2 && (
          <div style={{ background:card, backdropFilter:"blur(16px)", border:`1px solid ${border}`, borderRadius:20, overflow:"hidden", boxShadow: dark?"0 8px 40px rgba(0,0,0,0.35)":"0 8px 40px rgba(124,58,237,0.08)" }}>
            {/* Table header */}
            <div style={{ display:"grid", gridTemplateColumns:`180px repeat(${selected.length},1fr)`, borderBottom:`1px solid ${border}` }}>
              <div style={{ padding:"18px 20px", background: dark?"rgba(255,255,255,0.03)":"rgba(124,58,237,0.04)" }} />
              {selected.map(s => (
                <div key={s.id} style={{ padding:"18px 16px", textAlign:"center", borderLeft:`1px solid ${border}`, background: dark?"rgba(255,255,255,0.03)":"rgba(124,58,237,0.04)" }}>
                  <div style={{ marginBottom:6 }}>{s.icon && <s.icon size={28} color={s.color} />}</div>
                  <div style={{ fontWeight:800, fontSize:16, color:s.color, fontFamily:"'Fraunces',serif" }}>{s.name}</div>
                </div>
              ))}
            </div>

            {/* Table body */}
            {ROWS.map((row, ri) => (
              <div key={row.key} style={{ display:"grid", gridTemplateColumns:`180px repeat(${selected.length},1fr)`, borderBottom: ri < ROWS.length - 1 ? `1px solid ${border}` : "none" }}>
                {/* Row label */}
                <div style={{ padding:"16px 20px", display:"flex", alignItems:"flex-start", background: dark?"rgba(255,255,255,0.015)":"rgba(124,58,237,0.025)", borderRight:`1px solid ${border}` }}>
                  <span style={{ fontSize:12, fontWeight:700, color:sub, textTransform:"uppercase", letterSpacing:"0.4px", lineHeight:1.4 }}>
                    {row.label}
                  </span>
                </div>
                {/* Row values */}
                {selected.map(s => (
                  <div key={s.id} style={{ padding:"16px 16px", borderLeft:`1px solid ${border}` }}>
                    {row.key === "website" ? (
                      <a href={s.website} target="_blank" rel="noopener noreferrer"
                        style={{ display:"inline-flex", alignItems:"center", gap:6, color:s.color, fontSize:13, fontWeight:600, textDecoration:"none", fontFamily:"'DM Sans',sans-serif" }}>
                        <ExternalLink size={13} /> Site officiel
                      </a>
                    ) : (
                      <span style={{ fontSize:13, color:txt, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
                        {s[row.key]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty state when only 1 selected */}
        {selected.length === 1 && (
          <div style={{ textAlign:"center", padding:"48px 24px", color:sub }}>
            <Scale size={40} style={{ opacity:0.25, marginBottom:14 }} />
            <p style={{ fontSize:15, fontWeight:600, margin:0 }}>Ajoute au moins une autre école pour comparer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
