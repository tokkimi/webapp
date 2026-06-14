'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'

const FAQ = [
  {
    section: 'Général',
    items: [
      { q: 'Capsule est-il gratuit ?', a: 'Oui, l\'accès de base est entièrement gratuit. Le plan Famille+ à 9,99 €/mois débloque la messagerie avec des professionnels, la téléconsultation et le suivi parental.' },
      { q: 'Qui peut s\'inscrire sur Capsule ?', a: 'Capsule est ouvert aux adolescents et jeunes adultes (12-25 ans), à leurs parents, ainsi qu\'aux professionnels de santé mentale certifiés (psychologues, thérapeutes, psychiatres).' },
      { q: 'Mes données sont-elles sécurisées ?', a: 'Oui. Toutes les données sont hébergées en France, chiffrées en transit et au repos. Nous ne partageons jamais vos informations avec des tiers. Conformité RGPD garantie.' },
    ],
  },
  {
    section: 'Abonnements',
    items: [
      { q: 'Puis-je résilier à tout moment ?', a: 'Oui, sans engagement ni frais de résiliation. Votre accès reste actif jusqu\'à la fin de la période payée.' },
      { q: 'Le plan Famille+ couvre-t-il plusieurs enfants ?', a: 'Oui. Le 2e compte est à 6,99 €/mois, chaque compte supplémentaire à 3,99 €/mois.' },
      { q: 'Comment fonctionne l\'abonnement professionnel ?', a: '99 €/mois + 49 € de frais d\'inscription uniques pour vérification et certification du profil. Résiliable à tout moment.' },
    ],
  },
  {
    section: 'Fonctionnalités',
    items: [
      { q: 'Comment fonctionne la messagerie avec les professionnels ?', a: 'Une fois abonné (Famille+), vous pouvez contacter directement un professionnel certifié. Les échanges sont chiffrés et les réponses garanties sous 24h.' },
      { q: 'Qu\'est-ce que la médiathèque ?', a: 'Un espace avec des articles, podcasts, vidéos et exercices validés par des professionnels de santé mentale, organisés par thématiques (anxiété, sommeil, relations, etc.).' },
      { q: 'La téléconsultation est-elle prise en charge par la Sécurité sociale ?', a: 'Actuellement non, mais nous travaillons avec des partenaires pour faciliter le remboursement. Consultez notre page dédiée pour les dernières informations.' },
    ],
  },
  {
    section: 'Urgences',
    items: [
      { q: 'Que faire en cas d\'urgence psychologique ?', a: 'Capsule n\'est pas un service d\'urgence. En cas de crise, appelez le 3114 (numéro national prévention suicide, 24h/24), le 15 (SAMU) ou rendez-vous aux urgences les plus proches.' },
    ],
  },
]

export default function FAQ_Page() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111', minHeight: '100vh', background: 'white' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>

      <nav style={{ borderBottom: '1px solid #e8f5f4', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Capsule" width={34} height={34} style={{ objectFit: 'contain' }} />
        </Link>
        <Link href="/auth" style={{ padding: '8px 20px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Connexion</Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px 96px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>FAQ</p>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(30px,4vw,48px)', fontWeight: 900, color: '#080f0e' }}>Questions fréquentes</h1>
        </div>

        {FAQ.map(section => (
          <div key={section.section} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: T, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>{section.section}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.items.map(item => (
                <div key={item.q} style={{ borderRadius: 14, border: '1px solid #e4f0ef', overflow: 'hidden' }}>
                  <button onClick={() => setOpen(open === item.q ? null : item.q)} style={{
                    width: '100%', textAlign: 'left', padding: '18px 22px', background: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                    fontSize: 15, fontWeight: 600, color: '#080f0e',
                  }}>
                    {item.q}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transition: 'transform .2s', transform: open === item.q ? 'rotate(180deg)' : 'none' }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  {open === item.q && (
                    <div style={{ padding: '0 22px 20px', fontSize: 14.5, color: '#555', lineHeight: 1.75, background: 'white' }}>{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 64, padding: '36px', borderRadius: 20, background: '#f0faf9', border: '1px solid #daeeed', textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#080f0e', marginBottom: 8 }}>Vous n&apos;avez pas trouvé votre réponse ?</p>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>Notre équipe répond sous 24h.</p>
          <Link href="/contact" style={{ display: 'inline-block', padding: '11px 28px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Nous contacter</Link>
        </div>
      </div>

      <footer style={{ background: '#080f0e', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>©Capsule 2026 — GACKAO SAS</p>
      </footer>
    </div>
  )
}
