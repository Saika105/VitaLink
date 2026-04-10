import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo black.png';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    staffId: '',
    password: '',
    role: 'doctor-assistants',
  });
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);

    const dashboardRoutes = {
      'doctor-assistants': '/assistant',
      'lab-assistants': '/reporter-dashboard',
      receptionists: '/receptionist',
    };

    try {
      const response = await fetch(`${apiUrl}/api/v1/${loginData.role}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [loginData.role === 'doctor-assistants'
            ? 'assistantId'
            : loginData.role === 'lab-assistants'
              ? 'labAssistantId'
              : 'receptionistId']: loginData.staffId,
          password: loginData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('role', loginData.role);

        if (result.data.user) {
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }

        alert('Login Authorized');
        navigate(dashboardRoutes[loginData.role]);
      } else {
        alert(result.message || 'Invalid Credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Server Connection Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#EFF6FF] flex items-center justify-center p-4 text-slate-800 font-inter'>
      <div className='flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-4xl shadow-xl overflow-hidden border border-blue-50'>
        <div className='w-full md:w-1/2 p-10 md:p-12 flex flex-col justify-center bg-white font-inter'>
          <div className='mb-8 text-center md:text-left font-inter'>
            <h2 className='text-3xl font-black text-slate-900 tracking-tighter uppercase font-inter'>
              Staff Login
            </h2>
            <p className='text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.2em] mt-1 font-inter'>
              Administrative Portal Access
            </p>
          </div>

          <form onSubmit={handleLogin} className='space-y-4 font-inter'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-[12px] font-bold text-black uppercase tracking-widest ml-1 font-inter'>
                Select Department
              </label>
              <select
                value={loginData.role}
                onChange={e =>
                  setLoginData({ ...loginData, role: e.target.value })
                }
                className='border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all bg-slate-50/50 font-bold font-inter'
              >
                <option value='doctor-assistants'>Doctor Assistant</option>
                <option value='lab-assistants'>Lab Assistant</option>
                <option value='receptionists'>Receptionist</option>
              </select>
            </div>

            <div className='flex flex-col gap-1.5 font-inter'>
              <label className='text-[12px] font-bold text-black uppercase tracking-widest ml-1 font-inter'>
                Staff Access Key
              </label>
              <input
                type='text'
                className='border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-inter placeholder-slate-300 bg-slate-50/50'
                placeholder='Enter your ID'
                value={loginData.staffId}
                onChange={e =>
                  setLoginData({ ...loginData, staffId: e.target.value })
                }
                required
              />
            </div>

            <div className='flex flex-col gap-1.5 font-inter'>
              <label className='text-[12px] font-bold text-black uppercase tracking-widest ml-1 font-inter'>
                Security PIN
              </label>
              <input
                type='password'
                className='border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all placeholder-slate-300 bg-slate-50/50 font-inter'
                placeholder='********'
                value={loginData.password}
                onChange={e =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-[#3B82F6] hover:bg-[#1E40AF] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] mt-2 font-inter disabled:bg-slate-400'
            >
              {loading ? 'Verifying...' : 'Authorize Login'}
            </button>
          </form>

          <div className='mt-8 pt-6 border-t border-slate-50 text-center font-inter'>
            <p className='text-[12px] text-black font-bold uppercase tracking-tight font-inter'>
              Administrative issue?
              <button
                className='text-[#3B82F6] font-black hover:text-[#1E40AF] hover:underline ml-2 uppercase tracking-widest transition-colors font-inter'
                onClick={() => navigate('/')}
              >
                IT Support
              </button>
            </p>
          </div>
        </div>

        <div className='w-full md:w-1/2 bg-[#F8FAFC] p-10 md:p-12 flex flex-col items-center border-l border-slate-100 relative font-inter'>
          <div className='absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50'></div>

          <div className='mb-8 relative z-10 font-inter'>
            <img
              src={logo}
              alt='VitaLink Logo'
              className='h-20 w-auto object-contain font-inter'
            />
          </div>

          <div className='max-w-85 w-full space-y-8 relative z-10 font-inter'>
            <div className='border-y border-blue-100 py-3 font-inter'>
              <h4 className='text-[11px] font-black text-[#3B82F6] tracking-[0.25em] uppercase text-center font-inter'>
                Universal Patient Healthcare Companion
              </h4>
            </div>

            <ul className='space-y-6 text-left font-inter'>
              <li className='flex gap-4 font-inter'>
                <div className='mt-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                <p className='text-black leading-relaxed text-[13px] font-semibold font-inter'>
                  Coordinate doctor schedules and streamline patient clinical
                  workflows.
                </p>
              </li>
              <li className='flex gap-4 font-inter'>
                <div className='mt-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                <p className='text-black leading-relaxed text-[13px] font-semibold font-inter'>
                  Manage diagnostic laboratory requests and secure test results
                  data.
                </p>
              </li>
              <li className='flex gap-4 font-inter'>
                <div className='mt-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                <p className='text-black leading-relaxed text-[13px] font-semibold font-inter'>
                  Oversee hospital reception and manage patient billing cycles.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
