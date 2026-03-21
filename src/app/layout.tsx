import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";
import JsonLd, { organizationSchema } from "@/components/JsonLd";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "NudiNađi – Kupuj i Prodaj Brzo i Sigurno",
    template: "%s | NudiNađi",
  },
  description: "NudiNađi je vodeći marketplace za kupoprodaju rabljenih i novih artikala u regiji. AI-potpomognuto oglašavanje, sigurna komunikacija i brza prodaja.",
  metadataBase: new URL("https://nudinadi.com"),
  openGraph: {
    type: "website",
    locale: "bs_BA",
    url: "https://nudinadi.com",
    siteName: "NudiNađi",
    title: "NudiNađi – Kupuj i Prodaj Brzo i Sigurno",
    description: "Vodeći marketplace za kupoprodaju rabljenih i novih artikala u regiji.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "NudiNađi Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NudiNađi – Kupuj i Prodaj Brzo i Sigurno",
    description: "Vodeći marketplace za kupoprodaju rabljenih i novih artikala u regiji.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/emblem.png", type: "image/png" },
    ],
    apple: "/emblem.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NudiNađi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="antialiased w-full min-w-0 overflow-x-hidden">
        <JsonLd data={organizationSchema} />
        <GoogleAnalytics />
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
