import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const AssistantDashboard = () => {
  const navigate = useNavigate();

  const [assistantData, setAssistantData] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    return {
      fullName: savedUser?.fullName || '',
      doctor: savedUser?.doctor || { fullName: 'N/A' },
      hospital: savedUser?.hospital || { name: 'N/A' },
    };
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

    const fetchInitialData = async () => {
      try {
        const response = await protectedFetch(
          `/api/v1/doctor-assistants/daily-list`,
        );
        if (response.ok) {
          const result = await response.json();
          setSessionList(result.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();

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
    try {
      const response = await protectedFetch(
        `/api/v1/doctor-assistants/search-patient/${patientId.trim().toUpperCase()}`,
      );
      if (response.ok) {
        const result = await response.json();
        setCurrentPatient(result.data);
      } else {
          const errorData = await response.json();
        alert(errorData.message || 'Patient not found');
        setCurrentPatient(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmArrival = async () => {
    if (!currentPatient) return;
    try {
      const response = await protectedFetch(
        `/api/v1/doctor-assistants/add-to-queue`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId: currentPatient.upid }),
        },
      );
      if (response.ok) {
        setCurrentPatient(null);
        setPatientId('');
        await fetchDailyList();  order
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (index, newStatus) => {
    const appointmentId = sessionList[index]._id;
    try {
      const response = await protectedFetch(
        `/api/v1/doctor-assistants/status/${appointmentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (response.ok) {
       const updatedList = sessionList.map((item, i) =>
         i === index ? { ...item, queueStatus: newStatus } : item,
       );
       setSessionList(updatedList); 
       if (newStatus === 'no_show') alert('Patient marked as No Show');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateFollowUp = async (index, date) => {
    const appointmentId = sessionList[index]._id;
    try {
      const response = await protectedFetch(
        `/api/v1/doctor-assistants/follow-up/${appointmentId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followUpDate: date }),
        },
      );
      if (response.ok) {
       const updatedList = sessionList.map((item, i) =>
         i === index ? { ...item, followUpDate: date } : item,
       );
        setSessionList(updatedList);
        alert(
          "✅ Follow-up scheduled! It will appear in the patient's upcoming list.",
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to schedule follow-up');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e, aptId, name, upid) => {
    const file = e.target.files[0];
    if (!file) return;

    navigate('/confirm-upload', {
      state: {
        selectedFile: file,
        uploadType: 'prescription',
        role: 'doctor-assistants',
        appointmentId: aptId,
        patientName: name,
        patientUpid: upid,
      },
    });
  };

  const handleClearSessionFinal = async () => {
    try {
      const response = await protectedFetch(
        `/api/v1/doctor-assistants/clear-session`,
        {
          method: 'PATCH',
        },
      );
      if (response.ok) {
        setSessionList([]);
        setShowClearModal(false);
        alert(
          'Daily queue cleared. All remaining appointments marked as Cancelled.',
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login-staff', { replace: true });
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
              Queue Management
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
                Patient Arrival
              </h3>
              <form onSubmit={handleSearchPatient} className='space-y-4'>
                <input
                  type='text'
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  placeholder='ENTER UPID'
                  className='w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none uppercase text-slate-900'
                />
                <button
                  type='submit'
                  className='w-full h-12 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]'
                >
                  Verify Patient
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
                  <p className='text-[10px] font-bold text-slate-500 uppercase'>
                    {currentPatient.upid}
                  </p>
                  <button
                    onClick={handleConfirmArrival}
                    className='w-full mt-4 bg-slate-900 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors'
                  >
                    Confirm Check-In
                  </button>
                </div>
              )}
            </div>

            <div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-xl'>
              <h3 className='text-[11px] font-black text-slate-700 uppercase mb-4 tracking-widest'>
                Quick Notes
              </h3>
              <form onSubmit={handleAddNote} className='mb-6'>
                <textarea
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder='Reminders...'
                  className='w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-slate-900'
                />
                <button
                  type='submit'
                  className='w-full mt-3 h-12 bg-[#3B82F6] text-white text-[11px] rounded-xl font-black uppercase tracking-widest'
                >
                  Add Note
                </button>
              </form>
              <div className='space-y-3 max-h-60 overflow-y-auto pr-1'>
                {notes.map(note => (
                  <div
                    key={note.id}
                    className='bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start'
                  >
                    <p className='text-[10px] font-bold text-slate-900 leading-relaxed uppercase'>
                      {note.text}
                    </p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className='text-red-500 font-black'
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className='lg:col-span-3 space-y-6 overflow-hidden'>
            <div className='bg-white rounded-4xl border border-slate-200 shadow-xl overflow-hidden'>
              <div className='bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center'>
                <h3 className='text-[12px] font-black text-slate-900 uppercase tracking-widest'>
                  Active Queue
                </h3>
                <span className='bg-blue-600 text-white px-4 py-1 rounded-full text-[11px] font-black uppercase'>
                  {sessionList.length} Total
                </span>
              </div>
              <div className='overflow-x-auto custom-scrollbar'>
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='text-[11px] font-black text-slate-900 uppercase border-b border-slate-100 bg-white'>
                      <th className='p-6 text-center w-16'>#</th>
                      <th className='p-6'>Patient Details</th>
                      <th className='p-6'>Status Update</th>
                      <th className='p-6 text-center'>RX Scan</th>
                      <th className='p-6'>Next Follow-Up</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {sessionList.map((item, idx) => (
                      <tr
                        key={item._id || idx}
                        className='hover:bg-blue-50/20 group transition-colors'
                      >
                        <td className='p-6 text-center font-black text-slate-400 text-lg'>
                          {idx + 1}
                        </td>
                        <td className='p-6'>
                          <div className='font-black text-slate-900 text-sm uppercase'>
                            {item.patient?.fullName || '—'}
                          </div>
                          <div className='text-[10px] font-bold text-blue-600 uppercase'>
                            {item.patient?.upid || '—'}
                          </div>
                        </td>
                        <td className='p-6'>
                          <select
                            value={item.queueStatus || 'pending'}
                            onChange={e => updateStatus(idx, e.target.value)}
                            className={`border border-slate-300 rounded-lg text-[10px] font-black uppercase p-2 outline-none ${item.queueStatus === 'done' ? 'bg-green-50 text-green-700 border-green-200' : item.queueStatus === 'no_show' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white'}`}
                          >
                            <option value='pending'>Pending</option>
                            <option value='done'>Done</option>
                            <option value='no_show'>No Show (Cancel)</option>
                          </select>
                        </td>
                        <td className='p-6 text-center'>
                          <label className='cursor-pointer w-32 h-10 flex items-center justify-center bg-[#3B82F6] hover:bg-blue-700 text-white text-[10px] rounded-xl font-black uppercase tracking-widest shadow-md mx-auto transition-colors'>
                            Upload RX
                            <input
                              type='file'
                              className='hidden'
                              onChange={e =>
                                handleFileChange(
                                  e,
                                  item._id,
                                  item.patient?.fullName,
                                  item.patient?.upid,
                                )
                              }
                            />
                          </label>
                        </td>
                        <td className='p-6'>
                          <input
                            type='date'
                            value={
                              item.followUpDate
                                ? item.followUpDate.split('T')[0]
                                : ''
                            }
                            onBlur={e => {
                              if (e.target.value)
                                updateFollowUp(idx, e.target.value);
                            }}
                            className='bg-slate-50 border border-slate-300 rounded-lg text-[10px] p-2 font-black outline-none focus:ring-2 focus:ring-blue-500 text-slate-900'
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sessionList.length === 0 && (
                <div className='p-24 text-center text-slate-400 uppercase font-black text-[11px] tracking-widest bg-white'>
                  Queue is empty
                </div>
              )}
            </div>
            <div className='flex justify-between items-center pt-4'>
              <button
                onClick={() => setShowClearModal(true)}
                className='border-2 border-red-200 text-red-700 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all'
              >
                Clear Daily Queue
              </button>
              <button
                onClick={handleLogout}
                className='border-2 border-slate-300 text-slate-600 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all'
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
            <div className='w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-black'>
              !
            </div>
            <h3 className='text-lg font-black text-slate-900 uppercase'>
              Reset Session?
            </h3>
            <p className='text-slate-500 text-xs mt-3 font-medium'>
              This will clear today's queue. All remaining patients will be
              marked as Cancelled.
            </p>
            <div className='mt-8 grid grid-cols-2 gap-3'>
              <button
                onClick={() => setShowClearModal(false)}
                className='bg-slate-100 text-slate-700 py-3 rounded-xl text-[10px] font-black uppercase'
              >
                Cancel
              </button>
              <button
                onClick={handleClearSessionFinal}
                className='bg-red-600 text-white py-3 rounded-xl text-[10px] font-black uppercase shadow-lg'
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
