import WorkspacePage from "../../components/workspace/WorkspacePage";
import styles from "./AdminDashboard.module.css";

function AdminDashboard() {
  return <div className={styles.page}><WorkspacePage role="admin" /></div>;
}

export default AdminDashboard;