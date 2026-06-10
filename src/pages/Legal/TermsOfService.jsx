import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Présentation de Najahi",
    content: `Najahi (نجاحي) est une plateforme scolaire marocaine en ligne permettant aux élèves et étudiants de réaliser des tests d'orientation, d'explorer les établissements d'enseignement supérieur marocains, et de participer à des sessions d'étude collaboratives.

La plateforme est développée et exploitée par Sara Elmadani (ci-après « la Créatrice »). En utilisant Najahi, vous acceptez les présentes conditions dans leur intégralité. Si vous n'acceptez pas ces conditions, veuillez cesser d'utiliser la plateforme.`,
  },
  {
    title: "2. Accès à la plateforme",
    content: `L'accès à Najahi est gratuit et ouvert à toute personne âgée d'au moins 13 ans. La création d'un compte est nécessaire pour accéder à l'ensemble des fonctionnalités.

Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les actions effectuées depuis votre compte. Vous vous engagez à nous signaler immédiatement toute utilisation non autorisée de votre compte à l'adresse saraelmadanijop@gmail.com.

Nous nous réservons le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes conditions.`,
  },
  {
    title: "3. Propriété intellectuelle",
    content: `© 2026 Najahi — Sara Elmadani. Tous droits réservés.

L'ensemble des éléments constituant la plateforme Najahi — notamment le code source, le design, les textes, les graphiques, le logo, les algorithmes d'orientation, et les contenus éditoriaux — sont la propriété exclusive des Créateurs et sont protégés par les lois marocaines et internationales relatives à la propriété intellectuelle.

Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, de l'un quelconque de ces éléments, par quelque moyen que ce soit, est strictement interdite sans autorisation écrite préalable des Créateurs.

La plateforme Najahi est distribuée sous licence MIT pour sa partie open-source. Voir le fichier LICENSE du dépôt pour les détails.`,
  },
  {
    title: "4. Utilisation acceptable",
    content: `En utilisant Najahi, vous vous engagez à :

• Ne pas utiliser la plateforme à des fins illégales ou non autorisées.
• Ne pas tenter d'accéder à des données appartenant à d'autres utilisateurs.
• Ne pas publier de contenu offensant, trompeur ou portant atteinte aux droits de tiers.
• Ne pas tenter de perturber le fonctionnement des serveurs ou des réseaux de la plateforme.
• Ne pas créer de comptes multiples à des fins de contournement de restrictions.
• Ne pas utiliser des robots, scripts ou autres outils automatisés pour extraire des données de la plateforme sans autorisation.

Le non-respect de ces règles peut entraîner la suspension immédiate de votre compte.`,
  },
  {
    title: "5. Données personnelles",
    content: `La collecte et le traitement de vos données personnelles sont régis par notre Politique de confidentialité, disponible à l'adresse /privacy.

En créant un compte sur Najahi, vous acceptez que vos données soient traitées conformément à cette politique et en accord avec la loi marocaine 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.`,
  },
  {
    title: "6. Contenu utilisateur",
    content: `Najahi vous permet de télécharger des bulletins scolaires (limités à 5 fichiers PDF par utilisateur). En téléchargeant ces documents, vous déclarez en être le propriétaire légitime et acceptez qu'ils soient stockés de façon sécurisée sur nos serveurs dans le seul but d'alimenter votre profil.

Vous conservez l'entière propriété de vos documents. Vous pouvez les supprimer à tout moment depuis votre espace profil.`,
  },
  {
    title: "7. Disponibilité et modifications",
    content: `Nous nous efforçons de maintenir Najahi accessible 24h/24, 7j/7, mais nous ne pouvons garantir une disponibilité ininterrompue. Des interruptions pour maintenance, mises à jour ou incidents techniques peuvent survenir.

Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie des fonctionnalités de la plateforme à tout moment, sans préavis ni responsabilité envers les utilisateurs.

Nous nous réservons également le droit de modifier les présentes conditions d'utilisation. Toute modification substantielle sera communiquée aux utilisateurs par e-mail ou via la plateforme.`,
  },
  {
    title: "8. Limitation de responsabilité",
    content: `La plateforme Najahi est fournie « en l'état », sans garantie d'aucune sorte, expresse ou implicite. Les Créateurs ne sauraient être tenus responsables :

• Des décisions d'orientation prises sur la base des résultats générés par la plateforme (les recommandations ont une valeur indicative uniquement).
• Des pertes de données, interruptions de service ou dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme.
• Du contenu de sites tiers vers lesquels la plateforme pourrait rediriger.`,
  },
  {
    title: "9. Loi applicable et juridiction",
    content: `Les présentes conditions d'utilisation sont régies et interprétées conformément au droit marocain.

En cas de litige relatif à l'interprétation ou à l'exécution des présentes conditions, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux compétents du Maroc seront seuls habilités à connaître du différend.`,
  },
  {
    title: "10. Contact",
    content: `Pour toute question relative aux présentes conditions d'utilisation :

E-mail : saraelmadanijop@gmail.com
Plateforme : najahi-frontend.vercel.app`,
  },
];

