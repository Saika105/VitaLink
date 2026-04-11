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
              apt.hospital?.name || apt.hospitalName || 'Private Clinic',
            doctor:
              apt.doctor?.fullName || apt.manualDoctorName || 'Not Specified',
            specialization:
              apt.doctor?.specialization || apt.specialization || 'General',
            date: new Date(apt.appointmentDate).toLocaleDateString(),
            time: apt.timeSlot
              ? `${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}`
              : apt.startTime && apt.endTime
                ? `${apt.startTime} - ${apt.endTime}`
                : 'TBA',
            phone: apt.doctor?.phone || apt.phone,
            followUpDate: apt.followUpDate
              ? new Date(apt.followUpDate).toLocaleDateString()
              : null,
          }));
          setAppointments(mappedData);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        setAppointments([]);
      }
    };
    fetchAppointments();
  }, [activeTab]);

  const handleRescheduleClick = apt => {
    setActiveAssistant({
      name: apt.doctor,
      phone: apt.phone,
      whatsapp: apt.phone,
    });
    setShowPopup(true);
  };

  const handleCancel = async id => {
    if (
      window.confirm(
        'Are you sure you want to cancel? This will notify the hospital assistant.',
      )
    ) {
      try {
        const response = await protectedFetch(
          `/api/v1/patients/appointments/${id}/cancel`,
          {
            method: 'PATCH',
          },
        );
        if (response.ok) {
          setAppointments(prev => prev.filter(a => a.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearTable = async () => {
    try {
      const response = await protectedFetch(
        `/api/v1/patients/appointments/clear?status=${activeTab}`,
        {
          method: 'DELETE',
        },
      );
      if (response.ok) {
        setAppointments([]);
        setShowClearConfirm(false);
      }
    } catch (err) {
      console.error('Clear error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await protectedFetch(`/api/v1/patients/logout`, { method: 'POST' });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      navigate('/login-patient');
    }
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
          <div className='overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200'>
            <table className='w-full text-left border-collapse min-w-175'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-100'>
                  <th className='p-4 md:p-5 text-[11px] md:text-[12px] uppercase tracking-widest text-black font-black text-center w-12 md:w-16'>
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
                      Schedule
                    </th>
                  )}

                  <th className='p-4 md:p-5 text-[11px] md:text-[12px] uppercase tracking-widest text-black font-black text-center'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50 text-xs md:text-sm'>
                {appointments.map((apt, idx) => (
                  <tr
                    key={apt.id}
                    className='hover:bg-blue-50/30 transition-colors group'
                  >
                    <td className='p-4 md:p-5 text-center font-bold text-slate-300'>
                      {idx + 1}
                    </td>
                    <td className='p-4 md:p-5 font-bold text-slate-900 whitespace-nowrap'>
                      {apt.hospital}
                    </td>
                    <td className='p-4 md:p-5 font-bold text-slate-700 whitespace-nowrap'>
                      {apt.doctor}
                    </td>
                    <td className='p-4 md:p-5'>
                      <span className='text-[9px] md:text-[10px] font-black text-blue-600 bg-blue-50 px-2 md:px-3 py-1 rounded-lg uppercase border border-blue-100 whitespace-nowrap'>
                        {apt.specialization}
                      </span>
                    </td>

                    {activeTab !== 'completed' && (
                      <td className='p-4 md:p-5'>
                        <div className='font-bold text-slate-900 whitespace-nowrap'>
                          {apt.date}
                        </div>
                        <div className='text-[9px] md:text-[10px] font-bold text-black uppercase whitespace-nowrap'>
                          {apt.time}
                        </div>
                      </td>
                    )}

                    <td className='p-4 md:p-5 text-center whitespace-nowrap'>
                      {activeTab === 'scheduled' && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className='bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white text-[9px] md:text-[10px] font-black py-2 px-4 md:px-6 rounded-xl transition-all uppercase tracking-widest'
                        >
                          Cancel
                        </button>
                      )}
                      {activeTab === 'completed' && (
                        <div className='flex flex-col items-center gap-1'>
                          <span className='text-[8px] md:text-[9px] font-black text-slate-400 uppercase'>
                            Follow-up
                          </span>
                          <span className='text-[10px] md:text-[11px] font-bold text-green-600 bg-green-50 px-2 md:px-3 py-1 rounded-lg border border-green-100'>
                            {apt.followUpDate || 'None Scheduled'}
                          </span>
                        </div>
                      )}
                      {activeTab === 'cancelled' && (
                        <button
                          onClick={() => handleRescheduleClick(apt)}
                          className='bg-blue-600 hover:bg-blue-700 text-white text-[9px] md:text-[10px] font-black py-2 px-4 md:px-6 rounded-xl shadow-md transition-all uppercase tracking-widest'
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
            <div className='p-16 md:p-20 text-center text-black bg-white flex flex-col items-center gap-4'>
              <p className='text-xs font-bold uppercase tracking-widest'>
                No {activeTab} records found
              </p>
            </div>
          )}
        </div>

        <div className='flex justify-end mt-12'>
          <button
            onClick={handleLogout}
            className='w-48 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all focus:ring-2 focus:ring-red-500 outline-none'
          >
            LogOut
          </button>
        </div>
      </main>

      {showClearConfirm && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-4xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center'>
            <div className='w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6'>
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
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
            </div>
            <h3 className='text-xl font-black text-slate-900 uppercase'>
              Clear {activeTab}?
            </h3>
            <p className='text-slate-500 text-xs mt-2 leading-relaxed'>
              This action will permanently delete all records from the{' '}
              <b>{activeTab}</b> list.
            </p>
            <div className='grid grid-cols-2 gap-3 mt-8'>
              <button
                onClick={() => setShowClearConfirm(false)}
                className='py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all'
              >
                Cancel
              </button>
              <button
                onClick={handleClearTable}
                className='py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-all'
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && activeAssistant && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-4xl md:rounded-[40px] p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center'>
            <div className='w-14 h-14 md:w-16 md:h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6'>
              <svg
                className='w-7 h-7 md:w-8 md:h-8'
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
            <h3 className='text-xl md:text-2xl font-black text-slate-900 uppercase'>
              Reschedule Slot
            </h3>
            <p className='text-slate-500 text-xs md:text-sm mt-2'>
              Contact the assistant of <b>{activeAssistant.name}</b> to pick a
              new date.
            </p>
            <div className='my-6 md:my-8 space-y-3'>
              <a
                href={`tel:${activeAssistant.phone}`}
                className='flex items-center justify-between p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all'
              >
                <div className='text-left'>
                  <p className='text-[9px] md:text-[10px] font-black text-black uppercase tracking-widest'>
                    Call Assistant
                  </p>
                  <p className='text-sm font-bold text-slate-900'>
                    {activeAssistant.phone}
                  </p>
                </div>
                <div className='w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center'>
                  →
                </div>
              </a>
              <a
                href={`https://wa.me/${activeAssistant.phone?.replace(/\D/g, '')}`}
                target='_blank'
                rel='noreferrer'
                className='flex items-center justify-between p-4 md:p-5 bg-green-50 rounded-2xl border border-green-100 hover:border-green-400 transition-all'
              >
                <div className='text-left'>
                  <p className='text-[9px] md:text-[10px] font-black text-green-600/60 uppercase tracking-widest'>
                    WhatsApp
                  </p>
                  <p className='text-sm font-bold text-slate-900'>
                    {activeAssistant.phone}
                  </p>
                </div>
                <div className='w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center'>
                  →
                </div>
              </a>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className='w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all'
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PatientAppointments;
