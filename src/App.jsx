import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminStaffManagement from './pages/AdminStaffManagement.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

const App = () => {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/login-admin' element={<AdminLogin />} />
          <Route path='/admin-staff' element={<AdminStaffManagement />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
