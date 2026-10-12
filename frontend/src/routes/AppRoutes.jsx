import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "../pages/auth/AuthPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import DonorDashboard from "../pages/donor/DonorDashboard";
import HospitalDashboard from "../pages/hospital/HospitalDashboard";
import Home from "../pages/landing/Home";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
      <Route path="/donor/*" element={<DonorDashboard />} />
      <Route path="/hospital/*" element={<HospitalDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;