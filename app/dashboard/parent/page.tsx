'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const MOODS = ['😭','😢','😟','😕','😐','🙂','😊','😄','🤩','🌟']
const MOOD_COLORS = ['#EF4444','#F97316','#F59E0B','#EAB308','#84CC16','#22C55E','#10B981','#06B6D4','#7C3AED','#EC4899']

export default function ParentDashboard() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [profile, setProfile] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [tip] = useState(() => {
    const tips = [
      'Écouter sans juger est souvent la meilleure chose que vous puissiez faire pour votre adolescent.',
      'Proposez des activités partagées sans pression : cuisine, promenade, film ensemble.',
      'Respectez l\'intimité de votre ado tout en restant disponible. La confiance se construit dans la durée.',
      'Si votre enfant n\'a pas envie de parler, dites-lui simplement « Je suis là si tu veux. »',
      'Les ados ont besoin de se sentir compétents : valorisez leurs efforts, pas seulement leurs résultats.',
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  })

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof?.profile_type && prof.profile_type !== 'parent') {
      router.replace(`/dashboard/${prof.profile_type}`); return
    }
    setProfile(prof)

    // Fetch linked children
    const { data: links } = await supabase.from('family_links').select(`
      *, ado:profiles!family_links_ado_id_fkey(id, name, avatar_url, created_at)
    `).eq('parent_id', user.id).eq('status', 'active')

    if (links) {
      // For each ado with mood sharing, fetch latest mood
      const childData = await Promise.all(links.map(async (link: any) => {
        let lastMood = null
        if (link.share_mood) {
          const { data: mood } = await supabase.from('mood_entries').select('score, created_at')
            .eq('user_id', link.ado_id).order('created_at', { ascending: false }).limit(1).single()
          lastMood = mood
        }
        return { ...link, lastMood }
      }))
      setChildren(childData)
    }

    // Fetch pending invites
    const { data: pending } = await supabase.from('family_links').select('*').eq('parent_id', user.id).eq('status', 'pending')
    setPendingInvites(pending || [])

    // Fetch upcoming appointments
    const { data: apts } = await supabase.from('appointments').select(`
      *, pro:profiles!appointments_pro_id_fkey(name, specialty, avatar_url)
    `).eq('patient_id', user.id).gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true }).limit(5)
    setAppointments(apts || [])

    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(() => { load() }, [load])

  async function useInviteCode() {
    setInviteError('')
    if (!inviteCode.trim()) return
    const res = await fetch('/api/link-family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: inviteCode.trim(), action: 'use' }),
    })
    const data = await res.json()
    if (!res.ok) { setInviteError(data.error || 'Code invalide'); return }
    setInviteSuccess(true)
    setInviteCode('')
    load()
  }

  async function generateInviteCode() {
    const res = await fetch('/api/link-family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate' }),
    })
    const data = await res.json()
    if (data.invite_code) setInviteCode(data.invite_code)
  }

  const firstName = profile?.name?.split(' ')[0] || 'vous'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bonsoir' : 'Bonsoir'

  if (loading) return (
    <div style={{ minHeight:'100vh',background:'#F0FDFA',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44,height:44,border:'3px solid #CCFBF1',borderTopColor:'#0D9488',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 14px' }} />
        <p style={{ color:'#0D9488',fontFamily:'Inter,sans-serif',margin:0 }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#F0FDFA 0%,#EFF6FF 100%)',fontFamily:'Inter,sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .pcard{background:rgba(255,255,255,0.88);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(255,255,255,0.6);box-shadow:0 4px 24px rgba(13,148,136,0.06);transition:all 0.2s;}
        .pcard:hover{box-shadow:0 8px 28px rgba(13,148,136,0.12);transform:translateY(-2px);}
        .btn-teal{background:linear-gradient(135deg,#0D9488,#2563EB);color:#fff;border:none;border-radius:12px;padding:10px 20px;font-family:Inter,sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:opacity 0.2s;}
        .btn-teal:hover{opacity:0.88;}
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(240,253,250,0.92)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(13,148,136,0.1)',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:18,color:'#0D9488',textDecoration:'none' }}>💚 Capsule Ado</Link>
        <div style={{ display:'flex',alignItems:'center',gap:16 }}>
          <Link href="/appointments" style={{ fontSize:13,color:'#374151',textDecoration:'none',fontWeight:500 }}>📅 Rendez-vous</Link>
          <Link href="/mediatheque" style={{ fontSize:13,color:'#374151',textDecoration:'none',fontWeight:500 }}>📚 Ressources</Link>
          <Link href="/profile" style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#0D9488,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none' }}>
            {(firstName[0]||'?').toUpperCase()}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth:1000,margin:'0 auto',padding:'28px 16px 60px' }}>

        {/* Header */}
        <div style={{ animation:'fadeUp 0.5s ease',marginBottom:24 }}>
          <h1 style={{ fontFamily:'Outfit,sans-serif',fontSize:26,fontWeight:800,color:'#1A1A2E',margin:'0 0 4px' }}>
            {greeting}, <span style={{ background:'linear-gradient(135deg,#0D9488,#2563EB)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>{firstName}</span>
          </h1>
          <p style={{ color:'#6B7280',fontSize:13,margin:0 }}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</p>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:18 }}>

          {/* Conseil du jour */}
          <div style={{ gridColumn:'1/-1',animation:'fadeUp 0.5s ease 0.1s both' }}>
            <div style={{ background:'linear-gradient(135deg,#0D9488,#2563EB)',borderRadius:20,padding:'24px 28px',display:'flex',gap:16,alignItems:'flex-start' }}>
              <span style={{ fontSize:32,flexShrink:0 }}>💡</span>
              <div>
                <p style={{ color:'rgba(255,255,255,0.8)',fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 6px' }}>Conseil du jour</p>
                <p style={{ color:'#fff',fontSize:15,lineHeight:1.65,margin:0,fontFamily:'Outfit,sans-serif',fontWeight:500 }}>{tip}</p>
              </div>
            </div>
          </div>

          {/* Mes enfants */}
          <div className="pcard" style={{ gridColumn:'1/-1',padding:24,animation:'fadeUp 0.5s ease 0.15s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:16,color:'#1A1A2E',margin:0 }}>👨‍👩‍👦 Ma famille liée</h3>
              <button onClick={generateInviteCode} className="btn-teal" style={{ fontSize:13,padding:'8px 14px' }}>+ Lier un enfant</button>
            </div>

            {inviteCode && (
              <div style={{ background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:14,padding:'16px',marginBottom:16 }}>
                <p style={{ fontSize:13,color:'#166534',fontWeight:600,margin:'0 0 8px' }}>Code d'invitation généré :</p>
                <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                  <span style={{ fontFamily:'monospace',fontSize:22,fontWeight:800,color:'#15803D',letterSpacing:'0.15em' }}>{inviteCode}</span>
                  <button onClick={() => navigator.clipboard.writeText(inviteCode)} style={{ background:'#16A34A',color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',fontSize:12,cursor:'pointer' }}>Copier</button>
                </div>
                <p style={{ fontSize:12,color:'#4B7A4B',margin:'8px 0 0' }}>Envoyez ce code à votre enfant. Il pourra l'utiliser dans son espace Capsule Ado pour vous lier.</p>
              </div>
            )}

            {inviteSuccess && (
              <div style={{ background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:10,padding:'12px 16px',marginBottom:14 }}>
                <p style={{ color:'#166534',fontSize:13,margin:0,fontWeight:600 }}>✅ Lien famille établi avec succès !</p>
              </div>
            )}

            {children.length === 0 ? (
              <div style={{ textAlign:'center',padding:'24px 0' }}>
                <p style={{ color:'#9CA3AF',fontSize:14 }}>Aucun enfant lié pour l'instant.</p>
                <p style={{ color:'#6B7280',fontSize:13 }}>Générez un code et envoyez-le à votre adolescent.</p>
              </div>
            ) : (
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12 }}>
                {children.map((child: any) => (
                  <div key={child.id} style={{ background:'linear-gradient(135deg,#F0FDFA,#EFF6FF)',borderRadius:14,padding:'16px',border:'1px solid #CCFBF1' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                      <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#0D9488,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:14 }}>
                        {(child.ado?.name?.[0]||'?').toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin:0,fontWeight:700,fontSize:14,color:'#1A1A2E' }}>{child.ado?.name}</p>
                        <p style={{ margin:0,fontSize:11,color:'#6B7280' }}>Lié·e</p>
                      </div>
                    </div>
                    {child.share_mood && child.lastMood ? (
                      <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                        <span style={{ fontSize:20 }}>{MOODS[child.lastMood.score-1]}</span>
                        <div>
                          <p style={{ margin:0,fontSize:12,color:'#374151',fontWeight:500 }}>Humeur partagée</p>
                          <p style={{ margin:0,fontSize:11,color:MOOD_COLORS[child.lastMood.score-1],fontWeight:600 }}>Score : {child.lastMood.score}/10</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize:12,color:'#9CA3AF',margin:0 }}>Partage d'humeur non activé</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prochains RDV */}
          <div className="pcard" style={{ padding:24,animation:'fadeUp 0.5s ease 0.2s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:16,color:'#1A1A2E',margin:0 }}>📅 Prochains rendez-vous</h3>
              <Link href="/appointments" style={{ fontSize:12,color:'#0D9488',textDecoration:'none',fontWeight:600 }}>Gérer →</Link>
            </div>
            {appointments.length === 0 ? (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <p style={{ color:'#9CA3AF',fontSize:13,marginBottom:12 }}>Aucun rendez-vous à venir</p>
                <Link href="/appointments" className="btn-teal" style={{ display:'inline-block',textDecoration:'none',fontSize:13,padding:'8px 16px',borderRadius:10 }}>
                  Trouver un professionnel
                </Link>
              </div>
            ) : appointments.slice(0,3).map((apt:any) => (
              <div key={apt.id} style={{ marginBottom:10,padding:'12px 14px',background:'#F0FDFA',borderRadius:12,border:'1px solid #CCFBF1' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                  <div>
                    <p style={{ margin:'0 0 2px',fontWeight:600,fontSize:13,color:'#1A1A2E' }}>{apt.pro?.name}</p>
                    <p style={{ margin:0,fontSize:11,color:'#6B7280' }}>{apt.pro?.specialty}</p>
                  </div>
                  <span style={{ fontSize:11,padding:'3px 8px',borderRadius:100,background: apt.status==='confirmed'?'#D1FAE5':apt.status==='pending'?'#FEF3C7':'#FEE2E2', color:apt.status==='confirmed'?'#065F46':apt.status==='pending'?'#92400E':'#991B1B',fontWeight:600 }}>
                    {apt.status==='confirmed'?'Confirmé':apt.status==='pending'?'En attente':'Annulé'}
                  </span>
                </div>
                <p style={{ margin:'6px 0 0',fontSize:12,color:'#0D9488',fontWeight:500 }}>
                  📅 {new Date(apt.scheduled_at).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="pcard" style={{ padding:24,animation:'fadeUp 0.5s ease 0.25s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:16,color:'#1A1A2E',margin:'0 0 16px' }}>🔗 Actions rapides</h3>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {[
                { href:'/appointments',icon:'🔍',label:'Trouver un professionnel',sub:'Psychologues, éducateurs, médecins' },
                { href:'/mediatheque',icon:'📚',label:'Médiathèque parents',sub:'Articles et ressources pour vous' },
                { href:'/profile',icon:'⚙️',label:'Mon profil',sub:'Paramètres et confidentialité' },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'#F0FDFA',borderRadius:12,border:'1px solid #CCFBF1',textDecoration:'none',transition:'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='#CCFBF1'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='#F0FDFA'}>
                  <span style={{ fontSize:22 }}>{a.icon}</span>
                  <div>
                    <p style={{ margin:0,fontWeight:600,fontSize:13,color:'#1A1A2E' }}>{a.label}</p>
                    <p style={{ margin:0,fontSize:11,color:'#6B7280' }}>{a.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Abonnement */}
          <div className="pcard" style={{ padding:24,animation:'fadeUp 0.5s ease 0.3s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:16,color:'#1A1A2E',margin:'0 0 14px' }}>💳 Mon abonnement</h3>
            <div style={{ background:'linear-gradient(135deg,#0D9488,#2563EB)',borderRadius:14,padding:'18px 20px',marginBottom:14 }}>
              <p style={{ color:'rgba(255,255,255,0.8)',fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 4px' }}>Plan Famille</p>
              <p style={{ color:'#fff',fontSize:22,fontWeight:800,fontFamily:'Outfit,sans-serif',margin:'0 0 4px' }}>9,90€ <span style={{ fontSize:14,fontWeight:400 }}>/mois</span></p>
              <p style={{ color:'rgba(255,255,255,0.7)',fontSize:12,margin:0 }}>Accès complet · Lien famille · RDV prioritaires</p>
            </div>
            <Link href="/profile#subscription" style={{ display:'block',textAlign:'center',color:'#0D9488',fontSize:13,fontWeight:600,textDecoration:'none' }}>Gérer mon abonnement →</Link>
          </div>

        </div>
      </div>
    </div>
  )
}
