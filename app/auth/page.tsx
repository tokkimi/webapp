'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

/* ================================================================
   TYPES
   ================================================================ */
type AuthMode = 'login' | 'register'
type ProfileType = 'ado' | 'parent' | 'pro'

const PROFILE_TYPES: {
  id: ProfileType
  emoji: string
  label: string
  desc: string
  gradient: string
  glow: string
  border: string
}[] = [
  {
    id: 'ado',
    emoji: '🧡',
    label: 'Je suis ado',
    desc: 'Journal, humeur, motivation IA, défis et ressources bien-être',
    gradient: 'linear-gradient(135deg, #7C3AED, #EC4899)',
    glow: 'rgba(124,58,237,0.2)',
    border: 'rgba(124,58,237,0.35)',
  },
  {
    id: 'parent',
    emoji: '💙',
    label: 'Je suis parent',
    desc: 'Suivi bien-être de mon ado, accès aux pros et ressources parentales',
    gradient: 'linear-gradient(135deg, #0D9488, #2563EB)',
    glow: 'rgba(13,148,136,0.2)',
    border: 'rgba(13,148,136,0.35)',
  },
  {
    id: 'pro',
    emoji: '🎓',
    label: 'Je suis professionnel',
    desc: 'Gestion de patients, agenda, notes et outils de suivi',
    gradient: 'linear-gradient(135deg, #1E3A5F, #64748B)',
    glow: 'rgba(30,58,95,0.2)',
    border: 'rgba(30,58,95,0.35)',
  },
]

const PRO_SPECIALTIES = [
  'Psychologue clinicien(ne)',
  'Psychothérapeute',
  'Psychiatre',
  'Coach de vie adolescent',
  'Travailleur(euse) social(e)',
  'Éducateur(trice) spécialisé(e)',
  'Infirmier(ère) scolaire',
  'Orthophoniste',
  'Ergothérapeute',
  'Autre',
]

/* ================================================================
   EYE ICON
   ================================================================ */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/* ================================================================
   MAIN AUTH PAGE CONTENT
   ================================================================ */
