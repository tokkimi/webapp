'use client'
import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'

export default function Professionnels() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111', minHeight: '100vh' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #e8f5f4', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Capsule" width={28} height={28} />
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 16, color: T, letterSpacing: 2.5 }}>CAPSULE</span>
        </Link>
        <Link href="/auth?mode=register&type=pro" style={{ padding: '8px 20px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Rejoindre Capsule Pro</Link>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(150deg, #082827 0%, #0f3d3a 100%)', padding: '96px 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 24, padding: '5px 14px', borderRadius: 100, background: 'rgba(48,180,167,.12)', border: '1px solid rgba(48,180,167,.25)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 1.5, textTransform: 'uppercase' }}>Capsule Pro</span>
            </div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
              Étendez votre pratique avec Capsule
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', lineHeight: 1.8, marginBottom: 36 }}>
              Rejoignez 50+ professionnels certifiés qui accompagnent des adolescents via notre plateforme sécurisée.
            </p>
            <Link href="/auth?mode=register&type=pro" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15, boxShadow: '0 6px 24px rgba(48,180,167,.35)' }}>
              Créer mon profil professionnel
            </Link>
          </div>
          <div style={{ background: 'rgba(48,180,167,.06)', border: '1px solid rgba(48,180,167,.15)', borderRadius: 24, padding: '36px 32px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 20 }}>Votre tableau de bord</div>
            {[
              ['Patients actifs', '24'],
              ['RDV cette semaine', '8'],
              ['Messages en attente', '3'],
              ['Évaluations reçues', '4.9 / 5'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.55)' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'white', padding: '88px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: '#080f0e', marginBottom: 12 }}>Tout ce dont vous avez besoin</h2>
            <p style={{ fontSize: 15, color: '#666' }}>Une plateforme pensée pour les professionnels de santé mentale.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { title: 'Profil certifié', desc: 'Votre profil est visible par les familles après vérification de votre numéro ADELI/RPPS. Construisez votre réputation en ligne.' },
              { title: 'Gestion de patients', desc: 'Suivez vos patients, consultez l\'historique des séances, prenez des notes sécurisées, gérez les accès et les partages.' },
              { title: 'Téléconsultation intégrée', desc: 'Des séances vidéo directement dans la plateforme. Agenda en ligne, rappels automatiques, facturation simplifiée.' },
              { title: 'Messagerie sécurisée', desc: 'Échangez avec vos patients en toute sécurité. Messagerie chiffrée, partage de ressources, suivi entre les séances.' },
              { title: 'Tableau de bord analytique', desc: 'Statistiques de votre activité, évolution des patients, disponibilités et gestion de planning centralisée.' },
              { title: 'Support dédié', desc: 'Une équipe à votre disposition pour toute question technique ou clinique. Réponse garantie sous 4h.' },
            ].map(f => (
              <div key={f.title} style={{ padding: '28px 24px', borderRadius: 18, background: '#f8fcfb', border: '1px solid #daeeed' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: T, marginBottom: 16 }}/>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#080f0e', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarif */}
      <section style={{ background: '#f0faf9', padding: '80px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: '#080f0e', marginBottom: 12 }}>Un tarif transparent</h2>
          <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', border: '1px solid #daeeed', marginTop: 40 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 52, fontWeight: 900, color: T, lineHeight: 1 }}>99 €</div>
            <div style={{ fontSize: 15, color: '#aaa', marginTop: 6, marginBottom: 8 }}>/ mois</div>
            <div style={{ fontSize: 13, color: '#bbb', marginBottom: 32 }}>+ 49 € de frais d&apos;inscription (une seule fois)</div>
            {['Profil certifié & visible', 'Patients illimités', 'Téléconsultation incluse', 'Messagerie sécurisée', 'Support prioritaire', 'Résiliation sans engagement'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#444', marginBottom: 12, textAlign: 'left' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                {f}
              </div>
            ))}
            <Link href="/auth?mode=register&type=pro" style={{ display: 'block', marginTop: 32, padding: '14px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#080f0e', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>©Capsule 2026 — GACKAO SAS · <Link href="/cgv" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>CGV</Link></p>
      </footer>
    </div>
  )
}
