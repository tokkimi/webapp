'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const TEAL = '#30B4A7'
const DARK_GREEN = '#082827'

const PLACEHOLDERS = [
  { id: 'p1', name: 'Dr. Sophie Martin',  specialty: 'Psychologue',      bio: 'Spécialisée en thérapies cognitivo-comportementales pour adolescents.' },
  { id: 'p2', name: 'Dr. Karim Benali',   specialty: 'Psychothérapeute', bio: 'Approche humaniste et systémique, accompagnement familial.' },
  { id: 'p3', name: 'Dr. Claire Dupont',  specialty: 'Psychiatre',       bio: 'Psychiatrie de l\'enfant et de l\'adolescent, bilans neuropsychologiques.' },
]

const SPECIALTIES = ['Toutes', 'Psychologue', 'Psychothérapeute', 'Psychiatre', 'Éducateur', 'Médecin']

interface Pro {
  id: string
  name: string
  specialty: string
  bio?: string
  avatar_url?: string
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="7" fill={TEAL} />
      <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="#9ca3af" strokeWidth="1.6" />
      <path d="M11 11l3 3" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function TrouverUnPro() {
  const supabase = createSupabaseBrowserClient()
  const [pros, setPros] = useState<Pro[]>([])
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('Toutes')
  const [modal, setModal] = useState<{ open: boolean; name: string }>({ open: false, name: '' })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchPros() {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, specialty, bio, avatar_url')
        .eq('profile_type', 'pro')
        .eq('verified', true)
      if (data && data.length > 0) {
        setPros(data)
      }
      setLoaded(true)
    }
    fetchPros()
  }, []) // eslint-disable-line

  const displayPros: Pro[] = loaded && pros.length > 0 ? pros : PLACEHOLDERS

  const filtered = displayPros.filter(p => {
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.specialty || '').toLowerCase().includes(search.toLowerCase())
    const matchSpecialty = specialty === 'Toutes' || p.specialty === specialty
    return matchSearch && matchSpecialty
  })

  function openModal(name: string) {
    setModal({ open: true, name })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', color: '#f3f4f6' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .pro-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 22px; transition: all 0.2s; }
        .pro-card:hover { background: rgba(48,180,167,0.07); border-color: rgba(48,180,167,0.3); transform: translateY(-2px); }
        .pill-btn { background: none; border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; padding: 7px 16px; font-size: 13px; color: #9ca3af; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .pill-btn:hover { border-color: rgba(48,180,167,0.5); color: #30B4A7; }
        .pill-btn.active { background: #30B4A7; border-color: #30B4A7; color: #082827; font-weight: 700; }
        .book-btn { background: #30B4A7; border: none; border-radius: 100px; padding: 10px 20px; font-size: 13px; font-weight: 700; color: #082827; cursor: pointer; transition: all 0.2s; font-family: inherit; width: 100%; }
        .book-btn:hover { background: #27a99d; transform: translateY(-1px); }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', color: '#9ca3af', textDecoration: 'none', padding: '6px 8px', borderRadius: 8, transition: 'color 0.15s' }}>
          <BackIcon />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Capsule" style={{ height: 34, objectFit: 'contain' }} />
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${DARK_GREEN} 0%, #0e4040 50%, ${DARK_GREEN} 100%)`, padding: '48px 20px 40px', textAlign: 'center', borderBottom: '1px solid rgba(48,180,167,0.2)' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(22px, 5vw, 34px)', fontWeight: 800, margin: '0 0 10px', color: '#f3f4f6' }}>
          Trouver un professionnel
        </h1>
        <p style={{ color: 'rgba(48,180,167,0.9)', fontSize: 15, margin: 0, fontWeight: 500 }}>
          Des psys certifiés disponibles pour vous
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px 80px' }}>

        {/* Search + filter */}
        <div style={{ animation: 'fadeUp 0.4s ease', marginBottom: 24 }}>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom ou spécialité…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px 12px 42px', fontSize: 14, color: '#f3f4f6', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* Specialty filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SPECIALTIES.map(s => (
              <button
                key={s}
                className={`pill-btn${specialty === s ? ' active' : ''}`}
                onClick={() => setSpecialty(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Pro grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280', animation: 'fadeUp 0.4s ease' }}>
            <p style={{ fontSize: 15 }}>Aucun professionnel ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, animation: 'fadeUp 0.5s ease 0.1s both' }}>
            {filtered.map(pro => (
              <div key={pro.id} className="pro-card">
                {/* Avatar + name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${DARK_GREEN})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                    {pro.avatar_url
                      ? <img src={pro.avatar_url} alt={pro.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> // eslint-disable-line
                      : (pro.name?.[0] || '?').toUpperCase()
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pro.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>{pro.specialty || 'Professionnel de santé'}</span>
                    </div>
                  </div>
                </div>

                {/* Verified badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                  <CheckIcon />
                  <span style={{ fontSize: 11, color: TEAL, fontWeight: 600, letterSpacing: '0.04em' }}>Disponible</span>
                </div>

                {/* Bio */}
                {pro.bio && (
                  <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {pro.bio}
                  </p>
                )}

                {/* Book button */}
                <button className="book-btn" onClick={() => openModal(pro.name)}>
                  Prendre rendez-vous
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking confirmation modal */}
      {modal.open && (
        <div
          onClick={() => setModal({ open: false, name: '' })}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.2s ease' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#111', border: `1px solid rgba(48,180,167,0.35)`, borderRadius: 22, padding: '32px 28px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(48,180,167,0.18)' }}
          >
            {/* Success icon */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(48,180,167,0.15)', border: `2px solid ${TEAL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke={TEAL} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, color: '#f3f4f6', margin: '0 0 10px' }}>
              Demande de rendez-vous envoyée !
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
              {modal.name} vous contactera dans les 24h pour confirmer votre rendez-vous.
            </p>

            <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
              <Link href="/appointments" style={{ display: 'block', background: TEAL, borderRadius: 100, padding: '11px 20px', fontSize: 13, fontWeight: 700, color: DARK_GREEN, textDecoration: 'none', textAlign: 'center' }}>
                Voir mes rendez-vous
              </Link>
              <button
                onClick={() => setModal({ open: false, name: '' })}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '11px 20px', fontSize: 13, color: '#9ca3af', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
