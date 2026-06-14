'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

// PRO colors: Capsule teal
const C = {
  primary:   'rgb(48, 180, 167)',
  primary50: 'rgba(48,180,167,0.5)',
  primary15: 'rgba(48,180,167,0.15)',
  primary08: 'rgba(48,180,167,0.08)',
  light:     'rgb(127, 217, 208)',
  dark:      'rgb(14, 116, 144)',
  grad:      'linear-gradient(135deg, rgb(48,180,167), rgb(8,40,39))',
  gradText:  'linear-gradient(135deg, rgb(127,217,208), rgb(48,180,167))',
}

const STATUS_COLORS: Record<string,string> = { pending:'rgb(251,146,60)', confirmed:'rgb(20,184,166)', cancelled:'rgb(239,68,68)', completed:'rgb(127,217,208)' }
const STATUS_BG: Record<string,string>     = { pending:'rgba(251,146,60,0.12)', confirmed:'rgba(20,184,166,0.12)', cancelled:'rgba(239,68,68,0.12)', completed:'rgba(127,217,208,0.12)' }
const STATUS_LABELS: Record<string,string> = { pending:'En attente', confirmed:'Confirmé', cancelled:'Annulé', completed:'Terminé' }
const TYPE_LABELS: Record<string,string>   = { video:'Vidéo', phone:'Tél.', in_person:'Cabinet' }

