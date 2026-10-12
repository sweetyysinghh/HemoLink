import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WorkspaceShell from "../layout/WorkspaceShell/WorkspaceShell";
import { workspaceData } from "../../data/dashboardData";
import DonorView from "./DonorView";
import HospitalView from "./HospitalView";
import AdminView from "./AdminView";
import styles from "./WorkspacePage.module.css";

function WorkspacePage({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const account = workspaceData[role];
  const section = location.pathname.split("/").filter(Boolean)[1] || "overview";
  const [available, setAvailable] = useState(true);
  const requests = account.requests || [];
  const [accepted, setAccepted] = useState({});
  const [inventory, setInventory] = useState(account.inventory || []);
  const [newRequest, setNewRequest] = useState(null);
  const [notice, setNotice] = useState("");
  const [noticeId, setNoticeId] = useState(0);
  const [title, subtitle] = account.headings[section] || account.headings.overview;

  const showNotice = (message) => {
    setNotice(message);
    setNoticeId((id) => id + 1);
  };

  const respondToRequest = (requestId, response = "accepted") => {
    setAccepted((previous) => ({ ...previous, [requestId]: response }));
    showNotice(response === "declined" ? "Your availability was updated." : "Your response was shared with the hospital.");
  };

  const adjustStock = (type, change) => {
    setInventory((current) => current.map((item) => {
      if (item.type !== type) return item;
      const units = Math.max(0, item.units + change);
      return { ...item, units, status: units <= 3 ? "Critical" : units <= 10 ? "Low" : "Healthy" };
    }));
  };

  const createRequest = (formData) => {
    const request = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      blood: formData.get("blood"),
      units: Number(formData.get("units")),
      urgency: formData.get("urgency"),
      created: "Just now",
      alerted: 0,
      accepted: 0,
      status: "Matching donors",
    };
    setNewRequest(request);
    showNotice(`Request created. HemoLink is ranking ${request.blood} donors.`);
    navigate("/hospital/requests");
  };

  let content;
  if (role === "donor") {
    content = <DonorView section={section} account={account} available={available} onAvailabilityChange={setAvailable} requests={requests} onAccept={respondToRequest} accepted={accepted} />;
  } else if (role === "hospital") {
    content = <HospitalView section={section} account={account} inventory={inventory} onStockChange={adjustStock} requests={newRequest ? [newRequest, ...account.requests] : account.requests} onCreateRequest={createRequest} />;
  } else {
    content = <AdminView section={section} account={account} />;
  }

  return (
    <WorkspaceShell account={account} activeKey={section} title={title} subtitle={subtitle}>
      {notice && <div className={styles.notice} key={noticeId} role="status">{notice}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
      {content}
    </WorkspaceShell>
  );
}

export default WorkspacePage;