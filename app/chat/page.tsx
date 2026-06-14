'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import BottomNav from '@/components/BottomNav'
import { isTestAccount, TEST_SUBSCRIPTION } from '@/lib/test-accounts'

const T = '#30B4A7'
const DARK = '#082827'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'image'
  image_url?: string
  created_at?: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [aiConfig, setAiConfig] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [secondsUsed, setSecondsUsed] = useState(0)
  const [lang, setLang] = useState('fr')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'fr')
    init()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
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

  async function init() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)

      let sub: any = null
      if (isTestAccount(user.email)) {
        sub = TEST_SUBSCRIPTION
      } else {
        const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single()
        sub = data
      }
      if (!sub) { router.push('/'); return }
      setSubscription(sub)

      const { data: cfgRows } = await supabase.from('ai_config').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1)
      const config = cfgRows?.[0] ?? null
      if (!config) { router.push('/onboarding'); return }
      setAiConfig(config)

      let conv = null
      if (sub.plan_id !== 'premium' && sub.plan_id !== 'elite') {
        const { data: existingConv } = await supabase.from('conversations').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(1).maybeSingle()
        conv = existingConv
      }

      if (!conv) {
        const { data: newConv } = await supabase.from('conversations').insert({ user_id: user.id, ai_config_id: config.id, started_at: new Date().toISOString() }).select().single()
        conv = newConv
      }

      if (conv) {
        setConversationId(conv.id)
        const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true })
        setMessages(msgs || [])
      }

      if (sub.plan_id === 'essentiel' || sub.plan_id === 'premium') {
        const today = new Date().toISOString().split('T')[0]
        const { data: usage } = await supabase.from('daily_usage').select('seconds_used').eq('user_id', user.id).eq('date', today).single()
        setSecondsUsed(usage?.seconds_used || 0)
        timerRef.current = setInterval(() => setSecondsUsed(s => s + 1), 1000)
      }
    } catch (e: any) {
      console.error('chat init error:', e)
    }
  }

  async function saveUsage() {
    if (!user || !subscription) return
    if (subscription.plan_id !== 'essentiel' && subscription.plan_id !== 'premium') return
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('daily_usage').upsert({ user_id: user.id, date: today, seconds_used: secondsUsed })
  }

  async function sendMessage() {
    if (!input.trim() || loading || !conversationId) return
    if ((subscription?.plan_id === 'essentiel' || subscription?.plan_id === 'premium') && secondsUsed >= 3600) return

    const userMsg: Message = { role: 'user', content: input.trim(), type: 'text' }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    await supabase.from('messages').insert({ conversation_id: conversationId, role: 'user', content: userMsg.content, type: 'text' })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })), aiConfig, lang }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'API error')
      const { reply, generatePhoto } = data

      const aiMsg: Message = { role: 'assistant', content: reply, type: 'text' }
      setMessages(prev => [...prev, aiMsg])
      await supabase.from('messages').insert({ conversation_id: conversationId, role: 'assistant', content: reply, type: 'text' })

      if (generatePhoto && subscription?.plan_id && subscription.plan_id !== 'essentiel') {
        const placeholder: Message = { role: 'assistant', content: '', type: 'image' }
        setMessages(prev => [...prev, placeholder])
        const photoRes = await fetch('/api/generate-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aiConfig: { ...aiConfig, personality: aiConfig.personality } }),
        })
        const { url } = await photoRes.json()
        if (url) {
          setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, image_url: url } : m))
          await supabase.from('messages').insert({ conversation_id: conversationId, role: 'assistant', content: '', type: 'image', image_url: url })
        } else {
          setMessages(prev => prev.slice(0, -1))
        }
      }
    } catch (e: any) {
      const fr = lang === 'fr'
      const msg = e?.message || ''
      const friendly = fr ? `Erreur: ${msg || 'inconnue'}` : `Error: ${msg || 'unknown'}`
      setMessages(prev => [...prev, { role: 'assistant', content: friendly, type: 'text' }])
    }

    setLoading(false)
    await saveUsage()
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const aiName = aiConfig?.gender === 'woman' ? 'Luna' : 'Axel'
  const fr = lang === 'fr'
  const timeLimit = 3600
  const timeLeft = Math.max(0, timeLimit - secondsUsed)
  const hasTimer = subscription?.plan_id === 'essentiel' || subscription?.plan_id === 'premium'
  const timerStr = `${Math.floor(timeLeft / 3600)}:${String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`
  const timerPct = (timeLeft / timeLimit) * 100

  const AiAvatar = ({ size = 36 }: { size?: number }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: T,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 12px ${T}50`,
    }}>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {aiConfig?.gender === 'woman'
          ? <><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></>
          : <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>
        }
      </svg>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes dotPulse { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        .fade-in { animation: fadeIn 0.3s ease; }
        .typing-dot { animation: dotPulse 1.2s infinite ease-in-out both; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: ${T}40; border-radius: 99px; }
        * { box-sizing: border-box; }
        @media(max-width:640px){
          .chat-input-wrap { padding-bottom: calc(70px + 12px + env(safe-area-inset-bottom)) !important; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5fafa', fontFamily: 'Inter,Outfit,sans-serif' }}>

        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #daeeed', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginRight: 4 }}>
              <Image src="/logo.png" width={30} height={30} alt="Capsule" style={{ borderRadius: 6 }} />
            </Link>
            <div style={{ position: 'relative' }}>
              <AiAvatar size={38} />
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: DARK, fontFamily: 'Outfit,sans-serif' }}>{aiName}</div>
              <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                {fr ? 'En ligne' : 'Online'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {hasTimer && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: timeLeft < 300 ? '#ef4444' : '#6B7280' }}>{timerStr}</div>
                <div style={{ width: 72, height: 3, background: '#daeeed', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${timerPct}%`, background: timeLeft < 300 ? '#ef4444' : T, transition: 'width 1s linear' }} />
                </div>
              </div>
            )}
            <button onClick={() => router.push('/profile')} style={{ background: '#f9fffe', border: '1px solid #daeeed', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'all 0.2s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 16px 12px', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', width: '100%' }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', marginTop: 60, animation: 'fadeIn 0.4s ease' }}>
              <AiAvatar size={54} />
              <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 14 }}>
                {fr ? `Dis bonjour à ${aiName} pour commencer…` : `Say hello to ${aiName} to get started…`}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="fade-in" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
              {msg.role === 'assistant' && <AiAvatar size={26} />}

              <div style={{ maxWidth: '75%', minWidth: 0 }}>
                {msg.type === 'image' ? (
                  msg.image_url ? (
                    <img src={msg.image_url} alt="" style={{ width: 260, height: 260, objectFit: 'cover', borderRadius: 16, display: 'block', border: '1px solid #daeeed' }} />
                  ) : (
                    <div style={{ width: 260, height: 260, borderRadius: 16, background: '#f9fffe', border: '1px solid #daeeed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                      <div style={{ width: 28, height: 28, border: `2px solid #daeeed`, borderTopColor: T, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>{fr ? 'Génération…' : 'Generating…'}</span>
                    </div>
                  )
                ) : (
                  <div style={{
                    padding: '11px 15px', lineHeight: 1.55, fontSize: 14,
                    background: msg.role === 'user' ? T : '#fff',
                    border: msg.role === 'assistant' ? '1px solid #daeeed' : 'none',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    color: msg.role === 'user' ? '#fff' : DARK,
                    boxShadow: msg.role === 'user' ? `0 4px 12px ${T}30` : '0 2px 6px rgba(0,0,0,0.04)',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                )}
                {msg.created_at && (
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <AiAvatar size={26} />
              <div style={{ padding: '13px 16px', background: '#fff', border: '1px solid #daeeed', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 5, alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: T, display: 'block' }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-wrap" style={{ background: '#fff', borderTop: '1px solid #daeeed', padding: '10px 14px', paddingBottom: 'calc(64px + 10px + env(safe-area-inset-bottom))', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || (hasTimer && timeLeft === 0)}
            placeholder={
              hasTimer && timeLeft === 0
                ? (fr ? "Temps écoulé pour aujourd'hui" : 'Time limit reached')
                : (fr ? 'Écrire un message…' : 'Write a message…')
            }
            rows={1}
            style={{ flex: 1, background: '#f9fffe', border: '1.5px solid #daeeed', borderRadius: 14, padding: '11px 14px', color: DARK, fontSize: 14, fontFamily: 'Inter,sans-serif', resize: 'none', minHeight: 44, maxHeight: 120, outline: 'none', lineHeight: 1.5, transition: 'border-color 0.2s, box-shadow 0.2s' }}
            onFocus={e => { e.currentTarget.style.borderColor = T; e.currentTarget.style.boxShadow = `0 0 0 3px ${T}20` }}
            onBlur={e => { e.currentTarget.style.borderColor = '#daeeed'; e.currentTarget.style.boxShadow = 'none' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || (hasTimer && timeLeft === 0)}
            style={{ width: 44, height: 44, flexShrink: 0, background: loading || !input.trim() ? '#f0f4f8' : T, border: `1px solid ${loading || !input.trim() ? '#daeeed' : 'transparent'}`, borderRadius: 12, color: '#fff', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: !loading && input.trim() ? `0 0 14px ${T}40` : 'none' }}>
            {loading
              ? <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#fff' : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            }
          </button>
        </div>

        <BottomNav lang={lang} />
      </div>
    </>
  )
}
