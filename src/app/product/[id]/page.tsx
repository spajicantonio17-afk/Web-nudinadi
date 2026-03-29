'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useFavorites } from '@/lib/favorites';
import { useCart } from '@/lib/cart';
import { useToast } from '@/components/Toast';
import { getProductById, incrementViews, deleteProduct, promoteProduct, isPromoted } from '@/services/productService';
import { getOrCreateConversation } from '@/services/messageService';
import { isPro, getPlanLimits } from '@/lib/plans';
import ProBadge from '@/components/ProBadge';
import SellerVerificationBadges from '@/components/SellerVerificationBadges';
import { getProductQuestions, askQuestion, answerQuestion, type QuestionWithUser } from '@/services/questionService';
import { createReview, hasUserReviewed, hasConfirmedTransaction } from '@/services/reviewService';
import { useAuth } from '@/lib/auth';
import type { ProductFull } from '@/lib/database.types';
import { BAM_RATE } from '@/lib/constants';
import { getCurrencyMode, eurToKm } from '@/lib/currency';
import SimilarProducts from '@/components/SimilarProducts';
import ProductAttributes from '@/components/ProductAttributes';
import BuyerPickerModal from '@/components/BuyerPickerModal';
import { addRecentlyViewed } from '@/lib/recently-viewed';
import JsonLd, { buildProductSchema, buildBreadcrumbSchema } from '@/components/JsonLd';
import { useI18n } from '@/lib/i18n';

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

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();

  const CONDITION_LABELS: Record<string, string> = {
    new: t('product.conditionNew'), like_new: t('product.conditionLikeNew'), used: t('product.conditionUsed'),
  };

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

  // Buyer picker state
  const [showBuyerPicker, setShowBuyerPicker] = useState(false);

  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Phone popup state
  const [showPhonePopup, setShowPhonePopup] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    setIsLoading(true);
    getProductById(params.id)
      .then(data => {
        setProduct(data);
        incrementViews(params.id).catch(() => {});
        addRecentlyViewed(params.id);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));

    // Fragen laden
    getProductQuestions(params.id)
      .then(setQuestions)
      .catch(() => {});
  }, [params.id]);

  // Check confirmed transaction + already reviewed
  useEffect(() => {
    if (!user?.id || !product?.seller_id || !product?.id) return;
    hasConfirmedTransaction(user.id, product.id)
      .then(setCanReview)
      .catch(() => {});
    if (user.id === product.seller_id) return;
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
        showToast(t('product.questionError'), 'error');
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
        showToast(t('product.answerError'), 'error');
      }
  };

  const handleContactSeller = async () => {
    if (!user) { router.push('/login?redirect=/product/' + params.id); return; }
    if (!product) return;
    if (product.seller_id === user.id) { showToast(t('product.isYourListing'), 'info'); return; }
    try {
      const convo = await getOrCreateConversation(user.id, product.seller_id, product.id);
      router.push(`/messages?conversation=${convo.id}`);
    } catch { showToast(t('product.contactError'), 'error'); }
  };

  const handleMarkAsSold = () => {
    if (!product || !user) return;
    setShowBuyerPicker(true);
  };

  const handleBuyerPickerSuccess = (status: 'pending_sale' | 'sold') => {
    if (!product) return;
    setShowBuyerPicker(false);
    setProduct({ ...product, status });
    if (status === 'pending_sale') {
      showToast(t('product.transactionCreated'));
    } else {
      showToast(t('product.markedAsSold'));
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !user) return;
    if (!window.confirm(t('product.confirmDelete'))) return;
    try {
      await deleteProduct(product.id);
      showToast(t('product.deleted'));
      router.push('/');
    } catch {
      showToast(t('product.deleteError'), 'error');
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
      showToast(t('product.reportSuccess'));
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
    } catch {
      showToast(t('product.reportError'), 'error');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: product?.title || t('product.shareTitle'), url };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      showToast(t('product.linkCopied'));
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
      showToast(t('product.reviewSuccess'));
    } catch {
      showToast(t('product.reviewError'), 'error');
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
      <MainLayout title={t('product.loadingTitle')} showSigurnost={false}>
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
      <MainLayout title={t('product.notFoundTitle')} showSigurnost={false}>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <i className="fa-solid fa-ghost text-5xl text-[var(--c-text3)] mb-4"></i>
          <h2 className="text-xl font-black text-[var(--c-text)] mb-2">{t('product.notFoundTitle')}</h2>
          <p className="text-sm text-[var(--c-text3)] mb-6">{t('product.notFoundText')}</p>
          <button onClick={() => router.push('/')} className="blue-gradient text-white px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-widest">
            {t('product.backToHome')}
          </button>
        </div>
      </MainLayout>
    );
  }

  const bamPrice = (Number(product.price) * BAM_RATE).toFixed(0);
  const currencyMode = getCurrencyMode();
  const sellerName = product.seller?.username || product.seller_id;
  const sellerAvatar = product.seller?.avatar_url || `https://picsum.photos/seed/${product.seller_id}/100/100`;

  return (
    <MainLayout title={t('product.detailTitle')} showSigurnost={false}>

      {/* JSON-LD Structured Data */}
      <JsonLd data={buildProductSchema(product)} />
      <JsonLd data={buildBreadcrumbSchema([
        { name: 'NudiNađi', url: 'https://nudinadi.com' },
        ...(product.category ? [{ name: product.category.name, url: `https://nudinadi.com/?category=${product.category_id}` }] : []),
        { name: product.title, url: `https://nudinadi.com/product/${product.id}` },
      ])} />

      {/* FULL SCREEN GALLERY */}
      {isGalleryOpen && (
        <div role="dialog" aria-modal="true" aria-label={`${t('product.imageGallery')}: ${product.title}`} className="fixed inset-0 z-[200] bg-[var(--c-bg)] flex flex-col items-center justify-center animate-[fadeIn_0.1s_ease-out]">
            <button onClick={() => setIsGalleryOpen(false)} aria-label={t('product.closeGallery')} className="absolute top-[4.5rem] md:top-20 left-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-[10px] blue-gradient text-white shadow-accent hover:brightness-110 transition-all duration-150 active:scale-95">
                <i className="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
                <span className="text-xs font-bold uppercase tracking-wider">{t('product.closeGallery')}</span>
            </button>
            <div className="relative w-full h-full flex items-center justify-center p-0 md:p-10">
                <button onClick={(e) => handlePrevImage(e)} aria-label={t('product.prevImage')} className="absolute left-0 top-16 bottom-16 w-20 flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-colors">
                    <i className="fa-solid fa-chevron-left text-3xl" aria-hidden="true"></i>
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={galleryImages[currentImageIndex]} alt={`${product.title} — ${t('product.imageAlt', { current: String(currentImageIndex + 1), total: String(galleryImages.length) })}`} className="max-h-full max-w-full object-contain" />
                <button onClick={(e) => handleNextImage(e)} aria-label={t('product.nextImage')} className="absolute right-0 top-16 bottom-16 w-20 flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-hover)] transition-colors">
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t('product.reportTitle')}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
          <div className="relative bg-[var(--c-card)] border border-[var(--c-border2)] rounded-sm w-full max-w-md shadow-xl animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--c-border2)]">
              <h3 className="text-sm font-bold text-[var(--c-text)] uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-flag text-red-500"></i> {t('product.reportTitle')}
              </h3>
              <button onClick={() => setShowReportModal(false)} aria-label={t('common.close')} className="w-8 h-8 flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-3">{t('product.reportReasonLabel')}</p>
                <div className="space-y-2">
                  {[
                    { value: 'fake', label: t('product.reportFake') },
                    { value: 'inappropriate', label: t('product.reportInappropriate') },
                    { value: 'scam', label: t('product.reportScam') },
                    { value: 'duplicate', label: t('product.reportDuplicate') },
                    { value: 'wrong_info', label: t('product.reportWrongInfo') },
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
                <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2 block">{t('product.reportDetailsLabel')}</label>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder={t('product.reportDetailsPlaceholder')}
                  className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] text-sm text-[var(--c-text)] px-4 py-3 outline-none focus:bg-[var(--c-card-alt)] transition-colors placeholder:text-[var(--c-placeholder)] rounded-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-[var(--c-border2)]">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 h-11 border border-[var(--c-border2)] text-[var(--c-text2)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--c-hover)] transition-colors rounded-sm"
              >
                {t('product.reportCancel')}
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason || reportSubmitting}
                className="flex-1 h-11 bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors rounded-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {reportSubmitting ? (
                  <><i className="fa-solid fa-spinner animate-spin"></i> {t('product.reportSubmitting')}</>
                ) : (
                  <><i className="fa-solid fa-flag"></i> {t('product.reportSubmit')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUYER PICKER MODAL */}
      {showBuyerPicker && product && user && (
        <BuyerPickerModal
          productId={product.id}
          sellerId={user.id}
          onClose={() => setShowBuyerPicker(false)}
          onSuccess={handleBuyerPickerSuccess}
        />
      )}

      {/* Phone Popup */}
      {showPhonePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPhonePopup(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-5 w-full max-w-[280px] shadow-xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPhonePopup(false)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[var(--c-hover)] flex items-center justify-center text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors">
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
            {product?.seller?.phone ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-phone text-emerald-500"></i>
                </div>
                <p className="text-[11px] text-[var(--c-text3)] mb-1">{product.seller.username}</p>
                <a href={`tel:${product.seller.phone}`} className="text-lg font-bold text-[var(--c-text)] hover:text-blue-400 transition-colors">
                  {product.seller.phone}
                </a>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--c-hover)] flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-phone-slash text-[var(--c-text3)]"></i>
                </div>
                <p className="text-[13px] font-semibold text-[var(--c-text)] mb-1">{t('product.phoneUnavailable')}</p>
                <p className="text-[11px] text-[var(--c-text3)]">{t('product.phoneNotAdded')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto pt-4 md:pt-8 pb-24">
        <div className="flex items-center justify-between mb-6 px-4 md:px-0">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors">
                <i className="fa-solid fa-arrow-left"></i><span>{t('product.back')}</span>
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReportModal(true)}
                aria-label={t('product.reportTitle')}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--c-text3)] hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-flag"></i>
                <span className="hidden sm:inline">{t('product.reportButton')}</span>
              </button>
              <button
                onClick={handleShare}
                aria-label={t('product.shareButton')}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
              >
                <i className="fa-solid fa-share-nodes"></i>
                <span className="hidden sm:inline">{t('product.shareButton')}</span>
              </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 bg-[var(--c-card-alt)] border-y border-[var(--c-border2)] lg:border lg:rounded-sm overflow-hidden">

            {/* LEFT: IMAGES */}
            <div className="lg:col-span-7 bg-[var(--c-card-alt)] border-b lg:border-b-0 lg:border-r border-[var(--c-border2)] relative">
                <button onClick={() => setIsGalleryOpen(true)} aria-label={t('product.openGallery', { title: product.title })} className="w-full aspect-square relative group cursor-pointer overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={galleryImages[currentImageIndex]} alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:opacity-90" />
                    <div className="absolute bottom-0 right-0 bg-[var(--c-overlay)] text-[var(--c-text)] px-4 py-2 text-xs font-bold flex items-center gap-2" aria-hidden="true">
                        <i className="fa-solid fa-expand"></i><span>{t('product.zoom')}</span>
                    </div>
                    <div className="absolute top-4 left-0 bg-blue-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm" aria-hidden="true">
                        {CONDITION_LABELS[product.condition] || product.condition}
                    </div>
                </button>
                {galleryImages.length > 1 && (
                  <div className="flex border-t border-[var(--c-border2)] overflow-x-auto no-scrollbar" role="list" aria-label={t('product.listingImages')}>
                      {galleryImages.map((img, idx) => (
                          <button key={idx} type="button" role="listitem" onClick={() => setCurrentImageIndex(idx)} aria-label={t('product.showImage', { index: String(idx + 1) })} aria-pressed={idx === currentImageIndex} className={`w-20 h-20 sm:w-24 sm:h-24 border-r border-[var(--c-border2)] cursor-pointer shrink-0 ${idx === currentImageIndex ? 'opacity-100 ring-2 ring-inset ring-blue-500' : 'opacity-60 hover:opacity-100'}`}>
                               {/* eslint-disable-next-line @next/next/no-img-element */}
                               <img src={img} alt={`${product.title} — ${t('product.imageAlt', { current: String(idx + 1), total: String(galleryImages.length) })}`} className="w-full h-full object-cover" />
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
                            <span>{product.location || t('product.locationUnknown')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--c-text2)] text-xs">
                            <i className="fa-regular fa-clock"></i>
                            <span>{formatTimeLabel(product.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--c-text2)] text-xs sm:ml-auto">
                            <i className="fa-regular fa-eye"></i>
                            <span>{t('product.viewsCount', { count: product.views_count.toLocaleString() })}</span>
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
                      <span className="text-2xl font-black text-[var(--c-text)] tracking-tight uppercase">{t('product.priceNegotiable')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-[var(--c-border2)] rounded-sm overflow-hidden mb-8">
                    {currencyMode === 'km-only' ? (
                      <div className="bg-[var(--c-card)] p-5 flex items-center justify-between hover:bg-[var(--c-hover)] transition-colors">
                        <span className="text-xs font-bold text-[var(--c-text3)] uppercase tracking-widest">BAM</span>
                        <span className="text-3xl font-black text-[var(--c-text)] tracking-tight">{bamPrice} KM</span>
                      </div>
                    ) : currencyMode === 'eur-only' ? (
                      <div className="bg-[var(--c-card)] p-5 flex items-center justify-between hover:bg-[var(--c-hover)] transition-colors">
                        <span className="text-xs font-bold text-[var(--c-text3)] uppercase tracking-widest">EUR</span>
                        <span className="text-3xl font-black text-[var(--c-text)] tracking-tight">{Number(product.price).toLocaleString()} €</span>
                      </div>
                    ) : (
                      <>
                        <div className="bg-[var(--c-card)] p-5 flex items-center justify-between border-b border-[var(--c-border)] hover:bg-[var(--c-hover)] transition-colors">
                          <span className="text-xs font-bold text-[var(--c-text3)] uppercase tracking-widest">EUR</span>
                          <span className="text-3xl font-black text-[var(--c-text)] tracking-tight">{Number(product.price).toLocaleString()} €</span>
                        </div>
                        <div className="bg-[var(--c-card)] p-5 flex items-center justify-between hover:bg-[var(--c-hover)] transition-colors">
                          <span className="text-xs font-bold text-[var(--c-text3)] uppercase tracking-widest">BAM</span>
                          <span className="text-3xl font-black text-[var(--c-text)] tracking-tight">{bamPrice} KM</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex flex-col gap-3 mb-8">
                    <div className="flex gap-2 sm:gap-3">
                        <button onClick={handleContactSeller} aria-label={t('product.sendMessageToSeller')} className="flex-1 bg-[var(--c-text)] text-[var(--c-bg)] h-12 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:opacity-80 transition-colors rounded-sm flex items-center justify-center gap-1.5 sm:gap-2 min-w-0">
                            <i className="fa-regular fa-comment" aria-hidden="true"></i> <span className="truncate">{t('product.messageButton')}</span>
                        </button>
                        <button onClick={() => setShowPhonePopup(true)} aria-label={t('product.callSeller')} className="flex-1 bg-[var(--c-card)] text-[var(--c-text)] border border-[var(--c-border2)] h-12 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:bg-[var(--c-hover)] transition-colors rounded-sm flex items-center justify-center gap-1.5 sm:gap-2 min-w-0">
                            <i className="fa-solid fa-phone" aria-hidden="true"></i> <span className="truncate">{t('product.phoneBtn')}</span>
                        </button>
                        <button
                            onClick={() => { toggleFavorite(params.id || ''); showToast(isFavorite ? t('product.removedFromFavorites') : t('product.addedToFavorites')); }}
                            aria-label={isFavorite ? t('product.removeFromFavorites') : t('product.addToFavorites')}
                            aria-pressed={isFavorite}
                            className={`w-12 sm:w-14 h-12 shrink-0 border border-[var(--c-border2)] flex items-center justify-center transition-colors rounded-sm ${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-transparent text-[var(--c-text2)] hover:border-[var(--c-text)]'}`}
                        >
                            <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`} aria-hidden="true"></i>
                        </button>
                    </div>
                    <button
                        onClick={() => { if (!inCart) { addToCart(params.id || ''); showToast(t('product.addedToCart')); } else { showToast(t('product.alreadyInCart'), 'info'); } }}
                        aria-label={inCart ? t('product.alreadyInCartLabel') : t('product.addToCartLabel')}
                        aria-pressed={inCart}
                        className={`w-full h-12 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center gap-2 ${inCart ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                    >
                        <i className={`fa-solid ${inCart ? 'fa-check' : 'fa-bag-shopping'}`} aria-hidden="true"></i>
                        {inCart ? t('product.inCart') : t('product.buy')}
                    </button>
                </div>

                {/* SELLER MANAGEMENT (nur für Inserat-Eigentümer sichtbar) */}
                {user && product.seller_id === user.id && (
                  <div className="mb-8 border border-amber-500/20 bg-amber-50 rounded-sm p-4">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3">
                      <i className="fa-solid fa-crown mr-1"></i> {t('product.yourListing')}
                    </p>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => router.push(`/upload?edit=${product.id}`)}
                        className="flex-1 min-w-[80px] h-10 bg-[var(--c-card)] border border-[var(--c-border2)] text-[var(--c-text)] text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:bg-[var(--c-hover)] transition-colors rounded-sm flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        <i className="fa-solid fa-pen"></i> {t('product.edit')}
                      </button>
                      <button
                        onClick={handleMarkAsSold}
                        disabled={product.status === 'sold' || product.status === 'pending_sale'}
                        className="flex-1 min-w-[100px] h-10 bg-emerald-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest hover:bg-emerald-500 transition-colors rounded-sm flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50"
                      >
                        <i className={`fa-solid ${product.status === 'pending_sale' ? 'fa-hourglass-half' : 'fa-check'}`}></i>
                        {product.status === 'sold' ? t('product.sold') : product.status === 'pending_sale' ? t('product.pendingSale') : t('product.markAsSold')}
                      </button>
                      <button
                        onClick={handleDeleteProduct}
                        className="w-10 h-10 shrink-0 border border-red-200 text-red-500 hover:bg-red-50 transition-colors rounded-sm flex items-center justify-center"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>

                    {/* Istakni oglas (Promote) */}
                    {product.status === 'active' && (
                      <div className="mt-3 pt-3 border-t border-amber-500/10">
                        {isPromoted(product) ? (
                          <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold">
                            <i className="fa-solid fa-star text-amber-500"></i>
                            {t('product.promotedUntil', { date: new Date(product.promoted_until!).toLocaleDateString('bs-BA') })}
                          </div>
                        ) : isPro(user?.accountType) && (user?.promotedCredits ?? 0) > 0 ? (
                          <button
                            onClick={async () => {
                              try {
                                await promoteProduct(product.id, user!.id, 3);
                                setProduct({ ...product, promoted_until: new Date(Date.now() + 3 * 86400000).toISOString() });
                                showToast(t('product.promotedSuccess'));
                              } catch { showToast(t('product.promoteError'), 'error'); }
                            }}
                            className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-500 transition-colors"
                          >
                            <i className="fa-solid fa-star"></i>
                            {t('product.promoteListing', { count: String(user?.promotedCredits) })}
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--c-text3)]">
                            <i className="fa-solid fa-star text-[var(--c-text-muted)] mr-1"></i>
                            {t('product.promoteComingSoon')}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pro Stats — only for seller viewing their own product */}
                    {isPro(user?.accountType) && (
                      <div className="mt-3 pt-3 border-t border-amber-500/10 flex gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--c-text3)]">
                          <i className="fa-solid fa-eye text-blue-400"></i>
                          {t('product.statsViewed')} <span className="font-bold text-[var(--c-text)]">{product.views_count}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--c-text3)]">
                          <i className="fa-solid fa-heart text-red-400"></i>
                          {t('product.statsFavorited')} <span className="font-bold text-[var(--c-text)]">{product.favorites_count}</span>
                        </div>
                      </div>
                    )}
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
                                <p className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">@{sellerName} <ProBadge accountType={(product.seller as unknown as Record<string, unknown>)?.account_type as string} /></p>
                                {product.seller?.rating_average && (
                                  <p className="text-[10px] text-[var(--c-text3)] mb-0.5">★ {product.seller.rating_average}</p>
                                )}
                                <SellerVerificationBadges seller={product.seller as unknown as Record<string, unknown>} />
                            </div>
                        </div>
                        <button onClick={() => router.push(`/user/${sellerName}`)} aria-label={t('product.viewSellerProfile', { name: sellerName })} className="text-[10px] font-bold text-[var(--c-text2)] uppercase tracking-widest hover:text-[var(--c-text)] transition-colors flex items-center gap-1">
                            {t('product.sellerProfile')} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mb-8 flex-1">
                    <h3 className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-3 border-l-2 border-blue-500 pl-2">{t('product.description')}</h3>
                    <p className="text-sm text-[var(--c-text2)] font-mono leading-relaxed whitespace-pre-line">
                        {product.description || t('product.noDescription')}
                    </p>
                </div>
            </div>
        </div>

        {/* PRODUCT ATTRIBUTES / SPECS */}
        {product.category?.name && product.attributes && (
          <div className="mt-8 px-4 md:px-0">
            <ProductAttributes
              categoryName={product.category.name}
              attributes={product.attributes as Record<string, string | number | boolean | string[]>}
            />
          </div>
        )}

        {/* REVIEW SECTION — samo za učesnike potvrđene transakcije */}
        {user && canReview && (
          <div className="mt-8">
            <div className="bg-[var(--c-card-alt)] border border-[var(--c-border2)] p-4 sm:p-6 md:p-8 rounded-sm">
              <h3 className="text-sm font-bold text-[var(--c-text)] uppercase tracking-widest mb-6 flex items-center gap-2">
                <i className="fa-solid fa-star text-yellow-500" aria-hidden="true"></i> {t('product.rateSeller')}
              </h3>

              {alreadyReviewed || reviewSubmitted ? (
                <div className="flex flex-col items-center py-6 text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-check text-emerald-500 text-xl"></i>
                  </div>
                  <p className="text-sm font-bold text-[var(--c-text)]">{t('product.reviewThanks')}</p>
                  <p className="text-xs text-[var(--c-text3)]">{t('product.reviewRecorded')}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Star Picker */}
                  <div>
                    <p className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-3">{t('product.yourRating')}</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          aria-label={t('product.starLabel', { count: String(star) })}
                          className="text-3xl transition-transform active:scale-90 hover:scale-110"
                        >
                          <i className={`fa-star ${(reviewHover || reviewRating) >= star ? 'fa-solid text-yellow-400' : 'fa-regular text-[var(--c-text-muted)]'}`}></i>
                        </button>
                      ))}
                      {reviewRating > 0 && (
                        <span className="ml-2 text-sm font-bold text-[var(--c-text2)] self-center">
                          {['', t('product.ratingBad'), t('product.ratingBelowAvg'), t('product.ratingAverage'), t('product.ratingGood'), t('product.ratingExcellent')][reviewRating]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-widest mb-2 block">{t('product.commentOptional')}</label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      maxLength={400}
                      rows={3}
                      placeholder={t('product.commentPlaceholder')}
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
                      <><i className="fa-solid fa-spinner animate-spin"></i> {t('product.submittingReview')}</>
                    ) : (
                      <><i className="fa-solid fa-paper-plane"></i> {t('product.submitReview')}</>
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
                    <i className="fa-regular fa-comments" aria-hidden="true"></i> {t('product.questions')}
                </h3>
                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2" aria-live="polite" aria-label={t('product.questionsList')}>
                    {questions.length === 0 && (
                        <p className="text-sm text-[var(--c-text3)] text-center py-4">{t('product.noQuestions')}</p>
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
                                        <span className="text-xs font-bold text-[var(--c-text)]">{q.user?.username || t('common.user')}</span>
                                        <span className="text-[10px] text-[var(--c-text3)] font-mono">{formatTimeLabel(q.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-[var(--c-text2)] bg-[var(--c-card)] p-3 border border-[var(--c-border)] rounded-sm inline-block">{q.question}</p>
                                </div>
                            </div>
                            {q.answer && (
                                <div className="flex gap-4 pl-12">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{t('product.sellerLabel')}</span>
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
                                            placeholder={t('product.yourAnswerPlaceholder')}
                                            className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border2)] text-sm text-[var(--c-text)] px-3 py-2 outline-none focus:bg-[var(--c-card-alt)] transition-colors placeholder:text-[var(--c-placeholder)] rounded-sm"
                                            autoFocus
                                        />
                                        <button onClick={() => handleAnswerQuestion(q.id)} className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors rounded-sm">
                                            {t('product.answerButton')}
                                        </button>
                                        <button onClick={() => { setAnsweringId(null); setAnswerText(''); }} className="text-[var(--c-text3)] hover:text-[var(--c-text)] px-2">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setAnsweringId(q.id)} className="pl-12 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors text-left">
                                        <i className="fa-solid fa-reply mr-1"></i> {t('product.answerButton')}
                                    </button>
                                )
                            )}
                        </div>
                    ))}
                </div>
                <div className="border-t border-[var(--c-border2)] pt-6">
                    <label htmlFor="question-input" className="text-[10px] text-[var(--c-text3)] font-bold uppercase tracking-widest mb-2 block">{t('product.askQuestionLabel')}</label>
                    {user ? (
                      <div className="flex gap-0">
                          <input id="question-input" type="text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()} placeholder={t('product.questionPlaceholder')}
                              className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border2)] border-r-0 text-sm text-[var(--c-text)] px-4 py-3 outline-none focus:bg-[var(--c-card-alt)] transition-colors placeholder:text-[var(--c-placeholder)] rounded-l-sm" />
                          <button type="button" onClick={handleSubmitQuestion} aria-label={t('product.sendQuestion')} className="bg-[var(--c-text)] text-[var(--c-bg)] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-colors rounded-r-sm">
                              {t('product.sendQuestion')}
                          </button>
                      </div>
                    ) : (
                      <button onClick={() => router.push('/login?redirect=/product/' + params.id)} className="w-full bg-[var(--c-card)] border border-[var(--c-border2)] text-sm text-[var(--c-text2)] px-4 py-3 rounded-sm hover:bg-[var(--c-hover)] transition-colors text-left">
                          {t('product.loginToAsk')}
                      </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Similar Products */}
      {product && (
        <div className="max-w-5xl mx-auto px-4 pb-8">
          <SimilarProducts
            productId={product.id}
            categoryId={product.category_id}
            tags={product.tags ?? []}
            price={product.price}
          />
        </div>
      )}
    </MainLayout>
  );
}
