import { useState } from "react";
import MetricCard from "../common/MetricCard/MetricCard";
import styles from "./AdminView.module.css";

function AdminView({ section, account }) {
  const [search, setSearch] = useState("");
  const [showDonors, setShowDonors] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const users = account.users.filter((user) => (showDonors && user.type === "Donor") || (showHospitals && user.type === "Hospital"));
  const filteredUsers = users.filter((user) => `${user.name} ${user.id} ${user.city}`.toLowerCase().includes(search.toLowerCase()));

  if (section === "users") {
    return <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>NETWORK DIRECTORY</p><h2>Registered accounts</h2></div><div className={styles.filters}><label><input type="checkbox" checked={showDonors} onChange={(event) => setShowDonors(event.target.checked)} /> Donors</label><label><input type="checkbox" checked={showHospitals} onChange={(event) => setShowHospitals(event.target.checked)} /> Hospitals</label></div></div><label className={styles.search}>Search accounts<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, ID or city" /></label><div className={styles.tableWrap}><table><thead><tr><th>Account</th><th>Type</th><th>Blood group</th><th>City</th><th>Status</th><th>ID</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.type}</td><td>{user.blood}</td><td>{user.city}</td><td><span className={`${styles.status} ${styles[user.status.toLowerCase()]}`}>{user.status}</span></td><td>{user.id}</td></tr>)}</tbody></table>{filteredUsers.length === 0 && <p className={styles.empty}>No accounts match that search.</p>}</div></section>;
  }

  if (section === "settings") {
    return <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>SYSTEM CONTROLS</p><h2>Platform preferences</h2></div></div><div className={styles.settings}><div><strong>Donor registration</strong><p>Allow new donor accounts to join the network.</p><button type="button" role="switch" aria-checked="true" aria-label="Donor registration enabled"><span /></button></div><div><strong>Hospital onboarding</strong><p>Allow partner hospitals to request platform access.</p><button type="button" role="switch" aria-checked="true" aria-label="Hospital onboarding enabled"><span /></button></div><div><strong>AI matching service</strong><p>Use ranking signals to prioritize eligible donor alerts.</p><button type="button" role="switch" aria-checked="true" aria-label="AI matching enabled"><span /></button></div></div></section>;
  }

  if (section === "ai") {
    return <div className={styles.aiPage}><section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>MATCH QUALITY</p><h2>AI-assisted donor ranking</h2></div><span className={styles.modelState}><span /> Model operational</span></div><div className={styles.aiMetrics}><article><strong>94%</strong><span>match success rate</span></article><article><strong>2.3 min</strong><span>median response time</span></article><article><strong>41%</strong><span>alert acceptance lift</span></article></div><p className={styles.explainer}>Matches are ranked using blood compatibility, donor eligibility, distance, availability, and prior response patterns. Clinical teams remain responsible for confirming suitability.</p></section><section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>SIGNAL HEALTH</p><h2>Ranking inputs</h2></div></div>{["Blood compatibility", "Donor eligibility", "Proximity to hospital", "Availability preference", "Response history"].map((signal, index) => <div className={styles.signal} key={signal}><span>{signal}</span><meter min="0" max="100" value={[100, 99, 86, 92, 89][index]} aria-label={`${signal} contribution`} /><strong>{[100, 99, 86, 92, 89][index]}%</strong></div>)}</section></div>;
  }

  return <div className={styles.view}>
    <div className={styles.metrics}>{account.metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>
    <div className={styles.analyticsGrid}>
      <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>SIX-MONTH TREND</p><h2>Donations and requests</h2></div><span className={styles.legend}><i /> Donations <i /> Requests</span></div><div className={styles.trend}>{account.trend.map((item) => <div className={styles.month} key={item.month}><div className={styles.bars}><meter min="0" max="1600" value={item.donations} aria-label={`${item.month} donations`} /><meter min="0" max="1600" value={item.requests} aria-label={`${item.month} requests`} /></div><span>{item.month}</span></div>)}</div></section>
      <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>CURRENT DEMAND</p><h2>Most requested blood groups</h2></div></div>{account.demand.map((item, index) => <div className={`${styles.demand} ${styles[`viz${index + 1}`]}`} key={item.type}><span>{item.type}</span><meter min="0" max="450" value={item.units} aria-label={`${item.type}: ${item.units} units`} /><strong>{item.units}</strong></div>)}</section>
    </div>
    {section === "analytics" && <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>NETWORK PERFORMANCE</p><h2>Operational indicators</h2></div></div><div className={styles.indicators}><p><strong>1,203</strong><span>requests fulfilled this month</span></p><p><strong>93.3%</strong><span>fulfillment rate</span></p><p><strong>+18%</strong><span>donor growth month over month</span></p></div></section>}
    {section === "overview" && <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>RECENT ACTIVITY</p><h2>Network health</h2></div></div><div className={styles.activity}><p><span className={styles.activityDot} /> <strong>18 new donor registrations</strong><small>across 6 cities · today</small></p><p><span className={styles.activityDot} /> <strong>3 critical blood requests</strong><small>awaiting donor response · now</small></p><p><span className={styles.activityDot} /> <strong>AI matching service operational</strong><small>last health check · 4 minutes ago</small></p></div></section>}
  </div>;
}

export default AdminView;