'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import BottomNav from '@/components/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'santé' | 'école' | 'social' | 'bien-être' | 'créativité'

interface CheckIn {
  date: string
}

interface Challenge {
  id: string
  user_id: string
  title: string
  description: string
  category: Category
  target_date: string | null
  completed: boolean
  completed_at: string | null
  total_streak: number
  check_ins: CheckIn[]
  created_at: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const T = '#30B4A7'
const DARK = '#082827'

const CATEGORY_META: Record<Category, { label: string; color: string; bg: string; border: string }> = {
  'santé':      { label: 'Santé',      color: T,        bg: '#f0fafa', border: '#daeeed' },
  'école':      { label: 'École',      color: '#0c3532', bg: '#f0fafa', border: '#daeeed' },
  'social':     { label: 'Social',     color: T,        bg: '#f0fafa', border: '#daeeed' },
  'bien-être':  { label: 'Bien-être',  color: T,        bg: '#f0fafa', border: '#daeeed' },
  'créativité': { label: 'Créativité', color: '#0c3532', bg: '#f0fafa', border: '#daeeed' },
}

const SUGGESTIONS = [
  { title: 'Écrire dans ton journal 3 fois cette semaine', category: 'bien-être' as Category, description: 'Prends 10 minutes chaque session pour noter tes pensées et émotions.' },
  { title: '5 minutes de respiration par jour',            category: 'santé'     as Category, description: 'Une pause respiratoire quotidienne pour calmer ton esprit et recharger ton énergie.' },
  { title: 'Appeler un ami cette semaine',                 category: 'social'    as Category, description: "Prends des nouvelles d'un ami ou d'un proche que tu n'as pas contacté récemment." },
]

const today = () => new Date().toISOString().slice(0, 10)

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date(today()).getTime()
  return Math.ceil(diff / 86400000)
}

