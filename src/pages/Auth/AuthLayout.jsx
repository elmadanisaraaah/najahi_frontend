import styles from "./Auth.module.css";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne}></div>
      <div className={styles.bgGlowTwo}></div>

      <div className={styles.shell}>
        <div className={styles.brandPanel}>
          <div className={styles.brandBadge}>Najahi</div>
          <h1 className={styles.heroTitle}>Modern student success starts here.</h1>
          <p className={styles.heroText}>
            Access your orientation tools, schools, study sessions, and profile in one premium experience.
          </p>

          <div className={styles.heroCard}>
            <div className={styles.heroDot}></div>
            <div>
              <strong>Secure authentication</strong>
              <p>Email, reset flow, OTP, and protected access.</p>
            </div>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}