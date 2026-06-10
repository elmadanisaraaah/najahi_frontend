import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/UI/ThemeToggle";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Qui sommes-nous ?",
    content: `Najahi (نجاحي) est une plateforme scolaire marocaine conçue pour accompagner les élèves et étudiants dans leur orientation, leurs études et leur réussite académique.

Développée par Sara Elmadani, Najahi est accessible via le web à l'adresse najahi-frontend.vercel.app.

Pour toute question relative à vos données personnelles, contactez-nous à : saraelmadanijop@gmail.com`,
  },
  {
    title: "2. Données collectées",
    content: `Dans le cadre de l'utilisation de Najahi, nous collectons les données suivantes :

• Données d'identification : adresse e-mail, prénom, nom de famille, numéro de téléphone (optionnel).
• Données de profil : ville de résidence, niveau scolaire, type et note du baccalauréat, filière actuelle.
• Données d'orientation : réponses au test d'orientation, résultats et recommandations d'écoles générés.
• Données scolaires : bulletins scolaires téléchargés (stockés de façon sécurisée, limités à 5 fichiers par utilisateur).
• Données d'utilisation : sessions d'étude (durée, horodatage), historique des salles d'étude rejointes, conversations avec le chatbot d'orientation scolaire.
• Données techniques : adresse IP lors de la connexion, agent utilisateur du navigateur, horodatage des connexions.`,
  },
  {
    title: "3. Finalités du traitement",
    content: `Vos données sont utilisées exclusivement pour :

• Créer et gérer votre compte utilisateur sur la plateforme.
• Personnaliser votre expérience et afficher les informations pertinentes de votre profil.
• Calculer et afficher les résultats de votre test d'orientation scolaire.
• Permettre la participation aux salles d'étude collaboratives et au mode Solo.
• Vous envoyer des e-mails transactionnels (vérification de compte, réinitialisation de mot de passe).
• Améliorer les fonctionnalités de la plateforme sur la base d'analyses agrégées et anonymisées.

Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers à des fins commerciales.`,
  },
  {
    title: "4. Base légale du traitement",
    content: `Le traitement de vos données repose sur :

• Votre consentement explicite lors de la création de votre compte.
• L'exécution du contrat de service que constitue votre inscription à Najahi.
• Le respect de nos obligations légales en vertu de la loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel (Maroc).`,
  },
  {
    title: "5. Durée de conservation",
    content: `Vos données personnelles sont conservées tant que votre compte est actif. En cas de suppression de votre compte, l'ensemble de vos données est supprimé dans un délai de 30 jours, à l'exception des données nécessaires au respect de nos obligations légales.

Les bulletins scolaires sont supprimés immédiatement lors de leur retrait par l'utilisateur.`,
  },
  {
    title: "6. Sécurité des données",
    content: `Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données contre tout accès non autorisé, perte, destruction ou divulgation :

• Chiffrement des mots de passe (bcrypt).
• Authentification par jetons JWT à durée limitée avec mécanisme de rafraîchissement sécurisé.
• Transmission des données via HTTPS (TLS).
• En-têtes de sécurité HTTP (HSTS, CSP, X-Frame-Options, etc.).
• Stockage des avatars sur Cloudinary avec accès sécurisé.`,
  },
  {
    title: "7. Vos droits (Loi 09-08)",
    content: `Conformément à la loi marocaine 09-08 relative à la protection des données personnelles, vous disposez des droits suivants :

• Droit d'accès : obtenir une copie de vos données personnelles que nous traitons.
• Droit de rectification : corriger des données inexactes ou incomplètes.
• Droit d'opposition : vous opposer au traitement de vos données pour des motifs légitimes.
• Droit de suppression : demander l'effacement de votre compte et de l'ensemble de vos données.

Pour exercer ces droits, envoyez votre demande par e-mail à saraelmadanijop@gmail.com en précisant votre identité. Nous nous engageons à y répondre dans un délai de 30 jours.`,
  },
  {
    title: "8. Cookies et stockage local",
    content: `Najahi utilise le stockage local du navigateur (localStorage) pour maintenir votre session de connexion et mémoriser vos préférences (thème clair/sombre, langue). Aucun cookie de traçage publicitaire n'est utilisé.`,
  },
  {
    title: "9. Services tiers",
    content: `Najahi fait appel aux services tiers suivants, chacun disposant de sa propre politique de confidentialité :

• Google OAuth 2.0 : authentification optionnelle via votre compte Google.
• Cloudinary : hébergement sécurisé des photos de profil.
• Resend : envoi des e-mails transactionnels.
• Railway : hébergement de l'API backend.
• Vercel : hébergement du frontend.`,
  },
  {
    title: "10. Modifications",
    content: `Cette politique de confidentialité peut être mise à jour ponctuellement. En cas de modification substantielle, vous serez informé par e-mail ou via une notification sur la plateforme. La date de dernière mise à jour est indiquée en bas de cette page.`,
  },
  {
    title: "11. Contact",
    content: `Pour toute question, demande ou réclamation concernant vos données personnelles :

E-mail : saraelmadanijop@gmail.com
Plateforme : najahi-frontend.vercel.app`,
  },
];

export default function PrivacyPolicy() {
  const { theme } = useTheme();
  const navigate  = useNavigate();
  const dark      = theme === "dark";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const bg      = dark ? "linear-gradient(160deg,#07071a 0%,#0e0826 55%,#071220 100%)" : "linear-gradient(160deg,#f5f3ff 0%,#faf7ff 55%,#eef2ff 100%)";
  const navBg   = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const cardBg  = dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.92)";
  const border  = dark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.07)";
  const text    = dark ? "#f1f5f9" : "#1a1a2e";
  const muted   = dark ? "rgba(255,255,255,0.5)"   : "rgba(0,0,0,0.5)";
  const body    = dark ? "rgba(255,255,255,0.75)"  : "rgba(0,0,0,0.72)";

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
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:99, marginBottom:18 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#7c3aed", letterSpacing:"0.5px" }}>POLITIQUE DE CONFIDENTIALITÉ</span>
            </div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:36, fontWeight:700, letterSpacing:"-0.5px", marginBottom:12, lineHeight:1.2 }}>
              Protection de vos données personnelles
            </h1>
            <p style={{ fontSize:14, color:muted, lineHeight:1.7 }}>
              Dernière mise à jour : <strong>Juin 2026</strong> · Applicable à la plateforme Najahi (najahi-frontend.vercel.app)
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
          <div style={{ marginTop:32, padding:"20px 24px", background:"rgba(124,58,237,0.07)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:14, textAlign:"center" }}>
            <p style={{ fontSize:13, color:muted, margin:0 }}>
              © 2026 Najahi — Sara Elmadani · Tous droits réservés
              <br />
              <a href="mailto:saraelmadanijop@gmail.com" style={{ color:"#7c3aed", textDecoration:"none", fontWeight:600 }}>saraelmadanijop@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
