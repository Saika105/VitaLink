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
    consultationFee: '',
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
            <option value='doctor'>Doctors</option>
            <option value='assistant'>Assistants</option>
            <option value='lab'>Lab Staff</option>
            <option value='receptionist'>Receptionist</option>
          </select>
        </div>

        <div className='bg-white rounded-[2.5rem] shadow-2xl overflow-x-auto border border-slate-200 font-inter'>
          <table className='w-full text-left border-collapse min-w-full font-inter'>
            <thead>
              <tr className='bg-slate-50 border-b border-slate-100 font-inter'>
                <th className='p-6 text-[12px] uppercase font-black text-black tracking-widest font-inter'>
                  Identity
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-black tracking-widest font-inter'>
                  Personal & Contact
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-black tracking-widest font-inter'>
                  Address & Emergency
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-black tracking-widest font-inter'>
                  Role Specifics
                </th>
                <th className='p-6 text-[12px] uppercase font-black text-black tracking-widest text-center font-inter'>
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50 font-inter'>
              {staffList.length > 0 ? (
                staffList.map(staff => (
                  <tr
                    key={staff.upid}
                    className='hover:bg-blue-50/30 transition-colors group font-inter'
                  >
                    <td className='p-6 font-inter'>
                      <div className='font-bold text-slate-800 uppercase font-inter'>
                        {staff.name}
                      </div>
                      <div className='text-[10px] text-[#4486F6] font-mono font-bold font-inter'>
                        {staff.upid}
                      </div>
                    </td>
                    <td className='p-6 font-inter'>
                      <div className='text-xs font-bold text-slate-600 font-inter'>
                        NID: {staff.nid}
                      </div>
                      <div className='text-[10px] text-slate-800 font-inter'>
                        {staff.phone} | {staff.gender}
                      </div>
                      <div className='text-[10px] text-slate-800 italic font-inter'>
                        {staff.email}
                      </div>
                    </td>
                    <td className='p-6 font-inter'>
                      <div
                        className='text-[10px] text-slate-500 truncate w-56 font-inter'
                        title={staff.address}
                      >
                        {staff.address}
                      </div>
                      <div className='text-[9px] font-black text-red-400 uppercase mt-1 font-inter'>
                        SOS: {staff.emergencyContact}
                      </div>
                    </td>
                    <td className='p-6 font-inter'>
                      {activeTableTab === 'doctor' && (
                        <>
                          <div className='text-xs font-bold text-[#4486F6] uppercase font-inter'>
                            {staff.specialization}
                          </div>
                          <div className='text-[10px] text-slate-800 font-inter'>
                            {staff.hospitalName}
                          </div>
                          <div className='text-[10px] font-black text-green-600 mt-1 uppercase font-inter'>
                            Fee: ৳{staff.consultationFee}
                          </div>
                        </>
                      )}
                      {activeTableTab === 'assistant' && (
                        <div className='text-xs font-bold text-slate-600 italic font-inter'>
                          Dr. ID: {staff.assignedDoctorId}
                        </div>
                      )}
                      {activeTableTab === 'lab' && (
                        <span className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase font-inter'>
                          {staff.labDepartment}
                        </span>
                      )}
                      {activeTableTab === 'receptionist' && (
                        <span className='text-[10px] font-bold text-green-500 uppercase tracking-widest font-inter'>
                          Authorized Access
                        </span>
                      )}
                    </td>
                    <td className='p-6 font-inter'>
                      <div className='flex justify-center gap-3 font-inter'>
                        <button className='bg-blue-50 text-[#4486F6] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-[#4486F6] hover:text-white transition-all font-inter'>
                          Edit
                        </button>
                        <button className='bg-red-50 text-red-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-red-400 hover:text-white transition-all font-inter'>
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
                    No records found for this department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  onChange={handleInputChange}
                  className='bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-600 text-sm outline-none focus:ring-2 ring-blue-500 font-inter'
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
                <div className='bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4 font-inter'>
                  <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest font-inter'>
                    System Access
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 font-inter'>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                        Unique ID
                      </label>
                      <input
                        name='upid'
                        onChange={handleInputChange}
                        placeholder='XXX'
                        className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#4486F6] font-mono'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                        System Password
                      </label>
                      <input
                        type='password'
                        name='password'
                        onChange={handleInputChange}
                        className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#4486F6] font-inter'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className='bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6 font-inter'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 font-inter'>
                    <div className='space-y-1 font-inter'>
                      <label className='text-sm font-bold text-slate-700 font-inter'>
                        Full Name:
                      </label>
                      <input
                        name='name'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner uppercase font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-sm font-bold text-slate-700 font-inter'>
                        NID Number:
                      </label>
                      <input
                        name='nid'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-sm font-bold text-slate-700 font-inter'>
                        Date of Birth:
                      </label>
                      <input
                        type='date'
                        name='dateOfBirth'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-sm font-bold text-slate-700 font-inter'>
                        Phone Number:
                      </label>
                      <input
                        name='phone'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-sm font-bold text-slate-700 font-inter'>
                        Gender:
                      </label>
                      <select
                        name='gender'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                      >
                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                      </select>
                    </div>
                    <div className='space-y-1 font-inter'>
                      <label className='text-sm font-bold text-slate-700 font-inter'>
                        Emergency Contact:
                      </label>
                      <input
                        name='emergencyContact'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                    <div className='col-span-full space-y-1 font-inter'>
                      <label className='text-sm font-bold text-slate-700 font-inter'>
                        Address:
                      </label>
                      <input
                        name='address'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                        required
                      />
                    </div>
                  </div>
                  <div className='space-y-1 font-inter'>
                    <label className='text-sm font-bold text-slate-700 font-inter'>
                      Email Address:
                    </label>
                    <input
                      type='email'
                      name='email'
                      onChange={handleInputChange}
                      className='w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-blue-500 shadow-inner font-inter'
                      required
                    />
                  </div>
                </div>

                {formData.role === 'doctor' && (
                  <div className='bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6 animate-in fade-in duration-300 font-inter'>
                    <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest font-inter'>
                      Doctor Availability & Specialization
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 font-inter'>
                      <div className='space-y-4 font-inter'>
                        <div className='space-y-1 font-inter'>
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                            Specialization
                          </label>
                          <input
                            name='specialization'
                            placeholder='e.g. Cardiologist'
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
                            placeholder='BMDC Reg No.'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white font-inter'
                            required
                          />
                        </div>
                        <div className='space-y-1 font-inter'>
                          <label className='text-[10px] uppercase font-black text-blue-600 ml-1 font-inter'>
                            Consultation Fee (৳)
                          </label>
                          <input
                            type='number'
                            name='consultationFee'
                            placeholder='e.g. 1000'
                            onChange={handleInputChange}
                            className='w-full border-2 border-blue-200 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white font-bold font-inter'
                            required
                          />
                        </div>
                      </div>
                      <div className='space-y-4 font-inter'>
                        <div className='space-y-1 font-inter'>
                          <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                            Hospital & Sitting Time
                          </label>
                          <input
                            name='hospitalName'
                            placeholder='Hospital Name'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white font-inter'
                          />
                          <input
                            name='sittingTime'
                            placeholder='Sitting Time (e.g. 5-9 PM)'
                            onChange={handleInputChange}
                            className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 bg-white mt-2 font-inter'
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
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${formData.sittingDays.includes(day) ? 'bg-[#4486F6] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-800 hover:border-blue-300 font-inter'}`}
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
                  <div className='bg-slate-50 p-6 rounded-3xl border border-slate-200 font-inter space-y-4'>
                    <p className='text-xs font-black text-[#4486F6] uppercase tracking-widest font-inter'>
                      Assistant Assignment
                    </p>
                    <div className='font-inter'>
                      <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                        Assign to Lead Doctor
                      </label>
                      <select
                        name='assignedDoctorId'
                        onChange={handleInputChange}
                        className='w-full border border-slate-300 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 font-bold text-slate-700 bg-white font-inter'
                        required
                      >
                        <option value='' className='font-inter'>
                          Select Doctor to support...
                        </option>
                        {doctors.map(doc => (
                          <option
                            key={doc._id}
                            value={doc._id}
                            className='font-inter'
                          >
                            {doc.name} - {doc.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {formData.role === 'lab' && (
                  <div className='bg-slate-50 p-6 rounded-3xl border border-slate-200 font-inter'>
                    <label className='text-[10px] uppercase font-black text-slate-800 ml-1 font-inter'>
                      Diagnostic Lab Department
                    </label>
                    <select
                      name='labDepartment'
                      onChange={handleInputChange}
                      className='w-full border border-slate-800 rounded-lg px-3 py-3 outline-none focus:ring-1 ring-blue-500 font-bold text-slate-700 bg-white font-inter'
                      required
                    >
                      <option value='' className='font-inter'>
                        Select Department...
                      </option>
                      <option value='Pathology' className='font-inter'>
                        Pathology
                      </option>
                      <option value='Radiology' className='font-inter'>
                        Radiology
                      </option>
                      <option value='Hematology' className='font-inter'>
                        Hematology
                      </option>
                    </select>
                  </div>
                )}

                <div className='flex flex-col items-center gap-4 pt-4 font-inter'>
                  <button
                    type='submit'
                    className='w-full max-w-md bg-[#3B82F6] hover:bg-[#1E40AF] text-white py-4 rounded-2xl font-bold shadow-lg transition-all uppercase text-sm tracking-widest active:scale-95 font-inter'
                  >
                    Register Member
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
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
