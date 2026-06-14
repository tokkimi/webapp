'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const T = '#30B4A7'

export default function ProResourcesPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [resources, setResources] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ title: '', description: '', url: '', type: 'article', category: 'tools' })

  async function load(id: string) {
    const { data } = await supabase.from('resources').select('*').eq('created_by', id).order('created_at', { ascending: false })
    setResources(data || [])
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return router.replace('/auth')
      const { data: profile } = await supabase.from('profiles').select('profile_type').eq('id', user.id).single()
      if (profile?.profile_type !== 'pro') return router.replace('/dashboard')
      setUserId(user.id)
      load(user.id)
    })
  }, []) // eslint-disable-line

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('resources').insert({
      ...form,
      target_profile: 'ado',
      approved: false,
      created_by: userId,
    })
    setSaving(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setForm({ title: '', description: '', url: '', type: 'article', category: 'tools' })
    setMessage('Ressource envoyée aux gérants Capsule pour validation.')
    load(userId)
  }

  return (
    <div style={{ minHeight:'100vh',background:'#f5fafa',fontFamily:'Inter,sans-serif',color:'#082827' }}>
      <nav style={{ height:60,background:'#082827',display:'flex',alignItems:'center',gap:18,padding:'0 22px' }}>
        <Link href="/dashboard/pro" style={nav}>Tableau de bord</Link>
        <Link href="/patients" style={nav}>Patients</Link>
        <Link href="/appointments" style={nav}>Agenda</Link>
        <strong style={{ color:'#7fd9d0' }}>Mes propositions</strong>
      </nav>
      <main style={{ maxWidth:980,margin:'0 auto',padding:'30px 16px' }}>
        <p style={{ color:T,fontWeight:800,fontSize:11,letterSpacing:1.5,textTransform:'uppercase' }}>Espace professionnel</p>
        <h1 style={{ font:'800 30px Outfit',margin:'7px 0' }}>Proposer une ressource</h1>
        <p style={{ color:'#64748b' }}>Les gérants Capsule contrôlent et publient les contenus. Cet espace ne donne aucun accès à l’administration générale.</p>
        {message && <div style={{ padding:12,borderRadius:11,background:'#eaf8f6',color:'#087f73',margin:'18px 0' }}>{message}</div>}
        <div style={{ display:'grid',gridTemplateColumns:'minmax(300px,1fr) minmax(300px,1fr)',gap:18,marginTop:24 }}>
          <form onSubmit={submit} style={card}>
            <h2 style={heading}>Nouvelle proposition</h2>
            <label style={label}>Titre</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={field}/>
            <label style={label}>Lien vers la ressource</label><input required type="url" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://..." style={field}/>
            <label style={label}>Description</label><textarea rows={5} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...field,resize:'vertical'}}/>
            <label style={label}>Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={field}><option value="article">Article</option><option value="video">Vidéo</option><option value="podcast">Podcast</option><option value="guide">Guide</option><option value="tool">Outil</option></select>
            <button disabled={saving} style={{ border:0,borderRadius:99,padding:'12px 20px',background:T,color:'#fff',fontWeight:800,cursor:'pointer',marginTop:16 }}>{saving?'Envoi...':'Envoyer pour validation'}</button>
          </form>
          <section style={card}>
            <h2 style={heading}>Mes propositions</h2>
            <div style={{ display:'grid',gap:9 }}>
              {resources.length===0 && <p style={{ color:'#64748b' }}>Aucune proposition pour le moment.</p>}
              {resources.map(resource=><div key={resource.id} style={{ border:'1px solid #dceeed',borderRadius:12,padding:13 }}><strong>{resource.title}</strong><span style={{ display:'block',fontSize:11,color:resource.approved?'#087f73':'#b45309',marginTop:5 }}>{resource.approved?'Publiée par Capsule':'En attente de validation'}</span></div>)}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

const nav: React.CSSProperties={color:'#d7efec',textDecoration:'none',fontSize:13}
const card: React.CSSProperties={background:'#fff',border:'1px solid #daeeed',borderRadius:20,padding:22,boxShadow:'0 3px 16px rgba(8,40,39,.05)'}
const heading: React.CSSProperties={font:'700 19px Outfit',margin:'0 0 18px'}
const label: React.CSSProperties={display:'block',fontSize:12,fontWeight:700,margin:'12px 0 6px'}
const field: React.CSSProperties={width:'100%',border:'1px solid #cfe8e5',borderRadius:10,padding:11,font:'inherit'}
