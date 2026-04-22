import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DoctorNavbar from '../components/DoctorNavbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const DoctorPatientView = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const location = useLocation();
  const appointmentId = location.state?.appointmentId;

  const [activeTab, setActiveTab] = useState('Prescriptions');
  const [items, setItems] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState({
    fullName: '',
    profilePhoto: { url: '' },
  });
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateAge = dob => {
    if (!dob) return '--';
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
          setDoctorInfo({
            fullName: savedUser.fullName,
            profilePhoto: { url: savedUser.profilePhoto?.url || '' },
          });
        }

        const patientRes = await protectedFetch(
          `/api/v1/doctors/patient-profile/${patientId}`,
        );
        if (patientRes.ok) {
          const pData = await patientRes.json();
          setPatientData(pData.data);
        } else {
          setPatientData({
            fullName: 'Patient Not Found',
            upid: patientId,
            age: '--',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialData();
  }, [patientId]);

  useEffect(() => {
    if (!patientData?._id || patientData.fullName === 'Patient Not Found')
      return;

    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const endpoint =
          activeTab === 'Prescriptions'
            ? `/api/v1/doctors/prescriptions/get/${patientData._id}`
            : `/api/v1/doctors/lab-reports/get/${patientData._id}`;

        const response = await protectedFetch(endpoint);
        if (response.ok) {
          const result = await response.json();
          const mappedData = result.data.map(item => ({
            _id: item._id,
            title: (
              item.diagnosis ||
              item.testName ||
              item.reportName ||
              item.title ||
              'Medical Record'
            ).toUpperCase(),
            hospital: (
              item.hospital?.fullName ||
              item.manualHospitalName ||
              'VitaLink Partner'
            ).toUpperCase(),
            date: new Date(
              item.prescribedDate ||
                item.reportDate ||
                item.createdAt ||
                item.date,
            )
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              .toUpperCase(),
            fileUrl:
              item.prescriptionFile?.url ||
              item.reportFile?.url ||
              item.fileUrl ||
              '',
          }));
          setItems(mappedData);
        } else {
          setItems([]);
        }
      } catch (err) {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [activeTab, patientData]);

  const handleExitSession = async () => {
    try {
      if (appointmentId && !appointmentId.toString().startsWith('manual')) {
        await protectedFetch(`/api/v1/doctors/status/${appointmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'done' }),
        });
      }
      navigate('/doctor-dashboard');
    } catch (err) {
      navigate('/doctor-dashboard');
    }
  };

  if (!patientData) {
    return (
      <div className='min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-inter'>
        <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4'></div>
        <p className='text-[12px] font-black uppercase tracking-widest text-black'>
          Syncing HealthVault...
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-black'>
      <DoctorNavbar
        doctorName={doctorInfo.fullName}
        doctorPhoto={doctorInfo.profilePhoto?.url}
      />

      <main className='grow flex items-center justify-center p-4 md:p-8'>
        <div className='flex flex-col md:flex-row w-full max-w-7xl bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200'>
          <aside className='w-full md:w-85 bg-slate-50 p-8 flex flex-col items-center border-r border-slate-200'>
            <div className='flex flex-col items-center text-center mb-8'>
              <div className='w-32 h-32 bg-white rounded-4xl shadow-sm border border-slate-200 mb-5 overflow-hidden flex items-center justify-center p-1'>
                <img
                  src={
                    patientData.profilePhoto?.url ||
                    patientData.profilePhoto ||
                    `https://ui-avatars.com/api/?name=${patientData.fullName}&background=F1F5F9&color=3B82F6`
                  }
                  className='w-full h-full object-cover rounded-[1.8rem]'
                />
              </div>
              <h3 className='text-lg font-black uppercase tracking-tight'>
                {patientData.fullName}
              </h3>
              <p className='text-[12px] font-black text-blue-600 mt-1 uppercase tracking-widest'>
                {patientData.upid}
              </p>
            </div>

            <div className='grid grid-cols-3 gap-2 w-full mb-8'>
              <div className='bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm'>
                <p className='text-[10px] font-black uppercase text-slate-400'>
                  Age
                </p>
                <p className='text-sm font-black'>
                  {calculateAge(patientData.dateOfBirth)}
                </p>
              </div>
              <div className='bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm'>
                <p className='text-[10px] font-black uppercase text-slate-400'>
                  Gender
                </p>
                <p className='text-sm font-black capitalize'>
                  {patientData.gender || '--'}
                </p>
              </div>
              <div className='bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm'>
                <p className='text-[10px] font-black uppercase text-slate-400'>
                  Blood
                </p>
                <p className='text-sm font-black text-red-600'>
                  {patientData.bloodGroup || '--'}
                </p>
              </div>
            </div>

            <div className='w-full space-y-4 text-left font-inter'>
              <div>
                <p className='text-[12px] font-black uppercase mb-1 ml-1'>
                  Email Address
                </p>
                <div className='bg-white border border-slate-200 rounded-xl px-4 py-2 text-[12px] font-bold truncate'>
                  {patientData.email || '---'}
                </div>
              </div>
              <div>
                <p className='text-[12px] font-black uppercase mb-1 ml-1'>
                  Contact Number
                </p>
                <div className='bg-white border border-slate-200 rounded-xl px-4 py-2 text-[12px] font-black'>
                  {patientData.phone || '---'}
                </div>
              </div>
              <div>
                <p className='text-[12px] font-black uppercase mb-1 ml-1 text-red-600'>
                  Emergency Contact
                </p>
                <div className='bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-[12px] font-black text-red-600'>
                  {patientData.emergencyContact?.phone || 'NOT PROVIDED'}
                </div>
              </div>
              <div>
                <p className='text-[12px] font-black uppercase mb-1 ml-1'>
                  Resident Address
                </p>
                <div className='bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] font-bold leading-relaxed'>
                  {typeof patientData.address === 'object'
                    ? `${patientData.address?.city || ''} ${patientData.address?.street || ''}`.trim() ||
                      'NOT PROVIDED'
                    : patientData.address || 'NOT PROVIDED'}
                </div>
              </div>
            </div>
          </aside>

          <section className='grow p-8 md:p-10 flex flex-col bg-white'>
            <div className='flex justify-between items-start mb-10 gap-6'>
              <div>
                <h2 className='text-3xl font-black uppercase leading-none'>
                  Clinical History
                </h2>
                <p className='text-[12px] font-bold text-blue-700 uppercase tracking-widest mt-2'>
                  Authenticated Vault
                </p>
              </div>
              <div className='flex flex-col gap-2'>
                <button
                  onClick={() =>
                    navigate(
                      `/doctor/create-prescription/${patientData.upid}`,
                      {
                        state: {
                          patient: patientData,
                          appointmentId,
                          isVaultAccess: !appointmentId,
                        },
                      },
                    )
                  }
                  className='w-54 h-12 bg-[#3B82F6] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95'
                >
                  Create Digital RX
                </button>
                <button
                  onClick={handleExitSession}
                  className='w-54 h-12 border-2 border-slate-200 text-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all'
                >
                  Exit Session
                </button>
              </div>
            </div>

            <div className='flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit mb-8'>
              {['Prescriptions', 'Reports'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-black hover:text-blue-600'}`}
                >
                  {tab === 'Reports' ? 'Medical Reports' : tab}
                </button>
              ))}
            </div>

            <div className='flex flex-col gap-3 border-2 border-dashed border-slate-100 rounded-3xl p-4 bg-slate-50/30 overflow-y-auto max-h-125 custom-scrollbar'>
              {isLoading ? (
                <div className='flex items-center justify-center py-20'>
                  <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                </div>
              ) : items.length > 0 ? (
                items.map((item, index) => (
                  <div
                    key={item._id}
                    className='h-16 bg-white border border-slate-200 rounded-2xl px-5 flex justify-between items-center group hover:border-blue-600 transition-all shadow-sm shrink-0'
                  >
                    <div className='flex items-center gap-5'>
                      <div className='w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-[12px]'>
                        {index + 1}
                      </div>
                      <div className='text-left'>
                        <h4 className='font-black text-black uppercase text-[12px] mb-0.5'>
                          {item.title}
                        </h4>
                        <p className='text-[10px] font-bold text-slate-400 uppercase'>
                          {item.date} • {item.hospital}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(item.fileUrl, '_blank')}
                      className='h-8 px-5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm'
                    >
                      Open File
                    </button>
                  </div>
                ))
              ) : (
                <div className='py-20 text-center text-slate-300 font-black uppercase tracking-widest'>
                  Vault is empty
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoctorPatientView;
