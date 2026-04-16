import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = () => {
  const navigate = useNavigate();

  const goals = [
    {
      title: 'Connecting Everyone',
      icon: '🔗',
      desc: 'Patients, doctors, and hospital staff in one digital space.',
    },
    {
      title: 'Zero Paperwork',
      icon: '📄',
      desc: 'Fast and secure digital tools replacing old physical files.',
    },
    {
      title: 'Everything in One Place',
      icon: '📍',
      desc: 'From booking a visit to checking your bills, it’s all here.',
    },
  ];

  return (
    <div className='min-h-screen bg-[#F0F7FF] flex flex-col font-inter text-slate-900'>
      <Navbar />

      <main className='grow p-6 md:p-10 max-w-7xl mx-auto w-full space-y-16 md:space-y-24'>
        <section className='relative text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12 pt-10 md:pt-20'>
          <div className='max-w-2xl space-y-8'>
            <div className='inline-block'>
              <span className='bg-blue-600 text-white text-[14px] font-black uppercase tracking-[0.3em] px-10 py-4 rounded-2xl shadow-blue-200 shadow-lg'>
                Meet VitaLink
              </span>
            </div>
            <h1 className='text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-[0.95]'>
              Health Data, <br />
              <span className='text-blue-600 inline-block mt-2'>
                But Simple.
              </span>
            </h1>
            <p className='text-slate-600 text-lg md:text-xl font-semibold leading-relaxed max-w-xl mx-auto md:mx-0'>
              We use technology to bring patients and doctors together. No more
              scattered folders—just one simple home for your health.
            </p>
          </div>

          <div className='relative hidden lg:block'>
            <div className='w-64 h-40 bg-white rounded-3xl shadow-2xl border border-slate-200 rotate-3 flex flex-col p-6 justify-between'>
              <div className='w-12 h-2 bg-blue-100 rounded-full'></div>
              <div className='space-y-2'>
                <div className='w-full h-3 bg-slate-100 rounded-full'></div>
                <div className='w-2/3 h-3 bg-slate-100 rounded-full'></div>
              </div>
              <div className='bg-blue-600 h-8 w-full rounded-xl'></div>
            </div>
            <div className='absolute -top-10 -left-10 w-80 h-40 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 -rotate-6 flex flex-col p-6 justify-between transform transition-transform hover:scale-105'>
              <div className='flex justify-between items-center'>
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold'>
                  ✓
                </div>
                <div className='text-[10px] font-black text-blue-400 uppercase tracking-widest'>
                  Status: Synced
                </div>
              </div>
              <div className='text-white font-bold text-sm uppercase tracking-tighter'>
                Patient Vault Secured
              </div>
              <div className='w-full h-1 bg-slate-700 rounded-full'></div>
            </div>
          </div>
        </section>

        <section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {goals.map((goal, idx) => (
            <div
              key={idx}
              className='group bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-xl hover:border-blue-600 transition-all hover:-translate-y-2'
            >
              <div className='text-4xl mb-6 group-hover:scale-125 transition-transform origin-left'>
                {goal.icon}
              </div>
              <h3 className='text-lg font-black uppercase tracking-tight text-slate-900 mb-2'>
                {goal.title}
              </h3>
              <p className='text-slate-500 text-sm font-medium leading-relaxed'>
                {goal.desc}
              </p>
            </div>
          ))}
        </section>

        <section className='space-y-8'>
          <h2 className='text-3xl md:text-4xl font-black uppercase tracking-tighter text-center md:text-left'>
            One App. <span className='text-blue-600'>Four Superpowers.</span>
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
            <div className='md:col-span-12 lg:col-span-7 bg-blue-600 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-slate-200 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-80'>
              <div className='relative z-10'>
                <span className='text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full'>
                  Role 01
                </span>
                <h3 className='text-3xl font-black uppercase mt-4 mb-4 text-slate-100 leading-tight'>
                  For Patients: <br className='hidden md:block' /> The Health
                  Vault
                </h3>
                <p className='text-blue-100 font-bold uppercase text-xs mb-8 max-w-md'>
                  You’ll never lose a medical document again. High-speed search,
                  secure storage, and easy retrieval.
                </p>
              </div>
              <div className='flex flex-wrap gap-2 relative z-10'>
                {[
                  'Health Vault',
                  'Search Doctor',
                  'Appointments',
                  'Billing',
                ].map(tag => (
                  <span
                    key={tag}
                    className='bg-slate-100 text-slate-900 px-3 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase'
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className='absolute -right-6 -bottom-6 text-[120px] md:text-[180px] opacity-20 md:opacity-100 pointer-events-none select-none'>
                🙋🏻‍♀️
              </div>
            </div>

            <div className='md:col-span-12 lg:col-span-5 bg-slate-800 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-80'>
              <div className='relative z-10'>
                <span className='text-[10px] font-black text-blue-300 uppercase tracking-widest'>
                  Role 02
                </span>
                <h3 className='text-3xl font-black uppercase mt-4 mb-4'>
                  For Doctors
                </h3>
                <p className='text-slate-300 text-sm font-medium leading-relaxed max-w-xs'>
                  Focus on healing, not files. Access patient history instantly
                  and write clear digital prescriptions.
                </p>
                <div className='flex flex-wrap gap-2 mt-6'>
                  <span className='bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase'>
                    Search Patient
                  </span>
                  <span className='bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase'>
                    Add Rx
                  </span>
                </div>
              </div>
              <div className='absolute -right-6 -bottom-6 text-[120px] md:text-[180px] opacity-20 md:opacity-100 pointer-events-none'>
                👩🏻‍⚕️
              </div>
            </div>

            <div className='md:col-span-12 lg:col-span-6 bg-slate-600 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden min-h-60 flex flex-col justify-between'>
              <div className='relative z-10'>
                <h3 className='text-2xl font-black uppercase'>
                  Doctor's Assistants
                </h3>
                <p className='text-slate-100 text-sm mt-4 leading-relaxed font-medium'>
                  📝 Manage schedules. <br />
                  📄 Upload prescriptions in real-time. <br />
                  🗓️ Handles follow up dates.
                </p>
              </div>
              <div className='w-full bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 mt-6'>
                <div className='flex justify-between items-center text-[10px] font-black uppercase text-white tracking-widest'>
                  <span>Add patient to the queue</span>
                  <span>Total Patient: 10</span>
                </div>
              </div>
            </div>

            <div className='md:col-span-12 lg:col-span-6 bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-slate-200 shadow-xl relative overflow-hidden min-h-60 flex flex-col justify-between'>
              <div className='relative z-10'>
                <h3 className='text-2xl font-black uppercase text-slate-900'>
                  Lab Assistants
                </h3>
                <p className='text-slate-500 text-sm mt-4 leading-relaxed font-medium'>
                  🧪 Bridge the gap between testing and care. <br />
                  📑 Boost precision with paperless reporting. <br />⚡ Instant
                  access via secure uploads.
                </p>
              </div>
              <div className='flex items-center gap-4 mt-6'>
                <div className='h-2 w-full bg-slate-100 rounded-full overflow-hidden'>
                  <div className='h-full w-2/3 bg-green-500'></div>
                </div>
                <span className='text-[10px] font-black text-green-600 uppercase tracking-widest whitespace-nowrap'>
                  Uploaded
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className='flex justify-center pt-10 pb-20'>
          <div className='bg-white border-2 md:border-4 border-blue-400 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] text-center shadow-2xl shadow-blue-100 w-full max-w-4xl space-y-8'>
            <h4 className='text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-tight'>
              Ready to go <br />
              <span className='text-blue-600 underline decoration-[6px] md:decoration-8 underline-offset-4 md:underline-offset-8'>
                Paperless?
              </span>
            </h4>

            <p className='max-w-xl mx-auto text-slate-600 font-bold text-base md:text-lg leading-relaxed'>
              Join the future of healthcare that is organized, fast, and secure.
            </p>

            <div className='pt-4'>
              <button
                onClick={() => navigate('/signup-patient')}
                className='w-full md:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all active:scale-95'
              >
                Start Your Journey
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
