import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Capsule Ado — Bien-être des adolescents',
  description:
    'La plateforme qui accompagne les ados, soutient les familles et connecte les professionnels du bien-être adolescent. Journal intime, suivi de l\'humeur, chat IA bienveillant et rdv avec des pros certifiés.',
  keywords:
    'bien-être adolescent, santé mentale ado, psychologue ado, parents adolescent, journal intime ado, suivi humeur, capsule ado',
  authors: [{ name: 'Capsule Ado' }],
  creator: 'Capsule Ado',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://webapp-chi-five-94.vercel.app'),
  openGraph: {
    title: 'Capsule Ado — Bien-être des adolescents',
    description:
      'La plateforme qui accompagne les ados, soutient les familles et connecte les professionnels du bien-être adolescent.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://webapp-chi-five-94.vercel.app',
    siteName: 'Capsule Ado',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Capsule Ado — Bien-être des adolescents',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capsule Ado — Bien-être des adolescents',
    description:
      'La plateforme qui accompagne les ados, soutient les familles et connecte les professionnels du bien-être adolescent.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#30B4A7" />
        <meta name="color-scheme" content="light" />
      </head>
      <body>{children}<CookieBanner /></body>
    </html>
  )
}
