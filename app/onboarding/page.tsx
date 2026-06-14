'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const DASHBOARDS: Record<string, string> = {
  ado: '/dashboard/ado',
  parent: '/dashboard/parent',
  pro: '/dashboard/pro',
  admin: '/admin',
  superadmin: '/admin',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Préparation de ton espace...')

  useEffect(() => {
    let active = true

    async function redirectToWorkspace() {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!active) return
      if (!user) {
        router.replace('/auth')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('profile_type')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return
      if (error || !profile?.profile_type) {
        setMessage('Ton profil est presque prêt. Redirection vers tes informations...')
        router.replace('/profile')
        return
      }

      router.replace(DASHBOARDS[profile.profile_type] ?? '/profile')
    }

    redirectToWorkspace()
    return () => {
      active = false
    }
  }, [router])

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: '#f7fcfb',
      color: '#173f3c',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div>
        <Image src="/logo.png" alt="Capsule" width={72} height={72} priority />
        <h1 style={{ margin: '20px 0 8px', fontSize: 28 }}>Bienvenue sur Capsule</h1>
        <p style={{ margin: 0, color: '#5f7f7c' }}>{message}</p>
      </div>
    </main>
  )
}
