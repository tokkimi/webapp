'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'

const ARTICLES = [
  { id: 1, cat: 'Bien-être', title: 'Comment gérer l\'anxiété au quotidien', excerpt: 'Techniques pratiques et exercices de pleine conscience pour retrouver la sérénité.', date: '10 juin 2026', readTime: '5 min', tag: 'Anxiété' },
  { id: 2, cat: 'Parents', title: 'Comprendre la dépression adolescente', excerpt: 'Reconnaître les signes, briser les tabous et savoir comment réagir en tant que parent.', date: '7 juin 2026', readTime: '8 min', tag: 'Parents' },
  { id: 3, cat: 'Professionnels', title: 'La téléconsultation en santé mentale : enjeux et bonnes pratiques', excerpt: 'Un regard clinique sur le suivi à distance des adolescents en difficulté.', date: '3 juin 2026', readTime: '10 min', tag: 'Pro' },
  { id: 4, cat: 'Bien-être', title: 'Le sommeil et la santé mentale : le lien méconnu', excerpt: 'Pourquoi bien dormir est l\'une des premières choses à soigner pour aller mieux.', date: '28 mai 2026', readTime: '6 min', tag: 'Sommeil' },
  { id: 5, cat: 'Témoignages', title: '«&nbsp;Capsule m\'a aidé à mettre des mots sur ce que je ressentais&nbsp;»', excerpt: 'Léa, 17 ans, raconte comment elle a appris à parler de son mal-être.', date: '20 mai 2026', readTime: '4 min', tag: 'Témoignage' },
  { id: 6, cat: 'Bien-être', title: 'Les 5 piliers du bien-être émotionnel', excerpt: 'Corps, mind, lien social, sens et repos : les bases d\'un équilibre durable.', date: '15 mai 2026', readTime: '7 min', tag: 'Bien-être' },
]

const CATS = ['Tous', 'Bien-être', 'Parents', 'Professionnels', 'Témoignages']

export default function Articles() {
  const [cat, setCat] = useState('Tous')
  const filtered = cat === 'Tous' ? ARTICLES : ARTICLES.filter(a => a.cat === cat)

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111', minHeight: '100vh', background: 'white' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e8f5f4', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.svg" alt="Capsule" width={28} height={28} />
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 16, color: T, letterSpacing: 2.5 }}>CAPSULE</span>
        </Link>
        <Link href="/auth" style={{ padding: '8px 20px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Connexion</Link>
      </nav>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div style={{ marginBottom: 60 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Le blog</p>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(30px,5vw,50px)', fontWeight: 900, color: '#080f0e', marginBottom: 12 }}>Articles & ressources</h1>
          <p style={{ fontSize: 16, color: '#666' }}>Conseils, témoignages et éclairages sur la santé mentale des jeunes.</p>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 48 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '7px 18px', borderRadius: 100, border: `1.5px solid ${cat === c ? T : '#daeeed'}`,
              background: cat === c ? T : 'white', color: cat === c ? 'white' : '#555',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>{c}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filtered.map(a => (
            <article key={a.id} style={{ borderRadius: 20, border: '1px solid #e4f0ef', overflow: 'hidden', background: 'white', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 160, background: 'linear-gradient(135deg, #0c3532, #1a5e58)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>{a.tag}</div>
                  <div style={{ width: 40, height: 2, background: T, margin: '0 auto' }}/>
                </div>
              </div>
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>{a.date} · {a.readTime} de lecture</div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#080f0e', marginBottom: 10, lineHeight: 1.4, flex: 1 }} dangerouslySetInnerHTML={{ __html: a.title }} />
                <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.65, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: a.excerpt }} />
                <Link href={`/articles/${a.id}`} style={{ fontSize: 13, fontWeight: 700, color: T, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                  Lire l&apos;article <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <footer style={{ background: '#080f0e', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>©Capsule 2026 — GACKAO SAS</p>
      </footer>
    </div>
  )
}
