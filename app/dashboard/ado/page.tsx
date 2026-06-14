'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const MOODS = [
  { score:1,  emoji:'😭', label:'Effondré·e', color:'rgb(239,68,68)' },
  { score:2,  emoji:'😢', label:'Triste',     color:'rgb(249,115,22)' },
  { score:3,  emoji:'😟', label:'Pas super',  color:'rgb(245,158,11)' },
  { score:4,  emoji:'😕', label:'Moyen',      color:'rgb(234,179,8)' },
  { score:5,  emoji:'😐', label:'Neutre',     color:'rgb(132,204,22)' },
  { score:6,  emoji:'🙂', label:'Pas mal',    color:'rgb(34,197,94)' },
  { score:7,  emoji:'😊', label:'Bien',       color:'rgb(20,184,166)' },
  { score:8,  emoji:'😄', label:'Super',      color:'rgb(6,182,212)' },
  { score:9,  emoji:'🤩', label:'Génial !',   color:'rgb(127,217,208)' },
  { score:10, emoji:'🌟', label:'Au top !',   color:'rgb(163,251,246)' },
]
const DAYS = ['L','M','M','J','V','S','D']

function getLast7Days() {
  return Array.from({ length:7 }, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i))
    return d.toISOString().split('T')[0]
  })
}

// ADO colors: teal palette
const C = {
  primary:   'rgb(20, 184, 166)',
  primary50: 'rgba(20,184,166,0.5)',
  primary15: 'rgba(20,184,166,0.15)',
  primary08: 'rgba(20,184,166,0.08)',
  light:     'rgb(127, 217, 208)',
  neon:      'rgb(163, 251, 246)',
  accent:    'rgb(0, 173, 239)',
  grad:      'linear-gradient(135deg, rgb(20,184,166), rgb(0,173,239))',
}