export default function TermsOfService() {
  const { theme } = useTheme();
  const navigate  = useNavigate();
  const dark      = theme === "dark";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const bg     = dark ? "linear-gradient(160deg,#07071a 0%,#0e0826 55%,#071220 100%)" : "linear-gradient(160deg,#f5f3ff 0%,#faf7ff 55%,#eef2ff 100%)";
  const navBg  = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const cardBg = dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.92)";
  const border = dark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.07)";
  const text   = dark ? "#f1f5f9" : "#1a1a2e";
  const muted  = dark ? "rgba(255,255,255,0.5)"   : "rgba(0,0,0,0.5)";
  const body   = dark ? "rgba(255,255,255,0.75)"  : "rgba(0,0,0,0.72)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes lgl-fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div style={{ minHeight:"100vh", background:bg, fontFamily:"'DM Sans',sans-serif", color:text }}>

        {/* Nav */}
        <nav style={{ position:"sticky", top:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", height:56, background:navBg, backdropFilter:"blur(18px)", borderBottom:`1px solid ${border}` }}>
          <button onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:"transparent", border:`1px solid ${border}`, borderRadius:9, color:muted, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <ArrowLeft size={14} /> Retour
          </button>
          <ThemeToggle />
        </nav>

        <div style={{ maxWidth:760, margin:"0 auto", padding:"40px 24px 80px", animation:"lgl-fadeUp 0.5s ease" }}>

          {/* Header */}
          <div style={{ marginBottom:40 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:99, marginBottom:18 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#10b981", letterSpacing:"0.5px" }}>CONDITIONS D'UTILISATION</span>
            </div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:36, fontWeight:700, letterSpacing:"-0.5px", marginBottom:12, lineHeight:1.2 }}>
              Conditions générales d'utilisation
            </h1>
            <p style={{ fontSize:14, color:muted, lineHeight:1.7 }}>
              Dernière mise à jour : <strong>Juin 2026</strong> · En utilisant Najahi, vous acceptez ces conditions.
            </p>
          </div>

          {/* Sections */}
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {SECTIONS.map((s, i) => (
              <div key={i} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:16, padding:"24px 28px", backdropFilter:"blur(16px)", marginBottom:12 }}>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, marginBottom:14, color:text }}>{s.title}</h2>
                <div style={{ fontSize:14, lineHeight:1.9, color:body, whiteSpace:"pre-line" }}>{s.content}</div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{ marginTop:32, padding:"20px 24px", background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:14, textAlign:"center" }}>
            <p style={{ fontSize:13, color:muted, margin:0 }}>
              © 2026 Najahi — Sara Elmadani · Tous droits réservés
              <br />
              <a href="mailto:saraelmadanijop@gmail.com" style={{ color:"#10b981", textDecoration:"none", fontWeight:600 }}>saraelmadanijop@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
