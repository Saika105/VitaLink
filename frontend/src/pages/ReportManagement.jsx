import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const ReportManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualHospital, setManualHospital] = useState('');

  const patient = state?.patient || {
    fullName: 'PATIENT',
    upid: id || 'PT-SYNCING',
  };

  const todayDate = new Date()
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();

  const fetchPatientTests = async () => {
    try {
      const response = await protectedFetch(
        `/api/v1/reporter/patient/${id}/tests`,
      );
      if (response.ok) {
        const result = await response.json();
        setTests(result.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientTests();
    const interval = setInterval(fetchPatientTests, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleUploadClick = test => {
    setSelectedTest(test);
    setManualTitle(test.testName || '');
    setManualHospital('VITALINK DIAGNOSTIC CENTER');
    setShowModal(true);
  };

  const handleFileSelect = e => {
    const file = e.target.files[0];
    if (!manualTitle || !manualHospital) {
      alert('Please enter details first.');
      return;
    }

    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Unsupported format. Please upload PDF/JPG/PNG.');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File exceeds maximum allowed size of 10MB.');
        e.target.value = '';
        return;
      }

      navigate('/confirm-upload', {
        state: {
          selectedFile: file,
          uploadType: 'report',
          testId: selectedTest._id,
          displayTitle: manualTitle.toUpperCase(),
          displayHospital: manualHospital.toUpperCase(),
          patientId: id,
          patientName: patient.fullName,
          patientUpid: patient.upid,
          uploadDate: todayDate,
        },
      });
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />

      <main className='grow max-w-7xl mx-auto w-full p-4 md:p-10 flex flex-col'>
        <div className='flex justify-between items-center mb-10'>
          <div>
            <h2 className='text-3xl font-black text-slate-900 uppercase tracking-tight'>
              Report Submission
            </h2>
            <p className='text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mt-1'>
              ID: {patient.upid} • {patient.fullName}
            </p>
          </div>
          <button
            onClick={() => navigate('/reporter-dashboard')}
            className='bg-white border-2 border-slate-200 text-slate-500 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all shadow-sm'
          >
            Exit Vault
          </button>
        </div>

        <div className='bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-200 text-[12px] font-black text-black uppercase tracking-widest'>
                  <th className='p-6'>Diagnostic Test</th>
                  <th className='p-6 text-center'>Payment</th>
                  <th className='p-6 text-center'>Status</th>
                  <th className='p-6 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {isLoading && tests.length === 0 ? (
                  <tr>
                    <td colSpan='4' className='p-20 text-center'>
                      <div className='flex justify-center items-center gap-3'>
                        <div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-xs font-black uppercase tracking-widest text-slate-600'>
                          Syncing...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : tests.length > 0 ? (
                  tests.map(test => (
                    <tr
                      key={test._id}
                      className='hover:bg-blue-50/20 transition-all group'
                    >
                      <td className='p-6 font-black text-slate-900 uppercase text-sm'>
                        {test.testName}
                      </td>
                      <td className='p-6 text-center'>
                        <span
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${test.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {test.isPaid ? 'PAID' : 'DUE'}
                        </span>
                      </td>
                      <td className='p-6 text-center'>
                        <span className='text-[10px] font-bold text-slate-400 uppercase'>
                          {test.reportFile ? 'COMPLETED' : 'PENDING'}
                        </span>
                      </td>
                      <td className='p-6 text-right'>
                        {test.isPaid ? (
                          test.reportFile ? (
                            <a
                              href={test.reportFile}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='bg-green-600 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-95 inline-block'
                            >
                              View Report
                            </a>
                          ) : (
                            <button
                              onClick={() => handleUploadClick(test)}
                              className='bg-blue-600 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-95'
                            >
                              Add Report
                            </button>
                          )
                        ) : (
                          <span className='text-[10px] font-black text-slate-300 uppercase italic'>
                            Awaiting Payment
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan='4'
                      className='p-32 text-center text-slate-400 font-black uppercase text-xs tracking-widest'
                    >
                      No tests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200'>
            <h3 className='text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6 text-center'>
              Report Details
            </h3>
            <div className='grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100'>
              <div>
                <p className='text-[10px] font-black text-slate-400 uppercase'>
                  Patient ID
                </p>
                <p className='text-sm font-bold text-slate-900'>
                  {patient.upid}
                </p>
              </div>
              <div>
                <p className='text-[10px] font-black text-slate-400 uppercase'>
                  Issue Date
                </p>
                <p className='text-sm font-bold text-slate-900'>{todayDate}</p>
              </div>
              <div className='col-span-2'>
                <p className='text-[10px] font-black text-slate-400 uppercase'>
                  Patient Name
                </p>
                <p className='text-sm font-black text-slate-900 uppercase'>
                  {patient.fullName}
                </p>
              </div>
            </div>
            <div className='space-y-5 mb-10'>
              <div className='space-y-1.5'>
                <label className='text-[10px] font-black text-blue-600 uppercase ml-1 tracking-widest'>
                  Report Title
                </label>
                <input
                  type='text'
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-600 text-slate-900'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-[10px] font-black text-blue-600 uppercase ml-1 tracking-widest'>
                  Diagnostic Center
                </label>
                <input
                  type='text'
                  value={manualHospital}
                  onChange={e => setManualHospital(e.target.value)}
                  className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-600 text-slate-900'
                />
              </div>
            </div>
            <div className='space-y-6'>
              <div className='relative group'>
                <input
                  type='file'
                  accept='application/pdf,image/jpeg,image/png'
                  onChange={handleFileSelect}
                  className='w-full text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-slate-900 cursor-pointer border-2 border-dashed border-slate-200 p-4 rounded-2xl bg-slate-50/50'
                />
              </div>
              <button
                onClick={() => setShowModal(false)}
                className='w-full bg-slate-100 text-slate-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ReportManagement;
