import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardNav from '../components/DashboardNav';
import { protectedFetch } from '../utils/api';

const PatientBilling = () => {
  const navigate = useNavigate();
  const [billingHistory, setBillingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const response = await protectedFetch('/api/v1/patients/billing');

        if (response.ok) {
          const result = await response.json();
          const billingData = result.data || [];
          const mappedData = billingData.map(bill => ({
            invoiceNumber: bill.invoiceNumber,
            status:
              bill.paymentStatus === 'paid'
                ? 'Paid'
                : bill.paymentStatus === 'partially_paid'
                  ? 'Partial'
                  : 'Due',
            hospitalName:
              bill.hospital?.fullName ||
              bill.manualHospitalName ||
              'VitaLink Partner',
            date: new Date(
              bill.invoiceDate || bill.createdAt,
            ).toLocaleDateString(),
            reason: bill.billSummary || 'Medical Services',
            totalAmount: bill.totalAmount,
            balanceDue: bill.balanceDue,
            mongoId: bill._id,
          }));
          setBillingHistory(mappedData);
        }
      } catch (err) {
        console.error('Failed to connect to billing server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBilling();
  }, []);

  const handlePayDue = (invoiceNumber, amount) => {
    alert(`Redirecting to payment gateway for Invoice: ${invoiceNumber}`);
  };

  const handleLogout = async () => {
    try {
      await protectedFetch('/api/v1/patients/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      navigate('/login-patient');
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-800'>
      <Navbar />
      <DashboardNav />

      <main className='grow max-w-7xl mx-auto w-full p-4 md:p-10 flex flex-col font-inter'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 font-inter'>
          <div>
            <p className='text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.25em] mb-1 font-inter'>
              Financial Summary
            </p>
            <h2 className='text-3xl font-black text-slate-900 uppercase tracking-tighter font-inter'>
              Billing History
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center p-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-inter'>
            {billingHistory.map(bill => (
              <div
                key={bill.invoiceNumber}
                className='bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 flex flex-col justify-between transition-all hover:shadow-blue-100 font-inter'
              >
                <div>
                  <div className='flex justify-between items-start mb-6 font-inter'>
                    <span className='text-sm text-[#3B82F6] font-bold font-inter'>
                      {bill.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl font-inter ${
                        bill.status === 'Paid'
                          ? 'bg-green-100 text-green-700'
                          : bill.status === 'Partial'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>

                  <h3 className='text-lg font-bold text-slate-900 uppercase leading-tight font-inter'>
                    {bill.hospitalName}
                  </h3>
                  <p className='text-[10px] font-black text-slate-700 mt-2 uppercase tracking-widest font-inter'>
                    {bill.date}
                  </p>

                  <div className='mt-6 font-inter'>
                    <p className='text-[10px] font-black text-[#3B82F6] uppercase tracking-[0.25em] mb-1 font-inter'>
                      Details
                    </p>
                    <p className='text-sm font-bold text-slate-700 font-inter'>
                      {bill.reason}
                    </p>
                  </div>

                  <div className='mt-6 space-y-4 border-t border-slate-50 pt-6 font-inter'>
                    <div className='flex justify-between items-center font-inter'>
                      <p className='text-[10px] font-black text-slate-700 uppercase tracking-widest font-inter'>
                        Total
                      </p>
                      <p className='text-sm font-black text-slate-900 font-inter'>
                        ৳ {bill.totalAmount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='mt-8 font-inter'>
                  {bill.balanceDue > 0 ? (
                    <div className='bg-red-50 rounded-2xl p-5 border border-red-100 text-center font-inter'>
                      <div className='flex justify-between items-center mb-4 font-inter'>
                        <p className='text-[10px] font-black text-red-400 uppercase tracking-widest font-inter'>
                          Due
                        </p>
                        <p className='text-lg font-black text-red-600 font-inter'>
                          ৳ {bill.balanceDue}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handlePayDue(bill.invoiceNumber, bill.balanceDue)
                        }
                        className='w-full bg-[#3B82F6] hover:bg-[#1E40AF] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-[10px] font-inter'
                      >
                        Pay Now
                      </button>
                    </div>
                  ) : (
                    <div className='bg-slate-50 rounded-2xl p-5 text-center border border-slate-300 font-inter'>
                      <p className='text-[10px] font-black text-slate-800 uppercase tracking-widest font-inter'>
                        Settled
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && billingHistory.length === 0 && (
          <div className='p-32 text-center text-slate-600 uppercase font-black text-[12px] tracking-[0.3em] border-2 border-dashed border-slate-200 rounded-4xl font-inter'>
            No Records Found
          </div>
        )}

        <div className='flex justify-end mt-12 font-inter'>
          <button
            onClick={handleLogout}
            className='w-48 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all focus:ring-2 focus:ring-red-500 outline-none font-inter'
          >
            LogOut
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PatientBilling;
