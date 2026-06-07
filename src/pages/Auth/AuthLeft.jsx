import { useEffect, useState } from "react";
import styles from "./Auth.module.css";

const STEPS = [
  {
    headline: "Commence ton",
    highlight: "avenir ici.",
    sub: "Crée ton compte en 3 minutes et rejoins des milliers d'étudiants marocains.",
    visual: (
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgAnim}>
        <circle cx="120" cy="120" r="90" stroke="rgba(167,139,250,0.12)" strokeWidth="1"/>
        <circle cx="120" cy="120" r="65" stroke="rgba(167,139,250,0.18)" strokeWidth="1"/>
        <circle cx="120" cy="120" r="40" stroke="rgba(167,139,250,0.28)" strokeWidth="1.5"/>
        <circle cx="120" cy="120" r="8" fill="#a78bfa" className={styles.pulseDot}/>
        <circle cx="120" cy="30" r="5" fill="#7c3aed" opacity="0.8" className={styles.orbitDot1}/>
        <circle cx="210" cy="120" r="4" fill="#818cf8" opacity="0.7" className={styles.orbitDot2}/>
        <circle cx="120" cy="210" r="5" fill="#7c3aed" opacity="0.8" className={styles.orbitDot3}/>
        <circle cx="30" cy="120" r="4" fill="#818cf8" opacity="0.7" className={styles.orbitDot4}/>
        <path d="M120 55 L120 185 M55 120 L185 120" stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 6" className={styles.dashAnim}/>
        <path d="M75 75 L165 165 M165 75 L75 165" stroke="rgba(167,139,250,0.15)" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 8"/>
      </svg>
    ),
  },
  {
    headline: "Ton parcours,",
    highlight: "ton chemin.",
    sub: "On adapte chaque recommandation à ton niveau, ta filière et ta ville.",
    visual: (
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgAnim}>
        <rect x="20" y="150" width="44" height="70" rx="6" fill="rgba(124,58,237,0.25)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" className={styles.bar1}/>
        <rect x="98" y="105" width="44" height="115" rx="6" fill="rgba(124,58,237,0.45)" stroke="rgba(167,139,250,0.55)" strokeWidth="1.5" className={styles.bar2}/>
        <rect x="176" y="55" width="44" height="165" rx="6" fill="rgba(124,58,237,0.75)" stroke="rgba(167,139,250,0.85)" strokeWidth="1.5" className={styles.bar3}/>
        <path d="M42 145 Q90 100 120 95 Q155 85 198 50" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" className={styles.lineDraw}/>
        <circle cx="198" cy="50" r="6" fill="#a78bfa" className={styles.pulseDot}/>
        <circle cx="42" cy="145" r="4" fill="rgba(167,139,250,0.6)"/>
        <circle cx="120" cy="95" r="4" fill="rgba(167,139,250,0.6)"/>
      </svg>
    ),
  },
  {
    headline: "Tes notes,",
    highlight: "notre IA.",
    sub: "Upload ton bulletin et laisse l'IA analyser tes forces pour une orientation sur mesure.",
    visual: (
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgAnim}>
        <rect x="60" y="30" width="120" height="155" rx="12" fill="rgba(20,16,40,0.7)" stroke="rgba(167,139,250,0.25)" strokeWidth="1.5" className={styles.docFloat}/>
        <rect x="78" y="55" width="84" height="9" rx="4.5" fill="rgba(167,139,250,0.5)" className={styles.line1}/>
        <rect x="78" y="74" width="64" height="7" rx="3.5" fill="rgba(167,139,250,0.3)" className={styles.line2}/>
        <rect x="78" y="91" width="74" height="7" rx="3.5" fill="rgba(167,139,250,0.3)" className={styles.line3}/>
        <rect x="78" y="108" width="54" height="7" rx="3.5" fill="rgba(167,139,250,0.2)"/>
        <rect x="78" y="130" width="84" height="40" rx="8" fill="rgba(124,58,237,0.3)" stroke="rgba(124,58,237,0.6)" strokeWidth="1" className={styles.uploadBox}/>
        <path d="M120 140 L120 158 M113 150 L120 158 L127 150" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.arrowAnim}/>
        <circle cx="172" cy="178" r="26" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.45)" strokeWidth="2" className={styles.checkCircle}/>
        <path d="M161 178 L168 185 L183 169" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={styles.checkMark}/>
      </svg>
    ),
  },
];

