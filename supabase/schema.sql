-- ============================================================
-- Capsule Ado — Complete PostgreSQL Schema
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text,
  email         text,
  profile_type  text CHECK (profile_type IN ('ado', 'parent', 'pro')) NOT NULL DEFAULT 'ado',
  birth_date    date,
  avatar_url    text,
  bio           text,
  specialty     text,
  location      text,
  phone         text,
  verified      boolean NOT NULL DEFAULT false,
  adeli_rpps    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Pros can view patient profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.pro_id = auth.uid()
        AND a.patient_id = profiles.id
    )
  );

-- ============================================================
-- FAMILY LINKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.family_links (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ado_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
  share_mood  boolean NOT NULL DEFAULT false,
  invite_code text UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, ado_id)
);

ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents and ados can view their own family links"
  ON public.family_links FOR SELECT
  USING (auth.uid() = parent_id OR auth.uid() = ado_id);

CREATE POLICY "Parents can insert family links"
  ON public.family_links FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents and ados can update family links"
  ON public.family_links FOR UPDATE
  USING (auth.uid() = parent_id OR auth.uid() = ado_id);

CREATE POLICY "Parents can delete their family links"
  ON public.family_links FOR DELETE
  USING (auth.uid() = parent_id);

-- ============================================================
-- MOOD ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score      int NOT NULL CHECK (score BETWEEN 1 AND 10),
  note       text,
  emoji      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mood entries"
  ON public.mood_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can read linked ados mood"
  ON public.mood_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links fl
      WHERE fl.parent_id = auth.uid()
        AND fl.ado_id = mood_entries.user_id
        AND fl.status = 'active'
        AND fl.share_mood = true
    )
  );

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content      text NOT NULL,
  ai_response  text,
  mood_score   int CHECK (mood_score BETWEEN 1 AND 10),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own journal entries"
  ON public.journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DAILY MOTIVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_motivations (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  generated_date date UNIQUE NOT NULL,
  content        text NOT NULL,
  author_style   text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_motivations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read motivations"
  ON public.daily_motivations FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- USER MOTIVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_motivations (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  motivation_id uuid NOT NULL REFERENCES public.daily_motivations(id) ON DELETE CASCADE,
  liked         boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, motivation_id)
);

ALTER TABLE public.user_motivations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own motivation reactions"
  ON public.user_motivations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant')),
  content         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages in their conversations"
  ON public.messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- CHALLENGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  target_date date,
  completed   boolean NOT NULL DEFAULT false,
  streak      int NOT NULL DEFAULT 0,
  category    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own challenges"
  ON public.challenges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pro_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at     timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 50,
  type             text NOT NULL CHECK (type IN ('video', 'phone', 'in_person')),
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes_for_pro    text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Pros can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = pro_id);

CREATE POLICY "Patients can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Pros can update appointment status"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = pro_id);

-- ============================================================
-- SESSION NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.session_notes (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  pro_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content        text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pros can manage their own session notes"
  ON public.session_notes FOR ALL
  USING (auth.uid() = pro_id)
  WITH CHECK (auth.uid() = pro_id);

-- ============================================================
-- RESOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.resources (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          text NOT NULL,
  description    text,
  url            text,
  type           text NOT NULL CHECK (type IN ('article', 'video', 'tool', 'hotline')),
  target_profile text NOT NULL DEFAULT 'all' CHECK (target_profile IN ('ado', 'parent', 'pro', 'all')),
  created_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags           text[],
  approved       boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read approved resources"
  ON public.resources FOR SELECT
  TO authenticated
  USING (approved = true);

CREATE POLICY "Pros can create resources"
  ON public.resources FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.profile_type = 'pro'
    )
  );

CREATE POLICY "Creators can update their resources"
  ON public.resources FOR UPDATE
  USING (auth.uid() = created_by);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      text NOT NULL,
  body       text,
  type       text,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan_id                text,
  status                 text,
  current_period_end     timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PRO AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pro_availability (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week  int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   time NOT NULL,
  end_time     time NOT NULL,
  UNIQUE (pro_id, day_of_week, start_time)
);

ALTER TABLE public.pro_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pros can manage their own availability"
  ON public.pro_availability FOR ALL
  USING (auth.uid() = pro_id)
  WITH CHECK (auth.uid() = pro_id);

CREATE POLICY "Authenticated users can read pro availability"
  ON public.pro_availability FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON public.mood_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pro_id ON public.appointments(pro_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_family_links_parent_id ON public.family_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_links_ado_id ON public.family_links(ado_id);
CREATE INDEX IF NOT EXISTS idx_family_links_invite_code ON public.family_links(invite_code);
CREATE INDEX IF NOT EXISTS idx_daily_motivations_date ON public.daily_motivations(generated_date DESC);
CREATE INDEX IF NOT EXISTS idx_pro_availability_pro_id ON public.pro_availability(pro_id);

-- ============================================================
-- TRIGGER: Auto-create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, profile_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'ado')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update conversations.updated_at on new message
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- ============================================================
-- TRIGGER: Auto-update updated_at on session_notes update
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_session_notes_updated_at ON public.session_notes;
CREATE TRIGGER set_session_notes_updated_at
  BEFORE UPDATE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          text UNIQUE NOT NULL,
  name           text,
  profile_type   text CHECK (profile_type IN ('ado', 'parent', 'pro')),
  consent_at     timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can manage newsletter"
  ON public.newsletter_subscribers FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- RESOURCES — add category column to existing table
-- ============================================================
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS category text;

-- ============================================================
-- DONATIONS LOG (for tracking / analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.donations (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_session_id text,
  amount_cents     int NOT NULL,
  currency         text NOT NULL DEFAULT 'eur',
  donor_name       text,
  donor_email      text,
  message          text,
  anonymous        boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage donations"
  ON public.donations FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- CHALLENGE CHECK-INS (daily completion tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenge_checkins (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_date date NOT NULL DEFAULT current_date,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, checked_date)
);

ALTER TABLE public.challenge_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own checkins"
  ON public.challenge_checkins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_checkins_challenge_id ON public.challenge_checkins(challenge_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON public.challenge_checkins(user_id, checked_date);

-- ============================================================
-- INDEXES (additional)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_approved ON public.resources(approved);
CREATE INDEX IF NOT EXISTS idx_resources_target ON public.resources(target_profile);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
