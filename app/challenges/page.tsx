'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'santé' | 'école' | 'social' | 'bien-être' | 'créativité'

interface CheckIn {
  date: string // ISO date string YYYY-MM-DD
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

const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  'santé':      { label: 'Santé',      emoji: '💪', color: '#EC4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.35)' },
  'école':      { label: 'École',      emoji: '📚', color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.35)' },
  'social':     { label: 'Social',     emoji: '🤝', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)' },
  'bien-être':  { label: 'Bien-être',  emoji: '🧘', color: '#0D9488', bg: 'rgba(13,148,136,0.12)', border: 'rgba(13,148,136,0.35)' },
  'créativité': { label: 'Créativité', emoji: '🎨', color: '#2563EB', bg: 'rgba(37,99,235,0.12)',  border: 'rgba(37,99,235,0.35)'  },
}

const SUGGESTIONS = [
  { title: 'Écrire dans ton journal 3 fois cette semaine', category: 'bien-être' as Category, description: 'Prends 10 minutes chaque session pour noter tes pensées et émotions.' },
  { title: '5 minutes de respiration par jour',           category: 'santé'     as Category, description: 'Une pause respiratoire quotidienne pour calmer ton esprit et recharger ton énergie.' },
  { title: 'Appeler un ami cette semaine',                category: 'social'    as Category, description: 'Prends des nouvelles d\'un ami ou d\'un proche que tu n\'as pas contacté récemment.' },
]

const today = () => new Date().toISOString().slice(0, 10)

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date(today()).getTime()
  return Math.ceil(diff / 86400000)
}

function currentWeekDates(): string[] {
  const now = new Date()
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1 // Mon=0
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
    } else {
      break
    }
  }
  return streak
}

function hasCheckedInToday(checkIns: CheckIn[]): boolean {
  return checkIns.some(c => c.date === today())
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ w = '100%', h = 20, radius = 8 }: { w?: string; h?: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(124,58,237,0.08) 0%, rgba(236,72,153,0.12) 50%, rgba(124,58,237,0.08) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.6s infinite linear',
    }} />
  )
}

// ─── Challenge Card ────────────────────────────────────────────────────────────

function ChallengeCard({
  challenge,
  onCheckIn,
  onDelete,
}: {
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
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${meta.border}`,
      borderRadius: 20,
      padding: '20px 22px',
      boxShadow: `0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.12)`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${meta.color}, transparent)`,
        borderRadius: '20px 20px 0 0',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              color: meta.color,
              fontSize: 11, fontWeight: 700, borderRadius: 20,
              padding: '2px 10px', letterSpacing: '0.04em',
            }}>
              {meta.emoji} {meta.label}
            </span>
            {checkedToday && (
              <span style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.35)',
                color: '#22c55e', fontSize: 11, fontWeight: 700,
                borderRadius: 20, padding: '2px 10px',
              }}>
                ✓ Fait aujourd'hui
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>
            {challenge.title}
          </h3>
        </div>
        <button
          onClick={async () => { setDeleting(true); await onDelete(challenge.id); setDeleting(false) }}
          disabled={deleting}
          style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', borderRadius: 10, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14, flexShrink: 0,
            opacity: deleting ? 0.5 : 1, transition: 'all 0.2s',
          }}
          title="Supprimer"
        >
          🗑
        </button>
      </div>

      {/* Description */}
      {challenge.description && (
        <p style={{ margin: '0 0 14px', fontSize: 13.5, color: '#4a4a6a', lineHeight: 1.55 }}>
          {challenge.description}
        </p>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{
          background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#F97316' }}>
            {streak} jour{streak !== 1 ? 's' : ''} consécutif{streak !== 1 ? 's' : ''}
          </span>
        </div>
        {daysLeft !== null && (
          <div style={{
            background: daysLeft < 3 ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)',
            border: `1px solid ${daysLeft < 3 ? 'rgba(239,68,68,0.25)' : 'rgba(124,58,237,0.25)'}`,
            borderRadius: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>📅</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: daysLeft < 3 ? '#ef4444' : '#7C3AED' }}>
              {daysLeft > 0 ? `J-${daysLeft}` : daysLeft === 0 ? "Aujourd'hui !" : 'Terminé'}
            </span>
          </div>
        )}
      </div>

      {/* Weekly progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#6b6b8a', fontWeight: 600 }}>Cette semaine</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{weekly}/7 jours</span>
        </div>
        <div style={{ height: 8, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(weekly / 7) * 100}%`,
            background: `linear-gradient(90deg, ${meta.color}, ${meta.color}cc)`,
            borderRadius: 99,
            transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        </div>
        {/* Day dots */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {currentWeekDates().map((d, i) => {
            const done = challenge.check_ins.some(c => c.date === d)
            const isToday = d === today()
            return (
              <div key={d} title={d} style={{
                flex: 1, height: 6, borderRadius: 99,
                background: done ? meta.color : isToday ? `${meta.color}40` : 'rgba(0,0,0,0.08)',
                border: isToday ? `1.5px solid ${meta.color}80` : 'none',
                transition: 'background 0.3s',
              }} />
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: '#9494b8', fontWeight: 600 }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Check-in button */}
      <button
        onClick={async () => { setLoading(true); await onCheckIn(challenge.id); setLoading(false) }}
        disabled={checkedToday || loading}
        style={{
          width: '100%', padding: '12px', borderRadius: 14,
          border: 'none', cursor: checkedToday ? 'default' : 'pointer',
          background: checkedToday
            ? 'rgba(34,197,94,0.12)'
            : `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
          color: checkedToday ? '#22c55e' : '#fff',
          fontWeight: 700, fontSize: 14, letterSpacing: '0.02em',
          boxShadow: checkedToday ? 'none' : `0 4px 16px ${meta.color}40`,
          transition: 'all 0.25s',
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading ? (
          <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⏳</span>
        ) : checkedToday ? (
          '✅ Déjà coché aujourd\'hui !'
        ) : (
          <>Marquer aujourd'hui <span>✓</span></>
        )}
      </button>
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
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid rgba(255,215,0,0.25)`,
      borderRadius: 18,
      padding: '18px 20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,215,0,0.15)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #ffd700, #f59e0b, #ffd700)',
      }} />
      <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: meta.bg, border: `1px solid ${meta.border}`,
        color: meta.color, fontSize: 11, fontWeight: 700,
        borderRadius: 20, padding: '2px 10px', marginBottom: 8,
      }}>
        {meta.emoji} {meta.label}
      </div>
      <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.35 }}>
        {challenge.title}
      </h4>
      {completedDate && (
        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b6b8a' }}>
          Accompli le {completedDate}
        </p>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(249,115,22,0.1)', borderRadius: 10, padding: '4px 10px',
        width: 'fit-content',
      }}>
        <span style={{ fontSize: 14 }}>🔥</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316' }}>
          {challenge.total_streak} jours au total
        </span>
      </div>
    </div>
  )
}

