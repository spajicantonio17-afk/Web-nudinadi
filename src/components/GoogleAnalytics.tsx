'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { getConsent, COOKIE_CONSENT_EVENT } from '@/lib/cookieConsent'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function GoogleAnalytics() {
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    setConsentGiven(!!getConsent()?.analytics)

    const handleConsentChange = () => {
      setConsentGiven(!!getConsent()?.analytics)
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange)
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange)
    }
  }, [])

  if (!GA_ID || process.env.NODE_ENV !== 'production') return null
  if (!consentGiven) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}