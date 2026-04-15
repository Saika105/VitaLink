import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AdminStaffManagement from './pages/AdminStaffManagement.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PatientLogin from './pages/PatientLogin.jsx';
import PatientSignUp from './pages/PatientSignUp.jsx';
import DoctorLogin from './pages/DoctorLogin.jsx';
import StaffLogin from './pages/StaffLogin.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import EditProfile from './pages/EditProfile.jsx';
import HealthVault from './pages/HealthVault.jsx';
import SearchDoctor from './pages/SearchDoctor.jsx';
import PatientAppointments from './pages/PatientAppointments.jsx';
import PatientBilling from './pages/PatientBilling.jsx';
import ConfirmUpload from './pages/ConfirmUpload';
import AssistantDashboard from './pages/AssistantDashboard.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import DoctorPatientView from './pages/DoctorPatientView.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import DigitalPrescription from './pages/DigitalPrescription.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ReceptionistBilling from './pages/ReceptionistBilling.jsx';
import ReporterDashboard from './pages/ReporterDashboard.jsx';
import ReportManagement from './pages/ReportManagement.jsx';
import AboutPage from './pages/AboutPage.jsx';
import TeamPage from './pages/TeamPage.jsx';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || token === 'undefined' || token === 'null') {
    if (allowedRole === 'patient')
      return <Navigate to='/login-patient' replace />;
    if (allowedRole === 'doctor')
      return <Navigate to='/login-doctor' replace />;
    if (allowedRole === 'admin') return <Navigate to='/login-admin' replace />;
    return <Navigate to='/login-staff' replace />;
  }

  if (allowedRole !== null && allowedRole) {
    const normalizedUserRole = role?.toLowerCase().replace(/_/g, '-');
    const normalizedAllowedRole = allowedRole?.toLowerCase().replace(/_/g, '-');

    const isAssistantMatch =
      normalizedUserRole?.includes('assistant') &&
      normalizedAllowedRole?.includes('assistant');

    const isLabMatch =
      normalizedUserRole?.includes('lab') &&
      normalizedAllowedRole?.includes('lab');

    if (
      normalizedUserRole !== normalizedAllowedRole &&
      !isAssistantMatch &&
      !isLabMatch
    ) {
      return <Navigate to='/' replace />;
    }
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/team' element={<TeamPage />} />
          <Route path='/login-admin' element={<AdminLogin />} />
          <Route path='/login-patient' element={<PatientLogin />} />
          <Route path='/signup-patient' element={<PatientSignUp />} />
          <Route path='/login-doctor' element={<DoctorLogin />} />
          <Route path='/login-staff' element={<StaffLogin />} />
          <Route path='/reset-password' element={<ResetPassword />} />

          <Route
            path='/patient-dashboard'
            element={
              <ProtectedRoute allowedRole='patient'>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/edit-profile'
            element={
              <ProtectedRoute allowedRole='patient'>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path='/my-records'
            element={
              <ProtectedRoute allowedRole='patient'>
                <HealthVault />
              </ProtectedRoute>
            }
          />
          <Route
            path='/search-doctor'
            element={
              <ProtectedRoute allowedRole='patient'>
                <SearchDoctor />
              </ProtectedRoute>
            }
          />
          <Route
            path='/appointments'
            element={
              <ProtectedRoute allowedRole='patient'>
                <PatientAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path='/billing'
            element={
              <ProtectedRoute allowedRole='patient'>
                <PatientBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path='/confirm-upload'
            element={
              <ProtectedRoute allowedRole={null}>
                <ConfirmUpload />
              </ProtectedRoute>
            }
          />

          <Route
            path='/doctor-dashboard'
            element={
              <ProtectedRoute allowedRole='doctor'>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/doctor/patient-view/:patientId'
            element={
              <ProtectedRoute allowedRole='doctor'>
                <DoctorPatientView />
              </ProtectedRoute>
            }
          />
          <Route
            path='/doctor/change-password'
            element={
              <ProtectedRoute allowedRole='doctor'>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path='/doctor/create-prescription/:id'
            element={
              <ProtectedRoute allowedRole='doctor'>
                <DigitalPrescription />
              </ProtectedRoute>
            }
          />
          <Route
            path='/assistant'
            element={
              <ProtectedRoute allowedRole='doctor-assistants'>
                <AssistantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/reporter-dashboard'
            element={
              <ProtectedRoute allowedRole='lab-assistants'>
                <ReporterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/reporter/manage-reports/:id'
            element={
              <ProtectedRoute allowedRole='lab-assistants'>
                <ReportManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path='/receptionist'
            element={
              <ProtectedRoute allowedRole='receptionists'>
                <ReceptionistBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin-staff'
            element={
              <ProtectedRoute allowedRole='admin'>
                <AdminStaffManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
