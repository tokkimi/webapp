'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'
const DARK = '#082827'

interface Message {
  role: 'user' | 'assistant'
  content: string
  ts: number
}

const WELCOME: Message = {
  role: 'assistant',
  content: 'Bonjour ! Je suis l\'assistant Capsule. Je suis là pour t\'écouter et t\'aider à traverser les moments difficiles. Comment tu vas aujourd\'hui ?',
  ts: Date.now(),
}

const CRISIS_KEYWORDS = ['suicide', 'mourir', 'me tuer', 'me suicider', 'en finir', 'plus envie de vivre']

function isCrisis(text: string) {
  return CRISIS_KEYWORDS.some(k => text.toLowerCase().includes(k))
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      supabase.from('profiles').select('name, profile_type').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
  }, []) // eslint-disable-line

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [input])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: text, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])

    if (isCrisis(text)) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Je t\'entends, et ce que tu ressens est important. Si tu es en danger immédiat, appelle le **3114** maintenant — c\'est le numéro national de prévention du suicide, disponible 24h/24, gratuit et confidentiel. Je suis là aussi si tu veux continuer à en parler.',
        ts: Date.now(),
      }])
      return
    }

    setLoading(true)
    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.content || 'Je suis là pour toi.', ts: Date.now() }])
      } else {
        throw new Error()
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Je rencontre un problème technique momentané. En attendant, n\'hésite pas à appeler le 3114 si tu as besoin d\'une écoute immédiate.',
        ts: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fcfb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800;900&family=Audiowide&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        textarea{font-family:inherit;resize:none}
      `}</style>

      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e4f0ef', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
        <Link href="/dashboard/ado" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#555', fontSize: 13 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Retour
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Assistant Capsule</div>
            <div style={{ fontSize: 11, color: T }}>En ligne · Soutien bien-être</div>
          </div>
        </div>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Capsule" width={32} height={32} style={{ objectFit: 'contain' }} />
        </Link>
      </nav>

      {/* Crisis banner */}
      <div style={{ background: '#fff3cd', borderBottom: '1px solid #ffc107', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#856404" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style={{ fontSize: 12, color: '#856404' }}>En cas d&apos;urgence, appelle le <strong>3114</strong> (24h/24) ou le <strong>15</strong> (SAMU)</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Image src="/logo.png" alt="Capsule" width={20} height={20} style={{ objectFit: 'contain' }} />
              </div>
            )}
            <div style={{ maxWidth: '78%' }}>
              <div style={{
                padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? T : 'white',
                color: msg.role === 'user' ? 'white' : '#111',
                fontSize: 14, lineHeight: 1.6,
                border: msg.role === 'assistant' ? '1px solid #daeeed' : 'none',
                boxShadow: '0 1px 4px rgba(0,0,0,.06)',
              }}>
                {msg.content.split('**').map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
              </div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {formatTime(msg.ts)}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Image src="/logo.png" alt="Capsule" width={20} height={20} style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '14px 18px', borderRadius: '18px 18px 18px 4px', background: 'white', border: '1px solid #daeeed', display: 'flex', gap: 5 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: T, animation: `bounce 1.2s ${i * 0.2}s infinite` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef}/>
        <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}`}</style>
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {["Je me sens anxieux(se)", "J'ai du mal à dormir", "Je me sens seul(e)", "Je suis stressé(e) par l'école"].map(s => (
            <button key={s} onClick={() => { setInput(s) }} style={{
              padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${T}`,
              background: 'white', color: T, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ background: 'white', borderTop: '1px solid #e4f0ef', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Écris ce que tu ressens..."
          rows={1}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 20,
            border: '1.5px solid #daeeed', outline: 'none',
            fontSize: 14, lineHeight: 1.5, background: '#f8fcfb',
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          width: 42, height: 42, borderRadius: '50%', border: 'none',
          background: input.trim() ? T : '#daeeed', color: 'white', cursor: input.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .2s',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/></svg>
        </button>
      </div>
    </div>
  )
}
