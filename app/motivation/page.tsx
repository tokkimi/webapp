'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function MotivationPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/auth'); return }
      router.replace('/dashboard/ado')
    })
  }, []) // eslint-disable-line

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>Redirection…</p>
    </div>
  )
}
