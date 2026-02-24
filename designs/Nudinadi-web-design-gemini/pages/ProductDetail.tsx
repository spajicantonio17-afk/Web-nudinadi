
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { MOCK_PRODUCTS } from '../constants';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const product = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];

  return (
    <Layout title="Artikal" showSigurnost={false} headerRight={
        <button className="text-white/60 hover:text-white transition-colors">
            <i className="fa-solid fa-share-nodes text-lg"></i>
        </button>
    }>
      <div className="pb-32">
        {/* Header / Image Section */}
        <div className="relative -mx-6 -mt-4 mb-5 group">
            <button 
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10"
            >
                <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <div className="aspect-square w-full overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
                <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/20 shadow-xl ${
                        isFavorite ? 'bg-red-500 text-white' : 'bg-black/30 text-white'
                    }`}
                >
                    <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                </button>
            </div>
        </div>

        {/* Info Section */}
        <div className="space-y-5">
            <div className="flex justify-between items-start">
                <div className="space-y-1 max-w-[70%]">
                    <h1 className="text-xl font-bold leading-tight text-white">{product.name}</h1>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <span className="text-blue-400">{product.condition}</span>
                        <span>•</span>
                        <span>{product.location}</span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <span className="text-xl font-black text-white">€{product.price}</span>
                    <p className="text-[9px] text-blue-400 font-bold tracking-tighter">{product.secondaryPriceLabel}</p>
                </div>
            </div>

            <div className="p-4 bg-card rounded-[18px] border border-white/5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Opis</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                    {product.description}. Ovaj artikal je dostupan za brzu kupovinu putem NudiNadji platforme. Ekskluzivno za premium korisnike.
                </p>
            </div>

            {/* Seller Info */}
            <div className="flex items-center justify-between p-3 bg-card rounded-[18px] border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                        <img src={`https://picsum.photos/seed/${product.seller}/100/100`} alt="Seller" />
                    </div>
                    <div>
                        <h4 className="text-[12px] font-bold text-white">@{product.seller}</h4>
                        <div className="flex items-center gap-1">
                            <i className="fa-solid fa-star text-[8px] text-yellow-500"></i>
                            <span className="text-[10px] text-gray-500">4.8 (92)</span>
                        </div>
                    </div>
                </div>
                <button className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white">Prati</button>
            </div>
        </div>

        {/* Floating Actions */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-[100] flex gap-2">
            <button 
                onClick={() => navigate('/messages')}
                className="flex-1 blue-gradient text-white font-black py-4 rounded-[18px] shadow-xl text-sm uppercase tracking-wider active:scale-95 transition-all"
            >
                Započni razgovor
            </button>
            <button className="w-14 bg-card border border-white/10 rounded-[18px] flex items-center justify-center text-white">
                <i className="fa-solid fa-phone"></i>
            </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
