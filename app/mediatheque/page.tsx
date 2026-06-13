'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: '🌐' },
  { id: 'crisis', label: 'Urgences & Lignes de crise', icon: '🆘', color: '#EF4444' },
  { id: 'anxiety', label: 'Anxiété & Stress', icon: '🌀', color: '#7C3AED' },
  { id: 'depression', label: 'Dépression & Mal-être', icon: '💙', color: '#2563EB' },
  { id: 'family', label: 'Relations & Famille', icon: '👨‍👩‍👦', color: '#0D9488' },
  { id: 'school', label: 'Scolarité & Orientation', icon: '📚', color: '#F59E0B' },
  { id: 'body', label: 'Corps & Alimentation', icon: '🌱', color: '#10B981' },
  { id: 'addiction', label: 'Addictions & Dépendances', icon: '🔗', color: '#F97316' },
  { id: 'sexuality', label: 'Identité & Sexualité', icon: '🏳️‍🌈', color: '#EC4899' },
  { id: 'violence', label: 'Violence & Harcèlement', icon: '🛡️', color: '#DC2626' },
  { id: 'sleep', label: 'Sommeil & Bien-être', icon: '🌙', color: '#6366F1' },
  { id: 'tools', label: 'Outils & Exercices', icon: '🧰', color: '#059669' },
  { id: 'parents', label: 'Espace parents', icon: '💚', color: '#0D9488' },
  { id: 'pros', label: 'Espace professionnels', icon: '🔵', color: '#1E3A5F' },
]

const TYPE_ICONS: Record<string, string> = { article: '📄', video: '🎬', tool: '🧰', hotline: '📞', podcast: '🎧', guide: '📋' }

// Static resources displayed when DB is empty / for demo
const STATIC_RESOURCES = [
  { id:'s1', title:'Numéro 3114 — Prévention Suicide', description:'La ligne nationale de prévention du suicide, disponible 24h/24, 7j/7, pour vous ou pour quelqu\'un que vous connaissez.', url:'tel:3114', type:'hotline', category:'crisis', tags:['urgence','suicide','écoute'], target_profile:'all', approved:true },
  { id:'s2', title:'119 — Allô Enfance en Danger', description:'Pour signaler une situation de danger ou de maltraitance concernant un mineur. Anonyme et gratuit.', url:'tel:119', type:'hotline', category:'crisis', tags:['enfance','danger','urgence'], target_profile:'all', approved:true },
  { id:'s3', title:'3018 — Cyberharcèlement', description:'Numéro national contre le cyberharcèlement, disponible du lundi au vendredi de 9h à 23h et les samedi de 9h à 18h.', url:'tel:3018', type:'hotline', category:'violence', tags:['cyberharcèlement','réseaux sociaux'], target_profile:'ado', approved:true },
  { id:'s4', title:'Fil Santé Jeunes — 3114', description:'Écoute, information et orientation sur tous les sujets de santé pour les jeunes de 12 à 25 ans.', url:'https://www.filsantejeunes.com', type:'hotline', category:'anxiety', tags:['santé','jeunes','écoute'], target_profile:'ado', approved:true },
  { id:'s5', title:'La cohérence cardiaque en 5 minutes', description:'Technique de respiration simple et prouvée pour réduire le stress et l\'anxiété immédiatement.', url:null, type:'tool', category:'anxiety', tags:['respiration','stress','exercice'], target_profile:'ado', approved:true },
  { id:'s6', title:'Comment parler à son ado qui se renferme ?', description:'Guide pratique pour les parents : techniques de communication non-violente adaptées à l\'adolescence.', url:null, type:'article', category:'family', tags:['communication','parents','ados'], target_profile:'parent', approved:true },
  { id:'s7', title:'Comprendre l\'anxiété scolaire', description:'Explications et pistes d\'action face à l\'anxiété de performance et la phobie scolaire.', url:null, type:'article', category:'school', tags:['école','anxiété','phobies'], target_profile:'ado', approved:true },
  { id:'s8', title:'Le sommeil de l\'adolescent', description:'Tout ce qu\'il faut savoir sur les besoins en sommeil des 13-18 ans et comment améliorer la qualité du sommeil.', url:null, type:'article', category:'sleep', tags:['sommeil','rythme','mélatonine'], target_profile:'ado', approved:true },
  { id:'s9', title:'Méditation guidée débutant — 10 min', description:'Séance de méditation de pleine conscience accessible à tous les niveaux pour apaiser le mental.', url:null, type:'tool', category:'tools', tags:['méditation','pleine conscience','relaxation'], target_profile:'all', approved:true },
  { id:'s10', title:'Reconnaître un épisode dépressif chez son enfant', description:'Signes d\'alarme, comment réagir et vers qui se tourner en cas de dépression adolescente.', url:null, type:'article', category:'depression', tags:['dépression','signes','parents'], target_profile:'parent', approved:true },
  { id:'s11', title:'Identité de genre et orientation sexuelle — ressources', description:'Informations bienveillantes sur l\'identité de genre, la sexualité, avec liens vers des associations d\'écoute.', url:'https://www.haro-asso.fr', type:'article', category:'sexuality', tags:['LGBTQ+','identité','soutien'], target_profile:'ado', approved:true },
  { id:'s12', title:'Évaluation HAS — Dépistage dépression adolescente', description:'Grille d\'évaluation clinique du PHQ-A validée pour les professionnels de santé.', url:null, type:'tool', category:'depression', tags:['clinique','évaluation','PHQ-A'], target_profile:'pro', approved:true },
]

