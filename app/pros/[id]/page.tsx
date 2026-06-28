'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TEAL = '#30B4A7'
const DARK_GREEN = '#082827'

interface ProProfile {
  id: string
  name: string
  specialty?: string
  bio?: string
  avatar_url?: string
  verified?: boolean
  price_range?: string
  location?: string
  consultation_types?: string[]
}

interface Review {
  id: string
  rating: number
  comment?: string
  created_at: string
  author?: { name: string }
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 4L7 10l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function VerifiedBadge() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Vérifié">
      <circle cx="10" cy="10" r="10" fill={TEAL} />
      <path d="M6 10l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1l1.85 3.75L14 5.45l-3 2.92.71 4.13L8 10.4l-3.71 1.95.71-4.13L2 5.45l4.15-.7L8 1z" fill={filled ? TEAL : 'none'} stroke={TEAL} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <StarIcon key={n} filled={n <= Math.round(rating)} />
      ))}
    </div>
  )
}

function Initials({ name, size = 80 }: { name: string; size?: number }) {
  const parts = (name || '?').trim().split(' ')
  const init = parts.length >= 2
    ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
    : parts[0][0].toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, rgba(255,255,255,0.2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.35, border: '3px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
      {init}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 36, height: 36, border: `3px solid rgba(48,180,167,0.2)`, borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}

function formatDateFR(iso: string) {
  const d = new Date(iso)
  const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export default function ProProfilePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const [pro, setPro] = useState<ProProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      // Load pro profile
      const { data: proData, error: proError } = await supabase
        .from('profiles')
        .select('id, name, specialty, bio, avatar_url, verified')
        .eq('id', params.id)
        .single()

      if (proError || !proData) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setPro(proData as ProProfile)

      // Load reviews — handle 42P01 gracefully
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, author:author_id(name)')
        .eq('pro_id', params.id)
        .order('created_at', { ascending: false })

      const isTableMissing = (err: any) =>
        err?.code === '42P01' || err?.message?.includes('42P01') || err?.message?.includes('does not exist')

      if (!reviewError || isTableMissing(reviewError)) {
        setReviews((reviewData as any) || [])
      }

      setLoading(false)
    }
    load()
  }, [params.id]) // eslint-disable-line

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7fafa', fontFamily: 'Inter, sans-serif' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Spinner />
      </div>
    )
  }

  if (notFound || !pro) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7fafa', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: DARK_GREEN, fontWeight: 700, fontSize: 18 }}>Professionnel introuvable.</p>
        <Link href="/trouver-un-pro" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Retour à la liste</Link>
      </div>
    )
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  const consultTypes: string[] = (pro as any).consultation_types || ['video', 'phone', 'in_person']

  function typeLabel(t: string) {
    if (t === 'video') return 'Vidéo'
    if (t === 'phone') return 'Téléphone'
    if (t === 'in_person') return 'En cabinet'
    return t
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafa', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,250,250,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(48,180,167,0.12)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/trouver-un-pro" style={{ display: 'flex', alignItems: 'center', color: DARK_GREEN, textDecoration: 'none', padding: '6px 8px', borderRadius: 8 }}>
          <BackIcon />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Capsule" height={36} style={{ objectFit: 'contain' }} />
      </nav>

      {/* Hero */}
      <div style={{ background: DARK_GREEN, padding: '40px 20px 32px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          {/* Avatar */}
          {pro.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pro.avatar_url} alt={pro.name} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.25)' }} />
          ) : (
            <Initials name={pro.name} size={88} />
          )}

          {/* Name + verified */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: '#fff' }}>{pro.name}</h1>
              {pro.verified && <VerifiedBadge />}
            </div>
            {pro.specialty && (
              <p style={{ margin: '6px 0 0', fontSize: 15, color: `rgba(48,180,167,0.9)`, fontWeight: 600 }}>{pro.specialty}</p>
            )}
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stars rating={avgRating} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              {reviews.length > 0 ? `${avgRating.toFixed(1)} (${reviews.length} avis)` : 'Aucun avis'}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 100px' }}>

        {/* Bio */}
        {pro.bio && (
          <section style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, border: `1px solid rgba(48,180,167,0.12)`, boxShadow: '0 2px 8px rgba(8,40,39,0.05)' }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>A propos</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{pro.bio}</p>
          </section>
        )}

        {/* Consultation types */}
        <section style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, border: `1px solid rgba(48,180,167,0.12)`, boxShadow: '0 2px 8px rgba(8,40,39,0.05)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Types de consultation</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {consultTypes.map(t => (
              <span key={t} style={{ background: 'rgba(48,180,167,0.1)', color: TEAL, fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 100, border: `1px solid rgba(48,180,167,0.25)` }}>
                {typeLabel(t)}
              </span>
            ))}
          </div>
        </section>

        {/* Details: price + location */}
        {((pro as any).price_range || (pro as any).location) && (
          <section style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, border: `1px solid rgba(48,180,167,0.12)`, boxShadow: '0 2px 8px rgba(8,40,39,0.05)' }}>
            {(pro as any).price_range && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: (pro as any).location ? 12 : 0 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Tarif :</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: DARK_GREEN }}>{(pro as any).price_range}</span>
              </div>
            )}
            {(pro as any).location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Lieu :</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: DARK_GREEN }}>{(pro as any).location}</span>
              </div>
            )}
          </section>
        )}

        {/* CTA */}
        <Link
          href={`/pros/${pro.id}/book`}
          style={{ display: 'block', background: TEAL, color: DARK_GREEN, fontWeight: 800, fontSize: 15, padding: '16px 24px', borderRadius: 16, textDecoration: 'none', textAlign: 'center', marginBottom: 24, boxShadow: `0 4px 16px rgba(48,180,167,0.35)` }}
        >
          Prendre rendez-vous
        </Link>

        {/* Reviews */}
        <section>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: DARK_GREEN }}>
            Avis ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: '28px 20px', textAlign: 'center', border: `1px solid rgba(48,180,167,0.12)`, color: '#9ca3af', fontSize: 14 }}>
              Aucun avis pour l&apos;instant.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', border: `1px solid rgba(48,180,167,0.12)`, boxShadow: '0 2px 6px rgba(8,40,39,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Stars rating={r.rating} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: DARK_GREEN }}>{(r.author as any)?.name || 'Anonyme'}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDateFR(r.created_at)}</span>
                  </div>
                  {r.comment && (
                    <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
