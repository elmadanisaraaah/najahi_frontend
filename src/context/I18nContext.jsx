import { createContext, useContext, useState } from 'react'
import fr from '../locales/fr'
import ar from '../locales/ar'
import en from '../locales/en'

const LANGS = { fr, ar, en }
const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('najahi_lang') || 'fr'
  )

  const t = LANGS[lang] || fr

  const setLanguage = (l) => {
    setLang(l)
    localStorage.setItem('najahi_lang', l)
    document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', l)
  }

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)