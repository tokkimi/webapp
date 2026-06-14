'use client'
export const dynamic = 'force-dynamic'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const TEAL = '#30B4A7'
const DARK = '#082827'

type Slot = { id: string; pro_id: string; starts_at: string; ends_at: string; is_booked: boolean }
type Appointment = {
  id: string
  scheduled_at: string
  duration_minutes: number
  type: string
  status: string
  notes_for_pro?: string
  patient?: { id: string; name: string; avatar_url?: string }
  pro?: { id: string; name: string; avatar_url?: string; specialty?: string }
}
type Pro = {
  id: string
  name: string
  avatar_url?: string
  specialty?: string
  location?: string
  rating?: number
}

export default function AppointmentsPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const [role, setRole] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedPro, setSelectedPro] = useState<Pro | null>(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [notes, setNotes] = useState('')
  const [type, setType] = useState('video')
  const [newSlot, setNewSlot] = useState('')
  const [duration, setDuration] = useState(50)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function api(path: string, init: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.replace('/auth')
      throw new Error('Session expiree')
    }
    return fetch(path, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${session.access_token}`,
        ...(init.headers ?? {}),
      },
    })
  }

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await api('/api/appointments')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setRole(result.role)
      setAppointments(result.appointments)

      const proId = new URLSearchParams(window.location.search).get('pro')
      if (result.role === 'pro') {
        const slotsResponse = await api('/api/appointments?resource=slots')
        setSlots(await slotsResponse.json())
      } else if (proId) {
        const { data: pro } = await supabase
          .from('public_professionals')
          .select('*')
          .eq('id', proId)
          .single()
        setSelectedPro(pro)
        const slotsResponse = await api(`/api/appointments?resource=slots&pro=${encodeURIComponent(proId)}`)
        setSlots(await slotsResponse.json())
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger votre agenda.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  async function book(e: FormEvent) {
    e.preventDefault()
    if (!selectedSlot) return
    setSaving(true)
    setError('')
    const response = await api('/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ slot_id: selectedSlot, type, notes }),
    })
    const result = await response.json()
    setSaving(false)
    if (!response.ok) {
      setError(result.error || 'Ce creneau ne peut pas etre reserve.')
      return
    }
    setMessage('Votre demande a bien ete envoyee au professionnel.')
    setSelectedSlot('')
    setNotes('')
    await load()
  }

  async function addSlot(e: FormEvent) {
    e.preventDefault()
    if (!newSlot) return
    setSaving(true)
    const response = await api('/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ action: 'slot', starts_at: newSlot, duration_minutes: duration }),
    })
    const result = await response.json()
    setSaving(false)
    if (!response.ok) {
      setError(result.error || 'Impossible d’ajouter ce creneau.')
      return
    }
    setNewSlot('')
    setMessage('Le creneau est maintenant visible sur votre profil public.')
    await load()
  }

  async function updateStatus(id: string, status: string) {
    const response = await api('/api/appointments', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    })
    const result = await response.json()
    if (!response.ok) setError(result.error)
    else await load()
  }

  async function removeSlot(id: string) {
    const response = await api(`/api/appointments?slot=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (response.ok) await load()
  }

  const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= new Date() && a.status !== 'cancelled')
  const past = appointments.filter(a => !upcoming.includes(a))
  return (
    <div style={{ minHeight: '100vh', background: '#f5fafa', color: DARK, fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ height: 60, padding: '0 20px', background: '#fff', borderBottom: '1px solid #daeeed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.back()} style={{ border: 0, background: 'transparent', color: TEAL, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>← Précédent</button>
        <strong style={{ fontFamily: 'Outfit, sans-serif' }}>{role === 'pro' ? 'Mon agenda professionnel' : 'Mes rendez-vous'}</strong>
        <Link href="/messages" style={{ color: DARK, textDecoration: 'none', fontSize: 13 }}>Messages</Link>
      </nav>

      <main style={{ maxWidth: 920, margin: '0 auto', padding: '28px 16px 80px' }}>
        {loading && <p style={{ color: '#64748b' }}>Chargement de votre agenda...</p>}
        {error && <Notice color="#b91c1c">{error}</Notice>}
        {message && <Notice color="#087f73">{message}</Notice>}

        {!loading && role === 'pro' && (
          <>
            <section style={card}>
              <p style={eyebrow}>Disponibilites publiques</p>
              <h1 style={title}>Ouvrir un creneau</h1>
              <p style={subtitle}>Seuls les horaires que vous ajoutez ici peuvent etre demandes par un patient.</p>
              <form onSubmit={addSlot} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                <input type="datetime-local" value={newSlot} min={new Date().toISOString().slice(0, 16)}
                  onChange={e => setNewSlot(e.target.value)} required style={{ ...input, flex: 2, minWidth: 220 }} />
                <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={{ ...input, flex: 1 }}>
                  <option value={30}>30 minutes</option>
                  <option value={50}>50 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
                <button disabled={saving} style={primaryButton}>Ajouter</button>
              </form>
              <div style={{ display: 'grid', gap: 8, marginTop: 18 }}>
                {slots.length === 0 && <Empty>Aucun creneau ouvert.</Empty>}
                {slots.map(slot => (
                  <div key={slot.id} style={row}>
                    <span>{formatDate(slot.starts_at)} - {formatTime(slot.ends_at)}</span>
                    <span style={{ color: slot.is_booked ? '#b45309' : '#087f73', fontSize: 12, fontWeight: 700 }}>
                      {slot.is_booked ? 'Reserve' : 'Disponible'}
                    </span>
                    {!slot.is_booked && <button onClick={() => removeSlot(slot.id)} style={textButton}>Supprimer</button>}
                  </div>
                ))}
              </div>
            </section>

            <AppointmentSection title="Demandes et rendez-vous" appointments={appointments} role={role} updateStatus={updateStatus} />
          </>
        )}

        {!loading && role !== 'pro' && (
          <>
            {selectedPro ? (
              <section style={card}>
                <p style={eyebrow}>Demande de rendez-vous</p>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <Avatar profile={selectedPro} />
                  <div>
                    <h1 style={{ ...title, marginBottom: 3 }}>{selectedPro.name}</h1>
                    <p style={subtitle}>{selectedPro.specialty} {selectedPro.location ? `- ${selectedPro.location}` : ''}</p>
                  </div>
                </div>
                <form onSubmit={book} style={{ marginTop: 22 }}>
                  <label style={label}>Choisissez un creneau encore disponible</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 8, margin: '8px 0 18px' }}>
                    {slots.length === 0 && <Empty>Ce professionnel n’a pas encore publie de creneau.</Empty>}
                    {slots.map(slot => (
                      <button type="button" key={slot.id} onClick={() => setSelectedSlot(slot.id)}
                        style={{ ...slotButton, ...(selectedSlot === slot.id ? selectedSlotButton : {}) }}>
                        {formatDate(slot.starts_at)}
                      </button>
                    ))}
                  </div>
                  <label style={label}>Type de consultation</label>
                  <select value={type} onChange={e => setType(e.target.value)} style={{ ...input, width: '100%', margin: '8px 0 16px' }}>
                    <option value="video">Visio</option>
                    <option value="phone">Telephone</option>
                    <option value="in_person">En cabinet</option>
                  </select>
                  <label style={label}>Motif, sans information trop personnelle</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...input, width: '100%', margin: '8px 0 16px', resize: 'vertical' }} />
                  <button disabled={!selectedSlot || saving} style={{ ...primaryButton, width: '100%', opacity: !selectedSlot ? .5 : 1 }}>
                    {saving ? 'Envoi...' : 'Envoyer la demande'}
                  </button>
                </form>
              </section>
            ) : (
              <section style={{ ...card, textAlign: 'center' }}>
                <h1 style={title}>Choisissez d’abord un professionnel</h1>
                <p style={subtitle}>Consultez son profil public, ses avis et ses disponibilites avant de demander un rendez-vous.</p>
                <Link href="/trouver-un-pro" style={{ ...primaryButton, display: 'inline-block', textDecoration: 'none', marginTop: 18 }}>Trouver un professionnel</Link>
              </section>
            )}
            <AppointmentSection title="Mes prochains rendez-vous" appointments={upcoming} role={role} updateStatus={updateStatus} />
            {past.length > 0 && <AppointmentSection title="Historique" appointments={past} role={role} updateStatus={updateStatus} />}
          </>
        )}
      </main>
    </div>
  )
}

