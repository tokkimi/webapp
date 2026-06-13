'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const CATEGORIES = [
  { id:'crisis',label:'Urgences & Crises' },
  { id:'anxiety',label:'Anxiété & Stress' },
  { id:'depression',label:'Dépression & Mal-être' },
  { id:'family',label:'Relations & Famille' },
  { id:'school',label:'Scolarité & Orientation' },
  { id:'body',label:'Corps & Alimentation' },
  { id:'addiction',label:'Addictions & Dépendances' },
  { id:'sexuality',label:'Identité & Sexualité' },
  { id:'violence',label:'Violence & Harcèlement' },
  { id:'sleep',label:'Sommeil & Bien-être' },
  { id:'tools',label:'Outils & Exercices' },
  { id:'parents',label:'Espace parents' },
  { id:'pros',label:'Espace professionnels' },
]

const TYPES = ['article','video','tool','hotline','podcast','guide']

export default function AdminMediatheque() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [profile, setProfile] = useState<any>(null)
  const [resources, setResources] = useState<any[]>([])
  const [filter, setFilter] = useState<'all'|'pending'|'approved'>('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', url: '', type: 'article', category: 'anxiety',
    target_profile: 'all', tags: '', approved: false,
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/auth'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      // Only pros and admins can access
      if (prof?.profile_type !== 'pro') { router.replace('/'); return }
      setProfile(prof)
      loadResources()
    })
  }, []) // eslint-disable-line

  async function loadResources() {
    setLoading(true)
    const { data } = await supabase.from('resources').select('*, creator:profiles!resources_created_by_fkey(name)').order('created_at', { ascending: false })
    setResources(data || [])
    setLoading(false)
  }

  async function saveResource() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    await supabase.from('resources').insert({
      title: form.title, description: form.description, url: form.url || null,
      type: form.type, category: form.category, target_profile: form.target_profile,
      tags, approved: form.approved, created_by: user?.id,
    })
    setForm({ title:'',description:'',url:'',type:'article',category:'anxiety',target_profile:'all',tags:'',approved:false })
    setShowForm(false)
    setSaving(false)
    loadResources()
  }

  async function toggleApprove(id: string, current: boolean) {
    await supabase.from('resources').update({ approved: !current }).eq('id', id)
    loadResources()
  }

  async function deleteResource(id: string) {
    if (!confirm('Supprimer cette ressource ?')) return
    await supabase.from('resources').delete().eq('id', id)
    loadResources()
  }

  const filtered = resources.filter(r => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  return (
    <div style={{ minHeight:'100vh',background:'#F8FAFC',fontFamily:'Inter,sans-serif' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}`}</style>

      <nav style={{ background:'#1E3A5F',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/dashboard/pro" style={{ fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:16,color:'#fff',textDecoration:'none' }}>← Dashboard Pro</Link>
        <span style={{ color:'rgba(255,255,255,0.8)',fontSize:13 }}>⚙️ Administration Médiathèque</span>
      </nav>

      <div style={{ maxWidth:1100,margin:'0 auto',padding:'28px 16px' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:'Outfit,sans-serif',fontSize:24,fontWeight:800,color:'#1A1A2E',margin:'0 0 4px' }}>Gestion de la Médiathèque</h1>
            <p style={{ color:'#6B7280',fontSize:13,margin:0 }}>{resources.filter(r=>!r.approved).length} en attente · {resources.filter(r=>r.approved).length} approuvées</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background:'#1E3A5F',color:'#fff',border:'none',borderRadius:12,padding:'10px 20px',fontSize:14,fontWeight:600,cursor:'pointer' }}>
            {showForm ? '✕ Annuler' : '+ Ajouter une ressource'}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div style={{ background:'#fff',borderRadius:18,padding:'24px',marginBottom:24,border:'1px solid #E5E7EB',animation:'fadeUp 0.3s ease' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:16,margin:'0 0 20px' }}>Nouvelle ressource</h3>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14 }}>
              {[
                { label:'Titre *',key:'title',type:'text',placeholder:'Nom de la ressource' },
                { label:'URL (optionnel)',key:'url',type:'url',placeholder:'https://...' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:13,fontWeight:600,color:'#374151',display:'block',marginBottom:6 }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder}
                    style={{ width:'100%',padding:'10px 14px',border:'1px solid #E5E7EB',borderRadius:10,fontSize:14,fontFamily:'Inter,sans-serif',outline:'none',boxSizing:'border-box' }} />
                </div>
              ))}
              {[
                { label:'Type',key:'type',options:TYPES },
                { label:'Catégorie',key:'category',options:CATEGORIES.map(c=>({value:c.id,label:c.label})) },
                { label:'Profil cible',key:'target_profile',options:[{value:'all',label:'Tous'},{value:'ado',label:'Ados'},{value:'parent',label:'Parents'},{value:'pro',label:'Professionnels'}] },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:13,fontWeight:600,color:'#374151',display:'block',marginBottom:6 }}>{f.label}</label>
                  <select value={(form as any)[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}
                    style={{ width:'100%',padding:'10px 14px',border:'1px solid #E5E7EB',borderRadius:10,fontSize:14,fontFamily:'Inter,sans-serif',outline:'none',background:'#fff',boxSizing:'border-box' }}>
                    {f.options.map((o: any) => (
                      <option key={typeof o==='string'?o:o.value} value={typeof o==='string'?o:o.value}>{typeof o==='string'?o:o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:13,fontWeight:600,color:'#374151',display:'block',marginBottom:6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={3}
                  style={{ width:'100%',padding:'10px 14px',border:'1px solid #E5E7EB',borderRadius:10,fontSize:14,fontFamily:'Inter,sans-serif',outline:'none',resize:'vertical',boxSizing:'border-box' }}
                  placeholder="Brève description de la ressource…" />
              </div>
              <div>
                <label style={{ fontSize:13,fontWeight:600,color:'#374151',display:'block',marginBottom:6 }}>Tags (séparés par virgule)</label>
                <input type="text" value={form.tags} onChange={e => setForm({...form,tags:e.target.value})}
                  placeholder="stress, adolescent, outil…"
                  style={{ width:'100%',padding:'10px 14px',border:'1px solid #E5E7EB',borderRadius:10,fontSize:14,fontFamily:'Inter,sans-serif',outline:'none',boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <input type="checkbox" id="approved" checked={form.approved} onChange={e => setForm({...form,approved:e.target.checked})} />
                <label htmlFor="approved" style={{ fontSize:14,color:'#374151',cursor:'pointer' }}>Approuver immédiatement</label>
              </div>
            </div>
            <div style={{ marginTop:18,display:'flex',gap:10' }}>
              <button onClick={saveResource} disabled={saving||!form.title}
                style={{ background:'#1E3A5F',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer',opacity:saving||!form.title?0.6:1 }}>
                {saving ? 'Enregistrement…' : '✓ Enregistrer'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ background:'#F3F4F6',color:'#374151',border:'none',borderRadius:10,padding:'10px 20px',fontSize:14,cursor:'pointer' }}>Annuler</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:'flex',gap:8,marginBottom:18 }}>
          {(['all','pending','approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background:filter===f?'#1E3A5F':'#fff',color:filter===f?'#fff':'#374151',border:'1px solid',borderColor:filter===f?'#1E3A5F':'#E5E7EB',borderRadius:100,padding:'6px 16px',fontSize:13,cursor:'pointer',fontWeight:500 }}>
              {f==='all'?'Toutes':f==='pending'?'En attente':'Approuvées'}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign:'center',padding:'40px 0' }}><p style={{ color:'#9CA3AF' }}>Chargement…</p></div>
        ) : (
          <div style={{ background:'#fff',borderRadius:16,border:'1px solid #E5E7EB',overflow:'hidden' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F8FAFC',borderBottom:'1px solid #E5E7EB' }}>
                  {['Titre','Type','Catégorie','Profil','Statut','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px',textAlign:'left',fontSize:12,fontWeight:600,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding:'32px',textAlign:'center',color:'#9CA3AF',fontSize:14 }}>Aucune ressource</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom:'1px solid #F3F4F6',background:i%2===0?'#fff':'#FAFAFA' }}>
                    <td style={{ padding:'12px 16px' }}>
                      <p style={{ margin:0,fontWeight:600,fontSize:14,color:'#1A1A2E' }}>{r.title}</p>
                      {r.creator?.name && <p style={{ margin:0,fontSize:11,color:'#9CA3AF' }}>par {r.creator.name}</p>}
                    </td>
                    <td style={{ padding:'12px 16px',fontSize:13,color:'#374151' }}>{r.type}</td>
                    <td style={{ padding:'12px 16px',fontSize:13,color:'#374151' }}>{r.category}</td>
                    <td style={{ padding:'12px 16px',fontSize:13,color:'#374151' }}>{r.target_profile}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:12,fontWeight:600,padding:'3px 10px',borderRadius:100,background:r.approved?'#D1FAE5':'#FEF3C7',color:r.approved?'#065F46':'#92400E' }}>
                        {r.approved ? '✅ Approuvé' : '⏳ En attente'}
                      </span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex',gap:6 }}>
                        <button onClick={() => toggleApprove(r.id, r.approved)}
                          style={{ background:r.approved?'#FEF3C7':'#D1FAE5',color:r.approved?'#92400E':'#065F46',border:'none',borderRadius:7,padding:'5px 10px',fontSize:12,cursor:'pointer',fontWeight:600 }}>
                          {r.approved ? 'Désapprouver' : 'Approuver'}
                        </button>
                        <button onClick={() => deleteResource(r.id)}
                          style={{ background:'#FEE2E2',color:'#991B1B',border:'none',borderRadius:7,padding:'5px 10px',fontSize:12,cursor:'pointer',fontWeight:600 }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
