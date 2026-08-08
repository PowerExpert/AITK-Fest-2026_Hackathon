import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config'

export const supabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('ВСТАВЬТЕ') &&
  !SUPABASE_ANON_KEY.includes('ВСТАВЬТЕ')

export const supabase = createClient(
  supabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  supabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-anon-key'
)

export type Profile = {
  id: string
  full_name: string | null
  age: number | null
  region: string | null
  created_at?: string
  updated_at?: string
}

export type ResumeCheck = {
  id: string
  user_id: string
  resume_text: string
  region: string | null
  result: any
  created_at: string
}
