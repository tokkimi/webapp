'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ============================================================
   ICONS (inline SVG helpers)
   ============================================================ */
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const SparkleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.26L4 11l5.91-1.74L12 2z" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const StarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

/* ============================================================
   NAVBAR
   ============================================================ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0.875rem 0',
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(248, 247, 255, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(124, 58, 237, 0.08)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
            color: '#fff',
          }}>
            <SparkleIcon size={18} />
          </div>
          <span style={{
            fontFamily: 'var(--font-outfit, Outfit, sans-serif)',
            fontWeight: 800,
            fontSize: '1.25rem',
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Capsule Ado
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '2rem' }}>
          {[
            { label: 'Pour les ados', href: '#pour-qui' },
            { label: 'Pour les parents', href: '#pour-qui' },
            { label: 'Pour les pros', href: '#pour-qui' },
            { label: 'Tarifs', href: '#tarifs' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: 'var(--font-inter, Inter, sans-serif)',
                fontWeight: 500,
                fontSize: '0.9375rem',
                color: '#1A1A2E',
                textDecoration: 'none',
                opacity: 0.75,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.75')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/auth"
            style={{
              fontFamily: 'var(--font-outfit, Outfit, sans-serif)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#7C3AED',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Se connecter
          </Link>
          <Link
            href="/auth"
            style={{
              fontFamily: 'var(--font-outfit, Outfit, sans-serif)',
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: '#fff',
              textDecoration: 'none',
              padding: '0.625rem 1.375rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
              transition: 'all 0.2s ease',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(124, 58, 237, 0.5)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.35)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            S&apos;inscrire gratuitement
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#1A1A2E' }}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(248, 247, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(124, 58, 237, 0.08)',
          padding: '1rem 1.5rem 1.5rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Pour les ados', href: '#pour-qui' },
              { label: 'Pour les parents', href: '#pour-qui' },
              { label: 'Pour les pros', href: '#pour-qui' },
              { label: 'Tarifs', href: '#tarifs' },
            ].map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ fontWeight: 500, color: '#1A1A2E', textDecoration: 'none', fontSize: '1rem' }}>
                {link.label}
              </a>
            ))}
            <Link href="/auth" style={{
              display: 'flex', justifyContent: 'center', padding: '0.75rem',
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff',
              borderRadius: '9999px', fontWeight: 700, textDecoration: 'none',
              fontFamily: 'var(--font-outfit, Outfit, sans-serif)',
            }}>
              S&apos;inscrire gratuitement
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ============================================================
   HERO SECTION
   ============================================================ */
