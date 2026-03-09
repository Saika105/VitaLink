import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';
import FormInput from '../components/FormInput';

const EditProfile = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    emergencyContact: '',
    address: '',
    dob: '',
    bloodGroup: '',
    gender: '',
    age: '',
  });

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
          setFormData(data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchCurrentData();
  }, [apiUrl]);

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
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-black'>
      <Navbar />
      <DashboardNav />

      <main className='grow flex items-center justify-center p-6 md:p-10 font-inter'>
        <form
          onSubmit={handleSubmit}
          className='w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 md:p-12 font-inter text-black'
        >
          <div className='mb-8'>
            <h2 className='text-3xl font-extrabold tracking-tight uppercase font-inter text-black'>
              Edit Vault Profile
            </h2>
            <p className='text-sm font-bold text-black uppercase tracking-widest mt-1 font-inter'>
              Update your digital health identity
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 font-inter'>
            <div className='md:col-span-2'>
              <FormInput
                label='Full Name'
                name='name'
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <FormInput
              label='Email Address'
              type='email'
              name='email'
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <FormInput
              label='Contact Number'
              name='contact'
              value={formData.contact}
              onChange={e =>
                setFormData({ ...formData, contact: e.target.value })
              }
            />

            <FormInput
              label='Age'
              type='number'
              name='age'
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
            />

            <div className='flex flex-col w-full gap-2'>
              <label className='text-xs font-inter font-bold text-black uppercase tracking-widest ml-1'>
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={e =>
                  setFormData({ ...formData, bloodGroup: e.target.value })
                }
                className='border border-slate-300 rounded-xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4486F6] transition-all bg-white font-inter font-medium text-black'
              >
                <option value=''>Select</option>
                <option value='A+'>A+</option>
                <option value='A-'>A-</option>
                <option value='B+'>B+</option>
                <option value='B-'>B-</option>
                <option value='O+'>O+</option>
                <option value='O-'>O-</option>
                <option value='AB+'>AB+</option>
                <option value='AB-'>AB-</option>
              </select>
            </div>

            <div className='md:col-span-2'>
              <FormInput
                label='Emergency Contact'
                name='emergencyContact'
                value={formData.emergencyContact}
                onChange={e =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
              />
            </div>

            <div className='md:col-span-2 flex flex-col gap-2'>
              <label className='text-xs font-inter font-bold text-black uppercase tracking-widest ml-1'>
                Home Address
              </label>
              <textarea
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className='border border-slate-300 rounded-xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4486F6] transition-all bg-white font-inter font-medium text-black h-24 resize-none'
              />
            </div>
          </div>

          <div className='mt-10 flex gap-4 justify-end font-inter'>
            <button
              type='button'
              onClick={() => navigate('/patient-dashboard')}
              className='px-8 py-3 rounded-xl border-2 border-black text-xs font-bold uppercase tracking-widest text-black hover:bg-slate-50 transition-all font-inter'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-10 py-3 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 shadow-lg transition-all disabled:opacity-50 font-inter'
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfile;
