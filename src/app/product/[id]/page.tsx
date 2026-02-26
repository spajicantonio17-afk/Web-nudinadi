'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useFavorites } from '@/lib/favorites';
import { useCart } from '@/lib/cart';
import { useToast } from '@/components/Toast';
import { getProductById, incrementViews, markProductAsSold, deleteProduct } from '@/services/productService';
import { getOrCreateConversation } from '@/services/messageService';
import { getProductQuestions, askQuestion, answerQuestion, type QuestionWithUser } from '@/services/questionService';
import { createReview, hasUserReviewed } from '@/services/reviewService';
import { useAuth } from '@/lib/auth';
import type { ProductFull } from '@/lib/database.types';
import { BAM_RATE } from '@/lib/constants';

function formatTimeLabel(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return 'Upravo sada';
  if (h < 24) return `Prije ${h}h`;
  if (d === 1) return 'Jučer';
  if (d < 7) return `Prije ${d} dana`;
  return `Prije ${Math.floor(d / 7)} sedmica`;
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'Novo', like_new: 'Kao novo', used: 'Korišteno',
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();

  const isFavorite = checkFavorite(params.id || '');
  const inCart = isInCart(params.id || '');

  const [product, setProduct] = useState<ProductFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [questionText, setQuestionText] = useState('');
  const [questions, setQuestions] = useState<QuestionWithUser[]>([]);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    setIsLoading(true);
    getProductById(params.id)
      .then(data => {
        setProduct(data);
        incrementViews(params.id).catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));

    // Fragen laden
    getProductQuestions(params.id)
      .then(setQuestions)
      .catch(() => {});
  }, [params.id]);

  // Prüfen ob User schon bewertet hat (wenn User geladen und nicht Verkäufer)
  useEffect(() => {
    if (!user?.id || !product?.seller_id || user.id === product.seller_id) return;
    hasUserReviewed(user.id, product.seller_id, product.id)
      .then(setAlreadyReviewed)
      .catch(() => {});
  }, [user?.id, product?.seller_id, product?.id]);

  const galleryImages = product?.images?.length
    ? product.images
    : [`https://picsum.photos/seed/${params.id}/800/800`];

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  }, [galleryImages.length]);

  const handleSubmitQuestion = async () => {
      if (!questionText.trim() || !user || !params.id) return;
      try {
        const newQ = await askQuestion(params.id, user.id, questionText.trim());
        setQuestions(prev => [newQ, ...prev]);
        setQuestionText('');
      } catch {
        showToast('Greška pri slanju pitanja', 'error');
      }
  };

  const handleAnswerQuestion = async (questionId: string) => {
      if (!answerText.trim() || !user) return;
      try {
        await answerQuestion(questionId, answerText.trim(), user.id);
        setQuestions(prev => prev.map(q =>
          q.id === questionId ? { ...q, answer: answerText.trim(), answered_at: new Date().toISOString() } : q
        ));
        setAnsweringId(null);
        setAnswerText('');
      } catch {
        showToast('Greška pri odgovaranju', 'error');
      }
  };

  const handleContactSeller = async () => {
    if (!user) { router.push('/login?redirect=/product/' + params.id); return; }
    if (!product) return;
    if (product.seller_id === user.id) { showToast('Ovo je vaš oglas', 'info'); return; }
    try {
      const convo = await getOrCreateConversation(user.id, product.seller_id, product.id);
      router.push(`/messages?conversation=${convo.id}`);
    } catch { showToast('Greška pri otvaranju poruke', 'error'); }
  };

  const handleMarkAsSold = async () => {
    if (!product || !user) return;
    try {
      await markProductAsSold(product.id);
      setProduct({ ...product, status: 'sold' });
      showToast('Oglas označen kao prodan!');
    } catch {
      showToast('Greška pri označavanju', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !user) return;
    if (!window.confirm('Jeste li sigurni da želite obrisati ovaj oglas?')) return;
    try {
      await deleteProduct(product.id);
      showToast('Oglas obrisan');
      router.push('/');
    } catch {
      showToast('Greška pri brisanju', 'error');
    }
  };

  const handleReport = async () => {
    if (!reportReason || reportSubmitting) return;
    setReportSubmitting(true);
    try {
      // Report via admin API
      await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: params.id,
          reporter_id: user?.id || null,
          reason: reportReason,
          details: reportDetails.trim() || null,
        }),
      });
      showToast('Prijava poslana. Hvala!');
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
    } catch {
      showToast('Greška pri slanju prijave', 'error');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: product?.title || 'NudiNađi oglas', url };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Link kopiran u clipboard!');
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !product || reviewRating === 0 || reviewSubmitting) return;
    setReviewSubmitting(true);
    try {
      await createReview({
        reviewer_id: user.id,
        reviewed_user_id: product.seller_id,
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      setReviewSubmitted(true);
      setAlreadyReviewed(true);
      showToast('Dojam uspješno ostavljen!');
    } catch {
      showToast('Greška pri slanju dojma', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
        if (!isGalleryOpen) return;
        if (e.key === 'ArrowRight') handleNextImage();
        if (e.key === 'ArrowLeft') handlePrevImage();
        if (e.key === 'Escape') setIsGalleryOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isGalleryOpen, handleNextImage, handlePrevImage]);

  if (isLoading) {
    return (
      <MainLayout title="Učitavanje..." showSigurnost={false}>
        <div className="max-w-7xl mx-auto pt-8 pb-24 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-[var(--c-card)] rounded-sm aspect-square animate-pulse" />
            <div className="lg:col-span-5 space-y-4 p-4">
              <div className="h-8 bg-[var(--c-card)] rounded animate-pulse" />
              <div className="h-4 bg-[var(--c-card)] rounded animate-pulse w-2/3" />
              <div className="h-32 bg-[var(--c-card)] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (notFound || !product) {
    return (
      <MainLayout title="Oglas nije pronađen" showSigurnost={false}>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <i className="fa-solid fa-ghost text-5xl text-[var(--c-text3)] mb-4"></i>
          <h2 className="text-xl font-black text-[var(--c-text)] mb-2">Oglas nije pronađen</h2>
          <p className="text-sm text-[var(--c-text3)] mb-6">Oglas je možda uklonjen ili ne postoji.</p>
          <button onClick={() => router.push('/')} className="blue-gradient text-white px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-widest">
            Nazad na početnu
          </button>
        </div>
      </MainLayout>
    );
  }

  const bamPrice = (Number(product.price) * BAM_RATE).toFixed(0);
  const sellerName = product.seller?.username || product.seller_id;
  const sellerAvatar = product.seller?.avatar_url || `https://picsum.photos/seed/${product.seller_id}/100/100`;

  return (
    <MainLayout title="Detalji Artikla" showSigurnost={false}>

      {/* FULL SCREEN GALLERY */}
      {isGalleryOpen && (
        <div role="dialog" aria-modal="true" aria-label={`Galerija slika: ${product.title}`} className="fixed inset-0 z-[200] bg-[var(--c-bg)] flex flex-col items-center justify-center animate-[fadeIn_0.1s_ease-out]">
            <button onClick={() => setIsGalleryOpen(false)} aria-label="Zatvori galeriju" className="absolute top-0 right-0 z-20 w-16 h-16 flex items-center justify-center text-[var(--c-text)] hover:bg-[var(--c-active)] transition-colors border-l border-b border-[var(--c-border2)]">
                <i className="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
            </button>
            <div className="relative w-full h-full flex items-center justify-center p-0 md:p-10">
                <button onClick={(e) => handlePrevImage(e)} aria-label="Prethodna slika" className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-colors">
                    <i className="fa-solid fa-chevron-left text-3xl" aria-hidden="true"></i>
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={galleryImages[currentImageIndex]} alt={`${product.title} — slika ${currentImageIndex + 1} od ${galleryImages.length}`} className="max-h-full max-w-full object-contain" />
                <button onClick={(e) => handleNextImage(e)} aria-label="Sljedeća slika" className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-colors">
                    <i className="fa-solid fa-chevron-right text-3xl" aria-hidden="true"></i>
                </button>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-16 bg-[var(--c-card-alt)] border-t border-[var(--c-border2)] flex items-center justify-center gap-1">
                {galleryImages.map((_, idx) => (
                    <div key={idx} className={`h-1 w-8 transition-all ${idx === currentImageIndex ? 'bg-blue-500' : 'bg-[var(--c-card-alt)]'}`}></div>
                ))}
            </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Prijavi oglas">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
          <div className="relative bg-[var(--c-card)] border border-[var(--c-border2)] rounded-sm w-full max-w-md shadow-xl animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--c-border2)]">
              <h3 className="text-sm font-bold text-[var(--c-text)] uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-flag text-red-500"></i> Prijavi Oglas
              </h3>
              <button onClick={() => setShowReportModal(false)} aria-label="Zatvori" className="w-8 h-8 flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-3">Razlog prijave</p>
                <div className="space-y-2">
                  {[
                    { value: 'fake', label: 'Lažni oglas' },
                    { value: 'inappropriate', label: 'Neprimjeren sadržaj' },
                    { value: 'scam', label: 'Prevara / Prijevara' },
                    { value: 'duplicate', label: 'Duplicirani oglas' },
                    { value: 'wrong_info', label: 'Netočni podaci' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setReportReason(opt.value)}
                      className={`w-full text-left px-4 py-3 text-sm border rounded-sm transition-colors ${
                        reportReason === opt.value
                          ? 'border-red-500 bg-red-50 text-red-700 font-bold'
                          : 'border-[var(--c-border2)] text-[var(--c-text2)] hover:bg-[var(--c-hover)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2 block">Dodatni detalji (opcionalno)</label>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Opiši problem detaljnije..."
                  className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] text-sm text-[var(--c-text)] px-4 py-3 outline-none focus:bg-[var(--c-card-alt)] transition-colors placeholder:text-[var(--c-placeholder)] rounded-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-[var(--c-border2)]">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 h-11 border border-[var(--c-border2)] text-[var(--c-text2)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--c-hover)] transition-colors rounded-sm"
              >
                Odustani
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason || reportSubmitting}
                className="flex-1 h-11 bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors rounded-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {reportSubmitting ? (
                  <><i className="fa-solid fa-spinner animate-spin"></i> Slanje...</>
                ) : (
                  <><i className="fa-solid fa-flag"></i> Pošalji Prijavu</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto pt-4 md:pt-8 pb-24">
        <div className="flex items-center justify-between mb-6 px-4 md:px-0">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors">
                <i className="fa-solid fa-arrow-left"></i><span>Nazad</span>
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReportModal(true)}
                aria-label="Prijavi oglas"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--c-text3)] hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-flag"></i>
                <span className="hidden sm:inline">Prijavi</span>
              </button>
              <button
                onClick={handleShare}
                aria-label="Podijeli oglas"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
              >
                <i className="fa-solid fa-share-nodes"></i>
                <span className="hidden sm:inline">Podijeli</span>
              </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 bg-[var(--c-card-alt)] border-y border-[var(--c-border2)] lg:border lg:rounded-sm overflow-hidden">

            {/* LEFT: IMAGES */}
            <div className="lg:col-span-7 bg-[var(--c-card-alt)] border-b lg:border-b-0 lg:border-r border-[var(--c-border2)] relative">
                <button onClick={() => setIsGalleryOpen(true)} aria-label={`Otvori galeriju slika za ${product.title}`} className="w-full aspect-square relative group cursor-pointer overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={galleryImages[currentImageIndex]} alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:opacity-90" />
                    <div className="absolute bottom-0 right-0 bg-[var(--c-overlay)] text-[var(--c-text)] px-4 py-2 text-xs font-bold flex items-center gap-2" aria-hidden="true">
                        <i className="fa-solid fa-expand"></i><span>ZOOM</span>
                    </div>
                    <div className="absolute top-4 left-0 bg-blue-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm" aria-hidden="true">
                        {CONDITION_LABELS[product.condition] || product.condition}
                    </div>
                </button>
                {galleryImages.length > 1 && (
                  <div className="flex border-t border-[var(--c-border2)] overflow-x-auto no-scrollbar" role="list" aria-label="Slike oglasa">
                      {galleryImages.map((img, idx) => (
                          <button key={idx} type="button" role="listitem" onClick={() => setCurrentImageIndex(idx)} aria-label={`Prikaži sliku ${idx + 1}`} aria-pressed={idx === currentImageIndex} className={`w-20 h-20 sm:w-24 sm:h-24 border-r border-[var(--c-border2)] cursor-pointer shrink-0 ${idx === currentImageIndex ? 'opacity-100 ring-2 ring-inset ring-blue-500' : 'opacity-60 hover:opacity-100'}`}>
                               {/* eslint-disable-next-line @next/next/no-img-element */}
                               <img src={img} alt={`${product.title} — slika ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                      ))}
                  </div>
                )}
            </div>

            {/* RIGHT: DATA */}
            <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8 flex flex-col">
                <div className="mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--c-text)] leading-tight mb-2">{product.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-b border-[var(--c-border)] pb-4 mb-6">
                        <div className="flex items-center gap-2 text-[var(--c-text2)] text-xs">
                            <i className="fa-solid fa-location-dot text-blue-500"></i>
                            <span>{product.location || 'Nepoznato'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--c-text2)] text-xs">
                            <i className="fa-regular fa-clock"></i>
                            <span>{formatTimeLabel(product.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--c-text2)] text-xs sm:ml-auto">
                            <i className="fa-regular fa-eye"></i>
                            <span>{product.views_count.toLocaleString()} pregleda</span>
                        </div>
                    </div>
                </div>

                {product.category && (
                  <div className="mb-4 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[var(--c-text3)]">
                      <span className="border border-[var(--c-border2)] px-2 py-1 rounded-sm bg-[var(--c-card)]">{product.category.name}</span>
                  </div>
                )}

                {/* PRICE */}
                {product.attributes?.price_type === 'Po dogovoru' || ((!product.price && product.price !== 0) || isNaN(Number(product.price))) || (Number(product.price) === 0 && !product.attributes?.price_type) ? (
                  <div className="border border-[var(--c-border2)] rounded-sm overflow-hidden mb-8">
                    <div className="bg-[var(--c-card)] p-5 flex items-center justify-center hover:bg-[var(--c-hover)] transition-colors">
                      <span className="text-2xl font-black text-[var(--c-text)] tracking-tight uppercase">Po dogovoru</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-[var(--c-border2)] rounded-sm overflow-hidden mb-8">
                    <div className="bg-[var(--c-card)] p-5 flex items-center justify-between border-b border-[var(--c-border)] hover:bg-[var(--c-hover)] transition-colors">
                        <span className="text-xs font-bold text-[var(--c-text3)] uppercase tracking-widest">EUR</span>
                        <span className="text-3xl font-black text-[var(--c-text)] tracking-tight">{Number(product.price).toLocaleString()} €</span>
                    </div>
                    <div className="bg-[var(--c-card)] p-5 flex items-center justify-between hover:bg-[var(--c-hover)] transition-colors">
                        <span className="text-xs font-bold text-[var(--c-text3)] uppercase tracking-widest">BAM</span>
                        <span className="text-3xl font-black text-[var(--c-text)] tracking-tight">{bamPrice} KM</span>
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex flex-col gap-3 mb-8">
                    <div className="flex gap-2 sm:gap-3">
                        <button onClick={handleContactSeller} aria-label="Pošalji poruku prodavaču" className="flex-1 bg-[var(--c-text)] text-[var(--c-bg)] h-12 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:opacity-80 transition-colors rounded-sm flex items-center justify-center gap-1.5 sm:gap-2 min-w-0">
                            <i className="fa-regular fa-comment" aria-hidden="true"></i> <span className="truncate">Poruku</span>
                        </button>
                        <button aria-label="Pozovi prodavača telefonom" className="flex-1 bg-[var(--c-card)] text-[var(--c-text)] border border-[var(--c-border2)] h-12 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:bg-[var(--c-hover)] transition-colors rounded-sm flex items-center justify-center gap-1.5 sm:gap-2 min-w-0">
                            <i className="fa-solid fa-phone" aria-hidden="true"></i> <span className="truncate">Telefon</span>
                        </button>
                        <button
                            onClick={() => { toggleFavorite(params.id || ''); showToast(isFavorite ? 'Uklonjeno iz favorita' : 'Dodano u favorite'); }}
                            aria-label={isFavorite ? 'Ukloni iz favorita' : 'Dodaj u favorite'}
                            aria-pressed={isFavorite}
                            className={`w-12 sm:w-14 h-12 shrink-0 border border-[var(--c-border2)] flex items-center justify-center transition-colors rounded-sm ${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-transparent text-[var(--c-text2)] hover:border-[var(--c-text)]'}`}
                        >
                            <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`} aria-hidden="true"></i>
                        </button>
                    </div>
                    <button
                        onClick={() => { if (!inCart) { addToCart(params.id || ''); showToast('Dodano u korpu'); } else { showToast('Već je u korpi', 'info'); } }}
                        aria-label={inCart ? 'Artikal je već u korpi' : 'Dodaj artikal u korpu'}
                        aria-pressed={inCart}
                        className={`w-full h-12 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center gap-2 ${inCart ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                    >
                        <i className={`fa-solid ${inCart ? 'fa-check' : 'fa-bag-shopping'}`} aria-hidden="true"></i>
                        {inCart ? 'U Korpi' : 'Kupi Artikal'}
                    </button>
                </div>

                {/* SELLER MANAGEMENT (nur für Inserat-Eigentümer sichtbar) */}
                {user && product.seller_id === user.id && (
                  <div className="mb-8 border border-amber-500/20 bg-amber-50 rounded-sm p-4">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3">
                      <i className="fa-solid fa-crown mr-1"></i> Tvoj Oglas
                    </p>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => router.push(`/upload?edit=${product.id}`)}
                        className="flex-1 min-w-[80px] h-10 bg-[var(--c-card)] border border-[var(--c-border2)] text-[var(--c-text)] text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:bg-[var(--c-hover)] transition-colors rounded-sm flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        <i className="fa-solid fa-pen"></i> Uredi
                      </button>
                      <button
                        onClick={handleMarkAsSold}
                        disabled={product.status === 'sold'}
                        className="flex-1 min-w-[100px] h-10 bg-emerald-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:bg-emerald-500 transition-colors rounded-sm flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50"
                      >
                        <i className="fa-solid fa-check"></i>
                        {product.status === 'sold' ? 'Prodano' : 'Prodano'}
                      </button>
                      <button
                        onClick={handleDeleteProduct}
                        className="w-10 h-10 shrink-0 border border-red-200 text-red-500 hover:bg-red-50 transition-colors rounded-sm flex items-center justify-center"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* SELLER */}
                <div className="mb-8">
                    <div className="flex justify-end mb-2">
                        <span className="text-[9px] font-mono text-[var(--c-text3)] uppercase tracking-widest">ID: #{product.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-t border-b border-[var(--c-border2)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--c-card-alt)] rounded-sm overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider">@{sellerName}</p>
                                <p className="text-[10px] text-[var(--c-text3)]">
                                    {product.seller?.rating_average ? `★ ${product.seller.rating_average} · ` : ''}Verificirani Prodavač
                                </p>
                            </div>
                        </div>
                        <button onClick={() => router.push(`/user/${sellerName}`)} aria-label={`Pogledaj profil prodavača @${sellerName}`} className="text-[10px] font-bold text-[var(--c-text2)] uppercase tracking-widest hover:text-[var(--c-text)] transition-colors flex items-center gap-1">
                            Profil <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mb-8 flex-1">
                    <h3 className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-3 border-l-2 border-blue-500 pl-2">Opis Artikla</h3>
                    <p className="text-sm text-[var(--c-text2)] font-mono leading-relaxed whitespace-pre-line">
                        {product.description || 'Bez opisa.'}
                    </p>
                </div>
            </div>
        </div>

        {/* REVIEW SECTION — nur für eingeloggte Nicht-Verkäufer */}
        {user && product.seller_id !== user.id && (
          <div className="mt-8">
            <div className="bg-[var(--c-card-alt)] border border-[var(--c-border2)] p-4 sm:p-6 md:p-8 rounded-sm">
              <h3 className="text-sm font-bold text-[var(--c-text)] uppercase tracking-widest mb-6 flex items-center gap-2">
                <i className="fa-solid fa-star text-yellow-500" aria-hidden="true"></i> Ocijeni Prodavača
              </h3>

              {alreadyReviewed || reviewSubmitted ? (
                <div className="flex flex-col items-center py-6 text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-check text-emerald-500 text-xl"></i>
                  </div>
                  <p className="text-sm font-bold text-[var(--c-text)]">Hvala na dojmu!</p>
                  <p className="text-xs text-[var(--c-text3)]">Tvoja ocjena je zabilježena i pomaže zajednici.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Star Picker */}
                  <div>
                    <p className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-3">Tvoja ocjena</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          aria-label={`${star} zvjezdica`}
                          className="text-3xl transition-transform active:scale-90 hover:scale-110"
                        >
                          <i className={`fa-star ${(reviewHover || reviewRating) >= star ? 'fa-solid text-yellow-400' : 'fa-regular text-[var(--c-text-muted)]'}`}></i>
                        </button>
                      ))}
                      {reviewRating > 0 && (
                        <span className="ml-2 text-sm font-bold text-[var(--c-text2)] self-center">
                          {['', 'Loše', 'Ispodprosječno', 'Prosječno', 'Dobro', 'Odlično'][reviewRating]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2 block">Komentar (opcionalno)</label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      maxLength={400}
                      rows={3}
                      placeholder="Kako je bila kupovina? Preporučuješ li prodavača?"
                      className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] text-sm text-[var(--c-text)] px-4 py-3 outline-none focus:bg-[var(--c-card-alt)] transition-colors placeholder:text-[var(--c-placeholder)] rounded-sm resize-none"
                    />
                    <p className="text-[9px] text-[var(--c-text-muted)] text-right mt-0.5">{reviewComment.length}/400</p>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0 || reviewSubmitting}
                    className="w-full h-12 blue-gradient text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                  >
                    {reviewSubmitting ? (
                      <><i className="fa-solid fa-spinner animate-spin"></i> Slanje...</>
                    ) : (
                      <><i className="fa-solid fa-paper-plane"></i> Pošalji Dojam</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PUBLIC Q&A */}
        <div className="mt-8">
            <div className="bg-[var(--c-card-alt)] border border-[var(--c-border2)] p-4 sm:p-6 md:p-8 rounded-sm">
                <h3 className="text-sm font-bold text-[var(--c-text)] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <i className="fa-regular fa-comments" aria-hidden="true"></i> Javna Pitanja
                </h3>
                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2" aria-live="polite" aria-label="Lista pitanja">
                    {questions.length === 0 && (
                        <p className="text-sm text-[var(--c-text3)] text-center py-4">Još nema pitanja. Budi prvi koji pita!</p>
                    )}
                    {questions.map((q) => (
                        <div key={q.id} className="flex flex-col gap-2">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-[var(--c-card-alt)] flex items-center justify-center text-[var(--c-text2)] text-xs font-bold shrink-0 rounded-sm overflow-hidden">
                                    {q.user?.avatar_url
                                      ? <img src={q.user.avatar_url} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                                      : (q.user?.username?.charAt(0) || '?').toUpperCase()
                                    }
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-xs font-bold text-[var(--c-text)]">{q.user?.username || 'Korisnik'}</span>
                                        <span className="text-[10px] text-[var(--c-text3)] font-mono">{formatTimeLabel(q.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-[var(--c-text2)] bg-[var(--c-card)] p-3 border border-[var(--c-border)] rounded-sm inline-block">{q.question}</p>
                                </div>
                            </div>
                            {q.answer && (
                                <div className="flex gap-4 pl-12">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Prodavač</span>
                                        </div>
                                        <p className="text-sm text-[var(--c-text2)] border-l-2 border-blue-500/30 pl-3">{q.answer}</p>
                                    </div>
                                </div>
                            )}
                            {!q.answer && user && product.seller_id === user.id && (
                                answeringId === q.id ? (
                                    <div className="flex gap-2 pl-12">
                                        <input
                                            type="text" value={answerText}
                                            onChange={(e) => setAnswerText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAnswerQuestion(q.id)}
                                            placeholder="Tvoj odgovor..."
                                            className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border2)] text-sm text-[var(--c-text)] px-3 py-2 outline-none focus:bg-[var(--c-card-alt)] transition-colors placeholder:text-[var(--c-placeholder)] rounded-sm"
                                            autoFocus
                                        />
                                        <button onClick={() => handleAnswerQuestion(q.id)} className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors rounded-sm">
                                            Odgovori
                                        </button>
                                        <button onClick={() => { setAnsweringId(null); setAnswerText(''); }} className="text-[var(--c-text3)] hover:text-[var(--c-text)] px-2">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setAnsweringId(q.id)} className="pl-12 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors text-left">
                                        <i className="fa-solid fa-reply mr-1"></i> Odgovori
                                    </button>
                                )
                            )}
                        </div>
                    ))}
                </div>
                <div className="border-t border-[var(--c-border2)] pt-6">
                    <label htmlFor="question-input" className="text-[10px] text-[var(--c-text3)] font-bold uppercase tracking-widest mb-2 block">Postavi javno pitanje</label>
                    {user ? (
                      <div className="flex gap-0">
                          <input id="question-input" type="text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()} placeholder="Zanima me..."
                              className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border2)] border-r-0 text-sm text-[var(--c-text)] px-4 py-3 outline-none focus:bg-[var(--c-card-alt)] transition-colors placeholder:text-[var(--c-placeholder)] rounded-l-sm" />
                          <button type="button" onClick={handleSubmitQuestion} aria-label="Pošalji pitanje" className="bg-[var(--c-text)] text-[var(--c-bg)] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-colors rounded-r-sm">
                              Pošalji
                          </button>
                      </div>
                    ) : (
                      <button onClick={() => router.push('/login?redirect=/product/' + params.id)} className="w-full bg-[var(--c-card)] border border-[var(--c-border2)] text-sm text-[var(--c-text2)] px-4 py-3 rounded-sm hover:bg-[var(--c-hover)] transition-colors text-left">
                          Prijavi se da postaviš pitanje →
                      </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
