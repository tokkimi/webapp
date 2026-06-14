'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

type Appointment = {
  id: string
  scheduled_at: string
  duration_minutes: number
  type: string
  status: string
  notes_for_pro?: string
  pro_notes?: string
  clinical_notes: ClinicalNote[]
}

type ClinicalNote = {
  id: string
  content: string
  created_at: string
  updated_at: string
}

type SharedResource = {
  id: string
  title: string
  url?: string
  shared_at: string
}

type Patient = {
  id: string
  name: string
  email: string
  phone?: string
  avatar_url?: string
  birth_date?: string
  appointments: Appointment[]
  shared_resources: SharedResource[]
}

type Resource = {
  id: string
  title: string
  description?: string
  type?: string
  url?: string
}

const NAV = [
  { href: '/dashboard/pro', icon: '⌂', label: 'Tableau de bord' },
  { href: '/patients', icon: '◉', label: 'Patients' },
  { href: '/appointments', icon: '▦', label: 'Agenda' },
  { href: '/pro/resources', icon: '▤', label: 'Ressources' },
  { href: '/messages', icon: '◌', label: 'Messagerie' },
  { href: '/profile', icon: '⚙', label: 'Paramètres' },
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
}

function ageFromBirthDate(value?: string) {
  if (!value) return null
  const birth = new Date(value)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--
  return age
}

function dateLabel(value: string, withTime = false) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

