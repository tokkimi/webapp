'use client'
export const dynamic = 'force-dynamic'
import { useEffect, Suspense } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    async function handle() {
      const code = searchParams.get('code')
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type') as any

      if (code) {
        // PKCE flow
        await supabase.auth.exchangeCodeForSession(code)
      } else if (token_hash && type) {
        // Email OTP / token_hash flow
        await supabase.auth.verifyOtp({ token_hash, type })
      } else {
        // Implicit flow: Supabase auto-parses the hash fragment
        await supabase.auth.getSession()
      }

      // Check if user has ai_config → redirect to chat, else to home
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: config } = await supabase.from('ai_config').select('id').eq('user_id', user.id).single()
        const { data: sub } = await supabase.from('subscriptions').select('id').eq('user_id', user.id).eq('status', 'active').single()
        if (sub && config) {
          router.replace('/chat')
          return
        }
      }
      router.replace('/')
    }
    handle()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #3B82F6, #7C3AED)',
          boxShadow: '0 0 20px rgba(37,99,235,0.5)',
        }} />
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          blue<span style={{
            background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>●</span>circle
        </span>
      </div>
      <div className="spinner" style={{
        width: 28, height: 28, border: '2px solid var(--border2)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
      }} />
      <p style={{ color: 'var(--text2)', fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>
        Validation en cours…
      </p>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
