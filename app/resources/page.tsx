'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function ResourcesRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/mediatheque')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_type')
        .eq('id', user.id)
        .single()

      if (['admin', 'superadmin'].includes(profile?.profile_type)) {
        router.replace('/admin/mediatheque')
      } else if (profile?.profile_type === 'pro') {
        router.replace('/pro/resources')
      } else {
        router.replace('/mediatheque')
      }
    })
  }, [router])

  return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Chargement des ressources...</div>
}
