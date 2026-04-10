import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo black.png';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.data?.accessToken || data.data?.token || data.token;

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('role', 'admin');
          navigate('/admin-staff');
        } else {
          setError(
            'Security protocol error: Access token not found in response.',
          );
        }
      } else {
        if (response.status === 404) {
          setError(
            'Endpoint mismatch (404). Check if backend uses /admin/ or /admins/.',
          );
        } else {
          setError(
            data.message || 'Authorization failed. Invalid credentials.',
          );
        }
      }
    } catch (err) {
      setError('Critical: Connection to security server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#F0F7FF] flex items-center justify-center p-6 font-inter'>
      <div className='flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200'>
        <div className='w-full md:w-1/2 p-12 flex flex-col justify-center bg-white'>
          <div className='mb-10 text-center md:text-left'>
            <h2 className='text-3xl font-inter font-black text-slate-900 tracking-tight uppercase'>
              Admin Portal
            </h2>
            <p className='text-[10px] font-inter font-bold text-[#4486F6] uppercase tracking-[0.3em] mt-2 ml-1'>
              System Root Access
            </p>
          </div>

          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-inter font-black uppercase tracking-widest text-center'>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className='space-y-6'>
            <div className='flex flex-col gap-2'>
              <label className='text-[10px] font-inter font-black text-slate-400 uppercase tracking-widest ml-1'>
                Administrator Email
              </label>
              <input
                type='email'
                className='border border-slate-200 bg-slate-50/50 rounded-xl p-4 text-sm outline-none focus:bg-white focus:border-[#4486F6] transition-all shadow-inner font-inter'
                placeholder='admin@vitalink.com'
                value={loginData.email}
                onChange={e =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-[10px] font-inter font-black text-slate-400 uppercase tracking-widest ml-1'>
                Master Password
              </label>
              <input
                type='password'
                className='border border-slate-200 bg-slate-50/50 rounded-xl p-4 text-sm outline-none focus:bg-white focus:border-[#4486F6] transition-all shadow-inner font-inter'
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
              className={`w-full bg-[#4486F6] hover:bg-blue-600 text-white font-inter font-bold py-4 rounded-2xl shadow-lg active:scale-[0.97] transition-all text-xs uppercase tracking-[0.25em] mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Verifying Protocols...' : 'Authorize Login'}
            </button>
          </form>
        </div>

        <div className='w-full md:w-1/2 bg-slate-50 p-12 flex flex-col items-center justify-center text-center border-l border-slate-100'>
          <div className='mb-8 p-6 bg-white rounded-3xl shadow-sm inline-block border border-slate-100'>
            <img
              src={logo}
              alt='VitaLink Logo'
              className='h-18 w-auto object-contain'
            />
          </div>

          <div className='max-w-xs space-y-4 font-inter'>
            <h3 className='text-xl font-bold text-slate-800 tracking-tight uppercase'>
              Security Protocol
            </h3>
            <div className='space-y-4 text-slate-500 leading-relaxed text-xs font-medium opacity-80'>
              <p>
                Access the root management system to oversee medical staff,
                verify hospital credentials, and audit security logs.
              </p>
              <p>
                Maintain the integrity of the network by managing system
                permissions and reviewing all high-level administrative
                activity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
