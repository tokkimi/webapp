'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileType = 'parent' | 'pro' | 'ado' | null

type AppointmentType = 'video' | 'phone' | 'in_person'
type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

interface Professional {
  id: string
  name: string
  specialty: string
  location: string
  priceMin: number
  priceMax: number
  avatar: string
  availableSlots: string[]
}

interface Appointment {
  id: string
  proName: string
  proSpecialty: string
  patientName?: string
  date: string
  time: string
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROS: Professional[] = [
  {
    id: 'p1',
    name: 'Dr. Sophie Martin',
    specialty: 'psychologue',
    location: 'Paris 11e',
    priceMin: 60,
    priceMax: 90,
    avatar: 'SM',
    availableSlots: ['2026-06-16 09:00', '2026-06-16 11:00', '2026-06-17 14:00', '2026-06-18 10:00'],
  },
  {
    id: 'p2',
    name: 'M. Julien Dupont',
    specialty: 'éducateur',
    location: 'Lyon 3e',
    priceMin: 40,
    priceMax: 60,
    avatar: 'JD',
    availableSlots: ['2026-06-16 10:00', '2026-06-17 09:00', '2026-06-19 15:00'],
  },
  {
    id: 'p3',
    name: 'Mme Claire Rousseau',
    specialty: 'assistant social',
    location: 'Bordeaux',
    priceMin: 0,
    priceMax: 30,
    avatar: 'CR',
    availableSlots: ['2026-06-16 14:00', '2026-06-18 09:00', '2026-06-20 11:00'],
  },
  {
    id: 'p4',
    name: 'Dr. Ahmed Benali',
    specialty: 'médecin',
    location: 'Marseille 8e',
    priceMin: 70,
    priceMax: 100,
    avatar: 'AB',
    availableSlots: ['2026-06-17 08:00', '2026-06-17 16:00', '2026-06-18 14:00'],
  },
  {
    id: 'p5',
    name: 'Mme Léa Bernard',
    specialty: 'infirmier',
    location: 'Nantes',
    priceMin: 35,
    priceMax: 55,
    avatar: 'LB',
    availableSlots: ['2026-06-16 08:00', '2026-06-17 13:00', '2026-06-19 10:00'],
  },
]

const MOCK_PARENT_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    proName: 'Dr. Sophie Martin',
    proSpecialty: 'psychologue',
    date: '2026-06-16',
    time: '09:00',
    type: 'video',
    status: 'confirmed',
    notes: 'Première consultation',
  },
  {
    id: 'a2',
    proName: 'M. Julien Dupont',
    proSpecialty: 'éducateur',
    date: '2026-06-20',
    time: '14:00',
    type: 'in_person',
    status: 'pending',
  },
  {
    id: 'a3',
    proName: 'Dr. Ahmed Benali',
    proSpecialty: 'médecin',
    date: '2026-05-30',
    time: '10:00',
    type: 'phone',
    status: 'completed',
  },
  {
    id: 'a4',
    proName: 'Mme Claire Rousseau',
    proSpecialty: 'assistant social',
    date: '2026-05-15',
    time: '11:00',
    type: 'video',
    status: 'cancelled',
  },
]

