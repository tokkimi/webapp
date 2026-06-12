'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { isTestAccount, TEST_SUBSCRIPTION } from '@/lib/test-accounts'

const HAIR  = ['Brun', 'Blond', 'Roux', 'Noir', 'Châtain']
const EYES  = ['Marron', 'Bleu', 'Vert', 'Gris', 'Noisette']
const BUILD = ['Mince', 'Athlétique', 'Sportif', 'Enrobé']
const STYLE = ['Casual', 'Élégant', 'Sportif', 'Alternatif']

const PLAN_NAMES:  Record<string, string> = { essentiel: 'Essentiel', illimite: 'Illimité', premium: 'Premium', elite: 'Elite' }
const PLAN_PRICES: Record<string, string> = { essentiel: '19€/mois', illimite: '39€/mois', premium: '79€/mois', elite: '199€/mois' }
const PLAN_COLOR:  Record<string, string> = { essentiel: '#64748B', illimite: '#3B82F6', premium: '#7C3AED', elite: '#EC4899' }

export default function Profile() {
  const [user, setUser]                 = useState<any>(null)
  const [profile, setProfile]           = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [aiConfig, setAiConfig]         = useState<any>(null)
  const [lang, setLang]                 = useState('fr')
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [savingAi, setSavingAi]         = useState(false)
  const [savedAi, setSavedAi]           = useState(false)
  const [activeTab, setActiveTab]       = useState<'companion' | 'account'>('companion')

  // local editable AI state
  const [gender, setGender]         = useState<string | null>(null)
  const [personality, setPersonality] = useState<string | null>(null)
  const [hair, setHair]             = useState<string | null>(null)
  const [eyes, setEyes]             = useState<string | null>(null)
  const [build, setBuild]           = useState<string | null>(null)
  const [style, setStyle]           = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()
  const router   = useRouter()

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'fr')
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)

    const [{ data: prof }, { data: subFromDb }, { data: notifs }, { data: cfg }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('ai_config').select('*').eq('user_id', user.id).single(),
    ])
    const sub = isTestAccount(user.email) ? TEST_SUBSCRIPTION : subFromDb
    setProfile(prof)
    setSubscription(sub)
    setNotifications(notifs || [])
    if (cfg) {
      setAiConfig(cfg)
      setGender(cfg.gender)
      setPersonality(cfg.personality)
      setHair(cfg.hair)
      setEyes(cfg.eyes)
      setBuild(cfg.build)
      setStyle(cfg.style)
    }
    if (notifs?.some((n: any) => !n.read)) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    }
  }

  async function handleSaveAi() {
    if (!user || !gender || !personality) return
    setSavingAi(true)
    await supabase.from('ai_config').upsert({
      user_id: user.id,
      gender, personality, hair, eyes, build, style,
      updated_at: new Date().toISOString(),
    })
    setSavingAi(false)
    setSavedAi(true)
    setTimeout(() => setSavedAi(false), 2500)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handlePortal() {
    setLoadingPortal(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoadingPortal(false)
  }

  const fr = lang === 'fr'
  const initial = profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'
  const aiName  = gender === 'woman' ? 'Luna' : gender === 'man' ? 'Axel' : '—'
  const isPremiumPlus = subscription?.plan_id === 'premium' || subscription?.plan_id === 'elite'

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 20, padding: '24px', marginBottom: 16,
    }}>
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', fontWeight: 500, marginBottom: 18 }}>
        {title}
      </p>
      {children}
    </div>
  )

  const Chips = ({ options, selected, onSelect }: { options: string[]; selected: string | null; onSelect: (v: string) => void }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onSelect(opt)} style={{
          border: `1px solid ${selected === opt ? 'var(--accent)' : 'var(--border2)'}`,
          background: selected === opt ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.02)',
          color: selected === opt ? 'var(--accent-h)' : 'var(--text2)',
          borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif', fontSize: 13, transition: 'all 0.2s ease',
        }}>{opt}</button>
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>

      {/* Header banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 24px 32px',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            border: '2px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 700, color: '#fff',
            boxShadow: '0 0 32px rgba(37,99,235,0.3)',
          }}>{initial}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
              {profile?.name || user?.email?.split('@')[0]}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{user?.email}</div>
            {subscription && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border2)', borderRadius: 100, padding: '3px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: PLAN_COLOR[subscription.plan_id] || '#64748B' }} />
                <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>
                  {PLAN_NAMES[subscription.plan_id]} · {PLAN_PRICES[subscription.plan_id]}
                </span>
              </div>
            )}
          </div>
          <a href="/chat" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14, flexShrink: 0 }}>
              {fr ? 'Discuter' : 'Chat'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 4, margin: '20px 0 16px', background: 'var(--surface)', borderRadius: 12, padding: 4 }}>
          {[
            { id: 'companion', label: fr ? 'Mon compagnon' : 'My companion' },
            { id: 'account',   label: fr ? 'Compte' : 'Account' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
              flex: 1, padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
              background: activeTab === tab.id ? 'var(--surface2)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text3)',
              transition: 'all 0.2s ease',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── Companion tab ── */}
        {activeTab === 'companion' && (
          <div className="fade-in">
            {/* Current companion summary */}
            {aiConfig && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.06))',
                border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: 20, padding: '20px 24px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, boxShadow: '0 0 20px rgba(37,99,235,0.3)',
                }}>
                  {gender === 'woman' ? '🌙' : '🌊'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 2 }}>{aiName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                    {personality === 'dominant' ? (fr ? 'Dominant(e)' : 'Dominant')
                      : personality === 'submissive' ? (fr ? 'Soumis(e)' : 'Submissive')
                      : 'Switch'}
                    {hair ? ` · ${hair}` : ''}
                    {eyes ? ` · ${eyes}` : ''}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{ fontSize: 11, color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '3px 10px' }}>
                    ● {fr ? 'Actif' : 'Active'}
                  </span>
                </div>
              </div>
            )}

            <Section title={fr ? 'Genre' : 'Gender'}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { id: 'woman', emoji: '🌙', label: fr ? 'Femme — Luna' : 'Woman — Luna', desc: fr ? 'Douce, mystérieuse, envoûtante' : 'Soft, mysterious, enchanting' },
                  { id: 'man',   emoji: '🌊', label: fr ? 'Homme — Axel' : 'Man — Axel',   desc: fr ? 'Intense, confiant, magnétique'  : 'Intense, confident, magnetic' },
                ].map(g => (
                  <div key={g.id} onClick={() => setGender(g.id)} style={{
                    border: `1px solid ${gender === g.id ? 'var(--accent)' : 'var(--border2)'}`,
                    background: gender === g.id ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.02)',
                    borderRadius: 14, padding: '16px', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: gender === g.id ? 'translateY(-2px)' : 'none',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{g.emoji}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{g.label}</div>
                    <div style={{ color: 'var(--text3)', fontSize: 12 }}>{g.desc}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title={fr ? 'Personnalité' : 'Personality'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'dominant',  emoji: '👑', label: fr ? 'Dominant(e)' : 'Dominant',  desc: fr ? 'Prend le contrôle, donne des ordres, intensément charismatique' : 'Takes control, gives orders, intensely charismatic' },
                  { id: 'submissive',emoji: '🌸', label: fr ? 'Soumis(e)'   : 'Submissive', desc: fr ? 'Doux(ce), dévoué(e), désir de plaire à tout prix'              : 'Gentle, devoted, eager to please at all costs' },
                  { id: 'switch',    emoji: '⚡', label: 'Switch',                           desc: fr ? 'S\'adapte à ton énergie — dominant(e) ou soumis(e) selon toi'  : 'Adapts to your energy — dominant or submissive based on you' },
                ].map(p => (
                  <div key={p.id} onClick={() => setPersonality(p.id)} style={{
                    border: `1px solid ${personality === p.id ? 'var(--accent)' : 'var(--border2)'}`,
                    background: personality === p.id ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.02)',
                    borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{p.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.label}</div>
                      <div style={{ color: 'var(--text3)', fontSize: 12, lineHeight: 1.5 }}>{p.desc}</div>
                    </div>
                    {personality === p.id && (
                      <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            {isPremiumPlus && (
              <Section title={fr ? 'Apparence physique' : 'Physical appearance'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: fr ? 'Cheveux' : 'Hair',     options: HAIR,  selected: hair,  onSelect: setHair },
                    { label: fr ? 'Yeux' : 'Eyes',        options: EYES,  selected: eyes,  onSelect: setEyes },
                    { label: fr ? 'Silhouette' : 'Build', options: BUILD, selected: build, onSelect: setBuild },
                    { label: 'Style',                      options: STYLE, selected: style, onSelect: setStyle },
                  ].map(row => (
                    <div key={row.label}>
                      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, letterSpacing: '0.04em' }}>{row.label}</p>
                      <Chips options={row.options} selected={row.selected} onSelect={row.onSelect} />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <button onClick={handleSaveAi} disabled={savingAi || !gender || !personality} className="btn-primary" style={{
              width: '100%', padding: '15px', fontSize: 15,
              opacity: (!gender || !personality) ? 0.4 : 1,
              cursor: (!gender || !personality) ? 'not-allowed' : 'pointer',
              marginBottom: 20,
              background: savedAi ? '#22C55E' : undefined,
              boxShadow: savedAi ? '0 0 24px rgba(34,197,94,0.3)' : undefined,
            }}>
              {savingAi
                ? <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                : savedAi
                  ? (fr ? '✓ Sauvegardé !' : '✓ Saved!')
                  : (fr ? 'Enregistrer les changements' : 'Save changes')}
            </button>
          </div>
        )}

        {/* ── Account tab ── */}
        {activeTab === 'account' && (
          <div className="fade-in">
            {subscription ? (
              <Section title={fr ? 'Abonnement actif' : 'Active subscription'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: fr ? 'Plan' : 'Plan', value: PLAN_NAMES[subscription.plan_id] },
                    { label: fr ? 'Tarif' : 'Price', value: PLAN_PRICES[subscription.plan_id] },
                    { label: fr ? 'Prochain débit' : 'Next billing', value: subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text2)', fontSize: 14 }}>{row.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                  <button onClick={handlePortal} disabled={loadingPortal} className="btn-ghost" style={{ width: '100%', padding: '12px' }}>
                    {loadingPortal
                      ? <span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      : (fr ? 'Gérer l\'abonnement' : 'Manage subscription')}
                  </button>
                </div>
              </Section>
            ) : (
              <div style={{
                background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: 20, padding: '24px', marginBottom: 16, textAlign: 'center',
              }}>
                <p style={{ color: 'var(--text2)', marginBottom: 14, fontSize: 14 }}>
                  {fr ? 'Aucun abonnement actif' : 'No active subscription'}
                </p>
                <a href="/#plans">
                  <button className="btn-primary" style={{ padding: '11px 24px', fontSize: 14 }}>
                    {fr ? 'Voir les plans' : 'View plans'}
                  </button>
                </a>
              </div>
            )}

            {notifications.length > 0 && (
              <Section title="Notifications">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.map((n: any) => (
                    <div key={n.id} style={{
                      padding: '12px', borderRadius: 10,
                      background: n.read ? 'transparent' : 'rgba(37,99,235,0.06)',
                      border: `1px solid ${n.read ? 'var(--border)' : 'rgba(37,99,235,0.2)'}`,
                    }}>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{n.title}</div>
                      <div style={{ color: 'var(--text2)', fontSize: 13 }}>{n.body}</div>
                      <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 4 }}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title={fr ? 'Compte' : 'Account'}>
              <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>{user?.email}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', padding: '12px' }}>
                  {fr ? 'Se déconnecter' : 'Sign out'}
                </button>
                {subscription && (
                  <button onClick={handlePortal} style={{
                    width: '100%', background: 'transparent',
                    border: '1px solid rgba(236,72,153,0.25)', borderRadius: 12,
                    color: 'var(--accent3)', padding: '12px',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}>
                    {fr ? 'Résilier l\'abonnement' : 'Cancel subscription'}
                  </button>
                )}
              </div>
            </Section>
          </div>
        )}
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}
