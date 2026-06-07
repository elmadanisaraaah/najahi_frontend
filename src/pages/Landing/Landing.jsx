import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import {
  Sun, Moon, ArrowRight, BrainCircuit,
  Building2, Users, BarChart3, CheckCircle2, Sparkles
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useI18n } from '../../context/I18nContext'
import LangSwitcher from '../../components/UI/LangSwitcher'
import styles from './Landing.module.css'

const STATS         = ['500+', '10k+', '98%', '24/7']
const FEATURE_ICONS = [BrainCircuit, Building2, Users, BarChart3]
const FEATURE_KEYS  = ['ia', 'schools', 'study', 'stats']

export default function Landing() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { t, lang } = useI18n()
  const T = t.landing
  const observerRef = useRef()

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    observerRef.current = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add(styles.revealed)
          observerRef.current.unobserve(e.target)
        }
      }),
      { threshold: 0.15 }
    )
    els.forEach(el => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className={styles.page} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>

          <div className={styles.navLogo}>
            <div className={styles.navLogoImgWrap}>
              <img src="/najahi_logo.png" alt="Najahi" width={46} height={46}
                style={{ borderRadius: 10, objectFit: 'contain', display: 'block' }}/>
              <div className={styles.logoRing}/>
            </div>
            <span className={styles.navLogoText}>Najahi</span>
          </div>

          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>{t.nav.features}</a>
            <a href="#stats"    className={styles.navLink}>Stats</a>
          </div>

          <div className={styles.navActions}>
            <LangSwitcher />
            <button className={styles.themeBtn} onClick={toggle}>
              <span className={`${styles.themeIcon} ${theme === 'light' ? styles.iconActive : ''}`}>
                <Sun size={17}/>
              </span>
              <span className={`${styles.themeIcon} ${theme === 'dark' ? styles.iconActive : ''}`}>
                <Moon size={17}/>
              </span>
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>
              {t.nav.login}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
              {t.nav.start}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.badgeDot}/>
          <Sparkles size={13} className={styles.badgeIcon}/>
          <span>{T.badge}</span>
        </div>

        <h1 className={styles.heroTitle}>
          {T.heroTitle}{' '}
          <span className={styles.heroHighlight}>{T.heroHighlight}</span>
        </h1>

        <p className={styles.heroDesc}>{T.heroDesc}</p>

        <div className={styles.heroCtas}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            {T.cta} <ArrowRight size={17}/>
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>
            {T.ctaSub}
          </button>
        </div>

        <div className={styles.orb1}/>
        <div className={styles.orb2}/>
        <div className={styles.particle1}/>
        <div className={styles.particle2}/>
        <div className={styles.particle3}/>
      </section>

      {/* ── STATS ── */}
      <section className={styles.statsSection} id="stats">
        <div className={styles.statsGrid}>
          {STATS.map((val, i) => (
            <div key={i} className={styles.statCard} data-reveal
              style={{ transitionDelay: `${i * 0.08}s` }}>
              <span className={styles.statVal}>{val}</span>
              <span className={styles.statLabel}>{T.stats[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader} data-reveal>
          <span className="badge"><Sparkles size={11}/> Fonctionnalités</span>
          <h2>Tout ce dont tu as besoin</h2>
          <p>Une plateforme complète pensée pour les étudiants marocains</p>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURE_KEYS.map((key, i) => {
            const Icon = FEATURE_ICONS[i]
            return (
              <div key={key} className={styles.featureCard} data-reveal
                style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={styles.featureIcon}>
                  <Icon size={22} strokeWidth={1.8}/>
                </div>
                <h3>{T.features[key].title}</h3>
                <p>{T.features[key].desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaBanner} data-reveal>
        <div className={styles.ctaBannerInner}>
          <h2>{T.ctaBannerTitle}</h2>
          <p>{T.ctaBannerSub}</p>
          <button className="btn btn-lg"
            style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}
            onClick={() => navigate('/register')}>
            {T.ctaBannerBtn} <ArrowRight size={17}/>
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <img src="/najahi_logo.png" alt="Najahi" width={28}
              style={{ borderRadius: 6, objectFit: 'contain' }}/>
            <span>Najahi — نجاحي</span>
          </div>
          <p>© 2026 Najahi. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}