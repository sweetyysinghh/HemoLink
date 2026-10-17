import { Navigate, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import AuthPage from "../pages/auth/AuthPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import DonorDashboard from "../pages/donor/DonorDashboard";
import HospitalDashboard from "../pages/hospital/HospitalDashboard";
import Home from "../pages/landing/Home";
import useAuth from "../context/useAuth";

function ProtectedRoute({ role, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <p role="status">Checking your session…</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user.role !== role) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
      <Route path="/reset-password" element={<AuthPage mode="reset" />} />
      <Route path="/donor/*" element={<ProtectedRoute role="DONOR"><DonorDashboard /></ProtectedRoute>} />
      <Route path="/hospital/*" element={<ProtectedRoute role="HOSPITAL"><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;