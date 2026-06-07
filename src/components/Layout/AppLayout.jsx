// src/components/Layout/AppLayout.jsx
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Topbar  from '../Topbar/Topbar'
import styles  from './AppLayout.module.css'

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.right}>
        <Topbar />
        <main className={styles.main}>
          <div className="animate-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}