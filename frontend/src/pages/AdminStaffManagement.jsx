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

  const initialFormState = {
    role: 'DOCTORS',
    name: '',
    nid: '',
    dateOfBirth: '',
    phone: '',
    gender: 'male',
    address: '',
    licenseNumber: '',
    specialization: '',
    consultationFee: '',
    emergencyContact: { name: 'Emergency', phone: '' },
    hospitalName: '',
    sittingTime: '',
    sittingDays: [],
    email: '',
    password: '',
    assignedDoctorId: '',
    photo: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const apiUrl = import.meta.env.VITE_API_URL;

  const resetForm = (targetRole = 'DOCTORS') => {
    setFormData({ ...initialFormState, role: targetRole });
    setImagePreview(null);
  };

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

  const handleEmergencyPhoneChange = e => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, phone: value },
    }));
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
      dataToSend.append('email', formData.email);
      dataToSend.append('password', formData.password);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('gender', formData.gender);
      dataToSend.append('dateOfBirth', formData.dateOfBirth);

      const phoneOnly =
        typeof formData.emergencyContact === 'object'
          ? formData.emergencyContact.phone
          : formData.emergencyContact;
      dataToSend.append('emergencyContact', phoneOnly || '');

      dataToSend.append('nidNumber', formData.nid);
      dataToSend.append('address', formData.address);

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
        const newEntry =
          formData.role === 'DOCTORS' ? result.data.doctor : result.data;
        if (formData.role === activeTableTab) {
          setStaffList(prev => [newEntry, ...prev]);
        }

        setShowModal(false);
        resetForm();
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
    <div className='min-h-screen bg-[#F0F7FF] flex flex-col font-inter text-slate-800'>
      <Navbar />

      <main className='grow p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 font-inter'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6 font-inter'>
          <div className='font-inter'>
            <h2 className='text-4xl font-black text-slate-900 uppercase tracking-tighter font-inter'>
              Staff Directory
            </h2>
            <p className='text-slate-500 font-medium italic font-inter'>
              Manage hospital personnel records
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className='bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-[#4486F6] transition-all uppercase text-xs tracking-widest active:scale-95 font-inter'
          >
            + Add New Member
          </button>
        </div>

        <div className='flex items-center gap-4 bg-white w-fit p-2 rounded-2xl border border-slate-200 shadow-sm font-inter'>
          <span className='pl-4 text-[10px] uppercase font-black text-slate-800 tracking-widest font-inter'>
            Identity Filter:
          </span>
          <select
            value={activeTableTab}
            onChange={e => setActiveTableTab(e.target.value)}
            className='bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-[#4486F6] outline-none cursor-pointer uppercase text-xs font-inter'
          >
            <option value='DOCTORS'>Doctors</option>
            <option value='ASSISTANTS'>Assistants</option>
            <option value='LAB STAFF'>Lab Staff</option>
            <option value='RECEPTIONIST'>Receptionist</option>
          </select>
        </div>

        <div className='bg-white rounded-[2.5rem] shadow-2xl overflow-x-auto border border-slate-200 font-inter'>
          <table className='w-full text-left border-collapse min-w-full font-inter'>
            <thead>
              <tr className='bg-slate-50 border-b border-slate-100 font-inter'>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest font-inter'>
                  Identity
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest font-inter'>
                  Personal & Contact
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest font-inter'>
                  Address & Emergency
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest font-inter'>
                  Role Specifics
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-slate-900 tracking-widest text-center font-inter'>
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50 font-inter'>
              {staffList.length > 0 ? (
                staffList.map(staff => (
                  <tr
                    key={staff._id}
                    className='hover:bg-blue-50/30 transition-colors group font-inter'
                  >
                    <td className='p-6 font-inter'>
                      <div className='flex items-center gap-3 font-inter'>
                        {activeTableTab === 'DOCTORS' && (
                          <img
                            src={(
                              staff.profilePhoto?.url ||
                              'https://via.placeholder.com/150'
                            ).replace('http://', 'https://')}
                            className='w-12 h-12 rounded-full object-cover border-2 border-white shadow-md font-inter'
                            alt='profile'
                          />
                        )}
                        <div className='font-inter'>
                          <div className='font-bold text-slate-800 uppercase font-inter'>
                            {staff.fullName || staff.name || 'N/A'}
                          </div>
                          <div className='text-[10px] text-[#4486F6] font-mono font-bold font-inter'>
                            {staff.doctorId ||
                              staff.assistantId ||
                              staff.labAssistantId ||
                              staff.receptionistId ||
                              staff.upid ||
                              'ID PENDING'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='p-6 font-inter'>
                      <div className='text-xs font-bold text-slate-600 font-inter'>
                        NID: {staff.nidNumber || staff.nid || 'N/A'}
                      </div>
                      <div className='text-[10px] text-slate-800 font-inter'>
                        {staff.phone} | {staff.gender}
                      </div>
                      <div className='text-[10px] text-slate-400 italic font-inter'>
                        {staff.email}
                      </div>
                    </td>
                    <td className='p-6 font-inter'>
                      <div
                        className='text-[10px] text-slate-500 truncate w-48 font-inter'
                        title={staff.address}
                      >
                        {staff.address || 'N/A'}
                      </div>
                      <div className='text-[10px] font-bold text-red-500 mt-1 uppercase font-inter'>
                        SOS:{' '}
                        {staff.emergencyContact?.phone ||
                          staff.emergencyPhone ||
                          staff.emergencyContact ||
                          'N/A'}
                      </div>
                    </td>
                    <td className='p-6 font-inter'>
                      {activeTableTab === 'DOCTORS' && (
                        <div className='font-inter'>
                          <div className='text-[12px] font-black text-[#4486F6] uppercase font-inter'>
                            {staff.specialization || 'N/A'}
                          </div>
                          <div className='text-[10px] font-black text-green-600 mt-0.5 uppercase font-inter'>
                            Fee: ৳
                            {staff.consultationFee ||
                              staff.fee ||
                              staff.schedule?.consultationFee ||
                              '0'}
                          </div>
                        </div>
                      )}
                      {activeTableTab !== 'DOCTORS' && (
                        <span className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter font-inter'>
                          {activeTableTab}
                        </span>
                      )}
                    </td>
                    <td className='p-6 font-inter'>
                      <div className='flex justify-center font-inter'>
                        <button
                          onClick={() => handleDelete(staff._id)}
                          className='bg-red-50 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-400 hover:text-white transition-all font-inter'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className='font-inter'>
                  <td
                    colSpan='5'
                    className='p-20 text-center text-slate-300 italic font-medium font-inter'
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='flex justify-end font-inter'>
          <button
            onClick={handleLogout}
            className='px-10 border-2 border-red-200 text-red-700 rounded-2xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-inter'
          >
            LogOut
          </button>
        </div>

        {showModal && (
          <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-inter'>
            <div className='bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-inter'>
              <div className='p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center font-inter'>
                <div className='font-inter'>
                  <h3 className='text-2xl font-bold text-slate-800 uppercase tracking-tight font-inter'>
                    Onboard New Staff
                  </h3>
                  <p className='text-xs font-bold text-[#4486F6] uppercase tracking-widest mt-1 font-inter'>
                    Fill internal system credentials
                  </p>
                </div>
                <select
                  name='role'
                  value={formData.role}
                  onChange={e => resetForm(e.target.value)}
                  className='bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-600 text-sm outline-none focus:ring-2 ring-blue-500 font-inter'
                >
                  <option value='DOCTORS'>Doctor</option>
                  <option value='ASSISTANTS'>Doctor's Assistant</option>
                  <option value='LAB STAFF'>Lab Staff</option>
                  <option value='RECEPTIONIST'>Receptionist</option>
                </select>
              </div>

              <form
                onSubmit={handleSubmit}
                className='p-8 overflow-y-auto space-y-8 font-inter'
              >
                {formData.role === 'DOCTORS' && (
                  <div className='flex flex-col items-center gap-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100 font-inter'>
                    <label className='text-xs font-black text-slate-800 uppercase tracking-widest font-inter'>
                      Professional Photo
                    </label>
                    <div className='relative group font-inter'>
                      <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200 flex items-center justify-center font-inter'>
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt='Preview'
                            className='w-full h-full object-cover font-inter'
                          />
                        ) : (
                          <svg
                            className='w-12 h-12 text-slate-400 font-inter'
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
                      <label className='absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-blue-700 transition-colors font-inter'>
                        <svg
                          className='w-4 h-4 font-inter'
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
                          className='hidden font-inter'
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                )}

                <div className='bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6 font-inter'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 font-inter'>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] font-bold text-slate-800 font-inter'>
                        Full Name:
                      </label>
                      <input
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner uppercase font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] font-bold text-slate-800 font-inter'>
                        NID Number:
                      </label>
                      <input
                        name='nid'
                        value={formData.nid}
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] font-bold text-slate-800 font-inter'>
                        Date of Birth:
                      </label>
                      <input
                        type='date'
                        name='dateOfBirth'
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] font-bold text-slate-800 font-inter'>
                        Phone Number:
                      </label>
                      <input
                        name='phone'
                        value={formData.phone}
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] font-bold text-slate-800 font-inter'>
                        Gender:
                      </label>
                      <select
                        name='gender'
                        value={formData.gender}
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                      >
                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                      </select>
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] font-bold text-slate-800 font-inter'>
                        Emergency Contact:
                      </label>
                      <input
                        name='emergencyContact'
                        value={formData.emergencyContact.phone}
                        onChange={handleEmergencyPhoneChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] font-bold text-slate-800 font-inter'>
                        Email Address:
                      </label>
                      <input
                        name='email'
                        type='email'
                        value={formData.email}
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] font-bold text-slate-800 font-inter'>
                        Address:
                      </label>
                      <input
                        name='address'
                        value={formData.address}
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className='bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4 font-inter'>
                  <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest font-inter'>
                    Security & Identity
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 font-inter'>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] uppercase font-black text-slate-800 ml-1 font-inter'>
                        System Identity
                      </label>
                      <input
                        disabled
                        placeholder='Auto-generated on save'
                        className='w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 outline-none font-mono text-xs font-inter italic'
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[12px] uppercase font-black text-slate-800 ml-1 font-inter'>
                        System Password
                      </label>
                      <input
                        type='password'
                        name='password'
                        value={formData.password}
                        onChange={handleInputChange}
                        className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#4486F6] font-inter'
                        required
                      />
                    </div>
                  </div>
                </div>

                {formData.role === 'DOCTORS' && (
                  <div className='bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6 font-inter'>
                    <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest font-inter'>
                      Doctor Availability
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 font-inter'>
                      <div className='space-y-4 font-inter'>
                        <div className='space-y-1 font-inter'>
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                            Specialization
                          </label>
                          <input
                            name='specialization'
                            value={formData.specialization}
                            placeholder='Cardiologist'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white font-inter'
                            required
                          />
                        </div>
                        <div className='space-y-1 font-inter'>
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                            License Number
                          </label>
                          <input
                            name='licenseNumber'
                            value={formData.licenseNumber}
                            placeholder='BMDC Reg'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white font-inter'
                            required
                          />
                        </div>
                        <div className='space-y-1 font-inter'>
                          <label className='text-[10px] uppercase font-black text-blue-600 ml-1 font-inter'>
                            Fee (৳)
                          </label>
                          <input
                            type='number'
                            name='consultationFee'
                            value={formData.consultationFee}
                            placeholder='1000'
                            onChange={handleInputChange}
                            className='w-full border-2 border-blue-200 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white font-bold font-inter'
                            required
                          />
                        </div>
                      </div>
                      <div className='space-y-4 font-inter'>
                        <div className='space-y-1 font-inter'>
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                            Hospital Name
                          </label>
                          <input
                            name='hospitalName'
                            value={formData.hospitalName}
                            placeholder='Hospital Name'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white font-inter'
                          />
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1 mt-2 block font-inter'>
                            Sitting Time
                          </label>
                          <input
                            name='sittingTime'
                            value={formData.sittingTime}
                            placeholder='e.g. 5-9 PM'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white font-inter'
                          />
                        </div>
                        <div className='space-y-2 font-inter'>
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                            Available Days
                          </label>
                          <div className='flex flex-wrap gap-2 font-inter'>
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
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all font-inter ${formData.sittingDays.includes(day) ? 'bg-[#4486F6] text-white' : 'bg-white border border-slate-200 text-slate-800'}`}
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
                  <div className='bg-slate-50 p-6 rounded-3xl border border-slate-200 font-inter space-y-4'>
                    <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest font-inter'>
                      Assistant Assignment
                    </p>
                    <div className='font-inter'>
                      <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                        Assign Doctor
                      </label>
                      <select
                        name='assignedDoctorId'
                        value={formData.assignedDoctorId}
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 font-bold text-slate-700 bg-white font-inter'
                        required
                      >
                        <option value=''>Select Doctor...</option>
                        {doctors.map(doc => (
                          <option key={doc._id} value={doc._id}>
                            {doc.fullName || doc.name} - {doc.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className='flex flex-col items-center gap-4 pt-4 font-inter'>
                  <button
                    type='submit'
                    className='w-full max-w-md bg-blue-600 hover:bg-[#4486F6] text-white py-4 rounded-2xl font-bold shadow-lg transition-all uppercase text-xs tracking-widest active:scale-95 font-inter'
                  >
                    Register Member
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className='text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 font-inter'
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
