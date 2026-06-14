'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const T = '#30B4A7'
const DARK = '#082827'

const QUOTES = [
  { text: "Chaque jour est une nouvelle chance de changer ta vie.", author: "Inconnu" },
  { text: "La force ne vient pas de ce que tu peux faire. Elle vient de surmonter ce que tu pensais ne pas pouvoir faire.", author: "Rikki Rogers" },
  { text: "Tu n'es pas obligé d'être parfait pour être incroyable.", author: "Capsule" },
  { text: "Les petits progrès sont toujours des progrès.", author: "Capsule" },
  { text: "Prendre soin de soi n'est pas de l'égoïsme, c'est de la survie.", author: "Audre Lorde" },
  { text: "Le courage, c'est de continuer même quand tout semble difficile.", author: "Winston Churchill" },
  { text: "Ta santé mentale est une priorité. Pas une option.", author: "Capsule" },
  { text: "Un jour à la fois. Une heure à la fois si nécessaire.", author: "Capsule" },
]

const AFFIRMATIONS = [
  "Je suis capable de traverser cette journée.",
  "Mes émotions sont valides et temporaires.",
  "Je mérite le soutien et la bienveillance.",
  "Je fais de mon mieux et c'est suffisant.",
  "Je grandis à travers chaque défi.",
  "Je suis en sécurité. Je suis là. Je respire.",
]

const BREATHING_STEPS = [
  { label: "Inspire", duration: 4, color: T },
  { label: "Retiens", duration: 4, color: '#0c3532' },
  { label: "Expire",  duration: 6, color: T },
  { label: "Repos",   duration: 2, color: '#6B7280' },
]

function BreathingExercise() {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [count, setCount] = useState(BREATHING_STEPS[0].duration)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    if (!active) return
    if (count === 0) {
      const next = (step + 1) % BREATHING_STEPS.length
      if (next === 0) setCycles(c => c + 1)
      setStep(next)
      setCount(BREATHING_STEPS[next].duration)
      return
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [active, count, step])

  function toggle() {
    if (active) {
      setActive(false)
      setStep(0)
      setCount(BREATHING_STEPS[0].duration)
      setCycles(0)
    } else {
      setActive(true)
    }
  }

  const current = BREATHING_STEPS[step]
  const progress = active ? ((BREATHING_STEPS[step].duration - count) / BREATHING_STEPS[step].duration) * 100 : 0

  return (
    <div style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 20, padding: '22px', textAlign: 'center', marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 18px' }}>Exercice de respiration</p>
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 18px', cursor: 'pointer' }} onClick={toggle}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#daeeed" strokeWidth="8" />
          <circle cx="60" cy="60" r="52" fill="none" stroke={active ? current.color : T} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: active ? current.color : T, fontFamily: 'Outfit,sans-serif' }}>{active ? count : '▶'}</span>
          {active && <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginTop: 2 }}>{current.label}</span>}
        </div>
      </div>
      {active ? (
        <div>
          <p style={{ color: DARK, fontSize: 15, fontWeight: 600, margin: '0 0 4px', fontFamily: 'Outfit,sans-serif' }}>{current.label}…</p>
          <p style={{ color: '#6B7280', fontSize: 12, margin: '0 0 14px' }}>{cycles} cycle{cycles !== 1 ? 's' : ''} complété{cycles !== 1 ? 's' : ''}</p>
          <button onClick={toggle} style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 100, padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Arrêter</button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#6B7280', fontSize: 13, margin: '0 0 14px', lineHeight: 1.5 }}>Technique 4-4-6 pour calmer ton esprit et réduire le stress en quelques minutes.</p>
          <button onClick={toggle} style={{ background: T, border: 'none', color: '#fff', borderRadius: 100, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: `0 4px 14px ${T}40` }}>Commencer</button>
        </div>
      )}
    </div>
  )
}