function currentWeekDates(): string[] {
  const now = new Date()
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function weeklyProgress(checkIns: CheckIn[]): number {
  const week = currentWeekDates()
  const dates = checkIns.map(c => c.date)
  return week.filter(d => dates.includes(d)).length
}

function currentStreak(checkIns: CheckIn[]): number {
  const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  let cursor = today()
  for (const ci of sorted) {
    if (ci.date === cursor) {
      streak++
      const prev = new Date(cursor)
      prev.setDate(prev.getDate() - 1)
      cursor = prev.toISOString().slice(0, 10)
    } else break
  }
  return streak
}

function hasCheckedInToday(checkIns: CheckIn[]): boolean {
  return checkIns.some(c => c.date === today())
}

// ─── Challenge Card ────────────────────────────────────────────────────────────

function ChallengeCard({ challenge, onCheckIn, onDelete }: {
  challenge: Challenge
  onCheckIn: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const meta = CATEGORY_META[challenge.category]
  const streak = currentStreak(challenge.check_ins)
  const weekly = weeklyProgress(challenge.check_ins)
  const checkedToday = hasCheckedInToday(challenge.check_ins)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const daysLeft = challenge.target_date ? daysUntil(challenge.target_date) : null

  return (
    <div style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(48,180,167,0.06)' }}>
      <div style={{ height: 4, background: T }} />
      <div style={{ padding: '18px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color, fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '2px 10px', letterSpacing: '0.04em' }}>
                {meta.label}
              </span>
              {checkedToday && (
                <span style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '2px 10px' }}>
                  Fait aujourd'hui
                </span>
              )}
            </div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: DARK, lineHeight: 1.3, fontFamily: 'Outfit,sans-serif' }}>
              {challenge.title}
            </h3>
          </div>
          <button
            onClick={async () => { setDeleting(true); await onDelete(challenge.id); setDeleting(false) }}
            disabled={deleting}
            title="Supprimer"
            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: deleting ? 0.5 : 1, transition: 'all 0.2s' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>

        {challenge.description && (
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6B7280', lineHeight: 1.55 }}>{challenge.description}</p>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ background: '#f0fafa', border: '1px solid #daeeed', borderRadius: 10, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: T }}>{streak} jour{streak !== 1 ? 's' : ''} consécutif{streak !== 1 ? 's' : ''}</span>
          </div>
          {daysLeft !== null && (
            <div style={{ background: daysLeft < 3 ? '#fef2f2' : '#f0fafa', border: `1px solid ${daysLeft < 3 ? '#fca5a5' : '#daeeed'}`, borderRadius: 10, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={daysLeft < 3 ? '#ef4444' : T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: daysLeft < 3 ? '#ef4444' : T }}>
                {daysLeft > 0 ? `J-${daysLeft}` : daysLeft === 0 ? "Aujourd'hui !" : 'Terminé'}
              </span>
            </div>
          )}
        </div>

        {/* Weekly progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Cette semaine</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T }}>{weekly}/7 jours</span>
          </div>
          <div style={{ height: 7, background: '#f0fafa', borderRadius: 99, overflow: 'hidden', border: '1px solid #daeeed' }}>
            <div style={{ height: '100%', width: `${(weekly / 7) * 100}%`, background: T, borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {currentWeekDates().map((d) => {
              const done = challenge.check_ins.some(c => c.date === d)
              const isToday = d === today()
              return (
                <div key={d} title={d} style={{ flex: 1, height: 5, borderRadius: 99, background: done ? T : isToday ? `${T}40` : '#e5e7eb', border: isToday ? `1.5px solid ${T}80` : 'none', transition: 'background 0.3s' }} />
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            {['L','M','M','J','V','S','D'].map((d, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: '#9CA3AF', fontWeight: 600 }}>{d}</span>
            ))}
          </div>
        </div>

        {/* Check-in button */}
        <button
          onClick={async () => { setLoading(true); await onCheckIn(challenge.id); setLoading(false) }}
          disabled={checkedToday || loading}
          style={{ width: '100%', padding: '11px', borderRadius: 100, border: 'none', cursor: checkedToday ? 'default' : 'pointer', background: checkedToday ? '#f0fdf4' : T, color: checkedToday ? '#16a34a' : '#fff', fontWeight: 700, fontSize: 14, boxShadow: checkedToday ? 'none' : `0 4px 14px ${T}40`, transition: 'all 0.25s', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Inter,sans-serif' }}
        >
          {loading ? (
            <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : checkedToday ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Déjà coché aujourd'hui
            </>
          ) : (
            <>Marquer aujourd'hui</>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Completed Card ────────────────────────────────────────────────────────────

function CompletedCard({ challenge }: { challenge: Challenge }) {
  const meta = CATEGORY_META[challenge.category]
  const completedDate = challenge.completed_at
    ? new Date(challenge.completed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#f59e0b' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color, fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '2px 10px' }}>{meta.label}</span>
      </div>
      <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: DARK, lineHeight: 1.35, fontFamily: 'Outfit,sans-serif' }}>{challenge.title}</h4>
      {completedDate && <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6B7280' }}>Accompli le {completedDate}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fafa', borderRadius: 8, padding: '4px 10px', width: 'fit-content' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: T }}>{challenge.total_streak} jours au total</span>
      </div>
    </div>
  )
}

// ─── Suggestion Card ──────────────────────────────────────────────────────────

function SuggestionCard({ suggestion, onAdd }: { suggestion: typeof SUGGESTIONS[0]; onAdd: (s: typeof SUGGESTIONS[0]) => Promise<void> }) {
  const meta = CATEGORY_META[suggestion.category]
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  return (
    <div style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 18, padding: '18px 20px' }}>
      <span style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color, fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '2px 10px', display: 'inline-block', marginBottom: 10 }}>{meta.label}</span>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: DARK, lineHeight: 1.5, fontFamily: 'Outfit,sans-serif' }}>{suggestion.title}</p>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{suggestion.description}</p>
      <button
        onClick={async () => { setLoading(true); await onAdd(suggestion); setAdded(true); setLoading(false) }}
        disabled={loading || added}
        style={{ width: '100%', padding: '9px', borderRadius: 100, border: added ? '1px solid #86efac' : `1px solid ${T}`, cursor: added ? 'default' : 'pointer', background: added ? '#f0fdf4' : T, color: added ? '#16a34a' : '#fff', fontWeight: 700, fontSize: 13, transition: 'all 0.25s', opacity: loading ? 0.7 : 1, fontFamily: 'Inter,sans-serif' }}
      >
        {added ? 'Ajouté !' : loading ? 'Ajout...' : '+ Ajouter ce défi'}
      </button>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [user, setUser] = useState<any>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dbUnavailable, setDbUnavailable] = useState(false)

  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState<Category>('bien-être')
  const [formDate, setFormDate] = useState('')

  useEffect(() => { init() }, []) // eslint-disable-line

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)
    await fetchChallenges()
    setLoading(false)
  }

  async function fetchChallenges() {
    try {
      const res = await fetch('/api/challenges')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 500 || body?.code === '42P01') {
          setDbUnavailable(true)
          return
        }
        throw new Error()
      }
      const data = await res.json()
      setChallenges(Array.isArray(data) ? data : data.challenges ?? [])
    } catch {
      setError('Impossible de charger tes défis. Vérifie ta connexion.')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle.trim(), description: formDesc.trim(), category: formCategory, target_date: formDate || null }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 500 || body?.code === '42P01') {
          setDbUnavailable(true)
          setShowForm(false)
          return
        }
        throw new Error(body?.message || 'Erreur serveur')
      }
      const created = await res.json()
      const newChallenge: Challenge = {
        id: created.id,
        user_id: created.user_id ?? '',
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory,
        target_date: formDate || null,
        completed: false,
        completed_at: null,
        total_streak: 0,
        check_ins: [],
        created_at: new Date().toISOString(),
      }
      setChallenges(prev => [newChallenge, ...prev])
      setFormTitle(''); setFormDesc(''); setFormCategory('bien-être'); setFormDate('')
      setShowForm(false)
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création du défi. Réessaie dans quelques instants.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCheckIn(id: string) {
    try {
      const res = await fetch(`/api/challenges/${id}/checkin`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setChallenges(prev => prev.map(c => {
        if (c.id !== id) return c
        return { ...c, check_ins: [...c.check_ins, { date: today() }] }
      }))
    } catch {
      setError('Erreur lors du check-in.')
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/challenges/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setChallenges(prev => prev.filter(c => c.id !== id))
    } catch {
      setError('Erreur lors de la suppression.')
    }
  }

  async function handleAddSuggestion(s: typeof SUGGESTIONS[0]) {
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: s.title, description: s.description, category: s.category, target_date: null }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 500 || body?.code === '42P01') { setDbUnavailable(true); return }
        throw new Error()
      }
      const created = await res.json()
      const newChallenge: Challenge = {
        id: created.id,
        user_id: created.user_id ?? '',
        title: s.title,
        description: s.description,
        category: s.category,
        target_date: null,
        completed: false,
        completed_at: null,
        total_streak: 0,
        check_ins: [],
        created_at: new Date().toISOString(),
      }
      setChallenges(prev => [newChallenge, ...prev])
    } catch {
      setError("Erreur lors de l'ajout.")
    }
  }

  const active = challenges.filter(c => !c.completed)
  const done = challenges.filter(c => c.completed)

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;max-height:0} to{opacity:1;max-height:1200px} }
        .ch-card { animation: fadeUp 0.4s ease both; }
        * { box-sizing: border-box; }
        input,textarea,select { font-family: Inter,Outfit,sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        input:focus, textarea:focus, select:focus { border-color: ${T} !important; box-shadow: 0 0 0 3px ${T}20 !important; }
        button:active { transform: scale(0.97); }
        @media(max-width:640px){
          .ch-main { padding: 16px 12px 100px !important; }
          .ch-header { flex-direction: column !important; align-items: flex-start !important; }
          .ch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f5fafa', fontFamily: 'Inter,Outfit,sans-serif', paddingBottom: 80 }}>

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
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, color: DARK }}>Mes Défis</span>
          <div style={{ width: 80 }} />
        </nav>

        <main className="ch-main" style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 100px' }}>

          {/* Header */}
          <div className="ch-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: DARK, fontFamily: 'Outfit,sans-serif', lineHeight: 1.2 }}>Mes Défis</h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7280' }}>
                {active.length} défi{active.length !== 1 ? 's' : ''} en cours · {done.length} accompli{done.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              style={{ padding: '10px 20px', borderRadius: 100, cursor: 'pointer', fontWeight: 700, fontSize: 14, background: showForm ? '#f0fafa' : T, color: showForm ? T : '#fff', boxShadow: showForm ? 'none' : `0 4px 14px ${T}40`, border: showForm ? `1px solid ${T}` : 'none', transition: 'all 0.25s', fontFamily: 'Inter,sans-serif' }}
            >
              {showForm ? '✕ Annuler' : '+ Nouveau défi'}
            </button>
          </div>

          {/* DB unavailable banner */}
          {dbUnavailable && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#92400e', fontWeight: 600 }}>Base de données indisponible</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#92400e' }}>
                La fonctionnalité défis n'est pas encore disponible. Le formulaire reste accessible mais les données ne seront pas sauvegardées. Réessaie plus tard.
              </p>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 14, padding: '12px 16px', marginBottom: 20, fontSize: 13, fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18, lineHeight: 1, padding: '0 0 0 12px' }}>×</button>
            </div>
          )}

          {/* Create form */}
          {showForm && (
            <div style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 20, padding: '22px', marginBottom: 24, boxShadow: '0 4px 20px rgba(48,180,167,0.08)', animation: 'slideDown 0.3s ease' }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 800, color: DARK, fontFamily: 'Outfit,sans-serif' }}>Nouveau défi</h2>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Titre du défi *</label>
                  <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ex : Faire 10 min de sport chaque matin" required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14, background: '#f9fffe', border: '1.5px solid #daeeed', color: DARK }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Description (optionnel)</label>
                  <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Décris ton défi en quelques mots..." rows={3}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14, background: '#f9fffe', border: '1.5px solid #daeeed', color: DARK, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Catégorie</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value as Category)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14, background: '#f9fffe', border: '1.5px solid #daeeed', color: DARK, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
                      {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(([val, meta]) => (
                        <option key={val} value={val}>{meta.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Date cible (optionnel)</label>
                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} min={today()}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14, background: '#f9fffe', border: '1.5px solid #daeeed', color: DARK, cursor: 'pointer' }} />
                  </div>
                </div>
                <button type="submit" disabled={submitting || !formTitle.trim()}
                  style={{ padding: '13px', borderRadius: 100, border: 'none', cursor: submitting || !formTitle.trim() ? 'not-allowed' : 'pointer', background: T, color: '#fff', fontWeight: 800, fontSize: 15, boxShadow: `0 4px 16px ${T}40`, opacity: submitting || !formTitle.trim() ? 0.6 : 1, transition: 'all 0.25s', marginTop: 4, fontFamily: 'Inter,sans-serif' }}>
                  {submitting ? 'Création...' : 'Créer ce défi'}
                </button>
              </form>
            </div>
          )}

          {/* Active challenges */}
          <section style={{ marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>
              Défis en cours{active.length > 0 && <span style={{ marginLeft: 8, background: T, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '1px 8px' }}>{active.length}</span>}
            </p>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 20, padding: 20, height: 180, opacity: 0.6 }} />
                ))}
              </div>
            ) : active.length === 0 ? (
              <div style={{ background: '#fff', border: '1px dashed #daeeed', borderRadius: 20, padding: '36px 24px', textAlign: 'center' }}>
                <svg style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p style={{ margin: 0, fontSize: 15, color: '#6B7280', fontWeight: 500 }}>Aucun défi en cours.<br/><span style={{ color: T, fontWeight: 700 }}>Lance ton premier défi !</span></p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {active.map((c, i) => (
                  <div key={c.id} className="ch-card" style={{ animationDelay: `${i * 0.07}s` }}>
                    <ChallengeCard challenge={c} onCheckIn={handleCheckIn} onDelete={handleDelete} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Completed challenges */}
          {(done.length > 0 || !loading) && (
            <section style={{ marginBottom: 36 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>
                Défis accomplis{done.length > 0 && <span style={{ marginLeft: 8, background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '1px 8px' }}>{done.length}</span>}
              </p>
              {loading ? (
                <div className="ch-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
                  {[1, 2].map(i => <div key={i} style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 18, height: 140, opacity: 0.6 }} />)}
                </div>
              ) : done.length === 0 ? (
                <div style={{ background: '#fff', border: '1px dashed #daeeed', borderRadius: 18, padding: '24px 20px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#9CA3AF' }}>Tes réussites apparaîtront ici une fois tes défis terminés.</p>
                </div>
              ) : (
                <div className="ch-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
                  {done.map((c, i) => (
                    <div key={c.id} className="ch-card" style={{ animationDelay: `${i * 0.06}s` }}>
                      <CompletedCard challenge={c} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Suggestions */}
          <section>
            <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>Suggestions Capsule</p>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6B7280' }}>Des idées de défis sélectionnées pour toi</p>
            <div className="ch-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
              {SUGGESTIONS.map((s, i) => (
                <div key={i} className="ch-card" style={{ animationDelay: `${i * 0.08}s` }}>
                  <SuggestionCard suggestion={s} onAdd={handleAddSuggestion} />
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      <BottomNav lang="fr" />
    </>
  )
}
