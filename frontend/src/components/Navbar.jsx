import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo white.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinkClass =
    'hover:text-blue-200 transition-colors text-sm font-bold uppercase tracking-wide';

  return (
    <nav className='bg-blue-600 px-4 md:px-8 py-1 shadow-lg sticky top-0 z-50 font-inter border-b border-blue-500/30'>
      <div className='w-full flex justify-between items-center'>
        <div
          className='flex items-center cursor-pointer'
          onClick={() => {
            navigate('/');
            setIsOpen(false);
          }}
        >
          <img
            src={logo}
            alt='VitaLink'
            className='h-16 w-auto object-contain'
          />
        </div>

        <div className='hidden md:flex items-center space-x-8 text-white'>
          <button
            onClick={() => navigate('/AboutPage')}
            className={navLinkClass}
          >
            About Us
          </button>
          <button
            onClick={() => navigate('/TeamPage')}
            className={navLinkClass}
          >
            Our Team
          </button>
        </div>

        <div className='md:hidden flex items-center'>
          <button
            onClick={toggleMenu}
            className='text-white p-2 focus:outline-none bg-white/10 rounded-lg'
            aria-label='Toggle Menu'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              {isOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 6h16M4 12h16m-7 6h7'
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`${
          isOpen
            ? 'max-h-60 opacity-100 border-t border-blue-500/50'
            : 'max-h-0 opacity-0'
        } md:hidden overflow-hidden bg-blue-600 transition-all duration-300 ease-in-out`}
      >
        <div className='flex flex-col space-y-1 px-4 py-4 text-white'>
          <button
            onClick={() => {
              navigate('/AboutPage');
              setIsOpen(false);
            }}
            className='flex items-center justify-between py-3 px-4 hover:bg-blue-500 rounded-xl transition-all'
          >
            <span className='text-sm font-bold uppercase tracking-wide'>
              About Us
            </span>
            <span>→</span>
          </button>

          <button
            onClick={() => {
              navigate('/TeamPage');
              setIsOpen(false);
            }}
            className='flex items-center justify-between py-3 px-4 hover:bg-blue-500 rounded-xl transition-all'
          >
            <span className='text-sm font-bold uppercase tracking-wide'>
              Our Team
            </span>
            <span>→</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
