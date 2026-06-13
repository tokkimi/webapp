'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const MOODS = [
  { score: 1, emoji: '😭', label: 'Effondré·e', color: '#EF4444' },
  { score: 2, emoji: '😢', label: 'Triste', color: '#F97316' },
  { score: 3, emoji: '😟', label: 'Pas super', color: '#F59E0B' },
  { score: 4, emoji: '😕', label: 'Moyen', color: '#EAB308' },
  { score: 5, emoji: '😐', label: 'Neutre', color: '#84CC16' },
  { score: 6, emoji: '🙂', label: 'Pas mal', color: '#22C55E' },
  { score: 7, emoji: '😊', label: 'Bien', color: '#10B981' },
  { score: 8, emoji: '😄', label: 'Super', color: '#06B6D4' },
  { score: 9, emoji: '🤩', label: 'Génial !', color: '#7C3AED' },
  { score: 10, emoji: '🌟', label: 'Au top !', color: '#EC4899' },
]

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export default function AdoDashboard() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [profile, setProfile] = useState<any>(null)
  const [motivation, setMotivation] = useState<any>(null)
  const [todayMood, setTodayMood] = useState<number | null>(null)
  const [moodHistory, setMoodHistory] = useState<Record<string, number>>({})
  const [moodPicking, setMoodPicking] = useState(false)
  const [journals, setJournals] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [motivLiked, setMotivLiked] = useState<boolean | null>(null)
  const [sosOpen, setSosOpen] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }

    const [profRes, motivRes, moodsRes, jrnRes, chalRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      fetch('/api/motivation'),
      supabase.from('mood_entries').select('score, created_at').eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
        .order('created_at', { ascending: false }),
      supabase.from('journal_entries').select('id, content, created_at').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(3),
      supabase.from('challenges').select('*').eq('user_id', user.id).eq('completed', false).limit(4),
    ])

    const prof = profRes.data
    if (prof?.profile_type && prof.profile_type !== 'ado') {
      router.replace(`/dashboard/${prof.profile_type}`)
      return
    }

    setProfile(prof)
    if (motivRes.ok) {
      const motiv = await motivRes.json()
      setMotivation(motiv)
      setMotivLiked(motiv?.liked ?? null)
    }

    if (moodsRes.data) {
      const map: Record<string, number> = {}
      moodsRes.data.forEach((m: any) => {
        const day = m.created_at.split('T')[0]
        if (!map[day]) map[day] = m.score
      })
      setMoodHistory(map)
      const today = new Date().toISOString().split('T')[0]
      if (map[today]) setTodayMood(map[today])

      const days = getLast7Days()
      let s = 0
      for (let i = days.length - 1; i >= 0; i--) {
        if (map[days[i]]) s++
        else break
      }
      setStreak(s)
    }

    setJournals(jrnRes.data || [])
    setChallenges(chalRes.data || [])
    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(() => { load() }, [load])

  async function logMood(score: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setTodayMood(score)
    setMoodPicking(false)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('mood_entries').insert({ user_id: user.id, score, emoji: MOODS[score - 1].emoji })
    setMoodHistory(prev => ({ ...prev, [today]: score }))
  }

  async function toggleLike() {
    if (!motivation) return
    const newVal = !motivLiked
    setMotivLiked(newVal)
    await fetch('/api/motivation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivation_id: motivation.id, liked: newVal }),
    })
  }

  const days7 = getLast7Days()
  const firstName = profile?.name?.split(' ')[0] || 'toi'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Salut' : 'Bonsoir'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #E9D5FF', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#7C3AED', fontFamily: 'Inter, sans-serif', margin: 0 }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#F8F7FF 0%,#FDF4FF 50%,#FFF7ED 100%)', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
        .gcard{background:rgba(255,255,255,0.85);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(255,255,255,0.6);box-shadow:0 4px 24px rgba(124,58,237,0.06);transition:all 0.2s;}
        .gcard:hover{box-shadow:0 8px 32px rgba(124,58,237,0.12);transform:translateY(-2px);}
        .btn-v{background:linear-gradient(135deg,#7C3AED,#EC4899);color:#fff;border:none;border-radius:12px;padding:10px 20px;font-family:Inter,sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:opacity 0.2s;}
        .btn-v:hover{opacity:0.88;}
        .qa{background:rgba(255,255,255,0.9);border:1.5px solid rgba(124,58,237,0.12);border-radius:16px;padding:20px 12px;text-align:center;cursor:pointer;transition:all 0.2s;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:6px;}
        .qa:hover{background:#7C3AED;transform:translateY(-3px);box-shadow:0 8px 24px rgba(124,58,237,0.3);}
        .qa:hover .qa-lbl{color:#fff;}
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(248,247,255,0.92)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(124,58,237,0.1)',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:18,color:'#7C3AED',textDecoration:'none' }}>💜 Capsule Ado</Link>
        <div style={{ display:'flex',alignItems:'center',gap:16 }}>
          <Link href="/mediatheque" style={{ fontSize:13,color:'#6B7280',textDecoration:'none',fontWeight:500 }}>📚 Médiathèque</Link>
          <Link href="/chat" style={{ fontSize:13,color:'#6B7280',textDecoration:'none',fontWeight:500 }}>💬 Chat</Link>
          <Link href="/profile" style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#EC4899)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none' }}>
            {(firstName[0] || '?').toUpperCase()}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth:980,margin:'0 auto',padding:'28px 16px 100px' }}>

        {/* Header */}
        <div style={{ animation:'fadeUp 0.5s ease',marginBottom:24 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
            <div>
              <h1 style={{ fontFamily:'Outfit,sans-serif',fontSize:26,fontWeight:800,color:'#1A1A2E',margin:0 }}>
                {greeting}, <span style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>{firstName}</span> ✨
              </h1>
              <p style={{ color:'#6B7280',fontSize:13,margin:'3px 0 0' }}>
                {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
              </p>
            </div>
            <div style={{ display:'flex',gap:8 }}>
              {streak > 0 && (
                <div style={{ background:'linear-gradient(135deg,#F97316,#FBBF24)',borderRadius:100,padding:'5px 12px',display:'flex',alignItems:'center',gap:5 }}>
                  <span style={{ fontSize:14 }}>🔥</span>
                  <span style={{ color:'#fff',fontWeight:700,fontSize:12 }}>{streak}j de suite</span>
                </div>
              )}
              <button onClick={() => setSosOpen(true)} style={{ background:'#EF4444',color:'#fff',border:'none',borderRadius:100,padding:'5px 14px',fontSize:12,fontWeight:700,cursor:'pointer',animation:'pulse 2s infinite' }}>
                🆘 SOS
              </button>
            </div>
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:18 }}>

          {/* Motivation */}
          <div style={{ gridColumn:'1/-1',animation:'fadeUp 0.5s ease 0.1s both' }}>
            <div style={{ background:'linear-gradient(135deg,#7C3AED 0%,#EC4899 50%,#F97316 100%)',borderRadius:22,padding:'28px',position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',top:-20,right:-20,width:120,height:120,background:'rgba(255,255,255,0.08)',borderRadius:'50%',animation:'float 4s ease-in-out infinite' }} />
              <div style={{ position:'relative',zIndex:1 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
                  <span style={{ fontSize:18 }}>✨</span>
                  <span style={{ color:'rgba(255,255,255,0.8)',fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase' }}>Motivation du jour</span>
                </div>
                <p style={{ color:'#fff',fontSize:'clamp(15px,2.2vw,20px)',lineHeight:1.6,fontFamily:'Outfit,sans-serif',fontWeight:600,margin:'0 0 18px' }}>
                  {motivation?.content || 'Chaque jour est une nouvelle chance de briller. Tu as plus de force en toi que tu ne l\'imagines. 🌟'}
                </p>
                <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                  <button onClick={toggleLike} style={{ background:motivLiked?'#fff':'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:100,padding:'7px 16px',color:motivLiked?'#EC4899':'#fff',fontSize:13,cursor:'pointer',fontWeight:600,transition:'all 0.2s' }}>
                    {motivLiked ? '💜 Aimé !' : '🤍 J\'aime'}
                  </button>
                  <Link href="/motivation" style={{ background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:100,padding:'7px 16px',color:'#fff',fontSize:13,textDecoration:'none',fontWeight:500 }}>
                    Archive →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Humeur */}
          <div className="gcard" style={{ padding:22,animation:'fadeUp 0.5s ease 0.2s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:'0 0 14px' }}>💭 Mon humeur aujourd'hui</h3>
            {todayMood && !moodPicking ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:44,marginBottom:6 }}>{MOODS[todayMood-1].emoji}</div>
                <p style={{ color:MOODS[todayMood-1].color,fontWeight:700,fontSize:15,margin:'0 0 12px' }}>{MOODS[todayMood-1].label}</p>
                <button onClick={() => setMoodPicking(true)} style={{ background:'none',border:'1px solid #E5E7EB',borderRadius:8,padding:'5px 12px',fontSize:12,color:'#6B7280',cursor:'pointer' }}>Modifier</button>
              </div>
            ) : moodPicking || !todayMood ? (
              <div>
                <p style={{ color:'#6B7280',fontSize:12,marginBottom:10 }}>Comment tu te sens ?</p>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6 }}>
                  {MOODS.map(m => (
                    <button key={m.score} onClick={() => logMood(m.score)}
                      style={{ background:'none',border:'2px solid #F3F4F6',borderRadius:10,padding:'6px 2px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2,transition:'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor=m.color; (e.currentTarget as HTMLElement).style.background=m.color+'18' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='#F3F4F6'; (e.currentTarget as HTMLElement).style.background='none' }}>
                      <span style={{ fontSize:18 }}>{m.emoji}</span>
                      <span style={{ fontSize:9,color:'#9CA3AF' }}>{m.score}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Historique 7j */}
          <div className="gcard" style={{ padding:22,animation:'fadeUp 0.5s ease 0.25s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:'0 0 14px' }}>📊 Mes 7 derniers jours</h3>
            <div style={{ display:'flex',gap:6,alignItems:'flex-end',height:72 }}>
              {days7.map((day, i) => {
                const score = moodHistory[day]
                const h = score ? (score/10)*56+8 : 8
                const m = MOODS[score ? score-1 : 4]
                const isToday = i === 6
                return (
                  <div key={day} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
                    <div style={{ width:'100%',height:h,borderRadius:5,background:score?m.color:'#F3F4F6',transition:'height 0.4s ease',border:isToday?'2px solid #7C3AED':'none' }} title={score?m.label:'Non renseigné'} />
                    <span style={{ fontSize:9,color:isToday?'#7C3AED':'#9CA3AF',fontWeight:isToday?700:400 }}>{DAYS[i]}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions rapides */}
          <div style={{ gridColumn:'1/-1',animation:'fadeUp 0.5s ease 0.3s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:'0 0 14px' }}>🚀 Mes espaces</h3>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:10 }}>
              {[
                { href:'/journal',icon:'📔',label:'Journal' },
                { href:'/challenges',icon:'🎯',label:'Défis' },
                { href:'/chat',icon:'💬',label:'Chat IA' },
                { href:'/mediatheque',icon:'📚',label:'Médiathèque' },
                { href:'/motivation',icon:'✨',label:'Motivation' },
                { href:'/profile',icon:'👤',label:'Mon profil' },
              ].map(a => (
                <Link key={a.href} href={a.href} className="qa">
                  <span style={{ fontSize:26 }}>{a.icon}</span>
                  <span className="qa-lbl" style={{ fontSize:12,fontWeight:600,color:'#1A1A2E' }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Défis */}
          <div className="gcard" style={{ padding:22,animation:'fadeUp 0.5s ease 0.35s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:0 }}>🎯 Mes défis actifs</h3>
              <Link href="/challenges" style={{ fontSize:12,color:'#7C3AED',textDecoration:'none',fontWeight:600 }}>Voir tout →</Link>
            </div>
            {challenges.length === 0 ? (
              <div style={{ textAlign:'center',padding:'16px 0' }}>
                <p style={{ color:'#9CA3AF',fontSize:13,marginBottom:10 }}>Lance-toi un défi ! 🎯</p>
                <Link href="/challenges" style={{ display:'inline-block',background:'linear-gradient(135deg,#7C3AED,#F97316)',color:'#fff',borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:600,textDecoration:'none' }}>Créer un défi</Link>
              </div>
            ) : challenges.map((c:any) => (
              <div key={c.id} style={{ marginBottom:10,padding:'10px 14px',background:'#F9F5FF',borderRadius:12,border:'1px solid #EDE9FE' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <span style={{ fontWeight:600,fontSize:13,color:'#1A1A2E' }}>{c.title}</span>
                  {c.streak > 0 && <span style={{ fontSize:12,color:'#F97316',fontWeight:700 }}>🔥{c.streak}j</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Journal */}
          <div className="gcard" style={{ padding:22,animation:'fadeUp 0.5s ease 0.4s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:0 }}>📔 Journal récent</h3>
              <Link href="/journal" style={{ fontSize:12,color:'#7C3AED',textDecoration:'none',fontWeight:600 }}>Ouvrir →</Link>
            </div>
            {journals.length === 0 ? (
              <div style={{ textAlign:'center',padding:'16px 0' }}>
                <p style={{ color:'#9CA3AF',fontSize:13,marginBottom:10 }}>Ton journal t'attend ✍️</p>
                <Link href="/journal" style={{ display:'inline-block',background:'linear-gradient(135deg,#7C3AED,#EC4899)',color:'#fff',borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:600,textDecoration:'none' }}>Écrire</Link>
              </div>
            ) : journals.slice(0,2).map((j:any) => (
              <div key={j.id} style={{ marginBottom:8,padding:'10px 12px',background:'#FDF4FF',borderRadius:10,border:'1px solid #F3E8FF' }}>
                <p style={{ fontSize:12,color:'#374151',lineHeight:1.5,margin:'0 0 3px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{j.content}</p>
                <span style={{ fontSize:10,color:'#9CA3AF' }}>{new Date(j.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* SOS Modal */}
      {sosOpen && (
        <div onClick={() => setSosOpen(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff',borderRadius:24,padding:'28px',maxWidth:420,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontFamily:'Outfit,sans-serif',fontSize:20,fontWeight:800,color:'#1A1A2E',margin:'0 0 8px',textAlign:'center' }}>🆘 Tu n'es pas seul·e</h2>
            <p style={{ color:'#6B7280',fontSize:13,textAlign:'center',margin:'0 0 20px',lineHeight:1.6 }}>Des personnes formées sont là pour toi, maintenant :</p>
            {[
              { num:'3114',label:'Prévention Suicide',sub:'24h/24, 7j/7 · Gratuit',color:'#EF4444' },
              { num:'119',label:'Allô Enfance en Danger',sub:'Si tu as peur, si tu souffres',color:'#F97316' },
              { num:'3018',label:'Cyberharcèlement',sub:'Lun–Ven 9h–23h',color:'#7C3AED' },
              { num:'15',label:'SAMU — Urgence médicale',sub:'Si tu es en danger immédiat',color:'#EF4444' },
            ].map(s => (
              <a key={s.num} href={`tel:${s.num}`} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:12,border:`2px solid ${s.color}20`,background:`${s.color}08`,marginBottom:8,textDecoration:'none',transition:'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background=s.color+'18'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background=s.color+'08'}>
                <div style={{ width:44,height:44,borderRadius:10,background:s.color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:15,flexShrink:0 }}>{s.num}</div>
                <div>
                  <p style={{ margin:0,fontWeight:700,fontSize:13,color:'#1A1A2E' }}>{s.label}</p>
                  <p style={{ margin:0,fontSize:11,color:'#6B7280' }}>{s.sub}</p>
                </div>
              </a>
            ))}
            <button onClick={() => setSosOpen(false)} style={{ width:'100%',marginTop:6,background:'#F3F4F6',border:'none',borderRadius:10,padding:'11px',fontSize:13,color:'#374151',cursor:'pointer',fontWeight:500 }}>Fermer</button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav style={{ position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(12px)',borderTop:'1px solid #E5E7EB',display:'flex',justifyContent:'space-around',padding:'6px 0 max(6px,env(safe-area-inset-bottom))' }}>
        {[
          { href:'/dashboard/ado',icon:'🏠',label:'Accueil' },
          { href:'/journal',icon:'📔',label:'Journal' },
          { href:'/chat',icon:'💬',label:'Chat' },
          { href:'/challenges',icon:'🎯',label:'Défis' },
          { href:'/profile',icon:'👤',label:'Profil' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:2,textDecoration:'none',padding:'3px 10px' }}>
            <span style={{ fontSize:19 }}>{item.icon}</span>
            <span style={{ fontSize:10,color:'#9CA3AF',fontWeight:500 }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
