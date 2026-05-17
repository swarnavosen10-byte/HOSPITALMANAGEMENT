import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import Patients from "./pages/admin/Patients";
import Doctors from "./pages/admin/Doctors";
import Appointments from "./pages/admin/Appointments";
import Billing from "./pages/admin/Billing";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffPatients from "./pages/staff/StaffPatients";
import StaffDoctors from "./pages/staff/StaffDoctors";
import StaffAppointments from "./pages/staff/StaffAppointments";
import StaffScheduling from "./pages/staff/StaffScheduling";
import StaffReports from "./pages/staff/StaffReports";
import StaffNotifications from "./pages/staff/StaffNotifications";
import StaffSettings from "./pages/staff/StaffSettings";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorQueue from "./pages/doctor/DoctorQueue";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorCalendar from "./pages/doctor/DoctorCalendar";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import MyAppointments from "./pages/patient/MyAppointments";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import HospitalDetails from "./pages/patient/HospitalDetails";
import Departments from "./pages/patient/Departments";
import DoctorList from "./pages/patient/DoctorList";
import BookAppointment from "./pages/patient/BookAppointment";


import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import IntroSplash from "./components/IntroSplash";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setIntroLeaving(true);
    }, 3550);

    const timer = window.setTimeout(() => {
      setShowIntro(false);
    }, 4450);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(timer);
    };
  }, []);

  if (showIntro) {
    return <IntroSplash isLeaving={introLeaving} />;
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* PATIENT ROUTES */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute role="patient">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="hospitals/:id" element={<HospitalDetails />} />
          <Route path="hospitals/:id/departments" element={<Departments />} />
          <Route
            path="hospitals/:id/departments/:department"
            element={<DoctorList />}
          />
          <Route path="book/:doctorId" element={<BookAppointment />} />
          <Route path="my-appointments" element={<MyAppointments />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
        </Route>

        {/* HOSPITAL STAFF ROUTES */}
        <Route
          path="/staff-dashboard"
          element={
            <ProtectedRoute role="hospital_staff">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StaffDashboard />} />
          <Route path="patients" element={<StaffPatients />} />
          <Route path="doctors" element={<StaffDoctors />} />
          <Route path="appointments" element={<StaffAppointments />} />
          <Route path="scheduling" element={<StaffScheduling />} />
          <Route path="reports" element={<StaffReports />} />
          <Route path="notifications" element={<StaffNotifications />} />
          <Route path="settings" element={<StaffSettings />} />
        </Route>

        {/* DOCTOR ROUTES */}
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute role="doctor">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="my-schedule" element={<DoctorSchedule />} />
          <Route path="queue" element={<DoctorQueue />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="calendar" element={<DoctorCalendar />} />
          <Route path="notifications" element={<DoctorNotifications />} />
          <Route path="settings" element={<DoctorSettings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;