export default function MotivationPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [loading, setLoading] = useState(true)
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [affIdx, setAffIdx] = useState(0)
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [savedQuotes, setSavedQuotes] = useState<typeof QUOTES>([])
  const [activeTab, setActiveTab] = useState<'citations' | 'affirmations' | 'respiration'>('citations')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/auth'); return }
      const todayIdx = new Date().getDay()
      setQuoteIdx(todayIdx % QUOTES.length)
      setAffIdx(todayIdx % AFFIRMATIONS.length)
      setLoading(false)
    })
  }, []) // eslint-disable-line

  function nextQuote() {
    setQuoteIdx(i => (i + 1) % QUOTES.length)
  }

  function prevQuote() {
    setQuoteIdx(i => (i - 1 + QUOTES.length) % QUOTES.length)
  }

  function toggleLike(idx: number) {
    setLiked(prev => {
      const n = new Set(prev)
      if (n.has(idx)) {
        n.delete(idx)
        setSavedQuotes(q => q.filter((_, i) => i !== savedQuotes.findIndex(sq => sq.text === QUOTES[idx].text)))
      } else {
        n.add(idx)
        setSavedQuotes(q => [...q, QUOTES[idx]])
      }
      return n
    })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5fafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${T}33`, borderTopColor: T, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const quote = QUOTES[quoteIdx]
  const affirmation = AFFIRMATIONS[affIdx]

  return (
    <div style={{ minHeight: '100vh', background: '#f5fafa', fontFamily: 'Inter,Outfit,sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        @media(max-width:640px){
          .mot-hero { padding: 28px 16px !important; }
          .mot-main { padding: 16px 12px 60px !important; }
          .mot-tabs { overflow-x: auto; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,250,250,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #daeeed', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/logo.png" width={34} height={34} alt="Capsule" style={{ borderRadius: 8 }} />
          </Link>
          <Link href="/dashboard/ado" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: T, fontWeight: 600, fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Retour
          </Link>
        </div>
        <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, color: DARK }}>Motivation</span>
        <div style={{ width: 80 }} />
      </nav>

      {/* Hero */}
      <div className="mot-hero" style={{ background: DARK, padding: '36px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(20px,4vw,30px)', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Motivation</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>Citations, affirmations et exercices pour prendre soin de toi</p>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #daeeed' }}>
        <div className="mot-tabs" style={{ display: 'flex', maxWidth: 760, margin: '0 auto', overflowX: 'auto' }}>
          {([
            { id: 'citations',     label: 'Citations' },
            { id: 'affirmations',  label: 'Affirmations' },
            { id: 'respiration',   label: 'Respiration' },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '14px 20px', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? T : 'transparent'}`, background: 'transparent', color: activeTab === tab.id ? T : '#64748B', fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'Inter,sans-serif' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mot-main" style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Citations */}
        {activeTab === 'citations' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            {/* Featured quote */}
            <div style={{ background: DARK, borderRadius: 20, padding: '32px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${T}18` }} />
              <svg style={{ marginBottom: 16, opacity: 0.5 }} width="32" height="32" viewBox="0 0 24 24" fill={T}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(16px,3vw,22px)', fontWeight: 700, color: '#fff', lineHeight: 1.5, margin: '0 0 16px', position: 'relative', zIndex: 1 }}>
                "{quote.text}"
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 20px' }}>— {quote.author}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => toggleLike(quoteIdx)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: liked.has(quoteIdx) ? `${T}30` : 'rgba(255,255,255,0.1)', border: `1px solid ${liked.has(quoteIdx) ? T : 'rgba(255,255,255,0.2)'}`, color: '#fff', borderRadius: 100, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={liked.has(quoteIdx) ? T : 'none'} stroke={liked.has(quoteIdx) ? T : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {liked.has(quoteIdx) ? 'Sauvegardée' : 'Sauvegarder'}
                </button>
                <button onClick={prevQuote} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 100, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button onClick={nextQuote} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 100, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                {QUOTES.map((_, i) => (
                  <button key={i} onClick={() => setQuoteIdx(i)}
                    style={{ width: i === quoteIdx ? 20 : 6, height: 6, borderRadius: 99, background: i === quoteIdx ? T : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
                ))}
              </div>
            </div>

            {/* All quotes */}
            <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>Toutes les citations</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {QUOTES.map((q, i) => (
                <div key={i} style={{ background: '#fff', border: `1px solid ${i === quoteIdx ? T : '#daeeed'}`, borderRadius: 16, padding: '16px 18px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setQuoteIdx(i)}>
                  <p style={{ margin: '0 0 6px', fontSize: 14, color: DARK, lineHeight: 1.55, fontStyle: 'italic' }}>"{q.text}"</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>— {q.author}</p>
                </div>
              ))}
            </div>

            {/* Saved quotes */}
            {savedQuotes.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>Mes citations sauvegardées</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {savedQuotes.map((q, i) => (
                    <div key={i} style={{ background: `${T}10`, border: `1px solid ${T}40`, borderRadius: 16, padding: '16px 18px' }}>
                      <p style={{ margin: '0 0 6px', fontSize: 14, color: DARK, lineHeight: 1.55, fontStyle: 'italic' }}>"{q.text}"</p>
                      <p style={{ margin: 0, fontSize: 12, color: T, fontWeight: 600 }}>— {q.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Affirmations */}
        {activeTab === 'affirmations' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ background: DARK, borderRadius: 20, padding: '36px 28px', marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#fff', lineHeight: 1.5, margin: '0 0 24px' }}>
                {affirmation}
              </p>
              <button onClick={() => setAffIdx(i => (i + 1) % AFFIRMATIONS.length)}
                style={{ background: T, border: 'none', color: '#fff', borderRadius: 100, padding: '11px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: `0 4px 14px ${T}50` }}>
                Affirmation suivante
              </button>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>Toutes les affirmations</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
              {AFFIRMATIONS.map((aff, i) => (
                <div key={i} onClick={() => setAffIdx(i)} style={{ background: i === affIdx ? `${T}12` : '#fff', border: `1px solid ${i === affIdx ? T : '#daeeed'}`, borderRadius: 14, padding: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <p style={{ margin: 0, fontSize: 14, color: DARK, lineHeight: 1.55, fontWeight: i === affIdx ? 600 : 400 }}>{aff}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Respiration */}
        {activeTab === 'respiration' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <BreathingExercise />
            <div style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 20, padding: '22px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>Comment ça fonctionne</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {BREATHING_STEPS.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#f9fffe', borderRadius: 12, border: '1px solid #daeeed' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${step.color}15`, border: `2px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: step.color }}>{step.duration}s</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: DARK }}>{step.label}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{step.duration} secondes</p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '16px 0 0' }}>
                La technique 4-4-6 active le système nerveux parasympathique, réduisant le stress et l'anxiété en quelques minutes. Pratique-la 3 à 5 fois par jour pour de meilleurs résultats.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
