import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';
import { protectedFetch } from '../utils/api';

const HealthVault = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Prescriptions');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        activeTab === 'Prescriptions'
          ? '/api/v1/patients/prescriptions'
          : '/api/v1/patients/reports';

      const response = await protectedFetch(endpoint);

      if (response.ok) {
        const result = await response.json();
        const mappedData = result.data.map(item => {
          const rawUrl = item.prescriptionFile?.url || item.file?.url || '';

          return {
            id: item._id,
            title: item.diagnosis || item.reportName || 'Medical Record',
            hospital: item.hospitalName || 'VitaLink Partner',
            date: new Date(
              item.prescribedDate || item.createdAt,
            ).toLocaleDateString(),
            fileUrl: rawUrl,
          };
        });
        setItems(mappedData);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSelectedItem(null);
  }, [activeTab]);

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const endpoint =
        activeTab === 'Prescriptions'
          ? `/api/v1/patients/prescriptions/${id}`
          : `/api/v1/patients/reports/${id}`;

      const response = await protectedFetch(endpoint, { method: 'DELETE' });
      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
        setSelectedItem(null);
        alert('Record deleted successfully');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleShare = async item => {
    const shareData = {
      title: `Medical Record: ${item.title}`,
      text: `View my ${activeTab.toLowerCase()} for ${item.title}.`,
      url: item.fileUrl,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(item.fileUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await protectedFetch('/api/v1/patients/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      navigate('/login-patient');
    }
  };

  const filteredItems = items.filter(item =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <DashboardNav />

      <main className='grow max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col font-inter'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
          <div>
            <h2 className='text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase'>
              Health Vault
            </h2>
            <p className='text-sm font-bold text-blue-700 uppercase tracking-widest mt-0.5'>
              Secure Medical Records
            </p>
          </div>

          <div className='flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-400 shadow-sm w-full md:w-auto'>
            <span className='text-[12px] font-black text-black uppercase tracking-tighter'>
              Search
            </span>
            <input
              type='text'
              className='bg-transparent border-none outline-none text-sm font-medium w-full md:w-60'
              placeholder='Filter records...'
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className='flex flex-col md:flex-row gap-8 grow'>
          <div className='grow space-y-6'>
            <div className='flex w-fit bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner'>
              <button
                onClick={() => setActiveTab('Prescriptions')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'Prescriptions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Prescriptions
              </button>
              <button
                onClick={() => setActiveTab('Reports')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'Reports' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Medical Reports
              </button>
            </div>

            <div className='grid grid-cols-1 gap-3'>
              {isLoading ? (
                <div className='text-center py-20'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <button
                    key={item.id || index}
                    onClick={() => setSelectedItem(item)}
                    className={`group w-full text-left bg-white border rounded-2xl p-5 flex items-center justify-between transition-all ${selectedItem?.id === item.id ? 'border-blue-600 ring-4 ring-blue-50 shadow-md' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}
                  >
                    <div className='flex items-center gap-5'>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${selectedItem?.id === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <span className='block text-lg font-bold text-slate-900 truncate max-w-xs'>
                          {item.title}
                        </span>
                        <span className='text-xs text-slate-500 font-medium'>
                          {item.date}
                        </span>
                      </div>
                    </div>
                    <div className='text-slate-300 group-hover:text-blue-600'>
                      →
                    </div>
                  </button>
                ))
              ) : (
                <div className='bg-white border border-dashed border-slate-300 rounded-2xl py-20 text-center text-slate-400 text-sm font-bold uppercase'>
                  No {activeTab} Found
                </div>
              )}
            </div>
          </div>

          <aside className='md:w-85 shrink-0'>
            <div className='bg-white rounded-3xl border border-slate-200 p-6 shadow-xl sticky top-24'>
              {selectedItem ? (
                <div>
                  <div className='w-full aspect-4/3 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center border border-slate-100 overflow-hidden text-blue-600 font-black uppercase text-xl'>
                    Preview
                  </div>

                  <div className='space-y-4 mb-8'>
                    <div>
                      <p className='text-[10px] uppercase font-black tracking-widest text-slate-400'>
                        {activeTab === 'Prescriptions'
                          ? 'Doctor / Diagnosis'
                          : 'Test Name'}
                      </p>
                      <p className='font-bold text-slate-800 leading-tight'>
                        {selectedItem.title}
                      </p>
                    </div>
                    <div>
                      <p className='text-[10px] uppercase font-black tracking-widest text-slate-400'>
                        Hospital / Clinic
                      </p>
                      <p className='font-bold text-slate-800 leading-tight'>
                        {selectedItem.hospital}
                      </p>
                    </div>
                    <div>
                      <p className='text-[10px] uppercase font-black tracking-widest text-slate-400'>
                        Date Added
                      </p>
                      <p className='font-bold text-slate-800'>
                        {selectedItem.date}
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-col gap-3'>
                    <button
                      onClick={() =>
                        window.open(selectedItem.fileUrl, '_blank')
                      }
                      className='w-full bg-blue-600 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md'
                    >
                      Open File
                    </button>
                    <button
                      onClick={() => handleShare(selectedItem)}
                      className='w-full bg-white border-2 border-slate-200 text-slate-600 rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all'
                    >
                      Share Record
                    </button>
                    <button
                      onClick={() => handleDelete(selectedItem.id)}
                      className='w-full mt-4 text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors'
                    >
                      Delete Permanent
                    </button>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center min-h-80 text-center'>
                  <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
                    Select a record to preview
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className='w-full mt-6 bg-white border-2 border-red-100 text-red-700 rounded-2xl py-4 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm'
            >
              Logout
            </button>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HealthVault;
