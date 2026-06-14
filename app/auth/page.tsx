'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase'

type AuthMode = 'login' | 'register'
type ProfileType = 'ado' | 'parent' | 'pro'

const T = '#30B4A7'

const PROFILE_TYPES: { id: ProfileType; label: string; desc: string }[] = [
  { id: 'ado',    label: 'Je suis adolescent(e)', desc: 'Journal, humeur, ressources et espace d\'échange sécurisé' },
  { id: 'parent', label: 'Je suis parent',         desc: 'Suivi du bien-être de mon ado et accès aux professionnels' },
  { id: 'pro',    label: 'Je suis professionnel',  desc: 'Gestion de patients, agenda, notes et outils de suivi' },
]

const PRO_SPECIALTIES = [
  'Psychologue clinicien(ne)', 'Psychothérapeute', 'Psychiatre',
  'Coach de vie adolescent', 'Travailleur(euse) social(e)',
  'Éducateur(trice) spécialisé(e)', 'Infirmier(ère) scolaire',
  'Orthophoniste', 'Ergothérapeute', 'Autre',
]

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialMode = (searchParams.get('mode') as AuthMode) || 'login'
  const initialType = (searchParams.get('type') as ProfileType) || 'ado'

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [profileType, setProfileType] = useState<ProfileType>(initialType)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [adeliNumber, setAdeliNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  useEffect(() => { setError(null) }, [email, password, name, birthDate, specialty, adeliNumber, mode, profileType])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null)
    if (!legalAccepted) { setError('Tu dois accepter les conditions générales pour continuer.'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (profileType === 'ado' && !birthDate) { setError('La date de naissance est requise.'); return }
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password,
        options: { data: { name: name.trim(), profile_type: profileType } },
      })
      if (signUpError) {
        if (signUpError.message.includes('already registered')) setError('Un compte existe déjà avec cet e-mail.')
        else setError(signUpError.message)
        return
      }
      const userId = data.user?.id
      if (userId) {
        await supabase.from('profiles').update({
          name: name.trim(), profile_type: profileType,
          birth_date: profileType === 'ado' && birthDate ? birthDate : null,
          specialty: profileType === 'pro' ? specialty : null,
          adeli_number: profileType === 'pro' ? adeliNumber : null,
        }).eq('id', userId)
      }
      setSuccess('Compte créé ! Vérifie ta boîte mail pour confirmer, puis connecte-toi.')
      setTimeout(() => router.push('/onboarding'), 2000)
    } catch {
      setError('Une erreur inattendue est survenue.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null); setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (signInError) {
        if (signInError.message.includes('Invalid login') || signInError.message.includes('credentials')) setError('E-mail ou mot de passe incorrect.')
        else if (signInError.message.includes('Email not confirmed')) setError('Ton e-mail n\'a pas encore été confirmé.')
        else setError(signInError.message)
        return
      }
      const userId = data.user?.id
      if (!userId) { setError('Connexion échouée. Réessaie.'); return }
      const { data: profile } = await supabase.from('profiles').select('profile_type').eq('id', userId).single()
      router.push(`/dashboard/${profile?.profile_type ?? 'ado'}`)
    } catch {
      setError('Une erreur inattendue est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid #daeeed', background: 'white',
    fontSize: 15, fontFamily: 'Inter, system-ui, sans-serif', color: '#111', outline: 'none',
  }

  const PANEL_CONTENT = {
    login:  { title: 'Content de te revoir.', sub: 'Retrouve ton espace personnalisé et continue ta progression.' },
    register: {
      ado:    { title: 'Ton espace bien-être t\'attend.', sub: 'Journal privé, suivi d\'humeur, ressources et espace d\'échange sécurisé.' },
      parent: { title: 'Accompagne ton ado.', sub: 'Suivez le bien-être de votre adolescent et connectez-vous avec des professionnels qualifiés.' },
      pro:    { title: 'Développez votre pratique.', sub: 'Gérez vos patients, agenda et notes en toute sécurité.' },
    },
  }

  const panelText = mode === 'login'
    ? PANEL_CONTENT.login
    : PANEL_CONTENT.register[profileType]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800;900&family=Audiowide&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea{font-family:inherit}
        input:focus,select:focus{border-color:${T}!important;box-shadow:0 0 0 3px rgba(48,180,167,.12)!important}
        @media(max-width:900px){.auth-panel{display:none!important}}
      `}</style>

      {/* Left dark panel */}
      <div className="auth-panel" style={{
        width: '44%', flexShrink: 0, flexDirection: 'column', justifyContent: 'space-between',
        background: 'linear-gradient(160deg, #082827 0%, #0c3532 60%, #0f3d3a 100%)',
        padding: '48px 40px', display: 'flex', position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '15%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(48,180,167,.12) 0%, transparent 70%)`, pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '10%', left: '-8%', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, rgba(48,180,167,.08) 0%, transparent 70%)`, pointerEvents: 'none' }}/>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          <Image src="/logo.png" alt="Capsule" width={44} height={44} style={{ objectFit: 'contain' }} />
        </Link>

        {/* Center text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 48, height: 3, background: T, borderRadius: 2, marginBottom: 28 }}/>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
            {panelText.title}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.75 }}>
            {panelText.sub}
          </p>
          <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[['RGPD', 'Conforme'], ['Chiffré', 'E2E'], ['France', 'Hébergé']].map(([k, v]) => (
              <div key={k} style={{ padding: '7px 14px', borderRadius: 100, background: 'rgba(48,180,167,.1)', border: '1px solid rgba(48,180,167,.2)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T, letterSpacing: .5 }}>{k}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginLeft: 6 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', position: 'relative', zIndex: 1 }}>
          © 2026 Capsule — GACKAO SAS · Fait en France
        </p>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: '#f8fcfb', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: 32, display: 'none' }} className="auth-mobile-logo">
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <Image src="/logo.png" alt="Capsule" width={36} height={36} style={{ objectFit: 'contain' }} />
              <span style={{ fontFamily: "'Audiowide', sans-serif", fontSize: 18, color: T }}>CAPSULE</span>
            </Link>
          </div>

          {/* Tab switcher */}
          <div style={{ background: 'white', border: '1px solid #e4f0ef', borderRadius: 14, padding: 5, display: 'flex', marginBottom: 28 }}>
            {(['login', 'register'] as AuthMode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null) }} style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
                fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: mode === m ? T : 'transparent',
                color: mode === m ? 'white' : '#94a3b8',
                transition: 'all .2s',
              }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Profile type — register only */}
          {mode === 'register' && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Je suis...</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PROFILE_TYPES.map(pt => {
                  const sel = profileType === pt.id
                  return (
                    <button key={pt.id} type="button" onClick={() => setProfileType(pt.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      borderRadius: 14, border: `1.5px solid ${sel ? T : '#e4f0ef'}`,
                      background: sel ? 'rgba(48,180,167,.06)' : 'white',
                      cursor: 'pointer', textAlign: 'left', transition: 'all .18s',
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: sel ? T : '#daeeed', flexShrink: 0, transition: 'background .18s' }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: sel ? '#080f0e' : '#555', marginBottom: 2 }}>{pt.label}</div>
                        <div style={{ fontSize: 12, color: '#999', lineHeight: 1.5 }}>{pt.desc}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${sel ? T : '#ddd'}`, background: sel ? T : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }}/>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'register' ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                  {profileType === 'ado' ? 'Ton prénom' : 'Nom complet'}
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  placeholder={profileType === 'ado' ? 'Léa, Théo...' : 'Marie Dupont'} style={inputStyle} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Adresse e-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="ton@email.fr" autoComplete={mode === 'login' ? 'email' : 'off'} style={inputStyle} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                Mot de passe{mode === 'register' && <span style={{ color: '#aaa', fontWeight: 400, marginLeft: 6 }}>8 caractères min.</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={8} placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{ ...inputStyle, paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', padding: 4,
                }}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {mode === 'login' && (
                <div style={{ marginTop: 6, textAlign: 'right' }}>
                  <button type="button" onClick={async () => {
                    if (!email) { setError('Entre ton e-mail pour réinitialiser ton mot de passe.'); return }
                    setLoading(true)
                    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/auth/callback?type=recovery` })
                    setLoading(false)
                    resetError ? setError(resetError.message) : setSuccess('E-mail de réinitialisation envoyé !')
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#aaa', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </div>

            {mode === 'register' && profileType === 'ado' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Date de naissance</label>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required
                  max={new Date().toISOString().split('T')[0]} style={inputStyle} />
              </div>
            )}

            {mode === 'register' && profileType === 'pro' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Spécialité</label>
                  <select value={specialty} onChange={e => setSpecialty(e.target.value)} required style={{ ...inputStyle, appearance: 'none' as const }}>
                    <option value="" disabled>Choisir une spécialité...</option>
                    {PRO_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                    Numéro ADELI / RPPS <span style={{ color: '#bbb', fontWeight: 400, fontSize: 12 }}>(optionnel)</span>
                  </label>
                  <input type="text" value={adeliNumber} onChange={e => setAdeliNumber(e.target.value)} placeholder="Ex: 75123456789" style={inputStyle} />
                </div>
              </>
            )}

            {mode === 'register' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(48,180,167,.05)', border: '1px solid rgba(48,180,167,.15)' }}>
                <input id="legal" type="checkbox" checked={legalAccepted} onChange={e => setLegalAccepted(e.target.checked)}
                  style={{ width: 17, height: 17, accentColor: T, cursor: 'pointer', flexShrink: 0, marginTop: 1 }} />
                <label htmlFor="legal" style={{ fontSize: 13, color: '#555', lineHeight: 1.6, cursor: 'pointer' }}>
                  J&apos;accepte les <Link href="/cgv" target="_blank" style={{ color: T, textDecoration: 'underline' }}>Conditions Générales</Link> et la <Link href="/confidentialite" target="_blank" style={{ color: T, textDecoration: 'underline' }}>Politique de confidentialité</Link>.
                </label>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.18)' }}>
                <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p style={{ fontSize: 13, color: '#dc2626', lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            {success && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(48,180,167,.07)', border: '1px solid rgba(48,180,167,.2)' }}>
                <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <p style={{ fontSize: 13, color: '#059669', lineHeight: 1.5 }}>{success}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 100, border: 'none',
              background: loading ? '#ccc' : T, color: 'white',
              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(48,180,167,.35)',
              transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa' }}>
              {mode === 'login' ? (
                <>Pas encore de compte ?{' '}
                  <button type="button" onClick={() => { setMode('register'); setError(null); setSuccess(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: T, fontWeight: 600, fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    S&apos;inscrire gratuitement
                  </button>
                </>
              ) : (
                <>Déjà inscrit(e) ?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: T, fontWeight: 600, fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#aaa', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fcfb' }}>
        <div style={{ width: 36, height: 36, border: `3px solid rgba(48,180,167,.2)`, borderTopColor: '#30B4A7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
