import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DoctorNavbar from '../components/DoctorNavbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const DoctorPatientView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('Prescriptions');
  const [items, setItems] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState({
    fullName: '',
    profilePhoto: { url: '' },
  });
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

    const fetchPatientDetails = async () => {
      try {
        const response = await protectedFetch(
          `${import.meta.env.VITE_API_URL}/api/v1/doctors/patient/${id}`,
        );
        if (response.ok) {
          const result = await response.json();
          setPatientData(result.data);
        } else {
          setPatientData({ fullName: 'Patient Not Found', age: '--' });
        }
      } catch (err) {
        setPatientData({ fullName: 'Error Loading', age: '--' });
      }
    };

    fetchDoctorProfile();
    fetchPatientDetails();
  }, [id]);

  useEffect(() => {
    if (!patientData || patientData.fullName === 'Patient Not Found') return;

    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const endpoint =
          activeTab === 'Prescriptions'
            ? `${import.meta.env.VITE_API_URL}/api/v1/doctors/patient/${id}/prescriptions`
            : `${import.meta.env.VITE_API_URL}/api/v1/doctors/patient/${id}/reports`;

        const response = await protectedFetch(endpoint);
        if (response.ok) {
          const result = await response.json();
          const mappedData = result.data.map(item => ({
            _id: item._id,
            title: (
              item.diagnosis ||
              item.reportName ||
              item.title ||
              'Medical Record'
            ).toUpperCase(),
            hospital: (
              item.hospital?.name ||
              item.hospitalName ||
              'VitaLink Partner'
            ).toUpperCase(),
            date: new Date(item.prescribedDate || item.createdAt || item.date)
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              .toUpperCase(),
            fileUrl:
              item.prescriptionFile?.url ||
              item.file?.url ||
              item.fileUrl ||
              item.file ||
              '',
          }));
          setItems(mappedData);
        }
      } catch (err) {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [activeTab, id, patientData]);

  if (!patientData) {
    return (
      <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter items-center justify-center'>
        <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4'></div>
        <p className='text-[12px] font-black uppercase tracking-[0.2em] text-black'>
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
          <aside className='w-full md:w-85 bg-slate-50 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-200'>
            <div className='flex flex-col items-center text-center mb-8'>
              <div className='w-32 h-32 bg-white rounded-4xl shadow-sm border border-slate-200 mb-5 overflow-hidden flex items-center justify-center p-1'>
                <img
                  src={
                    patientData.profilePhoto ||
                    `https://ui-avatars.com/api/?name=${patientData.fullName}&background=F1F5F9&color=3B82F6`
                  }
                  alt={patientData.fullName}
                  className='w-full h-full object-cover rounded-[1.8rem]'
                />
              </div>
              <h3 className='text-lg font-black text-black uppercase tracking-tight'>
                {patientData.fullName}
              </h3>
              <p className='text-[12px] font-black text-blue-600 mt-1 uppercase tracking-widest'>
                {patientData.upid}
              </p>
            </div>

            <div className='grid grid-cols-3 gap-2 w-full mb-8'>
              <div className='bg-white border border-slate-200 rounded-2xl p-3 text-center'>
                <p className='text-[10px] font-black uppercase'>Age</p>
                <p className='text-sm font-black'>{patientData.age || '--'}</p>
              </div>
              <div className='bg-white border border-slate-200 rounded-2xl p-3 text-center'>
                <p className='text-[10px] font-black uppercase'>Gender</p>
                <p className='text-sm font-black capitalize'>
                  {patientData.gender}
                </p>
              </div>
              <div className='bg-white border border-slate-200 rounded-2xl p-3 text-center'>
                <p className='text-[10px] font-black uppercase'>Blood</p>
                <p className='text-sm font-black text-red-600'>
                  {patientData.bloodGroup}
                </p>
              </div>
            </div>

            <div className='w-full space-y-4'>
              <div>
                <p className='text-[12px] font-black uppercase mb-1 ml-1 text-left'>
                  Email Address
                </p>
                <div className='bg-white border border-slate-200 rounded-xl px-4 py-2 text-[12px] font-bold truncate text-left'>
                  {patientData.email}
                </div>
              </div>
              <div>
                <p className='text-[12px] font-black uppercase mb-1 ml-1 text-left'>
                  Phone Number
                </p>
                <div className='bg-white border border-slate-200 rounded-xl px-4 py-2 text-[12px] font-black text-left'>
                  {patientData.phone}
                </div>
              </div>
              <div>
                <p className='text-[12px] font-black text-red-500 uppercase mb-1 ml-1 text-left'>
                  Emergency
                </p>
                <div className='bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-[12px] font-black text-red-600 text-left'>
                  {patientData.emergencyContact || 'NOT PROVIDED'}
                </div>
              </div>
              <div>
                <p className='text-[12px] font-black uppercase mb-1 ml-1 text-left'>
                  Resident Address
                </p>
                <div className='bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] font-bold text-left leading-relaxed'>
                  {patientData.address || 'NOT PROVIDED'}
                </div>
              </div>
            </div>
          </aside>

          <section className='grow p-8 md:p-10 flex flex-col bg-white'>
            <div className='flex flex-col md:flex-row justify-between items-start mb-10 gap-6'>
              <div>
                <h2 className='text-3xl font-black text-black tracking-tight uppercase leading-none'>
                  Clinical History
                </h2>
                <p className='text-[12px] font-bold text-blue-700 uppercase tracking-widest mt-2'>
                  Authenticated Vault
                </p>
              </div>

              <div className='flex flex-col gap-2'>
                <button
                  onClick={() =>
                    navigate(`/doctor/create-prescription/${id}`, {
                      state: { patient: patientData },
                    })
                  }
                  className='w-54 h-12 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] rounded-xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-[0.98]'
                >
                  Create Digital RX
                </button>
                <button
                  onClick={() => navigate('/doctor-dashboard')}
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
                    key={item._id || index}
                    className='h-16 bg-white border border-slate-200 rounded-2xl px-5 flex justify-between items-center group hover:border-blue-600 transition-all shadow-sm shrink-0'
                  >
                    <div className='flex items-center gap-5'>
                      <div className='w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-[12px] text-black group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0'>
                        {index + 1}
                      </div>
                      <div className='text-left'>
                        <h4 className='font-black text-black uppercase text-[12px] tracking-tight leading-tight mb-0.5'>
                          {item.title}
                        </h4>
                        <p className='text-[11px] font-bold text-black opacity-50 uppercase tracking-wider leading-none'>
                          {item.date} • {item.hospital}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(item.fileUrl, '_blank')}
                      className='h-8 px-5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center'
                    >
                      Open File
                    </button>
                  </div>
                ))
              ) : (
                <div className='flex flex-col items-center justify-center py-20 opacity-40 text-center'>
                  <p className='text-[12px] font-black uppercase tracking-widest text-black'>
                    Vault is empty
                  </p>
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
