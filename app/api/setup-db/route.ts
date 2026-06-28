import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Tables to create with their SQL
const TABLES = [
  {
    name: 'profiles',
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id uuid PRIMARY KEY,
        name text, email text, profile_type text,
        verified boolean DEFAULT false, avatar_url text, bio text,
        specialty text, adeli_number text, birth_date date,
        location text, phone text, checkin_parental boolean DEFAULT false,
        share_mood boolean DEFAULT false, years_experience int,
        age_range text, consultation_types text[], price_min int, price_max int,
        updated_at timestamptz, created_at timestamptz DEFAULT now()
      );
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN
        CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN
        CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `,
  },
  {
    name: 'journal_entries',
    sql: `
      CREATE TABLE IF NOT EXISTS journal_entries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        content text NOT NULL, mood int, drawing_data text,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "journal_own" ON journal_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `,
  },
  {
    name: 'challenges',
    sql: `
      CREATE TABLE IF NOT EXISTS challenges (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        title text NOT NULL, description text, category text DEFAULT 'bien-être',
        target_date date, completed boolean DEFAULT false, completed_at timestamptz,
        total_streak int DEFAULT 0, check_ins jsonb DEFAULT '[]',
        updated_at timestamptz, created_at timestamptz DEFAULT now()
      );
      ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "challenges_own" ON challenges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `,
  },
  {
    name: 'mood_entries',
    sql: `
      CREATE TABLE IF NOT EXISTS mood_entries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        score int NOT NULL, emoji text, created_at timestamptz DEFAULT now()
      );
      ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "mood_own" ON mood_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `,
  },
  {
    name: 'appointments',
    sql: `
      CREATE TABLE IF NOT EXISTS appointments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id uuid REFERENCES profiles(id),
        pro_id uuid REFERENCES profiles(id),
        scheduled_at timestamptz, duration_minutes int DEFAULT 50,
        type text DEFAULT 'video', status text DEFAULT 'pending', notes text,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "appts_own" ON appointments FOR ALL TO authenticated
          USING (auth.uid() = patient_id OR auth.uid() = pro_id)
          WITH CHECK (auth.uid() = patient_id OR auth.uid() = pro_id);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `,
  },
  {
    name: 'pro_slots',
    sql: `
      CREATE TABLE IF NOT EXISTS pro_slots (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        pro_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        starts_at timestamptz NOT NULL, duration int DEFAULT 50,
        booked boolean DEFAULT false, created_at timestamptz DEFAULT now()
      );
      ALTER TABLE pro_slots ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "slots_select" ON pro_slots FOR SELECT TO authenticated USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN
        CREATE POLICY "slots_manage" ON pro_slots FOR ALL TO authenticated USING (auth.uid() = pro_id);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `,
  },
  {
    name: 'reviews',
    sql: `
      CREATE TABLE IF NOT EXISTS reviews (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        pro_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
        rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment text, created_at timestamptz DEFAULT now()
      );
      ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "reviews_select" ON reviews FOR SELECT TO authenticated USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN
        CREATE POLICY "reviews_insert" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `,
  },
  {
    name: 'newsletter_subscribers',
    sql: `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE, created_at timestamptz DEFAULT now()
      );
      ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        CREATE POLICY "newsletter_insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `,
  },
]

export async function POST() {
  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const results: Record<string, string> = {}

  for (const table of TABLES) {
    try {
      const { error } = await admin.rpc('exec_sql', { sql: table.sql })
      if (error) {
        // Try via pg endpoint as fallback
        results[table.name] = `error: ${error.message}`
      } else {
        results[table.name] = 'ok'
      }
    } catch (e: any) {
      results[table.name] = `exception: ${e.message}`
    }
  }

  return NextResponse.json({ results })
}

export async function GET() {
  // Health check: which tables exist?
  if (!serviceKey) {
    return NextResponse.json({ configured: false })
  }
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const tableNames = TABLES.map(t => t.name)
  const checks: Record<string, boolean> = {}
  for (const name of tableNames) {
    const { error } = await admin.from(name).select('id').limit(1)
    checks[name] = !error || error.code !== '42P01'
  }
  return NextResponse.json({ configured: true, tables: checks })
}
