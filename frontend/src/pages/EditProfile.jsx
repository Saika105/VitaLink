import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';
import { protectedFetch } from '../utils/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    'w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all bg-slate-50/50 font-inter';
  const labelStyle =
    'text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1 mb-2 block font-inter';

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const response = await protectedFetch('/api/v1/patients/profile');
        if (response.ok) {
          const result = await response.json();
          const data = result.data;
          setFormData({
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            emergencyContact:
              data.emergencyContact?.phone || data.emergencyContact || '',
            address: data.address || '',
            profilePhoto: data.profilePhoto || null,
          });
          if (data.profilePhoto) setImagePreview(data.profilePhoto);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
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

      const contactPhone =
        typeof formData.emergencyContact === 'object'
          ? formData.emergencyContact.phone
          : formData.emergencyContact;
      data.append('emergencyContact', contactPhone || '');

      if (formData.profilePhoto instanceof File) {
        data.append('profilePhoto', formData.profilePhoto);
      }

      const response = await protectedFetch('/api/v1/patients/update-profile', {
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': undefined,
        },
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        navigate('/patient-dashboard');
      } else {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          alert(errorData.message || 'Update failed');
        } catch (e) {
          alert(
            'Server Error: Backend returned an invalid response. Check Render logs.',
          );
        }
      }
    } catch (err) {
      console.error('Submit Error:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await protectedFetch(
        '/api/v1/patients/change-password',
        {
          method: 'POST',
          body: JSON.stringify(passwordData),
        },
      );
      if (response.ok) {
        alert('Password updated!');
        setIsModalOpen(false);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed');
      }
    } catch (err) {
      alert('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <DashboardNav />

      <main className='grow flex items-center justify-center p-6 md:p-12'>
        <form
          onSubmit={handleSubmit}
          className='w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-14'
        >
          <div className='mb-10 text-center md:text-left'>
            <p className='text-[12px] font-black text-[#3B82F6] uppercase tracking-[0.25em] mb-2'>
              Health Vault
            </p>
            <h2 className='text-3xl font-black text-slate-900 uppercase tracking-tighter'>
              Edit Profile
            </h2>
          </div>

          <div className='flex flex-col md:flex-row gap-12'>
            <div className='flex flex-col items-center gap-4'>
              <div className='relative group'>
                <div className='w-40 h-40 rounded-4xl overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100 flex items-center justify-center'>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt='Profile'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='text-slate-300'>No Photo</div>
                  )}
                </div>
                <label className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-4xl'>
                  <span className='text-[10px] font-black text-white uppercase'>
                    Change Photo
                  </span>
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <button
                type='button'
                onClick={() => setIsModalOpen(true)}
                className='mt-6 w-full h-12 bg-[#3B82F6] text-white text-[10px] rounded-xl font-black uppercase tracking-widest'
              >
                Password
              </button>
            </div>

            <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <label className={labelStyle}>Full Name</label>
                <input
                  type='text'
                  value={formData.fullName}
                  onChange={e =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Email</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Phone</label>
                <input
                  type='text'
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={inputStyle}
                />
              </div>
              <div className='md:col-span-2'>
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
                />
              </div>
              <div className='md:col-span-2'>
                <label className={labelStyle}>Address</label>
                <textarea
                  value={formData.address}
                  onChange={e =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className={`${inputStyle} h-28 resize-none`}
                />
              </div>
            </div>
          </div>

          <div className='mt-12 flex gap-4 justify-end'>
            <button
              type='button'
              onClick={() => navigate('/patient-dashboard')}
              className='w-32 h-12 border-2 rounded-xl text-[11px] font-black text-slate-700 uppercase'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='w-64 h-12 bg-[#3B82F6] text-white text-[11px] rounded-xl font-black uppercase'
            >
              {loading ? 'Processing...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>

      {/* Simplified Modal logic */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
          <div className='bg-white w-full max-w-md rounded-4xl p-8 shadow-2xl'>
            <h3 className='text-xl font-black mb-6 uppercase'>Credentials</h3>
            <form onSubmit={handleChangePassword} className='space-y-4'>
              <input
                type='password'
                placeholder='Old Password'
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
              <input
                type='password'
                placeholder='New Password'
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
              <input
                type='password'
                placeholder='Confirm'
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
              <button
                type='submit'
                className='w-full h-12 bg-[#3B82F6] text-white rounded-xl uppercase font-black'
              >
                Update
              </button>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='w-full h-12 border-2 rounded-xl uppercase font-black'
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default EditProfile;
