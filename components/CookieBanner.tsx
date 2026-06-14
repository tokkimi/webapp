'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const T = '#30B4A7'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('capsule_cookies')) setVisible(true)
  }, [])

  const accept = () => { localStorage.setItem('capsule_cookies', 'accepted'); setVisible(false) }
  const decline = () => { localStorage.setItem('capsule_cookies', 'declined'); setVisible(false) }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 24, right: 24, zIndex: 1000,
      maxWidth: 560, margin: '0 auto',
      background: '#0c3532', border: '1px solid rgba(48,180,167,.25)',
      borderRadius: 20, padding: '24px 28px',
      boxShadow: '0 16px 48px rgba(0,0,0,.35)',
      animation: 'slideUp .35s ease',
    }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ fontSize: 24, flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>Votre vie privée nous importe</div>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.55)', lineHeight: 1.65, marginBottom: 16 }}>
            Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme. Aucun cookie publicitaire. Vos données restent privées et ne sont jamais vendues.{' '}
            <Link href="/confidentialite" style={{ color: T, textDecoration: 'none', fontWeight: 600 }}>En savoir plus</Link>
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={accept} style={{
              padding: '9px 20px', borderRadius: 100, background: T, color: 'white',
              border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>Accepter</button>
            <button onClick={decline} style={{
              padding: '9px 20px', borderRadius: 100, background: 'transparent',
              border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)',
              fontWeight: 500, fontSize: 13, cursor: 'pointer',
            }}>Refuser</button>
          </div>
        </div>
      </div>
    </div>
  )
}
