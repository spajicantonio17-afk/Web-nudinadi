'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/lib/i18n'
import { setConsent, getConsent, type CookieConsent } from '@/lib/cookieConsent'

interface CookiePreferencesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

type ToggleableCategory = 'functional' | 'analytics' | 'marketing'

export default function CookiePreferencesModal({ open, onOpenChange, onSaved }: CookiePreferencesModalProps) {
  const { t } = useI18n()
  const existing = getConsent()
  const [prefs, setPrefs] = useState<Omit<CookieConsent, 'necessary'>>({
    functional: existing?.functional ?? false,
    analytics: existing?.analytics ?? false,
    marketing: existing?.marketing ?? false,
  })

  const categories: { key: ToggleableCategory; nameKey: string; descKey: string }[] = [
    { key: 'analytics', nameKey: 'cookies.type2Name', descKey: 'cookies.type2Desc' },
    { key: 'functional', nameKey: 'cookies.type3Name', descKey: 'cookies.type3Desc' },
    { key: 'marketing', nameKey: 'cookies.type4Name', descKey: 'cookies.type4Desc' },
  ]

  const handleSave = () => {
    setConsent(prefs)
    onSaved()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--c-card)] border-[var(--c-border)] text-[var(--c-text)] max-w-md rounded-[18px]">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-[var(--c-text)] flex items-center gap-2">
            <i className="fa-solid fa-cookie-bite text-blue-500" />
            {t('cookie.preferencesTitle')}
          </DialogTitle>
        </DialogHeader>

        <p className="text-[11px] text-[var(--c-text2)] leading-relaxed -mt-2">
          {t('cookie.preferencesIntro')}
        </p>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {/* Necessary — always on, not toggleable */}
          <div className="flex items-start justify-between gap-3 p-3 rounded-[12px] border border-[var(--c-border)] bg-[var(--c-card-alt)]">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[var(--c-text)]">{t('cookies.type1Name')}</p>
              <p className="text-[10px] text-[var(--c-text3)] leading-relaxed mt-0.5">{t('cookies.type1Desc')}</p>
            </div>
            <Switch checked disabled className="mt-0.5 shrink-0" />
          </div>

          {categories.map((cat) => (
            <div
              key={cat.key}
              className="flex items-start justify-between gap-3 p-3 rounded-[12px] border border-[var(--c-border)]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-[var(--c-text)]">{t(cat.nameKey)}</p>
                <p className="text-[10px] text-[var(--c-text3)] leading-relaxed mt-0.5">{t(cat.descKey)}</p>
              </div>
              <Switch
                checked={prefs[cat.key]}
                onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [cat.key]: checked }))}
                className="mt-0.5 shrink-0"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-1">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-[11px] font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-[4px] hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('cookie.savePreferences')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
