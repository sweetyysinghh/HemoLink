import { Link } from "react-router-dom";
import MetricCard from "../common/MetricCard/MetricCard";
import styles from "./HospitalView.module.css";

function HospitalView({ section, account, inventory, onStockChange, requests, onCreateRequest }) {
  const contentRequests = requests || account.requests;

  if (section === "new-request") {
    return <section className={styles.panel}><div className={styles.heading}><p className={styles.overline}>EMERGENCY COORDINATION</p><h2>Request blood units</h2><p>Compatible donors near your hospital will be ranked and notified.</p></div><form className={styles.requestForm} onSubmit={(event) => { event.preventDefault(); onCreateRequest(new FormData(event.currentTarget)); }}><label>Blood group<select name="blood" defaultValue="O−">{["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"].map((type) => <option key={type}>{type}</option>)}</select></label><label>Units required<input name="units" type="number" min="1" max="100" defaultValue="2" required /></label><label>Urgency<select name="urgency" defaultValue="High"><option>Critical</option><option>High</option><option>Medium</option><option>Routine</option></select></label><label>When needed<select name="needed" defaultValue="As soon as possible"><option>As soon as possible</option><option>Within 6 hours</option><option>Within 24 hours</option></select></label><label className={styles.full}>Clinical notes<textarea name="notes" rows="3" placeholder="Add context for the care team and matched donors" /></label><div className={styles.formFooter}><p>Only share the minimum necessary patient information.</p><button type="submit">Create donor alert <span aria-hidden="true">↗</span></button></div></form></section>;
  }

  if (section === "inventory") {
    return <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>BLOOD BANK STOCK</p><h2>Available units by blood group</h2></div><span className={styles.updated}>Updated just now</span></div><div className={styles.inventoryList}>{inventory.map((item) => <article className={styles.stockRow} key={item.type}><span className={styles.blood}>{item.type}</span><div className={styles.stockInfo}><div><strong>{item.units} units</strong><span className={`${styles.status} ${styles[item.status.toLowerCase()]}`}>{item.status}</span></div><meter className={styles[item.status.toLowerCase()]} min="0" max="60" value={item.units} aria-label={`${item.type}: ${item.units} units`} /></div><div className={styles.stockActions}><button type="button" aria-label={`Remove one ${item.type} unit`} onClick={() => onStockChange(item.type, -1)}>−</button><button type="button" aria-label={`Add one ${item.type} unit`} onClick={() => onStockChange(item.type, 1)}>+</button></div></article>)}</div></section>;
  }

  if (section === "requests") {
    return <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>REQUEST TRACKER</p><h2>Active and recent requests</h2></div><Link className={styles.primaryLink} to="/hospital/new-request">+ New request</Link></div><div className={styles.tableWrap}><table><thead><tr><th>Request ID</th><th>Blood</th><th>Urgency</th><th>Donors reached</th><th>Accepted</th><th>Status</th><th>Created</th></tr></thead><tbody>{contentRequests.map((item) => <tr key={item.id}><td>{item.id}</td><td><span className={styles.blood}>{item.blood}</span><small>{item.units} units</small></td><td><span className={`${styles.status} ${styles[item.urgency.toLowerCase()]}`}>{item.urgency}</span></td><td>{item.alerted}</td><td>{item.accepted}</td><td>{item.status}</td><td>{item.created}</td></tr>)}</tbody></table></div></section>;
  }

  const critical = inventory.filter((item) => item.units <= 3);
  return <div className={styles.view}>
    {critical.length > 0 && <div className={styles.alert} role="status"><span>STOCK ALERT</span><p>{critical.map((item) => `${item.type} is critically low`).join(" · ")}</p><Link to="/hospital/new-request">Create request <span aria-hidden="true">→</span></Link></div>}
    <div className={styles.metrics}>{account.metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>
    <div className={styles.overviewGrid}>
      <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>CURRENT STOCK</p><h2>Blood inventory</h2></div><Link className={styles.secondaryLink} to="/hospital/inventory">Manage</Link></div><div className={styles.compactStock}>{inventory.slice(0, 6).map((item) => <div className={styles.miniStock} key={item.type}><span>{item.type}</span><meter className={styles[item.status.toLowerCase()]} min="0" max="60" value={item.units} aria-label={`${item.type}: ${item.units} units`} /><strong>{item.units}</strong></div>)}</div></section>
      <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>REQUEST STATUS</p><h2>Recent requests</h2></div><Link className={styles.secondaryLink} to="/hospital/requests">All requests</Link></div><div className={styles.recentList}>{contentRequests.slice(0, 3).map((item) => <article key={item.id}><span className={styles.blood}>{item.blood}</span><div><strong>{item.units} units · {item.urgency}</strong><small>{item.accepted} donors accepted · {item.created}</small></div><span className={styles.statusText}>{item.status}</span></article>)}</div></section>
    </div>
  </div>;
}

export default HospitalView;