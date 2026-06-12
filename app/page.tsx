'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import AgeGate from '@/components/AgeGate'
import Navbar from '@/components/Navbar'
import AuthModal from '@/components/AuthModal'
import BottomNav from '@/components/BottomNav'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { isTestAccount } from '@/lib/test-accounts'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/stripe'

export default function Home() {
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null)
  const [lang, setLang] = useState('fr')
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [user, setUser] = useState<any>(null)
  const [cgvOpen, setCgvOpen] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  const router = useRouter()

  useEffect(() => {
    setAgeVerified(!!localStorage.getItem('age_verified'))
    setLang(localStorage.getItem('lang') || 'fr')
    supabase.auth.getUser().then(async ({ data }: any) => {
      const u = data.user
      setUser(u)
      if (!u) return
      // Redirect logged-in users straight to the app
      const { data: config } = await supabase.from('ai_config').select('id').eq('user_id', u.id).single()
      if (config) {
        router.replace('/chat')
      } else if (isTestAccount(u.email)) {
        router.replace('/onboarding')
      }
    })
  }, [])

  function toggleLang() {
    const newLang = lang === 'fr' ? 'en' : 'fr'
    setLang(newLang)
    localStorage.setItem('lang', newLang)
  }

  async function handlePlanClick(planId: string) {
    if (!user) { setAuthMode('register'); return }
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoadingPlan(null)
    }
  }

  const fr = lang === 'fr'

  if (ageVerified === null) return null
  if (!ageVerified) return <AgeGate lang={lang} onConfirm={() => setAgeVerified(true)} />

  return (
    <>
      <Navbar lang={lang} onLangToggle={toggleLang} onOpenLogin={() => setAuthMode('login')} onOpenRegister={() => setAuthMode('register')} />
      {authMode && (
        <AuthModal mode={authMode} lang={lang} onClose={() => setAuthMode(null)} onSwitch={setAuthMode} />
      )}

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', marginTop: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Aurora background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="orb-float" style={{
            position: 'absolute', width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)',
            top: '-15%', left: '-15%',
          }} />
          <div className="orb-breathe" style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
            bottom: '-10%', right: '-5%',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(37,99,235,0.04) 0%, transparent 80%)',
          }} />
        </div>

        <div className="fade-up" style={{ position: 'relative', maxWidth: 720 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
            background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
            borderRadius: 100, padding: '6px 16px',
          }}>
            <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#93C5FD', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.01em' }}>
              {fr ? 'IA de compagnie intime · +18' : 'Intimate AI companion · 18+'}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(40px, 6.5vw, 76px)',
            fontWeight: 700, lineHeight: 1.1, marginBottom: 22,
            letterSpacing: '-0.02em',
          }}>
            {fr
              ? <>L'intimité <em style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  fontStyle: 'italic',
                }}>réinventée</em></>
              : <>Intimacy <em style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  fontStyle: 'italic',
                }}>reinvented</em></>}
          </h1>

          <p style={{ color: 'var(--text2)', fontSize: 18, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.65 }}>
            {fr
              ? 'Découvrez une connexion authentique avec une IA de compagnie conçue pour vous, disponible chaque jour.'
              : 'Experience an authentic connection with an AI companion designed for you, available every day.'}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setAuthMode('register')} className="btn-primary" style={{ padding: '16px 36px', fontSize: 16 }}>
              {fr ? 'Commencer gratuitement' : 'Start for free'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button onClick={() => setAuthMode('login')} className="btn-ghost" style={{ padding: '16px 32px', fontSize: 16 }}>
              {fr ? 'Se connecter' : 'Sign in'}
            </button>
          </div>

          {/* Trust indicators */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', text: fr ? 'Totalement privé' : 'Fully private' },
              { icon: '🇫🇷', text: fr ? 'RGPD conforme' : 'GDPR compliant' },
              { icon: '✦', text: fr ? 'IA avancée' : 'Advanced AI' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {[
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
              title: fr ? 'Conversations naturelles' : 'Natural conversations',
              desc: fr ? 'Une IA qui comprend vos désirs et répond avec authenticité et chaleur.' : 'An AI that understands your desires and responds with authenticity and warmth.',
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
              title: fr ? 'Personnalité sur mesure' : 'Custom personality',
              desc: fr ? 'Configurez votre compagnon — genre, style, caractère — selon vos préférences.' : 'Configure your companion — gender, style, character — to your preferences.',
            },
            {
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
              title: fr ? 'Photos générées par IA' : 'AI-generated photos',
              desc: fr ? 'Recevez des portraits personnalisés de votre compagnon lors de vos échanges.' : 'Receive personalized portraits of your companion during your exchanges.',
            },
          ].map(f => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </div>
      </section>

      {/* ── Plans ── */}
      <section id="plans" style={{ padding: '80px 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 12, letterSpacing: '-0.01em' }}>
            {fr ? 'Choisissez votre expérience' : 'Choose your experience'}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 16, maxWidth: 400, margin: '0 auto' }}>
            {fr ? 'Des formules adaptées à chaque envie' : 'Plans tailored to every desire'}
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}>
          {Object.values(PLANS).map(plan => (
            <PlanCard key={plan.id} plan={plan} lang={lang} loading={loadingPlan === plan.id} onClick={() => handlePlanClick(plan.id)} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexWrap: 'wrap', gap: '8px 20px',
      }}>
        {[
          <span key="copy" style={{ color: 'var(--text3)', fontSize: 12 }}>© 2025 Blue Circle SAS</span>,
          <button key="cgv" onClick={() => setCgvOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', textUnderlineOffset: 3 }}>CGV</button>,
          <a key="privacy" href="/confidentialite" style={{ color: 'var(--text3)', fontSize: 12, textDecoration: 'underline', textUnderlineOffset: 3 }}>{fr ? 'Confidentialité' : 'Privacy'}</a>,
          <a key="mail" href="mailto:contact@bluecircle.app" style={{ color: 'var(--text3)', fontSize: 12 }}>contact@bluecircle.app</a>,
          <span key="age" style={{ color: 'var(--text3)', fontSize: 12 }}>{fr ? 'Réservé aux +18 ans' : 'Adults 18+ only'}</span>,
        ].map((item, i, arr) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {item}
            {i < arr.length - 1 && <span style={{ color: 'var(--border2)', fontSize: 12 }}>·</span>}
          </span>
        ))}
      </footer>

      {cgvOpen && <CGVModal lang={lang} onClose={() => setCgvOpen(false)} />}
      {user && <BottomNav lang={lang} />}
    </>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--surface2)' : 'var(--surface)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`,
        borderRadius: 20, padding: '28px 24px',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgba(37,99,235,0.1)',
        border: '1px solid rgba(37,99,235,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, color: '#3B82F6',
      }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 16, marginBottom: 8, color: 'var(--text)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
    </div>
  )
}

function PlanCard({ plan, lang, loading, onClick }: { plan: any; lang: string; loading: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const fr = lang === 'fr'
  const isPopular = plan.popular

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isPopular
          ? 'linear-gradient(145deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.06) 100%)'
          : 'var(--surface)',
        border: `1px solid ${hovered ? (isPopular ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.12)') : (isPopular ? 'rgba(37,99,235,0.3)' : 'var(--border)')}`,
        borderRadius: 22, padding: '32px 26px', position: 'relative',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? (isPopular ? '0 20px 60px rgba(37,99,235,0.2)' : '0 20px 60px rgba(0,0,0,0.3)') : 'none',
        transition: 'all 0.25s ease',
      }}>
      {isPopular && (
        <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: 100, padding: '4px 16px', fontSize: 11,
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#fff',
            letterSpacing: '0.04em',
          }}>
            ✦ {fr ? 'Populaire' : 'Popular'}
          </span>
        </div>
      )}

      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text3)', marginBottom: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
        {plan.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {plan.price}
        </span>
        <span style={{ color: 'var(--text3)', fontSize: 14 }}>€</span>
      </div>
      <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 26 }}>{fr ? '/ mois' : '/ month'}</div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
        {plan.features.map((f: string) => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--text2)', fontSize: 14, lineHeight: 1.5 }}>
            <svg style={{ flexShrink: 0, marginTop: 1 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button onClick={onClick} disabled={loading} style={{
        width: '100%', padding: '13px',
        background: isPopular ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
        border: isPopular ? 'none' : '1px solid var(--border2)',
        borderRadius: 12,
        color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isPopular ? '0 0 24px rgba(37,99,235,0.3)' : 'none',
      }}
        onMouseEnter={e => { if (!loading && !isPopular) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
        onMouseLeave={e => { if (!isPopular) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}>
        {loading
          ? <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
          : (fr ? 'Choisir ce plan' : 'Choose this plan')}
      </button>
    </div>
  )
}

function CGVModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const fr = lang === 'fr'
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(4,6,15,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-up-modal" style={{
        background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: '40px 36px', maxWidth: 600, width: '100%',
        maxHeight: '80vh', overflowY: 'auto', position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text3)', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 24 }}>
          {fr ? 'Conditions Générales de Vente' : 'Terms and Conditions'}
        </h2>
        <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p><strong style={{ color: 'var(--text)' }}>Blue Circle SAS</strong> — TVA FR12345678900</p>
          <p>Les présentes CGV régissent l'utilisation des services Blue Circle. En vous inscrivant, vous acceptez ces conditions.</p>
          <p><strong style={{ color: 'var(--text)' }}>Abonnements</strong> : Les abonnements sont mensuels et renouvelés automatiquement. Vous pouvez résilier à tout moment depuis votre profil.</p>
          <p><strong style={{ color: 'var(--text)' }}>Droit de rétractation</strong> : Vous disposez de 14 jours à compter de la souscription pour exercer votre droit de rétractation, sauf si vous avez commencé à utiliser le service.</p>
          <p><strong style={{ color: 'var(--text)' }}>Données personnelles</strong> : Vos données sont traitées conformément au RGPD. Nous ne revendons jamais vos données.</p>
          <p>Contact : <a href="mailto:contact@bluecircle.app" style={{ color: 'var(--accent-h)' }}>contact@bluecircle.app</a></p>
        </div>
      </div>
    </div>
  )
}