function relativeDate(value?: string) {
  if (!value) return 'Aucune'
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
  if (days < 0) return `dans ${Math.abs(days)} j`
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days} j`
  return dateLabel(value)
}

function Sidebar({ patientCount }: { patientCount: number }) {
  return (
    <aside className="pro-sidebar">
      <div className="brand">
        <div className="brand-mark">C</div>
        <div><strong>Capsule Pro</strong><span>Espace professionnel</span></div>
      </div>
      <nav className="side-nav">
        {NAV.map(item => (
          <Link key={item.href} href={item.href} className={item.href === '/patients' ? 'active' : ''}>
            <span className="nav-icon">{item.icon}</span>{item.label}
          </Link>
        ))}
      </nav>
      <div className="plan-card">
        <span>Plan Pro actif</span>
        <strong>{patientCount} patient{patientCount > 1 ? 's' : ''}</strong>
      </div>
    </aside>
  )
}

export default function PatientsPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [appointmentId, setAppointmentId] = useState('')
  const [activeTab, setActiveTab] = useState<'history' | 'notes' | 'resources'>('history')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [note, setNote] = useState('')
  const [noteId, setNoteId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function request(body?: object) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.replace('/auth')
      throw new Error('Session expirée')
    }
    const response = await fetch('/api/patients', {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Une erreur est survenue.')
    return result
  }

  async function load(preferredPatientId?: string) {
    try {
      const result = await request()
      setPatients(result.patients || [])
      setResources(result.resources || [])
      const nextId = preferredPatientId || selectedId || result.patients?.[0]?.id || ''
      setSelectedId(nextId)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const selected = patients.find(patient => patient.id === selectedId) || null
  const selectedAppointment = selected?.appointments.find(item => item.id === appointmentId)
  const selectedNotes = selectedAppointment?.clinical_notes || []

  useEffect(() => {
    if (!selected) return
    const current = selected.appointments.find(item => item.id === appointmentId)
    const appointment = current || selected.appointments[0]
    setAppointmentId(appointment?.id || '')
    const firstNote = appointment?.clinical_notes?.[0]
    setNoteId(firstNote?.id || '')
    setNote(firstNote?.content || '')
  }, [selectedId, patients]) // eslint-disable-line

  const visiblePatients = useMemo(() => patients.filter(patient => {
    const future = patient.appointments.some(item =>
      new Date(item.scheduled_at) >= new Date() && item.status !== 'cancelled'
    )
    const matchesSearch = `${patient.name} ${patient.email}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'active' ? future : !future)
    return matchesSearch && matchesFilter
  }), [patients, search, filter])

  function choosePatient(patient: Patient) {
    setSelectedId(patient.id)
    setActiveTab('history')
    setNotice('')
    setError('')
  }

  function chooseAppointment(id: string) {
    setAppointmentId(id)
    const appointment = selected?.appointments.find(item => item.id === id)
    const firstNote = appointment?.clinical_notes?.[0]
    setNoteId(firstNote?.id || '')
    setNote(firstNote?.content || '')
    setNotice('')
  }

  function chooseNote(appointment: Appointment, clinicalNote: ClinicalNote) {
    setAppointmentId(appointment.id)
    setNoteId(clinicalNote.id)
    setNote(clinicalNote.content)
    setNotice('')
    setError('')
  }

  function startNewNote() {
    setNoteId('')
    setNote('')
    setNotice('')
    setError('')
  }

  async function saveNote() {
    if (!selected || !appointmentId) return
    if (!note.trim()) {
      setError('Écrivez votre note avant de la sauvegarder.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const result = await request({
        action: 'note',
        patient_id: selected.id,
        appointment_id: appointmentId,
        note_id: noteId,
        content: note,
      })
      setPatients(current => current.map(patient => patient.id !== selected.id ? patient : {
        ...patient,
        appointments: patient.appointments.map(item =>
          item.id === appointmentId ? { ...item, clinical_notes: result.notes } : item
        ),
      }))
      setNoteId(result.saved_note_id || noteId)
      setNotice(noteId ? 'Note clinique mise à jour.' : 'Nouvelle note clinique ajoutée.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function shareResource(resource: Resource) {
    if (!selected) return
    setError('')
    try {
      await request({ action: 'share', patient_id: selected.id, resource_id: resource.id })
      setShowPicker(false)
      setNotice('Ressource envoyée dans la messagerie du patient.')
      await load(selected.id)
      setActiveTab('resources')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const age = ageFromBirthDate(selected?.birth_date)
  const hasUpcoming = (patient: Patient) => patient.appointments.some(item =>
    new Date(item.scheduled_at) >= new Date() && item.status !== 'cancelled'
  )

  return (
    <div className="workspace">
      <Sidebar patientCount={patients.length} />

      <aside className="patient-panel">
        <header>
          <div className="panel-title"><h1>Patients</h1><span>{visiblePatients.length} / {patients.length}</span></div>
          <label className="search"><span>⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un patient..." /></label>
          <div className="filters">
            {[
              ['all', 'Tous'],
              ['active', 'Actifs'],
              ['inactive', 'Inactifs'],
            ].map(([value, label]) => (
              <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value as typeof filter)}>{label}</button>
            ))}
          </div>
        </header>

        <div className="patient-list">
          {loading && <div className="list-empty">Chargement des dossiers...</div>}
          {!loading && visiblePatients.length === 0 && <div className="list-empty">Aucun patient trouvé.</div>}
          {visiblePatients.map(patient => {
            const latest = patient.appointments[0]
            const upcoming = patient.appointments.find(item => new Date(item.scheduled_at) >= new Date() && item.status !== 'cancelled')
            return (
              <button key={patient.id} onClick={() => choosePatient(patient)} className={`patient-item ${selectedId === patient.id ? 'selected' : ''}`}>
                <div className="small-avatar">
                  {patient.avatar_url ? <img src={patient.avatar_url} alt="" /> : patient.name?.[0]?.toUpperCase()}
                </div>
                <div className="patient-copy">
                  <div className="name-row"><strong>{patient.name}</strong><span className={hasUpcoming(patient) ? 'status active' : 'status'}>{hasUpcoming(patient) ? '● Actif' : '○ Inactif'}</span></div>
                  <span>{ageFromBirthDate(patient.birth_date) ? `${ageFromBirthDate(patient.birth_date)} ans` : patient.email}</span>
                  <div className="dates"><small>Dernière séance : {relativeDate(latest?.scheduled_at)}</small>{upcoming && <em>▦ {dateLabel(upcoming.scheduled_at)}</em>}</div>
                </div>
              </button>
            )
          })}
        </div>

        <Link href="/appointments" className="add-patient">＋ Ajouter via un rendez-vous</Link>
      </aside>

      <main className="patient-detail">
        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}

        {!selected ? (
          <div className="empty-detail"><div className="empty-icons">◉　▤　◌</div><h2>Sélectionnez un patient</h2><p>Choisissez un dossier à gauche pour consulter les séances, les notes cliniques et les ressources partagées.</p></div>
        ) : (
          <>
            <header className="patient-header">
              <div className="large-avatar">
                {selected.avatar_url ? <img src={selected.avatar_url} alt="" /> : selected.name?.[0]?.toUpperCase()}
              </div>
              <div className="identity">
                <div><h2>{selected.name}</h2>{age !== null && <span>· {age} ans</span>}<span className={hasUpcoming(selected) ? 'status active' : 'status'}>{hasUpcoming(selected) ? '● Actif' : '○ Inactif'}</span></div>
                <p>✉ {selected.email}{selected.phone ? <><span>•</span> ☎ {selected.phone}</> : null}</p>
              </div>
              <div className="header-actions">
                <Link href="/messages" className="secondary-action">Ouvrir les messages</Link>
                <Link href="/appointments" className="primary-action">▦ Gérer les rendez-vous</Link>
              </div>
            </header>

            <nav className="tabs">
              <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>▤ Historique</button>
              <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>✎ Notes cliniques</button>
              <button className={activeTab === 'resources' ? 'active' : ''} onClick={() => setActiveTab('resources')}>▦ Ressources partagées</button>
            </nav>

            <section className="tab-content">
              {activeTab === 'history' && (
                <div className="content-column">
                  <div className="section-heading"><h3>Séances ({selected.appointments.length})</h3><span>{selected.appointments.reduce((total, item) => total + item.duration_minutes, 0)} min au total</span></div>
                  {selected.appointments.map((appointment, index) => (
                    <article className="session-card" key={appointment.id}>
                      <div className="session-top">
                        <div><span className="session-dot" /><div><strong>Séance {appointment.type === 'video' ? 'vidéo' : appointment.type === 'phone' ? 'téléphonique' : 'au cabinet'}</strong><small>{dateLabel(appointment.scheduled_at, true)} · {appointment.duration_minutes} min</small></div></div>
                        <div><span className={`appointment-status ${appointment.status}`}>{STATUS_LABELS[appointment.status] || appointment.status}</span>{index === 0 && <span className="latest">Dernière séance</span>}</div>
                      </div>
                      <div className="session-summary">
                        <strong>Informations de séance</strong>
                        <p>{appointment.notes_for_pro || appointment.clinical_notes?.[0]?.content || 'Aucune observation renseignée pour cette séance.'}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="notes-layout">
                  <div className="note-editor">
                    <div className="section-heading">
                      <div><h3>{noteId ? 'Modifier la note clinique' : 'Nouvelle note clinique'}</h3><p>Visible uniquement depuis votre espace professionnel.</p></div>
                      <button className="new-note-button" onClick={startNewNote}>＋ Nouvelle note</button>
                    </div>
                    <label className="field-label">Séance concernée</label>
                    <select value={appointmentId} onChange={event => chooseAppointment(event.target.value)}>
                      {selected.appointments.map(item => <option key={item.id} value={item.id}>{dateLabel(item.scheduled_at, true)} · {STATUS_LABELS[item.status] || item.status}</option>)}
                    </select>
                    <textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Observations cliniques, évolution, points de vigilance, objectifs de la prochaine séance..." />
                    <div className="editor-footer">
                      <button className="save-button" onClick={saveNote} disabled={saving || !selectedAppointment || !note.trim()}>{saving ? 'Sauvegarde...' : noteId ? 'Mettre à jour la note' : 'Ajouter la note'}</button>
                      {notice && <span className="saved">✓ {notice}</span>}
                    </div>
                    <small className="privacy">🔒 Note confidentielle attachée à cette séance.</small>
                  </div>
                  <aside className="note-history">
                    <div className="history-title"><h4>Carnet de notes</h4><span>{selected.appointments.reduce((total, item) => total + item.clinical_notes.length, 0)}</span></div>
                    {selected.appointments.flatMap(item => item.clinical_notes.map(clinicalNote => (
                      <button key={clinicalNote.id} className={clinicalNote.id === noteId ? 'current' : ''} onClick={() => chooseNote(item, clinicalNote)}>
                        <strong>{dateLabel(clinicalNote.created_at, true)}</strong>
                        <small>Séance du {dateLabel(item.scheduled_at)}</small>
                        <span>{clinicalNote.content.slice(0, 86)}{clinicalNote.content.length > 86 ? '…' : ''}</span>
                      </button>
                    )))}
                    {selectedNotes.length === 0 && selected.appointments.every(item => item.clinical_notes.length === 0) && (
                      <div className="no-notes"><b>Votre carnet est vide</b><span>Créez une première note pour démarrer le suivi.</span></div>
                    )}
                  </aside>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="content-column">
                  <div className="section-heading"><div><h3>Ressources partagées ({selected.shared_resources.length})</h3><p>Les ressources sont envoyées dans la conversation avec le patient.</p></div><button className="share-button" onClick={() => setShowPicker(true)}>＋ Partager une ressource</button></div>
                  {selected.shared_resources.length === 0 ? (
                    <div className="resource-empty"><span>▦</span><strong>Aucune ressource partagée</strong><p>Choisissez un contenu validé dans votre médiathèque professionnelle.</p></div>
                  ) : selected.shared_resources.map(resource => (
                    <article className="resource-card" key={resource.id}>
                      <div className="resource-icon">▤</div>
                      <div><strong>{resource.title}</strong><span>Partagée le {dateLabel(resource.shared_at, true)}</span></div>
                      {resource.url && <a href={resource.url} target="_blank" rel="noreferrer">Voir ↗</a>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {showPicker && (
        <div className="modal-backdrop" onClick={() => setShowPicker(false)}>
          <div className="resource-modal" onClick={event => event.stopPropagation()}>
            <div className="modal-title"><div><h3>Choisir une ressource</h3><p>Elle sera envoyée au patient dans Messages.</p></div><button onClick={() => setShowPicker(false)}>×</button></div>
            <div className="resource-options">
              {resources.length === 0 && <p>Aucune ressource approuvée. Ajoutez-en depuis l’espace Ressources.</p>}
              {resources.map(resource => (
                <button key={resource.id} onClick={() => shareResource(resource)}>
                  <span className="resource-icon">▤</span>
                  <div><strong>{resource.title}</strong><small>{resource.description || resource.type || 'Ressource Capsule'}</small></div>
                  <em>Envoyer →</em>
                </button>
              ))}
            </div>
            <Link href="/pro/resources" className="manage-resources">Proposer une ressource professionnelle</Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        *{box-sizing:border-box}.workspace{height:100vh;display:flex;overflow:hidden;background:#f7f9fc;color:#17233b;font-family:Inter,system-ui,sans-serif}
        .pro-sidebar{width:238px;flex:none;background:#fff;border-right:1px solid #e4e9f0;padding:24px 12px;display:flex;flex-direction:column}
        .brand{display:flex;align-items:center;gap:11px;padding:0 10px 28px}.brand-mark{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#1e3a5f,#30b4a7);display:grid;place-items:center;color:white;font-family:Outfit;font-size:20px;font-weight:900}.brand strong,.brand span{display:block}.brand strong{color:#163852;font-family:Outfit}.brand span{font-size:11px;color:#8491a3;margin-top:2px}
        .side-nav{display:grid;gap:4}.side-nav a{display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:11px;color:#64748b;text-decoration:none;font-size:13px}.side-nav a:hover,.side-nav a.active{background:#eaf8f6;color:#176d66;font-weight:700}.nav-icon{width:22px;text-align:center;font-size:17px}.plan-card{margin-top:auto;background:linear-gradient(135deg,#eef8f7,#f4f8fd);border:1px solid #d7e9e7;border-radius:14px;padding:14px}.plan-card span,.plan-card strong{display:block}.plan-card span{font-size:11px;color:#718096}.plan-card strong{font-size:13px;color:#176d66;margin-top:5px}
        .patient-panel{width:330px;flex:none;background:#fff;border-right:1px solid #e4e9f0;display:flex;flex-direction:column}.patient-panel header{padding:24px 17px 16px;border-bottom:1px solid #eef1f5}.panel-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.panel-title h1{font:800 24px Outfit;margin:0;color:#163852}.panel-title span{background:#f0f4f8;color:#64748b;border-radius:99px;padding:4px 10px;font-size:11px}.search{display:flex;align-items:center;gap:8px;background:#f8fafc;border:1px solid #e1e7ee;border-radius:11px;padding:10px 12px}.search input{border:0;outline:0;background:transparent;width:100%;font:inherit;font-size:13px}.filters{display:flex;background:#f0f4f8;border-radius:10px;padding:4px;margin-top:11px}.filters button{flex:1;border:0;background:transparent;padding:7px;border-radius:7px;color:#718096;cursor:pointer}.filters button.selected{background:white;color:#163852;font-weight:700;box-shadow:0 1px 5px #cad3df80}
        .patient-list{flex:1;overflow:auto;padding:11px}.patient-item{width:100%;border:1px solid transparent;background:transparent;border-radius:14px;padding:12px;display:flex;gap:11px;text-align:left;cursor:pointer;margin-bottom:4px}.patient-item:hover,.patient-item.selected{background:linear-gradient(135deg,#eef8f7,#f5f9fd);border-color:#b9dfdb}.small-avatar,.large-avatar{background:linear-gradient(135deg,#30b4a7,#1e3a5f);color:#fff;display:grid;place-items:center;font-weight:800;overflow:hidden;flex:none}.small-avatar{width:43px;height:43px;border-radius:50%}.large-avatar{width:68px;height:68px;border-radius:20px;font-size:25px;box-shadow:0 7px 20px #1e3a5f24}.small-avatar img,.large-avatar img{width:100%;height:100%;object-fit:cover}.patient-copy{flex:1;min-width:0}.name-row{display:flex;align-items:center;justify-content:space-between;gap:6px}.name-row strong{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.patient-copy>span{display:block;color:#718096;font-size:11px;margin:3px 0 6px}.status{font-size:10px;color:#7c8797;background:#edf1f5;border-radius:99px;padding:3px 7px;white-space:nowrap}.status.active{color:#087f73;background:#dff6f2}.dates{display:flex;justify-content:space-between;align-items:center;gap:6px}.dates small{color:#9aa5b3;font-size:9px}.dates em{font-style:normal;color:#176d66;background:#e3f5f2;border-radius:6px;padding:2px 5px;font-size:9px}.list-empty{padding:40px 15px;text-align:center;color:#98a2b3}.add-patient{margin:12px 16px;padding:12px;border:1px dashed #8fc9c3;border-radius:11px;text-align:center;color:#176d66;text-decoration:none;font-size:12px;font-weight:700}
        .patient-detail{flex:1;min-width:0;display:flex;flex-direction:column;position:relative}.alert{position:absolute;right:22px;top:14px;z-index:5;padding:10px 15px;border-radius:10px;font-size:12px;box-shadow:0 8px 30px #1e293b20}.alert.success{background:#dff6f2;color:#087f73}.alert.error{background:#fee2e2;color:#991b1b}.empty-detail{margin:auto;max-width:440px;text-align:center;background:white;border:1px solid #e1e7ee;border-radius:24px;padding:42px;box-shadow:0 18px 55px #1e293b0b}.empty-icons{font-size:32px;color:#30b4a7;letter-spacing:8px}.empty-detail h2{font:800 22px Outfit;color:#163852}.empty-detail p{color:#718096;line-height:1.7;font-size:14px}
        .patient-header{background:linear-gradient(135deg,#f0f8f7,#f6f8fc);border-bottom:1px solid #e1e7ee;padding:24px 30px;display:flex;align-items:center;gap:18px}.identity{flex:1}.identity>div{display:flex;align-items:center;gap:10px}.identity h2{font:800 25px Outfit;margin:0;color:#163852}.identity>div>span:not(.status){color:#718096}.identity p{color:#718096;font-size:12px;margin:8px 0 0}.identity p span{margin:0 9px;color:#c2cad4}.header-actions{display:flex;gap:9px}.header-actions a{padding:10px 15px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700}.secondary-action{border:1px solid #cbd5e1;color:#36556f;background:white}.primary-action{background:linear-gradient(135deg,#1e3a5f,#30b4a7);color:#fff;box-shadow:0 5px 16px #1e3a5f28}
        .tabs{display:flex;background:#fff;border-bottom:1px solid #e1e7ee;padding:0 30px}.tabs button{border:0;border-bottom:3px solid transparent;background:transparent;padding:16px 20px;color:#718096;cursor:pointer;font-weight:600}.tabs button.active{color:#176d66;border-color:#30b4a7}.tab-content{flex:1;overflow:auto;padding:27px 30px}.content-column{max-width:850px}.section-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.section-heading h3{font:800 19px Outfit;color:#163852;margin:0}.section-heading p{font-size:12px;color:#8491a3;margin:5px 0 0}.section-heading>span{font-size:12px;color:#718096}
        .session-card{background:#fff;border:1px solid #e0e7ee;border-radius:17px;padding:20px 22px;margin-bottom:14px;box-shadow:0 3px 12px #1e293b08}.session-top,.session-top>div{display:flex;align-items:center;justify-content:space-between;gap:10px}.session-top>div:first-child>div{display:grid;gap:3px}.session-top small{color:#718096}.session-dot{width:9px;height:9px;border-radius:50%;background:#30b4a7;box-shadow:0 0 0 5px #30b4a71a}.appointment-status,.latest{font-size:10px;border-radius:99px;padding:4px 9px}.appointment-status.confirmed,.appointment-status.completed{background:#dff6f2;color:#087f73}.appointment-status.pending{background:#fff1d6;color:#9a6200}.appointment-status.cancelled{background:#fee2e2;color:#991b1b}.latest{background:#e8eef7;color:#36556f}.session-summary{margin-top:15px;background:linear-gradient(135deg,#f5f8fc,#f3faf9);border:1px solid #e0ebee;border-radius:11px;padding:13px 15px}.session-summary strong{font-size:10px;color:#176d66;text-transform:uppercase;letter-spacing:.08em}.session-summary p{font-size:12px;color:#596779;line-height:1.6;margin:7px 0 0}
        .notes-layout{max-width:1080px;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px}.note-editor{background:linear-gradient(145deg,#fff,#fbfefd);border:1px solid #dbe8e7;border-radius:22px;padding:26px;box-shadow:0 14px 40px #1638520b}.new-note-button{border:1px solid #96ccc6;background:#eef9f7;color:#176d66;border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer}.field-label{font-size:11px;color:#64748b;font-weight:700;display:block;margin:15px 0 6px}.note-editor select,.note-editor textarea{width:100%;border:1px solid #d7e1e9;border-radius:13px;background:#fff;padding:13px;font:inherit;color:#17233b;outline:none}.note-editor select:focus,.note-editor textarea:focus{border-color:#65bdb4;box-shadow:0 0 0 4px #30b4a715}.note-editor textarea{min-height:310px;resize:vertical;line-height:1.65;margin-top:12px}.save-button,.share-button{border:0;border-radius:11px;background:linear-gradient(135deg,#1e3a5f,#30b4a7);color:white;font-weight:700;padding:12px 19px;cursor:pointer}.save-button:disabled{opacity:.45;cursor:not-allowed}.editor-footer{display:flex;align-items:center;gap:14px;margin-top:13px}.privacy{display:block;color:#8a96a6;margin-top:12px}.saved{color:#087f73!important;font-size:11px;font-weight:700}.note-history{background:linear-gradient(180deg,#fff,#f8fbfd);border:1px solid #dfe8ee;border-radius:22px;padding:18px;height:max-content;box-shadow:0 12px 35px #1638520a}.history-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.note-history h4{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#718096;margin:0}.history-title>span{display:grid;place-items:center;min-width:25px;height:25px;border-radius:99px;background:#dff6f2;color:#087f73;font-size:11px;font-weight:800}.note-history button{width:100%;border:1px solid #e2e9ef;background:#fff;border-radius:12px;padding:12px;text-align:left;margin-bottom:8px;cursor:pointer}.note-history button:hover,.note-history button.current{border-color:#78c2ba;background:#edf9f7;transform:translateY(-1px)}.note-history strong,.note-history span,.note-history small{display:block}.note-history strong{font-size:11px;color:#176d66}.note-history small{font-size:9px;color:#9aa5b3;margin-top:3px}.note-history span{font-size:10px;color:#5f6d7e;line-height:1.5;margin-top:6px}.no-notes{padding:28px 12px;text-align:center;border:1px dashed #b9d9d5;border-radius:13px;background:#f6fbfa}.no-notes b,.no-notes span{display:block}.no-notes b{font-size:12px;color:#176d66}.no-notes span{font-size:10px;color:#8491a3;line-height:1.5;margin-top:6px}
        .resource-empty{border:1px dashed #b8d9d5;background:#f7fbfb;border-radius:17px;padding:45px;text-align:center;color:#718096}.resource-empty>span{display:block;font-size:35px;color:#30b4a7}.resource-empty strong{display:block;color:#163852;margin:10px}.resource-card{display:flex;align-items:center;gap:14px;background:white;border:1px solid #e0e7ee;border-radius:14px;padding:15px 18px;margin-bottom:10px}.resource-icon{width:42px;height:42px;border-radius:11px;background:#e4f6f3;color:#176d66;display:grid;place-items:center;font-size:19px;flex:none}.resource-card>div:nth-child(2){flex:1}.resource-card strong,.resource-card span{display:block}.resource-card strong{font-size:13px}.resource-card span{font-size:11px;color:#8491a3;margin-top:4px}.resource-card a{color:#176d66;text-decoration:none;font-size:12px;font-weight:700}
        .modal-backdrop{position:fixed;inset:0;background:#0f172a73;backdrop-filter:blur(5px);z-index:20;display:grid;place-items:center;padding:20px}.resource-modal{width:min(580px,100%);max-height:80vh;overflow:auto;background:white;border-radius:22px;padding:25px;box-shadow:0 30px 90px #0f172a55}.modal-title{display:flex;justify-content:space-between}.modal-title h3{font:800 20px Outfit;color:#163852;margin:0}.modal-title p{color:#718096;font-size:12px}.modal-title button{border:0;background:#eef2f6;border-radius:50%;width:32px;height:32px;font-size:20px;cursor:pointer}.resource-options{display:grid;gap:8px;margin:18px 0}.resource-options>button{display:flex;align-items:center;gap:12px;border:1px solid #e0e7ee;background:#fbfdff;border-radius:13px;padding:12px;text-align:left;cursor:pointer}.resource-options>button:hover{border-color:#8fc9c3;background:#f0faf8}.resource-options>button>div:nth-child(2){flex:1}.resource-options strong,.resource-options small{display:block}.resource-options small{color:#718096;margin-top:4px}.resource-options em{font-style:normal;color:#176d66;font-size:11px;font-weight:700}.manage-resources{display:block;text-align:center;color:#176d66;text-decoration:none;font-size:12px;font-weight:700}
        @media(max-width:1050px){.pro-sidebar{width:78px}.brand>div:last-child,.side-nav a:not(.active){font-size:0}.brand{padding-left:8px}.side-nav a{justify-content:center}.side-nav a.active{font-size:0}.plan-card{display:none}.patient-panel{width:300px}.header-actions{flex-direction:column}.notes-layout{grid-template-columns:1fr}}
        @media(max-width:760px){.workspace{height:auto;min-height:100vh;overflow:auto}.pro-sidebar{display:none}.patient-panel{width:100%;height:auto;max-height:44vh;position:fixed;top:0;z-index:10}.patient-detail{padding-top:44vh;min-height:100vh}.patient-header{align-items:flex-start;flex-wrap:wrap;padding:20px}.header-actions{width:100%;flex-direction:row}.tabs{padding:0;overflow:auto}.tabs button{white-space:nowrap;padding:14px}.tab-content{padding:18px}.notes-layout{display:block}.note-history{margin-top:15px}.identity p{line-height:1.8}}
      `}</style>
    </div>
  )
}
