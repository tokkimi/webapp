'use client'

import { useState } from 'react'
import Link from 'next/link'

const AMOUNTS = [5, 10, 20, 50]

const IMPACTS = [
  { amount: 5, desc: 'Permet de maintenir la médiathèque en ligne pendant 1 journée', icon: '📚' },
  { amount: 10, desc: 'Finance l\'envoi d\'une motivation IA pour 10 ados', icon: '✨' },
  { amount: 20, desc: 'Contribue à la vérification de 5 professionnels de santé', icon: '🔵' },
  { amount: 50, desc: 'Soutient le développement de nouveaux outils pour les jeunes', icon: '🚀' },
]

export default function Dons() {
  const [selected, setSelected] = useState<number | null>(null)
  const [custom, setCustom] = useState('')
  const [method, setMethod] = useState<'card' | 'paypal'>('card')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState('')

  const finalAmount = custom ? parseFloat(custom) : selected

  async function handleDonate() {
    if (!finalAmount || finalAmount < 1) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, method, name: anonymous ? 'Anonyme' : name, email, message }),
      })
      const { url } = await res.json()
      if (url) { window.location.href = url } else { setSuccess(true) }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#F8F7FF 0%,#FDF4FF 100%)', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}`}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(248,247,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(124,58,237,0.1)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 18, color: '#7C3AED', textDecoration: 'none' }}>💜 Capsule Ado</Link>
        <Link href="/" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Retour</Link>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#EC4899 100%)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>💜</div>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
          Soutenir Capsule Ado
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
          Capsule Ado est une initiative à but non lucratif. Votre don soutient directement le bien-être mental des adolescents et l'accès gratuit à nos ressources.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 16px 60px' }}>

        {success ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', animation: 'fadeUp 0.5s ease' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 28, fontWeight: 800, color: '#1A1A2E', margin: '0 0 12px' }}>Merci infiniment !</h2>
            <p style={{ color: '#6B7280', fontSize: 16, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 24px' }}>
              Votre générosité aide directement des adolescents qui en ont besoin. Un reçu vous sera envoyé par email.
            </p>
            <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 28 }}>

            {/* Left: Impact */}
            <div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 20, color: '#1A1A2E', margin: '0 0 20px' }}>Votre impact concret</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {IMPACTS.map(imp => (
                  <div key={imp.amount} onClick={() => { setSelected(imp.amount); setCustom('') }}
                    style={{ background: selected === imp.amount ? '#7C3AED' : '#fff', borderRadius: 14, padding: '16px', border: `2px solid ${selected === imp.amount ? '#7C3AED' : '#E5E7EB'}`, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: selected === imp.amount ? 'rgba(255,255,255,0.2)' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {imp.icon}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 16, color: selected === imp.amount ? '#fff' : '#1A1A2E', fontFamily: 'Outfit,sans-serif' }}>
                        {imp.amount} €
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: selected === imp.amount ? 'rgba(255,255,255,0.8)' : '#6B7280', lineHeight: 1.5 }}>{imp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Association info */}
              <div style={{ marginTop: 24, background: '#F9F5FF', borderRadius: 14, padding: '16px', border: '1px solid #EDE9FE' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E', margin: '0 0 6px' }}>🏛️ Association loi 1901</p>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                  Capsule Ado est une association reconnue d'intérêt général. <strong>Vos dons sont déductibles fiscalement à 66%</strong> du montant dans la limite de 20% de votre revenu imposable. Nous vous envoyons un reçu fiscal.
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 18, color: '#1A1A2E', margin: '0 0 20px' }}>Faire un don</h3>

              {/* Amount */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Montant</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {AMOUNTS.map(a => (
                    <button key={a} onClick={() => { setSelected(a); setCustom('') }}
                      style={{ background: selected === a && !custom ? '#7C3AED' : '#F3F4F6', color: selected === a && !custom ? '#fff' : '#374151', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', transition: 'all 0.15s' }}>
                      {a}€
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6B7280', fontSize: 13 }}>Autre montant :</span>
                  <div style={{ position: 'relative' }}>
                    <input type="number" min="1" max="10000" value={custom} onChange={e => { setCustom(e.target.value); setSelected(null) }}
                      placeholder="Ex: 35"
                      style={{ padding: '8px 32px 8px 12px', border: `1.5px solid ${custom ? '#7C3AED' : '#E5E7EB'}`, borderRadius: 10, fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', width: 100 }} />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 14 }}>€</span>
                  </div>
                </div>
              </div>

              {/* Method */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Moyen de paiement</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setMethod('card')}
                    style={{ flex: 1, padding: '12px', background: method === 'card' ? '#7C3AED' : '#F3F4F6', color: method === 'card' ? '#fff' : '#374151', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    💳 Carte bancaire
                  </button>
                  <button onClick={() => setMethod('paypal')}
                    style={{ flex: 1, padding: '12px', background: method === 'paypal' ? '#0070BA' : '#F3F4F6', color: method === 'paypal' ? '#fff' : '#374151', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    🅿️ PayPal
                  </button>
                </div>
              </div>

              {/* Donor info */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <input type="checkbox" id="anon" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
                  <label htmlFor="anon" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>Don anonyme</label>
                </div>
                {!anonymous && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom (pour le reçu fiscal)"
                      style={{ padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (pour recevoir le reçu)"
                      style={{ padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none' }} />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Message (optionnel)</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
                  placeholder="Un mot pour l'équipe…"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              <button onClick={handleDonate} disabled={!finalAmount || finalAmount < 1 || loading}
                style={{ width: '100%', background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 16, fontWeight: 700, cursor: !finalAmount || loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', transition: 'all 0.2s', boxShadow: !finalAmount || loading ? 'none' : '0 4px 20px rgba(124,58,237,0.3)' }}>
                {loading ? 'Redirection…' : `💜 Faire un don de ${finalAmount || '?'}€`}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 12, lineHeight: 1.5 }}>
                🔒 Paiement sécurisé · Données chiffrées · Aucun frais caché<br />
                Reçu fiscal envoyé automatiquement
              </p>
            </div>
          </div>
        )}

        {/* Transparency */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 22, color: '#1A1A2E', margin: '0 0 8px' }}>Notre transparence financière</h2>
          <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 28px' }}>Tous les ans, nous publions notre rapport d'activité et financier.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, maxWidth: 720, margin: '0 auto' }}>
            {[
              { pct: '72%', label: 'Développement produit', color: '#7C3AED' },
              { pct: '18%', label: 'Modération & vérification', color: '#0D9488' },
              { pct: '7%', label: 'Hébergement & sécurité', color: '#2563EB' },
              { pct: '3%', label: 'Frais de gestion', color: '#6B7280' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 16px', border: '1px solid #F3F4F6', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 32, fontWeight: 800, color: s.color, margin: '0 0 4px' }}>{s.pct}</p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
