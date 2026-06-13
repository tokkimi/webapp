'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'
const TD = '#1e8a80'

/* ─── SVG Icons ─── */
const Icon = {
  menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  user: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  arrow: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  arrowDown: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>,
  check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  checkWhite: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  book: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  message: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  video: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  lock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  instagram: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>,
  tiktok: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.01a8.16 8.16 0 004.77 1.52V7.08a4.85 4.85 0 01-1-.39z"/></svg>,
  linkedin: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
}

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
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }) } catch {}
    setNewsletterSent(true)
    setEmail('')
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .nav-link{text-decoration:none;font-size:13.5px;font-weight:500;transition:color .15s}
        .nav-link:hover{color:${T}!important}
        .btn-ghost{transition:background .15s,color .15s,border-color .15s}
        .btn-ghost:hover{background:${T}!important;color:white!important;border-color:${T}!important}
        .feature-card{transition:box-shadow .2s,transform .2s}
        .feature-card:hover{box-shadow:0 16px 48px rgba(48,180,167,.1)!important;transform:translateY(-3px)}
        .plan-card{transition:box-shadow .2s}
        .plan-card:hover{box-shadow:0 12px 40px rgba(48,180,167,.12)!important}
        .social-btn{transition:background .15s,color .15s}
        .social-btn:hover{background:${T}!important;color:white!important;border-color:${T}!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes scrollBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(7px)}}
        @media(max-width:768px){
          .desktop-nav{display:none!important}
          .mobile-btn{display:flex!important}
          .hero-grid{grid-template-columns:1fr!important}
          .hero-visual{display:none!important}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .features-grid{grid-template-columns:1fr!important}
          .who-grid{grid-template-columns:1fr!important}
          .plans-grid{grid-template-columns:1fr!important}
          .histoire-grid{grid-template-columns:1fr!important}
          .footer-links{flex-direction:column!important;gap:16px!important}
        }
      `}</style>

      {/* ══════════════ NAV ══════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 64,
        background: scrolled ? 'rgba(255,255,255,.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(48,180,167,.1)' : 'none',
        transition: 'background .25s,border .25s',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/logo.svg" alt="Capsule" width={32} height={32} />
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: 3, color: scrolled ? T : 'white' }}>CAPSULE</span>
          </Link>

          <div className="desktop-nav" style={{ display: 'flex', gap: 28 }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="nav-link" style={{ color: scrolled ? '#444' : 'rgba(255,255,255,.85)' }}>{l.label}</Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/dons" className="btn-ghost" style={{
              textDecoration: 'none', fontSize: 13, fontWeight: 600, padding: '7px 18px', borderRadius: 100,
              border: `1.5px solid ${scrolled ? T : 'rgba(255,255,255,.55)'}`,
              color: scrolled ? T : 'white',
            }}>Soutenez-nous</Link>
            <Link href="/auth" style={{ color: scrolled ? '#444' : 'white', display: 'flex', padding: 4 }}>
              <Icon.user />
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: scrolled ? '#333' : 'white', padding: 4 }}>
              {menuOpen ? <Icon.close /> : <Icon.menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid #e8f5f4', padding: '8px 0 20px' }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '13px 24px', textDecoration: 'none', fontSize: 15, color: '#333', borderBottom: '1px solid #f5f5f5' }}>{l.label}</Link>
            ))}
            <div style={{ padding: '16px 24px', display: 'flex', gap: 10 }}>
              <Link href="/dons" style={{ flex: 1, textAlign: 'center', padding: '10px', border: `1.5px solid ${T}`, borderRadius: 100, color: T, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Soutenez-nous</Link>
              <Link href="/auth" style={{ flex: 1, textAlign: 'center', padding: '10px', background: T, borderRadius: 100, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Connexion</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(150deg, #082827 0%, #0c3532 45%, #0f3d3a 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '8%', right: '6%', width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, rgba(48,180,167,.14) 0%, transparent 70%)` }}/>
          <div style={{ position: 'absolute', bottom: '10%', left: '3%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(48,180,167,.08) 0%, transparent 70%)` }}/>
          {/* Ring accents */}
          <div style={{ position: 'absolute', top: '12%', right: '10%', width: 340, height: 340, borderRadius: '50%', border: '1px solid rgba(48,180,167,.14)' }}/>
          <div style={{ position: 'absolute', top: '18%', right: '16%', width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(48,180,167,.1)' }}/>
          <div style={{ position: 'absolute', top: '24%', right: '22%', width: 110, height: 110, borderRadius: '50%', background: 'rgba(48,180,167,.15)', filter: 'blur(16px)' }}/>
        </div>

        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '100px 24px 80px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }}>
            {/* Text */}
            <div style={{ animation: 'fadeUp .6s ease both' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 28, padding: '5px 14px', borderRadius: 100, background: 'rgba(48,180,167,.12)', border: '1px solid rgba(48,180,167,.25)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T, animation: 'pulse 2s infinite' }}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 1.5, textTransform: 'uppercase' }}>Bien-être & Santé mentale</span>
              </div>

              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(64px,9vw,108px)', fontWeight: 900, lineHeight: .95, letterSpacing: 8, color: 'white', marginBottom: 20 }}>CAPSULE</h1>

              <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, color: 'white', marginBottom: 18, lineHeight: 1.15 }}>
                c&apos;est quoi ?
              </h2>

              <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', lineHeight: 1.75, maxWidth: 500, marginBottom: 40 }}>
                Une plateforme de soutien à la santé mentale des adolescents — ressources, professionnels certifiés, et espace d&apos;échange sécurisé, accessible à toute la famille.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/auth?mode=register" style={{
                  textDecoration: 'none', padding: '13px 28px', borderRadius: 100,
                  background: T, color: 'white', fontWeight: 700, fontSize: 15,
                  letterSpacing: .3, boxShadow: `0 6px 24px rgba(48,180,167,.35)`,
                }}>Créer un compte gratuit</Link>
                <a href="#plateforme" style={{
                  textDecoration: 'none', padding: '13px 24px', borderRadius: 100,
                  border: '1px solid rgba(255,255,255,.25)', color: 'rgba(255,255,255,.85)',
                  fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8,
                }}>En savoir plus <Icon.arrowDown /></a>
              </div>

              <div style={{ display: 'flex', gap: 28, marginTop: 52 }}>
                {[['2 000+', 'jeunes accompagnés'], ['50+', 'professionnels'], ['100%', 'confidentiel']].map(([n, l]) => (
                  <div key={n}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 900, color: 'white' }}>{n}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2, letterSpacing: .5 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="hero-visual" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 300 }}>
                {/* Phone card */}
                <div style={{
                  width: 300, borderRadius: 32, padding: '36px 28px',
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 40px 80px rgba(0,0,0,.35)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                    <Image src="/logo.svg" alt="Capsule" width={32} height={32} />
                    <div>
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 14, color: 'white', letterSpacing: 2 }}>CAPSULE</div>
                      <div style={{ fontSize: 10, color: T, letterSpacing: 1 }}>bien-être santé mentale</div>
                    </div>
                  </div>

                  {[
                    { icon: <Icon.book />, title: 'Médiathèque', sub: 'Articles & podcasts' },
                    { icon: <Icon.message />, title: 'Messagerie', sub: 'Avec un pro certifié' },
                    { icon: <Icon.video />, title: 'Téléconsultation', sub: 'Séances vidéo' },
                  ].map(item => (
                    <div key={item.title} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      marginBottom: 10, borderRadius: 14,
                      background: 'rgba(48,180,167,.08)', border: '1px solid rgba(48,180,167,.12)',
                    }}>
                      <div style={{ color: T, flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 1 }}>{item.sub}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 12, background: T, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Accès gratuit</span>
                  </div>
                </div>

                {/* Floating badge */}
                <div style={{ position: 'absolute', top: -14, right: -20, background: 'white', borderRadius: 10, padding: '8px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon.lock />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>100% confidentiel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a href="#plateforme" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,.3)', animation: 'scrollBounce 2.2s infinite', textDecoration: 'none' }}>
          <Icon.arrowDown />
        </a>
      </section>

      {/* ══════════════ PLATEFORME ══════════════ */}
      <section id="plateforme" style={{ background: 'white', padding: '104px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ maxWidth: 560, marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>La plateforme</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, lineHeight: 1.1, color: '#080f0e', marginBottom: 16 }}>
              Ça, c&apos;est ton espace
            </h2>
            <p style={{ fontSize: 15.5, color: '#666', lineHeight: 1.75 }}>
              Capsule réunit tout ce dont tu as besoin pour prendre soin de ta santé mentale — en toute sécurité, à ton rythme.
            </p>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              {
                icon: <Icon.book />,
                title: 'Médiathèque',
                desc: 'Articles, podcasts, vidéos et exercices guidés pour comprendre tes émotions et développer des outils concrets au quotidien.',
                items: ['Contenus validés par des professionnels', 'Exercices de pleine conscience', 'Podcasts et témoignages'],
              },
              {
                icon: <Icon.message />,
                title: 'Messagerie sécurisée',
                desc: 'Échange en toute confidentialité avec un professionnel de santé mentale. Tes messages restent privés, toujours.',
                items: ['Chiffrement de bout en bout', 'Réponse sous 24h garantie', 'Suivi personnalisé continu'],
              },
              {
                icon: <Icon.video />,
                title: 'Téléconsultation',
                desc: 'Des séances vidéo avec des psychologues et thérapeutes certifiés, depuis chez toi, sans file d\'attente.',
                items: ['Professionnels certifiés et vérifiés', 'Flexibilité des horaires', 'Séances depuis chez toi'],
              },
            ].map(f => (
              <div key={f.title} className="feature-card" style={{ padding: '36px 32px', borderRadius: 20, background: '#f8fcfb', border: '1px solid #e4f0ef' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(48,180,167,.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T, marginBottom: 22 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#080f0e', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>{f.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {f.items.map(it => (
                    <li key={it} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4b5563' }}>
                      <Icon.check /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ POUR QUI ══════════════ */}
      <section style={{ background: '#f0faf9', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Pour tout le monde</p>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: '#080f0e' }}>Capsule, c&apos;est pour toi</h2>
          </div>
          <div className="who-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { who: 'Les ados & jeunes', desc: 'Un espace de soutien confidentiel pour traverser les moments difficiles et développer ta résilience émotionnelle.', tag: 'Accès gratuit' },
              { who: 'Les parents', desc: 'Des ressources pour comprendre et accompagner votre enfant, avec des outils pour mieux communiquer et agir.', tag: 'Famille' },
              { who: 'Les professionnels', desc: 'Une plateforme pour étendre votre pratique clinique et accompagner plus de jeunes patients à distance.', tag: 'Certifié' },
            ].map(p => (
              <div key={p.who} style={{ background: 'white', borderRadius: 18, padding: '32px 28px', border: '1px solid #daeeed' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: `rgba(48,180,167,.1)`, fontSize: 11, fontWeight: 700, color: T, letterSpacing: 1, marginBottom: 18, textTransform: 'uppercase' }}>{p.tag}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#080f0e', marginBottom: 10 }}>{p.who}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TARIFS ══════════════ */}
      <section style={{ background: 'white', padding: '96px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Abonnements</p>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: '#080f0e', marginBottom: 10 }}>Simple et transparent</h2>
            <p style={{ fontSize: 15, color: '#777' }}>Commencez gratuitement. Évoluez à votre rythme.</p>
          </div>

          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              {
                name: 'Famille', badge: '', price: '0 €', period: '/ mois', featured: false,
                features: ['1 compte ado inclus', 'Médiathèque complète', 'Journal de bord', 'Accès communauté'],
                cta: 'Commencer gratuitement', href: '/auth?mode=register&plan=gratuit',
              },
              {
                name: 'Famille+', badge: 'Le plus populaire', price: '9,99 €', period: '/ mois', featured: true,
                features: ['Comptes illimités', 'Messagerie avec professionnels', 'Téléconsultation incluse', 'Espace parent & suivi'],
                cta: 'Choisir Famille+', href: '/auth?mode=register&plan=famille',
              },
              {
                name: 'Professionnel', badge: '', price: '99 €', period: '/ mois', featured: false, note: '+ 49 € à l\'inscription',
                features: ['Profil certifié visible', 'Gestion de patients', 'Téléconsultation intégrée', 'Tableau de bord analytique'],
                cta: 'Rejoindre en tant que pro', href: '/auth?mode=register&plan=pro',
              },
            ].map(plan => (
              <div key={plan.name} className="plan-card" style={{
                borderRadius: 22, padding: '36px 28px',
                background: plan.featured ? '#0c3532' : 'white',
                border: plan.featured ? 'none' : '1px solid #e4f0ef',
                boxShadow: plan.featured ? '0 24px 64px rgba(8,47,42,.25)' : 'none',
                transform: plan.featured ? 'scale(1.03)' : 'none',
              }}>
                {plan.badge && <div style={{ fontSize: 10, fontWeight: 700, color: T, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>{plan.badge}</div>}
                <div style={{ fontSize: 14, fontWeight: 700, color: plan.featured ? 'rgba(255,255,255,.7)' : '#555', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 38, fontWeight: 900, color: plan.featured ? 'white' : T, lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: plan.featured ? 'rgba(255,255,255,.45)' : '#999' }}>{plan.period}</span>
                </div>
                {plan.note && <div style={{ fontSize: 11, color: plan.featured ? 'rgba(255,255,255,.35)' : '#bbb', marginBottom: 24 }}>{plan.note}</div>}
                {!plan.note && <div style={{ marginBottom: 24 }}/>}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: plan.featured ? 'rgba(255,255,255,.75)' : '#555' }}>
                      {plan.featured ? <Icon.checkWhite /> : <Icon.check />} {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  padding: '12px', borderRadius: 100, fontWeight: 700, fontSize: 14,
                  background: plan.featured ? T : 'transparent',
                  color: plan.featured ? 'white' : T,
                  border: plan.featured ? 'none' : `1.5px solid ${T}`,
                }}>{plan.cta}</Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href="/abonnements" style={{ fontSize: 14, color: T, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Voir tous les détails <Icon.arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ NOTRE HISTOIRE ══════════════ */}
      <section style={{ background: 'linear-gradient(150deg, #082827 0%, #0f3d3a 100%)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="histoire-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Notre histoire</p>
              <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: 'white', marginBottom: 20, lineHeight: 1.15 }}>
                Né d&apos;une conviction simple
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.8, marginBottom: 14 }}>
                Des milliers d&apos;adolescents traversent des périodes difficiles sans avoir accès à un soutien professionnel adapté — par manque de moyens, de temps, ou par peur du jugement.
              </p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.8, marginBottom: 36 }}>
                Capsule est né pour changer ça : un espace sécurisé, moderne, pensé pour les jeunes, construit avec des professionnels de santé mentale.
              </p>
              <Link href="/notre-histoire" style={{
                textDecoration: 'none', fontSize: 14, fontWeight: 600, color: 'white',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 100, border: '1px solid rgba(255,255,255,.2)',
              }}>Découvrir notre histoire <Icon.arrow /></Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { year: '2024', text: 'Fondation de Capsule — GACKAO SAS' },
                { year: '2025', text: 'Lancement beta avec 50 professionnels partenaires' },
                { year: '2026', text: '2 000 jeunes accompagnés — expansion nationale' },
              ].map(e => (
                <div key={e.year} style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 900, color: T, minWidth: 48 }}>{e.year}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 }}>{e.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <section style={{ background: '#f0faf9', padding: '80px 24px' }}>
        <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: '#080f0e', marginBottom: 10 }}>Restez informé</h2>
          <p style={{ fontSize: 15, color: '#777', marginBottom: 32, lineHeight: 1.65 }}>Articles et actualités de Capsule directement dans votre boîte mail.</p>

          {newsletterSent ? (
            <div style={{ padding: '14px 24px', background: T, borderRadius: 100, color: 'white', fontWeight: 600, fontSize: 14 }}>
              Merci — vous êtes bien inscrit(e).
            </div>
          ) : (
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: 10 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required
                style={{ flex: 1, padding: '12px 18px', borderRadius: 100, border: `1.5px solid #cce8e6`, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: 'white' }}/>
              <button type="submit" style={{ padding: '12px 22px', borderRadius: 100, background: T, color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                S&apos;inscrire
              </button>
            </form>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 36 }}>
            <span style={{ fontSize: 12, color: '#999' }}>Suivez-nous</span>
            {[
              { href: '#', icon: <Icon.instagram />, label: 'Instagram' },
              { href: '#', icon: <Icon.tiktok />, label: 'TikTok' },
              { href: '#', icon: <Icon.linkedin />, label: 'LinkedIn' },
            ].map(s => (
              <a key={s.label} href={s.href} aria-label={s.label} className="social-btn" style={{
                width: 36, height: 36, borderRadius: '50%', background: 'white',
                border: '1px solid #cce8e6', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: T, textDecoration: 'none',
              }}>{s.icon}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background: '#080f0e', padding: '40px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            <Image src="/logo.svg" alt="Capsule" width={22} height={22} />
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 14, color: T, letterSpacing: 2.5 }}>CAPSULE</span>
          </div>
          <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {[
              ['Mentions légales', '/mentions-legales'],
              ['Conditions générales', '/cgv'],
              ['FAQ', '/faq'],
              ['Nous contacter', '/contact'],
            ].map(([label, href], i, arr) => (
              <span key={href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Link href={href} style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = T)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.35)')}
                >{label}</Link>
                {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,.12)' }}>—</span>}
              </span>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 20 }}>
            ©Capsule 2026 — GACKAO SAS. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
