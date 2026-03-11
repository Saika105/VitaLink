import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';

const EditProfile = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    emergencyContact: '',
    address: '',
    photo: '',
  });

  const inputStyle =
    'w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all font-mono placeholder-slate-300 bg-slate-50/50';

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const response = await fetch(`${apiUrl}/patient/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            email: data.email || '',
            contact: data.contact || '',
            emergencyContact: data.emergencyContact || '',
            address: data.address || '',
            photo: data.photo || '',
          });
          if (data.photo) setImagePreview(data.photo);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentData();
  }, [apiUrl]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/patient/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

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
              <label className='text-[12px] font-black text-slate-800 uppercase tracking-widest font-inter'>
                Profile Photo
              </label>
              <div className='relative group font-inter'>
                <div className='w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100 flex items-center justify-center font-inter'>
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
                <label className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2rem] font-inter'>
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
            </div>

            <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 font-inter'>
              <div className='md:col-span-2 font-inter'>
                <label className='text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1 font-inter'>
                  Full Name
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputStyle}
                  placeholder='Full Name'
                />
              </div>

              <div className='font-inter'>
                <label className='text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1 font-inter'>
                  Email Address
                </label>
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
                <label className='text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1 font-inter'>
                  Contact Number
                </label>
                <input
                  type='text'
                  value={formData.contact}
                  onChange={e =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  className={inputStyle}
                  placeholder='Contact Number'
                />
              </div>

              <div className='md:col-span-2 font-inter'>
                <label className='text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1 font-inter'>
                  Emergency Contact
                </label>
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

              <div className='md:col-span-2 flex flex-col gap-2 font-inter'>
                <label className='text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1 font-inter'>
                  Permanent Home Address
                </label>
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
      <Footer />
    </div>
  );
};

export default EditProfile;
