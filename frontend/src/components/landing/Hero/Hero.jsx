import { Link } from "react-router-dom";
import Button from "../../common/Button/Button";
import styles from "./Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span /> A more connected blood supply</p>
          <h1 id="hero-title">The right donor.<br /><em>At the right moment.</em></h1>
          <p className={styles.description}>
            HemoLink brings donors and hospitals together so urgent blood requests move forward with clarity and care.
          </p>
          <div className={styles.actions}>
            <Button to="/register">Join as a donor <span aria-hidden="true">↗</span></Button>
            <Link className={styles.textLink} to="/register">For hospitals <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.proof}>
            <span className={styles.proofMark} aria-hidden="true">H</span>
            <p><strong>Donors and hospitals, connected</strong><br />One shared place to coordinate a response</p>
          </div>
        </div>
        <div className={styles.visual} aria-label="Preview of HemoLink donor matching">
          <img className={styles.photo} src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=85" alt="A healthcare professional preparing a blood donation" />
          <article className={styles.responseCard} aria-label="Donation response process">
            <p className={styles.cardLabel}>A CLEARER RESPONSE</p>
            <h2>From request to donation</h2>
            <ol className={styles.responseSteps}>
              <li><span>Request shared</span><small>Care teams add the need</small></li>
              <li><span>Donors notified</span><small>Relevant people can respond</small></li>
              <li><span>Donation coordinated</span><small>Everyone can follow progress</small></li>
            </ol>
          </article>
          <div className={styles.photoCaption}><span>CONNECTED CARE</span><strong>Local people. Real impact.</strong></div>
        </div>
      </div>
      <div className={styles.heroFoot}><span>BUILT FOR DONORS AND CARE TEAMS</span><span>One network, better response</span></div>
    </section>
  );
}

export default Hero;