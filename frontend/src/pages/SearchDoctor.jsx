import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';
import { protectedFetch } from '../utils/api';

const SearchDoctor = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [activeAssistant, setActiveAssistant] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const queryParam =
          selectedSpecialty === 'All' ? '' : `?specialty=${selectedSpecialty}`;

        const endpoint = `/api/v1/patients/doctors${queryParam}`;
        const response = await protectedFetch(endpoint);

        if (response.ok) {
          const result = await response.json();
          const doctorData = Array.isArray(result.data) ? result.data : [];
          setDoctors(doctorData);

          if (selectedSpecialty === 'All') {
            const uniqueSpecialties = [
              'All',
              ...new Set(
                doctorData.map(doc => doc.specialization).filter(Boolean),
              ),
            ];
            setSpecialties(uniqueSpecialties);
          }
        } else {
          setDoctors([]);
        }
      } catch (err) {
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, [selectedSpecialty]);

  const filteredDoctors = doctors.filter(doc =>
    doc.fullName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleBookNow = doctor => {
    setActiveAssistant({
      doctorName: doctor.fullName,
      name: doctor.assistantName || 'Booking Assistant',
      assistantPhone: doctor.assistantPhone || 'N/A',
    });
    setShowPopup(true);
  };

  const handleLogout = async () => {
    try {
      await protectedFetch('/api/v1/patients/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error(error);
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

      <main className='grow max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col md:flex-row gap-8'>
        <aside className='w-full md:w-72 shrink-0 space-y-6'>
          <div>
            <h2 className='text-2xl font-extrabold text-slate-900 tracking-tight uppercase'>
              Specialties
            </h2>
          </div>

          <div className='bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl'>
            {specialties.map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`w-full text-left px-6 py-4 text-xs font-bold transition-all border-b border-slate-50 last:border-b-0 uppercase tracking-widest ${
                  selectedSpecialty === spec
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-blue-50'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </aside>

        <section className='grow space-y-8'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
            <div>
              <h2 className='text-3xl font-black text-slate-900 tracking-tight uppercase'>
                Find Specialists
              </h2>
              <p className='text-sm font-bold text-blue-700 uppercase tracking-widest mt-0.5'>
                Book Verified Professionals
              </p>
            </div>

            <div className='flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-400 shadow-sm w-full md:w-auto'>
              <span className='text-[12px] font-black text-black uppercase tracking-tighter'>
                Search
              </span>
              <input
                type='text'
                className='bg-transparent border-none outline-none text-sm font-medium w-full md:w-60'
                placeholder='Doctor name...'
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6'>
            {filteredDoctors.map(doc => (
              <div
                key={doc._id}
                className='bg-white border border-slate-200 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all border-b-4 border-b-transparent hover:border-b-blue-600 flex flex-col'
              >
                <div className='w-full h-32 bg-slate-50 rounded-2xl mb-5 flex items-center justify-center border border-slate-100 overflow-hidden'>
                  {doc.profilePhoto?.url ? (
                    <img
                      src={doc.profilePhoto.url}
                      alt={doc.fullName}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <svg
                      className='w-12 h-12 text-blue-600/20'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </div>

                <div className='space-y-4 grow'>
                  <div>
                    <h3 className='text-xl font-black text-slate-900 leading-tight'>
                      {doc.fullName}
                    </h3>
                    <p className='text-blue-600 font-bold text-[10px] uppercase tracking-widest mt-1'>
                      {doc.specialization}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-slate-600'>
                      <span className='text-[10px] font-black uppercase text-slate-400'>
                        Hospital:
                      </span>
                      <span className='text-xs font-bold'>
                        {doc.hospital?.name ||
                          doc.hospital?.fullName ||
                          doc.hospitalName ||
                          'VitaLink Partner'}
                      </span>
                    </div>

                    <div className='flex items-center gap-2 text-slate-600'>
                      <span className='text-[10px] font-black uppercase text-slate-400'>
                        Sitting Time:
                      </span>
                      <span className='text-xs font-medium'>
                        {doc.schedule?.sittingTimeLabel ||
                          doc.sittingTime ||
                          'TBA'}
                      </span>
                    </div>

                    <div className='space-y-1.5'>
                      <span className='text-[10px] font-black uppercase text-slate-400'>
                        Available Days:
                      </span>
                      <div className='flex flex-wrap gap-1'>
                        {(
                          doc.workingDays ||
                          doc.schedule?.workingDays || ['TBA']
                        ).map(day => (
                          <span
                            key={day}
                            className='text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold border border-blue-100 uppercase'
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className='flex items-center gap-2 text-slate-600 pt-1'>
                      <span className='text-[10px] font-black uppercase text-blue-500'>
                        Fee:
                      </span>
                      <span className='text-xs font-black text-slate-900'>
                        ৳{' '}
                        {doc.schedule?.consultationFee ||
                          doc.consultationFee ||
                          '0'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBookNow(doc)}
                  className='w-full mt-6 bg-blue-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-95'
                >
                  Book Appointment
                </button>
              </div>
            ))}

            {filteredDoctors.length === 0 && (
              <div className='col-span-full py-20 text-center text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-3xl'>
                <p className='text-xs font-bold uppercase tracking-widest'>
                  No specialists found
                </p>
              </div>
            )}
          </div>

          <div className='flex justify-end pt-12'>
            <button
              onClick={handleLogout}
              className='w-48 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all focus:ring-2 focus:ring-red-500 outline-none'
            >
              LogOut
            </button>
          </div>
        </section>
      </main>

      {showPopup && activeAssistant && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4'>
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
              Book Slot
            </h3>
            <p className='text-slate-500 text-sm mt-2'>
              Contact <b>{activeAssistant.name}</b>, assistant of{' '}
              <b>{activeAssistant.doctorName}</b>.
            </p>

            <div className='my-8 space-y-3'>
              <a
                href={`tel:${activeAssistant.assistantPhone}`}
                className='flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all group'
              >
                <div className='text-left'>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    Call Assistant
                  </p>
                  <p className='text-sm font-bold text-slate-900'>
                    {activeAssistant.assistantPhone || 'N/A'}{' '}
                  </p>
                </div>
                <div className='w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center'>
                  →
                </div>
              </a>

              <a
                href={`https://wa.me/${activeAssistant.assistantPhone?.replace(/\D/g, '')}`}
                target='_blank'
                rel='noreferrer'
                className='flex items-center justify-between p-5 bg-green-50 rounded-2xl border border-green-100 hover:border-green-400 transition-all group'
              >
                <div className='text-left'>
                  <p className='text-[10px] font-black text-green-600/60 uppercase tracking-widest'>
                    WhatsApp Chat
                  </p>
                  <p className='text-sm font-bold text-slate-900'>
                    {activeAssistant.assistantPhone || 'N/A'}
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
              Got it
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SearchDoctor;
