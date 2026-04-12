import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';
import { protectedFetch } from '../utils/api';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scheduled');
  const [appointments, setAppointments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activeAssistant, setActiveAssistant] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await protectedFetch(
          `/api/v1/patients/my-appointments?status=${activeTab}`,
        );

        if (response.ok) {
          const result = await response.json();
          const mappedData = result.data.map(apt => ({
            id: apt._id,
            hospital:
              apt.hospital?.name ||
              apt.hospital?.fullName ||
              apt.manualHospitalName ||
              'Clinic',
            doctor: apt.doctor?.fullName || apt.manualDoctorName || 'Staff',
            specialization: apt.doctor?.specialization || 'General',
            date: new Date(apt.appointmentDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            phone: apt.doctor?.phone || apt.phone || 'N/A',
            followUpDate: apt.followUpDate
              ? new Date(apt.followUpDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : null,
          }));
          setAppointments(mappedData);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        setAppointments([]);
      }
    };
    fetchAppointments();
  }, [activeTab]);

  const handleRescheduleClick = apt => {
    setActiveAssistant({
      name: apt.doctor,
      phone: apt.phone,
    });
    setShowPopup(true);
  };

  const handleCancel = async id => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await protectedFetch(
          `/api/v1/patients/cancel-appointment/${id}`,
          { method: 'PATCH' },
        );
        if (response.ok) {
          setAppointments(prev => prev.filter(a => a.id !== id));
          alert('Appointment cancelled successfully.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearTable = async () => {
    try {
      const response = await protectedFetch(
        `/api/v1/patients/delete-appointments?status=${activeTab}`,
        { method: 'DELETE' },
      );
      if (response.ok) {
        setAppointments([]);
        setShowClearConfirm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login-patient', { replace: true });
    window.location.reload();
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <DashboardNav />

      <main className='p-4 md:p-8 max-w-7xl mx-auto w-full grow'>
        <div className='mb-6 md:mb-8'>
          <h2 className='text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase'>
            Appointment Schedule
          </h2>
          <p className='text-[10px] md:text-sm font-bold text-blue-700 uppercase tracking-widest mt-0.5'>
            Manage all your appointments in one place
          </p>
        </div>

        <div className='flex items-center justify-between gap-4 mb-8'>
          <div className='overflow-x-auto no-scrollbar'>
            <div className='flex w-max md:w-fit bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner'>
              {[
                { label: 'Upcoming', value: 'scheduled' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className='bg-red-50 text-red-600 border border-red-100 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm'
          >
            Clear {activeTab} History
          </button>
        </div>

        <div className='bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse min-w-175'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-100'>
                  <th className='p-4 md:p-5 text-[11px] md:text-[12px] uppercase tracking-widest text-black font-black text-center w-16'>
                    #
                  </th>
                  <th className='p-4 md:p-5 text-[11px] md:text-[12px] uppercase tracking-widest text-black font-black'>
                    Hospital
                  </th>
                  <th className='p-4 md:p-5 text-[11px] md:text-[12px] uppercase tracking-widest text-black font-black'>
                    Doctor
                  </th>
                  <th className='p-4 md:p-5 text-[11px] md:text-[12px] uppercase tracking-widest text-black font-black'>
                    Specialization
                  </th>
                  {activeTab !== 'completed' && (
                    <th className='p-4 md:p-5 text-[11px] md:text-[12px] uppercase tracking-widest text-black font-black'>
                      Date
                    </th>
                  )}
                  <th className='p-4 md:p-5 text-[11px] md:text-[12px] uppercase tracking-widest text-black font-black text-center'>
                    {activeTab === 'completed' ? 'Follow Up' : 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 text-xs md:text-sm'>
                {appointments.map((apt, idx) => (
                  <tr
                    key={apt.id}
                    className='hover:bg-blue-50/30 transition-colors'
                  >
                    <td className='p-4 md:p-5 text-center font-bold text-slate-300'>
                      {idx + 1}
                    </td>
                    <td className='p-4 md:p-5 font-bold text-slate-900'>
                      {apt.hospital}
                    </td>
                    <td className='p-4 md:p-5 font-bold text-slate-700'>
                      {apt.doctor}
                    </td>
                    <td className='p-4 md:p-5'>
                      <span className='text-[9px] md:text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase border border-blue-100'>
                        {apt.specialization}
                      </span>
                    </td>
                    {activeTab !== 'completed' && (
                      <td className='p-4 md:p-5'>
                        <div className='font-bold text-slate-900'>
                          {apt.date}
                        </div>
                      </td>
                    )}
                    <td className='p-4 md:p-5 text-center'>
                      {activeTab === 'scheduled' && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className='bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white text-[9px] md:text-[10px] font-black py-2 px-6 rounded-xl transition-all uppercase'
                        >
                          Cancel
                        </button>
                      )}
                      {activeTab === 'completed' && (
                        <span className='text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100'>
                          {apt.followUpDate || 'None Scheduled'}
                        </span>
                      )}
                      {activeTab === 'cancelled' && (
                        <button
                          onClick={() => handleRescheduleClick(apt)}
                          className='bg-blue-600 text-white text-[9px] md:text-[10px] font-black py-2 px-6 rounded-xl uppercase shadow-md'
                        >
                          Reschedule
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {appointments.length === 0 && (
            <div className='p-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest'>
              No {activeTab} records found
            </div>
          )}
        </div>

        <div className='flex justify-end mt-12'>
          <button
            onClick={handleLogout}
            className='w-48 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all'
          >
            LogOut
          </button>
        </div>
      </main>

      {showClearConfirm && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl'>
            <h3 className='text-xl font-black text-slate-900 uppercase'>
              Clear {activeTab} History?
            </h3>
            <p className='text-slate-500 text-xs mt-2'>
              This action cannot be undone.
            </p>
            <div className='grid grid-cols-2 gap-3 mt-8'>
              <button
                onClick={() => setShowClearConfirm(false)}
                className='py-4 rounded-2xl text-[10px] font-black uppercase bg-slate-100 text-slate-600'
              >
                Cancel
              </button>
              <button
                onClick={handleClearTable}
                className='py-4 rounded-2xl text-[10px] font-black uppercase bg-red-600 text-white'
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && activeAssistant && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center'>
            <div className='w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6'>
              <svg
                className='w-8 h-8'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2.5'
                  d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                />
              </svg>
            </div>
            <h3 className='text-2xl font-black text-slate-900 uppercase'>
              Reschedule Slot
            </h3>
            <p className='text-slate-500 text-xs mt-2'>
              Contact the assistant of <b>{activeAssistant.name}</b>
            </p>
            <div className='my-8 space-y-3'>
              <a
                href={`tel:${activeAssistant.phone}`}
                className='flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all'
              >
                <div className='text-left'>
                  <p className='text-[10px] font-black text-black uppercase tracking-widest'>
                    Call Assistant
                  </p>
                  <p className='text-sm font-bold text-slate-900'>
                    {activeAssistant.phone}
                  </p>
                </div>
                <div className='w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold'>
                  →
                </div>
              </a>
              <a
                href={`https://wa.me/${activeAssistant.phone?.replace(/\D/g, '')}`}
                target='_blank'
                rel='noreferrer'
                className='flex items-center justify-between p-5 bg-green-50 rounded-2xl border border-green-100 hover:border-green-400 transition-all'
              >
                <div className='text-left'>
                  <p className='text-[10px] font-black text-green-600/60 uppercase tracking-widest'>
                    WhatsApp Chat
                  </p>
                  <p className='text-sm font-bold text-slate-900'>
                    {activeAssistant.phone}
                  </p>
                </div>
                <div className='w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold'>
                  →
                </div>
              </a>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className='w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase hover:bg-blue-600 transition-all'
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PatientAppointments;
