'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('nudinadi_cookie_consent')
    if (!consent) {
      setMounted(true)
      // Small delay so the slide-up animation is visible
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true)
        })
      })
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('nudinadi_cookie_consent', 'all')
    setVisible(false)
    window.dispatchEvent(new Event('cookie-consent-changed'))
    setTimeout(() => setMounted(false), 300)
  }

  const handleEssentialOnly = () => {
    localStorage.setItem('nudinadi_cookie_consent', 'essential')
    setVisible(false)
    setTimeout(() => setMounted(false), 300)
  }

  if (!mounted) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="border-t border-[var(--c-border)] bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-screen-lg px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Text */}
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <i className="fa-solid fa-cookie-bite text-[14px] text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-[var(--c-text)] leading-relaxed">
                Koristimo kolačiće za poboljšanje vašeg iskustva i analitiku.
                Možete prihvatiti sve kolačiće ili koristiti samo neophodne.{' '}
                <Link
                  href="/kolacici"
                  className="text-blue-500 font-bold hover:underline"
                >
                  Saznaj više
                </Link>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-[11px] font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-[4px] hover:opacity-90 transition-opacity cursor-pointer"
              >
                Prihvati sve
              </button>
              <button
                onClick={handleEssentialOnly}
                className="px-4 py-2 text-[11px] font-bold text-[var(--c-text3)] border border-[var(--c-border)] rounded-[4px] hover:bg-[var(--c-hover)] transition-colors cursor-pointer"
              >
                Samo neophodni
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}