function Hero() {
  const floatingItems = [
    { top: '18%', left: '6%', size: 20, color: '#7C3AED', delay: '0s' },
    { top: '28%', right: '8%', size: 16, color: '#EC4899', delay: '0.5s' },
    { top: '62%', left: '4%', size: 14, color: '#0D9488', delay: '1s' },
    { top: '72%', right: '6%', size: 18, color: '#F97316', delay: '0.3s' },
    { top: '45%', left: '93%', size: 12, color: '#7C3AED', delay: '0.8s' },
  ]

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingTop: '5rem' }}>
      {/* Animated gradient background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #F5F0FF 0%, #FFF0F8 30%, #F0F9FF 60%, #FFF7ED 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
      }} />

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: '-5%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', top: '40%', left: '40%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Floating sparkles */}
      {floatingItems.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: s.top,
          left: (s as { left?: string; right?: string }).left,
          right: (s as { right?: string }).right,
          color: s.color, opacity: 0.6,
          animation: `float 4s ease-in-out ${s.delay} infinite`,
        }}>
          <SparkleIcon size={s.size} />
        </div>
      ))}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '2rem',
          color: '#7C3AED', animation: 'fadeUp 0.6s ease forwards',
        }}>
          <SparkleIcon size={14} />
          <span style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
            Bien-être mental pour les jeunes
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 900,
          fontSize: 'clamp(2.25rem, 6vw, 4.5rem)', lineHeight: 1.1, letterSpacing: '-0.03em',
          color: '#1A1A2E', marginBottom: '1.5rem',
          animation: 'fadeUp 0.6s ease 0.1s both',
        }}>
          La plateforme qui{' '}
          <span style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            accompagne les ados
          </span>
          ,{' '}
          <span style={{ background: 'linear-gradient(135deg, #0D9488, #2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            soutient les familles
          </span>{' '}
          &amp; connecte les{' '}
          <span style={{ background: 'linear-gradient(135deg, #1E3A5F, #64748B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            pros
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: '#4B5563', lineHeight: 1.7,
          maxWidth: '680px', margin: '0 auto 3rem',
          animation: 'fadeUp 0.6s ease 0.2s both',
        }}>
          Un espace sécurisé où chaque adolescent trouve du soutien, chaque parent reste connecté, et chaque professionnel développe sa pratique.
        </p>

        {/* Profile CTA Cards */}
        <div style={{
          display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
          animation: 'fadeUp 0.6s ease 0.3s both',
        }}>
          {[
            { label: 'Je suis un Ado', emoji: '✨', desc: '13–25 ans', gradient: 'linear-gradient(135deg, #7C3AED, #EC4899)', shadow: 'rgba(124,58,237,0.3)', href: '/auth?type=ado' },
            { label: 'Je suis un Parent', emoji: '🤝', desc: 'Accompagner mon enfant', gradient: 'linear-gradient(135deg, #0D9488, #2563EB)', shadow: 'rgba(13,148,136,0.3)', href: '/auth?type=parent' },
            { label: 'Je suis un Pro', emoji: '🎓', desc: 'Psychologue, thérapeute…', gradient: 'linear-gradient(135deg, #1E3A5F, #64748B)', shadow: 'rgba(30,58,95,0.3)', href: '/auth?type=pro' },
          ].map((card) => (
            <Link key={card.label} href={card.href} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem',
              background: '#fff', borderRadius: '1rem',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              textDecoration: 'none', color: '#1A1A2E',
              transition: 'all 0.25s ease', minWidth: '220px',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = `0 12px 32px ${card.shadow}`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: card.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.375rem', flexShrink: 0, boxShadow: `0 4px 12px ${card.shadow}`,
              }}>
                {card.emoji}
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, fontSize: '0.9375rem', color: '#1A1A2E' }}>{card.label}</div>
                <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '0.125rem' }}>{card.desc}</div>
              </div>
              <div style={{ color: '#9CA3AF' }}><ArrowRightIcon /></div>
            </Link>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{
          marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1.5rem', flexWrap: 'wrap', animation: 'fadeUp 0.6s ease 0.4s both',
        }}>
          {['RGPD conforme', 'Données chiffrées', 'Gratuit pour les ados'].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ color: '#7C3AED' }}><CheckIcon /></div>
              <span style={{ fontSize: '0.875rem', color: '#4B5563', fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   POUR QUI SECTION
   ============================================================ */
function PourQui() {
  const cards = [
    {
      id: 'ado',
      label: 'Ados',
      emoji: '✨',
      tagline: 'Ton espace, tes mots',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 60%, #F97316 100%)',
      shadow: 'rgba(124,58,237,0.25)',
      features: [
        'Journal intime avec IA bienveillante',
        'Suivi de ton humeur au quotidien',
        'Motivation du jour personnalisée',
        'Chat confidentiel 24h/24',
        'Défis bien-être et mindfulness',
        'Accès à des professionnels certifiés',
        'Ressources adaptées à ton âge',
        '100% gratuit pour commencer',
      ],
    },
    {
      id: 'parent',
      label: 'Parents',
      emoji: '🤝',
      tagline: 'Rester proche, avec discrétion',
      gradient: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
      shadow: 'rgba(13,148,136,0.25)',
      features: [
        'Tableau de bord parental bienveillant',
        "Suivi d'humeur (si l'ado accepte)",
        'Alertes en cas de détresse',
        'Inviter son ado par code',
        'Accès à des ressources parentales',
        "Trouver un professionnel près de chez soi",
        'Messagerie sécurisée avec les pros',
        'Guides de communication ado-parent',
      ],
    },
    {
      id: 'pro',
      label: 'Professionnels',
      emoji: '🎓',
      tagline: 'Développez votre pratique',
      gradient: 'linear-gradient(135deg, #1E3A5F 0%, #64748B 100%)',
      shadow: 'rgba(30,58,95,0.25)',
      features: [
        'Profil certifié visible par les familles',
        'Agenda de rendez-vous intégré',
        'Notes de séance sécurisées',
        'Visio, téléphone ou présentiel',
        'Tableau de bord patients',
        'Ressources et outils thérapeutiques',
        'Facturation et abonnements',
        'Communauté de praticiens',
      ],
    },
  ]

  return (
    <section id="pour-qui" style={{ padding: '6rem 0', background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '1.25rem',
            color: '#7C3AED',
          }}>
            <SparkleIcon size={14} />
            <span style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
              Pour qui ?
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#1A1A2E', marginBottom: '1rem' }}>
            Une plateforme conçue pour chacun
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6B7280', maxWidth: '560px', margin: '0 auto' }}>
            Trois expériences distinctes, un seul objectif : le bien-être des jeunes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {cards.map((card) => (
            <div key={card.id} style={{
              borderRadius: '1.5rem', overflow: 'hidden',
              boxShadow: `0 8px 40px ${card.shadow}`,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = `0 20px 60px ${card.shadow}`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 8px 40px ${card.shadow}`
              }}
            >
              {/* Card header */}
              <div style={{ background: card.gradient, padding: '2rem', color: '#fff' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{card.emoji}</div>
                <div style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 800, fontSize: '1.625rem', marginBottom: '0.375rem' }}>{card.label}</div>
                <div style={{ fontSize: '0.9375rem', opacity: 0.85 }}>{card.tagline}</div>
              </div>

              {/* Features */}
              <div style={{ background: '#fff', padding: '1.75rem' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {card.features.map((feature) => (
                    <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', background: card.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: '1px', color: '#fff',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.5 }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/auth?type=${card.id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginTop: '1.5rem', padding: '0.875rem 1.5rem', background: card.gradient,
                  color: '#fff', borderRadius: '9999px', textDecoration: 'none',
                  fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, fontSize: '0.9375rem',
                  boxShadow: `0 4px 16px ${card.shadow}`, transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = `0 8px 24px ${card.shadow}`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = `0 4px 16px ${card.shadow}`
                  }}
                >
                  Commencer en tant que {card.label}
                  <ArrowRightIcon />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   COMMENT ÇA MARCHE
   ============================================================ */
function HowItWorks() {
  const steps = [
    { number: '01', icon: <HeartIcon />, title: 'Crée ton profil', desc: "Ado, parent ou professionnel — choisis ton profil et configure ton espace en moins de 2 minutes.", color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
    { number: '02', icon: <MessageIcon />, title: 'Explore les outils', desc: "Journal, suivi d'humeur, chat IA, ressources, ou prise de rendez-vous selon tes besoins.", color: '#0D9488', bg: 'rgba(13,148,136,0.08)' },
    { number: '03', icon: <TrendingUpIcon />, title: 'Grandis à ton rythme', desc: 'Suivi de progrès, défis bien-être, motivation quotidienne — chaque pas compte.', color: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
  ]

  return (
    <section style={{ padding: '6rem 0', background: '#F8F7FF' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.2)',
            borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '1.25rem', color: '#0D9488',
          }}>
            <span style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
              Comment ça marche ?
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#1A1A2E', marginBottom: '1rem' }}>
            Simple, rapide, efficace
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6B7280', maxWidth: '500px', margin: '0 auto' }}>
            Trois étapes pour commencer votre parcours bien-être.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {steps.map((step, i) => (
            <div key={step.number} style={{
              background: '#fff', borderRadius: '1.25rem', padding: '2rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
              position: 'relative', transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 900, fontSize: '3.5rem', color: step.color, opacity: 0.12, lineHeight: 1, position: 'absolute', top: '1.25rem', right: '1.5rem' }}>
                {step.number}
              </div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color, marginBottom: '1.25rem' }}>
                {step.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, fontSize: '1.25rem', color: '#1A1A2E', marginBottom: '0.75rem' }}>{step.title}</h3>
              <p style={{ color: '#6B7280', lineHeight: 1.7, fontSize: '0.9375rem' }}>{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block" style={{ position: 'absolute', top: '50%', right: '-1rem', transform: 'translateY(-50%)', zIndex: 2, color: '#D1D5DB' }}>
                  <ArrowRightIcon />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   MOTIVATION DU JOUR
   ============================================================ */
function MotivationSection() {
  const [liked, setLiked] = useState(false)

  return (
    <section style={{ padding: '6rem 0', background: '#fff', overflow: 'hidden' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '1.25rem',
          color: '#F97316',
        }}>
          <SparkleIcon size={14} />
          <span style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
            Motivation du jour
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#1A1A2E', marginBottom: '2.5rem' }}>
          Une pensée inspirante chaque matin
        </h2>

        {/* Motivation Card */}
        <div style={{
          borderRadius: '2rem', overflow: 'hidden',
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F97316 100%)',
          boxShadow: '0 20px 60px rgba(124,58,237,0.35)',
          animation: 'float 5s ease-in-out infinite',
        }}>
          <div style={{ padding: '2.5rem 3rem', position: 'relative', overflow: 'hidden' }}>
            {/* Blobs */}
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(20px)' }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(15px)' }} />
            {/* Sparkles */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', opacity: 0.5, color: '#fff', animation: 'bounce-gentle 2s ease-in-out infinite' }}><SparkleIcon size={20} /></div>
            <div style={{ position: 'absolute', top: '1.5rem', right: '5rem', opacity: 0.4, color: '#fff', animation: 'bounce-gentle 2s ease-in-out 0.5s infinite' }}><SparkleIcon size={14} /></div>
            <div style={{ position: 'absolute', bottom: '1.5rem', right: '2rem', opacity: 0.35, color: '#fff', animation: 'bounce-gentle 2s ease-in-out 1s infinite' }}><SparkleIcon size={18} /></div>

            <div style={{ fontSize: '6rem', lineHeight: 0.8, color: 'rgba(255,255,255,0.2)', fontFamily: 'Georgia, serif', marginBottom: '1rem', textAlign: 'left' }}>&ldquo;</div>
            <p style={{
              fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 600,
              fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', color: '#fff', lineHeight: 1.6,
              position: 'relative', zIndex: 1, marginBottom: '1.5rem',
            }}>
              Chaque matin est une nouvelle page blanche. Ce que tu y écris aujourd&apos;hui dessine la personne que tu deviendras demain. Tu as en toi la force d&apos;écrire quelque chose de beau.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', padding: '0.375rem 1rem' }}>
                <SparkleIcon size={14} />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 500 }}>
                  Capsule Ado IA — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <button onClick={() => setLiked(!liked)} style={{
                background: liked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: '9999px',
                padding: '0.5rem 1rem', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s ease',
              }}>
                <HeartIcon />
                {liked ? 'Aimé !' : "J'aime"}
              </button>
            </div>
          </div>
        </div>
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Une nouvelle motivation générée par IA chaque jour, personnalisée pour toi.
        </p>
      </div>
    </section>
  )
}

/* ============================================================
   TRUST BADGES
   ============================================================ */
function TrustSection() {
  const badges = [
    { icon: <ShieldIcon />, title: 'RGPD conforme', desc: 'Toutes tes données sont traitées conformément au règlement européen RGPD. Ta vie privée est notre priorité.', color: '#7C3AED', bg: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.15)' },
    { icon: <LockIcon />, title: 'Données chiffrées', desc: 'Chiffrement de bout en bout. Tes journaux intimes et conversations sont lisibles uniquement par toi.', color: '#0D9488', bg: 'rgba(13,148,136,0.06)', border: 'rgba(13,148,136,0.15)' },
    { icon: <StarIcon />, title: 'Professionnels certifiés', desc: 'Tous les pros sont vérifiés manuellement (numéro ADELI/RPPS). Tu parles à de vrais spécialistes.', color: '#1E3A5F', bg: 'rgba(30,58,95,0.06)', border: 'rgba(30,58,95,0.15)' },
  ]

  return (
    <section style={{ padding: '5rem 0', background: '#F8F7FF' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#1A1A2E', marginBottom: '0.75rem' }}>
            Ta confiance, notre engagement
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1.0625rem' }}>
            La sécurité et la confidentialité sont au cœur de Capsule Ado.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {badges.map((badge) => (
            <div key={badge.title} style={{
              background: badge.bg, border: `1px solid ${badge.border}`,
              borderRadius: '1.25rem', padding: '2rem',
              transition: 'transform 0.25s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ color: badge.color, marginBottom: '1rem' }}>{badge.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, fontSize: '1.125rem', color: '#1A1A2E', marginBottom: '0.625rem' }}>{badge.title}</h3>
              <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   PRICING SECTION
   ============================================================ */
function Pricing() {
  const plans = [
    {
      name: 'Gratuit', price: '0', period: 'pour toujours', desc: 'Parfait pour débuter',
      popular: false, color: '#64748B', gradient: 'linear-gradient(135deg, #64748B, #94A3B8)',
      features: ['Profil professionnel basique', '5 patients actifs', 'Agenda de rendez-vous', 'Notes de séance (limité)', 'Messagerie sécurisée'],
      notIncluded: ['Visioconférence intégrée', 'Facturation automatique', 'Analytics avancées'],
      cta: 'Commencer gratuitement', href: '/auth?type=pro&plan=free',
    },
    {
      name: 'Essentiel', price: '29', period: '/mois', desc: 'Le plus populaire',
      popular: true, color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #EC4899)',
      features: ['Profil certifié + badge', '30 patients actifs', 'Agenda illimité', 'Notes de séance illimitées', 'Visioconférence intégrée', 'Messagerie prioritaire', 'Ressources thérapeutiques', 'Analytics de base'],
      notIncluded: ['Facturation automatique'],
      cta: 'Essai gratuit 14 jours', href: '/auth?type=pro&plan=essentiel',
    },
    {
      name: 'Pro', price: '59', period: '/mois', desc: 'Pour les praticiens établis',
      popular: false, color: '#1E3A5F', gradient: 'linear-gradient(135deg, #1E3A5F, #2D5A8F)',
      features: ['Tout le plan Essentiel', 'Patients illimités', 'Facturation automatique', 'Analytics complètes', 'Accès API', 'Support prioritaire', 'Formation et onboarding', 'Personnalisation du profil'],
      notIncluded: [],
      cta: 'Essai gratuit 14 jours', href: '/auth?type=pro&plan=pro',
    },
  ]

  return (
    <section id="tarifs" style={{ padding: '6rem 0', background: '#fff' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(30,58,95,0.08)', border: '1px solid rgba(30,58,95,0.15)',
            borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '1.25rem',
            color: '#1E3A5F',
          }}>
            <BriefcaseIcon />
            <span style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
              Tarifs Professionnels
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#1A1A2E', marginBottom: '1rem' }}>
            Des offres adaptées à votre pratique
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#6B7280', maxWidth: '500px', margin: '0 auto' }}>
            Ados et parents bénéficient d&apos;un accès gratuit. Les professionnels choisissent leur plan.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              borderRadius: '1.5rem',
              border: plan.popular ? '2px solid #7C3AED' : '2px solid #E5E7EB',
              background: plan.popular ? 'linear-gradient(180deg, #FAF5FF 0%, #fff 100%)' : '#fff',
              padding: plan.popular ? '2.25rem 2rem' : '2rem',
              position: 'relative',
              boxShadow: plan.popular ? '0 16px 48px rgba(124,58,237,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
              transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = plan.popular ? 'scale(1.05)' : 'scale(1.02)'
                e.currentTarget.style.boxShadow = plan.popular ? '0 24px 60px rgba(124,58,237,0.3)' : '0 12px 36px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = plan.popular ? 'scale(1.03)' : 'scale(1)'
                e.currentTarget.style.boxShadow = plan.popular ? '0 16px 48px rgba(124,58,237,0.2)' : '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff',
                  fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-outfit, Outfit, sans-serif)',
                  padding: '0.3rem 1rem', borderRadius: '9999px', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
                }}>
                  ⭐ Plus populaire
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 800, fontSize: '1.25rem', color: '#1A1A2E', marginBottom: '0.25rem' }}>{plan.name}</div>
                <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{plan.desc}</div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  {plan.price !== '0' && <span style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, fontSize: '1.25rem', color: '#6B7280' }}>€</span>}
                  <span style={{
                    fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 900,
                    fontSize: plan.price === '0' ? '2.5rem' : '3rem',
                    background: plan.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    {plan.price === '0' ? 'Gratuit' : plan.price}
                  </span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.9375rem' }}>{plan.period}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <div style={{ color: plan.color, flexShrink: 0, marginTop: '1px' }}><CheckIcon /></div>
                    <span style={{ fontSize: '0.9375rem', color: '#374151' }}>{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', opacity: 0.45 }}>
                    <div style={{ color: '#9CA3AF', flexShrink: 0, marginTop: '1px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.9375rem', color: '#9CA3AF', textDecoration: 'line-through' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} style={{
                display: 'block', width: '100%', textAlign: 'center',
                padding: '0.875rem 1.5rem',
                background: plan.popular ? plan.gradient : 'transparent',
                color: plan.popular ? '#fff' : plan.color,
                border: plan.popular ? 'none' : `2px solid ${plan.color}`,
                borderRadius: '9999px', textDecoration: 'none',
                fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, fontSize: '0.9375rem',
                boxShadow: plan.popular ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => {
                  if (!plan.popular) { e.currentTarget.style.background = plan.color; e.currentTarget.style.color = '#fff' }
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  if (!plan.popular) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = plan.color }
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem', marginTop: '2rem' }}>
          Sans engagement. Annulez à tout moment. TVA applicable selon votre situation.
        </p>
      </div>
    </section>
  )
}

/* ============================================================
   NEWSLETTER + DONS
   ============================================================ */
function NewsletterDons() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [profileType, setProfileType] = useState('ado')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function subscribe() {
    if (!email || !consent) return
    setStatus('loading')
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, profile_type: profileType, consent: true }),
    })
    const data = await res.json()
    if (res.ok) { setStatus('success'); setMsg(data.message) }
    else { setStatus('error'); setMsg(data.error || 'Erreur') }
  }

  return (
    <section style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg,#F8F7FF 0%,#FDF4FF 100%)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '3rem', alignItems: 'center' }}>

        {/* Newsletter */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', padding: '5px 14px', marginBottom: '1.25rem' }}>
            <span>📬</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7C3AED', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Newsletter</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: '#1A1A2E', margin: '0 0 0.75rem', lineHeight: 1.2 }}>
            Restez informé·e des nouveautés
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 1.5rem', maxWidth: '400px' }}>
            Ressources, conseils, nouvelles fonctionnalités — 1 email par mois, sans spam. Désabonnement en 1 clic.
          </p>

          {status === 'success' ? (
            <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <p style={{ color: '#065F46', fontWeight: 600, margin: 0 }}>✅ {msg}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom"
                  style={{ flex: 1, padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                <select value={profileType} onChange={e => setProfileType(e.target.value)}
                  style={{ padding: '11px 10px', border: '1.5px solid #E5E7EB', borderRadius: '12px', fontSize: '13px', fontFamily: 'Inter,sans-serif', outline: 'none', background: '#fff' }}>
                  <option value="ado">💜 Ado</option>
                  <option value="parent">💚 Parent</option>
                  <option value="pro">🔵 Pro</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com"
                  style={{ flex: 1, padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                <button onClick={subscribe} disabled={!email || !consent || status === 'loading'}
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', border: 'none', borderRadius: '12px', padding: '11px 18px', fontWeight: 700, fontSize: '14px', cursor: !email || !consent ? 'not-allowed' : 'pointer', opacity: !email || !consent ? 0.6 : 1, whiteSpace: 'nowrap', fontFamily: 'Inter,sans-serif' }}>
                  {status === 'loading' ? '…' : "S'abonner"}
                </button>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '3px', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>
                  J'accepte de recevoir la newsletter de Capsule Ado. Mes données ne seront jamais partagées. <a href="/confidentialite" style={{ color: '#7C3AED' }}>Politique de confidentialité</a>
                </span>
              </label>
              {status === 'error' && <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>{msg}</p>}
            </div>
          )}
        </div>

        {/* Dons */}
        <div style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#EC4899 100%)', borderRadius: '24px', padding: '2rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>💜</div>
            <h3 style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontSize: '22px', fontWeight: 800, margin: '0 0 0.75rem' }}>Soutenir le projet</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: 1.7, margin: '0 0 1rem' }}>
              Capsule Ado est une association loi 1901 à but non lucratif. Votre don est déductible fiscalement à 66%.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {[5, 10, 20, 50].map(a => (
                <a key={a} href={`/dons?amount=${a}`} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '999px', padding: '8px 16px', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-outfit, Outfit, sans-serif)', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}>
                  {a}€
                </a>
              ))}
            </div>
            <Link href="/dons" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#7C3AED', borderRadius: '999px', padding: '10px 22px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}>
              Faire un don 💜 <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer style={{ background: '#1A1A2E', color: 'rgba(255,255,255,0.7)', padding: '4rem 0 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <SparkleIcon size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>Capsule Ado</span>
            </div>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.55)', maxWidth: '260px' }}>
              La plateforme bien-être qui accompagne les ados, soutient les familles et connecte les professionnels.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <div style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, color: '#fff', marginBottom: '1rem', fontSize: '0.9375rem' }}>La plateforme</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[{ label: 'Pour les ados', href: '#pour-qui' }, { label: 'Pour les parents', href: '#pour-qui' }, { label: 'Pour les pros', href: '#pour-qui' }, { label: 'Tarifs', href: '#tarifs' }].map((l) => (
                <li key={l.label}>
                  <a href={l.href} style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.9375rem', transition: 'color 0.2s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <div style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, color: '#fff', marginBottom: '1rem', fontSize: '0.9375rem' }}>Légal</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[{ label: 'Mentions légales', href: '/mentions-legales' }, { label: 'Confidentialité', href: '/confidentialite' }, { label: 'CGV', href: '/cgv' }, { label: 'Contact', href: 'mailto:contact@capsuleado.fr' }].map((l) => (
                <li key={l.label}>
                  <a href={l.href} style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.9375rem', transition: 'color 0.2s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA + Social */}
          <div>
            <div style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, color: '#fff', marginBottom: '1rem', fontSize: '0.9375rem' }}>Commencer maintenant</div>
            <Link href="/auth" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.375rem', background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              color: '#fff', borderRadius: '9999px', textDecoration: 'none',
              fontFamily: 'var(--font-outfit, Outfit, sans-serif)', fontWeight: 700, fontSize: '0.9375rem',
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)', marginBottom: '1rem', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)' }}
            >
              S&apos;inscrire gratuitement <ArrowRightIcon />
            </Link>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {[
                {
                  label: 'Instagram', href: '#',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>,
                },
                {
                  label: 'LinkedIn', href: '#',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>,
                },
              ].map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{
                  width: '36px', height: '36px', borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.color = '#A78BFA'; e.currentTarget.style.background = 'rgba(124,58,237,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>© {new Date().getFullYear()} Capsule Ado. Tous droits réservés.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            <span>Fait avec</span><span style={{ color: '#EC4899' }}>♥</span><span>en France</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ============================================================
   PAGE COMPONENT
   ============================================================ */
export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <PourQui />
      <HowItWorks />
      <MotivationSection />
      <TrustSection />
      <Pricing />
      <NewsletterDons />
      <Footer />
    </main>
  )
}
