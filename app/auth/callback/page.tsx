'use client'
export const dynamic = 'force-dynamic'
import { useEffect, Suspense } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { isTestAccount } from '@/lib/test-accounts'

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
        await supabase.auth.exchangeCodeForSession(code)
      } else if (token_hash && type) {
        await supabase.auth.verifyOtp({ token_hash, type })
      } else {
        await supabase.auth.getSession()
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/'); return }

      // Check if user already has ai_config → go to chat
      const { data: config } = await supabase.from('ai_config').select('id').eq('user_id', user.id).single()
      if (config) { router.replace('/chat'); return }

      // Check if user has subscription (or is test account) → go to onboarding
      if (isTestAccount(user.email)) { router.replace('/onboarding'); return }

      const { data: sub } = await supabase.from('subscriptions').select('id').eq('user_id', user.id).eq('status', 'active').single()
      if (sub) { router.replace('/onboarding'); return }

      // No subscription → back to home (plans section)
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
        Connexion en cours…
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
