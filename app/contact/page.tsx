'use client'
import { useState } from 'react'
import Link from 'next/link'

const T = '#30B4A7'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111', minHeight: '100vh', background: 'white' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} input,textarea,select{font-family:inherit}`}</style>

      <nav style={{ borderBottom: '1px solid #e8f5f4', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 18, color: T, letterSpacing: 4 }}>CAPSULE</span>
        </Link>
        <Link href="/auth" style={{ padding: '8px 20px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Connexion</Link>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px 96px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 64, alignItems: 'start' }}>
        {/* Left */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Contact</p>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#080f0e', marginBottom: 20, lineHeight: 1.1 }}>
            Parlons-en
          </h1>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.75, marginBottom: 40 }}>
            Notre équipe répond sous 24h. Pour les urgences médicales, contactez le 15 ou le 3114.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Email général', val: 'contact@capsule-ado.fr' },
              { label: 'Professionnels', val: 'pro@capsule-ado.fr' },
              { label: 'Presse', val: 'presse@capsule-ado.fr' },
            ].map(c => (
              <div key={c.label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 14, color: '#333' }}>{c.val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, padding: '20px', borderRadius: 14, background: '#fff3cd', border: '1px solid #ffc107' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#856404', marginBottom: 4 }}>Urgence psychologique</div>
            <div style={{ fontSize: 13, color: '#856404', lineHeight: 1.6 }}>Appelez le <strong>3114</strong> (numéro national prévention suicide, 24h/24) ou le <strong>15</strong> (SAMU).</div>
          </div>
        </div>

        {/* Form */}
        <div>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '60px 32px', borderRadius: 24, background: '#f0faf9', border: '1px solid #daeeed' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#080f0e', marginBottom: 8 }}>Message envoyé</h3>
              <p style={{ fontSize: 14, color: '#666' }}>Nous vous répondrons dans les 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { key: 'name', label: 'Nom complet', placeholder: 'Jean Dupont', type: 'text' },
                { key: 'email', label: 'Email', placeholder: 'jean@exemple.fr', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type} required placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #daeeed', fontSize: 14, outline: 'none' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Sujet</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #daeeed', fontSize: 14, outline: 'none', background: 'white' }}>
                  <option value="">Sélectionner...</option>
                  <option>Question générale</option>
                  <option>Abonnement & facturation</option>
                  <option>Je suis professionnel</option>
                  <option>Signalement</option>
                  <option>Presse & partenariat</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Message</label>
                <textarea required rows={5} placeholder="Votre message..."
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #daeeed', fontSize: 14, outline: 'none', resize: 'vertical' }}
                />
              </div>
              <button type="submit" style={{ padding: '14px', borderRadius: 100, background: T, color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Envoyer le message
              </button>
            </form>
          )}
        </div>
      </div>

      <footer style={{ background: '#080f0e', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>©Capsule 2026 — GACKAO SAS</p>
      </footer>
    </div>
  )
}
