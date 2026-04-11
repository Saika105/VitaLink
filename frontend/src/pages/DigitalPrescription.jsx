import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { domToPng } from 'modern-screenshot';
import DoctorNavbar from '../components/DoctorNavbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const DigitalPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const appointmentId = state?.appointmentId;
  const prescriptionRef = useRef(null);

  const [medicineInput, setMedicineInput] = useState('');
  const [medicineList, setMedicineList] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);

  const [prescriptionData, setPrescriptionData] = useState({
    illness: '',
    tests: '',
    advice: '',
  });

  const calculateAge = dob => {
    if (!dob) return '--';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const patientInfo = state?.patient || {
    fullName: 'PATIENT',
    upid: id,
    dateOfBirth: null,
    gender: '--',
  };

  const todayDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setDoctorInfo(savedUser);
    }
    if (!appointmentId) {
      alert('Session expired. Please return to dashboard.');
      navigate(-1);
    }
  }, [appointmentId, navigate]);

  const addMedicine = e => {
    if (e.key === 'Enter' && medicineInput.trim()) {
      setMedicineList([...medicineList, medicineInput.trim()]);
      setMedicineInput('');
    }
  };

  const removeMedicine = index => {
    setMedicineList(medicineList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (medicineList.length === 0) {
      alert('Please add at least one medicine.');
      return;
    }

    try {
      const dataUrl = await domToPng(prescriptionRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        filter: node => {
          if (node.hasAttribute && node.hasAttribute('data-screenshot-exclude'))
            return false;
          return true;
        },
      });

      const blob = await (await fetch(dataUrl)).blob();
      const formData = new FormData();
      formData.append('prescriptionFile', blob, `RX_${patientInfo.upid}.png`);
      formData.append(
        'diagnosis',
        prescriptionData.illness || 'General Consultation',
      );
      formData.append('medications', JSON.stringify(medicineList));
      formData.append(
        'advice',
        prescriptionData.advice || 'Follow-up as advised',
      );
      formData.append(
        'requiredTests',
        JSON.stringify(
          prescriptionData.tests
            ? prescriptionData.tests.split(',').map(t => t.trim())
            : [],
        ),
      );

      const res = await protectedFetch(
        `/api/v1/doctors/prescription/create/${appointmentId}`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (res.ok) {
        alert('Digital Prescription synced to HealthVault successfully.');
        navigate(`/doctor/patient-view/${id}`);
      } else {
        const error = await res.json();
        alert(error.message || 'Error saving to database.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to capture prescription image. Try using a standard font.');
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-black'>
      <DoctorNavbar
        doctorName={doctorInfo?.fullName}
        doctorPhoto={doctorInfo?.profilePhoto?.url}
      />

      <main className='grow max-w-6xl mx-auto w-full p-4 md:p-10 flex flex-col'>
        <div
          className='flex justify-between items-end mb-6'
          data-screenshot-exclude
        >
          <div>
            <h2 className='text-3xl font-black text-black uppercase tracking-tighter'>
              New Consultation
            </h2>
            <p className='text-[14px] font-bold text-blue-700 uppercase tracking-widest mt-1'>
              Digital Medical Record
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className='bg-white border border-slate-300 text-black px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all shadow-sm'
          >
            Discard Draft
          </button>
        </div>

        <div
          ref={prescriptionRef}
          className='bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col'
        >
          <div
            style={{ backgroundColor: '#2563eb' }}
            className='p-8 text-white grid grid-cols-2 md:grid-cols-4 gap-8'
          >
            <div>
              <p className='text-[12px] font-bold opacity-80 uppercase tracking-widest mb-1'>
                Patient:
              </p>
              <p className='font-black text-sm uppercase leading-tight'>
                {patientInfo.fullName}
              </p>
            </div>
            <div>
              <p className='text-[12px] font-bold opacity-80 uppercase tracking-widest mb-1'>
                ID Number:
              </p>
              <p className='font-black text-sm uppercase leading-tight'>
                {patientInfo.upid}
              </p>
            </div>
            <div>
              <p className='text-[12px] font-bold opacity-80 uppercase tracking-widest mb-1'>
                Age/Gender:
              </p>
              <p className='font-black text-sm uppercase leading-tight'>
                {calculateAge(patientInfo.dateOfBirth)}Y /{' '}
                {patientInfo.gender || '--'}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-[12px] font-bold opacity-80 uppercase tracking-widest mb-1'>
                Date
              </p>
              <p className='font-black text-sm uppercase leading-tight'>
                {todayDate}
              </p>
            </div>
          </div>

          <div className='flex flex-col md:flex-row min-h-[500px]'>
            <aside className='w-full md:w-80 bg-slate-50 p-8 border-r border-slate-200 flex flex-col gap-12'>
              <div>
                <h3 className='text-[12px] font-black text-black uppercase tracking-widest mb-4'>
                  Observation
                </h3>
                <textarea
                  value={prescriptionData.illness}
                  onChange={e =>
                    setPrescriptionData({
                      ...prescriptionData,
                      illness: e.target.value,
                    })
                  }
                  className='w-full bg-transparent border-b-2 border-slate-300 focus:border-blue-600 outline-none text-md font-semibold text-black placeholder:text-slate-300 resize-none'
                  placeholder='Notes...'
                  rows='3'
                ></textarea>
              </div>
              <div>
                <h3 className='text-[12px] font-black text-black uppercase tracking-widest mb-4'>
                  Required Tests
                </h3>
                <textarea
                  value={prescriptionData.tests}
                  onChange={e =>
                    setPrescriptionData({
                      ...prescriptionData,
                      tests: e.target.value,
                    })
                  }
                  className='w-full bg-transparent border-b-2 border-slate-300 focus:border-blue-600 outline-none text-md font-semibold text-black placeholder:text-slate-300 resize-none'
                  placeholder='e.g. CBC'
                  rows='3'
                ></textarea>
              </div>
            </aside>

            <section className='grow p-10 relative flex flex-col bg-white'>
              <div className='absolute top-10 left-10 text-9xl font-black text-blue-100/20 select-none uppercase pointer-events-none'>
                Rx
              </div>
              <div className='relative z-10 space-y-12 grow'>
                <div>
                  <h3 className='text-sm font-black text-black uppercase tracking-widest mb-6 flex items-center gap-3'>
                    <span
                      style={{ backgroundColor: '#2563eb' }}
                      className='w-2.5 h-2.5 rounded-full'
                    ></span>{' '}
                    Medication Plan
                  </h3>
                  <div className='space-y-2 mb-6'>
                    {medicineList.map((med, index) => (
                      <div
                        key={index}
                        className='flex justify-between items-center bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl'
                      >
                        <p className='text-md font-semibold text-black'>
                          <span className='text-blue-600 mr-2'>
                            {index + 1}.
                          </span>{' '}
                          {med}
                        </p>
                        <button
                          onClick={() => removeMedicine(index)}
                          className='text-red-600 font-black text-[10px] uppercase'
                          data-screenshot-exclude
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type='text'
                    value={medicineInput}
                    onChange={e => setMedicineInput(e.target.value)}
                    onKeyDown={addMedicine}
                    className='w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-5 text-md font-black text-black outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner'
                    placeholder='Type medicine + Enter...'
                    data-screenshot-exclude
                  />
                </div>
                <div>
                  <h3 className='text-[12px] font-black text-black uppercase tracking-widest mb-4'>
                    Doctor's Advice
                  </h3>
                  <input
                    type='text'
                    value={prescriptionData.advice}
                    onChange={e =>
                      setPrescriptionData({
                        ...prescriptionData,
                        advice: e.target.value,
                      })
                    }
                    className='w-full bg-transparent border-b-2 border-slate-300 focus:border-blue-600 outline-none text-md font-semibold text-black py-2'
                    placeholder='Instructions...'
                  />
                </div>
              </div>

              <div className='mt-20 flex justify-end pb-4 border-t border-slate-100 pt-8'>
                <div className='text-right'>
                  <p className='text-md font-black text-black uppercase tracking-tight'>
                    {doctorInfo?.fullName || 'Practitioner'}
                  </p>
                  <p
                    style={{ color: '#2563eb' }}
                    className='text-[11px] font-bold uppercase tracking-widest mt-1'
                  >
                    {doctorInfo?.specialization || 'Consultant'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div
          className='mt-8 flex justify-end items-center'
          data-screenshot-exclude
        >
          <button
            onClick={handleSave}
            className='px-20 py-5 rounded-2xl bg-blue-600 hover:bg-blue-800 text-white text-[12px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all'
          >
            Sign & Save Rx
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DigitalPrescription;