export default function Mediatheque() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [profile, setProfile] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [resources, setResources] = useState<any[]>(STATIC_RESOURCES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('profile_type, name').eq('id', user.id).single().then(({ data }) => {
          setProfile(data)
        })
        // Fetch DB resources too
        supabase.from('resources').select('*').eq('approved', true).then(({ data }) => {
          if (data?.length) setResources([...STATIC_RESOURCES, ...data])
        })
      }
    })
  }, []) // eslint-disable-line

  const filtered = resources.filter(r => {
    const catMatch = activeCategory === 'all' || r.category === activeCategory
    const profileMatch = !profile || r.target_profile === 'all' || r.target_profile === profile.profile_type
    const searchMatch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()) || r.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
    return catMatch && profileMatch && searchMatch
  })

  const cat = CATEGORIES.find(c => c.id === activeCategory)

  return (
    <div style={{ minHeight:'100vh',background:'#F8F7FF',fontFamily:'Inter,sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .rescard{background:#fff;border-radius:16px;border:1px solid #F3F4F6;box-shadow:0 2px 12px rgba(0,0,0,0.04);transition:all 0.2s;overflow:hidden;}
        .rescard:hover{box-shadow:0 6px 24px rgba(0,0,0,0.1);transform:translateY(-2px);}
        .catbtn{border:1.5px solid #E5E7EB;background:#fff;borderRadius:100px;padding:7px 14px;font-size:13px;font-family:Inter,sans-serif;cursor:pointer;transition:all 0.15s;white-space:nowrap;display:flex;align-items:center;gap:5px;}
        .catbtn.active{background:#7C3AED;border-color:#7C3AED;color:#fff;}
        .catbtn:hover{border-color:#7C3AED;color:#7C3AED;}
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(248,247,255,0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(124,58,237,0.1)',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href={profile ? `/dashboard/${profile.profile_type}` : '/'} style={{ fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:18,color:'#7C3AED',textDecoration:'none' }}>
          ← Capsule Ado
        </Link>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          {profile?.profile_type === 'pro' && (
            <Link href="/admin/mediatheque" style={{ fontSize:12,color:'#6B7280',textDecoration:'none',background:'#F3F4F6',borderRadius:8,padding:'5px 12px',fontWeight:500 }}>
              ⚙️ Gérer les ressources
            </Link>
          )}
          {profile && <Link href="/profile" style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#EC4899)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,textDecoration:'none' }}>{(profile.name?.[0]||'?').toUpperCase()}</Link>}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#7C3AED 0%,#2563EB 100%)',padding:'40px 24px 48px',textAlign:'center' }}>
        <h1 style={{ fontFamily:'Outfit,sans-serif',fontSize:'clamp(24px,4vw,38px)',fontWeight:800,color:'#fff',margin:'0 0 10px' }}>📚 Médiathèque</h1>
        <p style={{ color:'rgba(255,255,255,0.8)',fontSize:16,maxWidth:500,margin:'0 auto 24px',lineHeight:1.6 }}>
          Ressources sélectionnées et vérifiées par des professionnels de santé mentale
        </p>
        {/* Search */}
        <div style={{ maxWidth:480,margin:'0 auto',position:'relative' }}>
          <input
            type="text"
            placeholder="Rechercher une ressource, un thème…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width:'100%',padding:'14px 20px 14px 44px',borderRadius:100,border:'none',fontSize:15,fontFamily:'Inter,sans-serif',outline:'none',boxSizing:'border-box',background:'rgba(255,255,255,0.95)',boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}
          />
          <span style={{ position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontSize:18 }}>🔍</span>
        </div>
      </div>

      {/* Categories */}
      <div style={{ background:'#fff',borderBottom:'1px solid #F3F4F6',padding:'16px 24px',overflowX:'auto' }}>
        <div style={{ display:'flex',gap:8,maxWidth:1100,margin:'0 auto',width:'max-content' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)}
              className={`catbtn${activeCategory===c.id?' active':''}`}
              style={{ color:activeCategory===c.id?'#fff':(c.color||'#374151'),borderColor:activeCategory===c.id?'#7C3AED':(c.color||'#E5E7EB') }}>
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1100,margin:'0 auto',padding:'28px 16px 60px' }}>

        {/* Crisis banner */}
        {(activeCategory === 'all' || activeCategory === 'crisis') && (
          <div style={{ background:'linear-gradient(135deg,#EF4444,#F97316)',borderRadius:18,padding:'20px 24px',marginBottom:24,display:'flex',flexWrap:'wrap',gap:16,alignItems:'center',justifyContent:'space-between',animation:'fadeUp 0.4s ease' }}>
            <div>
              <p style={{ color:'#fff',fontWeight:800,fontSize:16,fontFamily:'Outfit,sans-serif',margin:'0 0 4px' }}>🆘 En cas d'urgence</p>
              <p style={{ color:'rgba(255,255,255,0.9)',fontSize:13,margin:0 }}>Si toi ou quelqu'un est en danger immédiat, contacte le 15 (SAMU) ou le 3114</p>
            </div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
              <a href="tel:3114" style={{ background:'#fff',color:'#EF4444',borderRadius:100,padding:'8px 18px',fontWeight:800,fontSize:14,textDecoration:'none' }}>📞 3114</a>
              <a href="tel:15" style={{ background:'rgba(255,255,255,0.2)',color:'#fff',border:'1px solid rgba(255,255,255,0.4)',borderRadius:100,padding:'8px 18px',fontWeight:700,fontSize:14,textDecoration:'none' }}>🚑 15 — SAMU</a>
            </div>
          </div>
        )}

        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
          <h2 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:18,color:'#1A1A2E',margin:0 }}>
            {cat?.icon} {cat?.label === 'Tout' ? 'Toutes les ressources' : cat?.label}
            <span style={{ fontSize:14,color:'#9CA3AF',fontWeight:400,marginLeft:8 }}>({filtered.length})</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:'48px 0' }}>
            <span style={{ fontSize:48 }}>🔍</span>
            <p style={{ color:'#9CA3AF',fontSize:16,marginTop:12 }}>Aucune ressource trouvée</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all') }} style={{ marginTop:12,background:'#7C3AED',color:'#fff',border:'none',borderRadius:10,padding:'10px 20px',cursor:'pointer',fontWeight:600 }}>
              Réinitialiser
            </button>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16 }}>
            {filtered.map((r, i) => {
              const catInfo = CATEGORIES.find(c => c.id === r.category)
              const isHotline = r.type === 'hotline'
              return (
                <div key={r.id} className="rescard" style={{ animationDelay:`${i*0.04}s`,animation:'fadeUp 0.4s ease both' }}>
                  {/* Top accent */}
                  <div style={{ height:4,background:isHotline?'#EF4444':(catInfo?.color||'#7C3AED') }} />
                  <div style={{ padding:'18px 20px' }}>
                    <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:10 }}>
                      <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                        <span style={{ fontSize:11,fontWeight:600,padding:'3px 8px',borderRadius:100,background:isHotline?'#FEE2E2':'#F3F4F6',color:isHotline?'#991B1B':'#374151' }}>
                          {TYPE_ICONS[r.type]} {r.type}
                        </span>
                        {r.target_profile !== 'all' && (
                          <span style={{ fontSize:11,fontWeight:600,padding:'3px 8px',borderRadius:100,background:'#EDE9FE',color:'#5B21B6' }}>
                            {r.target_profile === 'ado' ? '💜 Ados' : r.target_profile === 'parent' ? '💚 Parents' : '🔵 Pros'}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:'#1A1A2E',margin:'0 0 8px',lineHeight:1.4 }}>{r.title}</h3>
                    <p style={{ fontSize:13,color:'#6B7280',lineHeight:1.6,margin:'0 0 14px' }}>{r.description}</p>
                    {r.tags?.length > 0 && (
                      <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:14 }}>
                        {r.tags.map((t: string) => (
                          <span key={t} onClick={() => setSearch(t)} style={{ fontSize:11,color:'#7C3AED',background:'#F3E8FF',borderRadius:100,padding:'2px 8px',cursor:'pointer' }}>#{t}</span>
                        ))}
                      </div>
                    )}
                    {r.url ? (
                      <a href={r.url} target={r.url.startsWith('tel:') ? '_self' : '_blank'} rel="noopener noreferrer"
                        style={{ display:'inline-flex',alignItems:'center',gap:6,background:isHotline?'#EF4444':'#7C3AED',color:'#fff',borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:600,textDecoration:'none' }}>
                        {isHotline ? `📞 Appeler le ${r.url.replace('tel:','')}` : '→ Accéder à la ressource'}
                      </a>
                    ) : (
                      <span style={{ fontSize:12,color:'#9CA3AF',fontStyle:'italic' }}>Disponible dans l'application</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Suggestion/contribution */}
        <div style={{ marginTop:40,background:'linear-gradient(135deg,#EDE9FE,#E0F2FE)',borderRadius:18,padding:'24px',textAlign:'center' }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:18,color:'#1A1A2E',margin:'0 0 8px' }}>Vous connaissez une ressource utile ?</h3>
          <p style={{ color:'#6B7280',fontSize:14,margin:'0 0 16px' }}>Suggérez-la à notre équipe. Après vérification, elle sera ajoutée à la médiathèque.</p>
          <a href="mailto:ressources@capsule-ado.com?subject=Suggestion de ressource" style={{ display:'inline-block',background:'#7C3AED',color:'#fff',borderRadius:12,padding:'10px 24px',fontSize:14,fontWeight:600,textDecoration:'none' }}>
            💡 Suggérer une ressource
          </a>
        </div>
      </div>
    </div>
  )
}
