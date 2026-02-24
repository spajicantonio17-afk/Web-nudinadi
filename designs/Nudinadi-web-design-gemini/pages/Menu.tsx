
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

type MenuStep = 'main' | 'account' | 'main-settings' | 'security' | 'devices' | 'notifications' | 'appearance' | 'language' | 'support';

// --- SUB-COMPONENTS FOR SETTINGS UI ---

const ToggleRow: React.FC<{ label: string; desc?: string; isOn: boolean; onToggle: () => void }> = ({ label, desc, isOn, onToggle }) => (
    <div onClick={onToggle} className="flex items-center justify-between p-4 bg-[#121C26] border border-white/5 rounded-[18px] mb-2 cursor-pointer active:scale-[0.99] transition-all">
        <div>
            <h4 className="text-[13px] font-bold text-white">{label}</h4>
            {desc && <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>}
        </div>
        <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-blue-500' : 'bg-white/10'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </div>
    </div>
);

const SelectionRow: React.FC<{ label: string; isSelected: boolean; onClick: () => void; icon?: string }> = ({ label, isSelected, onClick, icon }) => (
    <div onClick={onClick} className={`flex items-center justify-between p-4 border rounded-[18px] mb-2 cursor-pointer transition-all ${isSelected ? 'bg-blue-500/10 border-blue-500/50' : 'bg-[#121C26] border-white/5 hover:border-white/10'}`}>
        <div className="flex items-center gap-3">
            {icon && <i className={`fa-solid ${icon} ${isSelected ? 'text-blue-400' : 'text-gray-500'}`}></i>}
            <h4 className={`text-[13px] font-bold ${isSelected ? 'text-blue-400' : 'text-white'}`}>{label}</h4>
        </div>
        {isSelected && <i className="fa-solid fa-check text-blue-400 text-sm"></i>}
    </div>
);

