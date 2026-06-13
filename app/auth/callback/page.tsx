'use client'
export const dynamic = 'force-dynamic'
import { useEffect, Suspense } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

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

      const { data: profile } = await supabase.from('profiles').select('profile_type').eq('id', user.id).single()

      if (!profile) { router.replace('/onboarding'); return }

      if (profile.profile_type === 'admin' || profile.profile_type === 'superadmin') {
        router.replace('/admin')
      } else if (profile.profile_type === 'pro') {
        router.replace('/dashboard/pro')
      } else if (profile.profile_type === 'parent') {
        router.replace('/dashboard/parent')
      } else {
        router.replace('/dashboard/ado')
      }
    }
    handle()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#080f0e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <Image src="/logo.svg" alt="Capsule" width={48} height={48} />
      <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 18, color: '#30B4A7', letterSpacing: 3 }}>CAPSULE</span>
      <div style={{ width: 24, height: 24, border: '2px solid rgba(48,180,167,.2)', borderTopColor: '#30B4A7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Connexion en cours…</p>
    </div>
  )
}

export default function AuthCallback() {
  return <Suspense><CallbackHandler /></Suspense>
}
