-- Capsule – full database schema
-- Run this in your Supabase SQL editor (or via supabase db push)

-- ─── PROFILES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY,
  name          text,
  email         text,
  profile_type  text,
  verified      boolean DEFAULT false,
  avatar_url    text,
  bio           text,
  specialty     text,
  adeli_number  text,
  birth_date    date,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can view profiles (pros must be discoverable)
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ─── JOURNAL ENTRIES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content      text NOT NULL,
  mood         int,
  drawing_data text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_select_own"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "journal_insert_own"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_update_own"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_delete_own"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── CHALLENGES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  category      text DEFAULT 'bien-être',
  target_date   date,
  completed     boolean DEFAULT false,
  completed_at  timestamptz,
  total_streak  int DEFAULT 0,
  check_ins     jsonb DEFAULT '[]',
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select_own"
  ON challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "challenges_insert_own"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "challenges_update_own"
  ON challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "challenges_delete_own"
  ON challenges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── MOOD ENTRIES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mood_entries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score      int NOT NULL,
  emoji      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mood_select_own"
  ON mood_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "mood_insert_own"
  ON mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mood_update_own"
  ON mood_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mood_delete_own"
  ON mood_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── APPOINTMENTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       uuid REFERENCES profiles(id),
  pro_id           uuid REFERENCES profiles(id),
  scheduled_at     timestamptz,
  duration_minutes int DEFAULT 50,
  type             text DEFAULT 'video',
  status           text DEFAULT 'pending',
  notes            text,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Both the patient and the pro can view their appointments
CREATE POLICY "appointments_select_own"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = pro_id);

CREATE POLICY "appointments_insert_own"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = pro_id);

CREATE POLICY "appointments_update_own"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = pro_id)
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = pro_id);

CREATE POLICY "appointments_delete_own"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = patient_id OR auth.uid() = pro_id);

-- ─── RESOURCES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text,
  description    text,
  url            text,
  type           text,
  category       text,
  tags           text[],
  target_profile text,
  approved       boolean DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Approved resources are readable by all authenticated users
CREATE POLICY "resources_select_approved"
  ON resources FOR SELECT
  TO authenticated
  USING (approved = true);

-- ─── NEWSLETTER SUBSCRIBERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can subscribe
CREATE POLICY "newsletter_insert_anon"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);
