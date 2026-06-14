'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'
const TD = '#1e8a80'

const AMOUNTS = [5, 10, 20, 50]

const IMPACTS = [
  { amount: 5,  label: '5 €',  desc: 'Médiathèque en ligne pendant 1 journée pour tous les ados' },
  { amount: 10, label: '10 €', desc: 'Motivations quotidiennes pour 10 adolescents pendant 1 semaine' },
  { amount: 20, label: '20 €', desc: 'Vérification de 5 professionnels de santé certifiés' },
  { amount: 50, label: '50 €', desc: 'Développement de nouveaux outils de bien-être pour les jeunes' },
]

export default function Dons() {
  const [selected, setSelected] = useState<number | null>(10)
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  const finalAmount = custom ? parseFloat(custom) : selected

  async function handleDonate() {
    if (!finalAmount || finalAmount < 1) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, method: 'card', name: anonymous ? 'Anonyme' : name, email, message }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} input,textarea{font-family:inherit}`}</style>

      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e8f5f4', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Capsule" width={34} height={34} style={{ objectFit: 'contain' }} />
        </Link>
        <Link href="/" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Retour</Link>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(150deg, #082827 0%, #0f3d3a 100%)', padding: '72px 24px 64px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Soutenez Capsule</p>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
          Chaque don compte
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
          Capsule est une plateforme engagée. Vos dons permettent de garder l&apos;accès gratuit pour les ados qui en ont le plus besoin.
        </p>
      </section>

      {/* Main */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 96px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

        {/* Left — Impact */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#080f0e', marginBottom: 8 }}>Votre impact</h2>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 32 }}>
            100% des dons sont reversés au fonctionnement de la plateforme et au développement de nouvelles fonctionnalités.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {IMPACTS.map(i => (
              <div key={i.amount} onClick={() => { setSelected(i.amount); setCustom('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 14, cursor: 'pointer',
                  background: selected === i.amount && !custom ? `rgba(48,180,167,.08)` : '#f8fcfb',
                  border: `1.5px solid ${selected === i.amount && !custom ? T : '#e4f0ef'}`,
                  transition: 'all .15s',
                }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 900, color: T, minWidth: 48 }}>{i.label}</div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{i.desc}</p>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div style={{ marginTop: 32, padding: '20px', borderRadius: 14, background: '#f8fcfb', border: '1px solid #daeeed' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#080f0e', marginBottom: 8 }}>Paiement 100% sécurisé</div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.65 }}>
              Vos données bancaires sont traitées par Stripe, jamais stockées sur nos serveurs. Reçu fiscal disponible sur demande. GACKAO SAS — siège social en France.
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ background: '#f8fcfb', border: '1px solid #daeeed', borderRadius: 20, padding: '32px 28px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#080f0e', marginBottom: 24 }}>Faire un don</h2>

          {/* Montants */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
            {AMOUNTS.map(a => (
              <button key={a} onClick={() => { setSelected(a); setCustom('') }}
                style={{
                  padding: '10px 0', borderRadius: 10, border: `1.5px solid ${selected === a && !custom ? T : '#daeeed'}`,
                  background: selected === a && !custom ? T : 'white', color: selected === a && !custom ? 'white' : '#333',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}>{a} €</button>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <input type="number" min="1" placeholder="Autre montant (€)"
              value={custom} onChange={e => { setCustom(e.target.value); setSelected(null) }}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${custom ? T : '#daeeed'}`, fontSize: 14, outline: 'none', background: 'white' }}
            />
          </div>

          <div style={{ height: 1, background: '#e4f0ef', marginBottom: 20 }}/>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555', marginBottom: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
            Don anonyme
          </label>

          {!anonymous && (
            <>
              <input type="text" placeholder="Votre prénom" value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #daeeed', fontSize: 14, marginBottom: 10, outline: 'none', background: 'white' }}
              />
              <input type="email" placeholder="Email (pour le reçu)" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #daeeed', fontSize: 14, marginBottom: 10, outline: 'none', background: 'white' }}
              />
            </>
          )}

          <textarea placeholder="Un message ? (optionnel)" value={message} onChange={e => setMessage(e.target.value)} rows={2}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #daeeed', fontSize: 14, marginBottom: 20, outline: 'none', resize: 'none', background: 'white' }}
          />

          <button onClick={handleDonate} disabled={!finalAmount || finalAmount < 1 || loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: (!finalAmount || finalAmount < 1) ? '#ccc' : T,
              color: 'white', fontWeight: 700, fontSize: 15,
              boxShadow: finalAmount && finalAmount >= 1 ? `0 6px 20px rgba(48,180,167,.3)` : 'none',
            }}>
            {loading ? 'Redirection...' : `Donner ${finalAmount ? finalAmount + ' €' : ''} par carte`}
          </button>

          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 12 }}>
            Paiement sécurisé par Stripe · Pas d&apos;abonnement caché
          </p>
        </div>
      </div>

      <footer style={{ background: '#080f0e', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>©Capsule 2026 — GACKAO SAS · <Link href="/cgv" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>CGV</Link></p>
      </footer>
    </div>
  )
}
