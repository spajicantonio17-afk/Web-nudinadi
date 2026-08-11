'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import React from 'react';
import bs from './translations/bs';

export type Locale = 'bs' | 'en';

// Only the default (bs) dictionary ships in the first-load bundle. The English
// one (~83KB) is fetched on demand when a user actually switches to it; until
// it arrives, t() falls back to Bosnian (see below), so nothing ever renders
// as a raw translation key.
const dictionaries: Partial<Record<Locale, Record<string, string>>> = { bs };

let enPromise: Promise<Record<string, string>> | null = null;
function loadEnDictionary(): Promise<Record<string, string>> {
  if (!enPromise) {
    enPromise = import('./translations/en').then(m => {
      dictionaries.en = m.default;
      return m.default;
    });
  }
  return enPromise;
}

const STORAGE_KEY = 'nudinadi_locale';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'bs';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'bs' || stored === 'en')) return stored as Locale;
    return 'bs';
  } catch { return 'bs'; }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('bs');
  // Bumped once a lazily-loaded dictionary arrives, so t() re-runs with it
  const [dictVersion, setDictVersion] = useState(0);

  useEffect(() => {
    const stored = getStoredLocale();
    setLocaleState(stored);
    document.documentElement.lang = stored;
    if (stored === 'en' && !dictionaries.en) {
      loadEnDictionary().then(() => setDictVersion(v => v + 1));
    }

    // External sync — auth.ts dispatches this event after loading profile.locale
    const handler = (e: Event) => {
      const incoming = (e as CustomEvent<string>).detail as Locale;
      if (incoming && (incoming === 'bs' || incoming === 'en')) {
        setLocaleState(incoming);
        localStorage.setItem(STORAGE_KEY, incoming);
        document.documentElement.lang = incoming;
        if (incoming === 'en' && !dictionaries.en) {
          loadEnDictionary().then(() => setDictVersion(v => v + 1));
        }
      }
    };
    window.addEventListener('nudinadi:set-locale', handler);
    return () => window.removeEventListener('nudinadi:set-locale', handler);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    }
    if (newLocale === 'en' && !dictionaries.en) {
      loadEnDictionary().then(() => setDictVersion(v => v + 1));
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = dictionaries[locale]?.[key] || dictionaries['bs']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, String(v));
      });
    }
    return value;
  // dictVersion is intentionally a dependency: it invalidates t() once a
  // lazily-loaded dictionary lands, forcing consumers to re-render.
  }, [locale, dictVersion]);

  return React.createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
}
