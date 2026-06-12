'use client'
import { useState } from 'react'

interface AgeGateProps {
  lang: string
  onConfirm: () => void
}

export default function AgeGate({ lang, onConfirm }: AgeGateProps) {
  const [denied, setDenied] = useState(false)
  const fr = lang === 'fr'

  function handleConfirm() {
    localStorage.setItem('age_verified', '1')
    onConfirm()
  }

  if (denied) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: '#04060f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(236,72,153,0.1)',
          border: '1px solid rgba(236,72,153,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 8,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <p style={{ color: 'var(--text2)', fontFamily: 'DM Sans, sans-serif', fontSize: 15, textAlign: 'center', maxWidth: 320 }}>
          {fr ? 'Accès réservé aux personnes âgées de 18 ans et plus.' : 'Access restricted to adults 18 years and older.'}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', padding: 24, textAlign: 'center',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
        top: '10%', left: '-10%', pointerEvents: 'none',
      }} className="orb-float" />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
        bottom: '5%', right: '-5%', pointerEvents: 'none',
      }} className="orb-breathe" />

      <div className="fade-up" style={{ position: 'relative', maxWidth: 420, width: '100%' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #3B82F6, #7C3AED)',
            boxShadow: '0 0 24px rgba(37,99,235,0.5)',
          }} />
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
            blue<span style={{
              background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>●</span>circle
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(16,21,38,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '40px 36px',
          backdropFilter: 'blur(24px)',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(37,99,235,0.1)',
            border: '1px solid rgba(37,99,235,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
            {fr ? 'Vérification d\'âge' : 'Age Verification'}
          </h1>
          <p style={{ color: 'var(--text2)', lineHeight: 1.65, fontSize: 14, marginBottom: 28 }}>
            {fr
              ? 'Ce site contient du contenu réservé aux adultes. Vous devez avoir 18 ans ou plus pour continuer.'
              : 'This site contains adult content. You must be 18 or older to continue.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={handleConfirm} className="btn-primary" style={{ width: '100%', padding: '15px 24px', fontSize: 15 }}>
              {fr ? 'J\'ai 18 ans ou plus — Entrer' : 'I am 18 or older — Enter'}
            </button>
            <button onClick={() => setDenied(true)} className="btn-ghost" style={{ width: '100%', padding: '13px 24px', fontSize: 14 }}>
              {fr ? 'J\'ai moins de 18 ans' : 'I am under 18'}
            </button>
          </div>
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          {fr
            ? 'En entrant, vous confirmez avoir l\'âge légal requis dans votre pays.'
            : 'By entering, you confirm you meet the legal age requirement in your country.'}
        </p>
      </div>
    </div>
  )
}
