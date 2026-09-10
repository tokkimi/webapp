'use client'
export const dynamic = 'force-dynamic'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const T = '#30B4A7'
const DARK = '#082827'

export default function MessagesPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')

  async function api(path: string, init: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.replace('/auth')
      throw new Error('Session expiree')
    }
    setUserId(session.user.id)
    return fetch(path, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${session.access_token}`,
      },
    })
  }

  async function loadConversations() {
    try {
      const response = await api('/api/messages')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setConversations(result)
      if (!selected && result[0]) await openConversation(result[0])
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function openConversation(conversation: any) {
    setSelected(conversation)
    const response = await api(`/api/messages?conversation=${encodeURIComponent(conversation.id)}`)
    const result = await response.json()
    if (response.ok) setMessages(result)
  }

  async function send(e: FormEvent) {
    e.preventDefault()
    if (!content.trim() || !selected) return
    const response = await api('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: selected.id, content }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error)
      return
    }
    setContent('')
    await openConversation(selected)
    await loadConversations()
  }

  useEffect(() => { loadConversations() }, []) // eslint-disable-line

  return (
    <div style={{ minHeight: '100vh', background: '#f5fafa', color: DARK, fontFamily: 'Inter,sans-serif' }}>
      <nav style={{ height: 60, background: '#fff', borderBottom: '1px solid #daeeed', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/profile" style={{ color: T, textDecoration: 'none', fontWeight: 700 }}>Mon espace</Link>
        <strong>Messages Capsule</strong>
        <Link href="/appointments" style={{ color: DARK, textDecoration: 'none', fontSize: 13 }}>Agenda</Link>
      </nav>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 70px' }}>
        <div style={{ background: '#fff', border: '1px solid #daeeed', borderRadius: 20, minHeight: 620, display: 'grid', gridTemplateColumns: 'minmax(230px, 32%) 1fr', overflow: 'hidden' }}>
          <aside style={{ borderRight: '1px solid #daeeed', padding: 14 }}>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 19, margin: '5px 8px 16px' }}>Conversations</h1>
            {conversations.length === 0 && <p style={{ color: '#64748b', fontSize: 13, padding: 8 }}>Une conversation apparait apres une demande de rendez-vous.</p>}
            {conversations.map(conversation => (
              <button key={conversation.id} onClick={() => openConversation(conversation)}
                style={{ width: '100%', border: 0, borderRadius: 13, padding: 12, marginBottom: 6, background: selected?.id === conversation.id ? '#eaf8f6' : 'transparent', textAlign: 'left', cursor: 'pointer', color: DARK }}>
                <strong style={{ display: 'block' }}>{conversation.contact?.name || 'Utilisateur Capsule'}</strong>
                <span style={{ display: 'block', color: '#64748b', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 4 }}>
                  {conversation.latest?.content || 'Nouvelle conversation'}
                </span>
              </button>
            ))}
          </aside>

          <section style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {selected ? (
              <>
                <header style={{ padding: 18, borderBottom: '1px solid #daeeed' }}>
                  <strong>{selected.contact?.name || 'Utilisateur Capsule'}</strong>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{selected.contact?.specialty || 'Membre Capsule'}</div>
                </header>
                <div style={{ flex: 1, padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.map(message => {
                    const mine = message.sender_id === userId
                    return (
                      <div key={message.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%', background: mine ? T : '#eef3f3', color: mine ? '#fff' : DARK, borderRadius: 16, padding: '10px 13px' }}>
                        <div style={{ lineHeight: 1.5, fontSize: 14 }}>{message.content}</div>
                        <div style={{ opacity: .7, fontSize: 10, marginTop: 4 }}>{new Date(message.created_at).toLocaleString('fr-FR')}</div>
                      </div>
                    )
                  })}
                </div>
                <form onSubmit={send} style={{ borderTop: '1px solid #daeeed', padding: 14, display: 'flex', gap: 9 }}>
                  <input value={content} onChange={e => setContent(e.target.value)} placeholder="Ecrire un message..."
                    style={{ flex: 1, border: '1px solid #cfe8e5', borderRadius: 99, padding: '11px 15px', outline: 'none' }} />
                  <button style={{ border: 0, borderRadius: 99, padding: '11px 18px', background: T, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Envoyer</button>
                </form>
              </>
            ) : (
              <div style={{ margin: 'auto', color: '#64748b', textAlign: 'center', padding: 25 }}>Selectionnez une conversation.</div>
            )}
          </section>
        </div>
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      </main>
      <style>{`@media(max-width:700px){main>div{grid-template-columns:1fr!important} main aside{border-right:0!important;border-bottom:1px solid #daeeed;max-height:220px;overflow:auto}}`}</style>
    </div>
  )
}
