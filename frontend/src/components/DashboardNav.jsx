import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navBtnClass = path => {
    const isActive = location.pathname === path;
    return `py-4 px-2 text-sm md:text-lg transition-all border-b-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-inter whitespace-nowrap ${
      isActive
        ? 'font-bold text-slate-900 border-blue-600'
        : 'font-medium text-slate-600 border-transparent hover:text-blue-700 hover:border-blue-200'
    }`;
  };

  return (
    <nav
      className='bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10 font-inter'
      aria-label='Dashboard Navigation'
    >
      <div className='max-w-6xl mx-auto px-4'>
        <div className='flex items-center justify-start md:justify-center gap-6 md:gap-16 overflow-x-auto no-scrollbar scroll-smooth'>
          <button
            className={navBtnClass('/patient-dashboard')}
            onClick={() => navigate('/patient-dashboard')}
          >
            Home
          </button>
          <button
            className={navBtnClass('/my-records')}
            onClick={() => navigate('/my-records')}
          >
            My Records
          </button>
          <button
            className={navBtnClass('/search-doctor')}
            onClick={() => navigate('/search-doctor')}
          >
            Search Doctor
          </button>
          <button
            className={navBtnClass('/appointments')}
            onClick={() => navigate('/appointments')}
          >
            Appointments
          </button>
          <button
            className={navBtnClass('/billing')}
            onClick={() => navigate('/billing')}
          >
            Billing
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
