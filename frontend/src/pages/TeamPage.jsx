import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TeamPage = () => {
  const team = [
    {
      name: 'Jannatul Fardush',
      email: 'jannatul.fardush.cse@ulab.edu.bd',
      phone: '+880 1790-673563',
      emoji: '🙋🏻‍♀️',
    },
    {
      name: 'Nargish Fatema Pata',
      email: 'nargish.fatema.cse@ulab.edu.bd',
      phone: '+880 1779-756595',
      emoji: '🙋🏻‍♀️',
    },
    {
      name: 'Mustara Khatun Mugni',
      email: 'mustara.khatun.cse@ulab.edu.bd',
      phone: '+880 1746-121206',
      emoji: '🙋🏻‍♀️',
    },
    {
      name: 'Mahdia Hossain',
      email: 'mahdia.hossain.cse@ulab.edu.bd',
      phone: '+880 1407-008820',
      emoji: '🙋🏻‍♀️',
    },
    {
      name: 'Nusrat Ahmed Niva',
      email: 'Nusrat.ahmed1.cse@ulab.edu.bd',
      phone: '+880 1933-898744',
      emoji: '🙋🏻‍♀️',
    },
    {
      name: 'Saika Mehnaz Khan',
      email: 'saika.mehnaz.cse@ulab.edu.bd',
      phone: '+880 1876-947826',
      emoji: '🙋🏻‍♀️',
    },
  ];

  return (
    <div className='min-h-screen bg-[#F8FAFC] flex flex-col font-inter text-slate-900'>
      <Navbar />

      <main className='grow p-6 md:p-10 max-w-6xl mx-auto w-full space-y-16'>
        <section className='text-center space-y-6 pt-10'>
          <div className='space-y-2'>
            <span className='text-blue-600 font-black uppercase text-xs tracking-[0.2em]'>
              Project Showcase
            </span>
            <h1 className='text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none'>
              The Minds Behind <br />
              <span className='bg-blue-600 text-white px-4 py-1 inline-block mt-2 rounded-2xl shadow-xl shadow-blue-100'>
                VitaLink
              </span>
            </h1>
          </div>

          <div className='bg-white border-2 border-slate-100 inline-block px-8 py-4 rounded-3xl shadow-sm'>
            <p className='text-slate-900 font-black uppercase text-sm md:text-base tracking-tight'>
              University of Liberal Arts Bangladesh
            </p>
            <p className='text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.15em] mt-1'>
              Department of CSE • Design Project 2
            </p>
          </div>

          <p className='text-slate-600 font-semibold text-sm max-w-lg mx-auto italic'>
            "Building the future of paperless healthcare, one line of code at a
            time."
          </p>
        </section>

        <section className='grid grid-cols-1 md:grid-cols-2 gap-6 pb-20'>
          {team.map((member, idx) => (
            <div
              key={idx}
              className='bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 flex items-center gap-6 hover:border-blue-400 transition-all duration-300'
            >
              <div className='shrink-0 w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl border border-slate-100'>
                {member.emoji}
              </div>

              <div className='grow min-w-0 space-y-2'>
                <h3 className='text-lg font-black text-slate-900 uppercase tracking-tight truncate'>
                  {member.name}
                </h3>

                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-slate-500'>
                    <span className='text-xs'>✉️</span>
                    <a
                      href={`mailto:${member.email}`}
                      className='text-[11px] font-bold hover:text-blue-600 transition-colors truncate block'
                    >
                      {member.email}
                    </a>
                  </div>

                  <div className='flex items-center gap-2 text-slate-500'>
                    <span className='text-xs'>📞</span>
                    <p className='text-[11px] font-bold'>{member.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TeamPage;
