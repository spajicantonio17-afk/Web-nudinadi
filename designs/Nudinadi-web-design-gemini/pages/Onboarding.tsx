
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark');

  const nextSlide = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    // In a real app, save "seenOnboarding" to localStorage here
    navigate('/home');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#060E14] text-white relative font-sans select-none">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] transition-all duration-1000 ${currentSlide === 1 && selectedTheme === 'light' ? 'bg-orange-400/20' : ''}`}></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Slider Container */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full z-10 relative"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        
        {/* SLIDE 1: INTRO / VISION (CROATIAN) */}
        <div className="w-screen h-full shrink-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-8 animate-pulse">
                <i className="fa-solid fa-rocket text-4xl text-white"></i>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">
                Marketplace.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Evolucija.</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-[280px] leading-relaxed">
                NudiNađi podiže trgovinu na novi nivo. 
                <span className="text-white font-bold"> AI podrška</span>, 
                munjevita pretraga i dizajn koji diše.
            </p>
        </div>

        {/* SLIDE 2: THEME SELECTION */}
        <div className="w-screen h-full shrink-0 flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-black uppercase tracking-widest mb-2">Tvoj Stil</h2>
            <p className="text-xs text-gray-500 mb-10">Kako želiš da NudiNađi izgleda?</p>

            <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                {/* Dark Option */}
                <div 
                    onClick={() => setSelectedTheme('dark')}
                    className={`aspect-[3/4] rounded-[24px] bg-[#0B151E] border-2 relative cursor-pointer overflow-hidden transition-all duration-300 ${selectedTheme === 'dark' ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-105' : 'border-white/5 opacity-50'}`}
                >
                    <div className="absolute top-4 left-4 right-4 h-2 bg-gray-800 rounded-full opacity-50"></div>
                    <div className="absolute top-8 left-4 w-12 h-12 bg-gray-800 rounded-xl opacity-50"></div>
                    <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Dark Mode</span>
                    </div>
                </div>

                {/* Light Option */}
                <div 
                    onClick={() => setSelectedTheme('light')}
                    className={`aspect-[3/4] rounded-[24px] bg-gray-200 border-2 relative cursor-pointer overflow-hidden transition-all duration-300 ${selectedTheme === 'light' ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)] scale-105' : 'border-transparent opacity-50'}`}
                >
                    <div className="absolute top-4 left-4 right-4 h-2 bg-gray-300 rounded-full"></div>
                    <div className="absolute top-8 left-4 w-12 h-12 bg-gray-300 rounded-xl"></div>
                    <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-white to-transparent opacity-90"></div>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black">Light Mode</span>
                    </div>
                </div>
            </div>
        </div>

        {/* SLIDE 3: LOGIN / AUTH (REDESIGNED) */}
        <div className="w-screen h-full shrink-0 flex flex-col items-center justify-center p-8 relative">
            <div className="w-full max-w-xs space-y-5 z-10 -mt-10">
                <div className="text-center mb-6">
                     <h2 className="text-2xl font-black text-white mb-2">Prijava</h2>
                     <p className="text-xs text-gray-500">Poveži se i započni trgovinu.</p>
                </div>

                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white text-black py-3 rounded-[16px] flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors active:scale-95">
                        <i className="fa-brands fa-apple text-lg"></i>
                        <span className="text-xs font-bold">Apple</span>
                    </button>
                    <button className="bg-white text-black py-3 rounded-[16px] flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors active:scale-95">
                        <i className="fa-brands fa-google text-lg"></i>
                        <span className="text-xs font-bold">Google</span>
                    </button>
                </div>

                <div className="flex items-center gap-3 my-2 opacity-50">
                    <div className="h-[1px] bg-white flex-1"></div>
                    <span className="text-[9px] font-bold uppercase">ILI</span>
                    <div className="h-[1px] bg-white flex-1"></div>
                </div>

                {/* Standard Inputs */}
                <div className="space-y-3">
                    <div className="bg-[#121C26] border border-white/10 rounded-[18px] px-4 py-1 focus-within:border-blue-500/50 transition-colors">
                        <label className="text-[9px] font-bold text-blue-500 uppercase">Korisničko Ime</label>
                        <input type="text" placeholder="npr. Antonios7" className="w-full bg-transparent text-sm text-white py-2 outline-none font-bold placeholder:text-gray-700" />
                    </div>
                    <div className="bg-[#121C26] border border-white/10 rounded-[18px] px-4 py-1 focus-within:border-blue-500/50 transition-colors">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Lozinka</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-transparent text-sm text-white py-2 outline-none font-bold placeholder:text-gray-700" />
                    </div>
                </div>

                {/* Main Actions */}
                <div className="pt-2 space-y-3">
                    <button onClick={completeOnboarding} className="w-full py-4 rounded-[20px] blue-gradient text-white font-black text-xs uppercase tracking-[2px] shadow-xl shadow-blue-500/20 active:scale-95 transition-transform">
                        Prijavi se
                    </button>
                    <button onClick={completeOnboarding} className="w-full py-4 rounded-[20px] bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-[2px] hover:bg-white/10 transition-colors">
                        Napravi Račun
                    </button>
                </div>
            </div>
            
            {/* Styled Skip Button at Bottom */}
            <button 
                onClick={completeOnboarding} 
                className="absolute bottom-12 bg-[#121C26] border border-white/10 px-8 py-3 rounded-full flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
                <span>Preskoči</span>
                <i className="fa-solid fa-arrow-right"></i>
            </button>
        </div>

      </div>

      {/* Bottom Controls (Only visible on slide 0 and 1) */}
      {currentSlide < 2 && (
          <div className="absolute bottom-10 inset-x-0 px-8 flex justify-between items-center z-20">
              {/* Pagination Dots */}
              <div className="flex gap-2">
                  {[0, 1, 2].map(idx => (
                      <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`}></div>
                  ))}
              </div>

              {/* Next Button */}
              <button 
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                  <i className="fa-solid fa-arrow-right"></i>
              </button>
          </div>
      )}

    </div>
  );
};

export default Onboarding;
