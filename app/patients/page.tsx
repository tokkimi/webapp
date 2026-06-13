'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Patient {
  id: string
  name: string
  age: number
  email: string
  phone: string
  status: 'actif' | 'inactif'
  avatarColor: string
  avatarEmoji: string
  lastSessionDate: Date
  nextAppointment: Date | null
  sessions: Session[]
  notes: Note[]
  sharedResources: SharedResource[]
}

interface Session {
  id: string
  date: Date
  duration: number // minutes
  type: 'individuel' | 'groupe' | 'famille' | 'urgence'
  summary: string
}

interface Note {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  preview: string
}

interface SharedResource {
  id: string
  title: string
  type: 'article' | 'vidéo' | 'outil' | 'ligne de crise'
  sharedAt: Date
  url: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Léa Moreau',
    age: 16,
    email: 'lea.moreau@example.com',
    phone: '06 12 34 56 78',
    status: 'actif',
    avatarColor: 'linear-gradient(135deg, #7C3AED, #EC4899)',
    avatarEmoji: '🌸',
    lastSessionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    nextAppointment: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    sessions: [
      {
        id: 's1',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: 50,
        type: 'individuel',
        summary: 'Exploration des schémas d\'anxiété scolaire. Léa a partagé ses craintes concernant les examens à venir. Travail sur les techniques de respiration et de pleine conscience. Progrès notable dans la verbalisation des émotions.',
      },
      {
        id: 's2',
        date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        duration: 50,
        type: 'individuel',
        summary: 'Suite du travail sur l\'estime de soi. Introduction aux exercices de journalisation émotionnelle. Léa montre une bonne adhésion aux outils proposés.',
      },
      {
        id: 's3',
        date: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
        duration: 45,
        type: 'famille',
        summary: 'Séance avec les parents. Amélioration de la communication intrafamiliale. Les parents ont mieux compris les besoins de Léa en matière d\'autonomie.',
      },
    ],
    notes: [
      {
        id: 'n1',
        content: 'Léa présente une anxiété de performance significative, probablement liée à la pression parentale concernant les études supérieures. Elle compense par un perfectionnisme rigide. Pistes : TCC axée sur les pensées automatiques, exercices de décentrement cognitif. Surveiller les signes de burnout scolaire.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        preview: 'Léa présente une anxiété de performance significative...',
      },
      {
        id: 'n2',
        content: 'Bonne progression sur la régulation émotionnelle. Utilise maintenant le journal de manière autonome. A évoqué des tensions avec son groupe d\'amies — à explorer la prochaine fois.',
        createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        preview: 'Bonne progression sur la régulation émotionnelle...',
      },
    ],
    sharedResources: [
      { id: 'r1', title: 'Gérer l\'anxiété scolaire : guide pratique', type: 'article', sharedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), url: '#' },
      { id: 'r2', title: 'Méditation guidée pour adolescents', type: 'vidéo', sharedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), url: '#' },
    ],
  },
  {
    id: '2',
    name: 'Thomas Dupont',
    age: 15,
    email: 'thomas.dupont@example.com',
    phone: '06 98 76 54 32',
    status: 'actif',
    avatarColor: 'linear-gradient(135deg, #2563EB, #0D9488)',
    avatarEmoji: '🌊',
    lastSessionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    nextAppointment: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    sessions: [
      {
        id: 's4',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        duration: 50,
        type: 'individuel',
        summary: 'Thomas a ouvert sur ses difficultés relationnelles au collège. Sentiment d\'isolement persistant. Introduction aux habiletés sociales. Plan d\'action pour la semaine : engager une conversation avec un camarade.',
      },
      {
        id: 's5',
        date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
        duration: 50,
        type: 'individuel',
        summary: 'Travail sur la confiance en soi. Thomas a partagé un souvenir positif d\'une réussite sportive. Utilisation comme ressource interne.',
      },
    ],
    notes: [
      {
        id: 'n3',
        content: 'Profil introverti avec possible HPI non diagnostiqué. Décalage social important. Excellentes capacités d\'analyse et d\'abstraction. Aborder la possibilité d\'un bilan psychométrique avec les parents.',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        preview: 'Profil introverti avec possible HPI non diagnostiqué...',
      },
    ],
    sharedResources: [
      { id: 'r3', title: 'Les ados à haut potentiel : comprendre et accompagner', type: 'article', sharedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), url: '#' },
    ],
  },
  {
    id: '3',
    name: 'Emma Laurent',
    age: 17,
    email: 'emma.laurent@example.com',
    phone: '07 11 22 33 44',
    status: 'actif',
    avatarColor: 'linear-gradient(135deg, #F97316, #EC4899)',
    avatarEmoji: '✨',
    lastSessionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextAppointment: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    sessions: [
      {
        id: 's6',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: 50,
        type: 'urgence',
        summary: 'Séance d\'urgence suite à une crise d\'angoisse au lycée. Techniques de régulation appliquées en séance. Contrat de sécurité établi. Contact avec les parents effectué.',
      },
    ],
    notes: [
      {
        id: 'n4',
        content: 'Épisode de crise important cette semaine. Emma a des antécédents d\'automutilation (cicatrices observées sur avant-bras). Contrat de sécurité établi. À surveiller de près. Prochaine séance dans 3 jours.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        preview: 'Épisode de crise important cette semaine...',
      },
    ],
    sharedResources: [
      { id: 'r4', title: '3114 — Numéro national de prévention du suicide', type: 'ligne de crise', sharedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), url: '#' },
    ],
  },
  {
    id: '4',
    name: 'Lucas Martin',
    age: 14,
    email: 'lucas.martin@example.com',
    phone: '06 55 44 33 22',
    status: 'inactif',
    avatarColor: 'linear-gradient(135deg, #64748B, #1E3A5F)',
    avatarEmoji: '🎮',
    lastSessionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    nextAppointment: null,
    sessions: [
      {
        id: 's7',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        duration: 50,
        type: 'individuel',
        summary: 'Dernière séance avant pause estivale. Bilan positif du travail effectué sur la gestion de la colère. Lucas repart avec des outils concrets.',
      },
    ],
    notes: [
      {
        id: 'n5',
        content: 'Suivi mis en pause à la demande de la famille (vacances). Bonnes avancées sur la régulation de la colère. Reprendre en septembre avec focus sur les relations familiales.',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        preview: 'Suivi mis en pause à la demande de la famille...',
      },
    ],
    sharedResources: [],
  },
  {
    id: '5',
    name: 'Chloé Roux',
    age: 15,
    email: 'chloe.roux@example.com',
    phone: '07 88 99 00 11',
    status: 'actif',
    avatarColor: 'linear-gradient(135deg, #0D9488, #2563EB)',
    avatarEmoji: '🎨',
    lastSessionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    nextAppointment: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    sessions: [
      {
        id: 's8',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        duration: 50,
        type: 'individuel',
        summary: 'Travail sur l\'image corporelle et l\'estime de soi. Chloé a utilisé le dessin comme médiation thérapeutique pour exprimer ses ressentis. Très bonne séance créative.',
      },
    ],
    notes: [
      {
        id: 'n6',
        content: 'Chloé répond très bien à la médiation par l\'art. Envisager une thérapie axée sur les arts plastiques. Problèmes d\'image corporelle persistants mais s\'atténuent. Prochaine fois : explorer les relations avec ses pairs.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        preview: 'Chloé répond très bien à la médiation par l\'art...',
      },
    ],
    sharedResources: [
      { id: 'r5', title: 'Art-thérapie : créer pour guérir', type: 'article', sharedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), url: '#' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeDate(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Aujourd\'hui'
  if (diff === 1) return 'Hier'
  if (diff < 7) return `Il y a ${diff} jours`
  if (diff < 30) return `Il y a ${Math.floor(diff / 7)} sem.`
  return `Il y a ${Math.floor(diff / 30)} mois`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function sessionTypeLabel(type: Session['type']): string {
  const labels: Record<string, string> = {
    individuel: 'Individuel',
    groupe: 'Groupe',
    famille: 'Famille',
    urgence: 'Urgence',
  }
  return labels[type] || type
}

function sessionTypeColor(type: Session['type']): string {
  const colors: Record<string, string> = {
    individuel: '#2563EB',
    groupe: '#0D9488',
    famille: '#7C3AED',
    urgence: '#EF4444',
  }
  return colors[type] || '#64748B'
}

const AVAILABLE_RESOURCES = [
  'Gérer l\'anxiété scolaire : guide pratique',
  'Méditation guidée pour adolescents',
  'Les ados à haut potentiel : comprendre et accompagner',
  'Techniques de régulation émotionnelle',
  'Guide parentalité positive',
  'Reconnaître la dépression chez l\'adolescent',
  'Pleine conscience pour les jeunes',
]

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function ProSidebar({ activePage }: { activePage: string }) {
  const navItems = [
    { href: '/dashboard/pro', icon: '🏠', label: 'Tableau de bord' },
    { href: '/patients', icon: '👥', label: 'Patients' },
    { href: '/agenda', icon: '📅', label: 'Agenda' },
    { href: '/resources', icon: '📚', label: 'Ressources' },
    { href: '/messages', icon: '💬', label: 'Messagerie' },
    { href: '/profile', icon: '⚙️', label: 'Paramètres' },
  ]

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1E3A5F, #2563EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}>💼</div>
          <div>
            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 15, color: '#1E3A5F' }}>Capsule Pro</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>Espace professionnel</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => {
          const isActive = activePage === item.href
          return (
            <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                background: isActive ? 'rgba(30,58,95,0.08)' : 'transparent',
                color: isActive ? '#1E3A5F' : '#64748B',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {isActive && (
                  <div style={{
                    marginLeft: 'auto',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#1E3A5F',
                  }} />
                )}
              </div>
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,58,95,0.06), rgba(37,99,235,0.04))',
          border: '1px solid rgba(30,58,95,0.12)',
          borderRadius: 12,
          padding: '12px',
        }}>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Plan Pro actif</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1E3A5F' }}>5 patients actifs</div>
        </div>
      </div>
    </aside>
  )
}

