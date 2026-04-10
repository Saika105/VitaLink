import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo white.png';
import { protectedFetch } from '../utils/api';

const DoctorNavbar = ({ doctorName: propName, doctorPhoto: propPhoto }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [displayPhoto, setDisplayPhoto] = useState('');

  useEffect(() => {
    if (propName) {
      setDisplayName(propName);
    } else {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser) setDisplayName(savedUser.fullName || savedUser.name);
    }

    if (propPhoto) {
      setDisplayPhoto(propPhoto);
    } else {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser)
        setDisplayPhoto(savedUser.profilePhoto?.url || savedUser.profilePhoto);
    }
  }, [propName, propPhoto]);

  const handleLogout = async () => {
    try {
      await protectedFetch('/api/v1/doctors/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      setIsDropdownOpen(false);
      navigate('/login-doctor');
    }
  };

  const fallbackPhoto = `https://ui-avatars.com/api/?name=${displayName || 'Doctor'}&background=fff&color=2563eb&bold=true`;

  return (
    <nav className='bg-blue-600 px-4 md:px-8 py-1 flex justify-between items-center shadow-lg sticky top-0 z-50 font-inter w-full h-16 md:h-20'>
      <div
        className='flex items-center cursor-pointer transition-opacity hover:opacity-90'
        onClick={() => navigate('/doctor-dashboard')}
      >
        <img
          src={logo}
          alt='VitaLink'
          className='h-10 md:h-16 w-auto object-contain'
        />
      </div>

      <div className='relative'>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className='flex items-center gap-2 md:gap-3 bg-white/10 hover:bg-white/20 px-2 md:px-3 py-1.5 rounded-xl transition-all border border-white/20 active:scale-95'
        >
          <div className='w-7 h-7 md:w-9 md:h-9 rounded-lg overflow-hidden border-2 border-white/30 shadow-sm bg-white shrink-0'>
            <img
              src={displayPhoto || fallbackPhoto}
              alt='Doctor Profile'
              className='w-full h-full object-cover'
            />
          </div>

          <span className='text-[10px] md:text-xs font-black text-white uppercase tracking-widest hidden xs:block'>
            {displayName ? displayName.split(' ')[0] : 'Doctor'}
          </span>

          <svg
            className={`w-3.5 h-3.5 md:w-4 md:h-4 text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2.5'
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <>
            <div
              className='fixed inset-0 z-[-1]'
              onClick={() => setIsDropdownOpen(false)}
            ></div>

            <div className='absolute right-0 mt-3 w-56 md:w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200'>
              <div className='px-4 md:px-6 py-4 border-b border-slate-50 flex items-center gap-3'>
                <div className='w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-slate-100 shrink-0'>
                  <img
                    src={displayPhoto || fallbackPhoto}
                    alt='Doctor'
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='overflow-hidden text-left'>
                  <p className='text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight'>
                    Doctor
                  </p>
                  <p className='text-[10px] md:text-[11px] font-bold text-slate-900 truncate uppercase'>
                    {displayName || 'Loading...'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/doctor/change-password');
                }}
                className='w-full text-left px-4 md:px-6 py-3 text-[10px] md:text-[11px] font-black uppercase text-slate-600 hover:bg-blue-50 transition-colors'
              >
                Change Password
              </button>

              <hr className='my-1 md:my-2 border-slate-100 mx-4' />

              <button
                onClick={handleLogout}
                className='w-full text-left px-4 md:px-6 py-3 text-[10px] md:text-[11px] font-black uppercase text-red-500 hover:bg-red-50 transition-colors'
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default DoctorNavbar;
