'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const TYPE_LABELS: Record<string, string> = { video: '🎥 Vidéo', phone: '📞 Téléphone', in_person: '🏥 Cabinet' }
const STATUS_COLORS: Record<string, string> = { pending: '#F59E0B', confirmed: '#10B981', cancelled: '#EF4444', completed: '#6366F1' }
const STATUS_BG: Record<string, string> = { pending: '#FEF3C7', confirmed: '#D1FAE5', cancelled: '#FEE2E2', completed: '#EDE9FE' }
const STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', completed: 'Terminé' }

export default function ProDashboard() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [profile, setProfile] = useState<any>(null)
  const [todayApts, setTodayApts] = useState<any[]>([])
  const [pendingApts, setPendingApts] = useState<any[]>([])
  const [recentPatients, setRecentPatients] = useState<any[]>([])
  const [stats, setStats] = useState({ totalPatients: 0, weekApts: 0, pendingCount: 0, completedThisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (prof?.profile_type && prof.profile_type !== 'pro') {
      router.replace(`/dashboard/${prof.profile_type}`); return
    }
    setProfile(prof)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
    const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [todayRes, pendingRes, weekRes, patientsRes, completedRes] = await Promise.all([
      supabase.from('appointments').select('*, patient:profiles!appointments_patient_id_fkey(name, email, avatar_url)')
        .eq('pro_id', user.id).gte('scheduled_at', todayStart).lt('scheduled_at', todayEnd)
        .order('scheduled_at', { ascending: true }),
      supabase.from('appointments').select('*, patient:profiles!appointments_patient_id_fkey(name, email, avatar_url)')
        .eq('pro_id', user.id).eq('status', 'pending').order('scheduled_at', { ascending: true }),
      supabase.from('appointments').select('id').eq('pro_id', user.id)
        .gte('scheduled_at', now.toISOString()).lt('scheduled_at', weekEnd),
      supabase.from('appointments').select('patient_id').eq('pro_id', user.id),
      supabase.from('appointments').select('id').eq('pro_id', user.id)
        .eq('status', 'completed').gte('scheduled_at', monthStart),
    ])

    setTodayApts(todayRes.data || [])
    setPendingApts(pendingRes.data || [])

    // Unique patients
    const uniquePatients = [...new Set((patientsRes.data || []).map((a: any) => a.patient_id))]
    setStats({
      totalPatients: uniquePatients.length,
      weekApts: weekRes.data?.length || 0,
      pendingCount: pendingRes.data?.length || 0,
      completedThisMonth: completedRes.data?.length || 0,
    })

    // Recent patients (unique)
    if (patientsRes.data?.length) {
      const patientIds = [...new Set((patientsRes.data as any[]).map(a => a.patient_id))].slice(0, 5)
      const { data: patientProfiles } = await supabase.from('profiles').select('id, name, email, avatar_url, created_at').in('id', patientIds)
      setRecentPatients(patientProfiles || [])
    }

    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(() => { load() }, [load])

  async function updateAptStatus(id: string, status: string) {
    setActionLoading(id)
    await fetch('/api/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setActionLoading(null)
    load()
  }

  const firstName = profile?.name?.split(' ')[0] || 'Docteur'
  const completionRate = stats.totalPatients > 0
    ? Math.round((stats.completedThisMonth / Math.max(stats.weekApts + stats.completedThisMonth, 1)) * 100)
    : 0

  if (loading) return (
    <div style={{ minHeight:'100vh',background:'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44,height:44,border:'3px solid #CBD5E1',borderTopColor:'#1E3A5F',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 14px' }} />
        <p style={{ color:'#1E3A5F',fontFamily:'Inter,sans-serif',margin:0 }}>Chargement de votre espace…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#F1F5F9 0%,#EFF6FF 100%)',fontFamily:'Inter,sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .procard{background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-radius:18px;border:1px solid rgba(255,255,255,0.6);box-shadow:0 4px 20px rgba(30,58,95,0.06);transition:all 0.2s;}
        .procard:hover{box-shadow:0 8px 28px rgba(30,58,95,0.1);}
        .btn-navy{background:linear-gradient(135deg,#1E3A5F,#2563EB);color:#fff;border:none;border-radius:10px;padding:9px 18px;font-family:Inter,sans-serif;font-weight:600;font-size:13px;cursor:pointer;transition:opacity 0.2s;}
        .btn-navy:hover{opacity:0.88;}
        .btn-green{background:#10B981;color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:opacity 0.2s;}
        .btn-green:hover{opacity:0.85;}
        .btn-red{background:#EF4444;color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:opacity 0.2s;}
        .btn-red:hover{opacity:0.85;}
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(241,245,249,0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(30,58,95,0.1)',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:18,color:'#1E3A5F',textDecoration:'none' }}>🔵 Capsule Ado Pro</Link>
        <div style={{ display:'flex',alignItems:'center',gap:16 }}>
          <Link href="/appointments" style={{ fontSize:13,color:'#374151',textDecoration:'none',fontWeight:500 }}>📅 Agenda</Link>
          <Link href="/patients" style={{ fontSize:13,color:'#374151',textDecoration:'none',fontWeight:500 }}>👥 Patients</Link>
          <Link href="/mediatheque" style={{ fontSize:13,color:'#374151',textDecoration:'none',fontWeight:500 }}>📚 Médiathèque</Link>
          <Link href="/profile" style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#1E3A5F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none' }}>
            {(firstName[0]||'?').toUpperCase()}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth:1100,margin:'0 auto',padding:'28px 16px 60px' }}>

        {/* Header + profile completeness */}
        <div style={{ animation:'fadeUp 0.5s ease',marginBottom:24 }}>
          <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
            <div>
              <h1 style={{ fontFamily:'Outfit,sans-serif',fontSize:24,fontWeight:800,color:'#1A1A2E',margin:'0 0 3px' }}>
                Tableau de bord — <span style={{ background:'linear-gradient(135deg,#1E3A5F,#2563EB)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>{profile?.name}</span>
              </h1>
              <p style={{ color:'#6B7280',fontSize:13,margin:0 }}>
                {profile?.specialty || 'Professionnel de santé'} · {profile?.location || 'France'}
                {!profile?.verified && <span style={{ marginLeft:8,background:'#FEF3C7',color:'#92400E',borderRadius:100,padding:'2px 8px',fontSize:11,fontWeight:600 }}>⏳ Vérification en cours</span>}
                {profile?.verified && <span style={{ marginLeft:8,background:'#D1FAE5',color:'#065F46',borderRadius:100,padding:'2px 8px',fontSize:11,fontWeight:600 }}>✅ Profil vérifié</span>}
              </p>
            </div>
            <div style={{ display:'flex',gap:10' }}>
              <Link href="/appointments" className="btn-navy" style={{ textDecoration:'none',padding:'9px 16px' }}>📅 Mon agenda</Link>
              <Link href="/patients" className="btn-navy" style={{ textDecoration:'none',padding:'9px 16px',background:'rgba(30,58,95,0.1)',color:'#1E3A5F' }}>👥 Patients</Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:20,animation:'fadeUp 0.5s ease 0.1s both' }}>
          {[
            { icon:'👥',label:'Patients total',value:stats.totalPatients,color:'#1E3A5F' },
            { icon:'📅',label:'RDV cette semaine',value:stats.weekApts,color:'#2563EB' },
            { icon:'⏳',label:'En attente',value:stats.pendingCount,color:'#F59E0B' },
            { icon:'✅',label:'Séances ce mois',value:stats.completedThisMonth,color:'#10B981' },
          ].map(s => (
            <div key={s.label} className="procard" style={{ padding:'18px 20px',display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:46,height:46,borderRadius:12,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>{s.icon}</div>
              <div>
                <p style={{ margin:0,fontSize:26,fontWeight:800,fontFamily:'Outfit,sans-serif',color:s.color }}>{s.value}</p>
                <p style={{ margin:0,fontSize:12,color:'#6B7280' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:18 }}>

          {/* Agenda du jour */}
          <div className="procard" style={{ padding:22,animation:'fadeUp 0.5s ease 0.15s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:0 }}>
                📅 Aujourd'hui · {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'short'})}
              </h3>
              <Link href="/appointments" style={{ fontSize:12,color:'#2563EB',textDecoration:'none',fontWeight:600 }}>Agenda complet →</Link>
            </div>
            {todayApts.length === 0 ? (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <span style={{ fontSize:36 }}>☀️</span>
                <p style={{ color:'#9CA3AF',fontSize:13,marginTop:8 }}>Aucune consultation aujourd'hui</p>
              </div>
            ) : todayApts.map((apt:any) => (
              <div key={apt.id} style={{ marginBottom:10,padding:'12px 14px',background:'#F8FAFC',borderRadius:12,border:'1px solid #E2E8F0' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                  <div>
                    <p style={{ margin:'0 0 2px',fontWeight:700,fontSize:14,color:'#1A1A2E' }}>{apt.patient?.name}</p>
                    <p style={{ margin:0,fontSize:12,color:'#6B7280' }}>{TYPE_LABELS[apt.type]}</p>
                  </div>
                  <span style={{ fontSize:11,padding:'3px 8px',borderRadius:100,background:STATUS_BG[apt.status],color:STATUS_COLORS[apt.status],fontWeight:700 }}>{STATUS_LABELS[apt.status]}</span>
                </div>
                <p style={{ margin:'6px 0 0',fontSize:12,color:'#1E3A5F',fontWeight:600 }}>
                  🕐 {new Date(apt.scheduled_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · {apt.duration_minutes} min
                </p>
              </div>
            ))}
          </div>

          {/* Demandes en attente */}
          <div className="procard" style={{ padding:22,animation:'fadeUp 0.5s ease 0.2s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:0 }}>⏳ Demandes en attente</h3>
              {pendingApts.length > 0 && <span style={{ background:'#FEF3C7',color:'#92400E',borderRadius:100,padding:'2px 8px',fontSize:12,fontWeight:700 }}>{pendingApts.length}</span>}
            </div>
            {pendingApts.length === 0 ? (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <span style={{ fontSize:32 }}>✅</span>
                <p style={{ color:'#9CA3AF',fontSize:13,marginTop:8 }}>Aucune demande en attente</p>
              </div>
            ) : pendingApts.map((apt:any) => (
              <div key={apt.id} style={{ marginBottom:12,padding:'14px',background:'#FFFBEB',borderRadius:12,border:'1px solid #FDE68A' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                  <div>
                    <p style={{ margin:'0 0 2px',fontWeight:700,fontSize:13,color:'#1A1A2E' }}>{apt.patient?.name}</p>
                    <p style={{ margin:0,fontSize:11,color:'#6B7280' }}>{TYPE_LABELS[apt.type]} · {new Date(apt.scheduled_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                </div>
                {apt.notes_for_pro && <p style={{ fontSize:12,color:'#374151',fontStyle:'italic',margin:'0 0 10px',background:'rgba(255,255,255,0.6)',borderRadius:8,padding:'6px 10px' }}>{apt.notes_for_pro}</p>}
                <div style={{ display:'flex',gap:8' }}>
                  <button className="btn-green" onClick={() => updateAptStatus(apt.id,'confirmed')} disabled={actionLoading===apt.id}>
                    {actionLoading===apt.id ? '…' : '✅ Confirmer'}
                  </button>
                  <button className="btn-red" onClick={() => updateAptStatus(apt.id,'cancelled')} disabled={actionLoading===apt.id}>
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Patients récents */}
          <div className="procard" style={{ padding:22,animation:'fadeUp 0.5s ease 0.25s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:0 }}>👥 Mes patients</h3>
              <Link href="/patients" style={{ fontSize:12,color:'#2563EB',textDecoration:'none',fontWeight:600 }}>Voir tout →</Link>
            </div>
            {recentPatients.length === 0 ? (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <span style={{ fontSize:32 }}>👥</span>
                <p style={{ color:'#9CA3AF',fontSize:13,marginTop:8 }}>Aucun patient pour l'instant</p>
              </div>
            ) : recentPatients.map((p:any) => (
              <div key={p.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid #F1F5F9' }}>
                <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#1E3A5F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13,flexShrink:0 }}>
                  {(p.name?.[0]||'?').toUpperCase()}
                </div>
                <div>
                  <p style={{ margin:0,fontWeight:600,fontSize:13,color:'#1A1A2E' }}>{p.name}</p>
                  <p style={{ margin:0,fontSize:11,color:'#6B7280' }}>{p.email}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mon abonnement */}
          <div className="procard" style={{ padding:22,animation:'fadeUp 0.5s ease 0.3s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:'0 0 16px' }}>💳 Mon abonnement Pro</h3>
            <div style={{ background:'linear-gradient(135deg,#1E3A5F,#2563EB)',borderRadius:14,padding:'18px 20px',marginBottom:14 }}>
              <p style={{ color:'rgba(255,255,255,0.7)',fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',margin:'0 0 4px' }}>Plan Professionnel</p>
              <p style={{ color:'#fff',fontSize:20,fontWeight:800,fontFamily:'Outfit,sans-serif',margin:'0 0 2px' }}>29€ <span style={{ fontSize:13,fontWeight:400 }}>/mois</span></p>
              <p style={{ color:'rgba(255,255,255,0.7)',fontSize:12,margin:0 }}>Agenda · Notes · Visibilité · Analytics</p>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:8' }}>
              <Link href="/profile#subscription" style={{ display:'block',textAlign:'center',color:'#2563EB',fontSize:13,fontWeight:600,textDecoration:'none' }}>Gérer l'abonnement →</Link>
              <Link href="/profile" style={{ display:'block',textAlign:'center',color:'#6B7280',fontSize:12,textDecoration:'none' }}>Voir mon profil public</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
