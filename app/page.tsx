'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const TEAL = '#30B4A7'
const TEAL_DARK = '#1a8f85'
const TEAL_LIGHT = '#e0f7f5'

/* ── Icons ── */
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12l7 7 7-7"/>
  </svg>
)
const PlayIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
    <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
    <polygon points="10,8 17,12 10,16" fill="white"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)
const TiktokIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.01a8.16 8.16 0 004.77 1.52V7.08a4.85 4.85 0 01-1-.39z"/>
  </svg>
)
const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
  </svg>
)

const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Abonnements', href: '/abonnements' },
  { label: 'Notre histoire', href: '/notre-histoire' },
  { label: 'Professionnels', href: '/professionnels' },
  { label: 'Articles', href: '/articles' },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [email, setEmail] = useState('')
  const [newsletterSent, setNewsletterSent] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    } catch {}
    setNewsletterSent(true)
    setEmail('')
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", color: '#1a1a1a' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(48,180,167,0.12)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/logo.svg" alt="Capsule" width={36} height={36} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: scrolled ? TEAL : 'white', letterSpacing: 2 }}>CAPSULE</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                color: scrolled ? '#333' : 'rgba(255,255,255,0.9)',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
              onMouseLeave={e => (e.currentTarget.style.color = scrolled ? '#333' : 'rgba(255,255,255,0.9)')}
              >{l.label}</Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dons" style={{
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
              padding: '7px 16px', borderRadius: 20,
              border: `1.5px solid ${scrolled ? TEAL : 'rgba(255,255,255,0.7)'}`,
              color: scrolled ? TEAL : 'white',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = TEAL }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = scrolled ? TEAL : 'white'; e.currentTarget.style.borderColor = scrolled ? TEAL : 'rgba(255,255,255,0.7)' }}
            >€ Soutenez-nous&nbsp;!</Link>
            <Link href="/auth" style={{ color: scrolled ? '#333' : 'white', display: 'flex' }}>
              <UserIcon />
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: scrolled ? '#333' : 'white', display: 'none' }} className="mobile-menu-btn">
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: 'white', borderTop: `1px solid ${TEAL_LIGHT}`, padding: '16px 24px 24px' }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 0', textDecoration: 'none', fontSize: 16, fontWeight: 500, color: '#333', borderBottom: '1px solid #f0f0f0' }}>
                {l.label}
              </Link>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <Link href="/dons" style={{ flex: 1, textAlign: 'center', padding: '10px', border: `1.5px solid ${TEAL}`, borderRadius: 20, color: TEAL, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                € Soutenez-nous !
              </Link>
              <Link href="/auth" style={{ flex: 1, textAlign: 'center', padding: '10px', background: TEAL, borderRadius: 20, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Connexion
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #0d2b2a 0%, #0f3b38 40%, #1a4f4a 70%, #0d2b2a 100%)',
        overflow: 'hidden',
      }}>
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', right: '8%', width: 380, height: 380, borderRadius: '50%', background: 'rgba(48,180,167,0.12)', filter: 'blur(60px)' }}/>
          <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(48,180,167,0.08)', filter: 'blur(50px)' }}/>
          <div style={{ position: 'absolute', top: '50%', left: '45%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(48,180,167,0.06)', filter: 'blur(40px)' }}/>
          {/* Geometric circles accent */}
          <div style={{ position: 'absolute', top: '18%', right: '12%', width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(48,180,167,0.2)' }}/>
          <div style={{ position: 'absolute', top: '22%', right: '16%', width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(48,180,167,0.15)' }}/>
          <div style={{ position: 'absolute', top: '28%', right: '22%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(48,180,167,0.2)', filter: 'blur(20px)' }}/>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            {/* Left: text */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(48,180,167,0.15)', border: '1px solid rgba(48,180,167,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 28 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL }}/>
                <span style={{ fontSize: 12, color: TEAL, fontWeight: 600, letterSpacing: 1 }}>BIEN-ÊTRE & SANTÉ MENTALE</span>
              </div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(56px, 7vw, 90px)',
                fontWeight: 900, lineHeight: 1,
                color: 'white', letterSpacing: 6,
                margin: '0 0 16px',
              }}>CAPSULE</h1>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 700, color: 'white', margin: '0 0 16px', lineHeight: 1.2 }}>
                c&apos;est quoi ?
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(48,180,167,0.9)', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 480 }}>
                Une plateforme de soutien à la santé mentale des adolescents — des outils, des pros, et une communauté bienveillante.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link href="/auth?mode=register" style={{
                  textDecoration: 'none', padding: '14px 28px', borderRadius: 28,
                  background: TEAL, color: 'white', fontWeight: 700, fontSize: 15,
                  boxShadow: `0 4px 20px rgba(48,180,167,0.4)`,
                }}>Créer un compte gratuit</Link>
                <a href="#decouvrir" style={{
                  textDecoration: 'none', padding: '14px 28px', borderRadius: 28,
                  border: '1.5px solid rgba(255,255,255,0.35)', color: 'white',
                  fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8,
                }}>en savoir plus <ArrowDownIcon /></a>
              </div>
            </div>

            {/* Right: app mockup / visual */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                {/* Phone frame mockup */}
                <div style={{
                  width: 280, height: 500, borderRadius: 40,
                  background: 'linear-gradient(160deg, rgba(48,180,167,0.25) 0%, rgba(13,43,42,0.8) 100%)',
                  border: '1.5px solid rgba(48,180,167,0.3)',
                  backdropFilter: 'blur(20px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 20, padding: 32, boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ width: 60, height: 60 }}>
                    <Image src="/logo.svg" alt="Capsule" width={60} height={60} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: 'white', letterSpacing: 3 }}>CAPSULE</div>
                    <div style={{ fontSize: 11, color: TEAL, marginTop: 4, letterSpacing: 1 }}>bien-être santé mentale</div>
                  </div>
                  {/* Mini feature pills */}
                  {['Médiathèque', 'Messagerie sécurisée', 'Téléconsultation'].map(f => (
                    <div key={f} style={{
                      width: '100%', padding: '10px 16px', borderRadius: 12,
                      background: 'rgba(48,180,167,0.1)', border: '1px solid rgba(48,180,167,0.2)',
                      fontSize: 13, color: 'white', fontWeight: 500, textAlign: 'center',
                    }}>{f}</div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}><PlayIcon /></button>
                  </div>
                </div>
                {/* Floating badges */}
                <div style={{
                  position: 'absolute', top: -20, right: -30,
                  background: 'white', borderRadius: 16, padding: '8px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: 12, fontWeight: 600, color: TEAL,
                }}>✓ 100% confidentiel</div>
                <div style={{
                  position: 'absolute', bottom: 40, left: -40,
                  background: TEAL, borderRadius: 16, padding: '8px 14px',
                  boxShadow: '0 8px 24px rgba(48,180,167,0.3)', fontSize: 12, fontWeight: 600, color: 'white',
                }}>Accès gratuit 🎉</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a href="#decouvrir" style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', animation: 'bounce 2s infinite', textDecoration: 'none' }}>
          <ArrowDownIcon />
        </a>
        <style>{`
          @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
          @media(max-width:768px){
            .desktop-nav{display:none!important}
            .mobile-menu-btn{display:flex!important}
          }
        `}</style>
      </section>

      {/* ── STRIP STATS ── */}
      <section style={{ background: TEAL, padding: '28px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, textAlign: 'center' }}>
          {[
            { n: '2 000+', label: 'jeunes accompagnés' },
            { n: '50+', label: 'professionnels certifiés' },
            { n: '100%', label: 'confidentiel & sécurisé' },
          ].map(s => (
            <div key={s.n}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: "'Outfit',sans-serif" }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES / C'EST TON ESPACE ── */}
      <section id="decouvrir" style={{ background: 'white', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: TEAL, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>LA PLATEFORME</p>
            <h2 style={{ fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, color: '#0d1a19', margin: '0 0 16px', lineHeight: 1.15 }}>
              Ça, c&apos;est ton espace
            </h2>
            <p style={{ fontSize: 16, color: '#555', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Capsule réunit tout ce dont tu as besoin pour prendre soin de ta santé mentale, en toute sécurité.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 32 }}>
            {[
              {
                title: 'Médiathèque',
                desc: 'Articles, podcasts, vidéos et exercices guidés pour comprendre tes émotions et développer des outils concrets au quotidien.',
                icon: '📚',
                items: ['Contenus validés par des pros', 'Exercices de respiration & pleine conscience', 'Podcasts et témoignages'],
              },
              {
                title: 'Messagerie sécurisée',
                desc: 'Échange en toute confidentialité avec un professionnel de santé mentale. Tes messages restent privés, toujours.',
                icon: '💬',
                items: ['Chiffrement de bout en bout', 'Réponse sous 24h', 'Suivi personnalisé'],
              },
              {
                title: 'Téléconsultation',
                desc: 'Des séances vidéo avec des psychologues et thérapeutes certifiés, depuis chez toi, sans file d\'attente.',
                icon: '🎥',
                items: ['Professionnels certifiés', 'Flexibilité des horaires', 'Depuis chez toi'],
              },
            ].map(f => (
              <div key={f.title} style={{
                background: '#fafcfc', border: '1px solid #e8f5f4', borderRadius: 20, padding: '36px 32px',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.boxShadow = '0 12px 40px rgba(48,180,167,0.12)'; el.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.boxShadow = 'none'; el.style.transform = 'none' }}
              >
                <div style={{ fontSize: 40, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0d1a19', margin: '0 0 12px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, margin: '0 0 20px' }}>{f.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {f.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444' }}>
                      <CheckIcon /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section style={{ background: '#f5fafa', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: TEAL, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>POUR TOUT LE MONDE</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#0d1a19', margin: 0 }}>
              Capsule, c&apos;est pour toi
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
            {[
              { who: 'Les ados & jeunes', desc: 'Un espace de soutien confidentiel pour traverser les moments difficiles et développer ta résilience.', emoji: '🌱' },
              { who: 'Les parents', desc: 'Des ressources pour comprendre et accompagner votre enfant, et des outils pour communiquer.', emoji: '🤝' },
              { who: 'Les professionnels', desc: 'Une plateforme pour étendre votre pratique et accompagner plus de jeunes patients à distance.', emoji: '🩺' },
            ].map(p => (
              <div key={p.who} style={{
                background: 'white', borderRadius: 20, padding: '36px 28px', textAlign: 'center',
                border: `1px solid ${TEAL_LIGHT}`,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{p.emoji}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: '#0d1a19', margin: '0 0 10px' }}>{p.who}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section style={{ background: 'white', padding: '88px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: TEAL, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>ABONNEMENTS</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#0d1a19', margin: '0 0 12px' }}>Simple et transparent</h2>
            <p style={{ fontSize: 15, color: '#666' }}>Commencez gratuitement, évoluez à votre rythme.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
            {[
              {
                name: 'Famille', price: 'Gratuit', sub: '0 € / mois', color: '#f5fafa',
                features: ['1 compte ado inclus', 'Médiathèque complète', 'Journal de bord', 'Accès communauté'],
                cta: 'Commencer gratuitement', href: '/auth?mode=register&plan=gratuit',
              },
              {
                name: 'Famille+', price: '9,99 €', sub: '/ mois', color: TEAL, featured: true,
                features: ['Comptes illimités', 'Messagerie avec pros', 'Téléconsultation incluse', 'Suivi parental'],
                cta: 'Choisir Famille+', href: '/auth?mode=register&plan=famille',
              },
              {
                name: 'Professionnel', price: '99 €', sub: '/ mois + 49 € inscription', color: '#f5fafa',
                features: ['Profil certifié', 'Gestion de patients', 'Téléconsultation intégrée', 'Tableau de bord pro'],
                cta: 'Rejoindre en tant que pro', href: '/auth?mode=register&plan=pro',
              },
            ].map(plan => (
              <div key={plan.name} style={{
                background: plan.featured ? TEAL : plan.color,
                border: plan.featured ? 'none' : `1px solid ${TEAL_LIGHT}`,
                borderRadius: 24, padding: '36px 28px',
                boxShadow: plan.featured ? '0 20px 60px rgba(48,180,167,0.35)' : 'none',
                transform: plan.featured ? 'scale(1.03)' : 'none',
              }}>
                {plan.featured && <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: 2, marginBottom: 16 }}>⭐ LE PLUS POPULAIRE</div>}
                <div style={{ fontSize: 16, fontWeight: 700, color: plan.featured ? 'white' : '#0d1a19', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 36, fontWeight: 900, color: plan.featured ? 'white' : TEAL, lineHeight: 1 }}>{plan.price}</div>
                <div style={{ fontSize: 12, color: plan.featured ? 'rgba(255,255,255,0.7)' : '#888', marginBottom: 24 }}>{plan.sub}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: plan.featured ? 'white' : '#444' }}>
                      <span style={{ color: plan.featured ? 'rgba(255,255,255,0.9)' : TEAL }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  padding: '12px 20px', borderRadius: 20, fontWeight: 700, fontSize: 14,
                  background: plan.featured ? 'white' : TEAL,
                  color: plan.featured ? TEAL : 'white',
                }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/abonnements" style={{ color: TEAL, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Voir tous les détails →
            </Link>
          </div>
        </div>
      </section>

      {/* ── NOTRE HISTOIRE ── */}
      <section style={{ background: 'linear-gradient(135deg, #0d2b2a 0%, #0f3b38 100%)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: TEAL, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>NOTRE HISTOIRE</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: 'white', margin: '0 0 20px', lineHeight: 1.2 }}>
              Né d&apos;une conviction
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: '0 0 16px' }}>
              Capsule est né du constat que des milliers d&apos;adolescents traversent des périodes difficiles sans avoir accès à un soutien professionnel adapté — par manque de moyens, de temps, ou simplement par peur du jugement.
            </p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: '0 0 32px' }}>
              Nous avons construit un espace sécurisé, moderne et accessible, pensé par et pour les jeunes, avec le soutien de professionnels de santé mentale.
            </p>
            <Link href="/notre-histoire" style={{
              textDecoration: 'none', padding: '13px 28px', borderRadius: 24,
              border: '1.5px solid rgba(48,180,167,0.5)', color: 'white',
              fontWeight: 600, fontSize: 14, display: 'inline-block',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(48,180,167,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >Découvrir notre histoire →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { year: '2024', event: 'Fondation de Capsule par l\'équipe GACKAO SAS' },
              { year: '2025', event: 'Lancement de la plateforme beta avec 50 professionnels' },
              { year: '2026', event: '2 000 jeunes accompagnés, expansion nationale' },
            ].map(e => (
              <div key={e.year} style={{
                display: 'flex', gap: 20, alignItems: 'flex-start',
                background: 'rgba(48,180,167,0.08)', borderRadius: 16, padding: '20px 24px',
                border: '1px solid rgba(48,180,167,0.15)',
              }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, color: TEAL, minWidth: 52 }}>{e.year}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{e.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ background: TEAL_LIGHT, padding: '80px 24px' }}>
        <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, color: '#0d1a19', margin: '0 0 12px' }}>
            Restez informé
          </h2>
          <p style={{ fontSize: 15, color: '#555', margin: '0 0 32px', lineHeight: 1.6 }}>
            Articles, conseils et actualités de Capsule directement dans votre boîte mail.
          </p>
          {newsletterSent ? (
            <div style={{ padding: '16px 24px', background: TEAL, borderRadius: 20, color: 'white', fontWeight: 600 }}>
              ✓ Merci ! Vous êtes bien inscrit(e).
            </div>
          ) : (
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com" required
                style={{
                  flex: 1, padding: '13px 18px', borderRadius: 24, border: `1.5px solid ${TEAL}`,
                  fontSize: 14, outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button type="submit" style={{
                padding: '13px 24px', borderRadius: 24, background: TEAL, color: 'white',
                border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>S&apos;inscrire</button>
            </form>
          )}
          {/* Social */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 40 }}>
            <span style={{ fontSize: 13, color: '#666', marginRight: 4 }}>Suivez-nous :</span>
            {[
              { href: 'https://instagram.com', icon: <InstagramIcon />, label: 'Instagram' },
              { href: 'https://tiktok.com', icon: <TiktokIcon />, label: 'TikTok' },
              { href: 'https://linkedin.com', icon: <LinkedinIcon />, label: 'LinkedIn' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 38, height: 38, borderRadius: '50%', background: 'white', border: `1px solid ${TEAL_LIGHT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL, textDecoration: 'none', boxShadow: '0 2px 8px rgba(48,180,167,0.1)' }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0d1a19', padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <Image src="/logo.svg" alt="Capsule" width={24} height={24} />
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 15, color: TEAL, letterSpacing: 2 }}>CAPSULE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
            {[
              { label: 'Mentions légales', href: '/mentions-legales' },
              { label: 'Conditions générales de service', href: '/cgv' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Nous contacter', href: '/contact' },
            ].map((l, i, arr) => (
              <span key={l.href} style={{ display: 'flex', alignItems: 'center' }}>
                <Link href={l.href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >{l.label}</Link>
                {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 12px' }}>—</span>}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '16px 0 0' }}>©Capsule 2026 — GACKAO SAS. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
