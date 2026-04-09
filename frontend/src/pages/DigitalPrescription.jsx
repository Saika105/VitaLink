import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DoctorNavbar from '../components/DoctorNavbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const DigitalPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [medicineInput, setMedicineInput] = useState('');
  const [medicineList, setMedicineList] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState({
    fullName: '',
    specialization: '',
    hospital: { name: '' },
    profilePhoto: { url: '' },
  });

  const [prescriptionData, setPrescriptionData] = useState({
    illness: '',
    tests: '',
    advice: '',
  });

  const patientInfo = state?.patient || {
    fullName: 'PATIENT',
    upid: id,
    age: '--',
    gender: '--',
  };

  const todayDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await protectedFetch(
          `${import.meta.env.VITE_API_URL}/api/v1/doctors/profile`,
        );
        if (response.ok) {
          const result = await response.json();
          setDoctorInfo(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctorProfile();
  }, []);

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

    const finalData = {
      diagnosis:
        prescriptionData.illness.toUpperCase() || 'GENERAL CONSULTATION',
      hospitalName: (doctorInfo.hospital?.name || 'VITALINK HUB').toUpperCase(),
      prescriptionContent: {
        illness: prescriptionData.illness,
        tests: prescriptionData.tests,
        advice: prescriptionData.advice,
        medicines: medicineList,
      },
      date: new Date(),
    };

    try {
      const response = await protectedFetch(
        `${import.meta.env.VITE_API_URL}/api/v1/doctors/patient/${id}/save-prescription`,
        {
          method: 'POST',
          body: JSON.stringify(finalData),
        },
      );

      if (response.ok) {
        alert('Prescription secured in Patient Vault under your name.');
        navigate(`/doctor/patient-view/${id}`);
      }
    } catch (err) {
      alert('Upload failed. Check connection.');
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-black'>
      <DoctorNavbar
        doctorName={doctorInfo.fullName}
        doctorPhoto={doctorInfo.profilePhoto?.url}
      />

      <main className='grow max-w-6xl mx-auto w-full p-4 md:p-10 flex flex-col'>
        <div className='flex justify-between items-end mb-6'>
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

        <div className='bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col'>
          <div className='bg-[#3B82F6] p-8 text-white grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div>
              <p className='text-[12px] font-bold text-blue-100 uppercase tracking-widest mb-1'>
                Patient:
              </p>
              <p className='font-black text-sm uppercase leading-tight'>
                {patientInfo.fullName}
              </p>
            </div>
            <div>
              <p className='text-[12px] font-bold text-blue-100 uppercase tracking-widest mb-1'>
                ID Number:
              </p>
              <p className='font-black text-sm uppercase leading-tight'>
                {patientInfo.upid || id}
              </p>
            </div>
            <div>
              <p className='text-[12px] font-bold text-blue-100 uppercase tracking-widest mb-1'>
                Age/Gender:
              </p>
              <p className='font-black text-sm uppercase leading-tight'>
                {patientInfo.age}Y / {patientInfo.gender}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-[12px] font-bold text-blue-100 uppercase tracking-widest mb-1'>
                Date
              </p>
              <p className='font-black text-sm uppercase leading-tight'>
                {todayDate}
              </p>
            </div>
          </div>

          <div className='flex flex-col md:flex-row min-h-125'>
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
                  placeholder='Clinical notes...'
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
                  placeholder='e.g. CBC, X-Ray'
                  rows='3'
                ></textarea>
              </div>
            </aside>

            <section className='grow p-10 relative flex flex-col bg-white'>
              <div className='absolute top-10 left-10 text-9xl font-black text-blue-600/5 select-none uppercase pointer-events-none'>
                Rx
              </div>
              <div className='relative z-10 space-y-12 grow'>
                <div>
                  <h3 className='text-sm font-black text-black uppercase tracking-widest mb-6 flex items-center gap-3'>
                    <span className='w-2.5 h-2.5 bg-blue-600 rounded-full'></span>{' '}
                    Medication Plan
                  </h3>
                  <div className='space-y-2 mb-6'>
                    {medicineList.map((med, index) => (
                      <div
                        key={index}
                        className='flex justify-between items-center bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl group shadow-sm'
                      >
                        <p className='text-md font-semibold text-black'>
                          <span className='text-blue-600 mr-2'>
                            {index + 1}.
                          </span>{' '}
                          {med}
                        </p>
                        <button
                          onClick={() => removeMedicine(index)}
                          className='text-red-600 opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest'
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
                  />
                </div>
                <div>
                  <h3 className='text-[12px] font-black text-black uppercase tracking-widest mb-4'>
                    Special Advice
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
                    placeholder='e.g. Follow-up in 7 days'
                  />
                </div>
              </div>

              <div className='mt-20 flex justify-end pb-4 border-t border-slate-100 pt-8'>
                <div className='text-right'>
                  <p className='text-md font-black text-black uppercase tracking-tight'>
                    {doctorInfo.fullName}
                  </p>
                  <p className='text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1'>
                    {doctorInfo.specialization} • {doctorInfo.hospital?.name}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className='bg-slate-50 p-8 border-t border-slate-200 flex justify-end items-center'>
            <button
              onClick={handleSave}
              className='px-16 py-4 rounded-2xl bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95'
            >
              Sign & Save Rx
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DigitalPrescription;
