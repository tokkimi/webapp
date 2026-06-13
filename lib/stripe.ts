import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2026-05-27.dahlia' as any,
    })
  }
  return _stripe
}

// ── Abonnements Ado / Parent ──────────────────────────────────
export const FAMILY_PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    priceId: null as string | null,
    popular: false,
    badge: null as string | null,
    description: 'Pour découvrir la plateforme',
    target: 'ado_parent',
    features: [
      'Journal privé (20 entrées/mois)',
      'Motivation quotidienne IA',
      'Suivi humeur (7 jours)',
      'Médiathèque (ressources de base)',
      '5 messages Chat IA / mois',
    ],
  },
  famille: {
    id: 'famille',
    name: 'Famille',
    price: 9.90,
    priceId: (process.env.STRIPE_PRICE_FAMILLE || '') as string,
    popular: true,
    badge: '⭐ Le plus choisi',
    description: 'Pour ados et parents ensemble',
    target: 'ado_parent',
    features: [
      'Journal illimité',
      'Motivation IA personnalisée',
      'Suivi humeur complet (historique illimité)',
      'Chat IA bienveillant illimité',
      'Défis & objectifs illimités',
      'Lien famille sécurisé (partage humeur)',
      'Médiathèque complète',
      'Vue bien-être enfant (parents)',
      'Prise de RDV avec professionnels',
    ],
  },
}

// ── Abonnements Professionnels ─────────────────────────────────
export const PRO_PLANS = {
  pro_decouverte: {
    id: 'pro_decouverte',
    name: 'Découverte',
    price: 0,
    priceId: null as string | null,
    popular: false,
    badge: '3 mois offerts',
    description: 'Pour tester la plateforme',
    target: 'pro',
    features: [
      'Profil professionnel public',
      "Jusqu'à 5 patients",
      'Agenda basique',
      'Notes de session (10 max)',
      'Médiathèque pro',
    ],
  },
  pro_essentiel: {
    id: 'pro_essentiel',
    name: 'Essentiel',
    price: 29,
    priceId: (process.env.STRIPE_PRICE_PRO_ESSENTIEL || '') as string,
    popular: true,
    badge: '⭐ Recommandé',
    description: 'Pour les praticiens actifs',
    target: 'pro',
    features: [
      'Patients illimités',
      'Agenda complet (semaine / mois)',
      'Notes de session illimitées',
      'Messagerie patients',
      'Badge profil vérifié',
      'Visibilité dans la recherche parents',
      'Analytics de base',
      'Rappels automatiques RDV',
    ],
  },
  pro_premium: {
    id: 'pro_premium',
    name: 'Premium',
    price: 59,
    priceId: (process.env.STRIPE_PRICE_PRO_PREMIUM || '') as string,
    popular: false,
    badge: null as string | null,
    description: 'Pour les cabinets et équipes',
    target: 'pro',
    features: [
      'Tout du plan Essentiel',
      "Multi-praticiens (jusqu'à 5)",
      'Analytics avancées & rapports PDF',
      'Export dossiers patients',
      'Intégration agenda externe',
      'Support prioritaire',
      'Formation & onboarding dédié',
    ],
  },
}

// Legacy alias used in existing checkout route
export const PLANS = FAMILY_PLANS

export type FamilyPlanId = keyof typeof FAMILY_PLANS
export type ProPlanId = keyof typeof PRO_PLANS

export function getPlanById(id: string) {
  return (FAMILY_PLANS as any)[id] || (PRO_PLANS as any)[id] || null
}
