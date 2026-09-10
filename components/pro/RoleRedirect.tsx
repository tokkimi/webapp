'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
export default function RoleRedirect({ to, children }: { to: string; children: React.ReactNode }) {
  const router = useRouter(), [ready, setReady] = useState(false), [error, setError] = useState('')
  useEffect(() => {
    let active = true
    async function check() {
      try {
        const client = createSupabaseBrowserClient()
        const { data: { user }, error } = await client.auth.getUser()
        if (error) throw error
        if (!user) { router.replace('/auth'); return }
        const { data, error: profileError } = await client.from('profiles').select('profile_type').eq('id', user.id).single()
        if (profileError) throw profileError
        if (!active) return
        if (data.profile_type === 'pro') router.replace(to + window.location.search + window.location.hash)
        else setReady(true)
      } catch { if (active) setError('Impossible de retrouver votre espace. Rechargez la page pour réessayer.') }
    }
    check(); return () => { active = false }
  }, [router, to])
  return ready ? <>{children}</> : <div style={{ padding: 40, background: '#f5fafa', color: '#173e3b' }} role="status">{error || 'Ouverture de votre espace…'}{error && <button onClick={() => window.location.reload()}>Réessayer</button>}</div>
}
