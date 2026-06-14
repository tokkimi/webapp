'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const T = '#30B4A7'
const DARK = '#082827'

export default function PatientsPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function api(body?: object) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/auth'); throw new Error('Session expiree') }
    return fetch('/api/patients', {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${session.access_token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async function load() {
    try {
      const response = await api()
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setPatients(result.patients)
      setResources(result.resources)
      if (result.patients[0]) selectPatient(result.patients[0])
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les clients.')
    }
  }

  function selectPatient(patient: any) {
    setSelected(patient)
    const appointment = patient.appointments[0]
    setSelectedAppointmentId(appointment?.id || '')
    setNote(appointment?.pro_notes || '')
    setError('')
    setMessage('')
  }

  function selectAppointment(patient: any, appointmentId: string) {
    const appointment = patient.appointments.find((item: any) => item.id === appointmentId)
    setSelectedAppointmentId(appointmentId)
    setNote(appointment?.pro_notes || '')
    setError('')
    setMessage('')
  }

  async function saveNote() {
    if (!selected || !selectedAppointmentId) return
    setSaving(true)
    setError('')
    setMessage('')
    const response = await api({
      action: 'note',
      patient_id: selected.id,
      appointment_id: selectedAppointmentId,
      content: note,
    })
    setSaving(false)
    if (!response.ok) {
      setError((await response.json()).error)
      return
    }
    setPatients(current => current.map(patient => patient.id !== selected.id ? patient : {
      ...patient,
      appointments: patient.appointments.map((appointment: any) =>
        appointment.id === selectedAppointmentId ? { ...appointment, pro_notes: note } : appointment
      ),
    }))
    setMessage('Note professionnelle sauvegardee.')
  }

  async function shareResource(resourceId: string) {
    if (!selected || !resourceId) return
    setMessage('')
    const response = await api({ action: 'share', patient_id: selected.id, resource_id: resourceId })
    if (!response.ok) setError((await response.json()).error)
    else setMessage('Ressource envoyée dans la conversation du client.')
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  return (
    <div style={{ minHeight: '100vh', background: '#f5fafa', fontFamily: 'Inter,sans-serif', color: DARK }}>
      <nav style={{ height: 60, background: DARK, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Link href="/dashboard/pro" style={navLink}>Tableau de bord</Link>
        <Link href="/appointments" style={navLink}>Agenda</Link>
        <Link href="/messages" style={navLink}>Messages</Link>
        <Link href="/admin/mediatheque" style={navLink}>Ressources</Link>
        <Link href="/profile" style={{ ...navLink, marginLeft: 'auto' }}>Profil</Link>
      </nav>

      <main style={{ maxWidth: 1150, margin: '0 auto', padding: '28px 16px' }}>
        <div style={{ marginBottom: 22 }}>
          <p style={{ color: T, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 11, fontWeight: 800, margin: 0 }}>Espace professionnel</p>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 30, margin: '7px 0' }}>Mes patients</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Tous les patients ayant eu ou planifie un rendez-vous avec vous.</p>
        </div>
        {error && <div style={{ padding: 12, borderRadius: 12, background: '#fee2e2', color: '#991b1b', marginBottom: 14 }}>{error}</div>}
        {message && <div style={{ padding: 12, borderRadius: 12, background: '#eaf8f6', color: '#087f73', marginBottom: 14 }}>{message}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px,320px) 1fr', gap: 18 }}>
          <aside style={card}>
            <strong>{patients.length} patient{patients.length > 1 ? 's' : ''}</strong>
            <div style={{ marginTop: 14, display: 'grid', gap: 7 }}>
              {patients.length === 0 && <p style={{ color: '#64748b' }}>Aucun patient pour le moment.</p>}
              {patients.map(patient => (
                <button key={patient.id} onClick={() => selectPatient(patient)} style={{
                  border: `1px solid ${selected?.id === patient.id ? T : '#dceeed'}`,
                  background: selected?.id === patient.id ? '#eaf8f6' : '#fff',
                  borderRadius: 13, padding: 13, textAlign: 'left', cursor: 'pointer',
                }}>
                  <strong style={{ display: 'block', color: DARK }}>{patient.name}</strong>
                  <span style={{ color: '#64748b', fontSize: 12 }}>{patient.email}</span>
                </button>
              ))}
            </div>
          </aside>

          <section style={card}>
            {!selected ? <p style={{ color: '#64748b' }}>Sélectionnez un patient.</p> : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #e5f2f0', paddingBottom: 18 }}>
                  {selected.avatar_url
                    ? <img src={selected.avatar_url} alt="" style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 58, height: 58, borderRadius: '50%', background: T, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800 }}>{selected.name?.[0]}</div>}
                  <div>
                    <h2 style={{ margin: 0, fontFamily: 'Outfit,sans-serif' }}>{selected.name}</h2>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{selected.email}{selected.phone ? ` · ${selected.phone}` : ''}</p>
                  </div>
                  <Link href="/messages" style={{ marginLeft: 'auto', color: T, fontWeight: 700, textDecoration: 'none' }}>Ouvrir les messages</Link>
                </div>

                <h3 style={heading}>Rendez-vous</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {selected.appointments.map((appointment: any) => (
                    <div key={appointment.id} style={row}>
                      <span>{new Date(appointment.scheduled_at).toLocaleString('fr-FR')}</span>
                      <strong style={{ color: appointment.status === 'confirmed' ? '#087f73' : '#b45309' }}>{appointment.status}</strong>
                    </div>
                  ))}
                </div>

                <h3 style={heading}>Note professionnelle privée</h3>
                <select
                  value={selectedAppointmentId}
                  onChange={event => selectAppointment(selected, event.target.value)}
                  style={{ width: '100%', border: '1px solid #cfe8e5', borderRadius: 12, padding: 12, background: '#fff', marginBottom: 10 }}
                >
                  {selected.appointments.map((appointment: any) => (
                    <option key={appointment.id} value={appointment.id}>
                      Séance du {new Date(appointment.scheduled_at).toLocaleString('fr-FR')}
                    </option>
                  ))}
                </select>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={7} placeholder="Observations et suivi..."
                  style={{ width: '100%', border: '1px solid #cfe8e5', borderRadius: 13, padding: 14, resize: 'vertical' }} />
                <button onClick={saveNote} disabled={saving} style={primaryButton}>{saving ? 'Sauvegarde...' : 'Sauvegarder la note'}</button>

                <h3 style={heading}>Ressources partagées</h3>
                <select defaultValue="" onChange={e => { shareResource(e.target.value); e.target.value = '' }}
                  style={{ width: '100%', border: '1px solid #cfe8e5', borderRadius: 12, padding: 12, background: '#fff' }}>
                  <option value="" disabled>Choisir une ressource approuvée...</option>
                  {resources.map(resource => (
                    <option key={resource.id} value={resource.id}>{resource.title}</option>
                  ))}
                </select>
                <p style={{ color: '#64748b', fontSize: 12 }}>La ressource sélectionnée est envoyée directement dans Messages.</p>
              </>
            )}
          </section>
        </div>
      </main>
      <style>{`@media(max-width:760px){main>div:last-child{grid-template-columns:1fr!important}nav{overflow-x:auto}}`}</style>
    </div>
  )
}

const navLink: React.CSSProperties = { color: '#d7efec', textDecoration: 'none', fontSize: 13, whiteSpace: 'nowrap' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #daeeed', borderRadius: 20, padding: 22, boxShadow: '0 3px 16px rgba(8,40,39,.05)' }
const heading: React.CSSProperties = { fontFamily: 'Outfit,sans-serif', margin: '26px 0 12px', fontSize: 17 }
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, padding: 12, borderRadius: 11, background: '#f5fafa', fontSize: 13 }
const primaryButton: React.CSSProperties = { marginTop: 10, border: 0, borderRadius: 99, padding: '11px 20px', background: T, color: '#fff', fontWeight: 800, cursor: 'pointer' }
