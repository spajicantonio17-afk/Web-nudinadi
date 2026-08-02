'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

interface TourSpotlightProps {
  rect: DOMRect;
  padding: number;
  title: string;
  desc: string;
  stepIndex: number;
  totalSteps: number;
  isLast: boolean;
  nextLabel: string;
  finishLabel: string;
  skipLabel: string;
  onNext: () => void;
  onSkip: () => void;
}

const CARD_MAX_WIDTH = 400;
const GAP = 14;
const ARROW = 12;

export default function TourSpotlight({
  rect, padding, title, desc, stepIndex, totalSteps, isLast,
  nextLabel, finishLabel, skipLabel, onNext, onSkip,
}: TourSpotlightProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(160);

  useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [title, desc]);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

  const hole = {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  // Safe area: keep the card clear of the fixed header (h-14/16) and the
  // mobile bottom nav (visible < sm breakpoint, ~72px + margin).
  const topGutter = 72;
  const bottomGutter = vw < 640 ? 96 : 24;

  const spaceBelow = vh - bottomGutter - (hole.top + hole.height) - GAP;
  const spaceAbove = hole.top - topGutter - GAP;
  const placeBelow = spaceBelow >= cardHeight + ARROW || spaceBelow >= spaceAbove;

  const cardWidth = Math.min(CARD_MAX_WIDTH, vw - 24);
  const targetCenterX = hole.left + hole.width / 2;
  const cardLeft = Math.min(Math.max(targetCenterX - cardWidth / 2, 12), vw - cardWidth - 12);
  const cardTop = placeBelow
    ? Math.min(hole.top + hole.height + GAP + ARROW / 2, vh - bottomGutter - cardHeight)
    : Math.max(hole.top - GAP - ARROW / 2 - cardHeight, topGutter);

  // Arrow: rotated square on the card edge facing the target, clamped
  // inside the card's rounded corners.
  const arrowLeft = Math.min(Math.max(targetCenterX - cardLeft - ARROW / 2, 18), cardWidth - 18 - ARROW);

  return (
    <div className="fixed inset-0 z-[210]" role="dialog" aria-label={title}>
      {/* Click blocker — page content is not interactive during the tour */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      {/* Spotlight cutout: one element, dim everything around it */}
      <div
        className="absolute rounded-[14px] transition-all duration-300 ease-out pointer-events-none"
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
          boxShadow: '0 0 0 100vmax rgba(0,0,0,0.55)',
        }}
      />
      {/* Subtle ring around the highlighted element */}
      <div
        className="absolute rounded-[14px] border-2 border-blue-400/80 transition-all duration-300 ease-out pointer-events-none shadow-[0_0_20px_rgba(59,130,246,0.4)]"
        style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
      />

      {/* Arrow */}
      <div
        className="absolute w-3 h-3 rotate-45 bg-[var(--c-card)] border-[var(--c-border)] transition-all duration-300 ease-out"
        style={{
          left: cardLeft + arrowLeft,
          top: placeBelow ? cardTop - ARROW / 2 : cardTop + cardHeight - ARROW / 2,
          borderTopWidth: placeBelow ? 1 : 0,
          borderLeftWidth: placeBelow ? 1 : 0,
          borderBottomWidth: placeBelow ? 0 : 1,
          borderRightWidth: placeBelow ? 0 : 1,
          borderStyle: 'solid',
        }}
      />

      {/* Tooltip card */}
      <div
        ref={cardRef}
        className="absolute bg-[var(--c-card)] border border-[var(--c-border)] rounded-[20px] shadow-[0_16px_48px_rgba(0,0,0,0.25)] p-5 transition-all duration-300 ease-out"
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === stepIndex ? 'w-6 bg-blue-500' : 'w-2 bg-[var(--c-border2)]'
              }`}
            />
          ))}
        </div>

        <h3 className="text-[17px] font-black text-[var(--c-text)] mb-2">{title}</h3>
        <p className="text-[14px] leading-relaxed text-[var(--c-text2)]">{desc}</p>

        <div className="flex items-center justify-between mt-5">
          <button
            onClick={onSkip}
            className="text-[11px] font-bold uppercase tracking-wider text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors px-2 py-2"
          >
            {skipLabel}
          </button>
          <button
            onClick={onNext}
            className="px-6 py-3 rounded-[12px] blue-gradient text-white text-[13px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 hover:brightness-110 active:scale-[0.97] transition-all"
          >
            {isLast ? finishLabel : nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
