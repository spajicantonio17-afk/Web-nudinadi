'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  onImageClick?: (index: number) => void;
  selectedIndex?: number | null;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 8, onImageClick, selectedIndex }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { t } = useI18n();

  // Generate preview URLs
  useEffect(() => {
    const urls = images.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [images]);

  const handleFileSelect = useCallback((files: FileList | null, inputEl?: HTMLInputElement | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f =>
      f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024
    );
    const combined = [...images, ...newFiles].slice(0, maxImages);
    onImagesChange(combined);
    // Reset input so the same file can be reselected after removal
    if (inputEl) inputEl.value = '';
  }, [images, onImagesChange, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files, null);
  }, [handleFileSelect]);

  const removeImage = useCallback((index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  }, [images, onImagesChange]);

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, e.target)}
      />

      {images.length === 0 ? (
        /* Viewfinder Placeholder */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`h-[140px] w-full bg-[var(--c-card-alt)] border ${isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--c-border)]'} rounded-xl relative group cursor-pointer overflow-hidden transition-colors`}
        >
          {/* Grid Lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full border-[0.5px] border-[var(--c-border)] grid grid-cols-3 grid-rows-3"></div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 transition-transform group-active:scale-95">
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center text-[var(--c-text)] mb-3 transition-colors ${isDragging ? 'bg-blue-500 border-blue-500' : 'bg-[var(--c-hover)] border-[var(--c-border)] group-hover:bg-blue-500 group-hover:border-blue-500'}`}>
              <i className="fa-solid fa-camera text-xl"></i>
            </div>
            <p className="text-[10px] font-black text-[var(--c-text3)] uppercase tracking-[3px] group-hover:text-[var(--c-text)] transition-colors">
              {t('upload.addPhotos')}
            </p>
          </div>

          {/* Corner markers */}
          <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-[var(--c-text3)] rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-[var(--c-text3)] rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-[var(--c-text3)] rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-[var(--c-text3)] rounded-br-lg"></div>
        </div>
      ) : (
        /* Thumbnails Grid */
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previewUrls.map((url, idx) => (
            <div key={idx} className={`aspect-square bg-[var(--c-card)] rounded-[16px] relative overflow-hidden border-2 group cursor-pointer transition-all ${selectedIndex === idx ? 'border-blue-500 scale-[1.03]' : 'border-[var(--c-border)]'}`} onClick={() => onImageClick?.(idx)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                className="absolute top-1 right-1 w-8 h-8 sm:w-6 sm:h-6 bg-black/50 rounded-full flex items-center justify-center text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <i className="fa-solid fa-xmark text-xs sm:text-[10px]"></i>
              </button>
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-center py-0.5">
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">{t('upload.coverPhoto')}</span>
                </div>
              )}
            </div>
          ))}
          {images.length < maxImages && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-[var(--c-card-alt)] rounded-[16px] border border-dashed border-[var(--c-border)] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors"
            >
              <i className="fa-solid fa-plus text-[var(--c-text3)] mb-1"></i>
              <span className="text-[8px] text-[var(--c-text2)] font-bold uppercase">{t('upload.addMore')}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-[9px] text-[var(--c-text2)] text-center mt-2">
        {t('upload.photoCount', { count: images.length, max: maxImages })}
      </p>
    </div>
  );
}
