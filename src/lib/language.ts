// ── Language Preferences ─────────────────────────────────────
// Manages user's language selection (Bosnian, German, English)

export type LanguageCode = 'bs' | 'de' | 'en';

export interface LanguageOption {
  code: LanguageCode;
  flag: string;
  label: string;
  nativeLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'bs', flag: '🇧🇦', label: 'Bosanski', nativeLabel: 'Bosanski' },
  { code: 'de', flag: '🇩🇪', label: 'Njemački', nativeLabel: 'Deutsch' },
  { code: 'en', flag: '🇬🇧', label: 'Engleski', nativeLabel: 'English' },
];

const LANGUAGE_KEY = 'nudinadi_language';

export function getLanguagePreference(): LanguageCode {
  if (typeof window === 'undefined') return 'bs';
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored === 'bs' || stored === 'de' || stored === 'en') return stored;
  return 'bs';
}

export function setLanguagePreference(lang: LanguageCode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_KEY, lang);
}