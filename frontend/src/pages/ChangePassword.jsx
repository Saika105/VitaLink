import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorNavbar from '../components/DoctorNavbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState({ fullName: '', photo: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await protectedFetch(
          `${import.meta.env.VITE_API_URL}/api/v1/doctors/profile`,
        );
        if (response.ok) {
          const result = await response.json();
          setDoctorInfo({
            fullName: result.data.fullName,
            photo: result.data.profilePhoto?.url,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus('mismatch');
      return;
    }

    try {
      const response = await protectedFetch(
        `${import.meta.env.VITE_API_URL}/api/v1/doctors/change-password`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
          }),
        },
      );

      if (response.ok) {
        setStatus('success');
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('role');
          navigate('/login-doctor');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-black'>
      <DoctorNavbar
        doctorName={doctorInfo.fullName}
        doctorPhoto={doctorInfo.photo}
      />

      <main className='grow flex items-center justify-center p-4 md:p-8'>
        <div className='max-w-md w-full bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300'>
          <div className='bg-slate-50 p-8 border-b border-slate-100 text-center'>
            <div className='w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200'>
              <svg
                className='w-8 h-8 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2.5'
                  d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-black text-black uppercase tracking-tight'>
              Security
            </h2>
            <p className='text-[12px] font-bold text-slate-500 uppercase tracking-widest mt-1'>
              Update Access Credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className='p-8 space-y-5'>
            {status === 'success' && (
              <div className='bg-green-50 border border-green-100 text-green-700 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center'>
                Password Updated. Redirecting to Login...
              </div>
            )}

            {status === 'error' && (
              <div className='bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center'>
                Current Password Incorrect
              </div>
            )}

            {status === 'mismatch' && (
              <div className='bg-orange-50 border border-orange-100 text-orange-700 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center'>
                New Passwords Do Not Match
              </div>
            )}

            <div className='space-y-1.5'>
              <label className='text-[11px] font-black text-black uppercase tracking-widest ml-1'>
                Current Password
              </label>
              <input
                type='password'
                required
                value={formData.oldPassword}
                onChange={e =>
                  setFormData({ ...formData, oldPassword: e.target.value })
                }
                className='w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[12px] font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[11px] font-black text-black uppercase tracking-widest ml-1'>
                New Password
              </label>
              <input
                type='password'
                required
                value={formData.newPassword}
                onChange={e =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className='w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[12px] font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[11px] font-black text-black uppercase tracking-widest ml-1'>
                Confirm New Password
              </label>
              <input
                type='password'
                required
                value={formData.confirmPassword}
                onChange={e =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className='w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[12px] font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black'
              />
            </div>

            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={() => navigate(-1)}
                className='flex-1 bg-slate-100 text-black py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='flex-1 bg-blue-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-blue-100 transition-all active:scale-95'
              >
                Update Now
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChangePassword;
