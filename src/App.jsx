import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminStaffManagement from './pages/AdminStaffManagement.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import LandingPage from './pages/LandingPage.jsx';

const App = () => {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login-admin' element={<AdminLogin />} />
          <Route path='/admin-staff' element={<AdminStaffManagement />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
