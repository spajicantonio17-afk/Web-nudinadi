
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  headerRight?: React.ReactNode;
  showSigurnost?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "NudiNađi", headerRight, showSigurnost = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  // Check if we are on the Home page
  const isHome = location.pathname === '/home';

  return (
    <div className="flex min-h-screen bg-[#060E14] text-white font-sans relative overflow-x-hidden selection:bg-blue-500/30">
      
      {/* --- GLOBAL AMBIENCE BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute -top-[10%] left-[20%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-glow"></div>
         <div className="absolute top-[10%] -right-[10%] w-[35vw] h-[35vw] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* --- NEW DESKTOP HEADER (Top Navigation) --- */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 px-6 md:px-8 flex items-center justify-between glass-nav border-b border-white/5 bg-[#060E14]/80 backdrop-blur-xl transition-all duration-300">
          
          {/* LEFT: Logo & Brand */}
          <div 
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
              <div className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden transition-transform group-hover:scale-105">
                 <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                 <span className="font-black text-white italic text-lg">N</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors">NudiNađi</h1>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Marketplace</p>
                </div>
              </div>
          </div>

          {/* CENTER: Action Button (Desktop) or Title (Mobile) */}
          
          {/* Mobile Title */}
          <div className="md:hidden">
              <span className="text-sm font-bold text-white/90">{title}</span>
          </div>

          {/* Desktop Centered "Novi Oglas" Button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
              <NavLink 
                to="/upload"
                className={({ isActive }) => `
                    flex items-center gap-2.5 px-6 py-2.5 rounded-full transition-all group
                    ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-400/20' 
                        : 'blue-gradient text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105'}
                `}
              >
                 <i className="fa-solid fa-plus text-sm group-hover:rotate-90 transition-transform duration-300"></i>
                 <span className="text-[11px] font-black uppercase tracking-widest">Novi Oglas</span>
              </NavLink>
          </div>

          {/* RIGHT: User Actions (Messages, Menu, Profile) */}
          <div className="flex items-center gap-2 md:gap-4">
              
              {/* GLOBAL SEARCH / HOME BUTTON (Visible everywhere except Home) */}
              {!isHome && (
                 <button 
                    onClick={() => navigate('/home')}
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-[#121C26] border border-white/10 text-gray-400 hover:text-white transition-colors mr-1"
                    title="Nazad na pretragu"
                 >
                    <i className="fa-solid fa-magnifying-glass text-sm"></i>
                 </button>
              )}

              {/* Optional: Header Right Custom Actions */}
              {headerRight && <div className="mr-2">{headerRight}</div>}

              {/* Messages Icon */}
              <NavLink 
                to="/messages"
                className={({ isActive }) => `
                    w-10 h-10 rounded-full flex items-center justify-center transition-all border
                    ${isActive 
                        ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
                `}
                title="Poruke"
              >
                 <div className="relative">
                    <i className="fa-solid fa-comment-dots text-sm"></i>
                    <div className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#060E14]"></div>
                 </div>
              </NavLink>

              {/* Settings / Menu Icon */}
              <NavLink 
                to="/menu"
                className={({ isActive }) => `
                    w-10 h-10 rounded-full flex items-center justify-center transition-all border
                    ${isActive 
                        ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
                `}
                title="Postavke"
              >
                 <i className="fa-solid fa-gear text-sm"></i>
              </NavLink>

              {/* Divider */}
              <div className="w-[1px] h-8 bg-white/10 mx-1 hidden md:block"></div>

              {/* Profile Avatar */}
              <NavLink 
                to="/profile"
                className={({ isActive }) => `
                    relative group flex items-center gap-3 pl-1 pr-1 md:pr-4 py-1 rounded-full transition-all border
                    ${isActive 
                        ? 'bg-[#121C26] border-blue-500/50' 
                        : 'border-transparent hover:bg-white/5'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-9 h-9 rounded-full p-[2px] ${isActive ? 'blue-gradient' : 'bg-gray-700 group-hover:bg-gray-600'}`}>
                        <img 
                          src="https://picsum.photos/seed/me/200/200" 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover border border-[#060E14]"
                        />
                    </div>
                    <div className="hidden md:block text-left">
                        <p className={`text-[11px] font-bold leading-none ${isActive ? 'text-white' : 'text-gray-300'}`}>Antonios7</p>
                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">Moj Profil</p>
                    </div>
                  </>
                )}
              </NavLink>

          </div>
      </header>


      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col pt-24 min-w-0 relative z-10">

        {/* SECURITY INFO MODAL (Available globally) */}
        {showSecurityInfo && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSecurityInfo(false)}></div>
                <div className="relative bg-[#121C26] border border-blue-500/30 w-full max-w-sm rounded-[32px] p-6 shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                    
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <i className="fa-solid fa-shield-halved text-3xl text-blue-400"></i>
                        </div>
                        
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">AI Zaštita</h2>
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">Sigurnost na prvom mjestu</p>
                        </div>

                        <div className="bg-black/20 rounded-[20px] p-4 w-full border border-white/5 text-left space-y-3">
                            <div className="flex gap-3">
                                <i className="fa-solid fa-user-shield text-emerald-400 mt-1"></i>
                                <div>
                                    <h4 className="text-[12px] font-bold text-white">Anti-Scam Detekcija</h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Naš AI analizira ponašanje korisnika i sumnjive poruke kako bi spriječio prevare prije nego se dogode.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowSecurityInfo(false)}
                            className="w-full py-3 rounded-[16px] bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Razumijem
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Page Content Scrollable Area - FULL WIDTH */}
        <main className="flex-1 px-4 md:px-8 w-full mx-auto pb-32 md:pb-12">
          {children}
        </main>

      </div>


      {/* --- MOBILE BOTTOM NAV (Visible only on small screens) --- */}
      <div className="md:hidden fixed bottom-12 left-1/2 -translate-x-1/2 z-[100]">
        <NavLink to="/upload" className="w-14 h-14 blue-gradient text-white rounded-full flex items-center justify-center btn-plus-shadow border-[4px] border-[#060E14] hover:scale-105 transition-transform shadow-2xl">
          <i className="fa-solid fa-plus text-2xl"></i>
        </NavLink>
      </div>

      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] glass-nav px-4 py-3 flex justify-between items-center z-[90] rounded-[24px] border border-white/10">
        <NavLink to="/home" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-white' : 'text-gray-500'}`}>
          <i className="fa-solid fa-house text-lg"></i>
          <span className="text-[9px] font-medium">Početna</span>
        </NavLink>
        
        <NavLink to="/messages" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-white' : 'text-gray-500'}`}>
          <i className="fa-solid fa-comment-dots text-lg"></i>
          <span className="text-[9px] font-medium">Poruke</span>
        </NavLink>
        
        <div className="w-8"></div> {/* Spacer for FAB */}

        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-white' : 'text-gray-500'}`}>
          <i className="fa-solid fa-user text-lg"></i>
          <span className="text-[9px] font-medium">Profil</span>
        </NavLink>

        <NavLink to="/menu" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-white' : 'text-gray-500'}`}>
          <i className="fa-solid fa-bars text-lg"></i>
          <span className="text-[9px] font-medium">Meni</span>
        </NavLink>
      </nav>

    </div>
  );
};

export default Layout;
