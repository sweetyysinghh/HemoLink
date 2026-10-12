import MetricCard from "../common/MetricCard/MetricCard";
import Button from "../common/Button/Button";
import styles from "./DonorView.module.css";

function DonorView({ section, account, available, onAvailabilityChange, requests, onAccept, accepted }) {
  if (section === "requests" || section === "overview") {
    return (
      <div className={styles.view}>
        {section === "overview" && <>
          <section className={styles.availability}>
            <div><span className={`${styles.liveDot} ${available ? "" : styles.offline}`} /><div><strong>{available ? "Available to donate" : "Currently unavailable"}</strong><p>{available ? "You may receive compatible emergency alerts." : "Emergency alerts are paused."}</p></div></div>
            <button type="button" className={styles.toggle} role="switch" aria-checked={available} aria-label="Donor availability" onClick={() => onAvailabilityChange(!available)}><span /></button>
          </section>
          <div className={styles.metrics}>{account.metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>
        </>}
        <section className={styles.panel}>
          <div className={styles.panelHeader}><div><p className={styles.overline}>{section === "overview" ? "NEARBY MATCHES" : "ACTIVE REQUESTS"}</p><h2>{section === "overview" ? "Requests near you" : "Compatible blood requests"}</h2></div>{section === "overview" && <Button to="/donor/requests" variant="secondary">View all</Button>}</div>
          <div className={styles.requestList}>
            {requests.map((request) => (
              <article className={styles.request} key={request.id}>
                <div className={styles.requestHead}><div><strong>{request.hospital}</strong><small>{request.distance} away · {request.time}</small></div><span className={`${styles.urgency} ${styles[request.urgency.toLowerCase()]}`}>{request.urgency}</span></div>
                <div className={styles.requestMeta}><span className={styles.blood}>{request.blood}</span><span>{request.units} unit{request.units === 1 ? "" : "s"} needed</span><span className={styles.match}>{request.score}% match</span></div>
                <div className={styles.requestActions}>
                  {accepted[request.id] || request.status !== "Open" ? <span className={styles.accepted}>Response recorded</span> : <button type="button" disabled={!available} onClick={() => onAccept(request.id)}>Accept request</button>}
                  <button type="button" className={styles.decline} onClick={() => onAccept(request.id, "declined")}>Not available</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        {section === "overview" && <section className={styles.panel}>
          <div className={styles.panelHeader}><div><p className={styles.overline}>YOUR IMPACT</p><h2>Donation milestones</h2></div><Button to="/donor/history" variant="secondary">History</Button></div>
          <div className={styles.impact}><span className={styles.bloodLarge}>{account.bloodType}</span><p><strong>Last donation</strong><br />{account.lastDonation}</p><p><strong>Next eligible</strong><br />{account.nextEligible}</p><p><strong>Estimated impact</strong><br />36 lives helped</p></div>
        </section>}
      </div>
    );
  }

  if (section === "history") {
    return <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>DONATION RECORD</p><h2>Completed donations</h2></div><span className={styles.count}>{account.history.length} donations</span></div><div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Hospital</th><th>Blood type</th><th>Status</th></tr></thead><tbody>{account.history.map((item) => <tr key={item.date}><td>{item.date}</td><td>{item.hospital}</td><td><span className={styles.blood}>{item.blood}</span></td><td><span className={styles.status}>{item.status}</span></td></tr>)}</tbody></table></div></section>;
  }

  if (section === "notifications") {
    return <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>UPDATES</p><h2>Your notifications</h2></div><span className={styles.count}>{account.notifications.filter((item) => item.unread).length} unread</span></div><div className={styles.notificationList}>{account.notifications.map((item) => <article className={styles.notification} key={item.title}><span className={`${styles.noticeMark} ${styles[item.kind]}`} aria-hidden="true" /><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div>{item.unread && <span className={styles.unread}>New</span>}</article>)}</div></section>;
  }

  return <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.overline}>DONOR DETAILS</p><h2>Personal information</h2></div></div><form className={styles.profile} onSubmit={(event) => event.preventDefault()}><label>Full name<input defaultValue={account.name} autoComplete="name" /></label><label>Email address<input defaultValue="meera.pillai@example.com" type="email" autoComplete="email" /></label><label>Phone number<input defaultValue="+91 98765 43210" type="tel" autoComplete="tel" /></label><label>Blood type<select defaultValue={account.bloodType}><option>{account.bloodType}</option></select></label><label>City<input defaultValue="Bengaluru" autoComplete="address-level2" /></label><label>Next eligible date<input defaultValue={account.nextEligible} readOnly /></label><button type="submit">Save profile</button></form></section>;
}

export default DonorView;