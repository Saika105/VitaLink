import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const AssistantDashboard = () => {
  const navigate = useNavigate();

  const [assistantData, setAssistantData] = useState({
    fullName: '',
    doctor: { fullName: '', startTime: '' },
    hospital: { name: '' },
  });

  const [patientId, setPatientId] = useState('');
  const [currentPatient, setCurrentPatient] = useState(null);
  const [sessionList, setSessionList] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    );

    const fetchAssistantProfile = async () => {
      try {
        const response = await protectedFetch('/api/v1/assistant/profile');
        if (response.ok) {
          const result = await response.json();
          setAssistantData(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchTodaysQueue = async () => {
      try {
        const response = await protectedFetch('/api/v1/assistant/queue');
        let apiData = [];
        if (response.ok) {
          const result = await response.json();
          apiData = result.data || [];
        }

        /* --- DUMMY DATA START:  --- */
        const dummyPatient = {
          _id: 'dummy123',
          patient: { fullName: 'Mahdia Hossai' },
          arrivalTime: '10:00 AM',
          queueStatus: 'waiting',
          followUpDate: null,
        };
        setSessionList([dummyPatient, ...apiData]);
        /* --- DUMMY DATA END --- */
      } catch (err) {
        setSessionList([]);
      }
    };

    fetchAssistantProfile();
    fetchTodaysQueue();

    const savedNotes = localStorage.getItem('vitalink_assistant_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const handleAddNote = e => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    const newNotes = [...notes, { id: Date.now(), text: noteInput }];
    setNotes(newNotes);
    localStorage.setItem('vitalink_assistant_notes', JSON.stringify(newNotes));
    setNoteInput('');
  };

  const handleDeleteNote = id => {
    const filteredNotes = notes.filter(n => n.id !== id);
    setNotes(filteredNotes);
    localStorage.setItem(
      'vitalink_assistant_notes',
      JSON.stringify(filteredNotes),
    );
  };

  const handleSearchPatient = async e => {
    e.preventDefault();
    if (!patientId) return;

    if (patientId === 'dummy123') {
      setCurrentPatient({ _id: 'dummy123', fullName: 'Mahdia Hossain' });
      return;
    }

    try {
      const response = await protectedFetch(
        `/api/v1/assistant/patient-check/${patientId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentPatient(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmArrival = async () => {
    if (!currentPatient) return;

    const dbStartTime = assistantData.doctor?.startTime || '09:00';
    const [startHour, startMinute] = dbStartTime.split(':');
    const baseTime = new Date();
    baseTime.setHours(parseInt(startHour), parseInt(startMinute), 0);

    const minutesToAdd = sessionList.length * 15;
    const arrivalTime = new Date(baseTime.getTime() + minutesToAdd * 60000);
    const formattedTime = arrivalTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (currentPatient._id === 'dummy123') {
      const dummyEntry = {
        _id: 'dummy' + Date.now(),
        patient: { fullName: currentPatient.fullName },
        arrivalTime: formattedTime,
        queueStatus: 'waiting',
        followUpDate: null,
      };
      setSessionList([...sessionList, dummyEntry]);
      setCurrentPatient(null);
      setPatientId('');
      return;
    }

    const arrivalData = {
      patientId: currentPatient._id,
      arrivalTime: formattedTime,
      queueStatus: 'waiting',
    };

    try {
      const response = await protectedFetch(
        '/api/v1/assistant/confirm-arrival',
        {
          method: 'POST',
          body: JSON.stringify(arrivalData),
        },
      );
      if (response.ok) {
        const result = await response.json();
        setSessionList([...sessionList, result.data]);
        setCurrentPatient(null);
        setPatientId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (index, newStatus) => {
    const appointment = sessionList[index];
    if (appointment._id.toString().startsWith('dummy')) {
      const updatedList = [...sessionList];
      updatedList[index].queueStatus = newStatus;
      setSessionList(updatedList);
      return;
    }
    try {
      const response = await protectedFetch(
        `/api/v1/assistant/appointments/${appointment._id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ queueStatus: newStatus }),
        },
      );
      if (response.ok) {
        const updatedList = [...sessionList];
        updatedList[index].queueStatus = newStatus;
        setSessionList(updatedList);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateFollowUp = async (index, date) => {
    const appointment = sessionList[index];
    if (appointment._id.toString().startsWith('dummy')) {
      const updatedList = [...sessionList];
      updatedList[index].followUpDate = date;
      setSessionList(updatedList);
      return;
    }
    try {
      const response = await protectedFetch(
        `/api/v1/assistant/appointments/${appointment._id}/followup`,
        {
          method: 'PATCH',
          body: JSON.stringify({ followUpDate: date }),
        },
      );
      if (response.ok) {
        const updatedList = [...sessionList];
        updatedList[index].followUpDate = date;
        setSessionList(updatedList);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e, aptId) => {
    const file = e.target.files[0];
    if (!file) return;

    navigate('/confirm-upload', {
      state: {
        selectedFile: file,
        uploadType: 'prescription',
        role: 'assistant',
      },
    });
  };

  const handleClearSessionFinal = async () => {
    try {
      await protectedFetch('/api/v1/assistant/clear-session', {
        method: 'DELETE',
      });
      setSessionList([]);
      setShowClearModal(false);
    } catch (err) {
      setSessionList([]);
      setShowClearModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      await protectedFetch('/api/v1/assistant/logout', { method: 'POST' });
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      navigate('/login-staff');
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <main className='grow max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6'>
          <div>
            <h2 className='text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase'>
              Assistant Portal
            </h2>
            <p className='text-sm font-bold text-blue-700 uppercase tracking-widest mt-0.5'>
              Manage appointments for the doctor
            </p>
          </div>
          <div className='bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-right w-full md:w-auto'>
            <p className='text-[10px] font-black text-slate-700 uppercase tracking-widest'>
              Session Date
            </p>
            <p className='text-md font-black text-slate-900'>{currentDate}</p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8'>
          <aside className='lg:col-span-1 space-y-6'>
            <div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-xl'>
              <h3 className='text-[11px] font-black text-slate-700 uppercase mb-4 tracking-widest'>
                Patient Entry
              </h3>
              <form onSubmit={handleSearchPatient} className='space-y-4'>
                <input
                  type='text'
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  placeholder='PATIENT UNIQUE ID'
                  className='w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none uppercase text-slate-900'
                />
                <button
                  type='submit'
                  className='w-full h-12 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 font-inter'
                >
                  Search Database
                </button>
              </form>
              {currentPatient && (
                <div className='mt-6 p-5 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in zoom-in-95'>
                  <p className='text-[9px] font-black text-blue-600 uppercase'>
                    Profile Match
                  </p>
                  <h4 className='text-md font-black text-slate-900 uppercase mt-1'>
                    {currentPatient.fullName}
                  </h4>
                  <button
                    onClick={handleConfirmArrival}
                    className='w-full mt-4 bg-slate-900 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors'
                  >
                    Add to Queue
                  </button>
                </div>
              )}
            </div>

            <div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-xl'>
              <h3 className='text-[11px] font-black text-slate-700 uppercase mb-4 tracking-widest'>
                Booking Notepad
              </h3>
              <form onSubmit={handleAddNote} className='mb-6'>
                <textarea
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder='Enter future booking info...'
                  className='w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-slate-900'
                />
                <button
                  type='submit'
                  className='w-full mt-3 h-12 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 font-inter'
                >
                  Save Booking
                </button>
              </form>
              <div className='space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar'>
                {notes.map(note => (
                  <div
                    key={note.id}
                    className='bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start hover:border-blue-200 transition-colors'
                  >
                    <p className='text-[10px] font-bold text-slate-900 leading-relaxed uppercase tracking-tight'>
                      {note.text}
                    </p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className='p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all'
                    >
                      <svg
                        className='w-2.5 h-2.5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='4'
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className='py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl'>
                    <p className='text-[9px] text-slate-400 font-black uppercase tracking-widest'>
                      No pending logs
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-lg'>
              <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Assisting Doctor
              </p>
              <p className='text-sm font-black text-blue-600 mt-1 uppercase'>
                {assistantData.doctor?.fullName || 'N/A'}
              </p>
              <div className='h-px bg-slate-100 my-4'></div>
              <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Staff Member
              </p>
              <p className='text-sm font-bold text-slate-900 mt-1'>
                {assistantData.fullName || 'User'}
              </p>
              <div className='h-px bg-slate-100 my-4'></div>
              <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                Assigned Unit
              </p>
              <p className='text-sm font-bold text-slate-900 mt-1 uppercase'>
                {assistantData.hospital?.name || 'N/A'}
              </p>
            </div>
          </aside>

          <section className='lg:col-span-3 space-y-6 overflow-hidden'>
            <div className='bg-white rounded-4xl border border-slate-200 shadow-xl overflow-hidden'>
              <div className='bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center'>
                <h3 className='text-[12px] font-black text-slate-900 uppercase tracking-widest'>
                  Daily Appointment List
                </h3>
                <span className='bg-blue-600 text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest'>
                  {sessionList.length} Patients
                </span>
              </div>
              <div className='overflow-x-auto custom-scrollbar'>
                <table className='w-full text-left border-collapse min-w-200'>
                  <thead>
                    <tr className='text-[11px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 bg-white'>
                      <th className='p-6 text-center w-16'>#</th>
                      <th className='p-6'>Patient Name</th>
                      <th className='p-6'>Arrival</th>
                      <th className='p-6'>Queue Status</th>
                      <th className='p-6 text-center'>Records</th>
                      <th className='p-6'>Follow-Up</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {sessionList.map((item, idx) => (
                      <tr
                        key={item._id}
                        className='hover:bg-blue-50/20 transition-all group'
                      >
                        <td className='p-6 text-center font-black text-slate-400 group-hover:text-blue-600 text-lg'>
                          {idx + 1}
                        </td>
                        <td className='p-6'>
                          <div className='font-black text-slate-900 text-sm uppercase'>
                            {item.patient?.fullName}
                          </div>
                          <div className='text-[10px] font-bold text-blue-600 uppercase'>
                            {item._id}
                          </div>
                        </td>
                        <td className='p-6'>
                          <span className='bg-slate-200 group-hover:bg-blue-100 px-3 py-1 rounded-lg font-black text-[10px] text-slate-700 group-hover:text-blue-700 transition-colors'>
                            {item.arrivalTime || 'WAITING'}
                          </span>
                        </td>
                        <td className='p-6'>
                          <select
                            value={item.queueStatus}
                            onChange={e => updateStatus(idx, e.target.value)}
                            className={`border border-slate-300 rounded-lg text-[10px] font-black uppercase p-2 outline-none transition-all ${item.queueStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : item.queueStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-900'}`}
                          >
                            <option value='waiting'>Waiting</option>
                            <option value='completed'>Completed</option>
                            <option value='cancelled'>Cancelled</option>
                          </select>
                        </td>
                        <td className='p-6 text-center'>
                          <label className='cursor-pointer w-32 h-10 flex items-center justify-center bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[10px] rounded-xl font-black uppercase tracking-widest shadow-md transition-all font-inter'>
                            Upload RX
                            <input
                              type='file'
                              className='hidden'
                              onChange={e => handleFileChange(e, item._id)}
                            />
                          </label>
                        </td>
                        <td className='p-6'>
                          <input
                            type='date'
                            value={
                              item.followUpDate
                                ? new Date(item.followUpDate)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                            }
                            onChange={e => updateFollowUp(idx, e.target.value)}
                            className='bg-slate-50 border border-slate-300 rounded-lg text-[10px] p-2 font-black outline-none focus:ring-2 focus:ring-blue-500 text-slate-900'
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sessionList.length === 0 && (
                <div className='p-24 text-center text-slate-900 uppercase font-black text-[11px] tracking-[0.2em] bg-white'>
                  Queue is currently empty
                </div>
              )}
            </div>
            <div className='flex flex-col md:flex-row justify-between items-center gap-4 pt-6'>
              <button
                onClick={() => setShowClearModal(true)}
                className='w-full md:w-56 h-12 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all outline-none font-inter'
              >
                Clear Daily Queue
              </button>
              <button
                onClick={handleLogout}
                className='w-full md:w-56 h-12 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all outline-none font-inter'
              >
                LogOut
              </button>
            </div>
          </section>
        </div>
      </main>

      {showClearModal && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-4xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95'>
            <div className='w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5'>
              <svg
                className='w-7 h-7'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='3'
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-black text-slate-900 uppercase tracking-tight'>
              Reset Queue?
            </h3>
            <p className='text-slate-500 text-xs mt-3 font-medium leading-relaxed px-4'>
              This will remove all patients from the daily list permanently.
            </p>
            <div className='mt-8 grid grid-cols-2 gap-3'>
              <button
                onClick={() => setShowClearModal(false)}
                className='bg-slate-100 text-slate-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all'
              >
                Cancel
              </button>
              <button
                onClick={handleClearSessionFinal}
                className='bg-red-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default AssistantDashboard;
