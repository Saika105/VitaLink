import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorNavbar from '../components/DoctorNavbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [doctorInfo, setDoctorInfo] = useState({
    fullName: '',
    photo: '',
  });
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'doctor') {
      navigate('/login-doctor', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    );

    const fetchDoctorData = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
          setDoctorInfo({
            fullName: savedUser.fullName,
            photo: savedUser.profilePhoto?.url || '',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchDailyQueue = async () => {
      try {
        const response = await protectedFetch(`/api/v1/doctors/today-queue`);
        if (response.ok) {
          const result = await response.json();
          const apiData = result.data.filter(
            item =>
              item.queueStatus !== 'cancelled' &&
              item.queueStatus !== 'completed',
          );
          setQueue(apiData);
        }
      } catch (err) {
        setQueue([]);
      }
    };

    fetchDoctorData();
    fetchDailyQueue();
    const interval = setInterval(fetchDailyQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchPatient = async e => {
    e.preventDefault();
    if (!patientIdSearch) return;

    try {
      const response = await protectedFetch(
        `/api/v1/doctors/patient-profile/${patientIdSearch}`,
      );
      if (response.ok) {
        const result = await response.json();
        openConfirmModal(result.data, true);
      } else {
        alert('Patient not found');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openConfirmModal = (patientData, isFromSearch = false) => {
    if (isFromSearch) {
      setSelectedPatient({
        _id: 'manual-' + Date.now(),
        appointmentId: 'DIRECT-ACCESS',
        patient: patientData,
      });
    } else {
      setSelectedPatient(item);
    }
    setShowConfirmModal(true);
  };

  const handleConfirmConsultation = async () => {
    const isManual = selectedPatient._id.toString().startsWith('manual');

    if (isManual) {
      navigate(`/doctor/patient-view/${selectedPatient.patient._id}`);
      return;
    }
    try {
      const response = await protectedFetch(
        `/api/v1/doctors/start-session/${selectedPatient._id}`,
        {
          method: 'PATCH', 
        },
      );

      if (response.ok) {
        navigate(`/doctor/patient-view/${selectedPatient.patient._id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to start session');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while starting the session');
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-black'>
      <DoctorNavbar
        doctorName={doctorInfo.fullName}
        doctorPhoto={doctorInfo.photo}
      />

      <main className='grow max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6'>
          <div className='text-left'>
            <h2 className='text-3xl md:text-4xl font-extrabold text-black tracking-tight uppercase'>
              Consultation Queue
            </h2>
            <p className='text-[12px] font-bold text-blue-700 uppercase tracking-widest mt-0.5'>
              Universal Patient Health Companion
            </p>
          </div>

          <div className='flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full md:w-auto'>
            <form
              onSubmit={handleSearchPatient}
              className='flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all flex-1 md:flex-none'
            >
              <input
                type='text'
                value={patientIdSearch}
                onChange={e => setPatientIdSearch(e.target.value)}
                placeholder='ENTER PATIENT ID'
                className='bg-transparent px-4 py-2 text-[12px] font-black uppercase outline-none w-full md:w-56 text-black placeholder:text-slate-500'
              />
              <button
                type='submit'
                className='bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all whitespace-nowrap'
              >
                Verify
              </button>
            </form>

            <div className='bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-center md:text-right flex flex-col justify-center min-w-40'>
              <p className='text-[12px] font-black text-slate-900 uppercase tracking-widest mb-1'>
                Session Date:
              </p>
              <p className='text-[12px] font-black text-black leading-none'>
                {currentDate}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden'>
          <div className='bg-slate-50 p-6 md:p-8 border-b border-slate-100 flex justify-between items-center'>
            <h3 className='text-black font-black uppercase text-[12px] tracking-widest'>
              Active Patients
            </h3>
            <span className='bg-blue-600 text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest'>
              {queue.length} in Queue
            </span>
          </div>

          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='text-[12px] font-black text-black uppercase tracking-[0.2em] border-b border-slate-100 bg-white'>
                  <th className='p-8 text-center w-24'>#</th>
                  <th className='p-8'>Patient ID</th>
                  <th className='p-8'>Full Name</th>
                  <th className='p-8 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {queue.map((item, idx) => (
                  <tr
                    key={item._id}
                    className='hover:bg-blue-50/20 transition-all group'
                  >
                    <td className='p-8 text-center font-black text-blue-600 text-xl'>
                      {idx + 1}
                    </td>
                    <td className='p-8 font-bold text-black text-[12px] uppercase tracking-widest'>
                      {item.appointmentId}
                    </td>
                    <td className='p-8 font-black text-black text-[12px] uppercase'>
                      {item.patient?.fullName}
                    </td>
                    <td className='p-8 text-right'>
                      <button
                        onClick={() => {
                          setSelectedPatient(item);
                          setShowConfirmModal(true);
                        }}
                        className='w-40 h-11 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]'
                      >
                        Open File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {queue.length === 0 && (
            <div className='p-32 text-center text-black uppercase font-black text-[12px] tracking-[0.3em] bg-white'>
              Queue is empty
            </div>
          )}
        </div>
      </main>

      {showConfirmModal && selectedPatient && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200'>
            <div className='p-10 flex flex-col items-center text-center'>
              <div className='w-28 h-28 rounded-full border-4 border-blue-50 overflow-hidden mb-6 shadow-xl'>
                <img
                  src={
                    selectedPatient.patient?.profilePhoto?.url ||
                    `https://ui-avatars.com/api/?name=${selectedPatient.patient?.fullName}&background=eff6ff&color=3b82f6`
                  }
                  alt='Patient'
                  className='w-full h-full object-cover'
                />
              </div>
              <h3 className='text-xl font-black text-black uppercase tracking-tight mb-1'>
                {selectedPatient.patient?.fullName}
              </h3>
              <p className='text-[12px] font-black text-blue-600 uppercase tracking-widest mb-8'>
                {selectedPatient.appointmentId}
              </p>
              <div className='flex gap-3 w-full'>
                <button
                  onClick={handleConfirmConsultation}
                  className='flex-1 h-12 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95'
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className='flex-1 h-12 bg-slate-100 text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default DoctorDashboard;
