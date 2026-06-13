'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

// PARENT colors: Fuchsia palette
const C = {
  primary:   'rgb(217, 70, 239)',
  primary50: 'rgba(217,70,239,0.5)',
  primary15: 'rgba(217,70,239,0.15)',
  primary08: 'rgba(217,70,239,0.08)',
  light:     'rgb(240, 171, 252)',
  dark:      'rgb(162, 28, 175)',
  grad:      'linear-gradient(135deg, rgb(217,70,239), rgb(162,28,175))',
}

const MOODS = ['😭','😢','😟','😕','😐','🙂','😊','😄','🤩','🌟']
const MOOD_COLORS = ['#EF4444','#F97316','#F59E0B','#EAB308','#84CC16','#22C55E','#10B981','#06B6D4','rgb(127,217,208)','rgb(163,251,246)']

export default function ParentDashboard() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [profile, setProfile]       = useState<any>(null)
  const [children, setChildren]     = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [tip] = useState(()=>{
    const tips = [
      'Écouter sans juger est souvent la meilleure chose que vous puissiez faire pour votre adolescent.',
      'Proposez des activités partagées sans pression : cuisine, promenade, film ensemble.',
      'Respectez l\'intimité de votre ado tout en restant disponible. La confiance se construit dans la durée.',
      'Si votre enfant n\'a pas envie de parler, dites-lui simplement « Je suis là si tu veux. »',
      'Les ados ont besoin de se sentir compétents : valorisez leurs efforts, pas seulement leurs résultats.',
    ]
    return tips[Math.floor(Math.random()*tips.length)]
  })

  const load = useCallback(async () => {
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }

    const { data:prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof?.profile_type && prof.profile_type !== 'parent') {
      router.replace(`/dashboard/${prof.profile_type}`); return
    }
    setProfile(prof)

    const { data:links } = await supabase.from('family_links').select(`
      *, ado:profiles!family_links_ado_id_fkey(id,name,avatar_url)
    `).eq('parent_id', user.id).eq('status','active')

    if (links) {
      const childData = await Promise.all(links.map(async (link:any) => {
        let lastMood = null
        if (link.share_mood) {
          const { data:mood } = await supabase.from('mood_entries').select('score,created_at')
            .eq('user_id', link.ado_id).order('created_at',{ascending:false}).limit(1).single()
          lastMood = mood
        }
        return { ...link, lastMood }
      }))
      setChildren(childData)
    }

    const { data:apts } = await supabase.from('appointments').select(`
      *, pro:profiles!appointments_pro_id_fkey(name,specialty)
    `).eq('patient_id', user.id).gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at',{ascending:true}).limit(5)
    setAppointments(apts||[])
    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(()=>{ load() },[load])

  async function generateInviteCode() {
    const res = await fetch('/api/link-family',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'generate'}) })
    const data = await res.json()
    if (data.invite_code) setInviteCode(data.invite_code)
  }

  const firstName = profile?.name?.split(' ')[0]||'vous'
  const hour = new Date().getHours()
  const greeting = hour<12?'Bonjour':hour<18?'Bonjour':'Bonsoir'

  if (loading) return (
    <div style={{ minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44,height:44,border:`3px solid ${C.primary15}`,borderTopColor:C.primary,borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 14px' }} />
        <p style={{ color:C.light,fontFamily:'Inter,sans-serif',margin:0,fontSize:14 }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh',background:'#0a0a0a',fontFamily:'Inter,sans-serif',color:'#f3f4f6' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
        .pc{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;transition:all 0.2s;}
        .pc:hover{background:rgba(255,255,255,0.06);border-color:rgba(217,70,239,0.25);}
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(10,10,10,0.92)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.07)',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex',alignItems:'center',gap:10,textDecoration:'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" onError={e=>{(e.target as HTMLImageElement).src="/logo.png"}} alt="Capsule" style={{ height:32,objectFit:"contain" }} />
          <span style={{ fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:18,color:C.light }}>Capsule Ado</span>
        </Link>
        <div style={{ display:'flex',alignItems:'center',gap:16 }}>
          <Link href="/appointments" style={{ fontSize:13,color:'#9ca3af',textDecoration:'none',fontWeight:500 }}>📅 Rendez-vous</Link>
          <Link href="/mediatheque"  style={{ fontSize:13,color:'#9ca3af',textDecoration:'none',fontWeight:500 }}>📚 Ressources</Link>
          <Link href="/profile" style={{ width:32,height:32,borderRadius:'50%',background:C.grad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,textDecoration:'none' }}>
            {(firstName[0]||'?').toUpperCase()}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth:1000,margin:'0 auto',padding:'28px 16px 60px' }}>

        {/* Header */}
        <div style={{ animation:'fadeUp 0.5s ease',marginBottom:24 }}>
          <h1 style={{ fontFamily:'Outfit,sans-serif',fontSize:26,fontWeight:800,color:'#f3f4f6',margin:'0 0 3px' }}>
            {greeting}, <span style={{ background:C.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>{firstName}</span>
          </h1>
          <p style={{ color:'#6b7280',fontSize:13,margin:0 }}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</p>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16 }}>

          {/* Conseil du jour */}
          <div style={{ gridColumn:'1/-1',animation:'fadeUp 0.5s ease 0.08s both' }}>
            <div style={{ background:`linear-gradient(135deg,rgb(74,4,78) 0%,rgb(112,26,117) 100%)`,border:`1px solid ${C.primary50}`,borderRadius:20,padding:'22px 26px',display:'flex',gap:16,alignItems:'flex-start',boxShadow:'0 0 40px rgba(217,70,239,0.12)' }}>
              <span style={{ fontSize:28,flexShrink:0 }}>💡</span>
              <div>
                <p style={{ color:C.light,fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 6px' }}>Conseil du jour</p>
                <p style={{ color:'#f3f4f6',fontSize:15,lineHeight:1.7,margin:0,fontFamily:'Outfit,sans-serif',fontWeight:500 }}>{tip}</p>
              </div>
            </div>
          </div>

          {/* Famille liée */}
          <div className="pc" style={{ gridColumn:'1/-1',padding:24,animation:'fadeUp 0.5s ease 0.14s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#f3f4f6',margin:0 }}>👨‍👩‍👦 Ma famille liée</h3>
              <button onClick={generateInviteCode} style={{ background:C.primary15,border:`1px solid ${C.primary50}`,color:C.light,borderRadius:100,padding:'6px 14px',fontSize:13,fontWeight:600,cursor:'pointer' }}>
                + Lier un enfant
              </button>
            </div>

            {inviteCode&&(
              <div style={{ background:'rgba(217,70,239,0.08)',border:'1px solid rgba(217,70,239,0.2)',borderRadius:14,padding:'16px',marginBottom:16 }}>
                <p style={{ fontSize:13,color:C.light,fontWeight:600,margin:'0 0 8px' }}>Code d'invitation :</p>
                <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                  <span style={{ fontFamily:'monospace',fontSize:24,fontWeight:800,color:'#f3f4f6',letterSpacing:'0.15em' }}>{inviteCode}</span>
                  <button onClick={()=>navigator.clipboard.writeText(inviteCode)} style={{ background:C.primary,color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',fontSize:12,cursor:'pointer',fontWeight:600 }}>Copier</button>
                </div>
                <p style={{ fontSize:12,color:'#6b7280',margin:'8px 0 0' }}>Envoyez ce code à votre enfant pour créer le lien famille.</p>
              </div>
            )}

            {children.length===0 ? (
              <div style={{ textAlign:'center',padding:'24px 0' }}>
                <p style={{ color:'#6b7280',fontSize:14 }}>Aucun enfant lié. Générez un code et envoyez-le à votre adolescent.</p>
              </div>
            ) : (
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12 }}>
                {children.map((child:any)=>(
                  <div key={child.id} style={{ background:C.primary08,border:`1px solid ${C.primary15}`,borderRadius:14,padding:'16px' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
                      <div style={{ width:36,height:36,borderRadius:'50%',background:C.grad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:14 }}>
                        {(child.ado?.name?.[0]||'?').toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin:0,fontWeight:700,fontSize:14,color:'#f3f4f6' }}>{child.ado?.name}</p>
                        <p style={{ margin:0,fontSize:11,color:'#6b7280' }}>Lié·e</p>
                      </div>
                    </div>
                    {child.share_mood&&child.lastMood ? (
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <span style={{ fontSize:22 }}>{MOODS[child.lastMood.score-1]}</span>
                        <div>
                          <p style={{ margin:0,fontSize:12,color:'#9ca3af' }}>Humeur partagée</p>
                          <p style={{ margin:0,fontSize:11,color:MOOD_COLORS[child.lastMood.score-1],fontWeight:600 }}>{child.lastMood.score}/10</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize:12,color:'#6b7280',margin:0 }}>Partage humeur non activé</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RDV */}
          <div className="pc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.2s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#f3f4f6',margin:0 }}>📅 Prochains rendez-vous</h3>
              <Link href="/appointments" style={{ fontSize:12,color:C.light,textDecoration:'none',fontWeight:600 }}>Gérer →</Link>
            </div>
            {appointments.length===0 ? (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <p style={{ color:'#6b7280',fontSize:13,marginBottom:12 }}>Aucun rendez-vous à venir</p>
                <Link href="/appointments" style={{ display:'inline-block',background:C.grad,color:'#fff',borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:600,textDecoration:'none' }}>
                  Trouver un professionnel
                </Link>
              </div>
            ) : appointments.slice(0,3).map((apt:any)=>(
              <div key={apt.id} style={{ marginBottom:10,padding:'12px 14px',background:C.primary08,border:`1px solid ${C.primary15}`,borderRadius:12 }}>
                <p style={{ margin:'0 0 2px',fontWeight:700,fontSize:13,color:'#f3f4f6' }}>{apt.pro?.name}</p>
                <p style={{ margin:0,fontSize:11,color:'#6b7280' }}>{apt.pro?.specialty}</p>
                <p style={{ margin:'6px 0 0',fontSize:12,color:C.light,fontWeight:500 }}>
                  📅 {new Date(apt.scheduled_at).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="pc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.24s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#f3f4f6',margin:'0 0 14px' }}>🔗 Actions rapides</h3>
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {[
                { href:'/appointments',icon:'🔍',label:'Trouver un professionnel',sub:'Psychologues, éducateurs, médecins' },
                { href:'/mediatheque', icon:'📚',label:'Ressources parents',sub:'Articles et guides pour vous' },
                { href:'/profile',     icon:'⚙️',label:'Mon profil',sub:'Paramètres et abonnement' },
              ].map(a=>(
                <Link key={a.href} href={a.href} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,textDecoration:'none',transition:'all 0.2s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=C.primary08;(e.currentTarget as HTMLElement).style.borderColor=C.primary15}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)';(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)'}}>
                  <span style={{ fontSize:22 }}>{a.icon}</span>
                  <div>
                    <p style={{ margin:0,fontWeight:600,fontSize:13,color:'#f3f4f6' }}>{a.label}</p>
                    <p style={{ margin:0,fontSize:11,color:'#6b7280' }}>{a.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Abonnement */}
          <div className="pc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.28s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#f3f4f6',margin:'0 0 14px' }}>💳 Mon abonnement</h3>
            <div style={{ background:`linear-gradient(135deg,rgb(74,4,78),rgb(134,25,143))`,border:`1px solid ${C.primary50}`,borderRadius:14,padding:'18px 20px',marginBottom:14 }}>
              <p style={{ color:C.light,fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 4px' }}>Plan Famille</p>
              <p style={{ color:'#f3f4f6',fontSize:22,fontWeight:800,fontFamily:'Outfit,sans-serif',margin:'0 0 2px' }}>9,90€ <span style={{ fontSize:13,fontWeight:400,color:'rgba(255,255,255,0.6)' }}>/mois</span></p>
              <p style={{ color:'rgba(255,255,255,0.6)',fontSize:12,margin:0 }}>Accès complet · Lien famille · RDV prioritaires</p>
            </div>
            <Link href="/profile#subscription" style={{ display:'block',textAlign:'center',color:C.light,fontSize:13,fontWeight:600,textDecoration:'none' }}>Gérer l'abonnement →</Link>
          </div>

        </div>
      </div>
    </div>
  )
}
