'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const T = '#30B4A7'
const DARK = '#082827'

const MOODS = [
  { value: 5, label: 'Très bien', color: '#22c55e' },
  { value: 4, label: 'Bien',      color: T },
  { value: 3, label: 'Neutre',   color: '#f59e0b' },
  { value: 2, label: 'Pas top',  color: '#f97316' },
  { value: 1, label: 'Difficile',color: '#ef4444' },
]

const MOOD_ICONS = [
  <svg key={5} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  <svg key={4} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 1.5 4 1.5 4-1.5 4-1.5"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  <svg key={3} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  <svg key={2} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  <svg key={1} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 17s-1.5-3-4-3-4 3-4 3"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
]

interface JournalEntry {
  id: string
  content: string
  mood: number | null
  created_at: string
}

export default function JournalPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [dbUnavailable, setDbUnavailable] = useState(false)
  const [content, setContent] = useState('')
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { router.replace('/auth'); return }
      setUser(u)
      loadEntries(u.id)
    })
  }, []) // eslint-disable-line

  async function loadEntries(userId: string) {
    try {
      const { data, error: err } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (err) {
        // Table doesn't exist yet
        if (err.code === '42P01' || err.message?.includes('does not exist')) {
          setDbUnavailable(true)
        } else {
          setError('Impossible de charger les entrées.')
        }
      } else {
        setEntries(data || [])
      }
    } catch {
      setError('Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!content.trim() || !user) return
    setSaving(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('journal_entries')
        .insert({ user_id: user.id, content: content.trim(), mood: selectedMood, created_at: new Date().toISOString() })
        .select()
        .single()

      if (err) {
        if (err.code === '42P01' || err.message?.includes('does not exist')) {
          setDbUnavailable(true)
        } else {
          setError("Erreur lors de l'enregistrement.")
        }
      } else {
        setEntries(prev => [data, ...prev])
        setContent('')
        setSelectedMood(null)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      setError("Erreur lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const { error: err } = await supabase.from('journal_entries').delete().eq('id', id)
    if (!err) setEntries(prev => prev.filter(e => e.id !== id))
  }

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const todayEntry = entries.find(e => new Date(e.created_at).toDateString() === new Date().toDateString())

  return (
    <div style={{ minHeight: '100vh', background: '#f5fafa', fontFamily: 'Inter,Outfit,sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        textarea:focus { border-color: ${T} !important; box-shadow: 0 0 0 3px ${T}20 !important; outline: none !important; }
        @media(max-width:640px){
          .journal-hero { padding: 28px 16px !important; }
          .journal-main { padding: 16px 12px 60px !important; }
          .journal-grid { grid-template-columns: 1fr !important; }
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
        <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, color: DARK }}>Mon Journal</span>
        <div style={{ width: 80 }} />
      </nav>

      {/* Hero */}
      <div className="journal-hero" style={{ background: DARK, padding: '32px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(20px,4vw,30px)', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Mon Journal</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0, textTransform: 'capitalize' }}>{today}</p>
      </div>

      <div className="journal-main" style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* DB unavailable */}
        {dbUnavailable && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14, color: '#92400e', fontWeight: 600 }}>Journal indisponible</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#92400e' }}>
              La table du journal n'est pas encore configurée. Les entrées ne peuvent pas être sauvegardées pour le moment. Réessaie plus tard.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18 }}>×</button>
          </div>
        )}

        {/* Write area */}
        <div style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 20, padding: '22px', marginBottom: 24, boxShadow: '0 2px 8px rgba(48,180,167,0.05)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px' }}>
            {todayEntry ? "Ajouter une entrée" : "Entrée du jour"}
          </p>

          {/* Mood selector */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>Comment tu te sens ?</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MOODS.map((m, idx) => (
                <button key={m.value} onClick={() => setSelectedMood(selectedMood === m.value ? null : m.value)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 12, border: `1.5px solid ${selectedMood === m.value ? m.color : '#daeeed'}`, background: selectedMood === m.value ? `${m.color}15` : '#f9fffe', color: selectedMood === m.value ? m.color : '#6B7280', cursor: 'pointer', transition: 'all 0.2s', fontSize: 11, fontWeight: 600 }}>
                  <span style={{ color: selectedMood === m.value ? m.color : '#9CA3AF' }}>{MOOD_ICONS[idx]}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Comment s'est passée ta journée ? Qu'est-ce qui t'a traversé l'esprit ?..."
            rows={6}
            style={{ width: '100%', background: '#f9fffe', border: '1.5px solid #daeeed', borderRadius: 12, padding: '14px', fontSize: 14, color: DARK, resize: 'vertical', fontFamily: 'Inter,sans-serif', lineHeight: 1.7, transition: 'border-color 0.2s', minHeight: 140 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{content.length} caractères</span>
            <button
              onClick={handleSave}
              disabled={saving || !content.trim() || dbUnavailable}
              style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: saved ? '#22c55e' : T, color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving || !content.trim() || dbUnavailable ? 'not-allowed' : 'pointer', opacity: !content.trim() || dbUnavailable ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 14px ${T}40`, transition: 'all 0.25s', fontFamily: 'Inter,sans-serif' }}
            >
              {saving ? (
                <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : saved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Enregistré !
                </>
              ) : 'Enregistrer'}
            </button>
          </div>
        </div>

        {/* Entries list */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px' }}>
            Mes entrées{entries.length > 0 && <span style={{ marginLeft: 8, background: T, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '1px 8px' }}>{entries.length}</span>}
          </p>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 16, height: 100, opacity: 0.6 }} />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div style={{ background: '#fff', border: '1px dashed #daeeed', borderRadius: 20, padding: '40px 24px', textAlign: 'center' }}>
              <svg style={{ margin: '0 auto 14px', display: 'block', opacity: 0.4 }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <p style={{ color: '#9CA3AF', fontSize: 15, margin: 0 }}>Aucune entrée pour l'instant.<br/>Commence à écrire ta première !</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entries.map((entry, i) => {
                const mood = MOODS.find(m => m.value === entry.mood)
                const date = new Date(entry.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
                const time = new Date(entry.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={entry.id} style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.04}s` }}>
                    <div style={{ height: 3, background: mood ? mood.color : T }} />
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: DARK, textTransform: 'capitalize' }}>{date}</span>
                          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>{time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {mood && (
                            <span style={{ background: `${mood.color}15`, color: mood.color, borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{mood.label}</span>
                          )}
                          <button onClick={() => handleDelete(entry.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 6 }}
                            title="Supprimer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                          </button>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{entry.content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
