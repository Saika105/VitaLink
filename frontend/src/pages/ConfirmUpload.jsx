import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';
import { protectedFetch } from '../utils/api';

const ConfirmUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [recordDetails, setRecordDetails] = useState({
    title: '',
    hospitalName: '',
  });

  const selectedFile = location.state?.selectedFile;
  const uploadType = location.state?.uploadType;
  const userRole = location.state?.role;

  useEffect(() => {
    if (!selectedFile || !uploadType) {
      if (userRole === 'assistant') {
        navigate('/assistant-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    }
  }, [selectedFile, uploadType, navigate, userRole]);

  const handleUpload = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      if (uploadType === 'prescription') {
        data.append('prescriptionFile', selectedFile);
        data.append('diagnosis', recordDetails.title);
      } else {
        data.append('file', selectedFile);
        data.append('reportName', recordDetails.title);
      }

      data.append('hospitalName', recordDetails.hospitalName);

      const endpoint =
        uploadType === 'prescription'
          ? '/api/v1/patients/prescriptions'
          : '/api/v1/patients/reports';

      const response = await protectedFetch(endpoint, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        alert(
          `${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} uploaded successfully!`,
        );

        if (userRole === 'assistant') {
          navigate('/assistant-dashboard');
        } else {
          navigate('/my-records');
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Connection to server failed');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedFile) return null;

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      {userRole !== 'assistant' && <DashboardNav />}

      <main className='grow flex items-center justify-center p-6 md:p-12'>
        <div className='w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12'>
          <div className='mb-8 text-center md:text-left'>
            <p className='text-[12px] font-black text-[#3B82F6] uppercase tracking-[0.25em] mb-2'>
              Vault Submission
            </p>
            <h2 className='text-3xl font-black text-slate-900 uppercase tracking-tighter'>
              Finalize {uploadType}
            </h2>
          </div>

          <div className='bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8 flex items-center gap-4'>
            <div className='w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 font-bold text-xs uppercase'>
              File
            </div>
            <div className='overflow-hidden'>
              <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Selected File
              </p>
              <p className='text-sm font-bold text-slate-700 truncate'>
                {selectedFile.name}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload} className='space-y-6'>
            <div>
              <label className='text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1 mb-2 block'>
                {uploadType === 'prescription' ? 'Doctor Name' : 'Test Name'}
              </label>
              <input
                type='text'
                required
                className='w-full border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all bg-slate-50/50'
                placeholder={
                  uploadType === 'prescription'
                    ? 'e.g. Dr. ABCD'
                    : 'e.g. Blood Test'
                }
                value={recordDetails.title}
                onChange={e =>
                  setRecordDetails({ ...recordDetails, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className='text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1 mb-2 block'>
                Hospital / Clinic Name
              </label>
              <input
                type='text'
                required
                className='w-full border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all bg-slate-50/50'
                placeholder='e.g. Central Hospital'
                value={recordDetails.hospitalName}
                onChange={e =>
                  setRecordDetails({
                    ...recordDetails,
                    hospitalName: e.target.value,
                  })
                }
              />
            </div>

            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
              <button
                type='button'
                onClick={() => {
                  if (userRole === 'assistant') {
                    navigate('/assistant');
                  } else {
                    navigate('/patient-dashboard');
                  }
                }}
                className='flex-1 h-14 border-2 border-slate-400 rounded-2xl text-[12px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-200 transition-all'
              >
                Discard
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-2 h-14 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[12px] rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50'
              >
                {loading ? 'Securing...' : 'Confirm & Upload'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfirmUpload;
