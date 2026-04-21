import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DoctorNavbar from '../components/DoctorNavbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const DigitalPrescription = () => {
  const { upid } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const appointmentId = state?.appointmentId;
  const isVaultAccess = state?.isVaultAccess || false;
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
    upid: upid,
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
    if (savedUser) setDoctorInfo(savedUser);

    if (!appointmentId && !isVaultAccess) {
      alert('Session reference missing.');
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
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(59, 130, 246);
      doc.text('VITALINK DIGITAL PRESCRIPTION', 14, 20);
      doc.setDrawColor(200, 200, 200);
      doc.rect(14, 25, 182, 25);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`PATIENT: ${patientInfo.fullName.toUpperCase()}`, 18, 35);
      doc.text(`ID: ${patientInfo.upid}`, 18, 42);
      doc.text(`DATE: ${todayDate}`, 140, 35);
      doc.text(
        `AGE/GENDER: ${calculateAge(patientInfo.dateOfBirth)}Y / ${patientInfo.gender}`,
        140,
        42,
      );
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('OBSERVATION:', 14, 65);
      doc.setFontSize(10);
      doc.text(prescriptionData.illness || 'General Consultation', 14, 72);

      autoTable(doc, {
        startY: 85,
        head: [['#', 'MEDICATION PLAN']],
        body: medicineList.map((m, i) => [i + 1, m]),
        headStyles: { fillColor: [59, 130, 246] },
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.text('REQUIRED TESTS:', 14, finalY);
      doc.setFontSize(10);
      doc.text(prescriptionData.tests || 'None', 14, finalY + 7);
      doc.text("DOCTOR'S ADVICE:", 14, finalY + 20);
      doc.text(
        prescriptionData.advice || 'Follow up as needed',
        14,
        finalY + 27,
      );
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`DR. ${doctorInfo?.fullName.toUpperCase()}`, 140, finalY + 50);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`${doctorInfo?.specialization.toUpperCase()}`, 140, finalY + 55);

      if (isVaultAccess) {
         doc.save(`Prescription_${patientInfo.upid}.pdf`);
         alert('Prescription downloaded successfully.');
          navigate(`/doctor/patient-view/${upid}`);
          return;
    }
      const pdfBlob = doc.output('blob');
      const formData = new FormData();
      formData.append(
        'prescriptionFile',
        pdfBlob,
        `Prescription_${patientInfo.upid}.pdf`,
      );
      formData.append(
        'diagnosis',
        prescriptionData.illness || 'General Consultation',
      );

     const medicationsObjArray = medicineList.map(med => ({
       name: med,
       dosage: 'As directed',
       duration: 'As directed',
     }));
      formData.append('medications', JSON.stringify(medicationsObjArray));
      formData.append('advice', prescriptionData.advice || 'N/A');

      const testArray = prescriptionData.tests
        ? prescriptionData.tests.split(',').map(t => t.trim())
        : [];
      formData.append('requiredTests', JSON.stringify(testArray));

      const response = await protectedFetch(
        `/api/v1/doctors/sign-prescription/${appointmentId}`,
        {
          method: 'POST',
          body: formData,
          isMultipart: true,
        },
      );

      if (response.ok) {
        alert('Prescription successfully synced to HealthVault.');
        navigate(`/doctor/patient-view/${upid}`);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Sync failed: ${errData.message || 'Server Error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error generating medical record.');
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-black'>
      <DoctorNavbar
        doctorName={doctorInfo?.fullName}
        doctorPhoto={doctorInfo?.profilePhoto?.url}
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
            Discard
          </button>
        </div>

        <div className='bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col'>
          <div className='bg-[#3B82F6] p-8 text-white grid grid-cols-2 md:grid-cols-4 gap-8'>
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
              <div className='absolute top-10 left-10 text-9xl font-black text-blue-100/10 select-none uppercase pointer-events-none'>
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
                  <p className='text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1'>
                    {doctorInfo?.specialization || 'Consultant'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className='mt-8 flex justify-end items-center'>
          <button
            onClick={handleSave}
            className='px-20 py-5 rounded-2xl bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[12px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95'
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
