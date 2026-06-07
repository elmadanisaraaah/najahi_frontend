// src/components/Topbar/Topbar.jsx
import { Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useLocation } from 'react-router-dom'
import styles from './Topbar.module.css'

const TITLES = {
  '/app/dashboard':   'Dashboard',
  '/app/schools':     'Guide des écoles',
  '/app/orientation': 'Test d\'orientation IA',
  '/app/study':       'Study With Me',
  '/app/profile':     'Mon profil',
}

export default function Topbar() {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'Najahi'

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} strokeWidth={1.8} />
          <span className={styles.notifDot} />
        </button>
        <button className={styles.iconBtn} onClick={toggle} aria-label="Toggle theme">
          {theme === 'light'
            ? <Moon size={18} strokeWidth={1.8} />
            : <Sun  size={18} strokeWidth={1.8} />
          }
        </button>
        <div className={styles.avatar}>A</div>
      </div>
    </header>
  )
}