const MOCK_PRO_APPOINTMENTS: Appointment[] = [
  {
    id: 'b1',
    proName: 'Famille Moreau',
    proSpecialty: 'psychologue',
    patientName: 'Lucas Moreau',
    date: '2026-06-13',
    time: '09:00',
    type: 'video',
    status: 'confirmed',
    notes: 'Suivi mensuel',
  },
  {
    id: 'b2',
    proName: 'Famille Petit',
    proSpecialty: 'psychologue',
    patientName: 'Emma Petit',
    date: '2026-06-13',
    time: '11:00',
    type: 'in_person',
    status: 'confirmed',
  },
  {
    id: 'b3',
    proName: 'Famille Garcia',
    proSpecialty: 'psychologue',
    patientName: 'Noah Garcia',
    date: '2026-06-13',
    time: '14:00',
    type: 'phone',
    status: 'pending',
    notes: 'Problèmes scolaires récurrents, parents inquiets',
  },
  {
    id: 'b4',
    proName: 'Famille Lambert',
    proSpecialty: 'psychologue',
    patientName: 'Camille Lambert',
    date: '2026-06-14',
    time: '10:00',
    type: 'video',
    status: 'pending',
    notes: 'Premier rendez-vous demandé en urgence',
  },
  {
    id: 'b5',
    proName: 'Famille Robert',
    proSpecialty: 'psychologue',
    patientName: 'Théo Robert',
    date: '2026-06-15',
    time: '16:00',
    type: 'video',
    status: 'confirmed',
  },
  {
    id: 'b6',
    proName: 'Famille Durand',
    proSpecialty: 'psychologue',
    patientName: 'Léa Durand',
    date: '2026-06-12',
    time: '09:00',
    type: 'in_person',
    status: 'completed',
  },
  {
    id: 'b7',
    proName: 'Famille Simon',
    proSpecialty: 'psychologue',
    patientName: 'Hugo Simon',
    date: '2026-06-11',
    time: '15:00',
    type: 'phone',
    status: 'cancelled',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

function formatDateFR(dateStr: string, timeStr?: string) {
  const d = new Date(dateStr)
  const day = DAYS_FR[d.getDay()]
  const date = d.getDate()
  const month = MONTHS_FR[d.getMonth()]
  const year = d.getFullYear()
  const base = `${day} ${date} ${month} ${year}`
  return timeStr ? `${base} à ${timeStr}` : base
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`
}

function isUpcoming(dateStr: string, timeStr: string) {
  const now = new Date()
  const appt = new Date(`${dateStr}T${timeStr}`)
  return appt > now
}

function isSoon(dateStr: string, timeStr: string) {
  const now = new Date()
  const appt = new Date(`${dateStr}T${timeStr}`)
  const diff = appt.getTime() - now.getTime()
  return diff >= 0 && diff <= 15 * 60 * 1000
}

function typeLabel(type: AppointmentType) {
  if (type === 'video') return { icon: '🎥', label: 'Vidéo' }
  if (type === 'phone') return { icon: '📞', label: 'Téléphone' }
  return { icon: '🏥', label: 'Présentiel' }
}

function statusConfig(status: AppointmentStatus) {
  switch (status) {
    case 'pending': return { label: 'En attente', color: 'bg-orange-100 text-orange-700 border border-orange-200' }
    case 'confirmed': return { label: 'Confirmé', color: 'bg-green-100 text-green-700 border border-green-200' }
    case 'cancelled': return { label: 'Annulé', color: 'bg-red-100 text-red-700 border border-red-200' }
    case 'completed': return { label: 'Terminé', color: 'bg-gray-100 text-gray-600 border border-gray-200' }
  }
}

function getWeekDays(from: Date): Date[] {
  const start = new Date(from)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`backdrop-blur-sm bg-white/70 border border-white/50 rounded-2xl shadow-lg ${className}`}>
      {children}
    </div>
  )
}

function ProAvatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

// ─── Parent View ──────────────────────────────────────────────────────────────

function ParentView() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')
  const [searchResults, setSearchResults] = useState<Professional[]>([])
  const [searched, setSearched] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_PARENT_APPOINTMENTS)
  const [showModal, setShowModal] = useState(false)
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(false)

  // Modal state
  const [modalSlot, setModalSlot] = useState('')
  const [modalType, setModalType] = useState<AppointmentType>('video')
  const [modalNotes, setModalNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  function handleSearch() {
    setLoading(true)
    setTimeout(() => {
      let results = [...MOCK_PROS]
      if (specialty) results = results.filter(p => p.specialty === specialty)
      if (location) results = results.filter(p => p.location.toLowerCase().includes(location.toLowerCase()))
      setSearchResults(results)
      setSearched(true)
      setLoading(false)
    }, 600)
  }

  function openModal(pro: Professional) {
    setSelectedPro(pro)
    setModalSlot('')
    setModalType('video')
    setModalNotes('')
    setSubmitSuccess(false)
    setShowModal(true)
  }

  async function handleBooking() {
    if (!modalSlot || !selectedPro) return
    setSubmitting(true)
    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proId: selectedPro.id,
          slot: modalSlot,
          type: modalType,
          notes: modalNotes,
        }),
      })
    } catch (_) {}
    const [date, time] = modalSlot.split(' ')
    const newAppt: Appointment = {
      id: `new_${Date.now()}`,
      proName: selectedPro.name,
      proSpecialty: selectedPro.specialty,
      date,
      time,
      type: modalType,
      status: 'pending',
      notes: modalNotes || undefined,
    }
    setAppointments(prev => [newAppt, ...prev])
    setSubmitting(false)
    setSubmitSuccess(true)
    setTimeout(() => setShowModal(false), 1800)
  }

  function handleCancel(id: string) {
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a)
    )
  }

  const upcoming = appointments.filter(a => isUpcoming(a.date, a.time) && a.status !== 'cancelled' && a.status !== 'completed')
  const past = appointments.filter(a => !isUpcoming(a.date, a.time) || a.status === 'cancelled' || a.status === 'completed')

  return (
    <div className="space-y-8">
      {/* Search section */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-[#0D9488] mb-5 flex items-center gap-2">
          <span className="text-2xl">🔍</span> Trouver un professionnel
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-teal-200 bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm"
          >
            <option value="">Toutes les spécialités</option>
            <option value="psychologue">Psychologue</option>
            <option value="éducateur">Éducateur</option>
            <option value="assistant social">Assistant social</option>
            <option value="médecin">Médecin</option>
            <option value="infirmier">Infirmier</option>
          </select>
          <input
            type="text"
            placeholder="Ville ou code postal"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-3 rounded-xl border border-teal-200 bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#0D9488] to-[#2563EB] text-white font-semibold rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : '🔍'}
            Rechercher
          </button>
        </div>

        {/* Results */}
        {searched && (
          <div className="mt-6 space-y-3">
            {searchResults.length === 0 ? (
              <p className="text-center text-gray-400 py-6">Aucun professionnel trouvé pour ces critères.</p>
            ) : (
              <>
                <p className="text-sm text-gray-500">{searchResults.length} professionnel{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}</p>
                {searchResults.map(pro => (
                  <div key={pro.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-teal-100 hover:border-teal-300 transition-all">
                    <ProAvatar initials={pro.avatar} color="bg-gradient-to-br from-[#0D9488] to-[#2563EB]" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800">{pro.name}</div>
                      <div className="text-sm text-[#0D9488] capitalize">{pro.specialty}</div>
                      <div className="text-xs text-gray-500 mt-0.5">📍 {pro.location}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-semibold text-gray-700">{pro.priceMin === 0 ? 'Gratuit' : `${pro.priceMin}–${pro.priceMax} €`}</div>
                      <div className="text-xs text-gray-400">par séance</div>
                    </div>
                    <button
                      onClick={() => openModal(pro)}
                      className="ml-2 px-4 py-2 bg-gradient-to-r from-[#0D9488] to-[#2563EB] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
                    >
                      Prendre RDV
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </GlassCard>

      {/* My appointments */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-[#0D9488] mb-5 flex items-center gap-2">
          <span className="text-2xl">📅</span> Mes rendez-vous
        </h2>
        <div className="flex gap-1 mb-5 bg-gray-100/80 rounded-xl p-1">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow text-[#0D9488]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'upcoming' ? `À venir (${upcoming.length})` : `Passés (${past.length})`}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {(tab === 'upcoming' ? upcoming : past).length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucun rendez-vous {tab === 'upcoming' ? 'à venir' : 'passé'}.</p>
          ) : (
            (tab === 'upcoming' ? upcoming : past).map(appt => {
              const { icon, label } = typeLabel(appt.type)
              const sc = statusConfig(appt.status)
              const canCancel = (appt.status === 'pending' || appt.status === 'confirmed') && isUpcoming(appt.date, appt.time)
              const canJoin = appt.type === 'video' && appt.status === 'confirmed' && isSoon(appt.date, appt.time)
              return (
                <div key={appt.id} className="p-4 bg-white/60 rounded-xl border border-teal-100 hover:border-teal-200 transition-all">
                  <div className="flex items-start gap-3">
                    <ProAvatar initials={appt.proName.split(' ').map(w => w[0]).slice(0, 2).join('')} color="bg-gradient-to-br from-[#0D9488] to-[#2563EB]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="font-semibold text-gray-800">{appt.proName}</div>
                          <div className="text-sm text-[#0D9488] capitalize">{appt.proSpecialty}</div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span>🗓 {formatDateFR(appt.date, appt.time)}</span>
                        <span className="bg-gray-100 px-2.5 py-0.5 rounded-full text-xs font-medium">{icon} {label}</span>
                      </div>
                      {appt.notes && <p className="mt-1.5 text-xs text-gray-400 italic">« {appt.notes} »</p>}
                      {(canCancel || canJoin) && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {canJoin && (
                            <button className="px-4 py-1.5 bg-gradient-to-r from-[#0D9488] to-[#2563EB] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all active:scale-95">
                              🎥 Rejoindre
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-100 transition-all active:scale-95"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </GlassCard>

      {/* Booking modal */}
      {showModal && selectedPro && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="w-full max-w-md bg-[#F8F7FF] rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0D9488] to-[#2563EB] p-5 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Nouveau rendez-vous</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all">✕</button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <ProAvatar initials={selectedPro.avatar} color="bg-white/20" />
                <div>
                  <div className="font-semibold">{selectedPro.name}</div>
                  <div className="text-sm text-white/80 capitalize">{selectedPro.specialty} · {selectedPro.location}</div>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✅</div>
                  <div className="text-lg font-bold text-[#0D9488]">Demande envoyée !</div>
                  <p className="text-sm text-gray-500 mt-1">Le professionnel confirmera votre rendez-vous.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Choisir un créneau *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPro.availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setModalSlot(slot)}
                          className={`p-2.5 rounded-xl text-sm font-medium border transition-all ${modalSlot === slot ? 'bg-[#0D9488] text-white border-[#0D9488]' : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300'}`}
                        >
                          <div className="font-semibold">{formatShortDate(slot.split(' ')[0])}</div>
                          <div className="text-xs opacity-80">{slot.split(' ')[1]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type de consultation *</label>
                    <div className="flex gap-2">
                      {(['video', 'phone', 'in_person'] as AppointmentType[]).map(t => {
                        const { icon, label } = typeLabel(t)
                        return (
                          <button
                            key={t}
                            onClick={() => setModalType(t)}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${modalType === t ? 'bg-[#0D9488] text-white border-[#0D9488]' : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300'}`}
                          >
                            {icon} {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes pour le professionnel <span className="text-gray-400 font-normal">(optionnel)</span></label>
                    <textarea
                      value={modalNotes}
                      onChange={e => setModalNotes(e.target.value)}
                      placeholder="Décrivez brièvement le motif de consultation..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={!modalSlot || submitting}
                    className="w-full py-3 bg-gradient-to-r from-[#0D9488] to-[#2563EB] text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                    Confirmer la demande
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Pro View ─────────────────────────────────────────────────────────────────

function ProView() {
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all')
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_PRO_APPOINTMENTS)
  const [weekOffset, setWeekOffset] = useState(0)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [newTime, setNewTime] = useState('')

  const baseDate = new Date('2026-06-13')
  baseDate.setDate(baseDate.getDate() + weekOffset * 7)
  const weekDays = getWeekDays(baseDate)

  const today = toDateStr(new Date('2026-06-13'))
  const todayCount = appointments.filter(a => a.date === today && a.status !== 'cancelled').length
  const weekCount = appointments.filter(a => {
    const d = new Date(a.date)
    return d >= weekDays[0] && d <= weekDays[6] && a.status !== 'cancelled'
  }).length

  const pending = appointments.filter(a => a.status === 'pending')

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  function confirm(id: string) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' as AppointmentStatus } : a))
  }
  function decline(id: string) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a))
  }

  const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  const TYPE_COLORS: Record<AppointmentType, string> = {
    video: 'bg-[#0D9488]/20 border-l-4 border-[#0D9488] text-[#0D9488]',
    phone: 'bg-[#2563EB]/20 border-l-4 border-[#2563EB] text-[#2563EB]',
    in_person: 'bg-[#7C3AED]/20 border-l-4 border-[#7C3AED] text-[#7C3AED]',
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-5 text-center">
          <div className="text-4xl font-extrabold bg-gradient-to-r from-[#1E3A5F] to-[#2563EB] bg-clip-text text-transparent">{todayCount}</div>
          <div className="text-sm text-gray-500 mt-1">RDV aujourd'hui</div>
        </GlassCard>
        <GlassCard className="p-5 text-center">
          <div className="text-4xl font-extrabold bg-gradient-to-r from-[#0D9488] to-[#2563EB] bg-clip-text text-transparent">{weekCount}</div>
          <div className="text-sm text-gray-500 mt-1">RDV cette semaine</div>
        </GlassCard>
      </div>

      {/* Week calendar */}
      <GlassCard className="p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2"><span>📆</span> Semaine</h2>
          <div className="flex gap-2 items-center">
            <button onClick={() => setWeekOffset(w => w - 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all">‹</button>
            <span className="text-sm text-gray-600 font-medium">
              {formatShortDate(toDateStr(weekDays[0]))} – {formatShortDate(toDateStr(weekDays[6]))}
            </span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all">›</button>
          </div>
        </div>
        <div className="overflow-x-auto -mx-1">
          <div className="min-w-[640px]">
            {/* Header */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-xs text-gray-400 text-center"></div>
              {weekDays.map((d, i) => {
                const ds = toDateStr(d)
                const isToday = ds === today
                return (
                  <div key={i} className={`text-center py-1 rounded-lg text-xs font-semibold ${isToday ? 'bg-gradient-to-b from-[#0D9488] to-[#2563EB] text-white' : 'text-gray-600'}`}>
                    <div>{DAYS_FR[d.getDay()]}</div>
                    <div className={`text-base font-bold ${isToday ? 'text-white' : 'text-gray-800'}`}>{d.getDate()}</div>
                  </div>
                )
              })}
            </div>
            {/* Time slots */}
            {TIME_SLOTS.map(slot => (
              <div key={slot} className="grid grid-cols-8 gap-1 mb-1">
                <div className="text-xs text-gray-400 text-right pr-1 pt-1 leading-none">{slot}</div>
                {weekDays.map((d, di) => {
                  const ds = toDateStr(d)
                  const appt = appointments.find(a => a.date === ds && a.time === slot && a.status !== 'cancelled')
                  return (
                    <div key={di} className="h-10 rounded-lg overflow-hidden">
                      {appt ? (
                        <div className={`h-full px-1 py-0.5 text-xs font-medium rounded-lg ${TYPE_COLORS[appt.type]}`} title={appt.patientName}>
                          <div className="truncate leading-tight">{appt.patientName?.split(' ')[0]}</div>
                          <div className="text-[10px] opacity-70">{typeLabel(appt.type).icon}</div>
                        </div>
                      ) : (
                        <div className="h-full border border-dashed border-gray-100 rounded-lg" />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-3 flex-wrap text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#0D9488]/30 border-l-2 border-[#0D9488]" />Vidéo</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#2563EB]/30 border-l-2 border-[#2563EB]" />Téléphone</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#7C3AED]/30 border-l-2 border-[#7C3AED]" />Présentiel</span>
        </div>
      </GlassCard>

      {/* Pending requests */}
      {pending.length > 0 && (
        <GlassCard className="p-5">
          <h2 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
            <span>⏳</span> Demandes en attente
            <span className="ml-1 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          </h2>
          <div className="space-y-3">
            {pending.map(appt => (
              <div key={appt.id} className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <ProAvatar initials={(appt.patientName || 'P').split(' ').map(w => w[0]).slice(0, 2).join('')} color="bg-gradient-to-br from-orange-400 to-pink-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800">{appt.patientName}</div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      🗓 {formatDateFR(appt.date, appt.time)} · {typeLabel(appt.type).icon} {typeLabel(appt.type).label}
                    </div>
                    {appt.notes && <p className="mt-1.5 text-xs text-gray-500 italic bg-white/60 rounded-lg px-2.5 py-1.5">« {appt.notes} »</p>}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <button
                        onClick={() => confirm(appt.id)}
                        className="px-4 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-all active:scale-95"
                      >
                        ✓ Confirmer
                      </button>
                      <button
                        onClick={() => decline(appt.id)}
                        className="px-4 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-all active:scale-95"
                      >
                        ✕ Refuser
                      </button>
                      <button
                        onClick={() => setRescheduleId(appt.id)}
                        className="px-4 py-1.5 bg-white border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                      >
                        🔄 Proposer autre horaire
                      </button>
                    </div>
                    {rescheduleId === appt.id && (
                      <div className="mt-3 flex gap-2 items-center">
                        <input
                          type="datetime-local"
                          value={newTime}
                          onChange={e => setNewTime(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                        />
                        <button
                          onClick={() => {
                            if (!newTime) return
                            setAppointments(prev => prev.map(a => a.id === appt.id ? {
                              ...a,
                              date: newTime.split('T')[0],
                              time: newTime.split('T')[1].slice(0, 5),
                              status: 'pending'
                            } : a))
                            setRescheduleId(null)
                            setNewTime('')
                          }}
                          className="px-3 py-1.5 bg-[#0D9488] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all"
                        >
                          Envoyer
                        </button>
                        <button onClick={() => setRescheduleId(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* All appointments with filter */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2"><span>📋</span> Tous les rendez-vous</h2>
          <div className="flex gap-1 bg-gray-100/80 rounded-xl p-1">
            {([['all', 'Tous'], ['pending', 'En attente'], ['confirmed', 'Confirmés'], ['cancelled', 'Annulés']] as const).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === val ? 'bg-white shadow text-[#1E3A5F]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucun rendez-vous pour ce filtre.</p>
          ) : (
            filtered.map(appt => {
              const sc = statusConfig(appt.status)
              const { icon, label } = typeLabel(appt.type)
              return (
                <div key={appt.id} className="flex items-center gap-3 p-3.5 bg-white/60 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                  <ProAvatar initials={(appt.patientName || 'P').split(' ').map(w => w[0]).slice(0, 2).join('')} color="bg-gradient-to-br from-[#1E3A5F] to-[#64748B]" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm">{appt.patientName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDateFR(appt.date, appt.time)} · {icon} {label}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                </div>
              )
            })
          )}
        </div>
      </GlassCard>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [profileType, setProfileType] = useState<ProfileType>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    detectProfile()
  }, [])

  async function detectProfile() {
    try {
      // 1. Check localStorage first (fast)
      const stored = localStorage.getItem('profileType') as ProfileType | null
      if (stored && ['parent', 'pro', 'ado'].includes(stored)) {
        setProfileType(stored)
        setLoading(false)
        return
      }
      // 2. Fallback: Supabase user metadata
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      const type = (user.user_metadata?.profile_type || user.user_metadata?.role || null) as ProfileType | null
      if (type) {
        setProfileType(type)
        localStorage.setItem('profileType', type)
      } else {
        // 3. Query profiles table
        const { data: profile } = await supabase.from('profiles').select('profile_type, role').eq('id', user.id).single()
        const ptype = (profile?.profile_type || profile?.role || 'parent') as ProfileType
        setProfileType(ptype)
        localStorage.setItem('profileType', ptype)
      }
    } catch (_) {
      setProfileType('parent')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0D9488]/30 border-t-[#0D9488] rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Chargement…</p>
        </div>
      </div>
    )
  }

  const isPro = profileType === 'pro'

  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ background: 'linear-gradient(135deg, #F8F7FF 0%, #EDF4FF 50%, #F0FDFB 100%)' }}>
      {/* Header */}
      <div className={`w-full px-4 pt-safe-top ${isPro ? 'bg-gradient-to-r from-[#1E3A5F] to-[#2563EB]' : 'bg-gradient-to-r from-[#0D9488] to-[#2563EB]'}`}>
        <div className="max-w-2xl mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                {isPro ? '🩺 Mon agenda' : '📅 Rendez-vous'}
              </h1>
              <p className="text-white/80 text-sm mt-0.5">
                {isPro ? 'Gérez vos consultations' : 'Trouvez un professionnel et gérez vos RDV'}
              </p>
            </div>
            {/* Profile switcher (dev helper) */}
            <select
              value={profileType || ''}
              onChange={e => {
                const val = e.target.value as ProfileType
                setProfileType(val)
                localStorage.setItem('profileType', val as string)
              }}
              className="text-xs bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="parent">Parent</option>
              <option value="pro">Pro</option>
              <option value="ado">Ado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {isPro ? <ProView /> : <ParentView />}
      </div>
    </div>
  )
}
