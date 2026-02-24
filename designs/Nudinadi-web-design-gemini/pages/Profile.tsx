
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const MOCK_DRAFTS = [
  {
    id: 'd1',
    title: 'Sony PlayStation 5 Di...',
    price: '450',
    date: 'Prije 2 sata',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=200',
    progress: 70
  },
  {
    id: 'd2',
    title: 'Zimske Gume 19ke',
    price: '—',
    date: 'Jučer',
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&q=80&w=200',
    progress: 30
  }
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = location.state?.tab || 'Aktivni';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Layout title="Moj Profil" showSigurnost={false}>
      <div className="mt-1 pb-32 space-y-3">
        
        {/* COMPACT IDENTITY HEADER (Horizontal Layout) */}
        <div className="relative bg-[#121C26] rounded-[24px] overflow-hidden border border-white/5 p-5">
            {/* Background Decor (Subtle) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 blur-[40px] rounded-full"></div>

            <div className="relative z-10 flex items-center gap-5">
                {/* Avatar Area */}
                <div className="relative shrink-0 self-start mt-1">
                    <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-gray-800 to-black p-0.5 shadow-2xl shadow-blue-500/10">
                        <img src="https://picsum.photos/seed/me/200/200" alt="Avatar" className="w-full h-full object-cover rounded-[16px]" />
                    </div>
                </div>

                {/* Info Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="pt-0.5 flex flex-col items-start">
                            <h2 className="text-lg font-black text-white tracking-tight leading-none">Antonios7</h2>
                            <div className="flex items-center gap-1.5 text-gray-400 mt-1.5">
                                <i className="fa-solid fa-location-dot text-[10px] text-blue-400"></i>
                                <span className="text-[11px] font-medium">Grude, BiH</span>
                            </div>
                            
                            {/* Verification Badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <i className="fa-solid fa-check-circle text-[9px]"></i> Verificiran
                                </span>
                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <i className="fa-solid fa-star text-[9px]"></i> Premium
                                </span>
                            </div>

                            {/* Settings Button - Moved here under verification */}
                            <button 
                                onClick={() => navigate('/menu')}
                                className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-[#060E14] border border-white/10 rounded-full hover:border-white/30 hover:bg-white/5 transition-all active:scale-95 group shadow-lg"
                            >
                                <i className="fa-solid fa-gear text-[10px] text-gray-400 group-hover:text-white group-hover:rotate-90 transition-transform duration-500"></i>
                                <span className="text-[9px] font-bold text-gray-300 group-hover:text-white uppercase tracking-wide">Postavke</span>
                            </button>
                        </div>

                        {/* XP/Reputation - Right Side */}
                         <div className="flex flex-col items-end pl-2">
                            {/* Level Number */}
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Level</span>
                                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 italic drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">5</span>
                            </div>
                            
                            {/* Larger Bar */}
                            <div className="w-36 md:w-44 mb-2 relative group">
                                <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                    <span className="text-blue-400">850 XP</span>
                                    <span>1000 XP</span>
                                </div>
                                <div className="h-2.5 bg-[#060E14] rounded-full overflow-hidden border border-white/10 p-[1px] shadow-inner">
                                    <div className="h-full w-[85%] bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/30 skew-x-[-20deg] animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Level System Button */}
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#060E14] border border-white/10 rounded-full hover:border-blue-500/50 hover:bg-blue-500/5 transition-all active:scale-95 group shadow-lg">
                                <i className="fa-solid fa-trophy text-[10px] text-yellow-500 group-hover:scale-110 transition-transform"></i>
                                <span className="text-[9px] font-bold text-gray-300 group-hover:text-white uppercase tracking-wide">Level Sistem</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* COMPACT TABS */}
        <div>
            <div className="flex p-0.5 bg-[#121C26] border border-white/5 rounded-[14px] overflow-x-auto no-scrollbar">
                {['Aktivni', 'Završeni', 'Dojmovi', 'Arhiv', 'Info'].map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 px-3 rounded-[10px] text-[10px] font-bold transition-all whitespace-nowrap ${
                            activeTab === tab 
                            ? 'bg-white/10 text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {tab === 'Arhiv' && (
                            <i className="fa-solid fa-box-archive mr-1.5 text-[9px]"></i>
                        )}
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        {activeTab === 'Arhiv' ? (
            <div className="space-y-2 animate-[fadeIn_0.2s_ease-out]">
                {/* Section Title - Smaller */}
                <div className="px-1 mb-1 flex items-center justify-between">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400">Nedovršeni Oglasi</h3>
                        <p className="text-[9px] text-gray-500">Drafts</p>
                    </div>
                    <button className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white border border-white/5">
                        <i className="fa-solid fa-plus text-[10px]"></i>
                    </button>
                </div>

                {MOCK_DRAFTS.map((draft) => (
                    <div key={draft.id} className="bg-[#121C26] border border-white/5 rounded-[16px] p-2.5 flex gap-3 group active:scale-[0.99] transition-all hover:border-white/10">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0">
                            <img src={draft.image} alt="Draft" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <i className="fa-solid fa-pen text-white/80 text-xs"></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h4 className="text-[12px] font-bold text-white leading-tight line-clamp-1">{draft.title}</h4>
                                    <button className="text-gray-600 hover:text-red-400 p-1 -mr-2 -mt-2">
                                        <i className="fa-solid fa-xmark text-[10px]"></i>
                                    </button>
                                </div>
                                <span className="text-[10px] text-orange-400 font-bold mt-0.5 block">
                                    {draft.price === '—' ? 'Cijena nije def.' : `€${draft.price}`}
                                </span>
                            </div>

                            {/* Progress Bar & Action */}
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex-1">
                                    <div className="flex justify-between text-[8px] font-bold text-gray-500 mb-0.5">
                                        <span>Popunjeno</span>
                                        <span>{draft.progress}%</span>
                                    </div>
                                    <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                                        <div style={{ width: `${draft.progress}%` }} className="h-full bg-orange-500 rounded-full"></div>
                                    </div>
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-[6px] text-[8px] font-bold uppercase tracking-wider transition-colors">
                                    Nastavi
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-[#121C26] border border-white/5 rounded-[20px] p-6 flex flex-col items-center text-center min-h-[200px] justify-center relative overflow-hidden group">
                {/* Animated Grid Background inside empty state */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-[16px] bg-black/40 border border-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                        <i className={`fa-solid ${activeTab === 'Dojmovi' ? 'fa-star' : activeTab === 'Info' ? 'fa-circle-info' : 'fa-ghost'} text-xl text-gray-700 group-hover:text-white transition-colors`}></i>
                    </div>
                    <h3 className="text-[13px] font-black text-white mb-0.5">
                        {activeTab === 'Dojmovi' ? 'Nema Dojmova' : activeTab === 'Info' ? 'Nema Informacija' : 'Nema Oglasa'}
                    </h3>
                    <p className="text-[10px] text-gray-500 max-w-[180px] leading-relaxed mb-4">
                        {activeTab === 'Dojmovi' 
                            ? 'Tvoj zid dojmova je trenutno prazan.' 
                            : 'Ova sekcija je trenutno prazna.'}
                    </p>
                    
                    {activeTab !== 'Info' && activeTab !== 'Dojmovi' && (
                        <button className="blue-gradient px-4 py-2.5 rounded-[12px] text-white font-bold text-[9px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                            <i className="fa-solid fa-plus"></i>
                            Objavi Oglas
                        </button>
                    )}
                </div>
            </div>
        )}

      </div>
    </Layout>
  );
};

export default Profile;
