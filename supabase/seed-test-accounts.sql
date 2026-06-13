-- ============================================================
-- Capsule — Comptes de test
-- À exécuter dans Supabase > SQL Editor APRÈS avoir créé les
-- 3 utilisateurs via Authentication > Users > Add user :
--
--   test-ado@capsule.app     / Capsule2026!
--   test-parent@capsule.app  / Capsule2026!
--   test-pro@capsule.app     / Capsule2026!
--
-- Remplacez les UUIDs ci-dessous par ceux générés par Supabase.
-- ============================================================

-- 1. Récupérer les IDs (pratique pour la suite)
-- SELECT id, email FROM auth.users WHERE email LIKE '%capsule.app%';

-- 2. Insérer / mettre à jour les profils
-- Remplacez 'UUID-ADO', 'UUID-PARENT', 'UUID-PRO' par les vrais IDs

INSERT INTO public.profiles (id, name, email, profile_type, verified)
VALUES
  ('UUID-ADO',    'Alex (test ado)',          'test-ado@capsule.app',    'ado',    false),
  ('UUID-PARENT', 'Marie (test parent)',       'test-parent@capsule.app', 'parent', false),
  ('UUID-PRO',    'Dr. Thomas (test pro)',     'test-pro@capsule.app',    'pro',    true)
ON CONFLICT (id) DO UPDATE
  SET name         = EXCLUDED.name,
      profile_type = EXCLUDED.profile_type,
      verified     = EXCLUDED.verified;

-- 3. Compte admin (mettez votre propre UUID)
-- UPDATE public.profiles SET profile_type = 'admin' WHERE email = 'votre@email.fr';

-- 4. Vérification
SELECT id, name, email, profile_type, verified FROM public.profiles
WHERE email LIKE '%capsule.app%';
