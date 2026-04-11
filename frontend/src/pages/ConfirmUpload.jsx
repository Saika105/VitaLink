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
  const userRole = localStorage.getItem('role');
  const appointmentId = location.state?.appointmentId;

  useEffect(() => {
    if (!selectedFile || !uploadType) {
      navigate(
        userRole === 'assistant'
          ? '/assistant-dashboard'
          : '/patient-dashboard',
      );
    }
  }, [selectedFile, uploadType, navigate, userRole]);

  const handleUpload = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      if (userRole === 'assistant' && uploadType === 'prescription') {
        data.append('prescriptionFile', selectedFile);
        data.append('diagnosis', 'Digital Consultation');
        data.append('advice', 'Uploaded via Assistant Terminal');
      } else if (uploadType === 'prescription') {
        data.append('prescriptionFile', selectedFile);
        data.append('manualDoctorName', recordDetails.title);
        data.append('manualHospitalName', recordDetails.hospitalName);
      } else {
        data.append('reportFile', selectedFile);
        data.append('testName', recordDetails.title);
        data.append('manualHospitalName', recordDetails.hospitalName);
      }

      let endpoint = '';
      if (userRole === 'assistant' && uploadType === 'prescription') {
        endpoint = `/api/v1/doctor-assistants/upload-rx/${appointmentId}`;
      } else {
        endpoint =
          uploadType === 'prescription'
            ? '/api/v1/patients/prescriptions/add'
            : '/api/v1/patients/lab-reports/add';
      }

      const response = await protectedFetch(endpoint, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        alert(
          `${uploadType.toUpperCase()} secured in HealthVault successfully!`,
        );
        navigate(
          userRole === 'assistant' ? '/assistant-dashboard' : '/my-records',
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Network error. Failed to reach secure server.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedFile) return null;

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      {userRole !== 'assistant' && <DashboardNav />}

      <main className='grow flex items-center justify-center p-4 md:p-12'>
        <div className='w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-6 md:p-12'>
          <div className='mb-10 text-center md:text-left'>
            <p className='text-[12px] font-black text-[#3B82F6] uppercase tracking-[0.25em] mb-2'>
              {userRole === 'assistant'
                ? 'Verification Step'
                : 'Vault Submission'}
            </p>
            <h2 className='text-3xl font-black text-slate-900 uppercase tracking-tighter'>
              Finalize {uploadType}
            </h2>
          </div>

          <div className='bg-blue-50/50 border border-blue-100 rounded-3xl p-8 mb-10'>
            <div className='flex flex-col gap-6'>
              <div className='flex items-center gap-5'>
                <div className='w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 font-black text-xs shrink-0 border border-blue-100'>
                  DOC
                </div>
                <div className='overflow-hidden text-left'>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5'>
                    Selected Document
                  </p>
                  <p className='text-sm font-bold text-slate-800 truncate'>
                    {selectedFile.name}
                  </p>
                </div>
              </div>
              {userRole === 'assistant' && (
                <div className='flex items-center gap-5'>
                  <div className='w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 font-black text-xs shrink-0 border border-blue-100'>
                    ID
                  </div>
                  <div className='text-left'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5'>
                      Session Key
                    </p>
                    <p className='text-sm font-bold text-slate-800'>
                      {appointmentId?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleUpload} className='space-y-8'>
            {userRole !== 'assistant' && (
              <div className='space-y-6'>
                <div className='space-y-2 text-left'>
                  <label className='text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1 block'>
                    {uploadType === 'prescription'
                      ? 'Doctor Name'
                      : 'Test Name'}
                  </label>
                  <input
                    type='text'
                    required
                    className='w-full border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all bg-slate-50/50'
                    placeholder={
                      uploadType === 'prescription'
                        ? 'e.g. Dr. John Doe'
                        : 'e.g. Blood Test'
                    }
                    value={recordDetails.title}
                    onChange={e =>
                      setRecordDetails({
                        ...recordDetails,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className='space-y-2 text-left'>
                  <label className='text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] ml-1 block'>
                    Hospital / Clinic Name
                  </label>
                  <input
                    type='text'
                    required
                    className='w-full border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6] transition-all bg-slate-50/50'
                    placeholder='e.g. Central City Hospital'
                    value={recordDetails.hospitalName}
                    onChange={e =>
                      setRecordDetails({
                        ...recordDetails,
                        hospitalName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className='flex flex-col-reverse md:flex-row gap-4'>
              <button
                type='button'
                onClick={() => navigate(-1)}
                className='w-full md:flex-1 py-4 border-2 border-slate-200 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all'
              >
                Discard
              </button>
              <button
                type='submit'
                disabled={loading}
                className='w-full md:flex-2 py-4 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50'
              >
                {loading ? 'Securing Document...' : 'Verify & Upload'}
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
