
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { MOCK_PRODUCTS, CATEGORIES } from '../constants';
import { Product, Category } from '../types';

// Map images to category IDs for a rich visual experience
const CATEGORY_IMAGES: Record<string, string> = {
  'kategorije': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400',
  'sigurnost': 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400',
  'vozila': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400',
  'nekretnine': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400',
  'servisi': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=400',
  'poslovi': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=400',
  'dijelovi': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=400',
  'mobiteli': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400',
  'kompjuteri': 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=400',
  'tehnika': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400',
  'dom': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=400',
  'biznis': 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=400',
  'odjeca': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400',
  'sport': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=400',
  'hrana': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
  'nakit': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400',
  'zivotinje': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400',
  'ljepota': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=400',
  'bebe': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df4?auto=format&fit=crop&q=80&w=400',
  'igracke': 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&q=80&w=400',
  'videoigre': 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=400',
  'muzika': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=400',
  'literatura': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
  'umjetnost': 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&q=80&w=400',
  'kolekcionarstvo': 'https://images.unsplash.com/photo-1594132865764-6df3d8583c72?auto=format&fit=crop&q=80&w=400',
  'antikviteti': 'https://images.unsplash.com/photo-1559868697-3f365d83a152?auto=format&fit=crop&q=80&w=400',
  'karte': 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&q=80&w=400',
  'audio-video': 'https://images.unsplash.com/photo-1517436073-3b1b1778796c?auto=format&fit=crop&q=80&w=400',
  'poklanjam': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400',
  'glazbala': 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&q=80&w=400',
  'ostalo': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400'
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-[#121C26] rounded-[16px] overflow-hidden flex flex-col border border-white/5 relative group active:scale-[0.98] transition-transform h-[190px] w-full cursor-pointer shadow-lg hover:border-white/10"
    >
      {/* Image Area */}
      <div className="relative h-[130px] w-full shrink-0 overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2 blue-gradient px-2 py-0.5 rounded-[6px] shadow-lg flex items-center gap-0.5 z-10 border border-white/10">
          <span className="text-white text-[8px] font-bold opacity-80 leading-none">€</span>
          <span className="text-white text-[11px] font-extrabold leading-none">{product.price.toLocaleString()}</span>
        </div>
        
        {/* Heart Icon */}
        <div className="absolute top-2 left-2 z-10">
           <button 
             onClick={toggleFavorite}
             className={`w-6 h-6 rounded-full flex items-center justify-center transition-all border border-white/5 ${
               isFavorite ? 'bg-red-500/80 text-white' : 'bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60'
             }`}
           >
              <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-[10px]`}></i>
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-2 flex flex-col justify-center overflow-hidden bg-[#121C26]">
        <h3 className="text-[11px] font-bold text-white leading-tight line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        <div className="flex justify-between items-end mt-auto">
            <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-medium truncate max-w-[80px]">{product.location}</span>
                <span className="text-[8px] text-gray-600">{product.timeLabel.split(' ').pop()}</span>
            </div>
            <span className="text-[10px] font-bold text-blue-400 tracking-tighter leading-none bg-blue-500/10 px-1.5 py-0.5 rounded text-right">
                {product.secondaryPriceLabel}
            </span>
        </div>
      </div>
    </div>
  );
};

// Top Priority Categories IDs
const PRIMARY_IDS = ['vozila', 'nekretnine', 'servisi', 'poslovi', 'tehnika', 'dom'];

interface CategoryButtonProps {
  cat: Category;
  isActive: boolean;
  onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ cat, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`min-w-[75px] h-[90px] rounded-[16px] border relative overflow-hidden group transition-all duration-300 shrink-0 ${
            isActive 
            ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105 z-10' 
            : 'border-white/5 hover:border-white/20'
        }`}
    >
        {/* Background Image */}
        <img 
            src={CATEGORY_IMAGES[cat.id] || 'https://via.placeholder.com/150'} 
            alt={cat.name} 
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-110 blur-[1px]' : 'group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0'}`}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>

        {/* Content */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className={`fa-solid ${cat.icon} text-white/50 text-[10px]`}></i>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-2 flex flex-col items-center justify-end h-full text-center">
            <span className={`text-[9px] font-bold uppercase leading-tight transition-colors ${isActive ? 'text-blue-400' : 'text-white'}`}>
                {cat.name}
            </span>
            {isActive && (
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-0.5"></div>
            )}
        </div>
    </button>
  );

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Sve');
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [showLocalSecurity, setShowLocalSecurity] = useState(false);
  const [showSecondaryCats, setShowSecondaryCats] = useState(false);

  // Split categories
  const primaryCategories = CATEGORIES.filter(c => PRIMARY_IDS.includes(c.id));
  const secondaryCategories = CATEGORIES.filter(c => !PRIMARY_IDS.includes(c.id));

  // Generate ~40 items by multiplying the mock data
  const displayedProducts = useMemo(() => {
    let base = MOCK_PRODUCTS;
    // Filter first if category is selected (basic filter)
    if (activeCategory !== 'Sve') {
        base = MOCK_PRODUCTS.filter(p => p.category === activeCategory);
        // If empty mock data for category, show nothing or duplicates of generic
        if (base.length === 0) return []; 
    }
    
    // Duplicate array to reach approx 40 items
    const multiplied = [];
    for(let i = 0; i < 14; i++) {
        multiplied.push(...base);
    }
    
    // Add unique IDs to avoid React key warnings
    return multiplied.map((p, index) => ({
        ...p,
        id: `${p.id}-${index}`
    }));
  }, [activeCategory]);

  // Extract ONLY vehicles from the generated products for the top scroll section
  const vehicleProducts = useMemo(() => {
     // Ensure we show vehicles if we are in "Sve" mode
     if (activeCategory === 'Sve') {
        return displayedProducts.filter(p => p.category === 'Vozila');
     }
     return [];
  }, [displayedProducts, activeCategory]);

  return (
    <Layout>
      <div className="relative">
        
        {/* AI INFO MODAL */}
        {showAiInfo && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAiInfo(false)}></div>
                <div className="relative bg-[#121C26] border border-purple-500/30 w-full max-w-sm rounded-[32px] p-6 shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                    
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <i className="fa-solid fa-wand-magic-sparkles text-3xl text-purple-400"></i>
                        </div>
                        
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">NudiNađi AI</h2>
                            <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mt-1">Smart Engine</p>
                        </div>

                        <div className="bg-black/20 rounded-[20px] p-4 w-full border border-white/5 text-left space-y-3">
                            <div className="flex gap-3">
                                <i className="fa-solid fa-magnifying-glass-chart text-blue-400 mt-1"></i>
                                <div>
                                    <h4 className="text-[12px] font-bold text-white">Pametna Pretraga</h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Ne moraš znati tačan naziv. AI razumije sinonime, ispravlja greške u kucanju i prepoznaje sleng.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowAiInfo(false)}
                            className="w-full py-3 rounded-[16px] bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Zatvori
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* SECURITY MODAL (Local) */}
        {showLocalSecurity && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLocalSecurity(false)}></div>
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
                                        Skeniramo sumnjive aktivnosti i štitimo vaš identitet 24/7.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowLocalSecurity(false)}
                            className="w-full py-3 rounded-[16px] bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            U redu
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- STICKY HEADER SECTION (Search + Categories) --- */}
        <div className="sticky top-16 z-30 bg-[#060E14]/95 backdrop-blur-xl -mx-4 px-4 pt-4 pb-0 border-b border-white/5 shadow-lg shadow-black/20 transition-all">
            
            {/* CENTERED COMPACT SEARCH BAR */}
            <div className="flex justify-center mb-3">
                <div className="flex gap-2 w-full max-w-[480px]">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-[20px] blur-md group-hover:bg-blue-500/10 transition-colors"></div>
                        <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-[12px] group-focus-within:text-blue-400 transition-colors z-10"></i>
                        <input 
                            type="text" 
                            placeholder="Traži... (AI)" 
                            className="relative z-10 w-full bg-[#121C26] border border-white/10 rounded-[20px] py-3.5 pl-12 pr-4 text-[13px] focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder:text-gray-500 transition-all shadow-lg"
                        />
                    </div>
                    <button 
                        onClick={() => setShowAiInfo(true)}
                        className="relative z-10 bg-[#121C26] border border-white/10 w-[50px] rounded-[20px] flex items-center justify-center hover:bg-white/5 transition-colors active:scale-95 group shadow-lg"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles text-blue-400 text-[14px] group-hover:scale-110 transition-transform"></i>
                    </button>
                </div>
            </div>

            {/* VISUAL CATEGORIES (PRIMARY ROW) */}
            <div className="flex justify-center w-full">
                <div className="overflow-x-auto no-scrollbar w-full max-w-5xl touch-pan-x pb-2 pr-6">
                    <div className="flex gap-2.5 px-1 md:justify-center min-w-max">
                        
                        {/* 1. KATEGORIJE (Reset) */}
                        <button 
                            onClick={() => setActiveCategory('Sve')}
                            className={`min-w-[75px] h-[90px] rounded-[16px] border relative overflow-hidden group transition-all duration-300 shrink-0 ${
                            activeCategory === 'Sve'
                            ? 'border-white ring-2 ring-white/20 scale-105 z-10' 
                            : 'border-white/5 hover:border-white/20'
                            }`}
                        >
                            <img src={CATEGORY_IMAGES['kategorije']} alt="Categories" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
                                    <i className="fa-solid fa-layer-group text-white text-sm"></i>
                                </div>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 p-2 text-center">
                                <span className="text-[9px] font-black text-white uppercase tracking-wider">Sve Kategorije</span>
                            </div>
                        </button>

                        {/* 3. PRIMARY CATEGORIES */}
                        {primaryCategories.map((cat) => (
                            <CategoryButton key={cat.id} cat={cat} isActive={activeCategory === cat.name} onClick={() => setActiveCategory(cat.name)} />
                        ))}
                        
                    </div>
                </div>
            </div>

            {/* NEW "VIŠE" BUTTON BAR - Centered below */}
            <div className="flex justify-center pb-2">
                <button 
                    onClick={() => setShowSecondaryCats(!showSecondaryCats)}
                    className="flex items-center gap-2 px-6 py-1.5 bg-[#121C26] border border-white/10 rounded-full text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 shadow-sm"
                >
                    <span>{showSecondaryCats ? 'Manje' : 'Više kategorija'}</span>
                    <i className={`fa-solid fa-chevron-down transition-transform ${showSecondaryCats ? 'rotate-180' : ''}`}></i>
                </button>
            </div>
        </div>

        {/* --- SECONDARY CATEGORIES (CONDITIONAL ROW) --- */}
        {showSecondaryCats && (
            <div className="overflow-x-auto no-scrollbar py-6 px-4 md:px-8 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex gap-2.5 w-max mx-auto">
                    {secondaryCategories.map((cat) => (
                        <CategoryButton key={cat.id} cat={cat} isActive={activeCategory === cat.name} onClick={() => setActiveCategory(cat.name)} />
                    ))}
                </div>
            </div>
        )}

        {/* NEW SPECIFIC 'VOZILA' SCROLL SECTION (Only visible on Home/Sve) */}
        {vehicleProducts.length > 0 && (
            <div className="pt-6 pl-1 md:pl-0">
                <div className="flex justify-between items-end mb-3 pr-2">
                    <div>
                        <h2 className="text-[16px] font-black text-white leading-none tracking-tight">Vozila</h2>
                        <p className="text-[10px] text-gray-500 mt-1 font-medium">Izdvojeno iz ponude</p>
                    </div>
                    <button 
                        onClick={() => setActiveCategory('Vozila')}
                        className="text-[10px] font-bold text-blue-400 hover:text-white transition-colors"
                    >
                        Vidi sve
                    </button>
                </div>
                <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 pr-4">
                    {vehicleProducts.slice(0, 10).map((p) => (
                        <div key={`vozila-${p.id}`} className="min-w-[150px] w-[150px] shrink-0">
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Recommended Grid - 40 Items */}
        <div className="pt-2 pb-28">
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h2 className="text-[16px] font-black text-white leading-none tracking-tight">Istraži</h2>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">Najnovije iz ponude</p>
            </div>
            <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Filteri</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4">
            {displayedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
          </div>
          
          {displayedProducts.length === 0 && (
              <div className="text-center py-20 text-gray-500 text-xs">Nema rezultata za ovu kategoriju.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
