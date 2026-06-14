'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function DashboardRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirectToDashboard() {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_type')
        .eq('id', user.id)
        .single()

      const profileType = profile?.profile_type
      if (profileType === 'admin' || profileType === 'superadmin') {
        router.replace('/admin')
        return
      }
      const role = profileType && ['ado', 'parent', 'pro'].includes(profileType)
        ? profileType
        : 'ado'
      router.replace(`/dashboard/${role}`)
    }

    redirectToDashboard()
  }, [router])

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a0a', color: '#7fd9d0', fontFamily: 'Inter,sans-serif' }}>
      Ouverture de votre espace...
    </main>
  )
}
