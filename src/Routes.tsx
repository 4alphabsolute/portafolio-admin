import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./Pages/App";
import ProfessionalDashboard from "./Pages/ProfessionalDashboard";
import Admin from "./Pages/Admin";
import SimpleLogin from "./components/SimpleLogin";
import CVConverterPDFFlowise from "./components/CVConverterPDFFlowise";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuth = localStorage.getItem('adminAuth') === 'true';
  return isAuth ? children : <Navigate to="/login" />;
}

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<SimpleLogin />} />
        <Route path="/cv-converter" element={<CVConverterPDFFlowise />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ProfessionalDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
