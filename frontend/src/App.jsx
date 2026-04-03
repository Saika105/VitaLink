import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminStaffManagement from './pages/AdminStaffManagement.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPatient from './pages/PatientLogin.jsx';
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

const App = () => {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login-admin' element={<AdminLogin />} />
          <Route path='/admin-staff' element={<AdminStaffManagement />} />
          <Route path='/login-patient' element={<LoginPatient />} />
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
        </Routes>
      </div>
    </Router>
  );
};

export default App;
