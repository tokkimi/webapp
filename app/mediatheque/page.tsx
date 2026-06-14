'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const T = '#30B4A7'
const DARK = '#082827'

const CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'crisis', label: 'Urgences & Crises' },
  { id: 'anxiety', label: 'Anxiété & Stress' },
  { id: 'depression', label: 'Dépression & Mal-être' },
  { id: 'family', label: 'Relations & Famille' },
  { id: 'school', label: 'Scolarité & Orientation' },
  { id: 'body', label: 'Corps & Alimentation' },
  { id: 'addiction', label: 'Addictions' },
  { id: 'sexuality', label: 'Identité & Sexualité' },
  { id: 'violence', label: 'Violence & Harcèlement' },
  { id: 'sleep', label: 'Sommeil & Bien-être' },
  { id: 'tools', label: 'Outils & Exercices' },
  { id: 'parents', label: 'Espace parents' },
  { id: 'pros', label: 'Espace professionnels' },
]

const TYPE_LABELS: Record<string, string> = { article: 'Article', video: 'Vidéo', tool: 'Outil', hotline: 'Ligne d\'aide', podcast: 'Podcast', guide: 'Guide' }

const STATIC_RESOURCES = [
  { id:'s1', title:'Numéro 3114 — Prévention Suicide', description:'La ligne nationale de prévention du suicide, disponible 24h/24, 7j/7.', url:'tel:3114', type:'hotline', category:'crisis', tags:['urgence','suicide','écoute'], target_profile:'all', approved:true },
  { id:'s2', title:'119 — Allô Enfance en Danger', description:'Pour signaler une situation de danger ou de maltraitance concernant un mineur. Anonyme et gratuit.', url:'tel:119', type:'hotline', category:'crisis', tags:['enfance','danger','urgence'], target_profile:'all', approved:true },
  { id:'s3', title:'3018 — Cyberharcèlement', description:'Numéro national contre le cyberharcèlement, disponible du lundi au vendredi de 9h à 23h.', url:'tel:3018', type:'hotline', category:'violence', tags:['cyberharcèlement','réseaux sociaux'], target_profile:'ado', approved:true },
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('profile_type, name').eq('id', user.id).single().then(({ data }) => {
          setProfile(data)
        })
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
    <div style={{ minHeight:'100vh', background:'#f5fafa', fontFamily:'Inter,Outfit,sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .rescard{background:#fff;border-radius:16px;border:1px solid #daeeed;box-shadow:0 2px 8px rgba(48,180,167,0.06);transition:all 0.2s;overflow:hidden;}
        .rescard:hover{box-shadow:0 6px 20px rgba(48,180,167,0.14);transform:translateY(-2px);}
        .catbtn{border:1.5px solid #daeeed;background:#fff;color:#444;border-radius:100px;padding:7px 14px;font-size:13px;font-family:Inter,sans-serif;cursor:pointer;transition:all 0.15s;white-space:nowrap;font-weight:500;}
        .catbtn.active{background:${T};border-color:${T};color:#fff;}
        .catbtn:hover:not(.active){border-color:${T};color:${T};}
        @media(max-width:640px){
          .cat-scroll{padding:12px 16px !important;}
          .res-grid{grid-template-columns:1fr !important;}
          .hero-title{font-size:24px !important;}
          .search-wrap{padding:0 16px !important;}
          .main-pad{padding:20px 12px 60px !important;}
        }
      `}</style>

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(245,250,250,0.96)',backdropFilter:'blur(12px)',borderBottom:'1px solid #daeeed',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <Link href="/" style={{ display:'flex',alignItems:'center',gap:8,textDecoration:'none' }}>
            <Image src="/logo.png" width={34} height={34} alt="Capsule" style={{ borderRadius:8 }} />
          </Link>
          <Link href={profile ? `/dashboard/${profile.profile_type}` : '/'} style={{ display:'flex',alignItems:'center',gap:4,textDecoration:'none',color:T,fontWeight:600,fontSize:14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Retour
          </Link>
        </div>
        <span style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:16,color:DARK }}>Médiathèque</span>
        <div style={{ width:80 }} />
      </nav>

      {/* Hero */}
      <div style={{ background:DARK,padding:'36px 24px 40px',textAlign:'center' }}>
        <h1 className="hero-title" style={{ fontFamily:'Outfit,sans-serif',fontSize:'clamp(22px,4vw,34px)',fontWeight:800,color:'#fff',margin:'0 0 10px' }}>Médiathèque</h1>
        <p style={{ color:'rgba(255,255,255,0.75)',fontSize:15,maxWidth:480,margin:'0 auto 24px',lineHeight:1.6 }}>
          Ressources sélectionnées et vérifiées par des professionnels de santé mentale
        </p>
        <div className="search-wrap" style={{ maxWidth:480,margin:'0 auto',position:'relative' }}>
          <input
            type="text"
            placeholder="Rechercher une ressource, un thème…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width:'100%',padding:'13px 20px 13px 44px',borderRadius:100,border:'none',fontSize:15,fontFamily:'Inter,sans-serif',outline:'none',boxSizing:'border-box',background:'rgba(255,255,255,0.96)',boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}
          />
          <svg style={{ position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',opacity:0.5 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#082827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
      </div>

      {/* Categories */}
      <div style={{ background:'#fff',borderBottom:'1px solid #daeeed',overflowX:'auto' }}>
        <div className="cat-scroll" style={{ display:'flex',gap:8,padding:'14px 24px',width:'max-content' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)}
              className={`catbtn${activeCategory===c.id?' active':''}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="main-pad" style={{ maxWidth:1100,margin:'0 auto',padding:'24px 16px 60px' }}>

        {/* Crisis banner */}
        {(activeCategory === 'all' || activeCategory === 'crisis') && (
          <div style={{ background:DARK,borderRadius:18,padding:'18px 22px',marginBottom:22,display:'flex',flexWrap:'wrap',gap:14,alignItems:'center',justifyContent:'space-between',animation:'fadeUp 0.4s ease' }}>
            <div>
              <p style={{ color:'#fff',fontWeight:800,fontSize:15,fontFamily:'Outfit,sans-serif',margin:'0 0 3px' }}>En cas d'urgence</p>
              <p style={{ color:'rgba(255,255,255,0.8)',fontSize:13,margin:0 }}>Si toi ou quelqu'un est en danger immédiat, contacte le 15 (SAMU) ou le 3114</p>
            </div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
              <a href="tel:3114" style={{ background:T,color:'#fff',borderRadius:100,padding:'8px 20px',fontWeight:700,fontSize:14,textDecoration:'none' }}>3114</a>
              <a href="tel:15" style={{ background:'rgba(255,255,255,0.15)',color:'#fff',border:'1px solid rgba(255,255,255,0.3)',borderRadius:100,padding:'8px 20px',fontWeight:600,fontSize:14,textDecoration:'none' }}>15 — SAMU</a>
            </div>
          </div>
        )}

        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
          <h2 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:17,color:DARK,margin:0 }}>
            {cat?.label === 'Tout' ? 'Toutes les ressources' : cat?.label}
            <span style={{ fontSize:14,color:'#9CA3AF',fontWeight:400,marginLeft:8 }}>({filtered.length})</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:'48px 0' }}>
            <svg style={{ opacity:0.3,margin:'0 auto 16px',display:'block' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <p style={{ color:'#9CA3AF',fontSize:16,marginTop:0 }}>Aucune ressource trouvée</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all') }} style={{ marginTop:12,background:T,color:'#fff',border:'none',borderRadius:100,padding:'10px 24px',cursor:'pointer',fontWeight:600,fontSize:14 }}>
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="res-grid" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16 }}>
            {filtered.map((r, i) => {
              const isHotline = r.type === 'hotline'
              return (
                <div key={r.id} className="rescard" style={{ animationDelay:`${i*0.04}s`,animation:'fadeUp 0.4s ease both' }}>
                  <div style={{ height:4,background:isHotline?'#ef4444':T,borderRadius:'16px 16px 0 0' }} />
                  <div style={{ padding:'18px 20px' }}>
                    <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:10 }}>
                      <span style={{ fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:100,background:isHotline?'#FEE2E2':'#f0fafa',color:isHotline?'#991B1B':T,letterSpacing:'0.5px' }}>
                        {TYPE_LABELS[r.type] || r.type}
                      </span>
                      {r.target_profile !== 'all' && (
                        <span style={{ fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:100,background:'#f0fafa',color:T }}>
                          {r.target_profile === 'ado' ? 'Ados' : r.target_profile === 'parent' ? 'Parents' : 'Pros'}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:15,color:DARK,margin:'0 0 8px',lineHeight:1.4 }}>{r.title}</h3>
                    <p style={{ fontSize:13,color:'#6B7280',lineHeight:1.6,margin:'0 0 14px' }}>{r.description}</p>
                    {r.tags?.length > 0 && (
                      <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:14 }}>
                        {r.tags.map((t: string) => (
                          <span key={t} onClick={() => setSearch(t)} style={{ fontSize:11,color:T,background:'#f0fafa',borderRadius:100,padding:'2px 8px',cursor:'pointer' }}>#{t}</span>
                        ))}
                      </div>
                    )}
                    {r.url ? (
                      <a href={r.url} target={r.url.startsWith('tel:') ? '_self' : '_blank'} rel="noopener noreferrer"
                        style={{ display:'inline-flex',alignItems:'center',gap:6,background:isHotline?'#ef4444':T,color:'#fff',borderRadius:100,padding:'8px 18px',fontSize:13,fontWeight:600,textDecoration:'none' }}>
                        {isHotline ? `Appeler le ${r.url.replace('tel:','')}` : 'Accéder a la ressource'}
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

        {/* Suggestion */}
        <div style={{ marginTop:40,background:'#fff',borderRadius:18,padding:'24px',textAlign:'center',border:'1px solid #daeeed' }}>
          <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:17,color:DARK,margin:'0 0 8px' }}>Vous connaissez une ressource utile ?</h3>
          <p style={{ color:'#6B7280',fontSize:14,margin:'0 0 16px' }}>Suggérez-la à notre équipe. Après vérification, elle sera ajoutée à la médiathèque.</p>
          <a href="mailto:ressources@capsule-ado.com?subject=Suggestion de ressource" style={{ display:'inline-block',background:T,color:'#fff',borderRadius:100,padding:'10px 28px',fontSize:14,fontWeight:600,textDecoration:'none' }}>
            Suggérer une ressource
          </a>
        </div>
      </div>
    </div>
  )
}
