'use client';

// ── Signup funnel progress ──────────────────────────────────
// Shown on all three screens a new account passes through:
// register form → email verification → username step. Seeing how little
// is left is what keeps people from dropping out halfway.

import { useI18n } from '@/lib/i18n';

const TOTAL_STEPS = 3;

export default function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="flex items-center gap-1.5" role="presentation">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                active
                  ? 'w-6 bg-blue-500'
                  : done
                    ? 'w-2 bg-blue-500/40'
                    : 'w-2 bg-[var(--c-border2)]'
              }`}
            />
          );
        })}
      </div>
      <p className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-widest">
        {t('welcome.step', { current, total: TOTAL_STEPS })}
      </p>
    </div>
  );
}
