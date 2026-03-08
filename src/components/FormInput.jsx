import React from 'react';

const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className='flex flex-col w-full gap-2'>
      <label className='text-xs font-inter font-bold text-black uppercase tracking-widest ml-1'>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='border border-slate-300 rounded-xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4486F6] transition-all placeholder-slate-300 bg-white font-inter font-medium'
        required
      />
    </div>
  );
};

export default FormInput;
