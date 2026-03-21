'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function GoogleAnalytics() {
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('nudinadi_cookie_consent')
    if (consent === 'all') {
      setConsentGiven(true)
    }

    const handleConsentChange = () => {
      const updated = localStorage.getItem('nudinadi_cookie_consent')
      if (updated === 'all') {
        setConsentGiven(true)
      }
    }

    window.addEventListener('cookie-consent-changed', handleConsentChange)
    return () => {
      window.removeEventListener('cookie-consent-changed', handleConsentChange)
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