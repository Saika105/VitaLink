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
  const [imagePreview, setImagePreview] = useState(null);

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
    const fetchStaff = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/v1/admin/staff?role=${activeTableTab}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );
        const result = await response.json();
        if (response.ok) setStaffList(result.data);
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
          const response = await fetch(`${apiUrl}/api/v1/admin/doctors-list`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const result = await response.json();
          if (response.ok) setDoctors(result.data);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login-admin');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const routeMap = {
      doctor: '/api/v1/admin/register-doctors',
      assistant: '/api/v1/admin/register-assistants',
      lab: '/api/v1/admin/register-lab-assistants',
      receptionist: '/api/v1/admin/register-receptionists',
    };
    const targetRoute =
      routeMap[formData.role] || '/api/v1/admin/register-doctors';

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
      dataToSend.append('emergencyName', formData.emergencyContact);
      dataToSend.append('emergencyPhone', formData.phone);

      if (formData.role === 'doctor') {
        dataToSend.append('licenseNumber', formData.licenseNumber);
        dataToSend.append('specialization', formData.specialization);
        dataToSend.append('consultationFee', formData.consultationFee);
        dataToSend.append('hospitalName', formData.hospitalName);
        dataToSend.append('sittingTime', formData.sittingTime);
        dataToSend.append('sittingDays', JSON.stringify(formData.sittingDays));
        if (formData.photo) {
          dataToSend.append('profilePhoto', formData.photo);
        }
      }

      if (formData.role === 'assistant') {
        dataToSend.append('assignedDoctorId', formData.assignedDoctorId);
      }

      const response = await fetch(`${apiUrl}${targetRoute}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        const generatedId =
          result.data.upid ||
          result.data.assistantId ||
          result.data.labAssistantId ||
          result.data.receptionistId;
        alert(
          `Staff Added Successfully!\nGenerated ID: ${generatedId}\nPlease share this ID with the member.`,
        );
        setShowModal(false);
        setImagePreview(null);

        const updatedResponse = await fetch(
          `${apiUrl}/api/v1/admin/staff?role=${activeTableTab}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );
        const updatedData = await updatedResponse.json();
        setStaffList(updatedData.data);
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
    try {
      const response = await fetch(
        `${apiUrl}/api/v1/admin/staff/${id}?role=${activeTableTab}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      const result = await response.json();
      if (response.ok) {
        setStaffList(prev => prev.filter(item => item._id !== id));
        alert('Staff removed successfully!');
      } else {
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

        <div className='flex items-center gap-4 bg-white w-fit p-2 rounded-2xl border border-slate-200 shadow-sm font-inter'>
          <span className='pl-4 text-[10px] uppercase font-black text-slate-800 tracking-widest'>
            Identity Filter:
          </span>
          <select
            value={activeTableTab}
            onChange={e => setActiveTableTab(e.target.value)}
            className='bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-[#4486F6] outline-none cursor-pointer uppercase text-xs'
          >
            <option value='doctor'>Doctors</option>
            <option value='assistant'>Assistants</option>
            <option value='lab'>Lab Staff</option>
            <option value='receptionist'>Receptionist</option>
          </select>
        </div>

        <div className='bg-white rounded-[2.5rem] shadow-2xl overflow-x-auto border border-slate-200 font-inter'>
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
              {staffList && staffList.length > 0 ? (
                staffList.map(staff => (
                  <tr
                    key={staff._id}
                    className='hover:bg-blue-50/30 transition-colors group'
                  >
                    <td className='p-6'>
                      <div className='flex items-center gap-3'>
                        {activeTableTab === 'doctor' && (
                          <img
                            src={
                              staff.profilePhoto ||
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
                          <div className='text-[10px] text-[#4486F6] font-inter font-bold'>
                            {staff.upid ||
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
                        {staff.phone || 'No Phone'} |{' '}
                        {staff.gender || 'N/A'}{' '}
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
                        {staff.emergencyContact?.name ||
                          staff.emergencyName ||
                          'N/A'}{' '}
                      </div>
                    </td>
                    <td className='p-6'>
                      {activeTableTab === 'doctor' && (
                        <div>
                          <div className='text-xs font-bold text-[#4486F6] uppercase'>
                            {staff.specialization}
                          </div>
                          <div className='text-[10px] text-slate-800'>
                            {staff.hospitalName}
                          </div>
                          <div className='text-[10px] font-black text-green-600 mt-1 uppercase'>
                            Fee: ৳{staff.consultationFee}
                          </div>
                        </div>
                      )}
                      {activeTableTab === 'assistant' && (
                        <div className='text-xs font-bold text-slate-600 italic'>
                          Assigned Dr:{' '}
                          {staff.assignedDoctorId?.fullName || 'N/A'}
                        </div>
                      )}
                      {activeTableTab === 'lab' && (
                        <span className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase'>
                          Diagnostic Unit
                        </span>
                      )}
                      {activeTableTab === 'receptionist' && (
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
            className='w-48 border-2 border-red-200 text-red-700 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all focus:ring-2 focus:ring-red-500 outline-none'
          >
            LogOut
          </button>
        </div>

        {showModal && (
          <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-inter'>
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
                  className='bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-600 text-sm outline-none focus:ring-2 ring-blue-500'
                >
                  <option value='doctor'>Doctor</option>
                  <option value='assistant'>Doctor's Assistant</option>
                  <option value='lab'>Lab Staff</option>
                  <option value='receptionist'>Receptionist</option>
                </select>
              </div>

              <form
                onSubmit={handleSubmit}
                className='p-8 overflow-y-auto space-y-8 font-inter'
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
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner uppercase'
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
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
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
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
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
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
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
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                      >
                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                      </select>
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[12px] font-bold text-slate-800'>
                        Emergency Contact:
                      </label>
                      <input
                        name='emergencyContact'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
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
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner'
                        required
                      />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label className='text-[12px] font-bold text-slate-800'>
                      Email Address:
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
                  <div className='bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6 font-inter'>
                    <div className='flex flex-col items-center gap-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100'>
                      <label className='text-xs font-black text-slate-800 uppercase tracking-widest'>
                        Professional Photo
                      </label>
                      <div className='relative group'>
                        <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200 flex items-center justify-center'>
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt='Preview'
                              className='w-full h-full object-cover'
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
                        <label className='absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-blue-700 transition-colors'>
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
                    <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest'>
                      Doctor Availability
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                      <div className='space-y-4'>
                        <div className='space-y-1'>
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1'>
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
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1'>
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
                          <label className='text-[10px] uppercase font-black text-blue-600 ml-1'>
                            Fee (৳)
                          </label>
                          <input
                            type='number'
                            name='consultationFee'
                            placeholder='1000'
                            onChange={handleInputChange}
                            className='w-full border-2 border-blue-200 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white font-bold'
                            required
                          />
                        </div>
                      </div>
                      <div className='space-y-4'>
                        <div className='space-y-1'>
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1'>
                            Hospital & Time
                          </label>
                          <input
                            name='hospitalName'
                            placeholder='Hospital Name'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white'
                          />
                          <input
                            name='sittingTime'
                            placeholder='Sitting Time (e.g. 5-9 PM)'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white mt-2'
                          />
                        </div>
                        <div className='space-y-2'>
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1'>
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

                {formData.role === 'assistant' && (
                  <div className='bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 font-inter'>
                    <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest'>
                      Assistant Assignment
                    </p>
                    <div>
                      <label className='text-[10px] uppercase font-black text-slate-800 ml-1'>
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

                <div className='flex flex-col items-center gap-4 pt-4 font-inter'>
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
