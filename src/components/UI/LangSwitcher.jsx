import { useI18n } from '../../context/I18nContext'
import styles from './LangSwitcher.module.css'

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'ع'  },
  { code: 'en', label: 'EN' },
]

export default function LangSwitcher() {
  const { lang, setLanguage } = useI18n()
  return (
    <div className={styles.switcher}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          className={`${styles.btn} ${lang === code ? styles.active : ''}`}
          onClick={() => setLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}