'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { isTestAccount, TEST_SUBSCRIPTION } from '@/lib/test-accounts'

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
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [input])

  async function init() {
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

    const { data: config } = await supabase.from('ai_config').select('*').eq('user_id', user.id).single()
    if (!config) { router.push('/onboarding'); return }
    setAiConfig(config)

    let conv = null
    if (sub.plan_id !== 'premium' && sub.plan_id !== 'elite') {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single()
      conv = existingConv
    }

    if (!conv) {
      const { data: newConv } = await supabase.from('conversations').insert({
        user_id: user.id,
        ai_config_id: config.id,
        started_at: new Date().toISOString(),
      }).select().single()
      conv = newConv
    }

    if (conv) {
      setConversationId(conv.id)
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true })
      setMessages(msgs || [])
    }

    if (sub.plan_id === 'essentiel' || sub.plan_id === 'premium') {
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await supabase
        .from('daily_usage')
        .select('seconds_used')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()
      setSecondsUsed(usage?.seconds_used || 0)
      timerRef.current = setInterval(() => setSecondsUsed(s => s + 1), 1000)
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
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          aiConfig, lang,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        console.error('Chat API error:', data.error)
        throw new Error(data.error || 'API error')
      }
      const { reply, generatePhoto } = data

      const aiMsg: Message = { role: 'assistant', content: reply, type: 'text' }
      setMessages(prev => [...prev, aiMsg])
      await supabase.from('messages').insert({ conversation_id: conversationId, role: 'assistant', content: reply, type: 'text' })

      if (generatePhoto && (subscription?.plan_id === 'premium' || subscription?.plan_id === 'elite')) {
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
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'fr' ? 'Désolée, une erreur est survenue...' : 'Sorry, an error occurred...',
        type: 'text',
      }])
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
      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45,
      boxShadow: '0 0 12px rgba(37,99,235,0.3)',
    }}>
      {aiConfig?.gender === 'woman' ? '🌙' : '🌊'}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        background: 'rgba(7,10,23,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <AiAvatar size={42} />
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 10, height: 10, borderRadius: '50%',
              background: '#22C55E', border: '2px solid var(--bg)',
            }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{aiName}</div>
            <div style={{ fontSize: 12, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="dot-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              {fr ? 'En ligne' : 'Online'}
            </div>
          </div>
        </div>

        {hasTimer && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{
              fontFamily: 'DM Mono, monospace', fontSize: 13,
              color: timeLeft < 300 ? 'var(--accent3)' : 'var(--text2)',
            }}>
              {timerStr}
            </div>
            <div style={{ width: 80, height: 3, background: 'var(--border2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${timerPct}%`,
                background: timeLeft < 300 ? 'var(--accent3)' : 'var(--accent)',
                transition: 'width 1s linear',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-scroll" style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '24px 16px 16px 16px',
        display: 'flex', flexDirection: 'column', gap: 20,
        boxSizing: 'border-box', width: '100%',
      }}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <AiAvatar size={56} />
            <p style={{ color: 'var(--text3)', fontSize: 14, marginTop: 16 }}>
              {fr ? `Dites bonjour à ${aiName} pour commencer...` : `Say hello to ${aiName} to get started...`}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="fade-in" style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end', gap: 8,
          }}>
            {msg.role === 'assistant' && <AiAvatar size={28} />}

            <div style={{ maxWidth: '75%', minWidth: 0 }}>
              {msg.type === 'image' ? (
                msg.image_url ? (
                  <img src={msg.image_url} alt="" style={{
                    width: 280, height: 280, objectFit: 'cover',
                    borderRadius: 16, display: 'block',
                    border: '1px solid var(--border2)',
                  }} />
                ) : (
                  <div style={{
                    width: 280, height: 280, borderRadius: 16,
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 10,
                  }}>
                    <div className="spinner" style={{ width: 28, height: 28, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{fr ? 'Génération...' : 'Generating...'}</span>
                  </div>
                )
              ) : (
                <div style={{
                  padding: '11px 15px', lineHeight: 1.55, fontSize: 14,
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--accent) 0%, #1D4ED8 100%)'
                    : 'var(--surface2)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  color: '#fff',
                  boxShadow: msg.role === 'user' ? '0 4px 16px rgba(37,99,235,0.25)' : 'none',
                }}>
                  {msg.content}
                </div>
              )}
              {msg.created_at && (
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 5, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <AiAvatar size={28} />
            <div style={{
              padding: '13px 16px',
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '18px 18px 18px 4px',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} className="typing-dot" style={{
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--text3)', display: 'block',
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        background: 'rgba(7,10,23,0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        padding: '12px 16px',
        paddingBottom: 'calc(60px + 12px + env(safe-area-inset-bottom))',
        display: 'flex', gap: 10, alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || (hasTimer && timeLeft === 0)}
          placeholder={
            hasTimer && timeLeft === 0
              ? (fr ? 'Temps écoulé pour aujourd\'hui' : 'Time limit reached')
              : (fr ? 'Écrire un message...' : 'Write a message...')
          }
          rows={1}
          style={{
            flex: 1, background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: 14, padding: '11px 14px',
            color: 'var(--text)', fontSize: 14,
            fontFamily: 'DM Sans, sans-serif', resize: 'none',
            minHeight: 44, maxHeight: 120, outline: 'none',
            lineHeight: 1.5,
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = 'none' }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim() || (hasTimer && timeLeft === 0)}
          style={{
            width: 44, height: 44, flexShrink: 0,
            background: loading || !input.trim() ? 'var(--surface2)' : 'var(--accent)',
            border: '1px solid ' + (loading || !input.trim() ? 'var(--border)' : 'transparent'),
            borderRadius: 12, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: !loading && input.trim() ? '0 0 16px rgba(37,99,235,0.35)' : 'none',
          }}>
          {loading
            ? <span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
          }
        </button>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}