const AppIconOption: React.FC<{ name: string; colors: string; isSelected: boolean; onClick: () => void }> = ({ name, colors, isSelected, onClick }) => (
    <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group">
        <div className={`w-16 h-16 rounded-[18px] ${colors} shadow-lg flex items-center justify-center text-2xl text-white transition-all duration-300 relative ${isSelected ? 'scale-110 ring-2 ring-offset-2 ring-offset-[#0B151E] ring-blue-500' : 'opacity-70 group-hover:opacity-100'}`}>
            <i className="fa-solid fa-cube"></i>
            {isSelected && <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-[#0B151E] flex items-center justify-center"><i className="fa-solid fa-check text-[8px]"></i></div>}
        </div>
        <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-400' : 'text-gray-500'}`}>{name}</span>
    </div>
);

const MenuOption: React.FC<{ label: string; badge?: string; icon: string; onClick: () => void }> = ({ label, badge, icon, onClick }) => (
  <div onClick={onClick} className="bg-[#121C26] border border-white/5 rounded-[18px] p-4 mb-2.5 flex items-center justify-between group active:bg-white/5 transition-all cursor-pointer">
    <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
            <i className={`fa-solid ${icon} text-gray-400 group-hover:text-blue-400 transition-colors`}></i>
        </div>
        <span className="text-[14px] font-semibold text-white/90">{label}</span>
    </div>
    <div className="flex items-center gap-3">
        {badge && (
            <span className="bg-blue-500/10 text-[9px] font-bold px-2 py-0.5 rounded-md text-blue-400 border border-blue-500/20 uppercase tracking-wider">{badge}</span>
        )}
        <i className="fa-solid fa-chevron-right text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors"></i>
    </div>
  </div>
);

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<MenuStep>('main');
  
  // State for Settings
  const [notifSettings, setNotifSettings] = useState({
      messages: true,
      search: true,
      promotions: false,
      priceDrops: true
  });
  
  // State for Main Settings (Glavne Postavke)
  const [generalSettings, setGeneralSettings] = useState({
      location: true,
      dataSaver: false,
      autoPlay: true
  });

  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [appIcon, setAppIcon] = useState('classic');
  const [language, setLanguage] = useState('bhs');

  const goToProfileTab = (tab: string) => {
    navigate('/profile', { state: { tab } });
  };

  // --- SUB-PAGES RENDER LOGIC ---

  if (step === 'main-settings') {
    return (
      <Layout title="Glavne Postavke" showSigurnost={false} headerRight={<button onClick={() => setStep('main')} className="text-gray-400 hover:text-white font-bold text-xs uppercase">Nazad</button>}>
          <div className="pt-2 pb-24 space-y-6">
              
              {/* Header Card */}
              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-[22px] p-6 mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[30px]"></div>
                  <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                          <i className="fa-solid fa-sliders text-xl"></i>
                      </div>
                      <div>
                          <h3 className="text-lg font-black text-white">Sistemske Postavke</h3>
                          <p className="text-[11px] text-blue-200">Prilagodi aplikaciju svojim potrebama</p>
                      </div>
                  </div>
              </div>

              <section>
                  <h2 className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-3 px-2">Općenito</h2>
                  <ToggleRow 
                      label="Automatska Lokacija" 
                      desc="Koristi GPS za prikazivanje oglasa u blizini" 
                      isOn={generalSettings.location} 
                      onToggle={() => setGeneralSettings({...generalSettings, location: !generalSettings.location})} 
                  />
                  <ToggleRow 
                      label="Data Saver" 
                      desc="Smanji kvalitetu slika na mobilnim podacima" 
                      isOn={generalSettings.dataSaver} 
                      onToggle={() => setGeneralSettings({...generalSettings, dataSaver: !generalSettings.dataSaver})} 
                  />
                  <ToggleRow 
                      label="Autoplay Video" 
                      desc="Automatski pokreni videozapise u listi" 
                      isOn={generalSettings.autoPlay} 
                      onToggle={() => setGeneralSettings({...generalSettings, autoPlay: !generalSettings.autoPlay})} 
                  />
              </section>

              <section>
                  <h2 className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-3 px-2">Regionalne Postavke</h2>
                  <div className="bg-[#121C26] border border-white/5 rounded-[18px] p-1">
                      <button className="w-full text-left p-4 flex justify-between items-center border-b border-white/5">
                          <div>
                            <span className="text-sm font-bold text-white block">Država</span>
                            <span className="text-[10px] text-gray-500">Bosna i Hercegovina</span>
                          </div>
                          <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
                      </button>
                      <button className="w-full text-left p-4 flex justify-between items-center">
                          <div>
                            <span className="text-sm font-bold text-white block">Valuta</span>
                            <span className="text-[10px] text-gray-500">EUR (€) / BAM (KM)</span>
                          </div>
                          <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
                      </button>
                  </div>
              </section>

              <section>
                   <h2 className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-3 px-2">Sistem</h2>
                   <div className="space-y-3">
                       <button className="w-full bg-[#121C26] border border-white/5 rounded-[18px] p-4 text-left flex items-center justify-between text-red-400 font-bold text-sm active:bg-red-500/10 transition-colors">
                           Očisti Cache Memoriju
                           <i className="fa-solid fa-trash-can"></i>
                       </button>

                       <div className="bg-[#121C26] border border-white/5 rounded-[18px] p-4 flex justify-between items-center">
                            <span className="text-sm font-bold text-white">Verzija Aplikacije</span>
                            <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded-md">v2.4.0 (Beta)</span>
                       </div>
                   </div>
              </section>
          </div>
      </Layout>
    );
  }

  if (step === 'appearance') {
      return (
        <Layout title="Izgled i Tema" showSigurnost={false} headerRight={<button onClick={() => setStep('main')} className="text-gray-400 hover:text-white font-bold text-xs uppercase">Gotovo</button>}>
            <div className="space-y-6 pt-2 pb-24">
                {/* App Icon Switcher */}
                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-4 px-2">App Ikona</h2>
                    <div className="flex gap-4 justify-center bg-[#121C26] border border-white/5 p-6 rounded-[24px]">
                        <AppIconOption name="Classic" colors="bg-gradient-to-br from-blue-600 to-indigo-600" isSelected={appIcon === 'classic'} onClick={() => setAppIcon('classic')} />
                        <AppIconOption name="Stealth" colors="bg-gradient-to-br from-gray-800 to-black border border-white/20" isSelected={appIcon === 'stealth'} onClick={() => setAppIcon('stealth')} />
                        <AppIconOption name="Gold" colors="bg-gradient-to-br from-yellow-400 to-amber-600" isSelected={appIcon === 'gold'} onClick={() => setAppIcon('gold')} />
                        <AppIconOption name="Neon" colors="bg-gradient-to-br from-fuchsia-500 to-purple-600" isSelected={appIcon === 'neon'} onClick={() => setAppIcon('neon')} />
                    </div>
                </section>

                {/* Theme Switcher */}
                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-3 px-2">Tema</h2>
                    <div className="space-y-2">
                        <SelectionRow label="Tamna Tema (Dark)" icon="fa-moon" isSelected={theme === 'dark'} onClick={() => setTheme('dark')} />
                        <SelectionRow label="Svijetla Tema (Light)" icon="fa-sun" isSelected={theme === 'light'} onClick={() => setTheme('light')} />
                        <SelectionRow label="Sistemska Postavka" icon="fa-mobile-screen" isSelected={theme === 'system'} onClick={() => setTheme('system')} />
                    </div>
                </section>
            </div>
        </Layout>
      );
  }

  if (step === 'notifications') {
      return (
        <Layout title="Notifikacije" showSigurnost={false} headerRight={<button onClick={() => setStep('main')} className="text-gray-400 hover:text-white font-bold text-xs uppercase">Nazad</button>}>
            <div className="pt-2 pb-24 space-y-6">
                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-3 px-2">Direktne Poruke</h2>
                    <ToggleRow 
                        label="Nove poruke" 
                        desc="Obavijesti me kada dobijem upit za artikal" 
                        isOn={notifSettings.messages} 
                        onToggle={() => setNotifSettings({...notifSettings, messages: !notifSettings.messages})} 
                    />
                </section>

                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-3 px-2">Moji Interesi</h2>
                    <ToggleRow 
                        label="Spašene pretrage" 
                        desc="Kada se pojavi artikal koji tražim" 
                        isOn={notifSettings.search} 
                        onToggle={() => setNotifSettings({...notifSettings, search: !notifSettings.search})} 
                    />
                    <ToggleRow 
                        label="Pad cijena" 
                        desc="Kada artiklu iz favorita padne cijena" 
                        isOn={notifSettings.priceDrops} 
                        onToggle={() => setNotifSettings({...notifSettings, priceDrops: !notifSettings.priceDrops})} 
                    />
                </section>

                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-3 px-2">NudiNađi</h2>
                    <ToggleRow 
                        label="Novosti i Promocije" 
                        desc="Nove funkcije i partner ponude" 
                        isOn={notifSettings.promotions} 
                        onToggle={() => setNotifSettings({...notifSettings, promotions: !notifSettings.promotions})} 
                    />
                </section>
            </div>
        </Layout>
      );
  }

  if (step === 'language') {
      return (
        <Layout title="Jezik / Language" showSigurnost={false} headerRight={<button onClick={() => setStep('main')} className="text-gray-400 hover:text-white font-bold text-xs uppercase">Save</button>}>
             <div className="pt-2 pb-24 space-y-2">
                 <SelectionRow label="Bosanski / Hrvatski / Srpski" isSelected={language === 'bhs'} onClick={() => setLanguage('bhs')} />
                 <SelectionRow label="English (US)" isSelected={language === 'en'} onClick={() => setLanguage('en')} />
                 <SelectionRow label="Deutsch" isSelected={language === 'de'} onClick={() => setLanguage('de')} />
             </div>
        </Layout>
      );
  }

  if (step === 'account') {
      return (
        <Layout title="Lični Podaci" showSigurnost={false} headerRight={<button onClick={() => setStep('main')} className="text-blue-400 hover:text-white font-bold text-xs uppercase">Spremi</button>}>
            <div className="pt-2 pb-24 space-y-4">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden border-2 border-white/10">
                            <img src="https://picsum.photos/seed/me/200/200" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white border-2 border-[#0B151E]">
                            <i className="fa-solid fa-camera text-xs"></i>
                        </button>
                    </div>
                </div>

                <div className="bg-[#121C26] border border-white/5 rounded-[18px] p-4 space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Korisničko Ime</label>
                        <input type="text" defaultValue="Antonios7" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Email Adresa</label>
                        <input type="email" defaultValue="antonios@example.com" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Bio / Opis</label>
                        <textarea rows={3} defaultValue="Curating the best gear." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none resize-none" />
                    </div>
                </div>
            </div>
        </Layout>
      );
  }

  if (step === 'security') {
    return (
        <Layout title="Sigurnost" showSigurnost={false} headerRight={<button onClick={() => setStep('main')} className="text-gray-400 hover:text-white font-bold text-xs uppercase">Nazad</button>}>
            <div className="pt-2 pb-24 space-y-6">
                <div className="bg-[#121C26] border border-white/5 rounded-[18px] p-1">
                    <button className="w-full text-left p-4 flex justify-between items-center border-b border-white/5">
                        <span className="text-sm font-bold text-white">Promijeni Lozinku</span>
                        <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
                    </button>
                    <button className="w-full text-left p-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-white">2-Faktor Autentifikacija</span>
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded uppercase font-bold">Isključeno</span>
                    </button>
                </div>

                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-3 px-2">Aktivne Sesije</h2>
                    <div className="bg-[#121C26] border border-white/5 rounded-[18px] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-mobile-screen text-xl text-gray-400"></i>
                            <div>
                                <h4 className="text-sm font-bold text-white">iPhone 13 Pro</h4>
                                <p className="text-[10px] text-gray-500">Sarajevo, BiH • Trenutno aktivno</p>
                            </div>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                </section>
            </div>
        </Layout>
    );
  }

  // --- MAIN MENU RENDER ---

  return (
    <Layout title="Meni" showSigurnost={false}>
      <div className="mt-2 space-y-4 pb-24">
        {/* User Quick Info */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-[22px] p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full blue-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <i className="fa-solid fa-star"></i>
            </div>
            <div>
                <h3 className="text-[15px] font-bold text-white">Plus Članstvo</h3>
                <p className="text-[11px] text-gray-500 leading-tight">Uživaj u benefitima i bržoj prodaji.</p>
            </div>
        </div>

        {/* MOJI OGLASI (New Section) */}
        <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-gray-600 mb-3 px-2">Moji Oglasi</h2>
            <MenuOption label="Aktivni Oglasi" icon="fa-bolt" onClick={() => goToProfileTab('Aktivni')} />
            <MenuOption label="Završeni Oglasi" icon="fa-flag-checkered" onClick={() => goToProfileTab('Završeni')} />
            <MenuOption label="Arhiv Oglasi" icon="fa-box-archive" onClick={() => goToProfileTab('Arhiv')} />
        </div>

        <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-gray-600 mb-3 mt-4 px-2">Račun</h2>
            <MenuOption label="Lični podaci" icon="fa-user-gear" onClick={() => setStep('account')} />
            <MenuOption label="Sigurnost i lozinka" icon="fa-lock" onClick={() => setStep('security')} />
        </div>

        <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-gray-600 mb-3 mt-4 px-2">Postavke</h2>
            {/* Added Glavne Postavke here */}
            <MenuOption label="Glavne Postavke" icon="fa-sliders" onClick={() => setStep('main-settings')} />
            <MenuOption label="Notifikacije" icon="fa-bell" badge="NOVO" onClick={() => setStep('notifications')} />
            <MenuOption label="Izgled i Tema" icon="fa-palette" onClick={() => setStep('appearance')} />
            <MenuOption label="Jezik / Language" icon="fa-globe" onClick={() => setStep('language')} />
        </div>

        <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-gray-600 mb-3 mt-4 px-2">Podrška</h2>
            <MenuOption label="Pomoć / Support" icon="fa-circle-question" badge="24/7" onClick={() => setStep('support')} />
            <MenuOption label="Uvjeti korištenja" icon="fa-file-lines" onClick={() => setStep('support')} />
        </div>

        <button className="w-full mt-6 py-4 text-red-400 font-bold text-[13px] bg-red-400/5 border border-red-400/10 rounded-[18px] hover:bg-red-400/10 transition-colors">
            Odjavi se
        </button>
      </div>
    </Layout>
  );
};

export default Menu;
