import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { protectedFetch } from '../utils/api';

const ReceptionistBilling = () => {
  const navigate = useNavigate();

  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [currentPatient, setCurrentPatient] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [trxId, setTrxId] = useState('');
  const [amountPaidNow, setAmountPaidNow] = useState('');
  const [testCatalog, setTestCatalog] = useState([]);

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    );

    const fetchTests = async () => {
      try {
        const res = await protectedFetch(`/api/v1/receptionists/search-tests`);
        if (res.ok) {
          const result = await res.json();
          setTestCatalog(result.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTests();
  }, []);

  const calculateTotal = useMemo(
    () => billItems.reduce((acc, item) => acc + item.amount, 0),
    [billItems],
  );

  const calculateDue = useMemo(() => {
    const paid = parseFloat(amountPaidNow) || 0;
    const due = calculateTotal - paid;
    return due > 0 ? due : 0;
  }, [amountPaidNow, calculateTotal]);

  const handlePatientSearch = async e => {
    e.preventDefault();
    if (!patientIdSearch.trim()) return;
    try {
      const res = await protectedFetch(
        `/api/v1/receptionists/search-patient?upid=${patientIdSearch}`,
      );
      if (res.ok) {
        const result = await res.json();
        setCurrentPatient(result.data);
      } else {
        alert('Patient not found');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addItemToBill = testObj => {
    if (billItems.some(item => item.testId === testObj._id)) return;
    setBillItems(prev => [
      ...prev,
      {
        id: Date.now(),
        testId: testObj._id,
        itemName: testObj.name,
        unitPrice: testObj.price,
        quantity: 1,
        room: testObj.room
          ? `Floor ${testObj.room.floor} - Room ${testObj.room.roomNumber}`
          : 'General Lab',
        amount: testObj.price,
        discount: 0,
      },
    ]);
    setItemSearch('');
  };

  const updateDiscount = (id, percent) => {
    setBillItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const disc = parseFloat(percent) || 0;
          const finalPrice = item.unitPrice - item.unitPrice * (disc / 100);
          return { ...item, discount: disc, amount: finalPrice };
        }
        return item;
      }),
    );
  };

  const handleClearSession = () => {
    setPatientIdSearch('');
    setCurrentPatient(null);
    setBillItems([]);
    setTrxId('');
    setAmountPaidNow('');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login-staff', { replace: true });
  };

  const handlePaymentSubmit = async () => {
    if (!currentPatient || billItems.length === 0)
      return alert('Identify patient first.');

    const totalDisc = billItems.reduce(
      (acc, item) => acc + item.unitPrice * ((item.discount || 0) / 100),
      0,
    );

    const payload = {
      patientId: currentPatient._id,
      testItems: billItems.map(item => ({ testName: item.itemName })),
      paidAmount: parseFloat(amountPaidNow) || 0,
      paymentMethod: paymentMethod.toLowerCase(),
    };

    try {
      const res = await protectedFetch(`/api/v1/receptionists/create-invoice`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('✅ Transaction Successful');
        handleClearSession();
      } else {
        alert('Failed to save bill');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='min-h-screen bg-slate-100 flex flex-col font-inter text-slate-900 overflow-x-hidden'>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; color: #000000 !important; }
          .invoice-section { padding: 32px 40px !important; background: white !important; }
          .print-receipt-top { display: flex !important; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #000; margin-bottom: 20px; }
          .patient-card-wrap { background: #fff !important; color: #000 !important; border: 1.5px solid #000 !important; padding: 14px 18px !important; margin-bottom: 20px !important; }
          .patient-card-wrap * { color: #000 !important; }
          .ledger-wrap table, .ledger-wrap th, .ledger-wrap td { border: 1px solid #000 !important; color: #000 !important; }
          .grand-val { color: #000 !important; }
          .print-sig-row { display: flex !important; justify-content: flex-start; align-items: flex-end; padding-top: 60px; }
          .print-sig-row p, .print-sig-row div { color: #000 !important; border-color: #000 !important; }
          p, div, span, h2, h3, th, td { color: #000 !important; }
          .text-blue-600, .text-green-700, .text-red-600, .text-slate-500, .text-slate-400 { color: #000 !important; }
          .grand-val, .text-xl.font-black { color: #000 !important; }
        }
        .print-only, .print-receipt-top, .print-sig-row { display: none; }
      `}</style>

      <div className='no-print'>
        <Navbar />
      </div>

      <main className='flex flex-1 flex-row'>
        <aside className='no-print w-72 min-w-72 bg-white border-r border-slate-200 px-5 py-6 flex flex-col gap-5'>
          <div>
            <span className='text-[10px] font-black text-slate-800 uppercase tracking-widest block mb-2'>
              Patient Identity
            </span>
            <form onSubmit={handlePatientSearch} className='relative'>
              <input
                value={patientIdSearch}
                onChange={e => setPatientIdSearch(e.target.value)}
                className='w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-3.5 pr-11 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white text-slate-900'
                placeholder='PT-XXXXXX'
              />
              <button
                type='submit'
                className='absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 text-white w-7 h-7 rounded-md flex items-center justify-center text-sm border-none cursor-pointer'
              >
                →
              </button>
            </form>
          </div>

          <div className='flex flex-col gap-3'>
            <span className='text-[10px] font-black text-slate-800 uppercase tracking-widest block'>
              Catalog
            </span>
            <input
              value={itemSearch}
              onChange={e => setItemSearch(e.target.value)}
              className='w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm outline-none focus:border-blue-600 text-slate-900'
              placeholder='Search tests...'
            />
            <div className='max-h-96 overflow-y-auto border border-slate-200 rounded-lg bg-white custom-scrollbar'>
              {testCatalog
                .filter(t =>
                  t.name.toLowerCase().includes(itemSearch.toLowerCase()),
                )
                .map(test => (
                  <button
                    key={test._id}
                    onClick={() => addItemToBill(test)}
                    className='w-full px-3.5 py-2.5 flex justify-between items-center bg-transparent border-none border-b border-slate-50 last:border-b-0 cursor-pointer hover:bg-blue-50'
                  >
                    <span className='text-xs font-semibold text-slate-700'>
                      {test.name}
                    </span>
                    <span className='text-xs font-black text-blue-600'>
                      ৳{test.price}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          <div className='flex flex-col gap-2 mt-auto pt-1'>
            <button
              onClick={handleClearSession}
              className='w-full h-10 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all outline-none font-inter'
            >
              Clear Session
            </button>
            <button
              onClick={handleLogout}
              className='w-full h-10 border-2 border-slate-300 text-slate-600 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all outline-none font-inter'
            >
              LogOut
            </button>
          </div>
        </aside>

        <section className='invoice-section flex-1 px-7 py-7 bg-slate-100 flex flex-col gap-4 overflow-auto min-w-0'>
          <div className='print-receipt-top'>
            <div>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#1E293B',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                VitaLink Medical
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Laboratory Billing Receipt
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                Date
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1E293B',
                  margin: 0,
                }}
              >
                {currentDate}
              </p>
            </div>
          </div>

          <div className='patient-card-wrap bg-blue-600 rounded-xl px-7 py-6 text-white relative overflow-hidden'>
            <div className='grid grid-cols-4 gap-6 relative z-10'>
              <div>
                <div className='text-[10px] font-black text-slate-50 uppercase tracking-widest mb-1'>
                  Name
                </div>
                <div className='text-base font-black'>
                  {currentPatient?.fullName || '—'}
                </div>
              </div>
              <div>
                <div className='text-[10px] font-black text-slate-50 uppercase tracking-widest mb-1'>
                  ID
                </div>
                <div className='text-sm font-black tracking-wide'>
                  {currentPatient?.upid || '—'}
                </div>
              </div>
              <div>
                <div className='text-[10px] font-black text-slate-50 uppercase tracking-widest mb-1'>
                  Contact
                </div>
                <div className='text-base font-black'>
                  {currentPatient?.phone || '—'}
                </div>
              </div>
              <div>
                <div className='text-[10px] font-black text-slate-50 uppercase tracking-widest mb-1'>
                  Date
                </div>
                <div className='text-base font-black'>{currentDate}</div>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-200'>
                  <th className='p-4 text-[11px] font-black text-slate-800 uppercase tracking-widest text-left'>
                    Description
                  </th>
                  <th className='p-4 text-[11px] font-black text-slate-800 uppercase tracking-widest text-center'>
                    Unit
                  </th>
                  <th className='p-4 text-[11px] font-black text-slate-800 uppercase tracking-widest text-center'>
                    Disc %
                  </th>
                  <th className='p-4 text-[11px] font-black text-slate-800 uppercase tracking-widest text-right'>
                    Amount
                  </th>
                  <th className='no-print p-4 w-9'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {billItems.length > 0 ? (
                  billItems.map(item => (
                    <tr key={item.id} className='hover:bg-blue-50/30'>
                      <td className='p-4'>
                        <div className='text-sm font-semibold text-slate-800'>
                          {item.itemName}
                        </div>
                      </td>
                      <td className='p-4 text-[11px] font-medium text-slate-500 text-center uppercase'>
                        {item.room}
                      </td>
                      <td className='p-4 text-center'>
                        <input
                          type='number'
                          value={item.discount || ''}
                          onChange={e =>
                            updateDiscount(item.id, e.target.value)
                          }
                          className='no-print w-12 bg-slate-50 border border-slate-200 rounded py-1 px-1.5 text-center text-xs font-black outline-none block mx-auto'
                        />
                        <span className='print-only text-[11px]'>
                          {item.discount || 0}%
                        </span>
                      </td>
                      <td className='p-4 text-sm font-black text-slate-800 text-right'>
                        ৳ {item.amount.toLocaleString()}
                      </td>
                      <td className='no-print p-4 text-right'>
                        <button
                          onClick={() =>
                            setBillItems(
                              billItems.filter(i => i.id !== item.id),
                            )
                          }
                          className='text-slate-300 hover:text-red-500 border-none bg-transparent cursor-pointer'
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan='5'
                      className='py-14 text-center text-[10px] font-black text-slate-300 uppercase'
                    >
                      Empty List
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className='flex justify-end'>
            <div className='bg-white border border-slate-200 rounded-lg px-5 py-4 min-w-64 flex flex-col gap-2.5 shadow-sm'>
              <div className='flex justify-between items-center'>
                <span className='text-[11px] font-black text-slate-500 uppercase'>
                  Subtotal
                </span>
                <span className='text-sm font-black'>
                  ৳ {calculateTotal.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-[11px] font-black text-slate-500 uppercase'>
                  Collected
                </span>
                <span className='text-sm font-black text-green-700'>
                  ৳ {(parseFloat(amountPaidNow) || 0).toLocaleString()}
                </span>
              </div>
              {calculateDue > 0 && (
                <div className='flex justify-between items-center'>
                  <span className='text-[11px] font-black text-slate-500 uppercase'>
                    Balance
                  </span>
                  <span className='text-sm font-black text-red-600'>
                    ৳ {calculateDue.toLocaleString()}
                  </span>
                </div>
              )}
              <hr className='border-none border-t border-slate-100 my-0.5' />
              <div className='flex justify-between items-center'>
                <span className='text-xs font-black text-slate-800 uppercase'>
                  Grand Total
                </span>
                <span className='grand-val text-xl font-black text-blue-600'>
                  ৳ {calculateTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className='print-sig-row'>
            <div style={{ width: '220px', textAlign: 'center' }}>
              <div
                style={{ borderTop: '1.5px solid #1E293B', marginBottom: 6 }}
              />
              <p
                style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  margin: 0,
                }}
              >
                Authorized by Receptionist
              </p>
            </div>
          </div>

          <div className='no-print flex justify-end pt-1'>
            <button
              onClick={() => window.print()}
              className='w-full h-12 bg-[#3B82F6] hover:bg-[#1E40AF] text-white text-[11px] rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 font-inter'
            >
              Print Invoice
            </button>
          </div>
        </section>

        <aside className='no-print w-64 min-w-64 bg-white border-l border-slate-200 px-5 py-6 flex flex-col gap-4'>
          <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3.5 border-b border-slate-100'>
            Payment Terminal
          </p>
          <div className='flex flex-col gap-2'>
            <span className='text-[9px] font-black text-slate-600 uppercase'>
              Amount Paid
            </span>
            <input
              type='number'
              value={amountPaidNow}
              onChange={e => setAmountPaidNow(e.target.value)}
              className='w-full bg-slate-50 border-2 border-slate-100 rounded-lg px-3.5 py-3 text-[22px] font-black text-blue-600 outline-none focus:border-blue-600'
              placeholder='0.00'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-[9px] font-black text-slate-700 uppercase'>
              Method
            </span>
            <div className='flex flex-col gap-1.5'>
              {['Cash', 'Card', 'Online/Mobile'].map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2.5 px-3.5 rounded-lg text-[10px] font-black uppercase border cursor-pointer transition-all ${
                    paymentMethod === m
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          {paymentMethod !== 'Cash' && (
            <div className='flex flex-col gap-2'>
              <span className='text-[9px] font-black text-slate-800 uppercase tracking-tight'>
                {paymentMethod === 'Card'
                  ? 'Last 4 Digits / Ref No'
                  : 'Trx ID / App Ref'}
              </span>
              <input
                value={trxId}
                onChange={e => setTrxId(e.target.value)}
                className='w-full bg-slate-50 border border-slate-400 rounded-lg px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-600 text-slate-900'
                placeholder='REFERENCE ID'
              />
            </div>
          )}
          <button
            onClick={handlePaymentSubmit}
            disabled={!currentPatient || billItems.length === 0}
            className='mt-auto w-full py-3.5 bg-blue-600 text-white rounded-lg text-[11px] font-black uppercase border-none cursor-pointer shadow-lg disabled:opacity-40'
          >
            Post Transaction
          </button>
        </aside>
      </main>
      <div className='no-print'>
        <Footer />
      </div>
    </div>
  );
};

export default ReceptionistBilling;
