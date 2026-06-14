'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const T = '#30B4A7'

const Icon = {
  users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  media: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  cal: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  heart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  chart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
}

const NAV = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: <Icon.chart /> },
  { key: 'users', label: 'Utilisateurs', icon: <Icon.users /> },
  { key: 'media', label: 'Médiathèque', icon: <Icon.media />, href: '/admin/mediatheque' },
  { key: 'appointments', label: 'Rendez-vous', icon: <Icon.cal /> },
  { key: 'newsletter', label: 'Newsletter', icon: <Icon.mail /> },
  { key: 'settings', label: 'Paramètres', icon: <Icon.settings /> },
]

type StatCard = { label: string; value: string; delta?: string; color?: string }

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<StatCard[]>([])
  const [appts, setAppts] = useState<any[]>([])
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [usersLoaded, setUsersLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!p || !['admin', 'superadmin'].includes(p.profile_type)) { router.push('/'); return }
      setProfile(p)
      await loadStats()
      setLoading(false)
    }
    load()
  }, [])

  const loadStats = async () => {
    const [{ count: totalUsers }, { count: ados }, { count: pros }, { count: parents }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_type', 'ado'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_type', 'pro'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_type', 'parent'),
    ])
    setStats([
      { label: 'Total utilisateurs', value: String(totalUsers ?? 0), color: T },
      { label: 'Adolescents', value: String(ados ?? 0), color: '#6366f1' },
      { label: 'Professionnels', value: String(pros ?? 0), color: '#f59e0b' },
      { label: 'Parents', value: String(parents ?? 0), color: '#ec4899' },
    ])
  }

  const loadUsers = async () => {
    if (usersLoaded) return
    const { data } = await supabase.from('profiles').select('id,name,email,profile_type,verified,created_at').order('created_at', { ascending: false }).limit(100)
    setUsers(data || [])
    setUsersLoaded(true)
  }

  const loadAppointments = async () => {
    const { data } = await supabase.from('appointments').select('id,status,scheduled_at,notes_for_pro,pro_id,patient_id').order('scheduled_at', { ascending: false }).limit(50)
    setAppts(data || [])
  }

  const loadNewsletter = async () => {
    const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }).limit(100)
    setNewsletters(data || [])
  }

  const switchTab = (key: string) => {
    setTab(key)
    if (key === 'users') loadUsers()
    if (key === 'appointments') loadAppointments()
    if (key === 'newsletter') loadNewsletter()
  }

  const verifyUser = async (id: string, val: boolean) => {
    await supabase.from('profiles').update({ verified: val }).eq('id', id)
    setUsers(u => u.map(x => x.id === id ? { ...x, verified: val } : x))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: T, fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 20 }}>Chargement...</div>
    </div>
  )

  const BADGE_COLORS: Record<string, string> = { ado: '#6366f1', parent: '#ec4899', pro: '#f59e0b', admin: T, superadmin: '#ef4444' }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f7', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#0c3532', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 16, color: T, letterSpacing: 2 }}>CAPSULE</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Administration</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(n => (
            n.href
              ? <Link key={n.key} href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.55)' }}>{n.icon}{n.label}</Link>
              : <button key={n.key} onClick={() => switchTab(n.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: 13, fontWeight: 500, background: tab === n.key ? 'rgba(48,180,167,.15)' : 'transparent', color: tab === n.key ? T : 'rgba(255,255,255,.55)' }}>{n.icon}{n.label}</button>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 8, padding: '0 12px' }}>{profile?.name || profile?.email}</div>
          <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: 13, color: 'rgba(255,255,255,.45)', background: 'transparent' }}>
            <Icon.logout /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '36px 40px', maxWidth: 1100 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#080f0e' }}>
              {tab === 'overview' && 'Vue d\'ensemble'}
              {tab === 'users' && 'Utilisateurs'}
              {tab === 'appointments' && 'Rendez-vous'}
              {tab === 'newsletter' && 'Newsletter'}
              {tab === 'settings' && 'Paramètres'}
            </h1>
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Bonjour, {profile?.name || 'Admin'}</p>
          </div>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
                {stats.map(s => (
                  <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '24px 22px', border: '1px solid #eef2f1' }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 34, fontWeight: 900, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'white', borderRadius: 16, padding: '28px 28px', border: '1px solid #eef2f1' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#111' }}>Accès rapides</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    { label: 'Gérer la médiathèque', href: '/admin/mediatheque', desc: 'Articles, vidéos, podcasts' },
                    { label: 'Voir les utilisateurs', action: () => switchTab('users'), desc: 'Comptes et profils' },
                    { label: 'Rendez-vous', action: () => switchTab('appointments'), desc: 'Consultations planifiées' },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '20px', borderRadius: 12, background: '#f8fafa', border: '1px solid #e8f0ef', cursor: 'pointer' }}
                      onClick={item.href ? () => router.push(item.href!) : item.action}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eef2f1', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafa', borderBottom: '1px solid #eef2f1' }}>
                    {['Nom / Email', 'Type', 'Vérifié', 'Inscrit le', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>Chargement...</td></tr>
                  )}
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fdfdfd' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#111' }}>{u.name || '—'}</div>
                        <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: `${BADGE_COLORS[u.profile_type] || '#888'}18`, color: BADGE_COLORS[u.profile_type] || '#888' }}>
                          {u.profile_type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: 12, color: u.verified ? T : '#ccc' }}>{u.verified ? '✓ Vérifié' : 'Non vérifié'}</span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#888', fontSize: 12 }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button onClick={() => verifyUser(u.id, !u.verified)}
                          style={{ padding: '5px 12px', borderRadius: 100, border: `1px solid ${T}`, background: 'transparent', color: T, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          {u.verified ? 'Révoquer' : 'Vérifier'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── APPOINTMENTS ── */}
          {tab === 'appointments' && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eef2f1', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafa', borderBottom: '1px solid #eef2f1' }}>
                    {['Date', 'Statut', 'Notes'].map(h => (
                      <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appts.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>Aucun rendez-vous</td></tr>
                  )}
                  {appts.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fdfdfd' }}>
                      <td style={{ padding: '14px 18px', color: '#333' }}>{a.scheduled_at ? new Date(a.scheduled_at).toLocaleString('fr-FR') : '—'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: a.status === 'confirmed' ? '#e0faf5' : '#f5f5f5', color: a.status === 'confirmed' ? T : '#888' }}>{a.status}</span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#888', fontSize: 12 }}>{a.notes_for_pro || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── NEWSLETTER ── */}
          {tab === 'newsletter' && (
            <div>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eef2f1', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #eef2f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{newsletters.length} abonné(s)</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafa', borderBottom: '1px solid #eef2f1' }}>
                      {['Email', 'Date d\'inscription'].map(h => (
                        <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {newsletters.length === 0 && (
                      <tr><td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>Aucun abonné</td></tr>
                    )}
                    {newsletters.map((n, i) => (
                      <tr key={n.id || i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '13px 18px', color: '#333' }}>{n.email}</td>
                        <td style={{ padding: '13px 18px', color: '#888', fontSize: 12 }}>{n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <div style={{ background: 'white', borderRadius: 16, padding: '32px', border: '1px solid #eef2f1' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, color: '#111' }}>Comptes de test</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { role: 'Adolescent', email: 'test-ado@capsule.app', password: 'Capsule2026!', color: '#6366f1' },
                  { role: 'Parent', email: 'test-parent@capsule.app', password: 'Capsule2026!', color: '#ec4899' },
                  { role: 'Professionnel', email: 'test-pro@capsule.app', password: 'Capsule2026!', color: '#f59e0b' },
                ].map(a => (
                  <div key={a.role} style={{ padding: '18px 20px', borderRadius: 12, background: '#f8fafa', border: '1px solid #eef2f1', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: `${a.color}18`, color: a.color }}>{a.role}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{a.email}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Mot de passe : {a.password}</div>
                    </div>
                    <Link href={`/auth?email=${encodeURIComponent(a.email)}`} style={{ padding: '7px 16px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                      Se connecter
                    </Link>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#aaa', marginTop: 20 }}>Ces comptes doivent être créés via Supabase Auth puis leur profil_type mis à jour via SQL.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
