import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import VerifyOTP from "./pages/VerifyOTP";
import ReservationPage from "./pages/ReservationPage";
import PaymentPage from "./pages/PaymentPage";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        
        <Route path="/logout" element={<Logout />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/reserve/:travelId" element={<ProtectedRoute><ReservationPage /></ProtectedRoute>} />
        <Route path="/payment/:reservationId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;