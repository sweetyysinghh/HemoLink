import styles from "./MetricCard.module.css";

function MetricCard({ metric }) {
  return (
    <article className={styles.card}>
      <span className={`${styles.marker} ${styles[metric.tone]}`} aria-hidden="true" />
      <p>{metric.label}</p>
      <strong>{metric.value}</strong>
      <small>{metric.note}</small>
    </article>
  );
}

export default MetricCard;