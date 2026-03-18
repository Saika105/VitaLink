import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [appointments, setAppointments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activeAssistant, setActiveAssistant] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${apiUrl}/patient/appointments?status=${activeTab}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          // Map backend nested objects to table format
          const mappedData = data.map(apt => ({
            id: apt._id,
            hospital: apt.hospital?.fullName,
            doctor: apt.doctor?.fullName,
            specialization: apt.doctor?.specialization,
            date: new Date(apt.appointmentDate).toLocaleDateString(),
            time: `${apt.timeSlot?.startTime} - ${apt.timeSlot?.endTime}`,
            phone: apt.doctor?.phone,
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
  }, [activeTab, apiUrl]);

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
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/appointments/${id}/cancel`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          setAppointments(prev => prev.filter(a => a.id !== id));
        }
      } catch (err) {
        setAppointments([]);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login-patient');
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <DashboardNav />

      <main className='p-4 md:p-8 max-w-7xl mx-auto w-full grow'>
        <div className='mb-8'>
          <h2 className='text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase'>
            Appointment Schedule
          </h2>
          <p className='text-sm font-bold text-blue-700 uppercase tracking-widest mt-0.5'>
            Manage all your appointments in one place
          </p>
        </div>

        <div className='flex w-fit bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner mb-8'>
          {['Upcoming', 'Completed', 'Canceled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className='bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-100'>
                  <th className='p-5 text-[12px] uppercase tracking-widest text-black font-black text-center w-16'>
                    #
                  </th>
                  <th className='p-5 text-[12px] uppercase tracking-widest text-black font-black'>
                    Hospital
                  </th>
                  <th className='p-5 text-[12px] uppercase tracking-widest text-black font-black'>
                    Doctor
                  </th>
                  <th className='p-5 text-[12px] uppercase tracking-widest text-black font-black'>
                    Specialization
                  </th>
                  <th className='p-5 text-[12px] uppercase tracking-widest text-black font-black'>
                    Schedule
                  </th>
                  <th className='p-5 text-[12px] uppercase tracking-widest text-black font-black text-center'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50 text-sm'>
                {appointments.map((apt, idx) => (
                  <tr
                    key={apt.id}
                    className='hover:bg-blue-50/30 transition-colors group'
                  >
                    <td className='p-5 text-center font-bold text-slate-300'>
                      {idx + 1}
                    </td>
                    <td className='p-5 font-bold text-slate-900'>
                      {apt.hospital}
                    </td>
                    <td className='p-5 font-bold text-slate-700'>
                      {apt.doctor}
                    </td>
                    <td className='p-5'>
                      <span className='text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase border border-blue-100'>
                        {apt.specialization}
                      </span>
                    </td>
                    <td className='p-5'>
                      <div className='font-bold text-slate-900'>{apt.date}</div>
                      <div className='text-[10px] font-bold text-black uppercase'>
                        {apt.time}
                      </div>
                    </td>
                    <td className='p-5 text-center'>
                      {activeTab === 'Upcoming' && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className='bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white text-[10px] font-black py-2 px-6 rounded-xl transition-all uppercase tracking-widest'
                        >
                          Cancel
                        </button>
                      )}

                      {activeTab === 'Completed' && (
                        <div className='flex flex-col items-center gap-1'>
                          <span className='text-[9px] font-black text-slate-400 uppercase'>
                            Follow-up
                          </span>
                          <span className='text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100'>
                            {apt.followUpDate || 'None Scheduled'}
                          </span>
                        </div>
                      )}

                      {activeTab === 'Canceled' && (
                        <button
                          onClick={() => handleRescheduleClick(apt)}
                          className='bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black py-2 px-6 rounded-xl shadow-md transition-all uppercase tracking-widest'
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
            <div className='p-20 text-center text-black bg-white flex flex-col items-center gap-4'>
              <p className='text-xs font-bold uppercase tracking-widest'>
                No {activeTab.toLowerCase()} records found
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

      {showPopup && activeAssistant && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-300'>
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
            <p className='text-slate-500 text-sm mt-2'>
              Contact the assistant of <b>{activeAssistant.name}</b> to pick a
              new date.
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
                <div className='w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center'>
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