function AppointmentSection({ title: heading, appointments, role, updateStatus }: {
  title: string
  appointments: Appointment[]
  role: string
  updateStatus: (id: string, status: string) => void
}) {
  return (
    <section style={card}>
      <h2 style={{ ...title, fontSize: 20 }}>{heading}</h2>
      <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
        {appointments.length === 0 && <Empty>Aucun rendez-vous dans cette section.</Empty>}
        {appointments.map(appointment => {
          const contact = role === 'pro' ? appointment.patient : appointment.pro
          return (
            <article key={appointment.id} style={row}>
              <Avatar profile={contact} />
              <div style={{ flex: 1 }}>
                <strong>{contact?.name || 'Utilisateur Capsule'}</strong>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>{formatDate(appointment.scheduled_at)}</div>
                {appointment.notes_for_pro && role === 'pro' && <p style={{ fontSize: 12, color: '#64748b' }}>{appointment.notes_for_pro}</p>}
              </div>
              <Status value={appointment.status} />
              <div style={{ display: 'flex', gap: 6 }}>
                {role === 'pro' && appointment.status === 'pending' && (
                  <button onClick={() => updateStatus(appointment.id, 'confirmed')} style={smallButton}>Confirmer</button>
                )}
                {['pending', 'confirmed'].includes(appointment.status) && (
                  <button onClick={() => updateStatus(appointment.id, 'cancelled')} style={textButton}>Annuler</button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Avatar({ profile }: { profile?: { name?: string; avatar_url?: string } | null }) {
  return profile?.avatar_url
    ? <img src={profile.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
    : <div style={{ width: 44, height: 44, borderRadius: '50%', background: TEAL, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{profile?.name?.[0] || '?'}</div>
}

function Status({ value }: { value: string }) {
  const labels: Record<string, string> = { pending: 'En attente', confirmed: 'Confirme', cancelled: 'Annule', completed: 'Termine' }
  return <span style={{ background: '#eef9f8', color: '#087f73', borderRadius: 99, padding: '5px 9px', fontSize: 11, fontWeight: 700 }}>{labels[value] || value}</span>
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p style={{ color: '#94a3b8', margin: 0, padding: 12 }}>{children}</p>
}

function Notice({ children, color }: { children: React.ReactNode; color: string }) {
  return <div style={{ background: '#fff', border: `1px solid ${color}33`, color, borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>{children}</div>
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}
function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const card: React.CSSProperties = { background: '#fff', border: '1px solid #daeeed', borderRadius: 20, padding: 24, marginBottom: 18, boxShadow: '0 3px 16px rgba(8,40,39,.05)' }
const title: React.CSSProperties = { margin: '0 0 7px', fontFamily: 'Outfit, sans-serif', fontSize: 26, color: DARK }
const subtitle: React.CSSProperties = { margin: 0, color: '#64748b', fontSize: 14 }
const eyebrow: React.CSSProperties = { margin: '0 0 7px', color: TEAL, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 11, fontWeight: 800 }
const label: React.CSSProperties = { color: DARK, fontSize: 12, fontWeight: 700 }
const input: React.CSSProperties = { border: '1px solid #cfe8e5', borderRadius: 11, padding: '11px 13px', background: '#fbfefe', color: DARK }
const primaryButton: React.CSSProperties = { border: 0, borderRadius: 99, padding: '12px 20px', background: TEAL, color: '#fff', fontWeight: 800, cursor: 'pointer' }
const smallButton: React.CSSProperties = { ...primaryButton, padding: '7px 11px', fontSize: 12 }
const textButton: React.CSSProperties = { border: '1px solid #daeeed', borderRadius: 9, padding: '7px 10px', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 12 }
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: 13, border: '1px solid #e5f2f0', borderRadius: 13, flexWrap: 'wrap' }
const slotButton: React.CSSProperties = { border: '1px solid #cfe8e5', borderRadius: 11, padding: 12, background: '#fff', color: DARK, cursor: 'pointer', textAlign: 'left' }
const selectedSlotButton: React.CSSProperties = { borderColor: TEAL, background: '#eefaf8', color: '#087f73', fontWeight: 800 }
