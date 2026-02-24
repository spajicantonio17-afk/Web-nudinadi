
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { MOCK_PRODUCTS, CATEGORIES } from '../constants';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  
  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Layout title="Istraži">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-blue-400 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Pretraži artikle, marke, usluge..." 
            className="w-full bg-[#121C26] border border-white/5 rounded-[20px] py-4 pl-12 pr-4 text-[13px] focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder:text-gray-500 transition-all hover:bg-white/5"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Categories Explorer */}
        <section>
          <h2 className="text-[12px] font-bold uppercase tracking-[2px] text-gray-500 mb-4">Glavne Kategorije</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="bg-[#121C26] border border-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group active:scale-95">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:blue-gradient group-hover:border-transparent transition-all shadow-lg shadow-transparent group-hover:shadow-blue-500/20">
                    <i className={`fa-solid ${cat.icon} text-lg text-blue-400 group-hover:text-white`}></i>
                </div>
                <span className="text-[12px] font-bold text-white/90">{cat.name}</span>
                <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-tighter group-hover:text-gray-400">{cat.subCategories.length} potkategorija</span>
              </div>
            ))}
          </div>
        </section>

        {/* Results / Suggestions */}
        <section className="pb-24">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-[2px] text-gray-500">
                {query ? 'Rezultati pretrage' : 'Nedavno dodano'}
            </h2>
            <button className="text-[10px] font-bold text-blue-400 uppercase hover:text-white transition-colors">Prikaži sve</button>
          </div>
          
          {/* UPDATED GRID to 4-7 COLUMNS on Desktop */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3">
            {filteredProducts.map((p) => (
              <div key={p.id} className="aspect-square bg-[#121C26] border border-white/5 rounded-[16px] overflow-hidden relative group cursor-pointer hover:border-blue-500/30 transition-all">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end h-1/2">
                    <p className="text-[9px] font-bold text-white truncate">{p.name}</p>
                    <p className="text-[8px] font-bold text-blue-400">€{p.price}</p>
                </div>
                {/* Mini Badge */}
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-blue-500/50"></div>
              </div>
            ))}
             {/* Clones for density if empty */}
             {filteredProducts.length > 0 && filteredProducts.map((p) => (
              <div key={`c-${p.id}`} className="aspect-square bg-[#121C26] border border-white/5 rounded-[16px] overflow-hidden relative group cursor-pointer hover:border-blue-500/30 transition-all">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                 <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end h-1/2">
                    <p className="text-[9px] font-bold text-white truncate">{p.name}</p>
                    <p className="text-[8px] font-bold text-blue-400">€{p.price}</p>
                </div>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
              <div className="py-20 text-center text-gray-500 text-xs italic">Nismo pronašli ništa za "{query}"</div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Search;
