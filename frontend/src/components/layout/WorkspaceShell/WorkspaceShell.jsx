import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./WorkspaceShell.module.css";

function WorkspaceShell({ account, activeKey, title, subtitle, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <Link className={styles.brand} to="/"><span>H</span> HemoLink</Link>
        <div className={styles.workspaceLabel}>{account.label}</div>
        <nav className={styles.navigation} aria-label={`${account.label} navigation`}>
          {account.navigation.map((item) => (
            <Link
              aria-current={activeKey === item.key ? "page" : undefined}
              className={`${styles.navLink} ${activeKey === item.key ? styles.active : ""}`}
              key={item.key}
              to={item.path}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true">{item.label.slice(0, 1)}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <Link to="/" className={styles.backLink}>← Back to HemoLink</Link>
          <div className={styles.help}>Need help? <a href="mailto:support@hemolink.example">Contact support</a></div>
        </div>
      </aside>
      {menuOpen && <button className={styles.scrim} type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} type="button" aria-expanded={menuOpen} aria-label="Toggle workspace navigation" onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
          <div className={styles.pageTitle}><h1>{title}</h1><p>{subtitle}</p></div>
          <div className={styles.account}>
            <span className={styles.avatar}>{account.initials}</span>
            <span className={styles.accountName}><strong>{account.name}</strong><small>{account.organization}</small></span>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

export default WorkspaceShell;