import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);

  const [patientData, setPatientData] = useState({
    upid: '',
    fullName: '',
    email: '',
    age: '',
    gender: '',
    profilePhoto: null,
    phone: '',
    emergencyContact: { name: '', phone: '', relationship: '' },
    address: '',
    dateOfBirth: '',
    bloodGroup: '',
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        const response = await fetch(`${apiUrl}/patient/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPatientData(data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchPatientInfo();
  }, [apiUrl]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login-patient');
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (file) {
      navigate('/my-records', { state: { selectedFile: file } });
    }
  };

  const handleShare = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#F8FAFC',
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${patientData.fullName || 'Patient'}_VitaLink_Card.png`;
      link.click();
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <DashboardNav />

      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileUpload}
        className='hidden'
        accept='image/*,.pdf'
      />

      <main className='grow flex items-center justify-center p-4 md:p-8 font-inter'>
        <div className='flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-4xl shadow-xl overflow-hidden border border-slate-200'>
          <aside
            ref={cardRef}
            className='w-full md:w-95 bg-slate-50 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-200'
          >
            <div className='flex flex-col items-center text-center mb-6'>
              <div className='w-32 h-32 bg-white rounded-3xl shadow border border-slate-300 mb-4 overflow-hidden flex items-center justify-center'>
                {patientData.profilePhoto?.url ? (
                  <img
                    src={patientData.profilePhoto.url}
                    alt={patientData.fullName}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center'>
                    <svg
                      className='w-12 h-12 text-blue-600/40'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className='text-lg font-bold text-slate-900 uppercase font-inter'>
                {patientData.fullName || 'Patient Name'}
              </h3>
              <p className='text-sm text-blue-600 font-inter mt-0.5'>
                {patientData.upid || 'PT-XXXXXX'}
              </p>
            </div>

            <div className='grid grid-cols-3 gap-2.5 w-full mb-5 font-inter'>
              <div className='bg-white border rounded-xl p-2.5 text-center shadow-sm'>
                <p className='text-[13px] text-black font-inter'>Age</p>
                <p className='text-sm font-bold text-slate-900 font-inter'>
                  {patientData.age || '--'}
                </p>
              </div>
              <div className='bg-white border rounded-xl p-2.5 text-center shadow-sm'>
                <p className='text-[13px] text-black font-inter'>Gender</p>
                <p className='text-sm font-bold text-slate-900 font-inter'>
                  {patientData.gender || '--'}
                </p>
              </div>
              <div className='bg-white border rounded-xl p-2.5 text-center shadow-sm'>
                <p className='text-[13px] text-black font-inter'>Blood</p>
                <p className='text-sm font-bold text-blue-700 font-inter'>
                  {patientData.bloodGroup || '--'}
                </p>
              </div>
            </div>

            <div className='w-full space-y-3.5 font-inter'>
              <div>
                <p className='text-[13px] text-black uppercase mb-0.5 font-inter'>
                  Email
                </p>
                <div className='bg-white border rounded-lg px-3.5 py-1.5 text-xs font-inter'>
                  {patientData.email || '---'}
                </div>
              </div>
              <div>
                <p className='text-[13px] text-black uppercase mb-0.5 font-inter'>
                  Contact Number
                </p>
                <div className='bg-white border rounded-lg px-3.5 py-1.5 text-xs font-medium font-inter'>
                  {patientData.phone || '---'}
                </div>
              </div>
              <div>
                <p className='text-[13px] text-red-600 uppercase mb-0.5 font-inter'>
                  Emergency Contact
                </p>
                <div className='bg-red-50 border border-red-200 rounded-lg px-3.5 py-1.5 text-xs font-bold text-red-700 font-inter'>
                  {patientData.emergencyContact?.phone || '---'}
                </div>
              </div>
              <div>
                <p className='text-[13px] text-black uppercase mb-0.5 font-inter'>
                  Address
                </p>
                <div className='bg-white border rounded-lg px-3.5 py-1.5 text-[11px] leading-relaxed font-inter'>
                  {patientData.address || '---'}
                </div>
              </div>
            </div>
          </aside>

          <section className='grow p-8 md:p-12 flex flex-col bg-white font-inter'>
            <div className='mb-8 font-inter'>
              <h2 className='text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase font-inter'>
                Patient Overview
              </h2>
              <p className='text-sm font-bold text-blue-700 uppercase tracking-widest mt-0.5 font-inter'>
                UPHC Central Health Hub
              </p>
            </div>

            <div className='space-y-5 grow font-inter'>
              <button
                onClick={triggerFileSelect}
                className='w-full text-left bg-slate-50 border border-slate-300 rounded-2xl p-5 flex justify-between items-center group hover:bg-white hover:border-blue-600 hover:shadow-lg transition-all focus:ring-4 focus:ring-blue-100 outline-none font-inter'
              >
                <div>
                  <span className='block text-lg font-bold text-slate-900 font-inter'>
                    Upload Prescription
                  </span>
                  <span className='text-xs text-slate-600 font-medium mt-0.5 block font-inter'>
                    Digitalize your medical dose
                  </span>
                </div>
                <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400'>
                  <span className='text-xl font-inter'>↑</span>
                </div>
              </button>

              <button
                onClick={triggerFileSelect}
                className='w-full text-left bg-slate-50 border border-slate-300 rounded-2xl p-5 flex justify-between items-center group hover:bg-white hover:border-blue-600 hover:shadow-lg transition-all focus:ring-4 focus:ring-blue-100 outline-none font-inter'
              >
                <div>
                  <span className='block text-lg font-bold text-slate-900 font-inter'>
                    Upload Medical Report
                  </span>
                  <span className='text-xs text-slate-600 font-medium mt-0.5 block font-inter'>
                    Keep your history safe
                  </span>
                </div>
                <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400'>
                  <span className='text-xl font-inter'>↑</span>
                </div>
              </button>
            </div>

            <div className='flex flex-col items-end gap-3.5 pt-8 mt-auto border-t border-slate-100 font-inter'>
              <button
                onClick={handleShare}
                className='w-40 border-2 border-blue-600 text-blue-600 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all font-inter'
              >
                Share Card
              </button>
              <button
                onClick={() => navigate('/edit-profile')}
                className='w-40 border-2 border-slate-300 rounded-xl py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-widest hover:bg-slate-200 hover:border-slate-400 transition-all focus:ring-2 focus:ring-slate-400 outline-none font-inter'
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className='w-48 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all focus:ring-2 focus:ring-red-500 outline-none font-inter'
              >
                LogOut
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientDashboard;
