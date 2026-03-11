import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormInput from '../components/FormInput';

const PatientSignUp = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nid: '',
    birthCertificate: '',
    dob: '',
    phone: '',
    gender: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
  });

  const [showPopup, setShowPopup] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });

  const isUnder18 = dob => {
    if (!dob) return false;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUpClick = async e => {
    e.preventDefault();

    if (!isUnder18(formData.dob) && !formData.nid) {
      alert('NID is required for adults.');
      return;
    }
    if (isUnder18(formData.dob) && !formData.birthCertificate) {
      alert('Birth Certificate Number is required for minors.');
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/patients/initialize-registration`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setGeneratedId(data.uniqueId);
        setShowPopup(true);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      alert('Server connection error.');
    }
  };

  const handleCreateProfile = async () => {
    if (!passwords.password || passwords.password.length < 6) {
      alert('Password too short.');
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/patients/finalize-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uniqueId: generatedId,
          password: passwords.password,
        }),
      });

      if (response.ok) {
        alert('Profile Created Successfully!');
        setShowPopup(false);
        navigate('/login-patient');
      } else {
        const data = await response.json();
        alert(data.message || 'Finalization failed.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='min-h-screen bg-[#EFF6FF] flex flex-col font-inter text-slate-800 relative'>
      <Navbar />

      <main className='grow flex flex-col items-center justify-center p-4 py-8 font-inter'>
        <div className='mb-6 text-center font-inter'>
          <h2 className='text-3xl font-black text-slate-900 tracking-tighter uppercase font-inter'>
            Create Your Health Account
          </h2>
          <p className='text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.2em] mt-2 font-inter'>
            Official registration for VitaLink Vault
          </p>
        </div>

        <div className='bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-blue-50 w-full max-w-4xl font-inter'>
          <form
            onSubmit={handleSignUpClick}
            className='grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 font-inter'
          >
            <div className='space-y-4 font-inter'>
              <FormInput
                label='Full Name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Enter Full Name'
                required
              />
              <FormInput
                label='Email Address'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='email@example.com'
                required
              />
              <FormInput
                label='Date of Birth'
                type='date'
                name='dob'
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label='Gender'
                name='gender'
                value={formData.gender}
                onChange={handleInputChange}
                placeholder='Male / Female / Other'
                required
              />
            </div>

            <div className='space-y-4 font-inter'>
              {isUnder18(formData.dob) ? (
                <FormInput
                  label='Birth Certificate Number'
                  name='birthCertificate'
                  value={formData.birthCertificate}
                  onChange={handleInputChange}
                  placeholder='17-digit Number'
                  required
                />
              ) : (
                <FormInput
                  label='NID Number'
                  name='nid'
                  value={formData.nid}
                  onChange={handleInputChange}
                  placeholder='10 or 17-digit ID'
                  required
                />
              )}

              <FormInput
                label='Phone Number'
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                placeholder='+880'
                required
              />
              <FormInput
                label='Blood Group'
                name='bloodGroup'
                value={formData.bloodGroup}
                onChange={handleInputChange}
                placeholder='e.g. O+, A-'
                required
              />
              <FormInput
                label='Emergency Contact'
                type='tel'
                name='emergencyContact'
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder='Guardian/Relative Number'
                required
              />
            </div>

            <div className='md:col-span-2 space-y-4 font-inter'>
              <FormInput
                label='Address'
                name='address'
                value={formData.address}
                onChange={handleInputChange}
                placeholder='Full Residential Address'
                required
              />
            </div>

            <div className='md:col-span-2 flex flex-col items-center mt-6 font-inter'>
              <button
                type='submit'
                className='w-full max-w-xs bg-[#3B82F6] hover:bg-[#1E40AF] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] text-xs uppercase tracking-widest font-inter'
              >
                Request Unique ID
              </button>
              <p className='mt-6 text-[12px] text-black font-bold uppercase tracking-tight font-inter'>
                Already registered?
                <button
                  type='button'
                  onClick={() => navigate('/login-patient')}
                  className='text-[#3B82F6] font-black ml-2 hover:underline uppercase font-inter'
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {showPopup && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 font-inter'>
          <div className='bg-white rounded-4xl shadow-2xl w-full max-w-md border border-blue-50 overflow-hidden font-inter'>
            <div className='p-10 flex flex-col items-center font-inter'>
              <h3 className='text-2xl font-black text-slate-800 mb-1 uppercase tracking-tight font-inter text-center'>
                Identity Verified
              </h3>
              <p className='text-[10px] text-[#3B82F6] mb-8 uppercase tracking-[0.25em] font-black font-inter text-center'>
                Your official VitaLink ID has been issued
              </p>

              <div className='w-full space-y-5 bg-white p-8 rounded-2xl border border-blue-100 shadow-sm font-inter'>
                <div className='flex flex-col gap-1 font-inter'>
                  <label className='text-[10px] font-black text-black uppercase tracking-widest font-inter'>
                    Assigned ID
                  </label>
                  <input
                    type='text'
                    value={generatedId}
                    readOnly
                    className='w-full border border-slate-200 rounded-lg p-3 bg-slate-50 font-mono text-[#3B82F6] text-center text-xl font-bold cursor-not-allowed font-inter'
                  />
                </div>

                <div className='flex flex-col gap-1 font-inter'>
                  <label className='text-[10px] font-black text-black uppercase tracking-widest font-inter'>
                    Secure Password
                  </label>
                  <input
                    type='password'
                    placeholder='********'
                    autoComplete='new-password'
                    onChange={e =>
                      setPasswords({ ...passwords, password: e.target.value })
                    }
                    className='w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] shadow-sm font-inter'
                  />
                </div>

                <div className='flex flex-col gap-1 font-inter'>
                  <label className='text-[10px] font-black text-black uppercase tracking-widest font-inter'>
                    Confirm Password
                  </label>
                  <input
                    type='password'
                    placeholder='********'
                    autoComplete='new-password'
                    onChange={e =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    className='w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] shadow-sm font-inter'
                  />
                </div>
              </div>

              <div className='mt-8 flex flex-col items-center w-full gap-4 font-inter'>
                <button
                  onClick={handleCreateProfile}
                  className='w-full bg-[#3B82F6] hover:bg-[#1E40AF] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] uppercase text-xs tracking-widest font-inter'
                >
                  Finalize Profile
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className='text-[10px] text-black font-black hover:text-red-500 uppercase tracking-widest transition-colors font-inter'
                >
                  Back to Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSignUp;
