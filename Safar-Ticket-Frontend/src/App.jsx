import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, Suspense } from 'react';
import { useTranslation } from "react-i18next";
// User pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import ReservationPage from "./pages/ReservationPage";
import PaymentPage from "./pages/PaymentPage";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOTP from "./pages/VerifyOTP";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import AdminSettings from './pages/AdminSettings';
import AdminReports from './pages/AdminReports';
import AdminCancellations from './pages/AdminCancellations';
// Components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminLayout from "./components/AdminLayout";
import LoadingIndicator from "./components/LoadingIndicator";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function App() {
  const { i18n } = useTranslation();
  useEffect(() => { document.documentElement.dir = i18n.dir(); }, [i18n, i18n.language]);

  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/logout" element={<Logout />} />
        
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/reserve/:travelId" element={<ProtectedRoute><ReservationPage /></ProtectedRoute>} />
        <Route path="/payment/:reservationId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route 
          path="/admin"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} /> 
          <Route path="reports" element={<AdminReports />} />
          <Route path="cancellations" element={<AdminCancellations />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function SuspendedApp() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><LoadingIndicator /></div>}>
      <App />
    </Suspense>
  );
}