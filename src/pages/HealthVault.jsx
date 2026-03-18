import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';

const HealthVault = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Prescriptions');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const endpoint =
          activeTab === 'Prescriptions'
            ? '/records/prescriptions'
            : '/records/reports';

        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Map backend model to UI structure
          const mappedData = data.map(item => ({
            id: item._id,
            title: item.diagnosis || item.reportName || 'Medical Record',
            date: new Date(
              item.prescribedDate || item.createdAt,
            ).toLocaleDateString(),
            hospital: item.hospital?.fullName || 'General Hospital',
            fileUrl: item.prescriptionFile?.url || item.file?.url || null,
          }));
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

    fetchData();
    setSelectedItem(null);
  }, [activeTab, apiUrl]);

  const filteredItems = items.filter(item =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleViewFile = () => {
    if (selectedItem?.fileUrl) {
      window.open(selectedItem.fileUrl, '_blank');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login-patient');
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />
      <DashboardNav />

      <main className='grow max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col font-inter'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 font-inter'>
          <div className='font-inter'>
            <h2 className='text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase font-inter'>
              Health Vault
            </h2>
            <p className='text-sm font-bold text-blue-700 uppercase tracking-widest mt-0.5 font-inter'>
              Secure Medical Records
            </p>
          </div>

          <div className='flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-400 shadow-sm w-full md:w-auto font-inter'>
            <span className='text-[12px] font-black text-black uppercase tracking-tighter font-inter'>
              Search
            </span>
            <input
              type='text'
              className='bg-transparent border-none outline-none text-sm font-medium w-full md:w-60 font-inter'
              placeholder='Filter records...'
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className='flex flex-col md:flex-row gap-8 grow font-inter'>
          <div className='grow space-y-6 font-inter'>
            <div className='flex w-fit bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner font-inter'>
              <button
                onClick={() => setActiveTab('Prescriptions')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all font-inter ${activeTab === 'Prescriptions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Prescriptions
              </button>
              <button
                onClick={() => setActiveTab('Reports')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all font-inter ${activeTab === 'Reports' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Medical Reports
              </button>
            </div>

            <div className='grid grid-cols-1 gap-3 font-inter'>
              {isLoading ? (
                <div className='text-center py-20 font-inter'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                  <p className='text-slate-400 text-sm font-bold uppercase tracking-widest'>
                    Loading Records...
                  </p>
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <button
                    key={item.id || index}
                    onClick={() => setSelectedItem(item)}
                    className={`group w-full text-left bg-white border rounded-2xl p-5 flex items-center justify-between transition-all font-inter ${selectedItem?.id === item.id ? 'border-blue-600 ring-4 ring-blue-50 shadow-md' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}
                  >
                    <div className='flex items-center gap-5 font-inter'>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs font-inter ${selectedItem?.id === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                      >
                        {index + 1}
                      </div>
                      <div className='font-inter'>
                        <span className='block text-lg font-bold text-slate-900 font-inter'>
                          {item.title}
                        </span>
                        <span className='text-xs text-slate-500 font-medium font-inter'>
                          {item.date}
                        </span>
                      </div>
                    </div>
                    <div className='text-slate-300 group-hover:text-blue-600 font-inter'>
                      →
                    </div>
                  </button>
                ))
              ) : (
                <div className='bg-white border border-dashed border-slate-300 rounded-2xl py-20 text-center font-inter'>
                  <p className='text-slate-400 text-sm font-bold uppercase tracking-widest'>
                    No {activeTab} Found
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className='md:w-85 shrink-0 font-inter'>
            <div className='bg-white rounded-3xl border border-slate-200 p-6 shadow-xl sticky top-24 font-inter'>
              {selectedItem ? (
                <div className='font-inter'>
                  <div className='w-full aspect-4/3 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center border border-slate-100 overflow-hidden font-inter'>
                    <svg
                      className='w-16 h-16 text-blue-600/20'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M4 4a2 2 0 012-2h4.586A1 1 0 0112 2.586L15.414 6A1 1 0 0116 6.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z' />
                    </svg>
                  </div>

                  <div className='space-y-4 mb-8 font-inter'>
                    <div className='font-inter'>
                      <p className='text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 font-inter'>
                        Source
                      </p>
                      <p className='font-bold text-slate-800 leading-tight font-inter'>
                        {selectedItem.hospital}
                      </p>
                    </div>
                    <div className='font-inter'>
                      <p className='text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 font-inter'>
                        Date Issued
                      </p>
                      <p className='font-bold text-slate-800 font-inter'>
                        {selectedItem.date}
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-col gap-3 font-inter'>
                    <button
                      onClick={handleViewFile}
                      className='w-full bg-blue-600 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md font-inter'
                    >
                      View Full File
                    </button>
                    <button className='w-full bg-white border-2 border-slate-200 text-slate-600 rounded-xl py-3 text-xs font-black uppercase tracking-widest font-inter'>
                      Share Record
                    </button>
                    <button className='w-full mt-4 text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors font-inter'>
                      Delete Record
                    </button>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center min-h-87.5 text-center font-inter'>
                  <div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 font-inter'>
                    !
                  </div>
                  <p className='text-xs font-bold text-slate-400 uppercase tracking-widest font-inter'>
                    Select a record
                    <br />
                    to preview details
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className='w-full mt-6 bg-white border-2 border-red-200 text-red-700 rounded-2xl py-4 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all focus:ring-2 focus:ring-red-500 shadow-sm font-inter'
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
