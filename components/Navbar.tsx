'use client'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface NavbarProps {
  lang: string
  onLangToggle: () => void
  onOpenLogin: () => void
  onOpenRegister: () => void
}

export default function Navbar({ lang, onLangToggle, onOpenLogin, onOpenRegister }: NavbarProps) {
  const [user, setUser] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    supabase.auth.getUser().then(({ data }: any) => {
      setUser(data.user)
      if (data.user) fetchUnread(data.user.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUnread(session.user.id)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      listener.subscription.unsubscribe()
    }
  }, [])

  async function fetchUnread(userId: string) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    setUnreadCount(count || 0)
  }

  const initial = user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      background: scrolled ? 'rgba(4,6,15,0.92)' : 'rgba(4,6,15,0.6)',
      backdropFilter: 'blur(24px) saturate(1.3)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Logo */}
      <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #3B82F6, #7C3AED)',
          boxShadow: '0 0 16px rgba(37,99,235,0.5)',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 18, fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
        }}>
          blue<span style={{
            background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>●</span>circle
        </span>
      </a>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onLangToggle} style={{
          fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '1.5px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text3)', padding: '5px 10px', cursor: 'pointer',
          transition: 'all 0.2s ease', textTransform: 'uppercase',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}>
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>

        {user ? (
          <>
            <a href="/profile" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: 6 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4, width: 7, height: 7,
                  borderRadius: '50%', background: 'var(--accent3)',
                  border: '1.5px solid var(--bg)',
                  animation: 'pulse 2s infinite',
                }} />
              )}
            </a>
            <a href="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: '2px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px rgba(37,99,235,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}>
                {initial}
              </div>
            </a>
          </>
        ) : (
          <>
            <button onClick={onOpenLogin} className="btn-ghost" style={{ padding: '8px 18px', fontSize: 14 }}>
              {lang === 'fr' ? 'Connexion' : 'Login'}
            </button>
            <button onClick={onOpenRegister} className="btn-primary" style={{ padding: '8px 18px', fontSize: 14, boxShadow: '0 0 20px rgba(37,99,235,0.25)' }}>
              {lang === 'fr' ? 'Inscription' : 'Sign up'}
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
