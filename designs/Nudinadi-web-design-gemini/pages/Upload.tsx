
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { CATEGORIES } from '../constants';
import { generateListingDescription, suggestPrice, analyzeRawInput } from '../services/geminiService';

type UploadStep = 'selection' | 'all-categories' | 'car-method' | 'nekretnine-sub' | 'mobile-sub' | 'moda-sub' | 'tehnika-sub' | 'services-sub' | 'poslovi-sub' | 'form';

const NEKRETNINE_TYPES = [
  { name: 'Stanovi i Apartmani', icon: 'fa-building' },
  { name: 'Stan na dan', icon: 'fa-suitcase' },
  { name: 'Kuće', icon: 'fa-house' },
  { name: 'Poslovni prostori', icon: 'fa-briefcase' },
  { name: 'Vikendice', icon: 'fa-tree' },
  { name: 'Skladišta i hale', icon: 'fa-warehouse' },
  { name: 'Sobe', icon: 'fa-bed' },
  { name: 'Zemljišta', icon: 'fa-map' },
  { name: 'Garaže', icon: 'fa-dungeon' },
  { name: 'Montažni objekti', icon: 'fa-hammer' },
  { name: 'Ostalo', icon: 'fa-ellipsis' },
];

const MOBILE_BRANDS = [
  { name: 'Apple', icon: 'fa-apple', type: 'brands' },
  { name: 'Google', icon: 'fa-google', type: 'brands' },
  { name: 'Samsung', icon: 'fa-android', type: 'brands' },
  { name: 'Huawei', icon: 'fa-mobile-screen', type: 'solid' },
  { name: 'Xiaomi', icon: 'fa-bolt', type: 'solid' },
  { name: 'Sony', icon: 'fa-gamepad', type: 'solid' },
  { name: 'Nokia', icon: 'fa-mobile-retro', type: 'solid' },
  { name: 'HTC', icon: 'fa-mobile-screen-button', type: 'solid' },
  { name: 'Siemens', icon: 'fa-phone', type: 'solid' },
  { name: 'Faks uređaji', icon: 'fa-fax', type: 'solid' },
  { name: 'Fiksni telefoni', icon: 'fa-phone-flip', type: 'solid' },
  { name: 'Ostalo', icon: 'fa-ellipsis', type: 'solid' },
];

const MODA_TYPES = [
  { name: 'Ženska moda', icon: 'fa-person-dress' },
  { name: 'Muška moda', icon: 'fa-user-tie' },
  { name: 'Dječja odjeća i obuća', icon: 'fa-child-reaching' },
  { name: 'Accessoires', icon: 'fa-hat-cowboy' },
  { name: 'Radna i zaštitna oprema', icon: 'fa-helmet-safety' },
  { name: 'Cipele', icon: 'fa-shoe-prints' },
  { name: 'Nakit (Schmuck)', icon: 'fa-gem' },
  { name: 'Maškare i kostimi', icon: 'fa-mask' },
  { name: 'Dodaci za odjeću', icon: 'fa-socks' },
];

const TEHNIKA_TYPES = [
  { name: 'Kompjuteri (Desktop)', icon: 'fa-desktop' },
  { name: 'Laptopi', icon: 'fa-laptop' },
  { name: 'Monitori / TV', icon: 'fa-tv' },
  { name: 'PC Oprema', icon: 'fa-keyboard' },
  { name: 'Konzole', icon: 'fa-gamepad' },
  { name: 'Video Igre', icon: 'fa-compact-disc' },
  { name: 'Gaming Oprema', icon: 'fa-headset' },
  { name: 'Zvučnici / Audio', icon: 'fa-volume-high' },
  { name: 'Kamere', icon: 'fa-camera' },
  { name: 'Foto Oprema', icon: 'fa-sd-card' },
  { name: 'Gadgets', icon: 'fa-microchip' },
];

const SERVICES_TYPES = [
  { name: 'Zanatstvo i Popravke', icon: 'fa-wrench' }, // Handwerk & Reparaturen
  { name: 'Selidbe i Transport', icon: 'fa-truck-moving' }, // Umzug & Transport
  { name: 'Čišćenje i Održavanje', icon: 'fa-broom' }, // Reinigung & Haushalt
  { name: 'Građevina i Renoviranje', icon: 'fa-trowel-bricks' }, // Bau & Renovierung
  { name: 'Auto Servisi', icon: 'fa-car-wrench' }, // Auto-Services
  { name: 'IT i Tehnika', icon: 'fa-computer' }, // IT & Technik-Services
  { name: 'Instrukcije', icon: 'fa-chalkboard-user' }, // Nachhilfe & Unterricht
  { name: 'Ljepota i Njega', icon: 'fa-spa' }, // Beauty & Pflege
  { name: 'Događaji i Zabava', icon: 'fa-champagne-glasses' }, // Events & Unterhaltung
  { name: 'Ostale Usluge', icon: 'fa-ellipsis' }, // Sonstige
];

