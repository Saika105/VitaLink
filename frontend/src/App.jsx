import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
// import ReporterDashboard from './pages/ReporterDashboard.jsx';
// import ReportManagement from './pages/ReportManagement.jsx';
const App = () => {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login-admin' element={<AdminLogin />} />
          <Route path='/admin-staff' element={<AdminStaffManagement />} />
          <Route path='/login-patient' element={<PatientLogin />} />
          <Route path='/signup-patient' element={<PatientSignUp />} />
          <Route path='/login-doctor' element={<DoctorLogin />} />
          <Route path='/login-staff' element={<StaffLogin />} />
          <Route path='/patient-dashboard' element={<PatientDashboard />} />
          <Route path='/edit-profile' element={<EditProfile />} />
          <Route path='/my-records' element={<HealthVault />} />
          <Route path='/search-doctor' element={<SearchDoctor />} />
          <Route path='/appointments' element={<PatientAppointments />} />
          <Route path='/billing' element={<PatientBilling />} />
          <Route path='/confirm-upload' element={<ConfirmUpload />} />
          <Route path='/assistant' element={<AssistantDashboard />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route
            path='/doctor/patient-view/:id'
            element={<DoctorPatientView />}
          />
          <Route path='/doctor/change-password' element={<ChangePassword />} />
          <Route
            path='/doctor/create-prescription/:id'
            element={<DigitalPrescription />}
          />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/receptionist' element={<ReceptionistBilling />} />
          {/* <Route path='/reporter-dashboard' element={<ReporterDashboard />} />
          <Route
            path='/reporter/manage-reports/:id'
            element={<ReportManagement />}
          /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