export default function AdoDashboard() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [profile, setProfile]       = useState<any>(null)
  const [motivation, setMotivation] = useState<any>(null)
  const [todayMood, setTodayMood]   = useState<number|null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('capsule_mood_' + new Date().toISOString().split('T')[0])
    return saved ? parseInt(saved) : null
  })
  const [moodHistory, setMoodHistory] = useState<Record<string,number>>({})
  const [moodPicking, setMoodPicking] = useState(false)
  const [journals, setJournals]     = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])
  const [streak, setStreak]         = useState(0)
  const [loading, setLoading]       = useState(true)
  const [motivLiked, setMotivLiked] = useState<boolean|null>(null)
  const [sosOpen, setSosOpen]       = useState(false)

  const load = useCallback(async () => {
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }

    const [profRes, motivRes, moodsRes, jrnRes, chalRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      fetch('/api/motivation'),
      supabase.from('mood_entries').select('score,created_at').eq('user_id', user.id)
        .gte('created_at', new Date(Date.now()-7*86400000).toISOString()).order('created_at',{ascending:false}),
      supabase.from('journal_entries').select('id,content,created_at').eq('user_id', user.id)
        .order('created_at',{ascending:false}).limit(3),
      supabase.from('challenges').select('*').eq('user_id', user.id).eq('completed',false).limit(4),
    ])

    const prof = profRes.data
    if (prof?.profile_type && !['ado','jeune'].includes(prof.profile_type)) {
      router.replace(`/dashboard/${prof.profile_type}`); return
    }
    setProfile(prof)

    if (motivRes.ok) {
      const m = await motivRes.json()
      setMotivation(m); setMotivLiked(m?.liked ?? null)
    }

    if (moodsRes.data) {
      const map: Record<string,number> = {}
      moodsRes.data.forEach((m:any) => { const d=m.created_at.split('T')[0]; if (!map[d]) map[d]=m.score })
      setMoodHistory(map)
      const today = new Date().toISOString().split('T')[0]
      if (map[today]) setTodayMood(map[today])
      let s=0
      for (let i=6;i>=0;i--) { if(map[getLast7Days()[i]])s++;else break }
      setStreak(s)
    }
    setJournals(jrnRes.data||[]); setChallenges(chalRes.data||[])
    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(() => { load() }, [load])

  async function logMood(score:number) {
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) return
    setTodayMood(score); setMoodPicking(false)
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('capsule_mood_' + today, String(score))
    await supabase.from('mood_entries').insert({ user_id:user.id, score, emoji:MOODS[score-1].emoji })
    setMoodHistory(p => ({...p, [today]:score}))
  }

  async function toggleLike() {
    if (!motivation) return
    const n = !motivLiked; setMotivLiked(n)
    await fetch('/api/motivation',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({motivation_id:motivation.id,liked:n}) })
  }

  const days7 = getLast7Days()
  const firstName = profile?.name?.split(' ')[0] || 'toi'
  const hour = new Date().getHours()
  const greeting = hour<12?'Bonjour':hour<18?'Salut':'Bonsoir'

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
        @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);}}
        .dc{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;transition:all 0.2s;}
        .dc:hover{background:rgba(255,255,255,0.07);border-color:rgba(20,184,166,0.25);}
        .qa{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px 12px;text-align:center;cursor:pointer;transition:all 0.2s;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:6px;}
        .qa:hover{background:rgba(20,184,166,0.12);border-color:rgba(20,184,166,0.4);transform:translateY(-2px);}
        .qa:hover .ql{color:rgb(127,217,208);}
        .mood-btn{background:none;border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:6px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all 0.15s;}
        .mood-btn:hover{border-color:rgba(20,184,166,0.5);background:rgba(20,184,166,0.08);}
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(10,10,10,0.92)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.07)',padding:'0 20px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex',alignItems:'center',textDecoration:'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Capsule" style={{ height:34,objectFit:'contain' }} />
        </Link>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <Link href="/mediatheque" style={{ fontSize:12,color:'#9ca3af',textDecoration:'none',fontWeight:500,padding:'6px 12px',borderRadius:100,border:'1px solid rgba(255,255,255,0.1)' }}>Médiathèque</Link>
          <Link href="/chat" style={{ fontSize:12,color:'#9ca3af',textDecoration:'none',fontWeight:500,padding:'6px 12px',borderRadius:100,border:'1px solid rgba(255,255,255,0.1)' }}>Chat</Link>
          <button onClick={()=>setSosOpen(true)} style={{ background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'rgb(252,165,165)',borderRadius:100,padding:'6px 12px',fontSize:12,fontWeight:700,cursor:'pointer' }}>SOS</button>
          <Link href="/profile" style={{ width:32,height:32,borderRadius:'50%',background:C.grad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,textDecoration:'none' }}>
            {(firstName[0]||'?').toUpperCase()}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth:960,margin:'0 auto',padding:'28px 16px 100px' }}>

        {/* Header */}
        <div style={{ animation:'fadeUp 0.5s ease',marginBottom:24 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
            <div>
              <h1 style={{ fontFamily:'Outfit,sans-serif',fontSize:26,fontWeight:800,margin:0,color:'#f3f4f6' }}>
                {greeting}, <span style={{ background:C.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>{firstName}</span> ✨
              </h1>
              <p style={{ color:'#6b7280',fontSize:13,margin:'3px 0 0' }}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</p>
            </div>
            {streak>0 && (
              <div style={{ background:'rgba(249,115,22,0.15)',border:'1px solid rgba(249,115,22,0.25)',borderRadius:100,padding:'5px 14px',display:'flex',alignItems:'center',gap:6 }}>
                <span style={{ fontSize:14 }}>🔥</span>
                <span style={{ color:'rgb(253,186,116)',fontWeight:700,fontSize:12 }}>{streak}j de suite</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16 }}>

          {/* Motivation du jour */}
          <div style={{ gridColumn:'1/-1',animation:'fadeUp 0.5s ease 0.08s both' }}>
            <div style={{ background:`linear-gradient(135deg, rgb(7,38,48) 0%, rgb(17,94,89) 50%, rgb(7,38,48) 100%)`,border:`1px solid ${C.primary50}`,borderRadius:22,padding:'28px',position:'relative',overflow:'hidden',boxShadow:`0 0 40px rgba(20,184,166,0.15)` }}>
              <div style={{ position:'absolute',top:-30,right:-30,width:140,height:140,background:`rgba(20,184,166,0.08)`,borderRadius:'50%',animation:'float 4s ease-in-out infinite' }} />
              <div style={{ position:'relative',zIndex:1 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:C.primary,boxShadow:`0 0 8px ${C.primary}` }} />
                  <span style={{ color:C.light,fontSize:11,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase' }}>Motivation du jour</span>
                </div>
                <p style={{ color:'#f3f4f6',fontSize:'clamp(15px,2.2vw,20px)',lineHeight:1.65,fontFamily:'Outfit,sans-serif',fontWeight:600,margin:'0 0 20px' }}>
                  {motivation?.content || 'Chaque jour est une nouvelle chance de briller. Tu as plus de force en toi que tu ne l\'imagines.'}
                </p>
                <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                  <button onClick={toggleLike} style={{ background:motivLiked?C.primary:'rgba(255,255,255,0.08)',border:`1px solid ${motivLiked?C.primary:'rgba(255,255,255,0.15)'}`,borderRadius:100,padding:'7px 16px',color:motivLiked?'#0a0a0a':'#f3f4f6',fontSize:13,cursor:'pointer',fontWeight:600,transition:'all 0.2s' }}>
                    {motivLiked?'💚 Aimé !':'🤍 J\'aime'}
                  </button>
                  <Link href="/motivation" style={{ background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:100,padding:'7px 16px',color:'#9ca3af',fontSize:13,textDecoration:'none',fontWeight:500 }}>
                    Archive →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Humeur */}
          <div className="dc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.14s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:'#f3f4f6',margin:'0 0 16px',display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ color:C.light }}>💭</span> Mon humeur
            </h3>
            {todayMood && !moodPicking ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:48,marginBottom:8 }}>{MOODS[todayMood-1].emoji}</div>
                <p style={{ color:MOODS[todayMood-1].color,fontWeight:700,fontSize:16,margin:'0 0 14px' }}>{MOODS[todayMood-1].label}</p>
                <button onClick={()=>setMoodPicking(true)} style={{ background:'none',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'5px 12px',fontSize:12,color:'#6b7280',cursor:'pointer' }}>Modifier</button>
              </div>
            ) : (
              <div>
                <p style={{ color:'#6b7280',fontSize:12,marginBottom:12 }}>Comment tu te sens aujourd'hui ?</p>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6 }}>
                  {MOODS.map(m => (
                    <button key={m.score} onClick={()=>logMood(m.score)} className="mood-btn"
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=m.color;(e.currentTarget as HTMLElement).style.background=m.color+'18'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)';(e.currentTarget as HTMLElement).style.background='none'}}>
                      <span style={{ fontSize:18 }}>{m.emoji}</span>
                      <span style={{ fontSize:9,color:'#6b7280' }}>{m.score}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7 jours */}
          <div className="dc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.18s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:'#f3f4f6',margin:'0 0 16px',display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ color:C.light }}>📊</span> Mes 7 derniers jours
            </h3>
            <div style={{ display:'flex',gap:6,alignItems:'flex-end',height:72 }}>
              {days7.map((day,i)=>{
                const score=moodHistory[day]
                const h=score?(score/10)*56+8:5
                const mc=MOODS[score?score-1:4]
                const isToday=i===6
                return (
                  <div key={day} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
                    <div style={{ width:'100%',height:h,borderRadius:5,background:score?mc.color:'rgba(255,255,255,0.08)',transition:'height 0.4s ease',boxShadow:isToday&&score?`0 0 8px ${mc.color}50`:undefined }} title={score?mc.label:'—'} />
                    <span style={{ fontSize:9,color:isToday?C.light:'#6b7280',fontWeight:isToday?700:400 }}>{DAYS[i]}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions rapides */}
          <div style={{ gridColumn:'1/-1',animation:'fadeUp 0.5s ease 0.22s both' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:'#9ca3af',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.08em' }}>Mes espaces</h3>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))',gap:10 }}>
              {[
                { href:'/journal',    icon:'📔', label:'Journal' },
                { href:'/challenges', icon:'🎯', label:'Défis' },
                { href:'/chat',       icon:'💬', label:'Chat IA' },
                { href:'/mediatheque',icon:'📚', label:'Médiathèque' },
                { href:'/motivation', icon:'✨', label:'Motivation' },
                { href:'/profile',    icon:'👤', label:'Profil' },
              ].map(a=>(
                <Link key={a.href} href={a.href} className="qa">
                  <span style={{ fontSize:24 }}>{a.icon}</span>
                  <span className="ql" style={{ fontSize:12,fontWeight:600,color:'#9ca3af' }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Défis */}
          <div className="dc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.26s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:'#f3f4f6',margin:0 }}>🎯 Défis actifs</h3>
              <Link href="/challenges" style={{ fontSize:12,color:C.light,textDecoration:'none',fontWeight:600 }}>Voir tout →</Link>
            </div>
            {challenges.length===0 ? (
              <div style={{ textAlign:'center',padding:'16px 0' }}>
                <p style={{ color:'#6b7280',fontSize:13,marginBottom:10 }}>Lance-toi un défi ! 💪</p>
                <Link href="/challenges" style={{ display:'inline-block',background:C.grad,color:'#fff',borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:600,textDecoration:'none' }}>Créer un défi</Link>
              </div>
            ) : challenges.map((c:any)=>(
              <div key={c.id} style={{ marginBottom:8,padding:'10px 14px',background:C.primary08,border:`1px solid ${C.primary15}`,borderRadius:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <span style={{ fontWeight:600,fontSize:13,color:'#f3f4f6' }}>{c.title}</span>
                  {c.streak>0&&<span style={{ fontSize:12,color:'rgb(253,186,116)',fontWeight:700 }}>🔥{c.streak}j</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Journal */}
          <div className="dc" style={{ padding:22,animation:'fadeUp 0.5s ease 0.3s both' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:'#f3f4f6',margin:0 }}>📔 Journal récent</h3>
              <Link href="/journal" style={{ fontSize:12,color:C.light,textDecoration:'none',fontWeight:600 }}>Ouvrir →</Link>
            </div>
            {journals.length===0 ? (
              <div style={{ textAlign:'center',padding:'16px 0' }}>
                <p style={{ color:'#6b7280',fontSize:13,marginBottom:10 }}>Ton journal t'attend ✍️</p>
                <Link href="/journal" style={{ display:'inline-block',background:C.grad,color:'#fff',borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:600,textDecoration:'none' }}>Écrire</Link>
              </div>
            ) : journals.slice(0,2).map((j:any)=>(
              <div key={j.id} style={{ marginBottom:8,padding:'10px 12px',background:'rgba(255,255,255,0.03)',borderRadius:10,border:'1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ fontSize:12,color:'#9ca3af',lineHeight:1.5,margin:'0 0 4px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{j.content}</p>
                <span style={{ fontSize:10,color:'#6b7280' }}>{new Date(j.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* SOS */}
      {sosOpen&&(
        <div onClick={()=>setSosOpen(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(10px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#111',border:'1px solid rgba(239,68,68,0.3)',borderRadius:24,padding:'28px',maxWidth:420,width:'100%',boxShadow:'0 20px 60px rgba(239,68,68,0.2)' }}>
            <h2 style={{ fontFamily:'Outfit,sans-serif',fontSize:20,fontWeight:800,color:'#f3f4f6',margin:'0 0 8px',textAlign:'center' }}>🆘 Tu n'es pas seul·e</h2>
            <p style={{ color:'#9ca3af',fontSize:13,textAlign:'center',margin:'0 0 20px',lineHeight:1.6 }}>Des personnes formées sont là pour toi, maintenant :</p>
            {[
              { num:'3114',label:'Prévention Suicide',sub:'24h/24, 7j/7 · Gratuit',color:'rgb(239,68,68)' },
              { num:'119', label:'Allô Enfance en Danger',sub:'Si tu souffres ou as peur',color:'rgb(249,115,22)' },
              { num:'3018',label:'Cyberharcèlement',sub:'Lun–Ven 9h–23h',color:'rgb(127,217,208)' },
              { num:'15',  label:'SAMU — Urgence médicale',sub:'Si tu es en danger immédiat',color:'rgb(239,68,68)' },
            ].map(s=>(
              <a key={s.num} href={`tel:${s.num}`} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:12,border:`1px solid ${s.color}25`,background:`${s.color}0A`,marginBottom:8,textDecoration:'none',transition:'all 0.2s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=s.color+'18'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=s.color+'0A'}>
                <div style={{ width:44,height:44,borderRadius:10,background:s.color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:15,flexShrink:0 }}>{s.num}</div>
                <div>
                  <p style={{ margin:0,fontWeight:700,fontSize:13,color:'#f3f4f6' }}>{s.label}</p>
                  <p style={{ margin:0,fontSize:11,color:'#6b7280' }}>{s.sub}</p>
                </div>
              </a>
            ))}
            <button onClick={()=>setSosOpen(false)} style={{ width:'100%',marginTop:6,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'11px',fontSize:13,color:'#9ca3af',cursor:'pointer',fontWeight:500 }}>Fermer</button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav style={{ position:'fixed',bottom:0,left:0,right:0,background:'rgba(10,10,10,0.95)',backdropFilter:'blur(16px)',borderTop:'1px solid rgba(255,255,255,0.07)',display:'flex',justifyContent:'space-around',padding:'6px 0 max(6px,env(safe-area-inset-bottom))' }}>
        {[
          { href:'/dashboard/ado', icon:'🏠', label:'Accueil' },
          { href:'/journal',       icon:'📔', label:'Journal' },
          { href:'/chat',          icon:'💬', label:'Chat' },
          { href:'/challenges',    icon:'🎯', label:'Défis' },
          { href:'/profile',       icon:'👤', label:'Profil' },
        ].map(item=>(
          <Link key={item.href} href={item.href} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:2,textDecoration:'none',padding:'3px 10px' }}>
            <span style={{ fontSize:18 }}>{item.icon}</span>
            <span style={{ fontSize:10,color:'#6b7280',fontWeight:500 }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
