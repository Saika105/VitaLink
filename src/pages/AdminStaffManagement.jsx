import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminStaffManagement = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeTableTab, setActiveTableTab] = useState('doctor');
  const [staffList, setStaffList] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [formData, setFormData] = useState({
    role: 'doctor',
    upid: '',
    name: '',
    nid: '',
    dateOfBirth: '',
    phone: '',
    gender: 'male',
    address: '',
    licenseNumber: '',
    specialization: '',
    emergencyContact: '',
    hospitalName: '',
    sittingTime: '',
    sittingDays: [],
    email: '',
    password: '',
    assignedDoctorId: '',
    labDepartment: '',
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/admin/staff?role=${activeTableTab}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) setStaffList(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStaff();
  }, [activeTableTab, apiUrl]);

  useEffect(() => {
    if (showModal) {
      const fetchDocs = async () => {
        try {
          const response = await fetch(`${apiUrl}/admin/doctors-list`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const data = await response.json();
          if (response.ok) setDoctors(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchDocs();
    }
  }, [showModal, apiUrl]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDayToggle = day => {
    const currentDays = [...formData.sittingDays];
    const index = currentDays.indexOf(day);
    if (index > -1) currentDays.splice(index, 1);
    else currentDays.push(day);
    setFormData({ ...formData, sittingDays: currentDays });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/admin/create-staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Staff Added Successfully!');
        setShowModal(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='min-h-screen bg-[#F0F7FF] flex flex-col font-inter text-slate-800'>
      <Navbar />

      <main className='flex-grow p-6 md:p-10 max-w-[1600px] mx-auto w-full space-y-8'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          <div>
            <h2 className='text-4xl font-black text-slate-900 uppercase tracking-tighter'>
              Staff Directory
            </h2>
            <p className='text-slate-500 font-medium italic'>
              Manage hospital personnel records
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className='bg-[#4486F6] text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-600 transition-all uppercase text-xs tracking-widest active:scale-95'
          >
            + Add New Member
          </button>
        </div>

        <div className='flex items-center gap-4 bg-white w-fit p-2 rounded-2xl border border-slate-200 shadow-sm'>
          <span className='pl-4 text-[10px] uppercase font-black text-slate-400 tracking-widest'>
            Showing:
          </span>
          <select
            value={activeTableTab}
            onChange={e => setActiveTableTab(e.target.value)}
            className='bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-[#4486F6] outline-none cursor-pointer uppercase text-xs'
          >
            <option value='doctor'>Doctors</option>
            <option value='assistant'>Assistants</option>
            <option value='lab'>Lab Diagnostic</option>
            <option value='receptionist'>Receptionists</option>
          </select>
        </div>

        <div className='bg-white rounded-[2.5rem] shadow-2xl overflow-x-auto border border-slate-200'>
          <table className='w-full text-left border-collapse min-w-[1100px]'>
            <thead>
              <tr className='bg-slate-50 border-b border-slate-100'>
                <th className='p-6 text-[10px] uppercase font-black text-slate-400 tracking-widest'>
                  Identity
                </th>
                <th className='p-6 text-[10px] uppercase font-black text-slate-400 tracking-widest'>
                  Personal & Contact
                </th>
                <th className='p-6 text-[10px] uppercase font-black text-slate-400 tracking-widest'>
                  Address & SOS
                </th>
                <th className='p-6 text-[10px] uppercase font-black text-slate-400 tracking-widest'>
                  Role Specifics
                </th>
                <th className='p-6 text-[10px] uppercase font-black text-slate-400 tracking-widest text-center'>
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50'>
              {staffList.length > 0 ? (
                staffList.map(staff => (
                  <tr
                    key={staff.upid}
                    className='hover:bg-blue-50/30 transition-colors group'
                  >
                    <td className='p-6'>
                      <div className='font-bold text-slate-800'>
                        {staff.name}
                      </div>
                      <div className='text-[10px] text-[#4486F6] font-mono font-bold uppercase'>
                        {staff.upid}
                      </div>
                    </td>
                    <td className='p-6'>
                      <div className='text-xs font-bold text-slate-600'>
                        NID: {staff.nid}
                      </div>
                      <div className='text-[10px] text-slate-400'>
                        {staff.phone} | {staff.gender}
                      </div>
                      <div className='text-[10px] text-slate-400 italic'>
                        {staff.email}
                      </div>
                    </td>
                    <td className='p-6'>
                      <div
                        className='text-[10px] text-slate-500 truncate w-56'
                        title={staff.address}
                      >
                        {staff.address}
                      </div>
                      <div className='text-[9px] font-black text-red-400 uppercase mt-1'>
                        SOS: {staff.emergencyContact}
                      </div>
                    </td>
                    <td className='p-6'>
                      {activeTableTab === 'doctor' && (
                        <>
                          <div className='text-xs font-bold text-[#4486F6]'>
                            {staff.specialization}
                          </div>
                          <div className='text-[10px] text-slate-400'>
                            {staff.hospitalName} | {staff.sittingTime}
                          </div>
                        </>
                      )}
                      {activeTableTab === 'assistant' && (
                        <div className='text-xs font-bold text-slate-600 italic'>
                          Dr. ID: {staff.assignedDoctorId}
                        </div>
                      )}
                      {activeTableTab === 'lab' && (
                        <span className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase'>
                          {staff.labDepartment}
                        </span>
                      )}
                      {activeTableTab === 'receptionist' && (
                        <span className='text-[10px] font-bold text-green-500 uppercase tracking-widest'>
                          Active Access
                        </span>
                      )}
                    </td>
                    <td className='p-6'>
                      <div className='flex justify-center gap-3'>
                        <button className='bg-blue-50 text-[#4486F6] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-[#4486F6] hover:text-white transition-all'>
                          Edit
                        </button>
                        <button className='bg-red-50 text-red-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-red-400 hover:text-white transition-all'>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan='5'
                    className='p-20 text-center text-slate-300 italic font-medium'
                  >
                    No records found for this role.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'>
              <div className='p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center'>
                <div>
                  <h3 className='text-2xl font-bold text-slate-800 uppercase tracking-tight'>
                    Onboard New Staff
                  </h3>
                  <p className='text-xs font-bold text-[#4486F6] uppercase tracking-widest mt-1'>
                    Select role and enter details
                  </p>
                </div>
                <select
                  name='role'
                  value={formData.role}
                  onChange={handleInputChange}
                  className='bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-600 text-sm outline-none focus:ring-2 ring-blue-500'
                >
                  <option value='doctor'>Doctor</option>
                  <option value='assistant'>Doctor's Assistant</option>
                  <option value='lab'>Lab Diagnostic Member</option>
                  <option value='receptionist'>Receptionist</option>
                </select>
              </div>

              <form
                onSubmit={handleSubmit}
                className='p-8 overflow-y-auto space-y-8'
              >
                <div className='bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4'>
                  <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest'>
                    System Access
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-1'>
                      <label className='text-[10px] uppercase font-black text-slate-400 ml-1'>
                        Unique Staff ID (UPID)
                      </label>
                      <input
                        name='upid'
                        onChange={handleInputChange}
                        placeholder='e.g. STF-2026-001'
                        className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#4486F6] transition-all font-mono'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[10px] uppercase font-black text-slate-400 ml-1'>
                        Account Password
                      </label>
                      <input
                        type='password'
                        name='password'
                        onChange={handleInputChange}
                        className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#4486F6] transition-all'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className='bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6'>
                    <div className='space-y-1'>
                      <label className='text-sm font-bold text-slate-700'>
                        Full Name:
                      </label>
                      <input
                        name='name'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-sm font-bold text-slate-700'>
                        NID Number:
                      </label>
                      <input
                        name='nid'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-sm font-bold text-slate-700'>
                        Date of Birth:
                      </label>
                      <input
                        type='date'
                        name='dateOfBirth'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-sm font-bold text-slate-700'>
                        Phone Number:
                      </label>
                      <input
                        name='phone'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-sm font-bold text-slate-700'>
                        Gender:
                      </label>
                      <select
                        name='gender'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                      >
                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                      </select>
                    </div>
                    <div className='space-y-1'>
                      <label className='text-sm font-bold text-slate-700'>
                        Address:
                      </label>
                      <input
                        name='address'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-sm font-bold text-slate-700'>
                        License (Docs only):
                      </label>
                      <input
                        name='licenseNumber'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                        disabled={formData.role !== 'doctor'}
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-sm font-bold text-slate-700'>
                        Emergency SOS:
                      </label>
                      <input
                        name='emergencyContact'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                        required
                      />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label className='text-sm font-bold text-slate-700'>
                      System Email (Username):
                    </label>
                    <input
                      type='email'
                      name='email'
                      onChange={handleInputChange}
                      className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                      required
                    />
                  </div>
                </div>

                {formData.role === 'doctor' && (
                  <div className='bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6'>
                    <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest'>
                      Hospital Availability & Specialization
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                      <div className='space-y-4'>
                        <input
                          name='specialization'
                          placeholder='Specialized In (e.g. Cardiologist)'
                          onChange={handleInputChange}
                          className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 bg-white'
                        />
                        <input
                          name='hospitalName'
                          placeholder='Hospital Name'
                          onChange={handleInputChange}
                          className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 bg-white'
                        />
                        <input
                          name='sittingTime'
                          placeholder='Sitting Time (e.g. 5-9 PM)'
                          onChange={handleInputChange}
                          className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 bg-white'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-[10px] uppercase font-black text-slate-400 ml-1'>
                          Available Days
                        </label>
                        <div className='flex flex-wrap gap-2'>
                          {[
                            'Sat',
                            'Sun',
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                          ].map(day => (
                            <button
                              key={day}
                              type='button'
                              onClick={() => handleDayToggle(day)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${formData.sittingDays.includes(day) ? 'bg-[#4486F6] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300'}`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formData.role === 'assistant' && (
                  <div className='bg-slate-50 p-6 rounded-3xl border border-slate-200'>
                    <label className='text-[10px] uppercase font-black text-slate-400 ml-1'>
                      Assign to Doctor
                    </label>
                    <select
                      name='assignedDoctorId'
                      onChange={handleInputChange}
                      className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 font-bold text-slate-700 bg-white'
                      required
                    >
                      <option value=''>Select Doctor...</option>
                      {doctors.map(doc => (
                        <option key={doc._id} value={doc._id}>
                          {doc.name} - {doc.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.role === 'lab' && (
                  <div className='bg-slate-50 p-6 rounded-3xl border border-slate-200'>
                    <label className='text-[10px] uppercase font-black text-slate-400 ml-1'>
                      Lab Department
                    </label>
                    <select
                      name='labDepartment'
                      onChange={handleInputChange}
                      className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 font-bold text-slate-700 bg-white'
                      required
                    >
                      <option value=''>Select Department...</option>
                      <option value='Pathology'>Pathology</option>
                      <option value='Radiology'>Radiology</option>
                      <option value='Hematology'>Hematology</option>
                    </select>
                  </div>
                )}

                <div className='flex flex-col items-center gap-4 pt-4 bottom-0 bg-white'>
                  <button
                    type='submit'
                    className='w-full max-md bg-[#4486F6] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-600 transition-all uppercase text-sm tracking-widest active:scale-95'
                  >
                    SignUp
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
                    className='text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600'
                  >
                    Close Window
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminStaffManagement;
