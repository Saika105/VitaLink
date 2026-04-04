import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const apiUrl = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const inputStyle =
    'w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all bg-slate-50/50';
  const labelStyle =
    'text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1 mb-2 block';

  const handleReset = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!token) {
      alert('Invalid session. Please use the link sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/patients/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: formData.password }),
      });

      if (response.ok) {
        alert('Password reset successful! Please login.');
        navigate('/login-patient');
      } else {
        const data = await response.json();
        alert(data.message || 'Token expired');
      }
    } catch (err) {
      alert('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <main className='grow flex items-center justify-center p-6'>
        <div className='w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12'>
          <div className='mb-8 text-center'>
            <p className='text-[12px] font-black text-[#3B82F6] uppercase tracking-[0.25em] mb-2'>
              Vault Recovery
            </p>
            <h2 className='text-3xl font-black text-slate-900 uppercase tracking-tighter'>
              Reset Password
            </h2>
          </div>
          <form onSubmit={handleReset} className='space-y-5'>
            <div>
              <label className={labelStyle}>New Password</label>
              <input
                type='password'
                required
                className={inputStyle}
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelStyle}>Confirm New</label>
              <input
                type='password'
                required
                className={inputStyle}
                value={formData.confirmPassword}
                onChange={e =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>
            <button
              type='submit'
              disabled={loading}
              className='w-full h-12 bg-[#3B82F6] text-white text-[11px] rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50 mt-4'
            >
              {loading ? 'Restoring Access...' : 'Finalize Reset'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
