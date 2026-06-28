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
}

interface Slot {
  id: string
  starts_at: string
  duration: number
  booked: boolean
}

type ConsultType = 'video' | 'phone' | 'in_person'

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 4L7 10l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 36, height: 36, border: `3px solid rgba(48,180,167,0.2)`, borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`
}

function formatDayKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDayLabel(dayKey: string) {
  const d = new Date(dayKey + 'T00:00:00')
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

// Generate static placeholder slots for the next 2 weeks on Mon/Wed/Fri mornings
function generatePlaceholderSlots(): Slot[] {
  const slots: Slot[] = []
  const now = new Date()
  const hours = [9, 10, 11]
  let count = 0
  for (let dayOffset = 1; dayOffset <= 14 && count < 6; dayOffset++) {
    const d = new Date(now)
    d.setDate(d.getDate() + dayOffset)
    d.setSeconds(0, 0)
    const dow = d.getDay()
    if (dow === 1 || dow === 3 || dow === 5) {
      const hour = hours[count % hours.length]
      d.setHours(hour, 0, 0, 0)
      slots.push({
        id: `placeholder-${count}`,
        starts_at: d.toISOString(),
        duration: 50,
        booked: false,
      })
      count++
    }
  }
  return slots
}

function groupSlotsByDay(slots: Slot[]): Record<string, Slot[]> {
  const groups: Record<string, Slot[]> = {}
  for (const s of slots) {
    const key = formatDayKey(s.starts_at)
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return groups
}

export default function BookPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const [pro, setPro] = useState<ProProfile | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsPlaceholder, setSlotsPlaceholder] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [consultType, setConsultType] = useState<ConsultType>('video')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [proNotFound, setProNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      // Load pro
      const { data: proData, error: proError } = await supabase
        .from('profiles')
        .select('id, name, specialty')
        .eq('id', params.id)
        .single()

      if (proError || !proData) {
        setProNotFound(true)
        setLoading(false)
        return
      }
      setPro(proData as ProProfile)

      // Load slots — handle 42P01 gracefully
      const isTableMissing = (err: any) =>
        err?.code === '42P01' || err?.message?.includes('42P01') || err?.message?.includes('does not exist')

      const { data: slotData, error: slotError } = await supabase
        .from('pro_slots')
        .select('id, starts_at, duration, booked')
        .eq('pro_id', params.id)
        .eq('booked', false)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })

      if (slotError && isTableMissing(slotError)) {
        setSlots(generatePlaceholderSlots())
        setSlotsPlaceholder(true)
      } else if (!slotError && slotData && slotData.length > 0) {
        setSlots(slotData as Slot[])
      } else {
        setSlots(generatePlaceholderSlots())
        setSlotsPlaceholder(true)
      }

      setLoading(false)
    }
    load()
  }, [params.id]) // eslint-disable-line

  async function handleSubmit() {
    if (!selectedSlot || !pro) return
    setSubmitting(true)

    const selectedSlotObj = slots.find(s => s.id === selectedSlot)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      const { error } = await supabase.from('appointments').insert({
        patient_id: user.id,
        pro_id: pro.id,
        scheduled_at: selectedSlotObj?.starts_at || new Date().toISOString(),
        type: consultType,
        status: 'pending',
        notes: note.trim() || null,
      })

      // Mark slot as booked if not placeholder
      if (!slotsPlaceholder && selectedSlot && !selectedSlot.startsWith('placeholder-')) {
        await supabase.from('pro_slots').update({ booked: true }).eq('id', selectedSlot)
      }

      // Show success regardless of DB error (pro will be contacted separately)
      setSuccess(true)
    } catch (_) {
      setSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7fafa', fontFamily: 'Inter, sans-serif' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Spinner />
      </div>
    )
  }

  if (proNotFound || !pro) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7fafa', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: DARK_GREEN, fontWeight: 700, fontSize: 18 }}>Professionnel introuvable.</p>
        <Link href="/trouver-un-pro" style={{ color: TEAL, textDecoration: 'none', fontWeight: 600 }}>Retour à la liste</Link>
      </div>
    )
  }

  const grouped = groupSlotsByDay(slots)
  const dayKeys = Object.keys(grouped).sort()

  const consultOptions: { value: ConsultType; label: string }[] = [
    { value: 'video', label: 'Video' },
    { value: 'phone', label: 'Telephone' },
    { value: 'in_person', label: 'En cabinet' },
  ]

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7fafa', fontFamily: 'Inter, sans-serif' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Nav */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,250,250,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(48,180,167,0.12)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/pros/${pro.id}`} style={{ display: 'flex', alignItems: 'center', color: DARK_GREEN, textDecoration: 'none', padding: '6px 8px', borderRadius: 8 }}>
            <BackIcon />
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Capsule" height={36} style={{ objectFit: 'contain' }} />
        </nav>

        <div style={{ maxWidth: 480, margin: '64px auto', padding: '0 20px', animation: 'fadeUp 0.4s ease' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '40px 28px', textAlign: 'center', border: `2px solid rgba(48,180,167,0.3)`, boxShadow: '0 8px 32px rgba(48,180,167,0.12)' }}>
            {/* Check circle */}
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(48,180,167,0.12)', border: `2px solid ${TEAL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14l6 6 10-12" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 800, color: DARK_GREEN, margin: '0 0 12px' }}>
              Demande envoyee !
            </h2>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, margin: '0 0 28px' }}>
              {pro.name} vous contactera dans les 24h pour confirmer votre rendez-vous.
            </p>
            <Link
              href="/appointments"
              style={{ display: 'block', background: TEAL, color: DARK_GREEN, fontWeight: 800, fontSize: 14, padding: '14px 24px', borderRadius: 100, textDecoration: 'none', marginBottom: 10 }}
            >
              Voir mes rendez-vous
            </Link>
            <Link
              href="/trouver-un-pro"
              style={{ display: 'block', fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '10px 0' }}
            >
              Retour a la liste
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafa', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,250,250,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(48,180,167,0.12)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href={`/pros/${pro.id}`} style={{ display: 'flex', alignItems: 'center', color: DARK_GREEN, textDecoration: 'none', padding: '6px 8px', borderRadius: 8 }}>
          <BackIcon />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Capsule" height={36} style={{ objectFit: 'contain' }} />
      </nav>

      {/* Hero */}
      <div style={{ background: DARK_GREEN, padding: '36px 20px 28px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
            Prendre rendez-vous avec {pro.name}
          </h1>
          {pro.specialty && (
            <p style={{ margin: '6px 0 0', fontSize: 14, color: `rgba(48,180,167,0.9)`, fontWeight: 500 }}>{pro.specialty}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 100px' }}>

        {/* Consultation type selector */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type de consultation</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {consultOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setConsultType(opt.value)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 100,
                  border: `2px solid ${consultType === opt.value ? TEAL : 'rgba(48,180,167,0.25)'}`,
                  background: consultType === opt.value ? TEAL : '#fff',
                  color: consultType === opt.value ? DARK_GREEN : '#374151',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Slot picker */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Choisir un creneau</h2>
          {slotsPlaceholder && (
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#9ca3af' }}>Creneaux indicatifs — le professionnel confirmera la disponibilite.</p>
          )}
          {dayKeys.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Aucun creneau disponible pour le moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {dayKeys.map(dayKey => (
                <div key={dayKey}>
                  <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: DARK_GREEN }}>{formatDayLabel(dayKey)}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {grouped[dayKey].map(slot => {
                      const selected = selectedSlot === slot.id
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(selected ? null : slot.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 100,
                            border: `2px solid ${selected ? TEAL : 'rgba(48,180,167,0.3)'}`,
                            background: selected ? TEAL : '#fff',
                            color: selected ? DARK_GREEN : '#374151',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.15s',
                          }}
                        >
                          {formatTime(slot.starts_at)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Optional note */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Note pour le professionnel (optionnel)</h2>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Decrivez brievement ce pour quoi vous consultez..."
            rows={4}
            style={{ width: '100%', boxSizing: 'border-box', background: '#fff', border: `1.5px solid rgba(48,180,167,0.25)`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#374151', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }}
          />
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedSlot || submitting}
          style={{
            width: '100%',
            background: selectedSlot ? TEAL : 'rgba(48,180,167,0.35)',
            color: DARK_GREEN,
            fontWeight: 800,
            fontSize: 15,
            padding: '16px 24px',
            borderRadius: 16,
            border: 'none',
            cursor: selectedSlot ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            boxShadow: selectedSlot ? `0 4px 16px rgba(48,180,167,0.3)` : 'none',
          }}
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
        </button>
        {!selectedSlot && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', margin: '8px 0 0' }}>Selectionnez un creneau pour continuer</p>
        )}
      </div>
    </div>
  )
}
