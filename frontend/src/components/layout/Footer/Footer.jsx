import { Link } from "react-router-dom";
import { footerLinks } from "../../../data/landingData";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link className={styles.brand} to="/"><span aria-hidden="true">H</span> HemoLink</Link>
        <p className={styles.note}>A more connected blood supply starts with all of us.</p>
        <nav aria-label="Footer navigation">
          {footerLinks.map((item) => <a href={item.href} key={item.label}>{item.label}</a>)}
        </nav>
        <p className={styles.legal}>© 2026 HemoLink · Designed for better coordination of care</p>
      </div>
    </footer>
  );
}

export default Footer;