export default function ProDashboard() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [profile, setProfile]       = useState<any>(null)
  const [todayApts, setTodayApts]   = useState<any[]>([])
  const [pendingApts, setPendingApts] = useState<any[]>([])
  const [recentPatients, setRecentPatients] = useState<any[]>([])
  const [stats, setStats]           = useState({ totalPatients:0, weekApts:0, pendingCount:0, completedThisMonth:0 })
  const [loading, setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState<string|null>(null)

  const load = useCallback(async () => {
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }

    const { data:prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof?.profile_type && prof.profile_type !== 'pro') {
      router.replace(`/dashboard/${prof.profile_type}`); return
    }
    setProfile(prof)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(),now.getMonth(),now.getDate()).toISOString()
    const todayEnd   = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).toISOString()
    const weekEnd    = new Date(now.getTime()+7*86400000).toISOString()
    const monthStart = new Date(now.getFullYear(),now.getMonth(),1).toISOString()

    const [todayRes, pendingRes, weekRes, patientsRes, completedRes] = await Promise.all([
      supabase.from('appointments').select('*,patient:profiles!appointments_patient_id_fkey(name,email)')
        .eq('pro_id',user.id).gte('scheduled_at',todayStart).lt('scheduled_at',todayEnd).order('scheduled_at',{ascending:true}),
      supabase.from('appointments').select('*,patient:profiles!appointments_patient_id_fkey(name,email)')
        .eq('pro_id',user.id).eq('status','pending').order('scheduled_at',{ascending:true}),
      supabase.from('appointments').select('id').eq('pro_id',user.id).gte('scheduled_at',now.toISOString()).lt('scheduled_at',weekEnd),
      supabase.from('appointments').select('patient_id').eq('pro_id',user.id),
      supabase.from('appointments').select('id').eq('pro_id',user.id).eq('status','completed').gte('scheduled_at',monthStart),
    ])

    setTodayApts(todayRes.data||[])
    setPendingApts(pendingRes.data||[])

    const uniquePatients = [...new Set((patientsRes.data||[]).map((a:any)=>a.patient_id))]
    setStats({ totalPatients:uniquePatients.length, weekApts:weekRes.data?.length||0, pendingCount:pendingRes.data?.length||0, completedThisMonth:completedRes.data?.length||0 })

    if (uniquePatients.length) {
      const { data:pts } = await supabase.from('profiles').select('id,name,email').in('id',uniquePatients.slice(0,5))
      setRecentPatients(pts||[])
    }
    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(()=>{ load() },[load])

  async function updateAptStatus(id:string,status:string) {
    setActionLoading(id)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/appointments',{
      method:'PATCH',
      headers:{'Content-Type':'application/json', ...(session ? { Authorization:`Bearer ${session.access_token}` } : {})},
      body:JSON.stringify({id,status})
    })
    setActionLoading(null); load()
  }

  const firstName = profile?.name?.split(' ')[0]||'Professionnel'

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
        .yc{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;transition:all 0.2s;}
        .yc:hover{background:rgba(255,255,255,0.06);border-color:rgba(234,179,8,0.25);}
        .btn-confirm{background:rgba(20,184,166,0.15);border:1px solid rgba(20,184,166,0.3);color:rgb(94,234,212);border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;}
        .btn-confirm:hover{background:rgba(20,184,166,0.25);}
        .btn-decline{background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25);color:rgb(252,165,165);border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;}
        .btn-decline:hover{background:rgba(239,68,68,0.22);}
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(10,10,10,0.92)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.07)',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex',alignItems:'center',textDecoration:'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Capsule" style={{ height:34,objectFit:'contain' }} />
        </Link>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <Link href="/appointments" style={{ fontSize:12,color:'#9ca3af',textDecoration:'none',fontWeight:500,padding:'6px 12px',borderRadius:100,border:'1px solid rgba(255,255,255,0.1)' }}>Agenda</Link>
          <Link href="/messages" style={{ fontSize:12,color:'#9ca3af',textDecoration:'none',fontWeight:500,padding:'6px 12px',borderRadius:100,border:'1px solid rgba(255,255,255,0.1)' }}>Messages</Link>
          <Link href="/patients"     style={{ fontSize:12,color:'#9ca3af',textDecoration:'none',fontWeight:500,padding:'6px 12px',borderRadius:100,border:'1px solid rgba(255,255,255,0.1)' }}>Patients</Link>
          <Link href="/admin/mediatheque" style={{ fontSize:12,color:'#9ca3af',textDecoration:'none',fontWeight:500,padding:'6px 12px',borderRadius:100,border:'1px solid rgba(255,255,255,0.1)' }}>Ressources</Link>
          <Link href="/profile" style={{ width:32,height:32,borderRadius:'50%',overflow:'hidden',background:C.grad,display:'flex',alignItems:'center',justifyContent:'center',color:'#111',fontWeight:800,fontSize:12,textDecoration:'none',flexShrink:0 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              : (firstName[0]||'?').toUpperCase()}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth:1100,margin:'0 auto',padding:'28px 16px 60px' }}>

        {/* Header */}
        <div style={{ animation:'fadeUp 0.5s ease',marginBottom:24 }}>
          <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
            <div>
              <h1 style={{ fontFamily:'Outfit,sans-serif',fontSize:24,fontWeight:800,color:'#f3f4f6',margin:'0 0 3px' }}>
                Tableau de bord — <span style={{ background:C.gradText,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>{profile?.name}</span>
              </h1>
              <p style={{ color:'#6b7280',fontSize:13,margin:0,display:'flex',alignItems:'center',gap:8 }}>
                {profile?.specialty||'Professionnel de santé'} · {profile?.location||'France'}
                {profile?.verified
                  ? <span style={{ background:'rgba(20,184,166,0.12)',color:'rgb(94,234,212)',borderRadius:100,padding:'2px 8px',fontSize:11,fontWeight:600 }}>✅ Vérifié</span>
                  : <span style={{ background:'rgba(251,146,60,0.12)',color:'rgb(253,186,116)',borderRadius:100,padding:'2px 8px',fontSize:11,fontWeight:600 }}>⏳ Vérification en cours</span>
                }
              </p>
            </div>
            <div style={{ display:'flex',gap:8 }}>
              <Link href="/appointments" style={{ background:C.grad,color:'#111',borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:700,textDecoration:'none',display:'inline-block' }}>📅 Mon agenda</Link>
              <Link href="/patients" style={{ background:C.primary08,border:`1px solid ${C.primary15}`,color:C.light,borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:600,textDecoration:'none',display:'inline-block' }}>👥 Patients</Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:20,animation:'fadeUp 0.5s ease 0.1s both' }}>
          {[
            { icon:'👥', label:'Patients total',     value:stats.totalPatients,      color:C.light },
            { icon:'📅', label:'RDV cette semaine',  value:stats.weekApts,           color:'rgb(94,234,212)' },
            { icon:'⏳', label:'En attente',          value:stats.pendingCount,       color:'rgb(253,186,116)' },
            { icon:'✅', label:'Séances ce mois',    value:stats.completedThisMonth, color:'rgb(127,217,208)' },
          ].map(s=>(
            <div key={s.label} className="yc" style={{ padding:'18px 20px',display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:44,height:44,borderRadius:12,background:C.primary08,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>{s.icon}</div>
              <div>
                <p style={{ margin:0,fontSize:28,fontWeight:800,fontFamily:'Outfit,sans-serif',color:s.color }}>{s.value}</p>
                <p style={{ margin:0,fontSize:11,color:'#6b7280' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:16 }}>

          {/* Aujourd'hui */}
          <div className="yc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.15s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:'#f3f4f6',margin:0 }}>
                📅 {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'short'})}
              </h3>
              <Link href="/appointments" style={{ fontSize:12,color:C.light,textDecoration:'none',fontWeight:600 }}>Agenda →</Link>
            </div>
            {todayApts.length===0 ? (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <span style={{ fontSize:32 }}>☀️</span>
                <p style={{ color:'#6b7280',fontSize:13,marginTop:8 }}>Aucune consultation aujourd'hui</p>
              </div>
            ) : todayApts.map((apt:any)=>(
              <div key={apt.id} style={{ marginBottom:10,padding:'12px 14px',background:C.primary08,border:`1px solid ${C.primary15}`,borderRadius:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                  <div>
                    <p style={{ margin:'0 0 2px',fontWeight:700,fontSize:13,color:'#f3f4f6' }}>{apt.patient?.name}</p>
                    <p style={{ margin:0,fontSize:11,color:'#6b7280' }}>{TYPE_LABELS[apt.type]}</p>
                  </div>
                  <span style={{ fontSize:11,padding:'3px 8px',borderRadius:100,background:STATUS_BG[apt.status],color:STATUS_COLORS[apt.status],fontWeight:700 }}>
                    {STATUS_LABELS[apt.status]}
                  </span>
                </div>
                <p style={{ margin:'6px 0 0',fontSize:12,color:C.light,fontWeight:600 }}>
                  🕐 {new Date(apt.scheduled_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · {apt.duration_minutes}min
                </p>
              </div>
            ))}
          </div>

          {/* Demandes en attente */}
          <div className="yc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.2s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:'#f3f4f6',margin:0 }}>⏳ Demandes</h3>
              {stats.pendingCount>0&&<span style={{ background:'rgba(251,146,60,0.15)',color:'rgb(253,186,116)',borderRadius:100,padding:'2px 8px',fontSize:12,fontWeight:700 }}>{stats.pendingCount}</span>}
            </div>
            {pendingApts.length===0 ? (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <span style={{ fontSize:28 }}>✅</span>
                <p style={{ color:'#6b7280',fontSize:13,marginTop:8 }}>Aucune demande en attente</p>
              </div>
            ) : pendingApts.map((apt:any)=>(
              <div key={apt.id} style={{ marginBottom:12,padding:'14px',background:'rgba(251,146,60,0.06)',border:'1px solid rgba(251,146,60,0.2)',borderRadius:12 }}>
                <p style={{ margin:'0 0 2px',fontWeight:700,fontSize:13,color:'#f3f4f6' }}>{apt.patient?.name}</p>
                <p style={{ margin:'0 0 8px',fontSize:11,color:'#6b7280' }}>
                  {TYPE_LABELS[apt.type]} · {new Date(apt.scheduled_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                </p>
                {apt.notes_for_pro&&<p style={{ fontSize:12,color:'#9ca3af',fontStyle:'italic',margin:'0 0 10px',background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'6px 10px' }}>{apt.notes_for_pro}</p>}
                <div style={{ display:'flex',gap:8 }}>
                  <button className="btn-confirm" onClick={()=>updateAptStatus(apt.id,'confirmed')} disabled={actionLoading===apt.id}>
                    {actionLoading===apt.id?'…':'✅ Confirmer'}
                  </button>
                  <button className="btn-decline" onClick={()=>updateAptStatus(apt.id,'cancelled')} disabled={actionLoading===apt.id}>Refuser</button>
                </div>
              </div>
            ))}
          </div>

          {/* Patients récents */}
          <div className="yc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.25s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:'#f3f4f6',margin:0 }}>👥 Mes patients</h3>
              <Link href="/patients" style={{ fontSize:12,color:C.light,textDecoration:'none',fontWeight:600 }}>Voir tout →</Link>
            </div>
            {recentPatients.length===0 ? (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <p style={{ color:'#6b7280',fontSize:13 }}>Aucun patient pour l'instant</p>
              </div>
            ) : recentPatients.map((p:any)=>(
              <div key={p.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:34,height:34,borderRadius:'50%',background:C.grad,display:'flex',alignItems:'center',justifyContent:'center',color:'#111',fontWeight:800,fontSize:13,flexShrink:0 }}>
                  {(p.name?.[0]||'?').toUpperCase()}
                </div>
                <div>
                  <p style={{ margin:0,fontWeight:600,fontSize:13,color:'#f3f4f6' }}>{p.name}</p>
                  <p style={{ margin:0,fontSize:11,color:'#6b7280' }}>{p.email}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Abonnement */}
          <div className="yc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.3s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:'#f3f4f6',margin:'0 0 14px' }}>💳 Mon abonnement Pro</h3>
            <div style={{ background:`linear-gradient(135deg,rgb(66,32,6),rgb(113,63,18))`,border:`1px solid ${C.primary50}`,borderRadius:14,padding:'18px 20px',marginBottom:14,boxShadow:`0 0 30px rgba(234,179,8,0.1)` }}>
              <p style={{ color:C.light,fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 4px' }}>Plan Professionnel</p>
              <p style={{ color:'#f3f4f6',fontSize:22,fontWeight:800,fontFamily:'Outfit,sans-serif',margin:'0 0 2px' }}>29€ <span style={{ fontSize:13,fontWeight:400,color:'rgba(255,255,255,0.5)' }}>/mois</span></p>
              <p style={{ color:'rgba(255,255,255,0.5)',fontSize:12,margin:0 }}>Agenda · Notes · Visibilité · Analytics</p>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              <Link href="/profile#subscription" style={{ display:'block',textAlign:'center',color:C.light,fontSize:13,fontWeight:600,textDecoration:'none' }}>Gérer l'abonnement →</Link>
              {profile?.id && <Link href={`/professionnels/${profile.id}`} style={{ display:'block',textAlign:'center',color:'#6b7280',fontSize:12,textDecoration:'none' }}>Voir mon profil public</Link>}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
