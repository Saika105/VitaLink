import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';
import { protectedFetch } from '../utils/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    address: '',
    profilePhoto: null,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const inputStyle =
    'w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all bg-slate-50/50';
  const labelStyle =
    'text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1 mb-2 block font-inter';

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
       const response = await protectedFetch(
         `${import.meta.env.VITE_API_URL}/api/v1/patients/profile`,
       );
        if (response.ok) {
          const result = await response.json();
          const data = result.data;
          setFormData({
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            emergencyContact: data.emergencyContact || '',
            address: data.address || '',
            profilePhoto: data.profilePhoto || null,
          });
          if (data.profilePhoto) setImagePreview(data.profilePhoto);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentData();
  }, []);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit');
        return;
      }
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, profilePhoto: file }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('emergencyContact', formData.emergencyContact);

      if (formData.profilePhoto instanceof File) {
        data.append('profilePhoto', formData.profilePhoto);
      }

      const response = await protectedFetch(
        `${import.meta.env.VITE_API_URL}/api/v1/patients/update-profile`,
        {
          method: 'PATCH',
          body: data,
        },
      );

      if (response.ok) {
        alert('Profile updated successfully!');
        navigate('/patient-dashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await protectedFetch(
        `${import.meta.env.VITE_API_URL}/api/v1/patients/change-password`,
        {
          method: 'POST',
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword,
          }),
        },
      );
      if (response.ok) {
        alert('Password updated successfully!');
        setIsModalOpen(false);
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Update failed');
      }
    } catch (err) {
      alert('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
     
      const response = await fetch(
        `${apiUrl}/api/v1/patients/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        },
      );
      if (response.ok) {
        setResetSent(true);
        setTimeout(() => setResetSent(false), 5000);
      } else {
        alert('Failed to initiate reset. Please check your internet.');
      }
    } catch (err) {
      alert('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <DashboardNav />

      <main className='grow flex items-center justify-center p-6 md:p-12 font-inter'>
        <form
          onSubmit={handleSubmit}
          className='w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-14 font-inter'
        >
          <div className='mb-10 text-center md:text-left font-inter'>
            <p className='text-[12px] font-black text-[#3B82F6] uppercase tracking-[0.25em] mb-2 font-inter'>
              Secure Vault Identity
            </p>
            <h2 className='text-3xl font-black text-slate-900 uppercase tracking-tighter font-inter'>
              Edit Vault Profile
            </h2>
            <p className='text-xs font-bold text-slate-600 uppercase tracking-widest mt-1 font-inter'>
              Update your digital health credentials
            </p>
          </div>

          <div className='flex flex-col md:flex-row gap-12 font-inter'>
            <div className='flex flex-col items-center gap-4 font-inter'>
              <label className='text-[11px] font-black text-slate-800 uppercase tracking-widest font-inter'>
                Profile Photo
              </label>
              <div className='relative group font-inter'>
                <div className='w-40 h-40 rounded-4xl overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100 flex items-center justify-center font-inter'>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt='Profile'
                      className='w-full h-full object-cover font-inter'
                    />
                  ) : (
                    <svg
                      className='w-12 h-12 text-slate-300 font-inter'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                  )}
                </div>
                <label className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-4xl font-inter'>
                  <span className='text-[10px] font-black text-white uppercase tracking-tighter font-inter'>
                    Change Photo
                  </span>
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden font-inter'
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className='text-[10px] text-slate-500 font-bold uppercase font-inter'>
                JPG/PNG Max 2MB
              </p>

              <button
                type='button'
                onClick={() => setIsModalOpen(true)}
                className='mt-6 w-full h-12 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[10px] rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-inter'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                  />
                </svg>
                Change Password
              </button>
            </div>

            <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 font-inter'>
              <div className='md:col-span-2 font-inter'>
                <label className={labelStyle}>Full Name</label>
                <input
                  type='text'
                  value={formData.fullName}
                  onChange={e =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={inputStyle}
                  placeholder='Full Name'
                />
              </div>

              <div className='font-inter'>
                <label className={labelStyle}>Email Address</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputStyle}
                  placeholder='email@example.com'
                />
              </div>

              <div className='font-inter'>
                <label className={labelStyle}>Contact Number</label>
                <input
                  type='text'
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={inputStyle}
                  placeholder='Contact Number'
                />
              </div>

              <div className='md:col-span-2 font-inter'>
                <label className={labelStyle}>Emergency Contact Number</label>
                <input
                  type='text'
                  value={formData.emergencyContact}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      emergencyContact: e.target.value,
                    })
                  }
                  className={inputStyle}
                  placeholder='Emergency Contact'
                />
              </div>

              <div className='md:col-span-2 flex flex-col font-inter'>
                <label className={labelStyle}>Permanent Home Address</label>
                <textarea
                  value={formData.address}
                  onChange={e =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className={`${inputStyle} h-28 resize-none`}
                  placeholder='Enter your full address...'
                />
              </div>
            </div>
          </div>

          <div className='mt-12 flex flex-col sm:flex-row gap-4 justify-end font-inter'>
            <button
              type='button'
              onClick={() => navigate('/patient-dashboard')}
              className='w-32 h-12 border-2 rounded-xl border-slate-100 text-[11px] font-black text-slate-700 uppercase tracking-widest hover:bg-slate-200 hover:border-slate-400 transition-all active:scale-[0.98] font-inter'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='w-64 h-12 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 font-inter'
            >
              {loading ? 'Processing...' : 'Secure & Save Changes'}
            </button>
          </div>
        </form>
      </main>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-inter'>
          <div className='bg-white w-full max-w-md rounded-4xl p-8 shadow-2xl border border-slate-100 font-inter'>
            <div className='mb-6 font-inter flex justify-between items-start'>
              <div className='font-inter'>
                <h3 className='text-xl font-black text-slate-900 uppercase tracking-tighter font-inter'>
                  Access Credentials
                </h3>
                <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest font-inter'>
                  Change your vault password
                </p>
              </div>
              <button
                type='button'
                onClick={() => setShowPasswords(!showPasswords)}
                className='text-slate-400 hover:text-[#3B82F6] transition-colors p-2 font-inter'
              >
                {showPasswords ? (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                )}
              </button>
            </div>

            {resetSent && (
              <div className='mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-pulse'>
                <p className='text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider text-center'>
                  Recovery link sent to your vault email!
                </p>
              </div>
            )}

            <form
              onSubmit={handleChangePassword}
              className='space-y-4 font-inter'
            >
              <div className='font-inter'>
                <label className={labelStyle}>Current Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  className={inputStyle}
                  value={passwordData.oldPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className='font-inter'>
                <label className={labelStyle}>New Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  className={inputStyle}
                  value={passwordData.newPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className='font-inter'>
                <label className={labelStyle}>Confirm New Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  className={inputStyle}
                  value={passwordData.confirmPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className='flex flex-col gap-3 pt-4 font-inter'>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full h-12 bg-[#3B82F6] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-500/30 font-inter'
                >
                  {loading ? 'Validating...' : 'Update Password'}
                </button>
                {!resetSent && (
                  <button
                    type='button'
                    onClick={handleForgotPassword}
                    className='text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-black transition-all text-center font-inter'
                  >
                    Forgot Current Password?
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='w-full h-12 border-2 border-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all font-inter'
                >
                  Close Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EditProfile;
