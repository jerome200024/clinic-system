import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/auth/Unauthorized";

// Patient pages
import PatientDashboard from "../pages/patient/Dashboard";
import BookAppointment from "../pages/patient/BookAppointment";
import MyAppointments from "../pages/patient/MyAppointments";
import MedicalRecords from "../pages/patient/MedicalRecords";
import PatientBilling from "../pages/patient/Billing";

// Doctor pages
import DoctorDashboard from "../pages/doctor/Dashboard";
import DoctorSchedule from "../pages/doctor/Schedule";
import DoctorAppointments from "../pages/doctor/Appointments";
import PatientRecord from "../pages/doctor/PatientRecord";

// Admin pages
import AdminDashboard from "../pages/admin/Dashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageDoctors from "../pages/admin/ManageDoctors";
import Reports from "../pages/admin/Reports";

// Layouts
import PatientLayout from "../layouts/PatientLayout";
import DoctorLayout from "../layouts/DoctorLayout";
import AdminLayout from "../layouts/AdminLayout";

import { useEffect, useState } from "react";
import { getMe } from "../api/authApi";
import useAuthStore from "../store/authStore";

const AppRouter = () => {
  const { setUser, isAuthenticated } = useAuthStore();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return;
    }

    setChecking(true);
    let isMounted = true;

    getMe()
      .then((res) => setUser(res.data.data.user))
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setChecking(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, setUser]);

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Patient */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute roles={["patient"]}>
              <PatientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="book" element={<BookAppointment />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="records" element={<MedicalRecords />} />
          <Route path="billing" element={<PatientBilling />} />
        </Route>

        {/* Doctor */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients/:id" element={<PatientRecord />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="doctors" element={<ManageDoctors />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
