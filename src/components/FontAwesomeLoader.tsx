'use client'

import { useEffect } from 'react'

/**
 * Loads Font Awesome CSS asynchronously after React hydration.
 * Eliminates the render-blocking CDN stylesheet (~100-150ms FCP gain).
 *
 * Trade-off: Icons may flash invisible for ~50-200ms on slow connections.
 * Enable by replacing the <link> in layout.tsx with <FontAwesomeLoader />.
 */
export default function FontAwesomeLoader() {
  useEffect(() => {
    if (document.querySelector('link[data-fa]')) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
    link.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=='
    link.crossOrigin = 'anonymous'
    link.referrerPolicy = 'no-referrer'
    link.setAttribute('data-fa', '1')
    document.head.appendChild(link)
  }, [])
  return null
}
