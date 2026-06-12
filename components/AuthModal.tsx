'use client'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface AuthModalProps {
  mode: 'login' | 'register'
  lang: string
  onClose: () => void
  onSwitch: (mode: 'login' | 'register') => void
}

export default function AuthModal({ mode, lang, onClose, onSwitch }: AuthModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createSupabaseBrowserClient()
  const fr = lang === 'fr'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (mode === 'register') {
      if (password !== confirm) { setError(fr ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'); setLoading(false); return }
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (err) { setError(err.message); setLoading(false); return }
      await supabase.from('profiles').upsert({ id: (await supabase.auth.getUser()).data.user?.id, name, email })
      setSuccess(true)
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(fr ? 'Email ou mot de passe incorrect' : 'Invalid email or password'); setLoading(false); return }
      onClose()
      window.location.reload()
    }
    setLoading(false)
  }

  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  )

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(4,6,15,0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-up-modal" style={{
        background: 'var(--surface)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: '40px 36px',
        width: '100%', maxWidth: 420, position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text3)', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, marginBottom: 6, color: 'var(--text)' }}>
            {mode === 'register' ? (fr ? 'Créer un compte' : 'Create account') : (fr ? 'Bon retour' : 'Welcome back')}
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>
            {mode === 'register'
              ? (fr ? 'Rejoignez Blue Circle aujourd\'hui' : 'Join Blue Circle today')
              : (fr ? 'Connectez-vous à votre compte' : 'Sign in to your account')}
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(37,99,235,0.1)',
              border: '1px solid rgba(37,99,235,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
              {fr ? 'Vérifiez votre email' : 'Check your email'}
            </p>
            <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>
              {fr ? 'Un lien de confirmation vous a été envoyé.' : 'A confirmation link has been sent to you.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>
                  {fr ? 'Prénom' : 'First name'}
                </label>
                <input value={name} onChange={e => setName(e.target.value)} required
                  className="input-field"
                  placeholder={fr ? 'Votre prénom' : 'Your first name'} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>
                Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-field"
                placeholder="you@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>
                {fr ? 'Mot de passe' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="input-field"
                  style={{ paddingRight: 44 }}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>
                  {fr ? 'Confirmer le mot de passe' : 'Confirm password'}
                </label>
                <input type={showPass ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required
                  className="input-field"
                  placeholder="••••••••" />
              </div>
            )}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)',
                borderRadius: 10, padding: '10px 12px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p style={{ color: '#EC4899', fontSize: 13 }}>{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary" style={{
              width: '100%', padding: '14px', fontSize: 15, marginTop: 4,
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading
                ? <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                : (mode === 'register' ? (fr ? 'Créer mon compte' : 'Create account') : (fr ? 'Se connecter' : 'Sign in'))}
            </button>
          </form>
        )}

        {!success && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
            {mode === 'register' ? (fr ? 'Déjà un compte ? ' : 'Already have an account? ') : (fr ? 'Pas encore de compte ? ' : 'No account yet? ')}
            <button onClick={() => onSwitch(mode === 'register' ? 'login' : 'register')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-h)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500 }}>
              {mode === 'register' ? (fr ? 'Se connecter' : 'Sign in') : (fr ? 'S\'inscrire' : 'Sign up')}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
