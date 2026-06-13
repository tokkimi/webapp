'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileType = 'ado' | 'parent' | 'pro' | null

type Tab =
  | 'profil'
  | 'confidentialite'
  | 'notifications'
  | 'public'
  | 'abonnement'
  | 'securite'

interface FamilyLink {
  id: string
  parent_name: string
  parent_email: string
  status: string
  share_mood: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONSULTATION_TYPES = [
  'Individuel adolescent',
  'Familial',
  'Parent-enfant',
  'Groupe d\'adolescents',
  'Visio',
  'Présentiel',
  'Urgences',
]

const SPECIALTIES = [
  'Psychologie clinique',
  'Thérapie cognitivo-comportementale',
  'EMDR',
  'Art-thérapie',
  'Thérapie familiale',
  'Neuropsychologie',
  'Psychiatrie adolescent',
]

const AGE_RANGES = ['10-12 ans', '12-15 ans', '15-18 ans', '18-25 ans', '10-18 ans', 'Tous âges']

// ─── Helpers ──────────────────────────────────────────────────────────────────

const accentFor = (type: ProfileType) => {
  if (type === 'ado') return { main: '#7C3AED', second: '#EC4899', third: '#F97316' }
  if (type === 'parent') return { main: '#0D9488', second: '#2563EB', third: '#0D9488' }
  return { main: '#1E3A5F', second: '#64748B', third: '#1E3A5F' }
}

const labelFor = (type: ProfileType) => {
  if (type === 'ado') return 'Adolescent'
  if (type === 'parent') return 'Parent'
  if (type === 'pro') return 'Professionnel'
  return ''
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 20,
      padding: '24px',
      marginBottom: 16,
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: 'rgba(255,255,255,0.4)',
      fontWeight: 600,
      marginBottom: 18,
    }}>
      {children}
    </p>
  )
}

