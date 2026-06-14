'use client'
import React from 'react'
import { usePathname } from 'next/navigation'

interface BottomNavProps { lang: string }

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 22V12h6v10" />
  </svg>
)

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

const icons: Record<string, () => React.ReactElement> = {
  '/': HomeIcon,
  '/messages': ChatIcon,
  '/profile': ProfileIcon,
}

export default function BottomNav({ lang }: BottomNavProps) {
  const pathname = usePathname()
  const fr = lang === 'fr'

  const items = [
    { href: '/',        label: fr ? 'Accueil' : 'Home' },
    { href: '/messages', label: fr ? 'Messages' : 'Messages' },
    { href: '/profile', label: fr ? 'Profil'  : 'Profile' },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 60,
      display: 'flex', alignItems: 'center',
      background: 'rgba(7,10,23,0.96)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid var(--border)',
      zIndex: 90,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {items.map(item => {
        const active = pathname === item.href
        const Icon = icons[item.href]
        return (
          <a key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, textDecoration: 'none', flex: 1, height: '100%',
            transition: 'opacity 0.2s ease',
          }}>
            <span style={{
              stroke: active ? 'var(--accent-h)' : 'var(--text3)',
              transition: 'stroke 0.2s ease',
              display: 'flex',
            }}>
              <Icon />
            </span>
            <span style={{
              fontSize: 10, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.02em',
              color: active ? 'var(--accent-h)' : 'var(--text3)',
              transition: 'color 0.2s ease',
            }}>
              {item.label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
