export type ProfileType = 'ado' | 'parent' | 'pro'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type AppointmentType = 'video' | 'phone' | 'in_person'
export type ResourceType = 'article' | 'video' | 'tool' | 'hotline'
export type MessageRole = 'user' | 'assistant'
export type FamilyLinkStatus = 'pending' | 'active' | 'declined'

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  email: string
  full_name: string
  avatar_url?: string
  profile_type: ProfileType
  date_of_birth?: string
  bio?: string
  phone?: string
  // Pro-specific
  specialty?: string
  license_number?: string
  years_experience?: number
  languages?: string[]
  consultation_fee?: number
  is_verified?: boolean
  // Subscription
  subscription_status?: 'free' | 'essential' | 'pro'
  subscription_expires_at?: string
}

export interface FamilyLink {
  id: string
  created_at: string
  parent_id: string
  ado_id?: string
  invite_code: string
  status: FamilyLinkStatus
  parent?: Profile
  ado?: Profile
}

export interface MoodEntry {
  id: string
  created_at: string
  user_id: string
  score: number
  emoji: string
  note?: string
  date: string
}

export interface JournalEntry {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  content: string
  mood_score?: number
  ai_response?: string
  is_private: boolean
}

export interface DailyMotivation {
  id: string
  created_at: string
  generated_date: string
  content: string
  author_style: string
}

export interface UserMotivation {
  id: string
  created_at: string
  user_id: string
  motivation_id: string
  liked: boolean
  motivation?: DailyMotivation
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  title?: string
  message_count: number
}

export interface Message {
  id: string
  created_at: string
  conversation_id: string
  user_id: string
  role: MessageRole
  content: string
}

export interface Challenge {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  title: string
  description?: string
  duration_days: number
  current_streak: number
  best_streak: number
  last_completed_at?: string
  completed_at?: string
  is_active: boolean
  metadata?: Record<string, unknown>
}

export interface Appointment {
  id: string
  created_at: string
  updated_at: string
  pro_id: string
  patient_id: string
  scheduled_at: string
  type: AppointmentType
  status: AppointmentStatus
  duration_minutes: number
  notes_for_pro?: string
  pro_notes?: string
  meeting_url?: string
  // Joined fields
  pro?: Profile
  patient?: Profile
}

export interface SessionNote {
  id: string
  created_at: string
  appointment_id: string
  pro_id: string
  patient_id: string
  content: string
  is_visible_to_patient: boolean
}

export interface Resource {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string
  content?: string
  type: ResourceType
  url?: string
  target_profile: ProfileType | 'all'
  tags: string[]
  approved: boolean
  author_id?: string
  view_count: number
}

export interface Notification {
  id: string
  created_at: string
  user_id: string
  title: string
  body: string
  type: string
  read: boolean
  data?: Record<string, unknown>
}

export interface Subscription {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  plan: 'essential' | 'pro'
  current_period_start: string
  current_period_end: string
}

export interface ProAvailability {
  id: string
  pro_id: string
  day_of_week: number // 0=Sunday, 6=Saturday
  start_time: string // HH:mm
  end_time: string   // HH:mm
  is_available: boolean
}
