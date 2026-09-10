'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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

const T = '#30B4A7'
const DARK = '#082827'

const CONSULTATION_TYPES = [
  'Individuel adolescent',
  'Familial',
  'Parent-enfant',
  "Groupe d'adolescents",
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

const labelFor = (type: ProfileType) => {
  if (type === 'ado') return 'Adolescent'
  if (type === 'parent') return 'Parent'
  if (type === 'pro') return 'Professionnel'
  return ''
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [profileType, setProfileType] = useState<ProfileType>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('profil')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Tab: Mon profil
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
  const [specialty, setSpecialty] = useState('')
  const [adeliNumber, setAdeliNumber] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [consultTypes, setConsultTypes] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [savingProfil, setSavingProfil] = useState(false)
  const [savedProfil, setSavedProfil] = useState(false)

  // Tab: Confidentialité
  const [shareMood, setShareMood] = useState(false)
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>([])
  const [inviteCode, setInviteCode] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [addingParent, setAddingParent] = useState(false)

  // Tab: Notifications
  const [notifMotivation, setNotifMotivation] = useState(true)
  const [notifJournal, setNotifJournal] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifRdv, setNotifRdv] = useState(true)
  const [savingNotifs, setSavingNotifs] = useState(false)
  const [savedNotifs, setSavedNotifs] = useState(false)

  // Tab: Profil public (PRO)
  const [publicDesc, setPublicDesc] = useState('')
  const [publicConsultTypes, setPublicConsultTypes] = useState<string[]>([])
  const [publicLocation, setPublicLocation] = useState('')
  const [savingPublic, setSavingPublic] = useState(false)
  const [savedPublic, setSavedPublic] = useState(false)

  // Tab: Abonnement (PRO)
  const [subscription, setSubscription] = useState<any>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  // Active challenges (ado)
  const [activeChallenges, setActiveChallenges] = useState<any[]>([])
  const [journalCount, setJournalCount] = useState(0)

  // Tab: Sécurité
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => { loadAll() }, []) // eslint-disable-line

  async function loadAll() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { router.push('/'); return }
    setUser(u)

    const [
      { data: prof },
      { data: sub },
      { data: notifPrefs },
      { data: links },
      { data: challenges },
      { count: jCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', u.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', u.id).eq('status', 'active').maybeSingle(),
      supabase.from('notification_preferences').select('*').eq('user_id', u.id).maybeSingle(),
      supabase.from('family_links').select('*').eq('ado_id', u.id),
      supabase.from('challenges').select('id,title,category,completed,total_streak,target_date').eq('user_id', u.id).eq('completed', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('journal_entries').select('id', { count: 'exact', head: true }).eq('user_id', u.id),
    ])
    if (challenges) setActiveChallenges(challenges)
    if (jCount !== null) setJournalCount(jCount)

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
      if (prof.birth_date) { setBirthDate(prof.birth_date); setBirthDateLocked(true) }
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
    if (links) setFamilyLinks(links as FamilyLink[])
    setLoading(false)
  }

  async function handleSaveProfil() {
    if (!user) return
    setSavingProfil(true)
    const body: Record<string, any> = { name, bio, location, phone, avatar_url: avatarUrl, checkin_parental: checkinParental, share_mood: shareMood }
    if (!birthDateLocked && birthDate) body.birth_date = birthDate
    if (profileType === 'pro') {
      body.specialty = specialty
      body.adeli_number = adeliNumber
      body.years_experience = yearsExp ? parseInt(yearsExp) : null
      body.age_range = ageRange
      body.consultation_types = consultTypes
      body.price_min = priceMin ? parseInt(priceMin) : null
      body.price_max = priceMax ? parseInt(priceMax) : null
    }
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const result = await response.json().catch(() => ({}))
      setSavingProfil(false)
      alert(result.error || 'Impossible de sauvegarder le profil.')
      return
    }
    if (birthDate && !birthDateLocked) setBirthDateLocked(true)
    setSavingProfil(false)
    setSavedProfil(true)
    setTimeout(() => setSavedProfil(false), 2500)
  }

  async function handleApplyAvatar() {
    setAvatarUrl(avatarInput)
    setShowAvatarInput(false)
  }

  async function handleAvatarUpload(file: File) {
    if (!user) return
    if (file.size > 5 * 1024 * 1024) {
      alert('La photo ne doit pas depasser 5 Mo.')
      return
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${user.id}/avatar.${extension}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
      contentType: file.type,
    })
    if (error) {
      alert(error.message || 'Impossible d’envoyer la photo.')
      return
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${data.publicUrl}?v=${Date.now()}`
    setAvatarUrl(url)
    setAvatarInput(url)
    setShowAvatarInput(false)
  }

  async function handleSaveNotifs() {
    if (!user) return
    setSavingNotifs(true)
    await supabase.from('notification_preferences').upsert({ user_id: user.id, motivation: notifMotivation, journal: notifJournal, messages: notifMessages, rdv: notifRdv, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
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
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('/api/link-family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
      body: JSON.stringify({ action: 'claim', invite_code: inviteCode.trim() }),
    })
    const data = await response.json().catch(() => null)
    setAddingParent(false)
    if (!response.ok) {
      setInviteError('Code invalide ou déjà utilisé. Vérifie avec tes parents.')
    } else {
      setInviteSuccess('Demande envoyée ! Ton parent recevra une notification.')
      setInviteCode('')
      await loadAll()
    }
  }

  async function handleSavePublic() {
    if (!user) return
    setSavingPublic(true)
    await supabase.from('profiles').update({ public_description: publicDesc, public_consultation_types: publicConsultTypes, public_location: publicLocation }).eq('id', user.id)
    setSavingPublic(false)
    setSavedPublic(true)
    setTimeout(() => setSavedPublic(false), 2500)
  }

  async function handlePortal() {
    setLoadingPortal(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoadingPortal(false)
  }

  async function handleChangePwd() {
    setPwdError('')
    setPwdSuccess('')
    if (!newPwd || !confirmPwd) { setPwdError('Remplis tous les champs.'); return }
    if (newPwd !== confirmPwd) { setPwdError('Les mots de passe ne correspondent pas.'); return }
    if (newPwd.length < 8) { setPwdError('Le mot de passe doit faire au moins 8 caractères.'); return }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSavingPwd(false)
    if (error) {
      setPwdError(error.message || 'Erreur lors du changement de mot de passe.')
    } else {
      setPwdSuccess('Mot de passe mis à jour avec succès !')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
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
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('/api/account/delete', {
      method: 'DELETE',
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    })
    if (!response.ok) {
      setDeletingAccount(false)
      alert('Impossible de supprimer le compte pour le moment.')
      return
    }
    await supabase.auth.signOut()
    router.push('/')
  }

  const initial = name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'

  const ALL_TABS = ([
    { id: 'profil' as Tab,          label: 'Mon profil',    show: true },
    { id: 'confidentialite' as Tab, label: 'Confidentialité', show: profileType === 'ado' },
    { id: 'notifications' as Tab,   label: 'Notifications', show: true },
    { id: 'public' as Tab,          label: 'Profil public', show: profileType === 'pro' },
    { id: 'abonnement' as Tab,      label: 'Abonnement',    show: profileType === 'pro' },
    { id: 'securite' as Tab,        label: 'Sécurité',      show: true },
  ] as { id: Tab; label: string; show: boolean }[]).filter(t => t.show)

  // Shared styles helpers
  const card = { background: '#fff', borderRadius: 20, padding: 24, marginBottom: 16, border: '1px solid #daeeed', boxShadow: '0 2px 8px rgba(48,180,167,0.05)' }
  const sectionLabel = { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: T, fontWeight: 700, marginBottom: 16 }
  const fieldLabel = { display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em' }
  const fieldInput = { width: '100%', background: '#f9fffe', border: '1px solid #daeeed', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: DARK, boxSizing: 'border-box' as const, fontFamily: 'Inter,sans-serif', transition: 'border-color 0.2s' }
  const saveBtn = (saving: boolean, saved: boolean) => ({
    width: '100%', padding: '14px', background: saved ? '#22c55e' : T, border: 'none', borderRadius: 100, color: '#fff', fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 16px ${T}40`, transition: 'all 0.3s ease', marginTop: 8, fontFamily: 'Inter,sans-serif'
  })
  const spinner = { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }
  const toggleBtn = (checked: boolean) => ({
    width: 48, height: 26, borderRadius: 13, background: checked ? T : 'rgba(0,0,0,0.12)', border: 'none', cursor: 'pointer', position: 'relative' as const, flexShrink: 0, transition: 'background 0.25s ease'
  })
  const toggleDot = (checked: boolean) => ({
    position: 'absolute' as const, top: 3, left: checked ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.25s ease'
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5fafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${T}33`, borderTopColor: T, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5fafa', fontFamily: 'Inter,Outfit,sans-serif', color: DARK }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .fade-in { animation: fadeIn 0.3s ease; }
        * { box-sizing: border-box; }
        input,textarea,button,select { font-family: Inter,Outfit,sans-serif; }
        input:focus, textarea:focus, select:focus { border-color: ${T} !important; box-shadow: 0 0 0 3px ${T}20 !important; outline: none !important; }
        @media(max-width:640px){
          .profile-sidebar { display: none !important; }
          .profile-sidebar.open { display: flex !important; position: fixed; inset: 0; z-index: 100; background: rgba(8,40,39,0.5); }
          .profile-sidebar-inner { width: 280px !important; height: 100vh; overflow-y: auto; }
          .profile-layout { flex-direction: column !important; }
          .profile-main { padding: 16px 12px 80px !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .pro-price-row { flex-direction: column !important; }
        }
      `}</style>

      {/* Top nav — mobile only */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,250,250,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #daeeed', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/logo.png" width={34} height={34} alt="Capsule" style={{ borderRadius: 8 }} />
          </Link>
          <Link href={profileType ? `/dashboard/${profileType}` : '/'} style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: T, fontWeight: 600, fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Retour
          </Link>
        </div>
        <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, color: DARK }}>Paramètres</span>
        {/* Mobile menu toggle */}
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'none' }} className="mobile-menu-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <style>{`@media(max-width:640px){.mobile-menu-btn{display:block!important;}}`}</style>
      </nav>

      {/* Mobile tab bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #daeeed', overflowX: 'auto', display: 'none' }} className="mobile-tabs">
        <div style={{ display: 'flex', gap: 0, padding: '0', width: 'max-content' }}>
          {ALL_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '12px 16px', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? T : 'transparent'}`, background: 'transparent', color: activeTab === tab.id ? T : '#64748B', fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:640px){.mobile-tabs{display:block!important;}}`}</style>

      {/* Layout */}
      <div className="profile-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>

        {/* Sidebar */}
        <aside className="profile-sidebar" style={{ width: 260, flexShrink: 0, background: '#fff', borderRight: '1px solid #daeeed', display: 'flex', flexDirection: 'column', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
          <div className="profile-sidebar-inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Avatar + name */}
            <div style={{ padding: '24px', borderBottom: '1px solid #daeeed', textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${T}33` }} onError={() => setAvatarUrl('')} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: T, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', boxShadow: `0 4px 16px ${T}44` }}>
                    {initial}
                  </div>
                )}
                <button onClick={() => setShowAvatarInput(v => !v)} title="Changer l'avatar"
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: T, border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, padding: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
              {showAvatarInput && (
                <div style={{ marginBottom: 10, animation: 'fadeIn 0.2s ease' }}>
                  <input type="url" placeholder="URL de l'image…" value={avatarInput} onChange={e => setAvatarInput(e.target.value)}
                    style={{ width: '100%', background: '#f9fffe', border: '1px solid #daeeed', borderRadius: 8, padding: '8px 10px', fontSize: 12, outline: 'none', color: DARK, marginBottom: 6 }} />
                  <button onClick={handleApplyAvatar} style={{ width: '100%', background: T, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, padding: '7px', cursor: 'pointer' }}>Appliquer</button>
                </div>
              )}
              <div style={{ fontWeight: 600, fontSize: 15, color: DARK, marginBottom: 4 }}>{name || user?.email?.split('@')[0]}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>{user?.email}</div>
              <span style={{ display: 'inline-block', background: `${T}18`, color: T, borderRadius: 100, padding: '3px 12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>{labelFor(profileType)}</span>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: '16px 12px' }}>
              <Link href="/appointments"
                style={{ width: '100%', padding: '11px 16px', borderRadius: 10, color: '#64748B', fontSize: 14, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <span style={{ width: 4, height: 16 }} />Agenda
              </Link>
              <Link href="/messages"
                style={{ width: '100%', padding: '11px 16px', borderRadius: 10, color: '#64748B', fontSize: 14, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <span style={{ width: 4, height: 16 }} />Messages
              </Link>
              {ALL_TABS.map(tab => {
                const active = activeTab === tab.id
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ width: '100%', textAlign: 'left', padding: '11px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: active ? `${T}14` : 'transparent', color: active ? T : '#64748B', fontSize: 14, fontWeight: active ? 600 : 400, marginBottom: 2, transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 4, height: 16, borderRadius: 2, background: active ? T : 'transparent', flexShrink: 0, transition: 'background 0.18s ease' }} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid #daeeed' }}>
              <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                style={{ width: '100%', padding: '11px 16px', borderRadius: 10, border: '1px solid #daeeed', background: 'transparent', color: '#64748B', fontSize: 14, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Se déconnecter
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="profile-main" style={{ flex: 1, padding: '32px 32px 60px', overflowY: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* ── Tab: Mon profil ── */}
            {activeTab === 'profil' && (
              <div className="fade-in">
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: 0, marginBottom: 6, fontFamily: 'Outfit,sans-serif' }}>Mon profil</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Personnalisez vos informations et préférences.</p>
                </div>

                <div style={card}>
                  <p style={sectionLabel}>Informations générales</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${T}33`, flexShrink: 0 }} onError={() => setAvatarUrl('')} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: T, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', boxShadow: `0 4px 16px ${T}44`, flexShrink: 0 }}>{initial}</div>
                    )}
                    <div>
                      <button onClick={() => setShowAvatarInput(v => !v)}
                        style={{ background: `${T}14`, border: `1px solid ${T}33`, color: T, borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        Changer la photo
                      </button>
                      <span style={{ fontSize: 12, color: '#64748B' }}>URL d'image ou sélectionner un fichier</span>
                    </div>
                  </div>

                  {showAvatarInput && (
                    <div style={{ marginBottom: 20, padding: 16, background: '#f9fffe', borderRadius: 12, border: '1px solid #daeeed' }}>
                      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Coller une URL d'image :</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="url" placeholder="https://..." value={avatarInput} onChange={e => setAvatarInput(e.target.value)} style={{ flex: 1, background: '#fff', border: '1px solid #daeeed', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', color: DARK }} />
                        <button onClick={handleApplyAvatar} style={{ background: T, border: 'none', borderRadius: 8, color: '#fff', padding: '9px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>OK</button>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748B', margin: '10px 0 6px' }}>Ou choisir un fichier :</p>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ fontSize: 13, color: '#64748B' }} onChange={e => { const file = e.target.files?.[0]; if (file) void handleAvatarUpload(file) }} />
                    </div>
                  )}

                  <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={fieldLabel}>Prénom et nom</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom complet" style={{ ...fieldInput, marginBottom: 0 }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = T}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#daeeed'} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={fieldLabel}>Email</label>
                      <input type="email" value={user?.email || ''} readOnly style={{ ...fieldInput, background: '#f0f4f8', cursor: 'not-allowed', color: '#64748B', marginBottom: 0 }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={fieldLabel}>Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Quelques mots sur vous…" rows={3}
                      style={{ ...fieldInput, resize: 'vertical' }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = T}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#daeeed'} />
                  </div>

                  <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    <div>
                      <label style={fieldLabel}>Ville / Région</label>
                      <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Paris, France" style={fieldInput}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = T}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#daeeed'} />
                    </div>
                    <div>
                      <label style={fieldLabel}>Téléphone</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 00 00 00 00" style={fieldInput}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = T}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#daeeed'} />
                    </div>
                  </div>
                </div>

                {/* ADO-specific */}
                {profileType === 'ado' && (
                  <div style={card}>
                    <p style={sectionLabel}>Informations adolescent</p>
                    <div style={{ marginBottom: 16 }}>
                      <label style={fieldLabel}>
                        Date de naissance {birthDateLocked && <span style={{ color: '#f97316', fontSize: 11 }}>(non modifiable après enregistrement)</span>}
                      </label>
                      <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} readOnly={birthDateLocked}
                        style={{ ...fieldInput, background: birthDateLocked ? '#f0f4f8' : '#f9fffe', cursor: birthDateLocked ? 'not-allowed' : 'text', color: birthDateLocked ? '#64748B' : DARK }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f9fffe', borderRadius: 12, border: '1px solid #daeeed' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: DARK, marginBottom: 3 }}>Check-in parental</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>Tes parents peuvent voir si tu utilises l'app régulièrement</div>
                      </div>
                      <button onClick={() => setCheckinParental(v => !v)} style={toggleBtn(checkinParental)}>
                        <div style={toggleDot(checkinParental)} />
                      </button>
                    </div>
                  </div>
                )}

                {/* PRO-specific */}
                {profileType === 'pro' && (
                  <div style={card}>
                    <p style={sectionLabel}>Informations professionnelles</p>
                    <div style={{ marginBottom: 16 }}>
                      <label style={fieldLabel}>Spécialité</label>
                      <select value={specialty} onChange={e => setSpecialty(e.target.value)}
                        style={{ ...fieldInput, cursor: 'pointer' }}>
                        <option value="">Sélectionner…</option>
                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginBottom: 16 }}>
                      <div>
                        <label style={fieldLabel}>Numéro ADELI</label>
                        <input type="text" value={adeliNumber} onChange={e => setAdeliNumber(e.target.value)} placeholder="123456789" style={fieldInput} />
                      </div>
                      <div>
                        <label style={fieldLabel}>Années d'expérience</label>
                        <input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="5" min="0" max="60" style={fieldInput} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={fieldLabel}>Tranche d'âge acceptée</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {AGE_RANGES.map(ar => (
                          <button key={ar} onClick={() => setAgeRange(ar)}
                            style={{ border: `1px solid ${ageRange === ar ? T : '#daeeed'}`, background: ageRange === ar ? `${T}14` : '#f9fffe', color: ageRange === ar ? T : '#64748B', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: ageRange === ar ? 600 : 400, transition: 'all 0.2s' }}>
                            {ar}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={fieldLabel}>Types de consultation</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {CONSULTATION_TYPES.map(ct => {
                          const active = consultTypes.includes(ct)
                          return (
                            <button key={ct} onClick={() => setConsultTypes(prev => active ? prev.filter(p => p !== ct) : [...prev, ct])}
                              style={{ border: `1px solid ${active ? T : '#daeeed'}`, background: active ? `${T}14` : '#f9fffe', color: active ? T : '#64748B', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.2s' }}>
                              {ct}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={fieldLabel}>Fourchette de prix (€)</label>
                      <div className="pro-price-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Min" style={{ ...fieldInput, width: 100 }} />
                        <span style={{ color: '#64748B' }}>–</span>
                        <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Max" style={{ ...fieldInput, width: 100 }} />
                        <span style={{ color: '#64748B', fontSize: 14 }}>€ / séance</span>
                      </div>
                    </div>
                  </div>
                )}

                {profileType === 'ado' && (
                  <div style={{ marginTop: 28 }}>
                    <p style={sectionLabel}>Mon activité</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                      <div style={{ background: `${T}10`, borderRadius: 12, padding: '14px 16px', border: `1px solid ${T}30` }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: T }}>{activeChallenges.length}</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Défis actifs</div>
                      </div>
                      <div style={{ background: `${T}10`, borderRadius: 12, padding: '14px 16px', border: `1px solid ${T}30` }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: T }}>{journalCount}</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Entrées journal</div>
                      </div>
                    </div>
                    {activeChallenges.length > 0 && (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 10 }}>Défis en cours</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {activeChallenges.map(c => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fffe', borderRadius: 10, padding: '10px 14px', border: '1px solid #daeeed' }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T, flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                                <div style={{ fontSize: 11, color: '#64748B' }}>{c.category}{c.total_streak > 0 ? ` · ${c.total_streak} jours` : ''}</div>
                              </div>
                              <Link href="/challenges" style={{ fontSize: 12, color: T, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>Voir</Link>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button onClick={handleSaveProfil} disabled={savingProfil} style={saveBtn(savingProfil, savedProfil)}>
                  {savingProfil ? <span style={spinner} /> : savedProfil ? 'Enregistré !' : 'Enregistrer les modifications'}
                </button>
              </div>
            )}

            {/* ── Tab: Confidentialité ── */}
            {activeTab === 'confidentialite' && (
              <div className="fade-in">
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: 0, marginBottom: 6, fontFamily: 'Outfit,sans-serif' }}>Confidentialité</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Gère ce que tes parents peuvent voir et tes liens familiaux.</p>
                </div>

                <div style={card}>
                  <p style={sectionLabel}>Partage avec les parents</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f9fffe', borderRadius: 12, border: '1px solid #daeeed' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: DARK, marginBottom: 3 }}>Partager mon humeur avec mes parents</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>Tes parents verront ton humeur du jour dans leur tableau de bord</div>
                    </div>
                    <button onClick={() => { setShareMood(v => !v); setTimeout(handleSaveMood, 100) }} style={toggleBtn(shareMood)}>
                      <div style={toggleDot(shareMood)} />
                    </button>
                  </div>
                </div>

                <div style={card}>
                  <p style={sectionLabel}>Parents liés</p>
                  {familyLinks.length === 0 ? (
                    <p style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: '20px 0' }}>Aucun parent lié pour l'instant.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                      {familyLinks.map(link => (
                        <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f9fffe', borderRadius: 12, border: '1px solid #daeeed', flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{link.parent_name || link.parent_email || 'Parent'}</div>
                            <span style={{ background: link.status === 'active' ? '#f0fdf4' : '#fffbeb', color: link.status === 'active' ? '#16a34a' : '#d97706', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                              {link.status === 'active' ? 'Actif' : link.status === 'pending' ? 'En attente' : link.status}
                            </span>
                          </div>
                          <button onClick={() => handleRemoveParent(link.id)} style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                            Retirer l'accès
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #daeeed', paddingTop: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 8 }}>Ajouter un parent</p>
                    <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>Demande à ton parent son code d'invitation dans son application.</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Code d'invitation…"
                        style={{ flex: 1, minWidth: 160, ...fieldInput }} />
                      <button onClick={handleAddParent} disabled={addingParent || !inviteCode.trim()}
                        style={{ background: T, border: 'none', borderRadius: 100, color: '#fff', padding: '11px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: !inviteCode.trim() ? 0.5 : 1 }}>
                        {addingParent ? '…' : 'Envoyer'}
                      </button>
                    </div>
                    {inviteError && <p style={{ fontSize: 13, color: '#dc2626', marginTop: 8 }}>{inviteError}</p>}
                    {inviteSuccess && <p style={{ fontSize: 13, color: '#16a34a', marginTop: 8 }}>{inviteSuccess}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Notifications ── */}
            {activeTab === 'notifications' && (
              <div className="fade-in">
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: 0, marginBottom: 6, fontFamily: 'Outfit,sans-serif' }}>Notifications</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Choisissez les alertes que vous souhaitez recevoir.</p>
                </div>

                <div style={card}>
                  <p style={sectionLabel}>Préférences de notifications</p>
                  {[
                    { label: 'Motivation quotidienne', description: 'Reçois une citation inspirante chaque matin', checked: notifMotivation, onChange: setNotifMotivation },
                    { label: 'Rappel journal', description: 'Rappel quotidien pour écrire dans ton journal', checked: notifJournal, onChange: setNotifJournal },
                    { label: 'Nouveaux messages', description: 'Notification lors de la réception de nouveaux messages', checked: notifMessages, onChange: setNotifMessages },
                    { label: 'Prochains rendez-vous', description: 'Rappel 24h avant chaque rendez-vous', checked: notifRdv, onChange: setNotifRdv },
                  ].map((item, i, arr) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < arr.length - 1 ? '1px solid #daeeed' : 'none' }}>
                      <div style={{ flex: 1, paddingRight: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: DARK, marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{item.description}</div>
                      </div>
                      <button onClick={() => item.onChange(!item.checked)} style={toggleBtn(item.checked)}>
                        <div style={toggleDot(item.checked)} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveNotifs} disabled={savingNotifs} style={saveBtn(savingNotifs, savedNotifs)}>
                  {savingNotifs ? <span style={spinner} /> : savedNotifs ? 'Préférences enregistrées !' : 'Enregistrer les préférences'}
                </button>
              </div>
            )}

            {/* ── Tab: Profil public (PRO) ── */}
            {activeTab === 'public' && profileType === 'pro' && (
              <div className="fade-in">
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: 0, marginBottom: 6, fontFamily: 'Outfit,sans-serif' }}>Profil public</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Aperçu de votre profil tel que les parents le voient.</p>
                </div>

                <div style={{ ...card, background: `${T}08`, border: `1px solid ${T}22` }}>
                  <p style={sectionLabel}>Aperçu pour les parents</p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${T}33`, flexShrink: 0 }} onError={() => setAvatarUrl('')} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: '50%', flexShrink: 0, background: T, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff' }}>{initial}</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: DARK, marginBottom: 4, fontFamily: 'Outfit,sans-serif' }}>{name || 'Votre nom'}</div>
                      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>{specialty || 'Spécialité non définie'}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {ageRange && <span style={{ background: `${T}14`, color: T, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>{ageRange}</span>}
                        {location && <span style={{ background: 'rgba(0,0,0,0.05)', color: '#64748B', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>{location}</span>}
                        {priceMin && priceMax && <span style={{ background: 'rgba(0,0,0,0.05)', color: '#64748B', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>{priceMin}€ – {priceMax}€</span>}
                      </div>
                    </div>
                  </div>
                  {(publicDesc || bio) && <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: '0 0 16px' }}>{publicDesc || bio}</p>}
                  {consultTypes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {consultTypes.map(ct => (
                        <span key={ct} style={{ background: `${T}10`, color: T, border: `1px solid ${T}22`, borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 500 }}>{ct}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={card}>
                  <p style={sectionLabel}>Modifier le profil public</p>
                  <div style={{ marginBottom: 16 }}>
                    <label style={fieldLabel}>Description publique</label>
                    <textarea value={publicDesc} onChange={e => setPublicDesc(e.target.value)} placeholder="Présentez-vous aux parents et adolescents…" rows={4}
                      style={{ ...fieldInput, resize: 'vertical' }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = T}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#daeeed'} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={fieldLabel}>Types de consultation visibles</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {CONSULTATION_TYPES.map(ct => {
                        const active = publicConsultTypes.includes(ct)
                        return (
                          <button key={ct} onClick={() => setPublicConsultTypes(prev => active ? prev.filter(p => p !== ct) : [...prev, ct])}
                            style={{ border: `1px solid ${active ? T : '#daeeed'}`, background: active ? `${T}14` : '#f9fffe', color: active ? T : '#64748B', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.2s' }}>
                            {ct}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label style={fieldLabel}>Ville affichée publiquement</label>
                    <input type="text" value={publicLocation} onChange={e => setPublicLocation(e.target.value)} placeholder="Paris, France" style={fieldInput} />
                  </div>
                </div>

                <button onClick={handleSavePublic} disabled={savingPublic} style={saveBtn(savingPublic, savedPublic)}>
                  {savingPublic ? <span style={spinner} /> : savedPublic ? 'Profil public mis à jour !' : 'Sauvegarder le profil public'}
                </button>
              </div>
            )}

            {/* ── Tab: Abonnement (PRO) ── */}
            {activeTab === 'abonnement' && profileType === 'pro' && (
              <div className="fade-in">
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: 0, marginBottom: 6, fontFamily: 'Outfit,sans-serif' }}>Abonnement</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Gérez votre plan et votre facturation.</p>
                </div>

                <div style={{ ...card, background: subscription ? `${T}08` : '#fff', border: `1px solid ${subscription ? T + '33' : '#daeeed'}` }}>
                  <p style={sectionLabel}>Plan actuel</p>
                  {subscription ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: T, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 18, color: DARK, fontFamily: 'Outfit,sans-serif' }}>{subscription.plan_name || subscription.plan_id || 'Pro'}</div>
                          <div style={{ fontSize: 13, color: '#64748B' }}>
                            Renouvellement le {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                          </div>
                        </div>
                        <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>Actif</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
                        {[
                          { label: 'Montant', value: subscription.amount ? `${(subscription.amount / 100).toFixed(2)}€/mois` : '—' },
                          { label: 'Prochaine facture', value: subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR') : '—' },
                          { label: 'Statut', value: 'Actif' },
                        ].map(row => (
                          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #daeeed' }}>
                            <span style={{ fontSize: 14, color: '#64748B' }}>{row.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <svg style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      <p style={{ fontSize: 15, color: DARK, fontWeight: 500, marginBottom: 6 }}>Aucun abonnement actif</p>
                      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 0 }}>Souscrivez à un plan pour accéder à toutes les fonctionnalités professionnelles.</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {subscription ? (
                      <>
                        <button onClick={handlePortal} disabled={loadingPortal} style={{ flex: 1, padding: '13px', background: T, border: 'none', borderRadius: 100, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          {loadingPortal ? <span style={spinner} /> : 'Gérer via Stripe'}
                        </button>
                        <button onClick={handlePortal} style={{ padding: '13px 20px', background: 'transparent', border: '1px solid #daeeed', borderRadius: 100, color: '#64748B', fontSize: 14, cursor: 'pointer' }}>Changer de plan</button>
                      </>
                    ) : (
                      <a href="/#plans" style={{ textDecoration: 'none', flex: 1 }}>
                        <button style={{ width: '100%', padding: '13px', background: T, border: 'none', borderRadius: 100, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Voir les plans</button>
                      </a>
                    )}
                  </div>
                </div>

                <div style={card}>
                  <p style={sectionLabel}>Historique de facturation</p>
                  {subscription ? [
                    { date: new Date(Date.now() - 30 * 86400000).toLocaleDateString('fr-FR'), amount: `${(subscription.amount / 100).toFixed(2)}€` },
                    { date: new Date(Date.now() - 60 * 86400000).toLocaleDateString('fr-FR'), amount: `${(subscription.amount / 100).toFixed(2)}€` },
                    { date: new Date(Date.now() - 90 * 86400000).toLocaleDateString('fr-FR'), amount: `${(subscription.amount / 100).toFixed(2)}€` },
                  ].map((inv, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 2 ? '1px solid #daeeed' : 'none' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: DARK }}>Abonnement Pro</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{inv.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{inv.amount}</div>
                        <span style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>Payé</span>
                      </div>
                    </div>
                  )) : (
                    <p style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: '16px 0' }}>Aucune facture disponible.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab: Sécurité ── */}
            {activeTab === 'securite' && (
              <div className="fade-in">
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: 0, marginBottom: 6, fontFamily: 'Outfit,sans-serif' }}>Sécurité</h1>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>Gérez votre mot de passe et vos données personnelles.</p>
                </div>

                <div style={card}>
                  <p style={sectionLabel}>Changer le mot de passe</p>
                  {(['current', 'new', 'confirm'] as const).map(key => {
                    const map = {
                      current: { label: 'Mot de passe actuel', value: currentPwd, setter: setCurrentPwd },
                      new:     { label: 'Nouveau mot de passe', value: newPwd, setter: setNewPwd },
                      confirm: { label: 'Confirmer le nouveau mot de passe', value: confirmPwd, setter: setConfirmPwd },
                    }
                    const { label, value, setter } = map[key]
                    return (
                      <div key={key} style={{ marginBottom: 14 }}>
                        <label style={fieldLabel}>{label}</label>
                        <input type="password" value={value} onChange={e => setter(e.target.value)} placeholder="••••••••" style={fieldInput}
                          onFocus={e => (e.target as HTMLInputElement).style.borderColor = T}
                          onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#daeeed'} />
                      </div>
                    )
                  })}
                  {pwdError && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}><p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{pwdError}</p></div>}
                  {pwdSuccess && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}><p style={{ fontSize: 13, color: '#16a34a', margin: 0 }}>{pwdSuccess}</p></div>}
                  <button onClick={handleChangePwd} disabled={savingPwd}
                    style={{ width: '100%', padding: '13px', background: T, border: 'none', borderRadius: 100, color: '#fff', fontSize: 14, fontWeight: 600, cursor: savingPwd ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${T}40` }}>
                    {savingPwd ? <span style={spinner} /> : 'Mettre à jour le mot de passe'}
                  </button>
                </div>

                <div style={card}>
                  <p style={sectionLabel}>Données personnelles (RGPD)</p>
                  <p style={{ fontSize: 14, color: '#64748B', marginBottom: 16, lineHeight: 1.7 }}>
                    Conformément au RGPD, vous avez le droit d'accéder à l'ensemble des données vous concernant et de les télécharger.
                  </p>
                  <button onClick={handleDownloadData}
                    style={{ width: '100%', padding: '13px', background: 'transparent', border: `1px solid ${T}`, borderRadius: 100, color: T, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Télécharger mes données (RGPD)
                  </button>
                </div>

                <div style={{ ...card, border: '1px solid #fca5a533' }}>
                  <p style={{ ...sectionLabel, color: '#dc2626' }}>Zone de danger</p>
                  <p style={{ fontSize: 14, color: '#64748B', marginBottom: 16, lineHeight: 1.7 }}>
                    La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
                  </p>
                  <button onClick={() => setShowDeleteDialog(true)}
                    style={{ width: '100%', padding: '13px', background: 'transparent', border: '1px solid #fca5a5', borderRadius: 100, color: '#dc2626', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: DARK, textAlign: 'center', marginBottom: 8, fontFamily: 'Outfit,sans-serif' }}>Supprimer mon compte</h2>
            <p style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
              Cette action est irréversible. Toutes vos données, messages et informations seront définitivement supprimés.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#64748B', marginBottom: 8 }}>
                Tapez <strong style={{ color: '#dc2626' }}>SUPPRIMER</strong> pour confirmer :
              </label>
              <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="SUPPRIMER"
                style={{ width: '100%', background: '#f9fffe', border: `1px solid ${deleteConfirmText === 'SUPPRIMER' ? '#fca5a5' : '#daeeed'}`, borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', color: DARK }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText('') }}
                style={{ flex: 1, padding: '13px', background: '#f9fffe', border: '1px solid #daeeed', borderRadius: 100, color: '#64748B', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'SUPPRIMER' || deletingAccount}
                style={{ flex: 1, padding: '13px', background: deleteConfirmText === 'SUPPRIMER' ? '#dc2626' : '#f0f4f8', border: 'none', borderRadius: 100, color: deleteConfirmText === 'SUPPRIMER' ? '#fff' : '#64748B', fontSize: 14, fontWeight: 600, cursor: deleteConfirmText === 'SUPPRIMER' ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {deletingAccount ? <span style={spinner} /> : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
