'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'

function Countdown() {
  const target = new Date('2026-09-01T00:00:00Z')
  const [diff, setDiff] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const d = Math.max(0, target.getTime() - now)
      setDiff({
        days:    Math.floor(d / 86400000),
        hours:   Math.floor((d % 86400000) / 3600000),
        minutes: Math.floor((d % 3600000)  / 60000),
        seconds: Math.floor((d % 60000)    / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
      {[
        { v: diff.days,    l: 'jours' },
        { v: diff.hours,   l: 'heures' },
        { v: diff.minutes, l: 'minutes' },
        { v: diff.seconds, l: 'secondes' },
      ].map(({ v, l }) => (
        <div key={l} style={{ textAlign: 'center', minWidth: 80 }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, color: 'white', lineHeight: 1 }}>
            {String(v).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 6 }}>{l}</div>
        </div>
      ))}
    </div>
  )
}

export default function NotreHistoire() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111', minHeight: '100vh' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e8f5f4', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Capsule" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 16, color: T, letterSpacing: 2 }}>CAPSULE</span>
        </Link>
        <Link href="/auth?mode=register" style={{ padding: '8px 20px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Rejoindre</Link>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(150deg, #082827 0%, #0c3532 50%, #0f3d3a 100%)', padding: '96px 24px 80px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>Notre histoire</p>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(36px,6vw,68px)', fontWeight: 900, color: 'white', lineHeight: 1.05, marginBottom: 20 }}>
          Né d&apos;une conviction,<br/>construit avec passion
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,.55)', maxWidth: 540, margin: '0 auto 56px', lineHeight: 1.75 }}>
          Capsule, c&apos;est l&apos;histoire d&apos;une équipe convaincue que la santé mentale des ados mérite mieux.
        </p>
        {/* Logo central */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(48,180,167,.12)', border: '1px solid rgba(48,180,167,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src="/logo.png" alt="Capsule" width={64} height={64} style={{ objectFit: 'contain' }} />
          </div>
        </div>
      </section>

      {/* Countdown lancement */}
      <section style={{ background: T, padding: '56px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Lancement officiel</p>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: 'white', marginBottom: 36 }}>
          1er septembre 2026 — Capsule ouvre ses portes
        </h2>
        <Countdown />
        <div style={{ marginTop: 36 }}>
          <Link href="/auth?mode=register" style={{ display: 'inline-block', padding: '13px 32px', borderRadius: 100, background: 'white', color: T, textDecoration: 'none', fontWeight: 800, fontSize: 15 }}>
            Rejoindre en avant-première
          </Link>
        </div>
      </section>

      {/* Chiffres */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center', marginBottom: 72 }}>
            {[
              { n: '1/5', label: 'ados souffre d\'un trouble mental en France' },
              { n: '6 mois', label: 'délai moyen pour consulter un psy' },
              { n: '2 000+', label: 'jeunes accompagnés en beta' },
              { n: '50+', label: 'professionnels certifiés' },
            ].map(s => (
              <div key={s.n} style={{ padding: '28px 20px', borderRadius: 16, background: '#f8fcfb', border: '1px solid #daeeed' }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 38, fontWeight: 900, color: T, lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Origine */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 80 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Le constat</p>
              <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, color: '#080f0e', marginBottom: 16, lineHeight: 1.2 }}>
                Un vide qu&apos;il fallait combler
              </h2>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.8 }}>
                Des milliers d&apos;ados traversent des crises silencieuses. Les délais d&apos;attente chez les psys, le coût des consultations, la peur du jugement — autant de barrières que Capsule a été construit pour lever.
              </p>
            </div>
            {/* Visual */}
            <div style={{ background: 'linear-gradient(135deg, #082827, #1a5e58)', borderRadius: 24, padding: '40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Accessibilité', 'Un accès gratuit pour tous'],
                ['Confidentialité', 'Zéro jugement, zéro partage'],
                ['Proximité', 'Des pros à portée de message'],
              ].map(([t, d]) => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T, marginTop: 5, flexShrink: 0 }}/>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2 }}>{t}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ background: '#f0faf9', padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Notre parcours</p>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, color: '#080f0e' }}>2 ans pour changer les choses</h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: '#daeeed' }}/>
            {[
              { year: '2024', title: 'La graine est plantée', desc: 'Premiers échanges avec des psys, des parents et des ados. Création de GACKAO SAS.' },
              { year: 'T1 2025', title: 'L\'équipe se forme', desc: '8 personnes réunies autour d\'une mission commune. Prototypage intensif.' },
              { year: 'T3 2025', title: 'Beta privée', desc: '50 professionnels, 500 familles. Premiers retours, premières larmes de joie.' },
              { year: 'Sep 2026', title: 'Lancement national', desc: 'Capsule ouvre ses portes à tous. Le compte à rebours tourne.', current: true },
            ].map(e => (
              <div key={e.year} style={{ display: 'flex', gap: 24, marginBottom: 36, position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: e.current ? T : 'white', border: `2px solid ${T}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                  {e.current && <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white' }}/>}
                  {!e.current && <div style={{ width: 10, height: 10, borderRadius: '50%', background: T }}/>}
                </div>
                <div style={{ paddingTop: 8, paddingBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 1, marginBottom: 4 }}>{e.year}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#080f0e', marginBottom: 4 }}>{e.title}</div>
                  <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.65 }}>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(150deg, #082827, #0f3d3a)', padding: '80px 24px', textAlign: 'center' }}>
        <Image src="/logo.png" alt="Capsule" width={56} height={56} style={{ objectFit: 'contain', marginBottom: 20 }} />
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, color: 'white', marginBottom: 12 }}>
          Faites partie de l&apos;aventure
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', marginBottom: 32 }}>Inscription gratuite. Disponible maintenant en avant-première.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth?mode=register" style={{ padding: '13px 32px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Créer un compte gratuit</Link>
          <Link href="/dons" style={{ padding: '13px 28px', borderRadius: 100, border: '1px solid rgba(255,255,255,.2)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>Nous soutenir</Link>
        </div>
      </section>

      <footer style={{ background: '#080f0e', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>©Capsule 2026 — GACKAO SAS · <Link href="/cgv" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>CGV</Link></p>
      </footer>
    </div>
  )
}
