import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tjfojodrdewgakxxmaue.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZm9qb2RyZGV3Z2FreHhtYXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MDY0MjQsImV4cCI6MjA1NTQ4MjQyNH0._aBs3MrFkJr3A2OeFLHdmKphDROMeLkdc8KMm61EeC0'

export const REDIRECT_URL = 'https://extra-services-meeting.vercel.app'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'extra-services-auth', // Unique storage key for this app
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: REDIRECT_URL,
    storage: window.localStorage
  }
})