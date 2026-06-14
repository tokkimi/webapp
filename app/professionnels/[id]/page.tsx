'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const T = '#30B4A7'
const DARK = '#082827'

export default function ProfessionalProfilePage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createSupabaseBrowserClient()
  const [pro, setPro] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('public_professionals').select('*').eq('id', id).single()
      .then(({ data }) => { setPro(data); setLoading(false) })
  }, [id]) // eslint-disable-line

  if (loading) return <main style={{ padding: 40 }}>Chargement...</main>
  if (!pro) return <main style={{ padding: 40 }}>Ce profil professionnel n’est pas disponible.</main>

  return (
    <div style={{ minHeight: '100vh', background: '#f5fafa', fontFamily: 'Inter,sans-serif', color: DARK }}>
      <nav style={{ height: 60, background: '#fff', borderBottom: '1px solid #daeeed', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
        <Link href="/trouver-un-pro" style={{ color: T, textDecoration: 'none', fontWeight: 700 }}>Retour aux professionnels</Link>
      </nav>
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 16px 80px' }}>
        <section style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 24, padding: 28 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            {pro.avatar_url
              ? <img src={pro.avatar_url} alt={pro.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 96, height: 96, borderRadius: '50%', background: T, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 34, fontWeight: 800 }}>{pro.name?.[0]}</div>}
            <div style={{ flex: 1 }}>
              <span style={{ color: T, fontSize: 12, fontWeight: 800 }}>PROFIL VERIFIE</span>
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 30, margin: '5px 0' }}>{pro.name}</h1>
              <p style={{ margin: 0, color: '#64748b' }}>{pro.specialty}{pro.location ? ` - ${pro.location}` : ''}</p>
              <p style={{ color: '#b7791f', fontWeight: 700 }}>{Number(pro.rating || 0).toFixed(1)} / 5 · {pro.rating_count || 0} avis</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5f2f0', marginTop: 24, paddingTop: 24 }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif' }}>A propos</h2>
            <p style={{ color: '#475569', lineHeight: 1.7 }}>{pro.bio || 'Ce professionnel complete actuellement sa presentation.'}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginTop: 20 }}>
            <Info label="Experience" value={pro.years_experience ? `${pro.years_experience} ans` : 'Non renseignee'} />
            <Info label="Public accompagne" value={pro.age_range || 'Adolescents et familles'} />
            <Info label="Tarif indicatif" value={pro.price_min ? `${pro.price_min} a ${pro.price_max || pro.price_min} EUR` : 'A confirmer'} />
          </div>

          <Link href={`/appointments?pro=${encodeURIComponent(pro.id)}`} style={{ display: 'block', marginTop: 26, background: T, color: '#fff', borderRadius: 99, padding: 14, textAlign: 'center', textDecoration: 'none', fontWeight: 800 }}>
            Voir les creneaux disponibles
          </Link>
        </section>
      </main>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div style={{ background: '#f5fafa', borderRadius: 13, padding: 15 }}><div style={{ color: '#64748b', fontSize: 11 }}>{label}</div><strong>{value}</strong></div>
}
