'use client'
import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'

const FAMILY_PLANS = [
  {
    name: 'Famille Gratuit',
    price: '0 €',
    period: '/ mois',
    desc: 'Pour découvrir Capsule sans engagement.',
    features: [
      '1 compte ado inclus',
      'Médiathèque complète',
      'Journal de bord personnel',
      'Accès aux défis bien-être',
      'Motivation quotidienne',
    ],
    notIncluded: ['Messagerie avec professionnels', 'Téléconsultation', 'Suivi parental'],
    cta: 'Commencer gratuitement',
    href: '/auth?mode=register&plan=gratuit',
    featured: false,
  },
  {
    name: 'Famille+',
    price: '9,99 €',
    period: '/ mois',
    note: '6,99 € pour le 2e compte · 3,99 € / compte supplémentaire',
    desc: 'La solution complète pour toute la famille.',
    features: [
      'Comptes illimités (ado + parents)',
      'Médiathèque complète',
      'Messagerie sécurisée avec professionnels',
      'Téléconsultation vidéo incluse',
      'Suivi parental de l\'humeur',
      'Priorité sur les rendez-vous',
    ],
    notIncluded: [],
    cta: 'Choisir Famille+',
    href: '/auth?mode=register&plan=famille',
    featured: true,
  },
]

const PRO_PLANS = [
  {
    name: 'Professionnel',
    price: '99 €',
    period: '/ mois',
    note: '+ 49 € de frais d\'inscription (une seule fois)',
    desc: 'Pour les psychologues, thérapeutes et professionnels de santé mentale.',
    features: [
      'Profil certifié visible aux familles',
      'Gestion de patients illimitée',
      'Messagerie chiffrée',
      'Téléconsultation intégrée',
      'Tableau de bord analytique',
      'Prise de rendez-vous en ligne',
      'Notes de séance sécurisées',
      'Support prioritaire',
    ],
    cta: 'Rejoindre en tant que professionnel',
    href: '/auth?mode=register&plan=pro&type=pro',
  },
]

export default function Abonnements() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111', minHeight: '100vh', background: 'white' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e8f5f4', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.svg" alt="Capsule" width={28} height={28} />
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 16, color: T, letterSpacing: 2.5 }}>CAPSULE</span>
        </Link>
        <Link href="/auth" style={{ padding: '8px 20px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Connexion</Link>
      </nav>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '72px 24px 96px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Abonnements</p>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, color: '#080f0e' }}>
            Choisissez votre formule
          </h1>
          <p style={{ fontSize: 16, color: '#666', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Commencez gratuitement. Pas de carte bancaire requise pour le plan gratuit. Résiliable à tout moment.
          </p>
        </div>

        {/* Famille */}
        <h2 style={{ fontSize: 13, fontWeight: 700, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Pour les familles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 64 }}>
          {FAMILY_PLANS.map(plan => (
            <div key={plan.name} style={{
              borderRadius: 24, padding: '36px 32px',
              background: plan.featured ? '#0c3532' : 'white',
              border: plan.featured ? 'none' : '1px solid #e4f0ef',
              boxShadow: plan.featured ? '0 24px 64px rgba(8,47,42,.25)' : '0 2px 12px rgba(0,0,0,.04)',
              position: 'relative',
            }}>
              {plan.featured && <div style={{ position: 'absolute', top: -14, left: 32, background: T, color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, padding: '5px 16px', borderRadius: 100, textTransform: 'uppercase' }}>Le plus populaire</div>}
              <div style={{ fontSize: 14, fontWeight: 600, color: plan.featured ? 'rgba(255,255,255,.55)' : '#777', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 42, fontWeight: 900, color: plan.featured ? 'white' : T, lineHeight: 1 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: plan.featured ? 'rgba(255,255,255,.4)' : '#aaa' }}>{plan.period}</span>
              </div>
              {plan.note && <p style={{ fontSize: 12, color: plan.featured ? 'rgba(255,255,255,.35)' : '#bbb', marginBottom: 20 }}>{plan.note}</p>}
              <p style={{ fontSize: 14, color: plan.featured ? 'rgba(255,255,255,.6)' : '#666', lineHeight: 1.6, marginBottom: 24 }}>{plan.desc}</p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: plan.featured ? 'rgba(255,255,255,.8)' : '#444' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? '#30B4A7' : '#30B4A7'} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
                {plan.notIncluded?.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: plan.featured ? 'rgba(255,255,255,.25)' : '#ccc' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                padding: '13px', borderRadius: 100, fontWeight: 700, fontSize: 14,
                background: plan.featured ? T : 'transparent',
                color: plan.featured ? 'white' : T,
                border: plan.featured ? 'none' : `1.5px solid ${T}`,
              }}>{plan.cta}</Link>
            </div>
          ))}
        </div>

        {/* Pro */}
        <h2 style={{ fontSize: 13, fontWeight: 700, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Pour les professionnels</h2>
        {PRO_PLANS.map(plan => (
          <div key={plan.name} style={{ borderRadius: 24, padding: '36px 40px', background: '#f8fcfb', border: '1px solid #daeeed', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#777', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 38, fontWeight: 900, color: T, lineHeight: 1 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: '#aaa' }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 12, color: '#bbb', marginBottom: 16 }}>{plan.note}</p>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.6 }}>{plan.desc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Link href={plan.href} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '14px 28px', borderRadius: 100, fontWeight: 700, fontSize: 14, background: T, color: 'white', whiteSpace: 'nowrap' }}>{plan.cta}</Link>
            </div>
          </div>
        ))}

        {/* FAQ */}
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 16 }}>Des questions sur les abonnements ?</p>
          <Link href="/faq" style={{ color: T, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>Consulter la FAQ →</Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#080f0e', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>©Capsule 2026 — GACKAO SAS · <Link href="/cgv" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>CGV</Link> · <Link href="/mentions-legales" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>Mentions légales</Link></p>
      </footer>
    </div>
  )
}