function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialMode = (searchParams.get('mode') as AuthMode) || 'login'
  const initialType = (searchParams.get('type') as ProfileType) || 'ado'

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [profileType, setProfileType] = useState<ProfileType>(initialType)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [adeliNumber, setAdeliNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)

  // UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  // Reset error on field change
  useEffect(() => {
    setError(null)
  }, [email, password, name, birthDate, specialty, adeliNumber, mode, profileType])

  /* ── REGISTER ─────────────────────────────────────────────── */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!legalAccepted) {
      setError('Tu dois accepter les conditions générales pour continuer.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (profileType === 'ado' && !birthDate) {
      setError('La date de naissance est requise pour les ados.')
      return
    }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            profile_type: profileType,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.')
        } else if (signUpError.message.includes('password')) {
          setError('Le mot de passe doit contenir au moins 8 caractères.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      const userId = data.user?.id
      if (userId) {
        // Update profile with extra fields
        await supabase
          .from('profiles')
          .update({
            name: name.trim(),
            profile_type: profileType,
            birth_date: profileType === 'ado' && birthDate ? birthDate : null,
            specialty: profileType === 'pro' ? specialty : null,
            adeli_number: profileType === 'pro' ? adeliNumber : null,
          })
          .eq('id', userId)
      }

      setSuccess(
        'Compte créé avec succès ! Vérifie ta boîte mail pour confirmer ton e-mail, puis connecte-toi.'
      )
      setTimeout(() => {
        router.push('/onboarding')
      }, 2000)
    } catch {
      setError('Une erreur inattendue est survenue. Réessaie dans quelques instants.')
    } finally {
      setLoading(false)
    }
  }

  /* ── LOGIN ─────────────────────────────────────────────────── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInError) {
        if (
          signInError.message.includes('Invalid login') ||
          signInError.message.includes('credentials')
        ) {
          setError('E-mail ou mot de passe incorrect. Vérifie tes identifiants.')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Ton e-mail n\'a pas encore été confirmé. Vérifie ta boîte mail.')
        } else {
          setError(signInError.message)
        }
        return
      }

      const userId = data.user?.id
      if (!userId) {
        setError('Connexion échouée. Réessaie.')
        return
      }

      // Fetch profile type to redirect properly
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_type')
        .eq('id', userId)
        .single()

      const type = profile?.profile_type ?? 'ado'
      router.push(`/dashboard/${type}`)
    } catch {
      setError('Une erreur inattendue est survenue. Réessaie dans quelques instants.')
    } finally {
      setLoading(false)
    }
  }

  const activeGradient =
    profileType === 'ado'
      ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
      : profileType === 'parent'
      ? 'linear-gradient(135deg, #0D9488, #2563EB)'
      : 'linear-gradient(135deg, #1E3A5F, #64748B)'

  const activeColor =
    profileType === 'ado' ? '#7C3AED' : profileType === 'parent' ? '#0D9488' : '#1E3A5F'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: '#F8F7FF',
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <div
          className="animate-float"
          style={{
            position: 'absolute',
            top: '10%',
            left: '-5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          }}
        />
        <div
          className="animate-float"
          style={{
            position: 'absolute',
            bottom: '5%',
            right: '-8%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
            animationDelay: '2.5s',
          }}
        />
      </div>

      {/* Left decorative panel — hidden on small screens */}
      <div
        style={{
          display: 'none',
          width: '42%',
          flexShrink: 0,
          background: activeGradient,
          padding: '48px 40px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.5s ease',
        }}
        className="lg:flex"
      >
        {/* Circles decoration */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '30%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              backdropFilter: 'blur(8px)',
            }}
          >
            💊
          </div>
          <span
            style={{
              fontFamily: 'var(--font-outfit)',
              fontSize: 22,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            Capsule Ado
          </span>
        </Link>

        {/* Main content */}
        <div style={{ position: 'relative' }}>
          <div
            className="animate-float"
            style={{
              fontSize: 80,
              marginBottom: 28,
              display: 'block',
              lineHeight: 1,
            }}
          >
            {profileType === 'ado' ? '🧡' : profileType === 'parent' ? '💙' : '🎓'}
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-outfit)',
              fontSize: 36,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            {mode === 'login'
              ? 'Content de te revoir !'
              : profileType === 'ado'
              ? 'Ton espace bien-être t\'attend 🌟'
              : profileType === 'parent'
              ? 'Accompagne ton ado avec bienveillance'
              : 'Développez votre pratique'}
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.7,
              fontFamily: 'var(--font-inter)',
            }}
          >
            {mode === 'login'
              ? 'Connecte-toi pour retrouver ton espace personnalisé et continuer ta progression.'
              : profileType === 'ado'
              ? 'Journal privé, suivi d\'humeur, motivation IA, chat bienveillant — tout pour aller mieux au quotidien.'
              : profileType === 'parent'
              ? 'Suivez le bien-être de votre adolescent et connectez-vous avec des professionnels qualifiés.'
              : 'Gérez vos patients, agenda et notes en toute sécurité avec nos outils certifiés.'}
          </p>

          {/* Trust badges */}
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {['🔒 RGPD', '🛡️ Chiffré', '🇫🇷 France'].map((tag) => (
              <span
                key={tag}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '5px 14px',
                  borderRadius: 999,
                  fontFamily: 'var(--font-inter)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-inter)',
            position: 'relative',
          }}
        >
          © 2025 Capsule Ado SAS · Fait avec ❤️ en France
        </p>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 460 }}>
          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }} className="lg:hidden">
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                💊
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-outfit)',
                  fontSize: 20,
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Capsule Ado
              </span>
            </Link>
          </div>

          {/* Tab switcher */}
          <div
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 14,
              padding: 5,
              display: 'flex',
              marginBottom: 32,
              backdropFilter: 'blur(8px)',
            }}
          >
            {(['login', 'register'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setError(null)
                  setSuccess(null)
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  background:
                    mode === m ? activeGradient : 'transparent',
                  color: mode === m ? '#fff' : '#94A3B8',
                  boxShadow: mode === m ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
                }}
              >
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Profile type selector — register only */}
          {mode === 'register' && (
            <div style={{ marginBottom: 28 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 12,
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Je suis...
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PROFILE_TYPES.map((pt) => {
                  const isSelected = profileType === pt.id
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setProfileType(pt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 18px',
                        borderRadius: 14,
                        border: `1.5px solid ${isSelected ? pt.border : 'rgba(0,0,0,0.08)'}`,
                        background: isSelected
                          ? `${pt.glow.replace('0.2', '0.08')}`
                          : 'rgba(255,255,255,0.8)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.22s ease',
                        boxShadow: isSelected
                          ? `0 4px 16px ${pt.glow}`
                          : '0 1px 4px rgba(0,0,0,0.04)',
                      }}
                    >
                      {/* Colored dot + emoji */}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: isSelected ? pt.gradient : 'rgba(0,0,0,0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          flexShrink: 0,
                          transition: 'all 0.22s ease',
                        }}
                      >
                        {pt.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-outfit)',
                            fontWeight: 700,
                            fontSize: 14,
                            color: isSelected ? activeColor : '#1A1A2E',
                            marginBottom: 3,
                            transition: 'color 0.22s ease',
                          }}
                        >
                          {pt.label}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#94A3B8',
                            fontFamily: 'var(--font-inter)',
                            lineHeight: 1.5,
                          }}
                        >
                          {pt.desc}
                        </div>
                      </div>
                      {/* Radio indicator */}
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? activeColor : '#CBD5E1'}`,
                          background: isSelected ? activeColor : 'transparent',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.22s ease',
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: '#fff',
                            }}
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={mode === 'register' ? handleRegister : handleLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Name — register only */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6,
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {profileType === 'ado' ? 'Ton prénom 👋' : 'Ton nom complet'}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={profileType === 'ado' ? 'Léa, Théo...' : 'Marie Dupont'}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: 15,
                    fontFamily: 'var(--font-inter)',
                    color: '#1A1A2E',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = activeColor
                    e.target.style.boxShadow = `0 0 0 3px ${
                      profileType === 'ado'
                        ? 'rgba(124,58,237,0.12)'
                        : profileType === 'parent'
                        ? 'rgba(13,148,136,0.12)'
                        : 'rgba(30,58,95,0.12)'
                    }`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 6,
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ton@email.fr"
                autoComplete={mode === 'login' ? 'email' : 'off'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1.5px solid #E5E7EB',
                  background: 'rgba(255,255,255,0.9)',
                  fontSize: 15,
                  fontFamily: 'var(--font-inter)',
                  color: '#1A1A2E',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = activeColor
                  e.target.style.boxShadow = `0 0 0 3px ${
                    profileType === 'ado'
                      ? 'rgba(124,58,237,0.12)'
                      : profileType === 'parent'
                      ? 'rgba(13,148,136,0.12)'
                      : 'rgba(30,58,95,0.12)'
                  }`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 6,
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Mot de passe
                {mode === 'register' && (
                  <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: 6 }}>
                    (8 caractères min.)
                  </span>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: 15,
                    fontFamily: 'var(--font-inter)',
                    color: '#1A1A2E',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = activeColor
                    e.target.style.boxShadow = `0 0 0 3px ${
                      profileType === 'ado'
                        ? 'rgba(124,58,237,0.12)'
                        : profileType === 'parent'
                        ? 'rgba(13,148,136,0.12)'
                        : 'rgba(30,58,95,0.12)'
                    }`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = activeColor)}
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = '#94A3B8')
                  }
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Forgot password */}
              {mode === 'login' && (
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        setError('Entre d\'abord ton e-mail pour réinitialiser ton mot de passe.')
                        return
                      }
                      setLoading(true)
                      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                        email.trim().toLowerCase(),
                        { redirectTo: `${window.location.origin}/auth/callback?type=recovery` }
                      )
                      setLoading(false)
                      if (resetError) {
                        setError(resetError.message)
                      } else {
                        setSuccess('E-mail de réinitialisation envoyé ! Vérifie ta boîte mail.')
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: '#94A3B8',
                      fontFamily: 'var(--font-inter)',
                      transition: 'color 0.2s ease',
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = activeColor)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = '#94A3B8')
                    }
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </div>

            {/* Birth date — ado only, register */}
            {mode === 'register' && profileType === 'ado' && (
              <div>
                <label
                  htmlFor="birthDate"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6,
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  Date de naissance 🎂
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: 15,
                    fontFamily: 'var(--font-inter)',
                    color: '#1A1A2E',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7C3AED'
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            )}

            {/* Pro fields — register */}
            {mode === 'register' && profileType === 'pro' && (
              <>
                <div>
                  <label
                    htmlFor="specialty"
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: 6,
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Spécialité professionnelle
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #E5E7EB',
                        background: 'rgba(255,255,255,0.9)',
                        fontSize: 15,
                        fontFamily: 'var(--font-inter)',
                        color: specialty ? '#1A1A2E' : '#94A3B8',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1E3A5F'
                        e.target.style.boxShadow = '0 0 0 3px rgba(30,58,95,0.12)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="" disabled>
                        Choisir une spécialité...
                      </option>
                      {PRO_SPECIALTIES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div
                      style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: '#94A3B8',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="adeli"
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: 6,
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Numéro ADELI / RPPS{' '}
                    <span
                      style={{ color: '#94A3B8', fontWeight: 400, fontSize: 12 }}
                    >
                      (optionnel — requis pour la vérification)
                    </span>
                  </label>
                  <input
                    id="adeli"
                    type="text"
                    value={adeliNumber}
                    onChange={(e) => setAdeliNumber(e.target.value)}
                    placeholder="Ex: 75123456789"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1.5px solid #E5E7EB',
                      background: 'rgba(255,255,255,0.9)',
                      fontSize: 15,
                      fontFamily: 'var(--font-inter)',
                      color: '#1A1A2E',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1E3A5F'
                      e.target.style.boxShadow = '0 0 0 3px rgba(30,58,95,0.12)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </>
            )}

            {/* Legal checkbox — register only */}
            {mode === 'register' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(124,58,237,0.04)',
                  border: '1px solid rgba(124,58,237,0.1)',
                }}
              >
                <input
                  id="legal"
                  type="checkbox"
                  checked={legalAccepted}
                  onChange={(e) => setLegalAccepted(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: activeColor,
                    cursor: 'pointer',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                />
                <label
                  htmlFor="legal"
                  style={{
                    fontSize: 13,
                    color: '#374151',
                    lineHeight: 1.6,
                    fontFamily: 'var(--font-inter)',
                    cursor: 'pointer',
                  }}
                >
                  J&apos;accepte les{' '}
                  <Link
                    href="/cgv"
                    target="_blank"
                    style={{ color: activeColor, textDecoration: 'underline' }}
                  >
                    Conditions Générales
                  </Link>{' '}
                  et la{' '}
                  <Link
                    href="/confidentialite"
                    target="_blank"
                    style={{ color: activeColor, textDecoration: 'underline' }}
                  >
                    Politique de confidentialité
                  </Link>{' '}
                  de Capsule Ado.
                </label>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                className="animate-scale-in"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <svg
                  style={{ flexShrink: 0, marginTop: 1 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p
                  style={{
                    fontSize: 13,
                    color: '#DC2626',
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div
                className="animate-scale-in"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(16,185,129,0.07)',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                <svg
                  style={{ flexShrink: 0, marginTop: 1 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p
                  style={{
                    fontSize: 13,
                    color: '#059669',
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {success}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                background: loading ? '#CBD5E1' : activeGradient,
                color: '#fff',
                fontFamily: 'var(--font-outfit)',
                fontWeight: 700,
                fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.22s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: loading
                  ? 'none'
                  : profileType === 'ado'
                  ? '0 6px 20px rgba(124,58,237,0.4)'
                  : profileType === 'parent'
                  ? '0 6px 20px rgba(13,148,136,0.4)'
                  : '0 6px 20px rgba(30,58,95,0.4)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow =
                    profileType === 'ado'
                      ? '0 10px 28px rgba(124,58,237,0.5)'
                      : profileType === 'parent'
                      ? '0 10px 28px rgba(13,148,136,0.5)'
                      : '0 10px 28px rgba(30,58,95,0.5)'
                }
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              {loading ? (
                <>
                  <div
                    className="animate-spin"
                    style={{
                      width: 18,
                      height: 18,
                      border: '2.5px solid rgba(255,255,255,0.35)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                    }}
                  />
                  {mode === 'login' ? 'Connexion...' : 'Création du compte...'}
                </>
              ) : mode === 'login' ? (
                <>
                  Se connecter
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Créer mon compte
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            {/* Switch mode hint */}
            <p
              style={{
                textAlign: 'center',
                fontSize: 13,
                color: '#94A3B8',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {mode === 'login' ? (
                <>
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setError(null)
                      setSuccess(null)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: activeColor,
                      fontWeight: 600,
                      fontSize: 13,
                      fontFamily: 'var(--font-inter)',
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                    }}
                  >
                    S&apos;inscrire gratuitement
                  </button>
                </>
              ) : (
                <>
                  Déjà inscrit(e) ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError(null)
                      setSuccess(null)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: activeColor,
                      fontWeight: 600,
                      fontSize: 13,
                      fontFamily: 'var(--font-inter)',
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                    }}
                  >
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </form>

          {/* Back to home */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#94A3B8',
                textDecoration: 'none',
                fontFamily: 'var(--font-inter)',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#374151')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#94A3B8')}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   PAGE EXPORT (wrapped in Suspense for useSearchParams)
   ================================================================ */
export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F8F7FF',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid rgba(124,58,237,0.2)',
              borderTopColor: '#7C3AED',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  )
}
