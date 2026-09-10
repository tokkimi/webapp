'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import './pro.css'

export type Practice = { profession: string; practice_name: string; registration_number: string; address: string; contact_email: string; phone: string }
type ProContextValue = { profile: any; practice: Practice | null; reloadPractice: () => Promise<void>; request: (path: string, init?: RequestInit) => Promise<any> }
const ProContext = createContext<ProContextValue | null>(null)
export function usePro() { const context = useContext(ProContext); if (!context) throw new Error('Espace professionnel requis'); return context }
const NAV = [
  { href: '/pro', label: 'Tableau de bord', icon: 'overview', group: 'QUOTIDIEN' },
  { href: '/pro/agenda', label: 'Agenda', icon: 'calendar' },
  { href: '/pro/patients', label: 'Patients', icon: 'patients' },
  { href: '/pro/messages', label: 'Messages', icon: 'messages' },
  { href: '/pro/comptabilite', label: 'Comptabilité', icon: 'wallet', group: 'MON ACTIVITÉ' },
  { href: '/pro/resources', label: 'Ressources', icon: 'resources' },
  { href: '/pro/profile', label: 'Mon cabinet', icon: 'settings' },
]
export function ProIcon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M8 15h2M14 15h2"/></>,
    patients: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2"/></>,
    messages: <path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3zM7 8h10M7 12h6"/>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 7V5a2 2 0 0 1 2-2h12M21 10h-6v5h6M17 12.5h.01"/></>,
    resources: <><path d="M5 3h11l4 4v14H5zM16 3v5h4M9 12h7M9 16h5"/></>,
    settings: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.overview}</svg>
}
export default function ProWorkspace({ children }: { children: React.ReactNode }) {
  const router = useRouter(), pathname = usePathname()
  const [profile, setProfile] = useState<any>(null), [practice, setPractice] = useState<Practice | null>(null)
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [open, setOpen] = useState(false)
  const supabase = createSupabaseBrowserClient()
  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/auth'); throw new Error('Votre session a expiré. Reconnectez-vous.') }
    const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers, Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Service indisponible. Réessayez dans un instant.')
    return body
  }, [router, supabase])
  const reloadPractice = useCallback(async () => {
    const result = await request('/api/pro/practice'); setPractice(result.practice)
  }, [request])
  const load = useCallback(async () => {
    setError(''); setLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error('Connexion au service impossible. Réessayez.')
      if (!user) { router.replace('/auth'); return }
      const { data, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileError) throw new Error('Impossible de charger votre profil professionnel.')
      if (data.profile_type !== 'pro') { router.replace('/dashboard'); return }
      setProfile(data)
      await reloadPractice().catch(() => {}) // Other professional tools remain usable during accounting setup.
    } catch (e) { setError(e instanceof Error ? e.message : 'Impossible de charger votre espace.') }
    finally { setLoading(false) }
  }, [router, supabase, reloadPractice])
  useEffect(() => { load() }, [load])
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') router.replace('/auth') })
    return () => subscription.unsubscribe()
  }, [supabase, router])
  if (loading || !profile) return <div className="cp-root cp-loading"><div className="cp-card"><span className="cp-monogram">C</span><h1>Votre espace professionnel</h1>{error ? <><p role="alert">{error}</p><button className="cp-button" onClick={load}>Réessayer</button><Link href="/auth">Connexion</Link></> : <p role="status">Chargement de votre cabinet…</p>}</div></div>
  const current = NAV.find(item => pathname === item.href) || NAV[0]
  return <ProContext.Provider value={{ profile, practice, reloadPractice, request }}><div className="cp-root">
    <a href="#pro-content" className="cp-skip">Aller au contenu</a>
    {open && <button className="cp-backdrop" aria-label="Fermer le menu" onClick={() => setOpen(false)}/>}
    <aside className={`cp-sidebar ${open ? 'is-open' : ''}`}>
      <Link className="cp-brand" href="/pro"><span className="cp-monogram">C</span><span>capsule<span className="cp-brand-pro">PRO</span><small>Votre cabinet, simplement.</small></span></Link>
      <nav aria-label="Navigation professionnelle">{NAV.map(item => <div key={item.href}>{item.group && <p className="cp-nav-group">{item.group}</p>}<Link href={item.href} className={`cp-nav-link ${pathname === item.href ? 'is-active' : ''}`} aria-current={pathname === item.href ? 'page' : undefined}><ProIcon name={item.icon}/>{item.label}</Link></div>)}</nav>
      <div className="cp-sidebar-bottom"><div className="cp-practice-badge"><span className="cp-status-dot"/><div><strong>{practice?.practice_name || profile.name}</strong><small>{practice?.profession || profile.specialty || 'Profession à renseigner'}</small></div></div><button onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) setError('Déconnexion impossible. Réessayez.'); else router.replace('/auth') }}>Se déconnecter</button>{error && <small role="alert">{error}</small>}</div>
    </aside>
    <div className="cp-body"><header className="cp-topbar"><div className="cp-topbar-left"><button className="cp-menu-toggle" aria-expanded={open} aria-label="Ouvrir le menu professionnel" onClick={() => setOpen(!open)}>☰</button><Link href="/pro">Tableau de bord</Link>{pathname !== '/pro' && <><span>/</span><strong>{current.label}</strong></>}</div><Link href="/pro/profile" className="cp-account"><span>{profile.name || 'Mon cabinet'}</span><b>{(profile.name || 'P').slice(0, 1).toUpperCase()}</b></Link></header>
    <main id="pro-content" className="cp-main" tabIndex={-1}>{children}</main>
    <footer className="cp-footer">Capsule Pro <span>Un espace pour chaque pratique.</span><Link href="/pro">Retour au tableau de bord ↑</Link></footer></div>
  </div></ProContext.Provider>
}
