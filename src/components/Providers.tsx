'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/Toast';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { NotificationProvider } from '@/lib/notifications';
import NetworkStatus from '@/components/NetworkStatus';
import CoachmarkTour from '@/components/tour/CoachmarkTour';
import OnboardingGate from '@/components/onboarding/OnboardingGate';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Register Service Worker for PWA + push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <ToastProvider>
            <NotificationProvider>
              <NetworkStatus />
              <CoachmarkTour />
              <OnboardingGate />
              {children}
            </NotificationProvider>
          </ToastProvider>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
