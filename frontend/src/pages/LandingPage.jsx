import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex flex-col font-inter bg-[#EFF6FF] text-slate-800'>
      <Navbar />

      <header className='bg-[#EFF6FF] pt-16 pb-12 px-8 flex flex-col items-center text-center border-b border-slate-100'>
        <div className='max-w-6xl mx-auto space-y-8'>
          <div className='inline-block text-[#3B82F6] text-[12px] font-inter font-black uppercase tracking-[0.3em] rounded-full'>
            Universal Patient Healthcare Companion
          </div>

          <h2 className='text-4xl md:text-6xl lg:text-7xl font-inter font-black text-slate-900 leading-[1.15] tracking-tight'>
            <span className='md:block'>Your complete health record,</span>
            <span className='text-[#3B82F6] md:block'>
              in one secure place.
            </span>
          </h2>

          <p className='text-slate-500 text-lg md:text-xl leading-relaxed font-inter font-medium max-w-2xl mx-auto'>
            Stop chasing paper reports. VitaLink is your secure, patient-centric
            vault for every prescription, scan, and bill you'll ever need.
          </p>

          <button
            onClick={() => navigate('/signup-patient')}
            className='bg-[#3B82F6] hover:bg-[#1E40AF] text-white font-inter font-bold py-5 px-14 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 uppercase tracking-widest text-sm'
          >
            Join VitaLink Now
          </button>
        </div>
      </header>

      <section className='px-8 py-12 max-w-6xl mx-auto w-full'>
        <div className='text-center mb-12'>
          <h3 className='text-[10px] uppercase tracking-[0.3em] text-[#3B82F6] font-inter font-black mb-2'>
            Access Control
          </h3>
          <h2 className='text-3xl font-inter font-bold text-slate-900 tracking-tight'>
            Choose Your Portal
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-white p-10 rounded-[3rem] text-center flex flex-col items-center border-2 border-white shadow-xl hover:border-[#60A5FA] hover:-translate-y-2 transition-all group'>
            <div className='w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mb-6 text-[#3B82F6] text-2xl group-hover:scale-110 transition-transform'>
              👤
            </div>
            <h4 className='text-2xl font-inter font-bold text-[#000000] mb-2 tracking-tight'>
              Patient Portal
            </h4>
            <p className='text-slate-700 text-sm mb-8 leading-relaxed font-inter font-medium'>
              Access your personal vault, medical history, and digital
              prescriptions securely.
            </p>
            <button
              onClick={() => navigate('/login-patient')}
              className='w-full bg-[#3B82F6] text-white font-inter font-bold py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-[#1E40AF] transition-all shadow-lg'
            >
              Login to Vault
            </button>
            <button
              onClick={() => navigate('/signup-patient')}
              className='mt-6 text-xs text-[#3B82F6] font-inter font-black uppercase tracking-widest hover:text-[#1E40AF] hover:underline transition-all'
            >
              New User? Sign Up
            </button>
          </div>

          <div className='bg-white p-10 rounded-[3rem] text-center flex flex-col items-center border-2 border-white shadow-xl hover:border-[#60A5FA] hover:-translate-y-2 transition-all group'>
            <div className='w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mb-6 text-[#3B82F6] text-2xl group-hover:scale-110 transition-transform'>
              🩺
            </div>
            <h4 className='text-2xl font-inter font-bold text-[#000000] mb-2 tracking-tight'>
              Doctor Portal
            </h4>
            <p className='text-slate-700 text-sm mb-8 leading-relaxed font-inter font-medium'>
              Securely access your patients' medical timelines and issue
              verified digital orders instantly.
            </p>
            <button
              onClick={() => navigate('/login-doctor')}
              className='w-full bg-[#3B82F6] text-white font-inter font-bold py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-[#1E40AF] transition-all shadow-lg'
            >
              Doctor Login
            </button>
            <button
              onClick={() => navigate('/')}
              className='mt-6 text-xs text-[#3B82F6] font-inter font-black uppercase tracking-widest hover:text-[#1E40AF] hover:underline transition-all'
            >
              Issues? Ask Admin
            </button>
          </div>

          <div className='bg-white p-10 rounded-[3rem] text-center flex flex-col items-center border-2 border-white shadow-xl hover:border-[#60A5FA] hover:-translate-y-2 transition-all group'>
            <div className='w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mb-6 text-[#3B82F6] text-2xl group-hover:scale-110 transition-transform'>
              🏢
            </div>
            <h4 className='text-2xl font-inter font-bold text-[#000000] mb-2 tracking-tight'>
              Staff Portal
            </h4>
            <p className='text-slate-700 text-sm mb-8 leading-relaxed font-inter font-medium'>
              Oversee clinical workflows and manage billing records to ensure
              seamless synchronization across your departments.
            </p>
            <button
              onClick={() => navigate('/login-staff')}
              className='w-full bg-[#3B82F6] text-white font-inter font-bold py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-[#1E40AF] transition-all shadow-lg'
            >
              Staff Login
            </button>
            <button
              onClick={() => navigate('/')}
              className='mt-6 text-xs text-[#3B82F6] font-inter font-black uppercase tracking-widest hover:text-[#1E40AF] hover:underline transition-all'
            >
              Issues? Ask Admin
            </button>
          </div>
        </div>
      </section>

      <section className='px-8 py-20 bg-white border-t border-slate-200'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-16'>
            <h3 className='text-[10px] uppercase tracking-[0.3em] text-[#3B82F6] font-inter font-black mb-2'>
              Platform Roles
            </h3>
            <h2 className='text-3xl font-inter font-bold text-slate-900 tracking-tight'>
              How VitaLink Empowers You
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-[#EFF6FF] p-10 rounded-[2.5rem] shadow-xl border border-white flex flex-col'>
              <div className='flex items-center gap-4 mb-8'>
                <span className='w-10 h-10 bg-white text-[#3B82F6] rounded-xl flex items-center justify-center font-inter font-black text-xs'>
                  01
                </span>
                <h3 className='text-xl font-inter font-bold text-slate-900 uppercase tracking-tight'>
                  Patients
                </h3>
              </div>
              <ul className='space-y-6 grow'>
                <li className='flex gap-4'>
                  <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                  <p className='text-sm text-slate-500 leading-relaxed font-inter'>
                    <strong className='text-slate-800'>
                      Unified Health Vault:
                    </strong>{' '}
                    Access all prescriptions, scans, and bills in one digital
                    timeline.
                  </p>
                </li>
                <li className='flex gap-4'>
                  <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                  <p className='text-sm text-slate-500 leading-relaxed font-inter'>
                    <strong className='text-slate-800'>
                      Total Data Control:
                    </strong>{' '}
                    Own your history with old record uploads and secure sharing.
                  </p>
                </li>
                <li className='flex gap-4'>
                  <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                  <p className='text-sm text-slate-500 leading-relaxed font-inter'>
                    <strong className='text-slate-800'>Simplified Care:</strong>{' '}
                    Book appointments and pay bills through a single transparent
                    portal.
                  </p>
                </li>
              </ul>
            </div>

            <div className='bg-[#EFF6FF] p-10 rounded-[2.5rem] shadow-xl border border-white flex flex-col'>
              <div className='flex items-center gap-4 mb-8'>
                <span className='w-10 h-10 bg-white text-[#3B82F6] rounded-xl flex items-center justify-center font-inter font-black text-xs'>
                  02
                </span>
                <h3 className='text-xl font-inter font-bold text-slate-900 uppercase tracking-tight'>
                  Doctors
                </h3>
              </div>
              <ul className='space-y-6 grow'>
                <li className='flex gap-4'>
                  <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                  <p className='text-sm text-slate-500 leading-relaxed font-inter'>
                    <strong className='text-slate-800'>Instant History:</strong>{' '}
                    Get authorized access to medical timelines instantly via
                    Unique ID.
                  </p>
                </li>
                <li className='flex gap-4'>
                  <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                  <p className='text-sm text-slate-500 leading-relaxed font-inter'>
                    <strong className='text-slate-800'>
                      Digital Prescriptions:
                    </strong>{' '}
                    Create and sync digital orders directly to records to save
                    time.
                  </p>
                </li>
                <li className='flex gap-4'>
                  <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                  <p className='text-sm text-slate-500 leading-relaxed font-inter'>
                    <strong className='text-slate-800'>
                      Clinical Privacy:
                    </strong>{' '}
                    Protect data with secure 'Clear Session' protocols on shared
                    terminals.
                  </p>
                </li>
              </ul>
            </div>

            <div className='bg-[#EFF6FF] p-10 rounded-[2.5rem] shadow-xl border border-white flex flex-col'>
              <div className='flex items-center gap-4 mb-8'>
                <span className='w-10 h-10 bg-white text-[#3B82F6] rounded-xl flex items-center justify-center font-inter font-black text-xs'>
                  03
                </span>
                <h3 className='text-xl font-inter font-bold text-slate-900 uppercase tracking-tight'>
                  Hospital Staff
                </h3>
              </div>
              <ul className='space-y-6 grow'>
                <li className='flex gap-4'>
                  <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                  <p className='text-sm text-slate-500 leading-relaxed font-inter'>
                    <strong className='text-slate-800'>
                      Queue Management:
                    </strong>{' '}
                    Coordinate live waitlists and digitize notes with scanning
                    tools.
                  </p>
                </li>
                <li className='flex gap-4'>
                  <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                  <p className='text-sm text-slate-500 leading-relaxed font-inter'>
                    <strong className='text-slate-800'>
                      Automated Billing:
                    </strong>{' '}
                    Eliminate errors with automated pricing and a transparent
                    audit trail.
                  </p>
                </li>
                <li className='flex gap-4'>
                  <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0' />
                  <p className='text-sm text-slate-500 leading-relaxed font-inter'>
                    <strong className='text-slate-800'>Secure Reports:</strong>{' '}
                    Upload diagnostic results directly to vaults once payment is
                    verified.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
