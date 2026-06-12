'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { isTestAccount, TEST_SUBSCRIPTION } from '@/lib/test-accounts'

const HAIR = ['Brun', 'Blond', 'Roux', 'Noir', 'Châtain']
const EYES = ['Marron', 'Bleu', 'Vert', 'Gris', 'Noisette']
const BUILD = ['Mince', 'Athlétique', 'Sportif', 'Enrobé']
const STYLE = ['Casual', 'Élégant', 'Sportif', 'Alternatif']

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [gender, setGender] = useState<'man' | 'woman' | null>(null)
  const [personality, setPersonality] = useState<string | null>(null)
  const [hair, setHair] = useState<string | null>(null)
  const [eyes, setEyes] = useState<string | null>(null)
  const [build, setBuild] = useState<string | null>(null)
  const [style, setStyle] = useState<string | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [lang, setLang] = useState('fr')
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'fr')
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      let sub: any = null
      if (isTestAccount(user.email)) {
        sub = TEST_SUBSCRIPTION
      } else {
        const { data } = await supabase.from('subscriptions').select('plan_id').eq('user_id', user.id).eq('status', 'active').single()
        sub = data
      }
      if (!sub) { router.push('/'); return }
      setPlan(sub.plan_id)
      if (['essentiel', 'illimite'].includes(sub.plan_id)) {
        const { data: existing } = await supabase.from('ai_config').select('id').eq('user_id', user.id).single()
        if (existing) { router.push('/chat'); return }
      }
    }
    checkAccess()
  }, [])

  const fr = lang === 'fr'
  const showStep2 = plan === 'premium' || plan === 'elite'

  async function handleFinish() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('ai_config').upsert({
      user_id: user.id,
      gender, personality,
      hair: hair || null,
      eyes: eyes || null,
      build: build || null,
      style: style || null,
      updated_at: new Date().toISOString(),
    })
    router.push('/chat')
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 560 }}>
        {step === 1 ? (
          <>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, textAlign: 'center', marginBottom: 8 }}>
              {fr ? 'Votre compagnon idéal' : 'Your ideal companion'}
            </h1>
            <p style={{ color: 'var(--text2)', textAlign: 'center', marginBottom: 40 }}>
              {fr ? 'Personnalisez votre expérience' : 'Personalize your experience'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[
                { id: 'woman', icon: '♀', label: fr ? 'Femme' : 'Woman', desc: fr ? 'Douce, mystérieuse et envoûtante' : 'Soft, mysterious and enchanting' },
                { id: 'man', icon: '♂', label: fr ? 'Homme' : 'Man', desc: fr ? 'Intense, confiant et magnétique' : 'Intense, confident and magnetic' },
              ].map(g => (
                <div key={g.id} onClick={() => setGender(g.id as 'man' | 'woman')} style={{
                  border: `1px solid ${gender === g.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: gender === g.id ? 'rgba(27,110,243,0.08)' : 'var(--surface)',
                  borderRadius: 20, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                  transform: gender === g.id ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>{g.icon}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, marginBottom: 6 }}>{g.label}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 13 }}>{g.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {fr ? 'Sa personnalité' : 'Their personality'}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { id: 'dominant', label: fr ? 'Dominant(e)' : 'Dominant' },
                  { id: 'submissive', label: fr ? 'Soumis(e)' : 'Submissive' },
                  { id: 'switch', label: 'Switch' },
                ].map(p => (
                  <button key={p.id} onClick={() => setPersonality(p.id)} style={{
                    border: `1px solid ${personality === p.id ? 'var(--accent)' : 'var(--border)'}`,
                    background: personality === p.id ? 'rgba(27,110,243,0.08)' : 'transparent',
                    color: personality === p.id ? 'var(--accent)' : 'var(--text2)',
                    borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, transition: 'all 0.2s ease',
                  }}>{p.label}</button>
                ))}
              </div>
            </div>

            <button onClick={() => showStep2 ? setStep(2) : handleFinish()}
              disabled={!gender || !personality}
              style={{
                width: '100%', background: 'var(--accent)', border: 'none', borderRadius: 10,
                color: '#fff', padding: '16px', fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500, fontSize: 16, cursor: (!gender || !personality) ? 'not-allowed' : 'pointer',
                opacity: (!gender || !personality) ? 0.4 : 1, transition: 'all 0.2s ease',
              }}>
              {fr ? 'Continuer' : 'Continue'} →
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, textAlign: 'center', marginBottom: 8 }}>
              {fr ? 'Personnalisez votre partenaire' : 'Customize your partner'}
            </h1>
            <p style={{ color: 'var(--text2)', textAlign: 'center', marginBottom: 40 }}>
              {fr ? 'Ces détails enrichiront votre expérience' : 'These details will enrich your experience'}
            </p>

            <ChipRow label={fr ? 'Cheveux' : 'Hair'} options={HAIR} selected={hair} onSelect={setHair} />
            <ChipRow label={fr ? 'Yeux' : 'Eyes'} options={EYES} selected={eyes} onSelect={setEyes} />
            <ChipRow label={fr ? 'Silhouette' : 'Build'} options={BUILD} selected={build} onSelect={setBuild} />
            <ChipRow label="Style" options={STYLE} selected={style} onSelect={setStyle} />

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text2)', padding: '14px',
                fontFamily: 'DM Sans, sans-serif', fontSize: 15, cursor: 'pointer',
              }}>
                {fr ? '← Retour' : '← Back'}
              </button>
              <button onClick={handleFinish} style={{
                flex: 2, background: 'var(--accent)', border: 'none', borderRadius: 10,
                color: '#fff', padding: '14px', fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500, fontSize: 15, cursor: 'pointer',
              }}>
                {fr ? 'Commencer la conversation' : 'Start chatting'} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ChipRow({ label, options, selected, onSelect }: {
  label: string; options: string[]; selected: string | null; onSelect: (v: string) => void
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => onSelect(opt)} style={{
            border: `1px solid ${selected === opt ? 'var(--accent)' : 'var(--border)'}`,
            background: selected === opt ? 'rgba(27,110,243,0.08)' : 'transparent',
            color: selected === opt ? 'var(--accent)' : 'var(--text2)',
            borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, transition: 'all 0.2s ease',
          }}>{opt}</button>
        ))}
      </div>
    </div>
  )
}
