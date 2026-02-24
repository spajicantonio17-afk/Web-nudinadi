'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import React from 'react';
import bs from './translations/bs';
import en from './translations/en';
import de from './translations/de';

export type Locale = 'bs' | 'en' | 'de';

const dictionaries: Record<Locale, Record<string, string>> = { bs, en, de };

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
    if (stored && (stored === 'bs' || stored === 'en' || stored === 'de')) return stored as Locale;
    return 'bs';
  } catch { return 'bs'; }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('bs');

  useEffect(() => {
    const stored = getStoredLocale();
    setLocaleState(stored);
    document.documentElement.lang = stored;
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
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
  }, [locale]);

  return React.createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
}
