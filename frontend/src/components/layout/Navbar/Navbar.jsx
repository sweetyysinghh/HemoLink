import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../common/Button/Button";
import { footerLinks } from "../../../data/landingData";
import styles from "./Navbar.module.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} aria-label="Main navigation">
        <Link className={styles.logo} to="/" aria-label="HemoLink home">
          <span className={styles.mark} aria-hidden="true">H</span>
          <span>HemoLink</span>
        </Link>
        <div className={`${styles.links} ${menuOpen ? styles.linksOpen : ""}`}>
          {footerLinks.map((item) => <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
          <div className={styles.mobileActions}>
            <Button to="/login" variant="secondary">Log in</Button>
            <Button to="/register">Get started</Button>
          </div>
        </div>
        <div className={styles.actions}>
          <Button to="/login" variant="secondary">Log in</Button>
          <Button to="/register">Get started</Button>
        </div>
        <button className={styles.menuButton} type="button" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setMenuOpen((open) => !open)}>
          <span /><span />
        </button>
      </nav>
    </header>
  );
}

export default Navbar;