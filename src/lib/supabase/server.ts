import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '../supabase'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase URL:', supabaseUrl ? 'present' : 'missing')
  console.log('Supabase Key:', supabaseAnonKey ? 'present' : 'missing')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey
    })
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}