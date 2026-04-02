import React from 'react';

const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = true,
}) => {
  return (
    <div className='flex flex-col w-full gap-2 font-inter'>
      <label className='text-xs font-inter font-bold text-black uppercase tracking-widest ml-1'>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='border border-slate-300 rounded-xl p-3.5 text-sm text-black outline-none focus:ring-4 focus:ring-slate-100 focus:border-black transition-all placeholder-slate-300 bg-white font-inter font-medium'
        required={required}
      />
    </div>
  );
};

export default FormInput;
