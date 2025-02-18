import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tjfojodrdewgakxxmaue.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZm9qb2RyZGV3Z2FreHhtYXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MDY0MjQsImV4cCI6MjA1NTQ4MjQyNH0._aBs3MrFkJr3A2OeFLHdmKphDROMeLkdc8KMm61EeC0'

export const REDIRECT_URL = 'https://extra-services-meeting.vercel.app'

// Create a custom storage object to isolate this app's auth state
const customStorage = {
  getItem: (key) => {
    const item = localStorage.getItem(`extra-services-${key}`);
    return item;
  },
  setItem: (key, value) => {
    localStorage.setItem(`extra-services-${key}`, value);
  },
  removeItem: (key) => {
    localStorage.removeItem(`extra-services-${key}`);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'extra-services-auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: REDIRECT_URL,
    storage: customStorage, // Use custom storage instead of window.localStorage
    cookieOptions: {
      name: 'extra-services-auth', // Unique cookie name
      domain: 'extra-services-meeting.vercel.app',
      sameSite: 'Strict'
    }
  }
})