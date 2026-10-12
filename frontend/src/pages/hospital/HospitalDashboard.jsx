import WorkspacePage from "../../components/workspace/WorkspacePage";
import styles from "./HospitalDashboard.module.css";

function HospitalDashboard() {
  return <div className={styles.page}><WorkspacePage role="hospital" /></div>;
}

export default HospitalDashboard;