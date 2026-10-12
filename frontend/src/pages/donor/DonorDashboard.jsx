import WorkspacePage from "../../components/workspace/WorkspacePage";
import styles from "./DonorDashboard.module.css";

function DonorDashboard() {
  return <div className={styles.page}><WorkspacePage role="donor" /></div>;
}

export default DonorDashboard;