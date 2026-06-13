'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { isTestAccount, TEST_SUBSCRIPTION } from '@/lib/test-accounts'

const HAIR  = ['Brun', 'Blond', 'Roux', 'Noir', 'Châtain', 'Platine']
const EYES  = ['Marron', 'Bleu', 'Vert', 'Gris', 'Noisette']
const BUILD = ['Mince', 'Athlétique', 'Sportif', 'Pulpeuse', 'Enrobé']
const STYLE = ['Casual', 'Élégant', 'Sportif', 'Lingerie', 'Latex', 'Cuir', 'Soubrette', 'Alternatif']

export default function Onboarding() {
  const [step, setStep]             = useState(1)
  const [gender, setGender]         = useState<'man' | 'woman' | null>(null)
  const [personality, setPersonality] = useState<string | null>(null)
  const [hair, setHair]             = useState<string | null>(null)
  const [eyes, setEyes]             = useState<string | null>(null)
  const [build, setBuild]           = useState<string | null>(null)
  const [style, setStyle]           = useState<string | null>(null)
  const [plan, setPlan]             = useState<string | null>(null)
  const [lang, setLang]             = useState('fr')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const router  = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'fr')
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/'); return }

      // Check if config already exists → go straight to chat
      const { data: existingRows } = await supabase.from('ai_config').select('id').eq('user_id', user.id).limit(1)
      if (existingRows?.[0]) { router.replace('/chat'); return }

      let sub: any = null
      if (isTestAccount(user.email)) {
        sub = TEST_SUBSCRIPTION
      } else {
        const { data } = await supabase.from('subscriptions').select('plan_id').eq('user_id', user.id).eq('status', 'active').single()
        sub = data
      }
      if (!sub) { router.replace('/'); return }
      setPlan(sub.plan_id)
    }
    checkAccess()
  }, [])

  const fr = lang === 'fr'
  const showStep2 = plan === 'premium' || plan === 'elite'

  async function handleFinish() {
    setSaving(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/'); return }

    const res = await fetch('/api/save-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ gender, personality, hair: hair || null, eyes: eyes || null, build: build || null, style: style || null }),
    })
    const data = await res.json()
    if (!res.ok || data.error) {
      setError(`Erreur: ${data.error || 'inconnue'}`)
      setSaving(false)
      return
    }

    router.replace('/chat')
  }

  const Chip = ({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) => (
    <button onClick={onSelect} style={{
      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`,
      background: selected ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.02)',
      color: selected ? 'var(--accent-h)' : 'var(--text2)',
      borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
      fontFamily: 'DM Sans, sans-serif', fontSize: 13,
      transition: 'all 0.2s ease',
      transform: selected ? 'translateY(-1px)' : 'none',
    }}>{label}</button>
  )

  const ChipRow = ({ label, options, selected, onSelect }: { label: string; options: string[]; selected: string | null; onSelect: (v: string) => void }) => (
    <div style={{ marginBottom: 22 }}>
      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => <Chip key={opt} label={opt} selected={selected === opt} onSelect={() => onSelect(opt)} />)}
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* bg orbs */}
      <div className="orb-float" style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', top: '-10%', left: '-10%', pointerEvents: 'none' }} />
      <div className="orb-breathe" style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', bottom: '-5%', right: '-5%', pointerEvents: 'none' }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 560, position: 'relative' }}>

        {/* Step indicator */}
        {showStep2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                height: 3, width: 40, borderRadius: 2,
                background: s <= step ? 'var(--accent)' : 'var(--border2)',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
        )}

        {step === 1 ? (
          <>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, textAlign: 'center', marginBottom: 8 }}>
              {fr ? 'Votre compagnon idéal' : 'Your ideal companion'}
            </h1>
            <p style={{ color: 'var(--text2)', textAlign: 'center', marginBottom: 36, fontSize: 15 }}>
              {fr ? 'Choisissez qui vous accompagne' : 'Choose who accompanies you'}
            </p>

            {/* Gender cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              {[
                { id: 'woman', emoji: '🌙', label: fr ? 'Femme — Luna' : 'Woman — Luna', desc: fr ? 'Douce, mystérieuse, envoûtante' : 'Soft, mysterious, enchanting' },
                { id: 'man',   emoji: '🌊', label: fr ? 'Homme — Axel' : 'Man — Axel',   desc: fr ? 'Intense, confiant, magnétique'  : 'Intense, confident, magnetic' },
              ].map(g => (
                <div key={g.id} onClick={() => setGender(g.id as 'man' | 'woman')} style={{
                  border: `1px solid ${gender === g.id ? 'var(--accent)' : 'var(--border2)'}`,
                  background: gender === g.id ? 'rgba(37,99,235,0.08)' : 'var(--surface)',
                  borderRadius: 18, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                  transform: gender === g.id ? 'translateY(-3px)' : 'none',
                  boxShadow: gender === g.id ? '0 8px 32px rgba(37,99,235,0.2)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>{g.emoji}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, marginBottom: 5 }}>{g.label}</div>
                  <div style={{ color: 'var(--text3)', fontSize: 12 }}>{g.desc}</div>
                </div>
              ))}
            </div>

            {/* Personality */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                {fr ? 'Sa personnalité' : 'Their personality'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'dominant',  emoji: '👑', label: fr ? 'Dominant(e)' : 'Dominant',  desc: fr ? 'Prend le contrôle, intense, charismatique' : 'Takes control, intense, charismatic' },
                  { id: 'submissive',emoji: '🌸', label: fr ? 'Soumis(e)'   : 'Submissive', desc: fr ? 'Doux(ce), dévoué(e), désireux(se) de plaire'  : 'Gentle, devoted, eager to please' },
                  { id: 'switch',    emoji: '⚡', label: 'Switch',                           desc: fr ? 'S\'adapte à ton énergie en temps réel'          : 'Adapts to your energy in real time' },
                ].map(p => (
                  <div key={p.id} onClick={() => setPersonality(p.id)} style={{
                    border: `1px solid ${personality === p.id ? 'var(--accent)' : 'var(--border2)'}`,
                    background: personality === p.id ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.02)',
                    borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{p.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.label}</div>
                      <div style={{ color: 'var(--text3)', fontSize: 12 }}>{p.desc}</div>
                    </div>
                    {personality === p.id && (
                      <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => showStep2 ? setStep(2) : handleFinish()}
              disabled={!gender || !personality || saving}
              className="btn-primary"
              style={{
                width: '100%', padding: '16px', fontSize: 16,
                opacity: (!gender || !personality) ? 0.4 : 1,
                cursor: (!gender || !personality) ? 'not-allowed' : 'pointer',
              }}>
              {saving
                ? <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                : showStep2 ? (fr ? 'Continuer →' : 'Continue →') : (fr ? 'Commencer →' : 'Start →')}
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, textAlign: 'center', marginBottom: 8 }}>
              {fr ? 'Son apparence' : 'Their appearance'}
            </h1>
            <p style={{ color: 'var(--text2)', textAlign: 'center', marginBottom: 32, fontSize: 14 }}>
              {fr ? 'Ces détails seront mentionnés naturellement dans la conversation' : 'These details will naturally come up in conversation'}
            </p>

            <ChipRow label={fr ? 'Cheveux' : 'Hair'}          options={HAIR}  selected={hair}  onSelect={setHair} />
            <ChipRow label={fr ? 'Yeux' : 'Eyes'}             options={EYES}  selected={eyes}  onSelect={setEyes} />
            <ChipRow label={fr ? 'Silhouette' : 'Build'}      options={BUILD} selected={build} onSelect={setBuild} />
            <ChipRow label={fr ? 'Style vestimentaire' : 'Style'} options={STYLE} selected={style} onSelect={setStyle} />

            {error && (
              <div style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#EC4899', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1, padding: '14px' }}>
                {fr ? '← Retour' : '← Back'}
              </button>
              <button onClick={handleFinish} disabled={saving} className="btn-primary" style={{ flex: 2, padding: '14px', opacity: saving ? 0.7 : 1 }}>
                {saving
                  ? <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  : (fr ? 'Commencer la conversation →' : 'Start chatting →')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