// ─── Suggestion Card ──────────────────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  onAdd,
}: {
  suggestion: typeof SUGGESTIONS[0]
  onAdd: (s: typeof SUGGESTIONS[0]) => Promise<void>
}) {
  const meta = CATEGORY_META[suggestion.category]
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid rgba(124,58,237,0.2)`,
      borderRadius: 18,
      padding: '18px 20px',
      boxShadow: '0 4px 20px rgba(124,58,237,0.06)',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: meta.bg, border: `1px solid ${meta.border}`,
        color: meta.color, fontSize: 11, fontWeight: 700,
        borderRadius: 20, padding: '2px 10px', marginBottom: 10,
      }}>
        {meta.emoji} {meta.label}
      </div>
      <p style={{ margin: '0 0 14px', fontSize: 13.5, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5 }}>
        {suggestion.title}
      </p>
      <p style={{ margin: '0 0 16px', fontSize: 12.5, color: '#6b6b8a', lineHeight: 1.5 }}>
        {suggestion.description}
      </p>
      <button
        onClick={async () => { setLoading(true); await onAdd(suggestion); setAdded(true); setLoading(false) }}
        disabled={loading || added}
        style={{
          width: '100%', padding: '10px', borderRadius: 12,
          border: added ? '1px solid rgba(34,197,94,0.35)' : `1px solid ${meta.border}`,
          cursor: added ? 'default' : 'pointer',
          background: added ? 'rgba(34,197,94,0.1)' : meta.bg,
          color: added ? '#22c55e' : meta.color,
          fontWeight: 700, fontSize: 13, transition: 'all 0.25s',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {added ? '✓ Ajouté !' : loading ? 'Ajout...' : '+ Ajouter ce défi'}
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

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState<Category>('bien-être')
  const [formDate, setFormDate] = useState('')

  useEffect(() => { init() }, [])

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
      if (!res.ok) throw new Error()
      const data = await res.json()
      setChallenges(Array.isArray(data) ? data : data.challenges ?? [])
    } catch {
      setError('Impossible de charger tes défis.')
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
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDesc.trim(),
          category: formCategory,
          target_date: formDate || null,
        }),
      })
      if (!res.ok) throw new Error()
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
    } catch {
      setError('Erreur lors de la création du défi.')
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
        const newCheckIn: CheckIn = { date: today() }
        return { ...c, check_ins: [...c.check_ins, newCheckIn] }
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
        body: JSON.stringify({
          title: s.title,
          description: s.description,
          category: s.category,
          target_date: null,
        }),
      })
      if (!res.ok) throw new Error()
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
      setError('Erreur lors de l\'ajout.')
    }
  }

  const active = challenges.filter(c => !c.completed)
  const done = challenges.filter(c => c.completed)

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; transform: translateY(-8px); }
          to   { opacity: 1; max-height: 1000px; transform: translateY(0); }
        }
        .challenge-card { animation: fadeUp 0.4s ease both; }
        * { box-sizing: border-box; }
        input, textarea, select {
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus, textarea:focus, select:focus {
          border-color: rgba(124,58,237,0.6) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
        }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 99px; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F8F7FF 0%, #f0eeff 40%, #fce7f3 80%, #fff7ed 100%)',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        paddingBottom: 100,
      }}>

        {/* ── Sidebar (desktop) + Main ────────────────────────────────────── */}
        <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>

          {/* Sidebar */}
          <aside style={{
            width: 240, minHeight: '100vh', padding: '32px 16px',
            display: 'none',
            flexDirection: 'column', gap: 6,
          }} className="sidebar-desktop">
            <div style={{
              fontWeight: 800, fontSize: 20, color: '#7C3AED',
              marginBottom: 28, paddingLeft: 12,
              background: 'linear-gradient(90deg, #7C3AED, #EC4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              ✨ Capsule Ado
            </div>
            {[
              { href: '/dashboard/ado', label: '🏠 Accueil', active: false },
              { href: '/chat',          label: '💬 Chat IA',  active: false },
              { href: '/journal',       label: '📔 Journal',  active: false },
              { href: '/challenges',    label: '🎯 Défis',    active: true  },
              { href: '/motivation',    label: '⚡ Motivation',active: false },
              { href: '/profile',       label: '👤 Profil',   active: false },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 14,
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
                background: item.active ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1))' : 'transparent',
                color: item.active ? '#7C3AED' : '#4a4a6a',
                border: item.active ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}>
                {item.label}
              </a>
            ))}
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, padding: '24px 16px', maxWidth: 760, margin: '0 auto' }}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 28, flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <h1 style={{
                  margin: 0, fontSize: 30, fontWeight: 800,
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899, #F97316)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2,
                }}>
                  Mes Défis 🎯
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b6b8a' }}>
                  {active.length} défi{active.length !== 1 ? 's' : ''} en cours · {done.length} accompli{done.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowForm(v => !v)}
                style={{
                  padding: '11px 22px', borderRadius: 16, border: 'none',
                  cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  background: showForm
                    ? 'rgba(124,58,237,0.1)'
                    : 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  color: showForm ? '#7C3AED' : '#fff',
                  boxShadow: showForm ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                  border: showForm ? '1px solid rgba(124,58,237,0.3)' : 'none',
                  transition: 'all 0.25s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {showForm ? '✕ Annuler' : '+ Ajouter un défi'}
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444', borderRadius: 14, padding: '12px 16px',
                marginBottom: 20, fontSize: 13.5, fontWeight: 500,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>⚠️ {error}</span>
                <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16 }}>×</button>
              </div>
            )}

            {/* ── Create Form ──────────────────────────────────────────────── */}
            {showForm && (
              <div style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 22,
                padding: '24px',
                marginBottom: 28,
                boxShadow: '0 8px 40px rgba(124,58,237,0.1)',
                animation: 'slideDown 0.35s ease',
              }}>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>
                  ✨ Nouveau défi
                </h2>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 700, color: '#4a4a6a' }}>
                      Titre du défi *
                    </label>
                    <input
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="Ex : Faire 10 min de sport chaque matin"
                      required
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
                        background: 'rgba(255,255,255,0.8)',
                        border: '1.5px solid rgba(124,58,237,0.2)',
                        color: '#1a1a2e',
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 700, color: '#4a4a6a' }}>
                      Description (optionnel)
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder="Décris ton défi en quelques mots..."
                      rows={3}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
                        background: 'rgba(255,255,255,0.8)',
                        border: '1.5px solid rgba(124,58,237,0.2)',
                        color: '#1a1a2e', resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Category + Date row */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 700, color: '#4a4a6a' }}>
                        Catégorie
                      </label>
                      <select
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value as Category)}
                        style={{
                          width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
                          background: 'rgba(255,255,255,0.8)',
                          border: '1.5px solid rgba(124,58,237,0.2)',
                          color: '#1a1a2e', cursor: 'pointer',
                          appearance: 'none', WebkitAppearance: 'none',
                        }}
                      >
                        {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(([val, meta]) => (
                          <option key={val} value={val}>{meta.emoji} {meta.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 700, color: '#4a4a6a' }}>
                        Date cible (optionnel)
                      </label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={e => setFormDate(e.target.value)}
                        min={today()}
                        style={{
                          width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
                          background: 'rgba(255,255,255,0.8)',
                          border: '1.5px solid rgba(124,58,237,0.2)',
                          color: '#1a1a2e', cursor: 'pointer',
                        }}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !formTitle.trim()}
                    style={{
                      padding: '13px', borderRadius: 14, border: 'none',
                      cursor: submitting || !formTitle.trim() ? 'not-allowed' : 'pointer',
                      background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                      color: '#fff', fontWeight: 800, fontSize: 15,
                      boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                      opacity: submitting || !formTitle.trim() ? 0.6 : 1,
                      transition: 'all 0.25s',
                      marginTop: 4,
                    }}
                  >
                    {submitting ? 'Création...' : '🎯 Créer ce défi'}
                  </button>
                </form>
              </div>
            )}

            {/* ── Défis en cours ───────────────────────────────────────────── */}
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>
                Défis en cours{active.length > 0 && <span style={{
                  marginLeft: 10, background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  color: '#fff', fontSize: 13, fontWeight: 700, borderRadius: 20,
                  padding: '2px 10px',
                }}>{active.length}</span>}
              </h2>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(124,58,237,0.15)',
                      borderRadius: 20, padding: '20px 22px',
                      display: 'flex', flexDirection: 'column', gap: 12,
                    }}>
                      <Skeleton w="40%" h={18} />
                      <Skeleton w="70%" h={22} />
                      <Skeleton w="100%" h={14} />
                      <Skeleton w="100%" h={8} radius={99} />
                      <Skeleton w="100%" h={44} radius={14} />
                    </div>
                  ))}
                </div>
              ) : active.length === 0 ? (
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px dashed rgba(124,58,237,0.25)',
                  borderRadius: 20, padding: '40px 24px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                  <p style={{ margin: 0, fontSize: 15, color: '#6b6b8a', fontWeight: 500 }}>
                    Aucun défi en cours.<br />
                    <span style={{ color: '#7C3AED', fontWeight: 700 }}>Lance ton premier défi !</span>
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {active.map((c, i) => (
                    <div key={c.id} className="challenge-card" style={{ animationDelay: `${i * 0.07}s` }}>
                      <ChallengeCard
                        challenge={c}
                        onCheckIn={handleCheckIn}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Défis accomplis ──────────────────────────────────────────── */}
            {(done.length > 0 || !loading) && (
              <section style={{ marginBottom: 40 }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>
                  Défis accomplis 🏆
                  {done.length > 0 && <span style={{
                    marginLeft: 10, background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                    color: '#fff', fontSize: 13, fontWeight: 700, borderRadius: 20,
                    padding: '2px 10px',
                  }}>{done.length}</span>}
                </h2>

                {loading ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    {[1, 2].map(i => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 18, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Skeleton w="30px" h={30} radius={4} />
                        <Skeleton w="60%" h={16} />
                        <Skeleton w="80%" h={14} />
                      </div>
                    ))}
                  </div>
                ) : done.length === 0 ? (
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px dashed rgba(255,215,0,0.25)',
                    borderRadius: 18, padding: '30px 20px', textAlign: 'center',
                  }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#6b6b8a' }}>
                      Tes trophées apparaîtront ici une fois tes défis terminés. 💪
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    {done.map((c, i) => (
                      <div key={c.id} className="challenge-card" style={{ animationDelay: `${i * 0.06}s` }}>
                        <CompletedCard challenge={c} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Suggestions Capsule ──────────────────────────────────────── */}
            <section>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>
                  Suggestions Capsule ✨
                </h2>
                <p style={{ margin: 0, fontSize: 13.5, color: '#6b6b8a' }}>
                  Des idées de défis sélectionnées pour toi
                </p>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 14,
              }}>
                {SUGGESTIONS.map((s, i) => (
                  <div key={i} className="challenge-card" style={{ animationDelay: `${i * 0.08}s` }}>
                    <SuggestionCard suggestion={s} onAdd={handleAddSuggestion} />
                  </div>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>

      <BottomNav lang="fr" />

      <style>{`
        @media (min-width: 900px) {
          .sidebar-desktop { display: flex !important; }
        }
      `}</style>
    </>
  )
}
