'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import {
  consumeJustRegistered, hasSeenTour, markTourSeen,
  TOUR_START_EVENT, saveTourProgress, loadTourProgress, clearTourProgress,
} from '@/lib/onboardingTour';
import { TOUR_STEPS, resolveTarget } from '@/components/tour/steps';
import TourSpotlight from '@/components/tour/TourSpotlight';

const TARGET_POLL_MS = 100;
const TARGET_TIMEOUT_MS = 5000;
const SETTLE_MS = 350;

export default function CoachmarkTour() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  // Which step has already run its enter action (navigation/click) — guards
  // against re-pushing the route on every effect re-run.
  const enteredStepRef = useRef<number | null>(null);

  const start = useCallback((fromStep: number) => {
    enteredStepRef.current = null;
    targetRef.current = null;
    setRect(null);
    setStepIndex(fromStep);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    markTourSeen();
    clearTourProgress();
    targetRef.current = null;
    setRect(null);
    setActive(false);
  }, []);

  // ── Activation: fresh registration ──
  // markJustRegistered() runs at the end of the username step
  // (postavi-profil/page.tsx) right before router.replace('/profile'), but
  // the flag can land before this effect sees the new pathname. Poll ~2s
  // to catch either ordering.
  useEffect(() => {
    if (!isAuthenticated || hasSeenTour()) return;
    // Only ever consume the flag on the route step 0 can actually render
    // on. A blacklist would silently break again the next time a route is
    // added between signup and /profile — which is exactly how the tour
    // got burned on /register before.
    if (pathname !== TOUR_STEPS[0].route) return;

    if (consumeJustRegistered()) {
      start(0);
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (consumeJustRegistered()) {
        start(0);
        clearInterval(interval);
      } else if (attempts >= 20) {
        clearInterval(interval);
      }
    }, TARGET_POLL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, pathname, start]);

  // ── Activation: manual restart (settings button) ──
  useEffect(() => {
    const handler = () => start(0);
    window.addEventListener(TOUR_START_EVENT, handler);
    return () => window.removeEventListener(TOUR_START_EVENT, handler);
  }, [start]);

  // ── Activation: resume after mid-tour page reload ──
  // Resumes only on the saved step's OWN route, so a stale progress entry
  // can't call start() into a no-op state bailout on a page where the step
  // has nothing to spotlight.
  useEffect(() => {
    const saved = loadTourProgress();
    if (saved === null || saved >= TOUR_STEPS.length || hasSeenTour()) return;
    if (pathname !== TOUR_STEPS[saved].route) return;
    start(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── Step lifecycle: navigate if needed, then poll for the target ──
  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[stepIndex];
    if (!step) {
      finish();
      return;
    }

    saveTourProgress(stepIndex);
    setRect(null);
    targetRef.current = null;

    // Navigation toward the step's route/view — once per step.
    if (enteredStepRef.current !== stepIndex) {
      enteredStepRef.current = stepIndex;
      if (pathname !== step.route) {
        if (step.enter === 'push') {
          router.push(step.route);
          return; // pathname change re-runs this effect
        }
        if (step.enter === 'click-appearance' && step.fallbackHref) {
          // Fresh mount (e.g. reload resume): the ?step= deep link works
          // because /menu reads it once as initialStep on mount.
          router.push(step.fallbackHref);
          return;
        }
        // 'passive': render nothing and wait for the user to arrive.
        return;
      }
      if (step.enter === 'click-appearance') {
        // Already on /menu: the page keeps its view in internal state
        // (?step= is non-reactive after mount), so click its own
        // "Izgled i tržište" row. If the appearance view is already
        // open (previous step was there), the target poll below finds
        // the section without any click.
        if (!resolveTarget(step)) {
          const paletteIcon = document.querySelector<HTMLElement>('i.fa-palette');
          paletteIcon?.click();
        }
      }
    } else if (step.enter === 'passive' && pathname !== step.route) {
      return; // still waiting for the user to navigate
    }

    // Poll until the target exists and is visible; give up gracefully.
    let settled = false;
    let waited = 0;
    const poll = setInterval(() => {
      const el = resolveTarget(step);
      if (el) {
        clearInterval(poll);
        targetRef.current = el;
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        setTimeout(() => {
          if (!settled) setRect(el.getBoundingClientRect());
        }, SETTLE_MS);
        return;
      }
      waited += TARGET_POLL_MS;
      if (waited >= TARGET_TIMEOUT_MS) {
        clearInterval(poll);
        if (stepIndex === 0) {
          // /profile renders a spinner until its data lands, so a slow
          // fetch can outlast the poll. Advancing here would start the
          // tour at step 1; stand down instead. The just-registered flag
          // is already spent, so saved progress is the only way back —
          // keep it and let the resume effect retry on the next /profile.
          setActive(false);
          enteredStepRef.current = null;
          return;
        }
        // Later steps: skip rather than wedge the tour.
        if (stepIndex >= TOUR_STEPS.length - 1) finish();
        else setStepIndex((i) => i + 1);
      }
    }, TARGET_POLL_MS);

    return () => {
      settled = true;
      clearInterval(poll);
    };
  }, [active, stepIndex, pathname, router, finish]);

  // ── Live repositioning: scroll/resize/element size changes ──
  useEffect(() => {
    if (!active || !rect) return;

    let raf = 0;
    const remeasure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = targetRef.current;
        if (el && el.isConnected) setRect(el.getBoundingClientRect());
      });
    };

    window.addEventListener('scroll', remeasure, { passive: true, capture: true });
    window.addEventListener('resize', remeasure);
    const ro = targetRef.current ? new ResizeObserver(remeasure) : null;
    if (ro && targetRef.current) ro.observe(targetRef.current);
    // Slow safety net for layout shifts (late-loading images etc.).
    const guard = setInterval(remeasure, 500);

    return () => {
      window.removeEventListener('scroll', remeasure, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', remeasure);
      ro?.disconnect();
      clearInterval(guard);
      cancelAnimationFrame(raf);
    };
  }, [active, rect === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = useCallback(() => {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      finish();
      // Land on the marketplace feed rather than leaving the user buried
      // in the settings screen the last step happens to live on. Only on a
      // real finish — onSkip keeps you where you are.
      router.push('/');
    } else setStepIndex((i) => i + 1);
  }, [stepIndex, finish, router]);

  if (!active || !rect) return null;

  const step = TOUR_STEPS[stepIndex];
  if (!step) return null;

  return (
    <TourSpotlight
      rect={rect}
      padding={step.spotlightPadding ?? 8}
      title={t(step.titleKey)}
      desc={t(step.descKey)}
      stepIndex={stepIndex}
      totalSteps={TOUR_STEPS.length}
      isLast={stepIndex >= TOUR_STEPS.length - 1}
      nextLabel={t('tour.next')}
      finishLabel={t('tour.finish')}
      skipLabel={t('tour.skip')}
      onNext={handleNext}
      onSkip={finish}
    />
  );
}
