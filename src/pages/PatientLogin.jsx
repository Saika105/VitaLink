import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo black.png';

const LoginPatient = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ uniqueId: '', password: '' });

  const handleLogin = e => {
    e.preventDefault();
    localStorage.setItem('token', 'mock-token-12345');
    navigate('/patient-dashboard');
  };

  return (
    <div className='min-h-screen bg-[#EFF6FF] flex items-center justify-center p-4 font-inter text-slate-800'>
      <div className='flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-4xl shadow-xl overflow-hidden border border-blue-50 font-inter'>
        <div className='w-full md:w-1/2 p-10 md:p-12 flex flex-col justify-center bg-white'>
          <div className='mb-8 text-center md:text-left'>
            <h2 className='text-3xl font-black text-slate-900 tracking-tighter uppercase font-inter'>
              Patient Login
            </h2>
            <p className='text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.2em] mt-1 font-inter'>
              Access your digital medical vault
            </p>
          </div>

          <form onSubmit={handleLogin} className='space-y-4'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-[10px] font-black text-black uppercase tracking-widest ml-1 font-inter'>
                Unique Patient ID
              </label>
              <input
                type='text'
                className='border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-mono placeholder-slate-300 bg-slate-50/50'
                placeholder='PT-XXXXXX'
                onChange={e =>
                  setLoginData({ ...loginData, uniqueId: e.target.value })
                }
                required
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-[10px] font-black text-black uppercase tracking-widest ml-1 font-inter'>
                Password
              </label>
              <input
                type='password'
                className='border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all placeholder-slate-300 bg-slate-50/50 font-inter'
                placeholder='********'
                onChange={e =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type='submit'
              className='w-full bg-[#3B82F6] hover:bg-[#1E40AF] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] mt-2 font-inter'
            >
              Enter My Vault
            </button>
          </form>

          <div className='mt-8 pt-6 border-t border-slate-50 text-center font-inter'>
            <p className='text-[10px] text-black font-bold uppercase tracking-tight'>
              New to VitaLink?
              <button
                className='text-[#3B82F6] font-black hover:text-[#1E40AF] hover:underline ml-2 uppercase tracking-widest transition-colors font-inter'
                onClick={() => navigate('/signup-patient')}
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        <div className='w-full md:w-1/2 bg-[#F8FAFC] p-10 md:p-12 flex flex-col items-center border-l border-slate-100 relative'>
          <div className='absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50'></div>

          <div className='mb-8 relative z-10'>
            <img
              src={logo}
              alt='VitaLink Logo'
              className='h-20 w-auto object-contain'
            />
          </div>

          <div className='max-w-85 w-full space-y-8 relative z-10 font-inter'>
            <div className='border-y border-blue-100 py-3 font-inter'>
              <h4 className='text-[11px] font-black text-[#3B82F6] tracking-[0.25em] uppercase text-center font-inter'>
                Universal Patient Healthcare Companion
              </h4>
            </div>

            <ul className='space-y-6 text-left font-inter'>
              <li className='flex gap-4'>
                <div className='mt-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                <p className='text-black leading-relaxed text-[13px] font-semibold font-inter'>
                  Access prescriptions, scans, and bills in a single secure
                  digital timeline.
                </p>
              </li>
              <li className='flex gap-4'>
                <div className='mt-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                <p className='text-black leading-relaxed text-[13px] font-semibold font-inter'>
                  Secure and private. End-to-end encryption keeps records
                  between you and your doctor.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPatient;
