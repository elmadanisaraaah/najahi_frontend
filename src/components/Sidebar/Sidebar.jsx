import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, BrainCircuit,
  Users, UserCircle, LogOut
} from 'lucide-react'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/app/dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/app/schools',     label: 'Guide des écoles',  icon: Building2       },
  { to: '/app/orientation', label: 'Test IA',           icon: BrainCircuit    },
  { to: '/app/study',       label: 'Study With Me',     icon: Users           },
  { to: '/app/profile',     label: 'Mon profil',        icon: UserCircle      },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('najahi_token')
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoImgWrap}>
          <img src="/najahi_logo.png" alt="Najahi" width={42} height={42}
            style={{ borderRadius: 10, objectFit: 'contain', display: 'block' }}/>
          <div className={styles.logoGlow}/>
        </div>
        <span className={styles.logoText}>Najahi</span>
      </div>

      <nav className={styles.nav}>
        <p className={styles.navLabel}>Navigation</p>
        {NAV.map(({ to, label, icon: Icon }, i) => (
          <NavLink key={to} to={to}
            style={{ animationDelay: `${i * 0.06}s` }}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.linkIconWrap}>
              <Icon size={17} strokeWidth={1.8}/>
            </span>
            <span>{label}</span>
            <span className={styles.linkArrow}>›</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button onClick={logout} className={styles.logout}>
          <LogOut size={16} strokeWidth={1.8}/>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}