-- ============================================================
-- Capsule — Comptes de test (UUIDs réels)
-- Coller et exécuter dans Supabase > SQL Editor
-- ============================================================

INSERT INTO public.profiles (id, name, email, profile_type, verified)
VALUES
  (
    'c9338525-0bed-40c0-94f6-605861b4a9ab',
    'Alex (test ado)',
    'test-ado@capsule.app',
    'ado',
    false
  ),
  (
    '576b9a9e-5e42-40c8-afb0-8dade4118995',
    'Marie (test parent)',
    'test-parent@capsule.app',
    'parent',
    false
  ),
  (
    '8209e06b-302d-4188-a7c5-c1c36bfc5592',
    'Dr. Thomas (test pro)',
    'test-pro@capsule.app',
    'pro',
    true
  )
ON CONFLICT (id) DO UPDATE
  SET name         = EXCLUDED.name,
      profile_type = EXCLUDED.profile_type,
      verified     = EXCLUDED.verified;

-- Vérification
SELECT id, name, email, profile_type, verified
FROM public.profiles
WHERE email LIKE '%capsule.app%';