function Field({
  label, value, onChange, type = 'text', readOnly = false, placeholder = '',
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  readOnly?: boolean
  placeholder?: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        style={{
          width: '100%',
          background: readOnly ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${readOnly ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.14)'}`,
          borderRadius: 12,
          padding: '12px 14px',
          color: readOnly ? 'rgba(255,255,255,0.45)' : '#fff',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          cursor: readOnly ? 'not-allowed' : 'text',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={e => { if (!readOnly) (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.3)' }}
        onBlur={e => { if (!readOnly) (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.14)' }}
      />
    </div>
  )
}

function TextAreaField({
  label, value, onChange, placeholder = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em' }}>
        {label}
      </label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={3}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 12,
          padding: '12px 14px',
          color: '#fff',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          resize: 'vertical',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.3)'}
        onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.14)'}
      />
    </div>
  )
}

function Toggle({
  label, description, checked, onChange, accent = '#7C3AED',
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  accent?: string
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: description ? 3 : 0 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 48,
          height: 26,
          borderRadius: 13,
          background: checked ? accent : 'rgba(255,255,255,0.12)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.25s ease',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 3,
          left: checked ? 25 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          transition: 'left 0.25s ease',
        }} />
      </button>
    </div>
  )
}

function MultiSelect({
  label, options, selected, onChange, accent = '#7C3AED',
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  accent?: string
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em' }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              style={{
                border: `1px solid ${active ? accent : 'rgba(255,255,255,0.14)'}`,
                background: active ? `${accent}22` : 'rgba(255,255,255,0.04)',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                borderRadius: 8,
                padding: '7px 13px',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                transition: 'all 0.2s ease',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SaveButton({
  onClick, saving, saved, accent,
}: {
  onClick: () => void
  saving: boolean
  saved: boolean
  accent: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        width: '100%',
        padding: '15px',
        background: saved
          ? 'linear-gradient(135deg, #22C55E, #16A34A)'
          : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
        border: 'none',
        borderRadius: 14,
        color: '#fff',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 15,
        fontWeight: 600,
        cursor: saving ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        boxShadow: `0 4px 24px ${accent}44`,
        transition: 'all 0.3s ease',
      }}
    >
      {saving ? (
        <span style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      ) : saved ? (
        '✓ Enregistré !'
      ) : (
        'Enregistrer les modifications'
      )}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auth & profile
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [profileType, setProfileType] = useState<ProfileType>(null)
  const [loading, setLoading] = useState(true)

  // UI
  const [activeTab, setActiveTab] = useState<Tab>('profil')

  // ── Tab: Mon profil ──
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarInput, setAvatarInput] = useState('')
  const [showAvatarInput, setShowAvatarInput] = useState(false)
  const [birthDate, setBirthDate] = useState('')
  const [birthDateLocked, setBirthDateLocked] = useState(false)
  const [checkinParental, setCheckinParental] = useState(false)
  // PRO fields
  const [specialty, setSpecialty] = useState('')
  const [adeliNumber, setAdeliNumber] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [consultTypes, setConsultTypes] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [savingProfil, setSavingProfil] = useState(false)
  const [savedProfil, setSavedProfil] = useState(false)

  // ── Tab: Confidentialité ──
  const [shareMood, setShareMood] = useState(false)
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>([])
  const [inviteCode, setInviteCode] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [addingParent, setAddingParent] = useState(false)

  // ── Tab: Notifications ──
  const [notifMotivation, setNotifMotivation] = useState(true)
  const [notifJournal, setNotifJournal] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifRdv, setNotifRdv] = useState(true)
  const [savingNotifs, setSavingNotifs] = useState(false)
  const [savedNotifs, setSavedNotifs] = useState(false)

  // ── Tab: Profil public (PRO) ──
  const [publicDesc, setPublicDesc] = useState('')
  const [publicConsultTypes, setPublicConsultTypes] = useState<string[]>([])
  const [publicLocation, setPublicLocation] = useState('')
  const [savingPublic, setSavingPublic] = useState(false)
  const [savedPublic, setSavedPublic] = useState(false)

  // ── Tab: Abonnement (PRO) ──
  const [subscription, setSubscription] = useState<any>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  // ── Tab: Sécurité ──
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  // ─── Load data ───────────────────────────────────────────────────────────────

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { router.push('/'); return }
    setUser(u)

    const [
      { data: prof },
      { data: sub },
      { data: notifPrefs },
      { data: links },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', u.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', u.id).eq('status', 'active').maybeSingle(),
      supabase.from('notification_preferences').select('*').eq('user_id', u.id).maybeSingle(),
      supabase.from('family_links').select('*').eq('ado_id', u.id),
    ])

    if (prof) {
      setProfile(prof)
      const t: ProfileType = prof.profile_type || 'ado'
      setProfileType(t)
      setName(prof.name || '')
      setBio(prof.bio || '')
      setLocation(prof.location || '')
      setPhone(prof.phone || '')
      setAvatarUrl(prof.avatar_url || '')
      setAvatarInput(prof.avatar_url || '')
      setCheckinParental(prof.checkin_parental || false)
      setShareMood(prof.share_mood || false)
      if (prof.birth_date) {
        setBirthDate(prof.birth_date)
        setBirthDateLocked(true)
      }
      // PRO fields
      setSpecialty(prof.specialty || '')
      setAdeliNumber(prof.adeli_number || '')
      setYearsExp(prof.years_experience ? String(prof.years_experience) : '')
      setAgeRange(prof.age_range || '')
      setConsultTypes(prof.consultation_types || [])
      setPriceMin(prof.price_min ? String(prof.price_min) : '')
      setPriceMax(prof.price_max ? String(prof.price_max) : '')
      setPublicDesc(prof.public_description || '')
      setPublicConsultTypes(prof.public_consultation_types || [])
      setPublicLocation(prof.public_location || '')
    }

    setSubscription(sub)

    if (notifPrefs) {
      setNotifMotivation(notifPrefs.motivation ?? true)
      setNotifJournal(notifPrefs.journal ?? true)
      setNotifMessages(notifPrefs.messages ?? true)
      setNotifRdv(notifPrefs.rdv ?? true)
    }

    if (links) {
      setFamilyLinks(links as FamilyLink[])
    }

    setLoading(false)
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  async function handleSaveProfil() {
    if (!user) return
    setSavingProfil(true)
    const body: Record<string, any> = {
      name,
      bio,
      location,
      phone,
      avatar_url: avatarUrl,
      checkin_parental: checkinParental,
      share_mood: shareMood,
    }
    if (!birthDateLocked && birthDate) {
      body.birth_date = birthDate
    }
    if (profileType === 'pro') {
      body.specialty = specialty
      body.adeli_number = adeliNumber
      body.years_experience = yearsExp ? parseInt(yearsExp) : null
      body.age_range = ageRange
      body.consultation_types = consultTypes
      body.price_min = priceMin ? parseInt(priceMin) : null
      body.price_max = priceMax ? parseInt(priceMax) : null
    }
    await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (birthDate && !birthDateLocked) setBirthDateLocked(true)
    setSavingProfil(false)
    setSavedProfil(true)
    setTimeout(() => setSavedProfil(false), 2500)
  }

  async function handleApplyAvatar() {
    setAvatarUrl(avatarInput)
    setShowAvatarInput(false)
  }

  async function handleSaveNotifs() {
    if (!user) return
    setSavingNotifs(true)
    await supabase.from('notification_preferences').upsert({
      user_id: user.id,
      motivation: notifMotivation,
      journal: notifJournal,
      messages: notifMessages,
      rdv: notifRdv,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    setSavingNotifs(false)
    setSavedNotifs(true)
    setTimeout(() => setSavedNotifs(false), 2500)
  }

  async function handleSaveMood() {
    if (!user) return
    await supabase.from('profiles').update({ share_mood: shareMood }).eq('id', user.id)
  }

  async function handleRemoveParent(linkId: string) {
    await supabase.from('family_links').delete().eq('id', linkId)
    setFamilyLinks(prev => prev.filter(l => l.id !== linkId))
  }

  async function handleAddParent() {
    if (!inviteCode.trim()) return
    setAddingParent(true)
    setInviteError('')
    setInviteSuccess('')
    const { data, error } = await supabase
      .from('family_links')
      .insert({ ado_id: user?.id, invite_code: inviteCode.trim(), status: 'pending' })
      .select()
      .single()
    setAddingParent(false)
    if (error) {
      setInviteError("Code invalide ou déjà utilisé. Vérifie avec tes parents.")
    } else {
      setInviteSuccess("Demande envoyée ! Ton parent recevra une notification.")
      setInviteCode('')
      if (data) setFamilyLinks(prev => [...prev, data as FamilyLink])
    }
  }

  async function handleSavePublic() {
    if (!user) return
    setSavingPublic(true)
    await supabase.from('profiles').update({
      public_description: publicDesc,
      public_consultation_types: publicConsultTypes,
      public_location: publicLocation,
    }).eq('id', user.id)
    setSavingPublic(false)
    setSavedPublic(true)
    setTimeout(() => setSavedPublic(false), 2500)
  }

  async function handlePortal() {
    setLoadingPortal(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoadingPortal(false)
  }

  async function handleChangePwd() {
    setPwdError('')
    setPwdSuccess('')
    if (!newPwd || !confirmPwd) { setPwdError("Remplis tous les champs."); return }
    if (newPwd !== confirmPwd) { setPwdError("Les mots de passe ne correspondent pas."); return }
    if (newPwd.length < 8) { setPwdError("Le mot de passe doit faire au moins 8 caractères."); return }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSavingPwd(false)
    if (error) {
      setPwdError(error.message || "Erreur lors du changement de mot de passe.")
    } else {
      setPwdSuccess("Mot de passe mis à jour avec succès !")
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    }
  }

  async function handleDownloadData() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const blob = new Blob([JSON.stringify({ profile: prof, email: user?.email }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mes-donnees-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'SUPPRIMER') return
    setDeletingAccount(true)
    await fetch('/api/account/delete', { method: 'DELETE' })
    await supabase.auth.signOut()
    router.push('/')
  }

  // ─── Derived ──────────────────────────────────────────────────────────────────

  const accent = accentFor(profileType)
  const initial = name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'

  const ALL_TABS = ([
    { id: 'profil' as Tab,          label: 'Mon profil',    show: true },
    { id: 'confidentialite' as Tab, label: 'Confidentialité', show: profileType === 'ado' },
    { id: 'notifications' as Tab,   label: 'Notifications', show: true },
    { id: 'public' as Tab,          label: 'Profil public', show: profileType === 'pro' },
    { id: 'abonnement' as Tab,      label: 'Abonnement',    show: profileType === 'pro' },
    { id: 'securite' as Tab,        label: 'Sécurité',      show: true },
  ] as { id: Tab; label: string; show: boolean }[]).filter(t => t.show)

  // ─── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: `3px solid ${accent.main}33`,
          borderTopColor: accent.main,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F7FF',
      fontFamily: 'DM Sans, system-ui, sans-serif',
      color: '#1a1a2e',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.3s ease; }
        * { box-sizing: border-box; }
        input, textarea, button { font-family: DM Sans, system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
      `}</style>

      {/* ── Sidebar + Main layout ── */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 260,
          flexShrink: 0,
          background: '#fff',
          borderRight: '1px solid rgba(0,0,0,0.07)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                boxShadow: `0 4px 16px ${accent.main}44`,
                flexShrink: 0,
              }} />
              <span style={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e', letterSpacing: '-0.02em' }}>
                MonEspace
              </span>
            </a>
          </div>

          {/* Avatar + name */}
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent.main}33` }}
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: `0 4px 20px ${accent.main}44`,
                }}>
                  {initial}
                </div>
              )}
              <button
                onClick={() => setShowAvatarInput(v => !v)}
                title="Changer l'avatar"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: accent.main,
                  border: '2px solid #fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  padding: 0,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>

            {showAvatarInput && (
              <div style={{ marginBottom: 10, animation: 'fadeIn 0.2s ease' }}>
                <input
                  type="url"
                  placeholder="URL de l'image…"
                  value={avatarInput}
                  onChange={e => setAvatarInput(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F8F7FF',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: 12,
                    outline: 'none',
                    color: '#1a1a2e',
                    marginBottom: 6,
                  }}
                />
                <button
                  onClick={handleApplyAvatar}
                  style={{
                    width: '100%',
                    background: accent.main,
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '7px',
                    cursor: 'pointer',
                  }}
                >
                  Appliquer
                </button>
              </div>
            )}

            <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a2e', marginBottom: 4 }}>
              {name || user?.email?.split('@')[0]}
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>{user?.email}</div>
            <span style={{
              display: 'inline-block',
              background: `${accent.main}18`,
              color: accent.main,
              borderRadius: 100,
              padding: '3px 12px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              {labelFor(profileType)}
            </span>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '16px 12px' }}>
            {ALL_TABS.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '11px 16px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? `${accent.main}14` : 'transparent',
                    color: active ? accent.main : '#64748B',
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    marginBottom: 2,
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{
                    width: 4,
                    height: 16,
                    borderRadius: 2,
                    background: active ? accent.main : 'transparent',
                    flexShrink: 0,
                    transition: 'background 0.18s ease',
                  }} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'transparent',
                color: '#64748B',
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto', background: '#F8F7FF', minWidth: 0 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* ── Tab: Mon profil ── */}
            {activeTab === 'profil' && (
              <div className="fade-in">
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 6 }}>Mon profil</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Personnalisez vos informations et préférences.</p>
                </div>

                {/* Informations générales */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <SectionTitle>Informations générales</SectionTitle>

                  {/* Avatar preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent.main}33` }}
                        onError={() => setAvatarUrl('')}
                      />
                    ) : (
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#fff',
                        boxShadow: `0 4px 16px ${accent.main}44`,
                        flexShrink: 0,
                      }}>
                        {initial}
                      </div>
                    )}
                    <div>
                      <button
                        onClick={() => setShowAvatarInput(v => !v)}
                        style={{
                          background: `${accent.main}14`,
                          border: `1px solid ${accent.main}33`,
                          color: accent.main,
                          borderRadius: 10,
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: 6,
                        }}
                      >
                        Changer la photo
                      </button>
                      <span style={{ fontSize: 12, color: '#64748B' }}>URL d'image ou sélectionner un fichier</span>
                    </div>
                  </div>

                  {showAvatarInput && (
                    <div style={{ marginBottom: 20, padding: 16, background: '#F8F7FF', borderRadius: 12, border: '1px solid rgba(0,0,0,0.07)' }}>
                      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Coller une URL d'image :</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={avatarInput}
                          onChange={e => setAvatarInput(e.target.value)}
                          style={{
                            flex: 1,
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.12)',
                            borderRadius: 8,
                            padding: '9px 12px',
                            fontSize: 13,
                            outline: 'none',
                            color: '#1a1a2e',
                          }}
                        />
                        <button
                          onClick={handleApplyAvatar}
                          style={{
                            background: accent.main,
                            border: 'none',
                            borderRadius: 8,
                            color: '#fff',
                            padding: '9px 18px',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          OK
                        </button>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748B', margin: '10px 0 6px' }}>Ou choisir un fichier :</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ fontSize: 13, color: '#64748B' }}
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const url = URL.createObjectURL(file)
                            setAvatarUrl(url)
                            setAvatarInput(url)
                            setShowAvatarInput(false)
                          }
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Prénom et nom</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Votre nom complet"
                        style={{
                          width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none',
                          color: '#1a1a2e', marginBottom: 16, transition: 'border-color 0.2s',
                        }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = accent.main + '66'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.1)'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        style={{
                          width: '100%', background: '#F1F0F9', border: '1px solid rgba(0,0,0,0.06)',
                          borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none',
                          color: '#64748B', marginBottom: 16, cursor: 'not-allowed',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Bio</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Quelques mots sur vous…"
                      rows={3}
                      style={{
                        width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none',
                        color: '#1a1a2e', resize: 'vertical', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = accent.main + '66'}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(0,0,0,0.1)'}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Ville / Région</label>
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Paris, France"
                        style={{
                          width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none',
                          color: '#1a1a2e', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = accent.main + '66'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.1)'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Téléphone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+33 6 00 00 00 00"
                        style={{
                          width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none',
                          color: '#1a1a2e', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = accent.main + '66'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.1)'}
                      />
                    </div>
                  </div>
                </div>

                {/* ADO-specific */}
                {profileType === 'ado' && (
                  <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                    <SectionTitle>Informations adolescent</SectionTitle>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>
                        Date de naissance {birthDateLocked && <span style={{ color: '#F97316', fontSize: 11 }}>(non modifiable après enregistrement)</span>}
                      </label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={e => setBirthDate(e.target.value)}
                        readOnly={birthDateLocked}
                        style={{
                          width: '100%', background: birthDateLocked ? '#F1F0F9' : '#F8F7FF',
                          border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10,
                          padding: '11px 14px', fontSize: 14, outline: 'none',
                          color: birthDateLocked ? '#64748B' : '#1a1a2e',
                          cursor: birthDateLocked ? 'not-allowed' : 'text',
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: '#F8F7FF',
                      borderRadius: 12,
                      border: '1px solid rgba(0,0,0,0.07)',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e', marginBottom: 3 }}>Check-in parental</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>Tes parents peuvent voir si tu utilises l'app régulièrement</div>
                      </div>
                      <button
                        onClick={() => setCheckinParental(v => !v)}
                        style={{
                          width: 48, height: 26, borderRadius: 13,
                          background: checkinParental ? '#7C3AED' : 'rgba(0,0,0,0.12)',
                          border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                          transition: 'background 0.25s ease',
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 3,
                          left: checkinParental ? 25 : 3,
                          width: 20, height: 20, borderRadius: '50%',
                          background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                          transition: 'left 0.25s ease',
                        }} />
                      </button>
                    </div>
                  </div>
                )}

                {/* PRO-specific */}
                {profileType === 'pro' && (
                  <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                    <SectionTitle>Informations professionnelles</SectionTitle>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Spécialité</label>
                      <select
                        value={specialty}
                        onChange={e => setSpecialty(e.target.value)}
                        style={{
                          width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none',
                          color: specialty ? '#1a1a2e' : '#64748B', cursor: 'pointer',
                        }}
                      >
                        <option value="">Sélectionner…</option>
                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Numéro ADELI</label>
                        <input
                          type="text"
                          value={adeliNumber}
                          onChange={e => setAdeliNumber(e.target.value)}
                          placeholder="123456789"
                          style={{
                            width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Années d'expérience</label>
                        <input
                          type="number"
                          value={yearsExp}
                          onChange={e => setYearsExp(e.target.value)}
                          placeholder="5"
                          min="0"
                          max="60"
                          style={{
                            width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Tranche d'âge acceptée</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {AGE_RANGES.map(ar => (
                          <button
                            key={ar}
                            onClick={() => setAgeRange(ar)}
                            style={{
                              border: `1px solid ${ageRange === ar ? accent.main : 'rgba(0,0,0,0.1)'}`,
                              background: ageRange === ar ? `${accent.main}14` : '#F8F7FF',
                              color: ageRange === ar ? accent.main : '#64748B',
                              borderRadius: 8, padding: '7px 14px',
                              cursor: 'pointer', fontSize: 13, fontWeight: ageRange === ar ? 600 : 400,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {ar}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 8, letterSpacing: '0.04em' }}>Types de consultation</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {CONSULTATION_TYPES.map(ct => {
                          const active = consultTypes.includes(ct)
                          return (
                            <button
                              key={ct}
                              onClick={() => setConsultTypes(prev => active ? prev.filter(p => p !== ct) : [...prev, ct])}
                              style={{
                                border: `1px solid ${active ? accent.main : 'rgba(0,0,0,0.1)'}`,
                                background: active ? `${accent.main}14` : '#F8F7FF',
                                color: active ? accent.main : '#64748B',
                                borderRadius: 8, padding: '7px 14px',
                                cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {ct}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 8, letterSpacing: '0.04em' }}>Fourchette de prix (€)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                          type="number"
                          value={priceMin}
                          onChange={e => setPriceMin(e.target.value)}
                          placeholder="Min"
                          style={{
                            width: 100, background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e',
                          }}
                        />
                        <span style={{ color: '#64748B' }}>–</span>
                        <input
                          type="number"
                          value={priceMax}
                          onChange={e => setPriceMax(e.target.value)}
                          placeholder="Max"
                          style={{
                            width: 100, background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e',
                          }}
                        />
                        <span style={{ color: '#64748B', fontSize: 14 }}>€ / séance</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSaveProfil}
                  disabled={savingProfil}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: savedProfil
                      ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                      : `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                    border: 'none',
                    borderRadius: 14,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: savingProfil ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: `0 4px 24px ${accent.main}44`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {savingProfil ? (
                    <span style={{
                      display: 'inline-block', width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                    }} />
                  ) : savedProfil ? '✓ Enregistré !' : 'Enregistrer les modifications'}
                </button>
              </div>
            )}

            {/* ── Tab: Confidentialité (ADO) ── */}
            {activeTab === 'confidentialite' && (
              <div className="fade-in">
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 6 }}>Confidentialité</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Gère ce que tes parents peuvent voir et tes liens familiaux.</p>
                </div>

                {/* Partage d'humeur */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <SectionTitle>Partage avec les parents</SectionTitle>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', background: '#F8F7FF', borderRadius: 12,
                    border: '1px solid rgba(0,0,0,0.07)',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e', marginBottom: 3 }}>Partager mon humeur avec mes parents</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>Tes parents verront ton humeur du jour dans leur tableau de bord</div>
                    </div>
                    <button
                      onClick={() => { setShareMood(v => !v); setTimeout(handleSaveMood, 100) }}
                      style={{
                        width: 48, height: 26, borderRadius: 13,
                        background: shareMood ? '#7C3AED' : 'rgba(0,0,0,0.12)',
                        border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                        transition: 'background 0.25s ease',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 3,
                        left: shareMood ? 25 : 3,
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        transition: 'left 0.25s ease',
                      }} />
                    </button>
                  </div>
                </div>

                {/* Parents liés */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <SectionTitle>Parents liés</SectionTitle>

                  {familyLinks.length === 0 ? (
                    <p style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: '20px 0' }}>
                      Aucun parent lié pour l'instant.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                      {familyLinks.map(link => (
                        <div key={link.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 16px', background: '#F8F7FF', borderRadius: 12,
                          border: '1px solid rgba(0,0,0,0.07)',
                        }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>
                              {link.parent_name || link.parent_email || 'Parent'}
                            </div>
                            <div style={{ fontSize: 12, marginTop: 3 }}>
                              <span style={{
                                background: link.status === 'active' ? '#22C55E18' : '#F9731618',
                                color: link.status === 'active' ? '#16A34A' : '#F97316',
                                borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                              }}>
                                {link.status === 'active' ? 'Actif' : link.status === 'pending' ? 'En attente' : link.status}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveParent(link.id)}
                            style={{
                              background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8,
                              color: '#DC2626', padding: '7px 14px', cursor: 'pointer', fontSize: 13,
                              fontWeight: 500, transition: 'all 0.2s ease',
                            }}
                          >
                            Retirer l'accès
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ajouter un parent */}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 10 }}>Ajouter un parent</p>
                    <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                      Demande à ton parent son code d'invitation dans son application.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={e => setInviteCode(e.target.value)}
                        placeholder="Code d'invitation…"
                        style={{
                          flex: 1, background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e',
                        }}
                      />
                      <button
                        onClick={handleAddParent}
                        disabled={addingParent || !inviteCode.trim()}
                        style={{
                          background: '#7C3AED', border: 'none', borderRadius: 10,
                          color: '#fff', padding: '11px 20px', cursor: 'pointer',
                          fontSize: 14, fontWeight: 600, opacity: !inviteCode.trim() ? 0.5 : 1,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {addingParent ? '…' : 'Envoyer'}
                      </button>
                    </div>
                    {inviteError && <p style={{ fontSize: 13, color: '#DC2626', marginTop: 8 }}>{inviteError}</p>}
                    {inviteSuccess && <p style={{ fontSize: 13, color: '#16A34A', marginTop: 8 }}>{inviteSuccess}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Notifications ── */}
            {activeTab === 'notifications' && (
              <div className="fade-in">
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 6 }}>Notifications</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Choisissez les alertes que vous souhaitez recevoir.</p>
                </div>

                <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <SectionTitle>Préférences de notifications</SectionTitle>

                  {[
                    {
                      label: 'Motivation quotidienne',
                      description: 'Reçois une citation inspirante chaque matin',
                      checked: notifMotivation,
                      onChange: setNotifMotivation,
                    },
                    {
                      label: 'Rappel journal',
                      description: 'Rappel quotidien pour écrire dans ton journal',
                      checked: notifJournal,
                      onChange: setNotifJournal,
                    },
                    {
                      label: 'Nouveaux messages',
                      description: 'Notification lors de la réception de nouveaux messages',
                      checked: notifMessages,
                      onChange: setNotifMessages,
                    },
                    {
                      label: 'Prochains rendez-vous',
                      description: 'Rappel 24h avant chaque rendez-vous',
                      checked: notifRdv,
                      onChange: setNotifRdv,
                    },
                  ].map((item, i, arr) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e', marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{item.description}</div>
                      </div>
                      <button
                        onClick={() => item.onChange(!item.checked)}
                        style={{
                          width: 48, height: 26, borderRadius: 13,
                          background: item.checked ? accent.main : 'rgba(0,0,0,0.12)',
                          border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                          transition: 'background 0.25s ease',
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: 3,
                          left: item.checked ? 25 : 3,
                          width: 20, height: 20, borderRadius: '50%',
                          background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                          transition: 'left 0.25s ease',
                        }} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveNotifs}
                  disabled={savingNotifs}
                  style={{
                    width: '100%', padding: '15px',
                    background: savedNotifs
                      ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                      : `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                    border: 'none', borderRadius: 14, color: '#fff',
                    fontSize: 15, fontWeight: 600, cursor: savingNotifs ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: `0 4px 24px ${accent.main}44`, transition: 'all 0.3s ease',
                  }}
                >
                  {savingNotifs ? (
                    <span style={{
                      display: 'inline-block', width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                    }} />
                  ) : savedNotifs ? '✓ Préférences enregistrées !' : 'Enregistrer les préférences'}
                </button>
              </div>
            )}

            {/* ── Tab: Profil public (PRO) ── */}
            {activeTab === 'public' && profileType === 'pro' && (
              <div className="fade-in">
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 6 }}>Profil public</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Aperçu de votre profil tel que les parents le voient.</p>
                </div>

                {/* Preview card */}
                <div style={{
                  background: `linear-gradient(135deg, ${accent.main}12, ${accent.second}08)`,
                  border: `1px solid ${accent.main}22`,
                  borderRadius: 20, padding: 28, marginBottom: 16,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                }}>
                  <SectionTitle>Aperçu pour les parents</SectionTitle>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent.main}33`, flexShrink: 0 }} onError={() => setAvatarUrl('')} />
                    ) : (
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 700, color: '#fff',
                        boxShadow: `0 4px 16px ${accent.main}44`,
                      }}>{initial}</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e', marginBottom: 4 }}>{name || 'Votre nom'}</div>
                      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>{specialty || 'Spécialité non définie'}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {ageRange && (
                          <span style={{ background: `${accent.main}14`, color: accent.main, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>
                            {ageRange}
                          </span>
                        )}
                        {location && (
                          <span style={{ background: 'rgba(0,0,0,0.05)', color: '#64748B', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>
                            📍 {location}
                          </span>
                        )}
                        {priceMin && priceMax && (
                          <span style={{ background: 'rgba(0,0,0,0.05)', color: '#64748B', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>
                            {priceMin}€ – {priceMax}€
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {(publicDesc || bio) && (
                    <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: '0 0 16px' }}>
                      {publicDesc || bio}
                    </p>
                  )}
                  {consultTypes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {consultTypes.map(ct => (
                        <span key={ct} style={{
                          background: `${accent.main}10`, color: accent.main,
                          border: `1px solid ${accent.main}22`,
                          borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 500,
                        }}>
                          {ct}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Edit public info */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <SectionTitle>Modifier le profil public</SectionTitle>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Description publique</label>
                    <textarea
                      value={publicDesc}
                      onChange={e => setPublicDesc(e.target.value)}
                      placeholder="Présentez-vous aux parents et adolescents qui vous cherchent…"
                      rows={4}
                      style={{
                        width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none',
                        color: '#1a1a2e', resize: 'vertical', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = accent.main + '66'}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(0,0,0,0.1)'}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 8, letterSpacing: '0.04em' }}>Types de consultation visibles</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {CONSULTATION_TYPES.map(ct => {
                        const active = publicConsultTypes.includes(ct)
                        return (
                          <button
                            key={ct}
                            onClick={() => setPublicConsultTypes(prev => active ? prev.filter(p => p !== ct) : [...prev, ct])}
                            style={{
                              border: `1px solid ${active ? accent.main : 'rgba(0,0,0,0.1)'}`,
                              background: active ? `${accent.main}14` : '#F8F7FF',
                              color: active ? accent.main : '#64748B',
                              borderRadius: 8, padding: '7px 14px',
                              cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {ct}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>Ville affichée publiquement</label>
                    <input
                      type="text"
                      value={publicLocation}
                      onChange={e => setPublicLocation(e.target.value)}
                      placeholder="Paris, France"
                      style={{
                        width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e',
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSavePublic}
                  disabled={savingPublic}
                  style={{
                    width: '100%', padding: '15px',
                    background: savedPublic
                      ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                      : `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                    border: 'none', borderRadius: 14, color: '#fff',
                    fontSize: 15, fontWeight: 600, cursor: savingPublic ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: `0 4px 24px ${accent.main}44`, transition: 'all 0.3s ease',
                  }}
                >
                  {savingPublic ? (
                    <span style={{
                      display: 'inline-block', width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                    }} />
                  ) : savedPublic ? '✓ Profil public mis à jour !' : 'Sauvegarder le profil public'}
                </button>
              </div>
            )}

            {/* ── Tab: Abonnement (PRO) ── */}
            {activeTab === 'abonnement' && profileType === 'pro' && (
              <div className="fade-in">
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 6 }}>Abonnement</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Gérez votre plan et votre facturation.</p>
                </div>

                {/* Current plan */}
                <div style={{
                  background: subscription
                    ? `linear-gradient(135deg, ${accent.main}14, ${accent.second}0a)`
                    : '#fff',
                  border: `1px solid ${subscription ? accent.main + '33' : 'rgba(0,0,0,0.07)'}`,
                  borderRadius: 20, padding: 28, marginBottom: 16,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                }}>
                  <SectionTitle>Plan actuel</SectionTitle>

                  {subscription ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 12,
                          background: `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 22, boxShadow: `0 4px 16px ${accent.main}44`,
                        }}>
                          ⭐
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e' }}>
                            {subscription.plan_name || subscription.plan_id || 'Pro'}
                          </div>
                          <div style={{ fontSize: 13, color: '#64748B' }}>
                            Renouvellement le{' '}
                            {subscription.current_period_end
                              ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                              : '—'}
                          </div>
                        </div>
                        <span style={{
                          marginLeft: 'auto',
                          background: '#22C55E18', color: '#16A34A',
                          borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 600,
                        }}>
                          Actif
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                        {[
                          { label: 'Montant', value: subscription.amount ? `${(subscription.amount / 100).toFixed(2)}€/mois` : '—' },
                          { label: 'Prochaine facture', value: subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR') : '—' },
                          { label: 'Statut', value: 'Actif' },
                        ].map(row => (
                          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ fontSize: 14, color: '#64748B' }}>{row.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                      <p style={{ fontSize: 15, color: '#1a1a2e', fontWeight: 500, marginBottom: 6 }}>Aucun abonnement actif</p>
                      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 0 }}>Souscrivez à un plan pour accéder à toutes les fonctionnalités professionnelles.</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    {subscription && (
                      <button
                        onClick={handlePortal}
                        disabled={loadingPortal}
                        style={{
                          flex: 1, padding: '13px',
                          background: `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                          border: 'none', borderRadius: 12, color: '#fff',
                          fontSize: 14, fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          boxShadow: `0 4px 16px ${accent.main}44`,
                        }}
                      >
                        {loadingPortal ? (
                          <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                            Gérer via Stripe
                          </>
                        )}
                      </button>
                    )}
                    {!subscription && (
                      <a href="/#plans" style={{ textDecoration: 'none', flex: 1 }}>
                        <button style={{
                          width: '100%', padding: '13px',
                          background: `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                          border: 'none', borderRadius: 12, color: '#fff',
                          fontSize: 14, fontWeight: 600, cursor: 'pointer',
                          boxShadow: `0 4px 16px ${accent.main}44`,
                        }}>
                          Voir les plans
                        </button>
                      </a>
                    )}
                    {subscription && (
                      <button
                        onClick={handlePortal}
                        style={{
                          padding: '13px 20px',
                          background: 'transparent',
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 12, color: '#64748B',
                          fontSize: 14, cursor: 'pointer',
                        }}
                      >
                        Changer de plan
                      </button>
                    )}
                  </div>
                </div>

                {/* Billing history */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <SectionTitle>Historique de facturation</SectionTitle>
                  {[
                    { date: new Date(Date.now() - 30 * 86400000).toLocaleDateString('fr-FR'), amount: subscription?.amount ? `${(subscription.amount / 100).toFixed(2)}€` : '—', status: 'Payé' },
                    { date: new Date(Date.now() - 60 * 86400000).toLocaleDateString('fr-FR'), amount: subscription?.amount ? `${(subscription.amount / 100).toFixed(2)}€` : '—', status: 'Payé' },
                    { date: new Date(Date.now() - 90 * 86400000).toLocaleDateString('fr-FR'), amount: subscription?.amount ? `${(subscription.amount / 100).toFixed(2)}€` : '—', status: 'Payé' },
                  ].map((inv, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 0', borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>Abonnement Pro</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{inv.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{inv.amount}</div>
                        <span style={{ fontSize: 11, background: '#22C55E18', color: '#16A34A', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!subscription && (
                    <p style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: '16px 0' }}>
                      Aucune facture disponible.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab: Sécurité ── */}
            {activeTab === 'securite' && (
              <div className="fade-in">
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0, marginBottom: 6 }}>Sécurité</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Gérez votre mot de passe et vos données personnelles.</p>
                </div>

                {/* Change password */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <SectionTitle>Changer le mot de passe</SectionTitle>

                  {['current', 'new', 'confirm'].map(key => {
                    const map: Record<string, { label: string; value: string; setter: (v: string) => void }> = {
                      current: { label: 'Mot de passe actuel', value: currentPwd, setter: setCurrentPwd },
                      new:     { label: 'Nouveau mot de passe', value: newPwd, setter: setNewPwd },
                      confirm: { label: 'Confirmer le nouveau mot de passe', value: confirmPwd, setter: setConfirmPwd },
                    }
                    const { label, value, setter } = map[key]
                    return (
                      <div key={key} style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }}>{label}</label>
                        <input
                          type="password"
                          value={value}
                          onChange={e => setter(e.target.value)}
                          placeholder="••••••••"
                          style={{
                            width: '100%', background: '#F8F7FF', border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none',
                            color: '#1a1a2e', transition: 'border-color 0.2s',
                          }}
                          onFocus={e => (e.target as HTMLInputElement).style.borderColor = accent.main + '66'}
                          onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.1)'}
                        />
                      </div>
                    )
                  })}

                  {pwdError && (
                    <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                      <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>{pwdError}</p>
                    </div>
                  )}
                  {pwdSuccess && (
                    <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                      <p style={{ fontSize: 13, color: '#16A34A', margin: 0 }}>{pwdSuccess}</p>
                    </div>
                  )}

                  <button
                    onClick={handleChangePwd}
                    disabled={savingPwd}
                    style={{
                      width: '100%', padding: '13px',
                      background: `linear-gradient(135deg, ${accent.main}, ${accent.second})`,
                      border: 'none', borderRadius: 12, color: '#fff',
                      fontSize: 14, fontWeight: 600, cursor: savingPwd ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 16px ${accent.main}44`,
                    }}
                  >
                    {savingPwd ? (
                      <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    ) : 'Mettre à jour le mot de passe'}
                  </button>
                </div>

                {/* RGPD */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <SectionTitle>Données personnelles (RGPD)</SectionTitle>
                  <p style={{ fontSize: 14, color: '#64748B', marginBottom: 16, lineHeight: 1.7 }}>
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous avez le droit d'accéder à l'ensemble des données vous concernant et de les télécharger.
                  </p>
                  <button
                    onClick={handleDownloadData}
                    style={{
                      width: '100%', padding: '13px',
                      background: 'transparent',
                      border: `1px solid ${accent.main}44`,
                      borderRadius: 12, color: accent.main,
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = `${accent.main}10`
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger mes données (RGPD)
                  </button>
                </div>

                {/* Delete account */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #FCA5A533' }}>
                  <SectionTitle>Zone de danger</SectionTitle>
                  <p style={{ fontSize: 14, color: '#64748B', marginBottom: 16, lineHeight: 1.7 }}>
                    La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
                  </p>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    style={{
                      width: '100%', padding: '13px',
                      background: 'transparent',
                      border: '1px solid #FCA5A5',
                      borderRadius: 12, color: '#DC2626',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Delete confirmation dialog ── */}
      {showDeleteDialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, padding: 32,
            maxWidth: 440, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', textAlign: 'center', marginBottom: 8 }}>
              Supprimer mon compte
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
              Cette action est irréversible. Toutes vos données, messages et informations seront définitivement supprimés.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#64748B', marginBottom: 8 }}>
                Tapez <strong style={{ color: '#DC2626' }}>SUPPRIMER</strong> pour confirmer :
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                style={{
                  width: '100%', background: '#F8F7FF',
                  border: `1px solid ${deleteConfirmText === 'SUPPRIMER' ? '#FCA5A5' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText('') }}
                style={{
                  flex: 1, padding: '13px', background: '#F8F7FF',
                  border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12,
                  color: '#64748B', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER' || deletingAccount}
                style={{
                  flex: 1, padding: '13px',
                  background: deleteConfirmText === 'SUPPRIMER' ? '#DC2626' : '#F1F0F9',
                  border: 'none', borderRadius: 12,
                  color: deleteConfirmText === 'SUPPRIMER' ? '#fff' : '#64748B',
                  fontSize: 14, fontWeight: 600,
                  cursor: deleteConfirmText === 'SUPPRIMER' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {deletingAccount ? (
                  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