const POSLOVI_TYPES = [
  { 
    name: 'Bau & Handwerk', 
    icon: 'fa-hammer',
    subs: 'Bauarbeiter, Helfer, Maurer, Trockenbau, Fliesenleger, Maler, Dachdecker, Schreiner'
  },
  { 
    name: 'Elektro & Technik', 
    icon: 'fa-bolt',
    subs: 'Elektriker, Elektroinstallationen, Netzwerktechnik, Photovoltaik, Smart-Home'
  },
  { 
    name: 'Wasser, Heizung, Klima', 
    icon: 'fa-faucet',
    subs: 'Installateur, Sanitär, Heizungsbauer, Klimaanlagen'
  },
  { 
    name: 'Auto & Transport', 
    icon: 'fa-car',
    subs: 'Kfz-Mechaniker, Autoelektriker, Reifenservice, Abschleppdienst, Fahrer (PKW/LKW)'
  },
  { 
    name: 'IT & Digital', 
    icon: 'fa-laptop-code',
    subs: 'Softwareentwicklung, Webdesign, IT-Support, Systemadmin, Marketing/SEO'
  },
  { 
    name: 'Reinigung & Services', 
    icon: 'fa-broom',
    subs: 'Gebäudereinigung, Büroreinigung, Haushalt, Fensterreinigung'
  },
  { 
    name: 'Immobilien & Facility', 
    icon: 'fa-house-chimney',
    subs: 'Hausmeister, Objektbetreuung, Gartenpflege'
  },
  { 
    name: 'Gastronomie & Hotel', 
    icon: 'fa-utensils',
    subs: 'Koch, Kellner, Küchenhilfe, Hotelservice'
  },
  { 
    name: 'Industrie & Produktion', 
    icon: 'fa-industry',
    subs: 'Produktionsmitarbeiter, Maschinenbediener, Lager & Logistik'
  },
  { 
    name: 'Büro & Verwaltung', 
    icon: 'fa-file-invoice',
    subs: 'Büroassistenz, Buchhaltung, Sekretariat'
  },
  { 
    name: 'Bildung & Betreuung', 
    icon: 'fa-graduation-cap',
    subs: 'Nachhilfe, Sprachunterricht, Kinderbetreuung'
  },
  { 
    name: 'Beauty & Pflege', 
    icon: 'fa-scissors',
    subs: 'Friseur, Kosmetik, Massage'
  },
  { 
    name: 'Sonstiges', 
    icon: 'fa-briefcase',
    subs: 'Freelancer, Projektarbeit, Saisonarbeit, Ostalo'
  }
];

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<UploadStep>('selection');
  const [showAiWindow, setShowAiWindow] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    brand: '',
    description: '',
    model: '',
    year: '',
    vin: ''
  });
  const [standaloneInput, setStandaloneInput] = useState('');
  const [magicSearchInput, setMagicSearchInput] = useState('');
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectCategory = (catName: string) => {
    // Logic: Only trigger VIN detection for Vehicles
    if (catName.toLowerCase().includes('vozila') || catName.toLowerCase() === 'automobili') {
      setFormData({ ...formData, category: catName });
      setStep('car-method');
      return;
    }
    
    // Logic: Sub-selection for Nekretnine
    if (catName.toLowerCase() === 'nekretnine') {
        setStep('nekretnine-sub');
        return;
    }

    // Logic: Sub-selection for Mobilni
    if (catName.toLowerCase().includes('mobilni')) {
        setStep('mobile-sub');
        return;
    }

    // Logic: Sub-selection for Moda (Odjeća i obuća)
    if (catName.toLowerCase().includes('odjeća') || catName.toLowerCase().includes('moda')) {
        setStep('moda-sub');
        return;
    }

    // Logic: Sub-selection for Tehnika
    if (catName.toLowerCase().includes('tehnika') || catName.toLowerCase().includes('računari')) {
        setStep('tehnika-sub');
        return;
    }

    // Logic: Sub-selection for Servisi/Usluge
    if (catName.toLowerCase().includes('servisi') || catName.toLowerCase().includes('usluge')) {
        setStep('services-sub');
        return;
    }

    // Logic: Sub-selection for Poslovi
    if (catName.toLowerCase().includes('poslovi')) {
        setStep('poslovi-sub');
        return;
    }

    setFormData({ ...formData, category: catName });
    setStep('form');
  };

  const selectNekretnineSub = (subCat: string) => {
      setFormData({ ...formData, category: `Nekretnine - ${subCat}` });
      setStep('form');
  };

  const selectMobileSub = (brand: string) => {
    setFormData({ ...formData, category: 'Mobilni uređaji', brand: brand, title: `${brand} ` });
    setStep('form');
  };

  const selectModaSub = (type: string) => {
    setFormData({ ...formData, category: `Moda - ${type}` });
    setStep('form');
  };

  const selectTehnikaSub = (type: string) => {
    setFormData({ ...formData, category: `Tehnika - ${type}` });
    setStep('form');
  };

  const selectServicesSub = (type: string) => {
    setFormData({ ...formData, category: `Usluge - ${type}` });
    setStep('form');
  };

  const selectPosloviSub = (type: string) => {
    setFormData({ ...formData, category: `Poslovi - ${type}` });
    setStep('form');
  };

  const handleMagicSearch = async () => {
      if(!magicSearchInput) return;
      setIsAiLoading(true);
      
      const result = await analyzeRawInput(magicSearchInput);
      
      if (result) {
          setFormData({
              ...formData,
              title: result.title,
              category: result.category,
              description: result.description,
              price: result.price ? result.price.toString() : ''
          });
          
          if (step === 'car-method') {
              // If we are already in car method, proceed to form regardless
              setStep('form');
          } else {
              if (result.isVehicle) {
                  setStep('car-method');
              } else {
                  setStep('form');
              }
          }
      } else {
          alert("AI nije uspio prepoznati artikal. Molimo pokušajte ručno.");
      }
      setIsAiLoading(false);
  };

  const handleVinLookup = () => {
    if (!formData.vin) return;
    setIsAiLoading(true);
    setTimeout(() => {
      setFormData({
        ...formData,
        title: 'Volkswagen Golf 8 2.0 TDI',
        brand: 'Volkswagen',
        model: 'Golf 8',
        year: '2022',
        description: 'Vozilo prepoznato preko VIN broja. Full oprema, digitalna tabla.'
      });
      setIsAiLoading(false);
      setStep('form');
    }, 1500);
  };

  const handlePublish = async () => {
    if (!formData.title) return;
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      navigate('/home');
    }, 2000);
  };

  const getActiveTitle = () => formData.title || standaloneInput;

  const handleAiGenerateDescription = async () => {
    const title = getActiveTitle();
    if (!title) return;
    setIsAiLoading(true);
    const description = await generateListingDescription(title, formData.category || 'General');
    
    setFormData(prev => ({ ...prev, description }));
    setShowAiWindow(false);
    setIsAiLoading(false);
  };

  const handleAiSuggestPrice = async () => {
    const title = getActiveTitle();
    if (!title) return;
    setIsAiLoading(true);
    const price = await suggestPrice(title);
    
    setFormData(prev => ({ ...prev, price: price.toString() }));
    setShowAiWindow(false);
    setIsAiLoading(false);
  };

  // AI Assistant Overlay UI
  const AiAssistantWindow = () => {
    const hasInput = !!getActiveTitle();

    return (
      <div className={`fixed inset-x-0 bottom-0 z-[120] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${showAiWindow ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowAiWindow(false)}></div>
        <div className="relative bg-[#0F161E] border-t border-white/10 rounded-t-[32px] p-6 shadow-2xl">
          <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-8"></div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <i className="fa-solid fa-wand-magic-sparkles text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic tracking-tight">NudiNađi AI</h3>
                      <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">Smart Studio</p>
                    </div>
                </div>
                <button onClick={() => setShowAiWindow(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {!formData.title && (
                <div className="relative">
                    <input 
                        type="text" 
                        value={standaloneInput}
                        onChange={(e) => setStandaloneInput(e.target.value)}
                        placeholder="Šta želiš analizirati?"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-600"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleAiGenerateDescription}
                disabled={!hasInput || isAiLoading}
                className="w-full bg-[#1A242D] border border-white/5 rounded-2xl p-5 flex items-center gap-5 active:scale-95 transition-all text-left group disabled:opacity-50 hover:bg-[#202C36]"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-pen-fancy"></i>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-white">Generiši Opis</h4>
                  <p className="text-[11px] text-gray-500">Profesionalni tekst za prodaju</p>
                </div>
              </button>

              <button 
                onClick={handleAiSuggestPrice}
                disabled={!hasInput || isAiLoading}
                className="w-full bg-[#1A242D] border border-white/5 rounded-2xl p-5 flex items-center gap-5 active:scale-95 transition-all text-left group disabled:opacity-50 hover:bg-[#202C36]"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-white">Provjeri Cijenu</h4>
                  <p className="text-[11px] text-gray-500">Analiza tržišne vrijednosti</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 1. Selection (Main categories) - REDESIGNED BENTO STYLE (Default Step)
  if (step === 'selection') {
    return (
      <Layout title="Kategorija" showSigurnost={false} headerRight={
        <button onClick={() => navigate('/home')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark"></i></button>
      }>
        <div className="space-y-4 pt-2 pb-24">
          <div className="px-1">
             <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-1">Šta prodaješ?</h2>
             <p className="text-sm text-gray-400 font-medium">Samo upiši naziv, AI prepoznaje kategoriju.</p>
          </div>

          {/* MAGIC SEARCH BAR (Moved Up) */}
          <div className="pb-2">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[#0F161E] rounded-[20px] flex items-center p-1.5 border border-white/10">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                             <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                        </div>
                        <input 
                            type="text"
                            value={magicSearchInput}
                            onChange={(e) => setMagicSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                            placeholder="Npr. Sony PS5, Golf 7, Nike Patike..."
                            className="w-full bg-transparent text-[11px] font-medium text-white px-3 focus:outline-none placeholder:text-gray-600"
                        />
                        <button 
                            onClick={handleMagicSearch}
                            disabled={isAiLoading}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                        >
                            {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-arrow-up text-xs"></i>}
                        </button>
                    </div>
                </div>
                <p className="text-center text-[8px] text-gray-600 mt-2 font-medium">
                    <span className="text-blue-500">NudiNađi AI</span> automatski prepoznaje kategoriju i detalje.
                </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Vozila - Hero Card */}
            <button 
                onClick={() => selectCategory('Vozila')}
                className="relative h-28 w-full bg-[#121C26] rounded-[28px] border border-white/5 overflow-hidden group active:scale-[0.98] transition-all flex items-center px-6 gap-6 hover:border-blue-500/20"
            >
                <div className="absolute right-0 top-0 w-32 h-full bg-blue-600/10 -skew-x-12 translate-x-10 group-hover:translate-x-6 transition-transform duration-500"></div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform z-10 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                    <i className="fa-solid fa-car text-2xl"></i>
                </div>
                <div className="text-left z-10">
                    <h3 className="text-lg font-black text-white">Vozila</h3>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Automobili, Motori, Dijelovi</p>
                </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
                 {/* Nekretnine */}
                <button 
                    onClick={() => selectCategory('Nekretnine')}
                    className="relative h-44 bg-[#121C26] rounded-[28px] border border-white/5 overflow-hidden group active:scale-[0.98] transition-all p-5 flex flex-col justify-between items-start hover:border-emerald-500/20"
                >
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/20 blur-[30px] group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <i className="fa-solid fa-building text-lg"></i>
                    </div>
                    <div className="text-left relative z-10">
                        <h3 className="text-[15px] font-bold text-white">Nekretnine</h3>
                        <p className="text-[9px] text-gray-500 mt-0.5 font-medium">Stanovi, Kuće</p>
                    </div>
                </button>

                {/* Mobilni */}
                <button 
                    onClick={() => selectCategory('Mobilni uređaji')}
                    className="relative h-44 bg-[#121C26] rounded-[28px] border border-white/5 overflow-hidden group active:scale-[0.98] transition-all p-5 flex flex-col justify-between items-start hover:border-rose-500/20"
                >
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-rose-500/20 blur-[30px] group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                        <i className="fa-solid fa-mobile-screen text-lg"></i>
                    </div>
                    <div className="text-left relative z-10">
                        <h3 className="text-[15px] font-bold text-white">Mobilni</h3>
                        <p className="text-[9px] text-gray-500 mt-0.5 font-medium">iPhone, Samsung</p>
                    </div>
                </button>
            </div>

            {/* Other Categories Grid */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => selectCategory('Odjeća i obuća')}
                    className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <i className="fa-solid fa-shirt text-xs"></i>
                    </div>
                    <span className="text-xs font-bold text-white">Moda</span>
                </button>

                <button 
                    onClick={() => selectCategory('Tehnika')}
                    className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <i className="fa-solid fa-laptop text-xs"></i>
                    </div>
                    <span className="text-xs font-bold text-white">Tehnika</span>
                </button>

                <button 
                    onClick={() => selectCategory('Servisi i usluge')}
                    className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <i className="fa-solid fa-wrench text-xs"></i>
                    </div>
                    <span className="text-xs font-bold text-white">Usluge</span>
                </button>

                <button 
                    onClick={() => selectCategory('Poslovi')}
                    className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <i className="fa-solid fa-briefcase text-xs"></i>
                    </div>
                    <span className="text-xs font-bold text-white">Poslovi</span>
                </button>
            </div>

            {/* View All Button */}
            <button 
                onClick={() => setStep('all-categories')} 
                className="w-full relative group overflow-hidden bg-white/[0.03] border border-white/10 rounded-[24px] p-5 flex items-center justify-between active:scale-[0.98] transition-all mt-2 hover:bg-white/5"
            >
                <div className="flex items-center gap-4 z-10">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                    <i className="fa-solid fa-layer-group"></i>
                </div>
                <div className="text-left">
                    <h4 className="text-[13px] font-black text-white">Ostale kategorije</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Pogledaj sve opcije</p>
                </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                     <i className="fa-solid fa-arrow-right text-gray-500 text-xs group-hover:text-white transition-colors"></i>
                </div>
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // 2. FULL VERTICAL CATEGORY LIST
  if (step === 'all-categories') {
    return (
      <Layout title="Sve Kategorije" showSigurnost={false} headerRight={
        <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="space-y-2 pt-2 pb-24">
          <div className="px-1 mb-6">
             <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[3px] mb-1">Cijela Lista</h2>
             <p className="text-sm text-gray-400 font-medium">Sve sekcije jedna ispod druge</p>
          </div>

          <div className="flex flex-col gap-2">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => selectCategory(cat.name)}
                className="w-full bg-[#121C26] border border-white/[0.02] rounded-[20px] p-4 flex items-center justify-between group active:scale-[0.99] transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-blue-400 transition-all">
                    <i className={`fa-solid ${cat.icon} text-lg`}></i>
                  </div>
                  <h4 className="text-[14px] font-bold text-white group-hover:text-blue-400 transition-colors">{cat.name}</h4>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-gray-800 group-hover:text-white group-hover:translate-x-1 transition-all"></i>
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // 2.5. NEKRETNINE SUB-SELECTION (New View)
  if (step === 'nekretnine-sub') {
    return (
      <Layout title="Nekretnine" showSigurnost={false} headerRight={
        <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="space-y-4 pt-2 pb-24">
          <div className="px-1 mb-2">
             <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[3px] mb-1">Izaberite kategoriju nekretnine</h2>
             <p className="text-sm text-gray-400 font-medium">Koji tip objekta želite oglasiti?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {NEKRETNINE_TYPES.map((type, index) => (
                <button 
                    key={index}
                    onClick={() => selectNekretnineSub(type.name)}
                    className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center gap-3 text-center group active:scale-95 transition-all hover:bg-white/5 hover:border-emerald-500/30"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <i className={`fa-solid ${type.icon} text-lg`}></i>
                    </div>
                    <div>
                        <span className="text-[12px] font-bold text-white block leading-tight">{type.name}</span>
                        <span className="text-[9px] text-gray-600 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">0{index + 1}</span>
                    </div>
                </button>
             ))}
          </div>
        </div>
      </Layout>
    );
  }

  // 2.6. MOBILE SUB-SELECTION (New View)
  if (step === 'mobile-sub') {
    return (
      <Layout title="Mobilni" showSigurnost={false} headerRight={
        <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="space-y-4 pt-2 pb-24">
          <div className="px-1 mb-2">
             <h2 className="text-[11px] font-black text-rose-500 uppercase tracking-[3px] mb-1">Izaberite Brend</h2>
             <p className="text-sm text-gray-400 font-medium">Koji uređaj želite oglasiti?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {MOBILE_BRANDS.map((brand, index) => (
                <button 
                    key={index}
                    onClick={() => selectMobileSub(brand.name)}
                    className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center gap-3 text-center group active:scale-95 transition-all hover:bg-white/5 hover:border-rose-500/30"
                >
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                        <i className={`${brand.type === 'brands' ? 'fa-brands' : 'fa-solid'} ${brand.icon} text-lg`}></i>
                    </div>
                    <div>
                        <span className="text-[12px] font-bold text-white block leading-tight">{brand.name}</span>
                    </div>
                </button>
             ))}
          </div>

          {/* MAGIC SEARCH BAR (Reused) */}
          <div className="mt-4 border-t border-white/5 pt-6 pb-2">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[#0F161E] rounded-[20px] flex items-center p-1.5 border border-white/10">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                             <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                        </div>
                        <input 
                            type="text"
                            value={magicSearchInput}
                            onChange={(e) => setMagicSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                            placeholder="Npr. iPhone 13 Pro Max plavi..."
                            className="w-full bg-transparent text-[11px] font-medium text-white px-3 focus:outline-none placeholder:text-gray-600"
                        />
                        <button 
                            onClick={handleMagicSearch}
                            disabled={isAiLoading}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                        >
                            {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-arrow-up text-xs"></i>}
                        </button>
                    </div>
                </div>
                <p className="text-center text-[8px] text-gray-600 mt-2 font-medium">
                    <span className="text-rose-500">NudiNađi AI</span> automatski prepoznaje model i specifikacije.
                </p>
            </div>
        </div>
      </Layout>
    );
  }

  // 2.7. MODA SUB-SELECTION (New View)
  if (step === 'moda-sub') {
    return (
      <Layout title="Moda" showSigurnost={false} headerRight={
        <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="space-y-4 pt-2 pb-24">
          <div className="px-1 mb-2">
             <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[3px] mb-1">Kategorije Mode</h2>
             <p className="text-sm text-gray-400 font-medium">Odjeća, obuća i dodaci</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {MODA_TYPES.map((type, index) => (
                <button 
                    key={index}
                    onClick={() => selectModaSub(type.name)}
                    className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center gap-3 text-center group active:scale-95 transition-all hover:bg-white/5 hover:border-amber-500/30"
                >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                        <i className={`fa-solid ${type.icon} text-lg`}></i>
                    </div>
                    <div>
                        <span className="text-[12px] font-bold text-white block leading-tight">{type.name}</span>
                    </div>
                </button>
             ))}
          </div>

          {/* MAGIC SEARCH BAR (Reused) */}
          <div className="mt-4 border-t border-white/5 pt-6 pb-2">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[#0F161E] rounded-[20px] flex items-center p-1.5 border border-white/10">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                             <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                        </div>
                        <input 
                            type="text"
                            value={magicSearchInput}
                            onChange={(e) => setMagicSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                            placeholder="Npr. Crvena haljina M veličina..."
                            className="w-full bg-transparent text-[11px] font-medium text-white px-3 focus:outline-none placeholder:text-gray-600"
                        />
                        <button 
                            onClick={handleMagicSearch}
                            disabled={isAiLoading}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                        >
                            {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-arrow-up text-xs"></i>}
                        </button>
                    </div>
                </div>
                <p className="text-center text-[8px] text-gray-600 mt-2 font-medium">
                    <span className="text-amber-500">NudiNađi AI</span> automatski prepoznaje stil i veličinu.
                </p>
            </div>
        </div>
      </Layout>
    );
  }

  // 2.8. TEHNIKA SUB-SELECTION (New View)
  if (step === 'tehnika-sub') {
    return (
      <Layout title="Tehnika" showSigurnost={false} headerRight={
        <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="space-y-4 pt-2 pb-24">
          <div className="px-1 mb-2">
             <h2 className="text-[11px] font-black text-purple-500 uppercase tracking-[3px] mb-1">IT & Gaming</h2>
             <p className="text-sm text-gray-400 font-medium">Kompjuteri, konzole i oprema</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {TEHNIKA_TYPES.map((type, index) => (
                <button 
                    key={index}
                    onClick={() => selectTehnikaSub(type.name)}
                    className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center gap-3 text-center group active:scale-95 transition-all hover:bg-white/5 hover:border-purple-500/30"
                >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                        <i className={`fa-solid ${type.icon} text-lg`}></i>
                    </div>
                    <div>
                        <span className="text-[12px] font-bold text-white block leading-tight">{type.name}</span>
                    </div>
                </button>
             ))}
          </div>

          {/* MAGIC SEARCH BAR (Reused) */}
          <div className="mt-4 border-t border-white/5 pt-6 pb-2">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[#0F161E] rounded-[20px] flex items-center p-1.5 border border-white/10">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                             <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                        </div>
                        <input 
                            type="text"
                            value={magicSearchInput}
                            onChange={(e) => setMagicSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                            placeholder="Npr. Gaming PC RTX 3060..."
                            className="w-full bg-transparent text-[11px] font-medium text-white px-3 focus:outline-none placeholder:text-gray-600"
                        />
                        <button 
                            onClick={handleMagicSearch}
                            disabled={isAiLoading}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                        >
                            {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-arrow-up text-xs"></i>}
                        </button>
                    </div>
                </div>
                <p className="text-center text-[8px] text-gray-600 mt-2 font-medium">
                    <span className="text-purple-500">NudiNađi AI</span> automatski prepoznaje specifikacije.
                </p>
            </div>
        </div>
      </Layout>
    );
  }

  // 2.9. SERVICES SUB-SELECTION (New View)
  if (step === 'services-sub') {
    return (
      <Layout title="Usluge" showSigurnost={false} headerRight={
        <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="space-y-4 pt-2 pb-24">
          <div className="px-1 mb-2">
             <h2 className="text-[11px] font-black text-cyan-500 uppercase tracking-[3px] mb-1">Kategorije Usluga</h2>
             <p className="text-sm text-gray-400 font-medium">Koju uslugu nudiš ili tražiš?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {SERVICES_TYPES.map((type, index) => (
                <button 
                    key={index}
                    onClick={() => selectServicesSub(type.name)}
                    className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center gap-3 text-center group active:scale-95 transition-all hover:bg-white/5 hover:border-cyan-500/30"
                >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                        <i className={`fa-solid ${type.icon} text-lg`}></i>
                    </div>
                    <div>
                        <span className="text-[12px] font-bold text-white block leading-tight">{type.name}</span>
                    </div>
                </button>
             ))}
          </div>

          {/* MAGIC SEARCH BAR (Reused) */}
          <div className="mt-4 border-t border-white/5 pt-6 pb-2">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[#0F161E] rounded-[20px] flex items-center p-1.5 border border-white/10">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                             <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                        </div>
                        <input 
                            type="text"
                            value={magicSearchInput}
                            onChange={(e) => setMagicSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                            placeholder="Npr. Popravka veš mašine..."
                            className="w-full bg-transparent text-[11px] font-medium text-white px-3 focus:outline-none placeholder:text-gray-600"
                        />
                        <button 
                            onClick={handleMagicSearch}
                            disabled={isAiLoading}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                        >
                            {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-arrow-up text-xs"></i>}
                        </button>
                    </div>
                </div>
                <p className="text-center text-[8px] text-gray-600 mt-2 font-medium">
                    <span className="text-cyan-500">NudiNađi AI</span> automatski prepoznaje tip usluge.
                </p>
            </div>
        </div>
      </Layout>
    );
  }

  // 2.10. POSLOVI SUB-SELECTION (New View with Persistent Search)
  if (step === 'poslovi-sub') {
    return (
      <Layout title="Poslovi" showSigurnost={false} headerRight={
        <button onClick={() => setStep('selection')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white"><i className="fa-solid fa-arrow-left"></i></button>
      }>
        <div className="pb-24 relative min-h-screen">
          
          {/* STICKY HEADER AREA with SEARCH BAR */}
          <div className="sticky top-0 z-20 bg-[#0B151E]/95 backdrop-blur-md pb-4 pt-2 px-1 border-b border-white/5 -mx-6 px-6 mb-4 shadow-2xl">
              <div className="mb-3 px-1">
                <h2 className="text-[11px] font-black text-indigo-500 uppercase tracking-[3px] mb-1">Traži Posao</h2>
                <p className="text-sm text-gray-400 font-medium">Odaberi kategoriju ili pretraži direktno</p>
              </div>

              {/* MAGIC SEARCH BAR (Sticky) */}
              <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[22px] blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[#0F161E] rounded-[20px] flex items-center p-1.5 border border-white/10">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                             <i className="fa-solid fa-magnifying-glass text-sm"></i>
                        </div>
                        <input 
                            type="text"
                            value={magicSearchInput}
                            onChange={(e) => setMagicSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMagicSearch()}
                            placeholder="Traži posao (npr. Vozač kamiona)..."
                            className="w-full bg-transparent text-[11px] font-medium text-white px-3 focus:outline-none placeholder:text-gray-600"
                        />
                        <button 
                            onClick={handleMagicSearch}
                            disabled={isAiLoading}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                        >
                            {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-arrow-right text-xs"></i>}
                        </button>
                    </div>
              </div>
          </div>

          {/* SCROLLABLE LIST OF JOBS */}
          <div className="flex flex-col gap-3">
             {POSLOVI_TYPES.map((type, index) => (
                <button 
                    key={index}
                    onClick={() => selectPosloviSub(type.name)}
                    className="bg-[#121C26] border border-white/5 rounded-[24px] p-5 flex items-start gap-5 text-left group active:scale-[0.99] transition-all hover:bg-white/5 hover:border-indigo-500/30"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform shrink-0 mt-1">
                        <i className={`fa-solid ${type.icon} text-xl`}></i>
                    </div>
                    <div>
                        <span className="text-[14px] font-black text-white block mb-1.5 group-hover:text-indigo-400 transition-colors">{type.name}</span>
                        <span className="text-[10px] text-gray-500 font-medium leading-relaxed block">{type.subs}</span>
                    </div>
                </button>
             ))}
          </div>

        </div>
      </Layout>
    );
  }

  // 3. Car Method (VIN/AI)
  if (step === 'car-method') {
    return (
      <Layout title="Detekcija" showSigurnost={false} headerRight={<button onClick={() => setStep('selection')}><i className="fa-solid fa-arrow-left"></i></button>}>
        <div className="flex flex-col h-full min-h-[70vh] justify-center space-y-8 px-2 relative">
          
          <div className="text-center space-y-2">
             <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <i className="fa-solid fa-car text-2xl text-blue-400"></i>
             </div>
             <h2 className="text-xl font-black text-white">Smart Identifikacija</h2>
             <p className="text-xs text-gray-500">Unesite VIN broj ili opišite vozilo</p>
          </div>

          {/* VIN INPUT */}
          <div className="bg-[#121C26] border border-white/5 rounded-[32px] p-2">
             <div className="bg-black/40 rounded-[28px] p-4 flex gap-3 items-center border border-white/5 focus-within:border-blue-500/50 transition-colors">
                  <input 
                    type="text" 
                    value={formData.vin} 
                    onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})}
                    placeholder="Unesite VIN broj..." 
                    className="w-full bg-transparent text-sm font-mono text-white outline-none placeholder:text-gray-600 uppercase tracking-widest text-center"
                  />
                  <button onClick={handleVinLookup} className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                      <i className="fa-solid fa-arrow-right"></i>
                  </button>
             </div>
          </div>

          <div className="flex items-center gap-4 opacity-20">
             <div className="h-[1px] bg-white flex-1"></div>
             <span className="text-[9px] font-bold uppercase text-white">ILI</span>
             <div className="h-[1px] bg-white flex-1"></div>
          </div>

          {/* NEW AI SEARCH BAR (Replaces Camera Button) */}
          <div className="relative group w-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[28px] blur opacity-30 group-focus-within:opacity-70 transition duration-500"></div>
              <div className="relative bg-[#0F161E] rounded-[26px] flex items-center p-2 border border-white/10 h-24"> {/* Taller height */}
                  <div className="w-16 h-16 rounded-[20px] bg-white/5 flex items-center justify-center text-blue-400 shrink-0 ml-1">
                       <i className="fa-solid fa-wand-magic-sparkles text-2xl"></i>
                  </div>
                  <textarea 
                      value={magicSearchInput}
                      onChange={(e) => setMagicSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleMagicSearch();
                        }
                      }}
                      placeholder="Upišite marku, model, godište... AI će učiniti ostalo."
                      className="w-full h-full bg-transparent text-[14px] font-medium text-white px-4 py-6 focus:outline-none placeholder:text-gray-500 resize-none"
                  />
                  <button 
                      onClick={handleMagicSearch}
                      disabled={isAiLoading}
                      className="w-16 h-16 rounded-[20px] bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50 shrink-0 mr-1"
                  >
                      {isAiLoading ? <i className="fa-solid fa-spinner animate-spin text-lg"></i> : <i className="fa-solid fa-paper-plane text-lg"></i>}
                  </button>
              </div>
          </div>
          <p className="text-center text-[10px] text-gray-500 font-medium">
             Samo napišite šta prodajete i NudiNađi AI će popuniti podatke.
          </p>

          <div className="absolute -bottom-10 left-0 right-0 text-center">
             <button onClick={() => setStep('form')} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-white transition-colors py-4">
                Preskoči ovaj korak
             </button>
          </div>
        </div>
      </Layout>
    );
  }

  // 4. Main Listing Form (Redesigned)
  return (
    <Layout title="Novi Oglas" showSigurnost={false} headerRight={<button onClick={() => setStep('selection')} className="text-gray-500 text-xs font-bold uppercase hover:text-white transition-colors">Nazad</button>}>
      <div className="space-y-5 pb-56 pt-2">
        
        {/* Viewfinder Image Upload */}
        <div className="aspect-video w-full bg-[#0A1016] border border-white/10 rounded-[32px] relative group cursor-pointer overflow-hidden">
           {/* Grid Lines */}
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="w-full h-full border-[0.5px] border-white/20 grid grid-cols-3 grid-rows-3"></div>
           </div>
           
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 transition-transform group-active:scale-95">
               <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-3 group-hover:bg-blue-500 group-hover:border-blue-500 transition-colors">
                  <i className="fa-solid fa-camera text-xl"></i>
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[3px] group-hover:text-white transition-colors">Dodaj Fotografije</p>
           </div>
           
           {/* Corner markers */}
           <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
           <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-white/30 rounded-tr-lg"></div>
           <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
           <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
        </div>

        <div className="space-y-2">
          {/* Title Input Block */}
          <div className="bg-[#121C26] rounded-[24px] border border-white/5 p-1 focus-within:border-blue-500/50 transition-colors">
              <div className="px-5 pt-4">
                  <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Naslov</label>
              </div>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="Šta prodaješ?" 
                className="w-full bg-transparent p-5 pt-1 text-lg font-bold text-white placeholder:text-gray-700 outline-none" 
              />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Price Block */}
            <div className="bg-[#121C26] rounded-[24px] border border-white/5 p-1 focus-within:border-green-500/50 transition-colors">
                <div className="px-5 pt-4">
                    <label className="text-[9px] font-black text-green-500 uppercase tracking-widest">Cijena €</label>
                </div>
                <input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                    placeholder="0" 
                    className="w-full bg-transparent p-5 pt-1 text-lg font-bold text-white placeholder:text-gray-700 outline-none" 
                />
            </div>
            
            {/* Year Block */}
            <div className="bg-[#121C26] rounded-[24px] border border-white/5 p-1 focus-within:border-purple-500/50 transition-colors">
                <div className="px-5 pt-4">
                    <label className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Stanje</label>
                </div>
                <input 
                    type="text" 
                    value={formData.year} 
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })} 
                    placeholder="Novo?" 
                    className="w-full bg-transparent p-5 pt-1 text-lg font-bold text-white placeholder:text-gray-700 outline-none" 
                />
            </div>
          </div>

          {/* Description Block */}
          <div className="bg-[#121C26] rounded-[24px] border border-white/5 p-5 focus-within:border-gray-500 transition-colors min-h-[140px]">
             <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Opis Artikla</label>
             <textarea 
                rows={4} 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Detalji, specifikacije, razlog prodaje..." 
                className="w-full bg-transparent text-sm text-gray-300 placeholder:text-gray-700 outline-none resize-none leading-relaxed" 
            />
          </div>
        </div>

        <button 
          onClick={handlePublish}
          disabled={isPublishing || !formData.title}
          className="w-full blue-gradient text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
        >
          {isPublishing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
          <span className="text-sm uppercase tracking-[2px]">{isPublishing ? 'Objavljivanje...' : 'Objavi Oglas'}</span>
        </button>

        {/* AI WINDOW TRIGGER */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] w-full max-w-[340px] px-2">
          <button 
            onClick={() => setShowAiWindow(true)}
            className="w-full bg-black/60 backdrop-blur-xl border border-blue-500/30 rounded-full py-4 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(59,130,246,0.2)] animate-pulse hover:animate-none group transition-all"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-blue-400 text-sm group-hover:scale-125 transition-transform"></i>
            <span className="text-[10px] font-black text-white uppercase tracking-[4px]">AI Asistent</span>
          </button>
        </div>

        <AiAssistantWindow />
      </div>
    </Layout>
  );
};

export default Upload;
