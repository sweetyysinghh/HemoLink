import Button from "../common/Button/Button";
import { howItWorks, testimonials } from "../../data/landingData";
import styles from "./LandingSections.module.css";

function LandingSections() {
  return (
    <>
      <section className={styles.workflow} id="how-it-works" aria-labelledby="workflow-title">
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>A clearer path to care</p>
          <h2 id="workflow-title">From urgent need to<br />a confirmed donation.</h2>
          <p>Every step is designed to help people respond with confidence, not friction.</p>
        </div>
        <div className={styles.steps}>
          {howItWorks.map((item) => (
            <article className={styles.step} key={item.step}>
              <span className={styles.stepNo}>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.aiSection} id="network" aria-labelledby="network-title">
        <div className={styles.aiIntro}>
          <p className={styles.kicker}>A network that responds</p>
          <h2 id="network-title">Care moves forward<br /><em>together.</em></h2>
          <p>HemoLink gives donors and care teams one clear place to share urgent needs, coordinate next steps, and keep each other informed.</p>
          <a href="#how-it-works">See how it works <span aria-hidden="true">↗</span></a>
        </div>
        <div className={styles.featureList}>
          {[
            { title: "Share a clear request", description: "Care teams can communicate the blood type, urgency, and location of a need." },
            { title: "Reach willing donors", description: "Donors can review requests and choose when they are ready to respond." },
            { title: "Coordinate with confidence", description: "Keep the people involved informed as a donation moves forward." },
          ].map((step, index) => (
            <article className={styles.feature} key={step.title}>
              <span className={styles.featureNumber} aria-hidden="true">0{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.testimonials} id="platform" aria-labelledby="voices-title">
        <div className={styles.testimonialHead}>
          <p className={styles.kicker}>A network built around people</p>
          <h2 id="voices-title">Trust makes every<br />connection stronger.</h2>
        </div>
        <div className={styles.quoteGrid}>
          {testimonials.map((item) => (
            <figure className={styles.quote} key={item.name}>
              <blockquote>“{item.quote}”</blockquote>
              <figcaption><span>{item.name.slice(0, 1)}</span><div><strong>{item.name}</strong><small>{item.role}</small></div></figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className={styles.callout}>
        <div><p className={styles.kicker}>Every minute matters</p><h2>Be part of a more<br />responsive blood network.</h2></div>
        <Button to="/register" variant="light">Get started <span aria-hidden="true">↗</span></Button>
      </section>
    </>
  );
}

export default LandingSections;