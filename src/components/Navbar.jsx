import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo white.png';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className='bg-blue-600 px-8 py-1 flex justify-between items-center shadow-lg sticky top-0 z-50'>
      <div
        className='flex items-center cursor-pointer'
        onClick={() => navigate('/')}
      >
        <img
          src={logo}
          alt='VitaLink'
          className='h-16 w-auto object-contain '
        />
      </div>

      <div className='space-x-8 text-white text-sm font-inter font-bold uppercase tracking-wide'>
        <button
          onClick={() => navigate('/')}
          className='hover:text-blue-200 transition-colors'
        >
          About Us
        </button>
        <button
          onClick={() => navigate('/contact')}
          className='hover:text-blue-200 transition-colors'
        >
          Contact
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