// ─── Patient List Item ────────────────────────────────────────────────────────

function PatientListItem({
  patient,
  isSelected,
  onClick,
}: {
  patient: Patient
  isSelected: boolean
  onClick: () => void
}) {
  const initial = patient.name[0].toUpperCase()

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: isSelected
          ? 'linear-gradient(135deg, rgba(30,58,95,0.08), rgba(37,99,235,0.05))'
          : 'transparent',
        border: `1px solid ${isSelected ? 'rgba(30,58,95,0.2)' : 'transparent'}`,
        borderRadius: 12,
        padding: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: patient.avatarColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
        boxShadow: isSelected ? '0 4px 12px rgba(30,58,95,0.2)' : 'none',
      }}>
        {patient.avatarEmoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {patient.name}
          </span>
          <span style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 100,
            background: patient.status === 'actif' ? 'rgba(13,148,136,0.1)' : 'rgba(100,116,139,0.1)',
            color: patient.status === 'actif' ? '#0D9488' : '#64748B',
            fontWeight: 500,
            flexShrink: 0,
            marginLeft: 6,
          }}>
            {patient.status === 'actif' ? '● Actif' : '○ Inactif'}
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
          {patient.age} ans
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>
            Dernière séance : {relativeDate(patient.lastSessionDate)}
          </span>
          {patient.nextAppointment && (
            <span style={{
              fontSize: 11,
              color: '#2563EB',
              background: 'rgba(37,99,235,0.08)',
              padding: '2px 6px',
              borderRadius: 6,
            }}>
              📅 {formatDateShort(patient.nextAppointment)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px',
      textAlign: 'center',
    }}>
      {/* Emoji art illustration */}
      <div style={{ fontSize: 64, marginBottom: 8, lineHeight: 1 }}>
        {'    👤    '}
      </div>
      <div style={{ fontSize: 32, marginBottom: 4, letterSpacing: 8 }}>
        {'🌿 💬 📋'}
      </div>
      <div style={{ fontSize: 24, marginBottom: 24, letterSpacing: 4, color: '#9CA3AF' }}>
        {'· · ·'}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(30,58,95,0.1)',
        borderRadius: 20,
        padding: '32px 40px',
        maxWidth: 360,
      }}>
        <h3 style={{
          fontFamily: 'var(--font-outfit)',
          fontSize: 20,
          fontWeight: 700,
          color: '#1E3A5F',
          marginBottom: 10,
        }}>
          Sélectionnez un patient
        </h3>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
          Choisissez un patient dans la liste de gauche pour consulter son dossier, ses séances et ses notes.
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'tous' | 'actifs' | 'inactifs'>('tous')
  const [activeTab, setActiveTab] = useState<'historique' | 'notes' | 'ressources'>('historique')
  const [noteContent, setNoteContent] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [showResourcePicker, setShowResourcePicker] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const noteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync note editor with selected patient
  useEffect(() => {
    if (selectedPatient && selectedPatient.notes.length > 0) {
      setNoteContent(selectedPatient.notes[0].content)
    } else {
      setNoteContent('')
    }
    setNoteSaved(false)
  }, [selectedPatient?.id])

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filterStatus === 'tous' ||
      (filterStatus === 'actifs' && p.status === 'actif') ||
      (filterStatus === 'inactifs' && p.status === 'inactif')
    return matchSearch && matchFilter
  })

  // Auto-save note on blur
  const handleNoteBlur = useCallback(() => {
    if (!selectedPatient || noteContent === selectedPatient.notes[0]?.content) return
    setSavingNote(true)
    setTimeout(() => {
      setPatients(prev => prev.map(p => {
        if (p.id !== selectedPatient.id) return p
        const now = new Date()
        const updatedNotes: Note[] = [
          {
            id: `n-${Date.now()}`,
            content: noteContent,
            createdAt: now,
            updatedAt: now,
            preview: noteContent.slice(0, 60) + (noteContent.length > 60 ? '...' : ''),
          },
          ...p.notes,
        ]
        return { ...p, notes: updatedNotes }
      }))
      setSavingNote(false)
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 2500)
    }, 600)
  }, [selectedPatient, noteContent])

  const handleAddNewNote = () => {
    setNoteContent('')
  }

  const handleShareResource = (title: string) => {
    if (!selectedPatient) return
    const newResource: SharedResource = {
      id: `r-${Date.now()}`,
      title,
      type: 'article',
      sharedAt: new Date(),
      url: '#',
    }
    setPatients(prev => prev.map(p =>
      p.id === selectedPatient.id
        ? { ...p, sharedResources: [newResource, ...p.sharedResources] }
        : p
    ))
    // Update selected patient reference
    setSelectedPatient(prev => prev ? {
      ...prev,
      sharedResources: [newResource, ...prev.sharedResources],
    } : prev)
    setShowResourcePicker(false)
  }

  // Sync selectedPatient with patients state
  useEffect(() => {
    if (selectedPatient) {
      const updated = patients.find(p => p.id === selectedPatient.id)
      if (updated) setSelectedPatient(updated)
    }
  }, [patients])

  const resourceTypeIcon = (type: SharedResource['type']) => {
    const icons: Record<string, string> = {
      article: '📄',
      vidéo: '🎬',
      outil: '🛠️',
      'ligne de crise': '📞',
    }
    return icons[type] || '📄'
  }

  const resourceTypeColor = (type: SharedResource['type']) => {
    const colors: Record<string, string> = {
      article: '#2563EB',
      vidéo: '#7C3AED',
      outil: '#0D9488',
      'ligne de crise': '#EF4444',
    }
    return colors[type] || '#64748B'
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#F8F7FF',
      fontFamily: 'var(--font-inter)',
      overflow: 'hidden',
    }}>
      {/* Pro Sidebar */}
      <ProSidebar activePage="/patients" />

      {/* Left Panel — Patient List */}
      <div style={{
        width: 320,
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 16px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h1 style={{
              fontFamily: 'var(--font-outfit)',
              fontSize: 22,
              fontWeight: 700,
              color: '#1E3A5F',
            }}>
              Patients
            </h1>
            <span style={{
              fontSize: 12,
              color: '#64748B',
              background: '#F1F5F9',
              padding: '4px 10px',
              borderRadius: 100,
            }}>
              {filteredPatients.length} / {patients.length}
            </span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
              fontSize: 16,
              pointerEvents: 'none',
            }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                fontSize: 14,
                outline: 'none',
                background: '#F9FAFB',
                color: '#1A1A2E',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => (e.target.style.borderColor = '#2563EB')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          {/* Filter tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            background: '#F1F5F9',
            borderRadius: 10,
            padding: 4,
          }}>
            {(['tous', 'actifs', 'inactifs'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                style={{
                  flex: 1,
                  padding: '7px 8px',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: filterStatus === f ? 600 : 400,
                  background: filterStatus === f ? '#fff' : 'transparent',
                  color: filterStatus === f ? '#1E3A5F' : '#64748B',
                  transition: 'all 0.15s ease',
                  boxShadow: filterStatus === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'inherit',
                  textTransform: 'capitalize',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Patient list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
          {filteredPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9CA3AF' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 14 }}>Aucun patient trouvé</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filteredPatients.map(p => (
                <PatientListItem
                  key={p.id}
                  patient={p}
                  isSelected={selectedPatient?.id === p.id}
                  onClick={() => {
                    setSelectedPatient(p)
                    setActiveTab('historique')
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add patient button */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6' }}>
          <button
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              border: '1.5px dashed rgba(30,58,95,0.3)',
              background: 'transparent',
              color: '#1E3A5F',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(30,58,95,0.04)'
              e.currentTarget.style.borderStyle = 'solid'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderStyle = 'dashed'
            }}
          >
            <span style={{ fontSize: 18 }}>➕</span>
            Ajouter un patient
          </button>
        </div>
      </div>

      {/* Right Panel — Detail */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!selectedPatient ? (
          <EmptyState />
        ) : (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Patient header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30,58,95,0.05) 0%, rgba(37,99,235,0.03) 100%)',
              borderBottom: '1px solid #E5E7EB',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexShrink: 0,
            }}>
              {/* Avatar */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: selectedPatient.avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0,
                boxShadow: '0 4px 16px rgba(30,58,95,0.2)',
              }}>
                {selectedPatient.avatarEmoji}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <h2 style={{
                    fontFamily: 'var(--font-outfit)',
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#1E3A5F',
                  }}>
                    {selectedPatient.name}
                  </h2>
                  <span style={{ fontSize: 14, color: '#64748B' }}>· {selectedPatient.age} ans</span>
                  <span style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 100,
                    background: selectedPatient.status === 'actif' ? 'rgba(13,148,136,0.1)' : 'rgba(100,116,139,0.1)',
                    color: selectedPatient.status === 'actif' ? '#0D9488' : '#64748B',
                    fontWeight: 500,
                  }}>
                    {selectedPatient.status === 'actif' ? '● Actif' : '○ Inactif'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <span style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>✉️</span> {selectedPatient.email}
                  </span>
                  <span style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📱</span> {selectedPatient.phone}
                  </span>
                </div>
              </div>

              {/* Action */}
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #1E3A5F, #2563EB)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
                boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}>
                <span>📅</span>
                Prendre RDV
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: 0,
              borderBottom: '1px solid #E5E7EB',
              background: '#fff',
              padding: '0 32px',
              flexShrink: 0,
            }}>
              {(['historique', 'notes', 'ressources'] as const).map(tab => {
                const labels: Record<string, string> = {
                  historique: 'Historique',
                  notes: 'Notes',
                  ressources: 'Ressources partagées',
                }
                const icons: Record<string, string> = {
                  historique: '📋',
                  notes: '📝',
                  ressources: '📚',
                }
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '16px 20px',
                      border: 'none',
                      borderBottom: activeTab === tab ? '2px solid #1E3A5F' : '2px solid transparent',
                      background: 'transparent',
                      color: activeTab === tab ? '#1E3A5F' : '#64748B',
                      fontSize: 14,
                      fontWeight: activeTab === tab ? 600 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.15s ease',
                      fontFamily: 'inherit',
                      marginBottom: -1,
                    }}
                  >
                    <span>{icons[tab]}</span>
                    {labels[tab]}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>

              {/* ── Historique ── */}
              {activeTab === 'historique' && (
                <div style={{ maxWidth: 720 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: 18, fontWeight: 700, color: '#1E3A5F' }}>
                      Séances ({selectedPatient.sessions.length})
                    </h3>
                    <span style={{ fontSize: 13, color: '#64748B' }}>
                      {selectedPatient.sessions.reduce((acc, s) => acc + s.duration, 0)} min au total
                    </span>
                  </div>

                  {selectedPatient.sessions.length === 0 ? (
                    <div style={{
                      background: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(30,58,95,0.1)',
                      borderRadius: 16,
                      padding: '32px',
                      textAlign: 'center',
                      color: '#9CA3AF',
                    }}>
                      <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
                      <p>Aucune séance enregistrée</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {selectedPatient.sessions.map((session, idx) => (
                        <div
                          key={session.id}
                          style={{
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(30,58,95,0.08)',
                            borderRadius: 16,
                            padding: '20px 24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                        >
                          {/* Session header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: sessionTypeColor(session.type),
                                boxShadow: `0 0 8px ${sessionTypeColor(session.type)}60`,
                              }} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 15, color: '#1A1A2E', marginBottom: 2 }}>
                                  Séance {sessionTypeLabel(session.type)}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>
                                  {formatDate(session.date)} · {session.duration} min
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                fontSize: 11,
                                padding: '3px 10px',
                                borderRadius: 100,
                                background: `${sessionTypeColor(session.type)}15`,
                                color: sessionTypeColor(session.type),
                                fontWeight: 600,
                              }}>
                                {sessionTypeLabel(session.type)}
                              </span>
                              {idx === 0 && (
                                <span style={{
                                  fontSize: 11,
                                  padding: '3px 10px',
                                  borderRadius: 100,
                                  background: 'rgba(13,148,136,0.1)',
                                  color: '#0D9488',
                                  fontWeight: 600,
                                }}>
                                  Dernière séance
                                </span>
                              )}
                            </div>
                          </div>

                          {/* AI Summary */}
                          <div style={{
                            background: 'linear-gradient(135deg, rgba(30,58,95,0.04), rgba(37,99,235,0.03))',
                            border: '1px solid rgba(37,99,235,0.1)',
                            borderRadius: 10,
                            padding: '14px 16px',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                              <span style={{ fontSize: 12 }}>🤖</span>
                              <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Résumé IA
                              </span>
                            </div>
                            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65 }}>
                              {session.summary}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Notes ── */}
              {activeTab === 'notes' && (
                <div style={{ maxWidth: 720, display: 'flex', gap: 24 }}>
                  {/* Editor */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: 18, fontWeight: 700, color: '#1E3A5F' }}>
                        Note clinique
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {savingNote && (
                          <span style={{ fontSize: 12, color: '#64748B' }}>Sauvegarde...</span>
                        )}
                        {noteSaved && !savingNote && (
                          <span style={{ fontSize: 12, color: '#0D9488', fontWeight: 600 }}>✓ Sauvegardé</span>
                        )}
                        <button
                          onClick={handleAddNewNote}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #1E3A5F, #2563EB)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontFamily: 'inherit',
                          }}
                        >
                          <span>+</span>
                          Nouvelle note
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      onBlur={handleNoteBlur}
                      placeholder="Écrivez vos observations cliniques, hypothèses diagnostiques, plan thérapeutique..."
                      style={{
                        width: '100%',
                        minHeight: 320,
                        padding: '16px',
                        borderRadius: 12,
                        border: '1.5px solid rgba(30,58,95,0.15)',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(8px)',
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: '#1A1A2E',
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.15s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#2563EB')}
                      onBlurCapture={e => (e.target.style.borderColor = 'rgba(30,58,95,0.15)')}
                    />

                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                      🔒 Notes confidentielles — Sauvegarde automatique à la sortie du champ
                    </p>
                  </div>

                  {/* Version history */}
                  {selectedPatient.notes.length > 0 && (
                    <div style={{ width: 220, flexShrink: 0 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Historique
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedPatient.notes.map((note, idx) => (
                          <button
                            key={note.id}
                            onClick={() => setNoteContent(note.content)}
                            style={{
                              padding: '12px',
                              background: 'rgba(255,255,255,0.8)',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(30,58,95,0.08)',
                              borderRadius: 10,
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              fontFamily: 'inherit',
                            }}
                          >
                            <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, marginBottom: 4 }}>
                              {idx === 0 ? '● Actuelle' : formatDate(note.createdAt)}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                              {note.preview}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Ressources partagées ── */}
              {activeTab === 'ressources' && (
                <div style={{ maxWidth: 720 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: 18, fontWeight: 700, color: '#1E3A5F' }}>
                      Ressources partagées ({selectedPatient.sharedResources.length})
                    </h3>
                    <button
                      onClick={() => setShowResourcePicker(true)}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #1E3A5F, #2563EB)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span>📤</span>
                      Partager une ressource
                    </button>
                  </div>

                  {selectedPatient.sharedResources.length === 0 ? (
                    <div style={{
                      background: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(12px)',
                      border: '1px dashed rgba(30,58,95,0.2)',
                      borderRadius: 16,
                      padding: '48px',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: 32, marginBottom: 12 }}>📚</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#1E3A5F', marginBottom: 6 }}>Aucune ressource partagée</p>
                      <p style={{ fontSize: 13, color: '#64748B' }}>Partagez des articles, vidéos ou outils avec ce patient.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedPatient.sharedResources.map(res => (
                        <div
                          key={res.id}
                          style={{
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(30,58,95,0.08)',
                            borderRadius: 14,
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                        >
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: `${resourceTypeColor(res.type)}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            flexShrink: 0,
                          }}>
                            {resourceTypeIcon(res.type)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A2E', marginBottom: 4 }}>{res.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 100,
                                background: `${resourceTypeColor(res.type)}15`,
                                color: resourceTypeColor(res.type),
                                fontWeight: 500,
                              }}>
                                {res.type}
                              </span>
                              <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                                Partagé le {formatDate(res.sharedAt)}
                              </span>
                            </div>
                          </div>
                          <a href={res.url} style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            border: '1px solid rgba(30,58,95,0.2)',
                            borderRadius: 8,
                            fontSize: 13,
                            color: '#1E3A5F',
                            textDecoration: 'none',
                            fontWeight: 500,
                            flexShrink: 0,
                          }}>
                            Voir →
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resource Picker Modal */}
      {showResourcePicker && (
        <div
          onClick={() => setShowResourcePicker(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(30,58,95,0.15)',
              borderRadius: 20,
              padding: '28px',
              width: 480,
              maxWidth: '90vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: 18, fontWeight: 700, color: '#1E3A5F' }}>
                Choisir une ressource
              </h3>
              <button
                onClick={() => setShowResourcePicker(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AVAILABLE_RESOURCES.map(title => (
                <button
                  key={title}
                  onClick={() => handleShareResource(title)}
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(248,247,255,0.8)',
                    border: '1px solid rgba(30,58,95,0.1)',
                    borderRadius: 12,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: '#1A1A2E',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(30,58,95,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(30,58,95,0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(248,247,255,0.8)'
                    e.currentTarget.style.borderColor = 'rgba(30,58,95,0.1)'
                  }}
                >
                  <span>📄</span>
                  {title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
