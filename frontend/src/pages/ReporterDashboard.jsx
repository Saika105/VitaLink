import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const ReporterDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
 const [reporterInfo, setReporterInfo] = useState(() => {
   try {
     const user = JSON.parse(localStorage.getItem('user') || '{}');
     return { fullName: user.fullName || '' };
   } catch {
     return { fullName: '' };
   }
 });

  const fetchDashboardData = async () => {
    try {
      const patientsRes = await protectedFetch(
        `/api/v1/lab-assistants/dashboard`,
      );
      if (patientsRes.ok) {
        const patientsResult = await patientsRes.json();
        const sorted = (patientsResult.data || [])
          .filter(p => p.hasPendingWork > 0)
          .sort((a, b) => b.paidTests - a.paidTests);
  setPatients(sorted);      }
    } catch (err) {
      console.error('Dashboard Sync Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await protectedFetch('/api/v1/lab-assistants/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      localStorage.clear();
      navigate('/login-staff', { replace: true });
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <main className='grow max-w-7xl mx-auto w-full p-4 md:p-10 flex flex-col'>
        <div className='flex flex-col md:flex-row justify-between items-center mb-10 gap-6'>
          <div>
            <h2 className='text-3xl font-black text-slate-900 uppercase tracking-tight'>
              Report Submission List
            </h2>
            <p className='text-sm font-bold text-blue-600 uppercase tracking-widest mt-1'>
              Diagnostic Management Portal
            </p>
          </div>
          <div className='bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-right'>
            <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-40'>
              Logged In As
            </p>
            <p className='text-xs font-black text-slate-900 uppercase'>
              {reporterInfo.fullName || 'Diagnostic Reporter'}
            </p>
          </div>
        </div>

        <div className='bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-200 text-[12px] font-black uppercase tracking-widest'>
                  <th className='p-6'>Patient ID</th>
                  <th className='p-6'>Patient Name</th>
                  <th className='p-6 text-center'>Total Tests</th>
                  <th className='p-6 text-center text-green-600'>
                    Paid / Valid
                  </th>
                  <th className='p-6 text-center text-red-500'>
                    Pending / Due
                  </th>
                  <th className='p-6 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {isLoading && patients.length === 0 ? (
                  <tr>
                    <td colSpan='6' className='p-20 text-center'>
                      <div className='flex justify-center items-center gap-3'>
                        <div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-xs font-black uppercase tracking-widest text-slate-400'>
                          Syncing Central Records...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : patients.length > 0 ? (
                  patients.map(p => (
                    <tr
                      key={p._id}
                      className='hover:bg-blue-50/20 transition-all group'
                    >
                      <td className='p-6 font-black text-blue-600'>{p.upid}</td>
                      <td className='p-6 font-black text-slate-900 uppercase'>
                        {p.fullName}
                      </td>
                      <td className='p-6 text-center font-bold text-slate-700'>
                        {p.totalTests}
                      </td>
                      <td className='p-6 text-center font-black text-green-600'>
                        {p.paidTests}
                      </td>
                      <td className='p-6 text-center font-black text-red-500'>
                        {p.dueTests}
                      </td>
                      <td className='p-6 text-right'>
                        <button
                          onClick={() =>
                            navigate(`/reporter/manage-reports/${p._id}`, {
                              state: { patient: p },
                            })
                          }
                          className='bg-blue-500 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-md active:scale-95'
                        >
                          View Vault
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='6' className='p-32 text-center'>
                      <p className='text-[10px] font-black uppercase tracking-[0.3em] text-slate-400'>
                        No patients requiring reports found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='flex justify-end mt-12'>
          <button
            onClick={handleLogout}
            className='w-48 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95 outline-none'
          >
            LogOut
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReporterDashboard;
