'use client'
import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'

export default function NotreHistoire() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111', minHeight: '100vh' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e8f5f4', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.svg" alt="Capsule" width={28} height={28} />
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 16, color: T, letterSpacing: 2.5 }}>CAPSULE</span>
        </Link>
        <Link href="/auth" style={{ padding: '8px 20px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Connexion</Link>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(150deg, #082827 0%, #0f3d3a 100%)', padding: '96px 24px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Notre histoire</p>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(34px,5vw,56px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
            Né d&apos;une conviction simple
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.6)', lineHeight: 1.8, maxWidth: 580, margin: '0 auto' }}>
            Des milliers d&apos;adolescents traversent des périodes difficiles sans accès à un soutien professionnel adapté. Capsule est né pour changer ça.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Origine */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#080f0e', marginBottom: 20 }}>L&apos;origine du projet</h2>
            <p style={{ fontSize: 16, color: '#555', lineHeight: 1.85, marginBottom: 16 }}>
              En France, 1 adolescent sur 5 souffre d&apos;un trouble de santé mentale. Pourtant, les délais pour consulter un psychologue dépassent souvent 6 mois. Le coût, la stigmatisation et le manque de ressources adaptées aux jeunes créent un vide béant.
            </p>
            <p style={{ fontSize: 16, color: '#555', lineHeight: 1.85 }}>
              Capsule est né de ce constat. Notre équipe, composée de professionnels de santé mentale, de développeurs et d&apos;anciens ados qui ont traversé des épreuves, a décidé de construire la plateforme qui n&apos;existait pas — accessible, sécurisée, et vraiment pensée pour les jeunes.
            </p>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#080f0e', marginBottom: 36 }}>Notre parcours</h2>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 1, background: '#e4f0ef' }}/>
              {[
                { year: '2024', title: 'Fondation', desc: 'Création de GACKAO SAS. Premiers échanges avec des psychologues, des parents et des ados pour comprendre les vrais besoins.' },
                { year: '2025 — T1', title: 'Développement', desc: 'Construction de la plateforme avec une équipe de 8 personnes. Intégration des premiers professionnels partenaires.' },
                { year: '2025 — T3', title: 'Beta fermée', desc: 'Lancement en beta avec 50 professionnels certifiés et 500 familles. Collecte de retours, itérations rapides.' },
                { year: '2026', title: 'Lancement public', desc: '2 000 jeunes accompagnés. Expansion nationale. Partenariats avec des établissements scolaires et structures de soin.' },
              ].map(e => (
                <div key={e.year} style={{ display: 'flex', gap: 28, marginBottom: 40, position: 'relative' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: T, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'white' }}/>
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T, letterSpacing: 1, marginBottom: 4 }}>{e.year}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#080f0e', marginBottom: 8 }}>{e.title}</div>
                    <p style={{ fontSize: 14.5, color: '#666', lineHeight: 1.7 }}>{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Valeurs */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#080f0e', marginBottom: 28 }}>Nos valeurs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {[
                { title: 'Confidentialité', desc: 'Chaque échange est chiffré. Vos données ne seront jamais partagées sans votre consentement.' },
                { title: 'Accessibilité', desc: 'Un accès gratuit pour tous. La santé mentale ne devrait pas être un luxe.' },
                { title: 'Bienveillance', desc: 'Pas de jugement. Un espace sécurisé où chacun peut s\'exprimer librement.' },
                { title: 'Excellence', desc: 'Des professionnels certifiés, un contenu validé cliniquement, une qualité irréprochable.' },
              ].map(v => (
                <div key={v.title} style={{ padding: '24px', borderRadius: 16, background: '#f8fcfb', border: '1px solid #daeeed' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#080f0e', marginBottom: 8 }}>{v.title}</div>
                  <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.65 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '48px', borderRadius: 24, background: 'linear-gradient(135deg, #0c3532, #0f3d3a)', border: '1px solid rgba(48,180,167,.2)' }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 12 }}>Rejoignez la communauté</h3>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', marginBottom: 28 }}>Créez un compte gratuit et découvrez Capsule dès aujourd&apos;hui.</p>
            <Link href="/auth?mode=register" style={{ display: 'inline-block', padding: '13px 32px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Créer un compte gratuit</Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#080f0e', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>©Capsule 2026 — GACKAO SAS · <Link href="/cgv" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>CGV</Link></p>
      </footer>
    </div>
  )
}
