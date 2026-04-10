import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminStaffManagement = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeTableTab, setActiveTableTab] = useState('DOCTORS');
  const [staffList, setStaffList] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    role: 'DOCTORS',
    upid: '',
    name: '',
    nid: '',
    dateOfBirth: '',
    phone: '',
    gender: 'male',
    address: '',
    licenseNumber: '',
    specialization: '',
    consultationFee: '',
    emergencyContact: '',
    hospitalName: '',
    sittingTime: '',
    sittingDays: [],
    email: '',
    password: '',
    assignedDoctorId: '',
    photo: null,
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      navigate('/login-admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('refreshToken');
    navigate('/login-admin');
  };

  useEffect(() => {
    const fetchStaff = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(
          `${apiUrl}/api/v1/admins/staff?role=${activeTableTab}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const result = await response.json();
        if (response.ok) {
          setStaffList(result.data || []);
        } else if (response.status === 401) {
          handleLogout();
        }
      } catch (err) {
        console.error('Fetch Staff Error:', err);
      }
    };
    fetchStaff();
  }, [activeTableTab, apiUrl]);

  useEffect(() => {
    if (showModal) {
      const fetchDocs = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(
            `${apiUrl}/api/v1/admins/staff?role=DOCTORS`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const result = await response.json();
          if (response.ok) setDoctors(result.data || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchDocs();
    }
  }, [showModal, apiUrl]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleDayToggle = day => {
    setFormData(prev => {
      const currentDays = [...prev.sittingDays];
      const index = currentDays.indexOf(day);
      if (index > -1) currentDays.splice(index, 1);
      else currentDays.push(day);
      return { ...prev, sittingDays: currentDays };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const routeMap = {
      DOCTORS: '/api/v1/admins/register-doctor',
      ASSISTANTS: '/api/v1/admins/register-assistant',
      'LAB STAFF': '/api/v1/admins/register-lab-assistant',
      RECEPTIONIST: '/api/v1/admins/register-receptionist',
    };

    const targetRoute = routeMap[formData.role];

    try {
      const dataToSend = new FormData();
      dataToSend.append('fullName', formData.name);
      dataToSend.append('nidNumber', formData.nid);
      dataToSend.append('dateOfBirth', formData.dateOfBirth);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('gender', formData.gender);
      dataToSend.append('address', formData.address);
      dataToSend.append('email', formData.email);
      dataToSend.append('password', formData.password);
      dataToSend.append('emergencyPhone', formData.emergencyContact);

      if (formData.role === 'DOCTORS') {
        dataToSend.append('licenseNumber', formData.licenseNumber);
        dataToSend.append('specialization', formData.specialization);
        dataToSend.append('consultationFee', formData.consultationFee);
        dataToSend.append('sittingTimeLabel', formData.sittingTime);
        dataToSend.append('workingDays', JSON.stringify(formData.sittingDays));
        dataToSend.append('timeSlots', JSON.stringify([]));
        if (formData.photo) {
          dataToSend.append('profilePhoto', formData.photo);
        }
      }

      if (formData.role === 'ASSISTANTS') {
        dataToSend.append('doctor', formData.assignedDoctorId);
      }

      const response = await fetch(`${apiUrl}${targetRoute}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Staff Added Successfully!');
        setShowModal(false);
        setImagePreview(null);
        setActiveTableTab(formData.role);
      } else {
        alert(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during registration');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to remove this staff member?'))
      return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${apiUrl}/api/v1/admins/staff/${id}?role=${activeTableTab}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setStaffList(prev => prev.filter(item => item._id !== id));
        alert('Staff removed successfully!');
      } else {
        const result = await response.json();
        alert(result.message || 'Error deleting staff');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='min-h-screen bg-[#F0F7FF] flex flex-col text-slate-800 font-inter'>
      <Navbar />
      <main className='grow p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 font-inter'>
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
            className='bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-[#4486F6] transition-all uppercase text-xs tracking-widest active:scale-95'
          >
            + Add New Member
          </button>
        </div>

        <div className='flex items-center gap-4 bg-white w-fit p-2 rounded-2xl border border-slate-200 shadow-sm'>
          <span className='pl-4 text-[10px] uppercase font-black text-slate-800 tracking-widest'>
            Identity Filter:
          </span>
          <div className='flex gap-2 p-1'>
            {['DOCTORS', 'ASSISTANTS', 'LAB STAFF', 'RECEPTIONIST'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTableTab(tab)}
                className={`px-4 py-2 rounded-xl font-bold uppercase text-xs transition-all ${
                  activeTableTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-[2.5rem] shadow-2xl overflow-x-auto border border-slate-200'>
          <table className='w-full text-left border-collapse min-w-full'>
            <thead>
              <tr className='bg-slate-50 border-b border-slate-100'>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest'>
                  Identity
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest'>
                  Personal & Contact
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest'>
                  Address & Emergency
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest'>
                  Role Specifics
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest text-center'>
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50'>
              {staffList.length > 0 ? (
                staffList.map(staff => (
                  <tr
                    key={staff._id}
                    className='hover:bg-blue-50/30 transition-colors group'
                  >
                    <td className='p-6'>
                      <div className='flex items-center gap-3'>
                        {activeTableTab === 'DOCTORS' && (
                          <img
                            src={
                              staff.profilePhoto?.url ||
                              'https://via.placeholder.com/150'
                            }
                            className='w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm'
                            alt='profile'
                          />
                        )}
                        <div>
                          <div className='font-bold text-slate-800 uppercase'>
                            {staff.fullName}
                          </div>
                          <div className='text-[10px] text-[#4486F6] font-bold'>
                            {staff.doctorId ||
                              staff.assistantId ||
                              staff.labAssistantId ||
                              staff.receptionistId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='p-6'>
                      <div className='text-xs font-bold text-slate-600'>
                        NID: {staff.nidNumber}
                      </div>
                      <div className='text-[10px] text-slate-800'>
                        {staff.phone} | {staff.gender}
                      </div>
                      <div className='text-[10px] text-slate-800 italic'>
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
                        SOS:{' '}
                        {staff.emergencyContact?.phone ||
                          staff.emergencyPhone ||
                          'N/A'}
                      </div>
                    </td>
                    <td className='p-6'>
                      {activeTableTab === 'DOCTORS' && (
                        <div>
                          <div className='text-xs font-bold text-[#4486F6] uppercase'>
                            {staff.specialization}
                          </div>
                          <div className='text-[10px] font-black text-green-600 mt-1 uppercase'>
                            {staff.sittingTimeLabel}
                          </div>
                        </div>
                      )}
                      {activeTableTab === 'ASSISTANTS' && (
                        <div className='text-xs font-bold text-slate-600 italic'>
                          Assigned to Doctor
                        </div>
                      )}
                      {activeTableTab === 'LAB STAFF' && (
                        <span className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase'>
                          Diagnostic Unit
                        </span>
                      )}
                      {activeTableTab === 'RECEPTIONIST' && (
                        <span className='text-[10px] font-bold text-green-500 uppercase tracking-widest'>
                          Authorized Access
                        </span>
                      )}
                    </td>
                    <td className='p-6'>
                      <div className='flex justify-center'>
                        <button
                          onClick={() => handleDelete(staff._id)}
                          className='bg-red-50 text-red-400 px-6 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-400 hover:text-white transition-all'
                        >
                          Remove Member
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
                    No records found for this department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='flex justify-end'>
          <button
            onClick={handleLogout}
            className='w-48 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all focus:ring-2 focus:ring-red-500 outline-none'
          >
            LogOut
          </button>
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
                    Fill internal system credentials
                  </p>
                </div>
                <select
                  name='role'
                  value={formData.role}
                  onChange={handleInputChange}
                  className='bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-600 text-sm outline-none'
                >
                  <option value='DOCTORS'>Doctor</option>
                  <option value='ASSISTANTS'>Doctor's Assistant</option>
                  <option value='LAB STAFF'>Lab Staff</option>
                  <option value='RECEPTIONIST'>Receptionist</option>
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
                      <label className='text-[12px] uppercase font-black text-slate-800 ml-1'>
                        System Password
                      </label>
                      <input
                        type='password'
                        name='password'
                        onChange={handleInputChange}
                        className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#4486F6]'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className='bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6'>
                    <div className='space-y-1'>
                      <label className='text-[12px] font-bold text-slate-800'>
                        Full Name:
                      </label>
                      <input
                        name='name'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 uppercase'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[12px] font-bold text-slate-800'>
                        NID Number:
                      </label>
                      <input
                        name='nid'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[12px] font-bold text-slate-800'>
                        Date of Birth:
                      </label>
                      <input
                        type='date'
                        name='dateOfBirth'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[12px] font-bold text-slate-800'>
                        Phone Number:
                      </label>
                      <input
                        name='phone'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[12px] font-bold text-slate-800'>
                        Gender:
                      </label>
                      <select
                        name='gender'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none'
                      >
                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                      </select>
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[12px] font-bold text-slate-800'>
                        Emergency Phone:
                      </label>
                      <input
                        name='emergencyContact'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500'
                        required
                      />
                    </div>
                    <div className='col-span-full space-y-1'>
                      <label className='text-[12px] font-bold text-slate-800'>
                        Address:
                      </label>
                      <input
                        name='address'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500'
                        required
                      />
                    </div>
                    <div className='col-span-full space-y-1'>
                      <label className='text-[12px] font-bold text-slate-800'>
                        Email Address:
                      </label>
                      <input
                        type='email'
                        name='email'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500'
                        required
                      />
                    </div>
                  </div>
                </div>

                {formData.role === 'DOCTORS' && (
                  <div className='bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6'>
                    <div className='flex flex-col items-center gap-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100'>
                      <label className='text-xs font-black text-slate-800 uppercase tracking-widest'>
                        Professional Photo
                      </label>
                      <div className='relative group'>
                        <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200 flex items-center justify-center'>
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              className='w-full h-full object-cover'
                              alt='preview'
                            />
                          ) : (
                            <svg
                              className='w-12 h-12 text-slate-400'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                              />
                            </svg>
                          )}
                        </div>
                        <label className='absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-lg'>
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='3'
                              d='M12 4v16m8-8H4'
                            />
                          </svg>
                          <input
                            type='file'
                            accept='image/*'
                            className='hidden'
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                      <div className='space-y-4'>
                        <div className='space-y-1'>
                          <label className='text-[10px] uppercase font-black text-slate-800'>
                            Specialization
                          </label>
                          <input
                            name='specialization'
                            placeholder='Cardiologist'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white'
                            required
                          />
                        </div>
                        <div className='space-y-1'>
                          <label className='text-[10px] uppercase font-black text-slate-800'>
                            License Number
                          </label>
                          <input
                            name='licenseNumber'
                            placeholder='BMDC Reg'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white'
                            required
                          />
                        </div>
                        <div className='space-y-1'>
                          <label className='text-[10px] uppercase font-black text-blue-600'>
                            Fee (৳)
                          </label>
                          <input
                            type='number'
                            name='consultationFee'
                            placeholder='1000'
                            onChange={handleInputChange}
                            className='w-full border-2 border-blue-200 rounded-lg px-3 py-3 font-bold'
                            required
                          />
                        </div>
                      </div>
                      <div className='space-y-4'>
                        <div className='space-y-1'>
                          <label className='text-[10px] uppercase font-black text-slate-800'>
                            Sitting Time Label
                          </label>
                          <input
                            name='sittingTime'
                            placeholder='e.g. 5-9 PM'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 bg-white'
                          />
                        </div>
                        <div className='space-y-2'>
                          <label className='text-[10px] uppercase font-black text-slate-800'>
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
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${formData.sittingDays.includes(day) ? 'bg-[#4486F6] text-white' : 'bg-white border border-slate-200 text-slate-800'}`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formData.role === 'ASSISTANTS' && (
                  <div className='bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4'>
                    <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest'>
                      Assistant Assignment
                    </p>
                    <div>
                      <label className='text-[10px] uppercase font-black text-slate-800'>
                        Assign Doctor
                      </label>
                      <select
                        name='assignedDoctorId'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 font-bold text-slate-700 bg-white'
                        required
                      >
                        <option value=''>Select Doctor...</option>
                        {doctors.map(doc => (
                          <option key={doc._id} value={doc._id}>
                            {doc.fullName} - {doc.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className='flex flex-col items-center gap-4 pt-4'>
                  <button
                    type='submit'
                    className='w-full max-w-md bg-blue-600 hover:bg-[#4486F6] text-white py-4 rounded-2xl font-bold shadow-lg transition-all uppercase text-xs tracking-widest active:scale-95'
                  >
                    Register Member
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
                    className='text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-800'
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