const LOGIN_CONTENT = {
  headline: "Bon retour",
  highlight: "parmi nous.",
  sub: "Retrouve tes recommandations IA, tes salles d'étude et ton parcours personnalisé.",
  visual: (
    <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgAnim}>
      <circle cx="120" cy="88" r="42" fill="rgba(124,58,237,0.15)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" className={styles.pulseDot}/>
      <circle cx="120" cy="78" r="24" fill="rgba(124,58,237,0.35)" stroke="rgba(167,139,250,0.55)" strokeWidth="1.5"/>
      <circle cx="120" cy="78" r="10" fill="#a78bfa" className={styles.pulseDot}/>
      <path d="M55 195 C55 162 85 142 120 142 C155 142 185 162 185 195" stroke="rgba(167,139,250,0.4)" strokeWidth="2" strokeLinecap="round" className={styles.lineDraw}/>
      <path d="M55 195 C55 162 85 142 120 142 C155 142 185 162 185 195" stroke="rgba(167,139,250,0.15)" strokeWidth="8" strokeLinecap="round"/>
    </svg>
  ),
};

// Floating particles
function Particles() {
  return (
    <div className={styles.particles}>
      {Array.from({length: 12}).map((_, i) => (
        <div key={i} className={styles.particle} style={{
          left: `${10 + (i * 7.5) % 80}%`,
          top: `${5 + (i * 11) % 85}%`,
          animationDelay: `${i * 0.4}s`,
          animationDuration: `${3 + (i % 4)}s`,
          width: i % 3 === 0 ? '3px' : '2px',
          height: i % 3 === 0 ? '3px' : '2px',
          opacity: 0.3 + (i % 4) * 0.1,
        }}/>
      ))}
    </div>
  );
}

export default function AuthLeft({ step = 0, isLogin = false }) {
  const [visible, setVisible] = useState(true);
  const [prevStep, setPrevStep] = useState(step);

  useEffect(() => {
    if (step !== prevStep) {
      setVisible(false);
      const t = setTimeout(() => { setPrevStep(step); setVisible(true); }, 250);
      return () => clearTimeout(t);
    }
  }, [step, prevStep]);

  const content = isLogin ? LOGIN_CONTENT : (STEPS[prevStep] ?? STEPS[0]);

  return (
    <div className={styles.leftPanel}>
      <div className={styles.blob1}/>
      <div className={styles.blob2}/>
      <div className={styles.blob3}/>
      <div className={styles.gridOverlay}/>
      <Particles/>

      <div className={styles.leftContent}>
        {/* Logo */}
        <div className={styles.leftLogo}>
          <div className={styles.leftLogoMark}>
            <img src="/najahi_logo.png" alt="N"
              style={{width:22,height:22,objectFit:"contain",borderRadius:4}}
              onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="block"; }}
            />
            <span style={{display:"none"}}>N</span>
          </div>
          <span className={styles.leftLogoText}>Najahi</span>
        </div>

        {/* Animated SVG visual */}
        <div className={`${styles.leftVisual} ${visible ? styles.visualIn : styles.visualOut}`}>
          {content.visual}
        </div>

        {/* Text */}
        <div className={`${styles.leftText} ${visible ? styles.textIn : styles.textOut}`}>
          <h2 className={styles.leftHeadline}>
            {content.headline}<br/>
            <span className={styles.leftHighlight}>{content.highlight}</span>
          </h2>
          <p className={styles.leftSub}>{content.sub}</p>
        </div>

        {!isLogin && (
          <div className={styles.leftDots}>
            {STEPS.map((_, i) => (
              <div key={i} className={`${styles.leftDot} ${i === prevStep ? styles.leftDotActive : ""}`}/>
            ))}
          </div>
        )}

        <div className={styles.leftTag}>
          <span className={styles.leftTagDot}/>
          Plateforme scolaire marocaine
        </div>
      </div>
    </div>
  );
}