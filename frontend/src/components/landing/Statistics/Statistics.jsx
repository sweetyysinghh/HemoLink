import { useEffect, useState } from "react";
import apiClient from "../../../services/apiClient";
import styles from "./Statistics.module.css";

function Statistics() {
  const [metrics, setMetrics] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isCurrent = true;

    apiClient.get("/public/landing/metrics")
      .then(({ data }) => {
        const results = Array.isArray(data) ? data : data?.metrics;
        if (!Array.isArray(results)) throw new Error("Invalid metrics response");
        if (isCurrent) {
          setMetrics(results);
          setStatus(results.length ? "ready" : "unavailable");
        }
      })
      .catch(() => {
        if (isCurrent) setStatus("unavailable");
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className={styles.stats} aria-label="HemoLink network metrics" aria-live="polite">
      {status === "ready" ? metrics.map((item) => (
        <div key={item.id ?? item.label} className={styles.card}>
          <h2>{typeof item.value === "number" ? item.value.toLocaleString() : item.value}</h2>
          <p>{item.label}</p>
        </div>
      )) : (
        <p className={styles.status} role="status">
          {status === "loading" ? "Loading live network metrics…" : "Live network metrics are temporarily unavailable."}
        </p>
      )}
    </section>
  );
}

export default Statistics;