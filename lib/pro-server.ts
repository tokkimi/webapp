import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from './server-supabase'

export async function requirePro(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return { error: NextResponse.json({ error: 'Connectez-vous pour accéder à votre cabinet.' }, { status: 401 }) } as const
  const { data: profile, error } = await supabase.from('profiles').select('id,name,email,profile_type,specialty,verified').eq('id', user.id).single()
  if (error) return { error: NextResponse.json({ error: 'Impossible de vérifier votre profil. Réessayez.' }, { status: 503 }) } as const
  if (profile?.profile_type !== 'pro') return { error: NextResponse.json({ error: 'Cet espace est réservé aux professionnels.' }, { status: 403 }) } as const
  return { user, supabase, profile } as const
}
export function databaseError(error: { code?: string }) {
  const notReady = ['42P01', 'PGRST205', '42703', 'PGRST204'].includes(error.code || '')
  return NextResponse.json({ error: notReady ? 'L’espace comptable est en cours de configuration. Aucune opération n’a été enregistrée. Contactez Capsule.' : 'Impossible d’enregistrer ou de charger les données. Réessayez.' }, { status: 503 })
}
