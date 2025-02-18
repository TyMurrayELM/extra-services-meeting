import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

const fullLogo = new URL('../assets/logos/full.png', import.meta.url).href

const AuthComponent = () => {
  useEffect(() => {
    const clearExistingSession = async () => {
      try {
        // Remove auth subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
        subscription?.unsubscribe();

        // Sign out from this app only
        await supabase.auth.signOut({ scope: 'local' });
        
        // Clear only this app's storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('extra-services-')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear only this app's cookies
        document.cookie.split(";").forEach((c) => {
          if (c.includes('extra-services-')) {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          }
        });
        
        console.log('Cleared existing session for extra-services app');
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    };

    clearExistingSession();

    return () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
      subscription?.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    console.log('Starting auth flow...');
    try {
      // Clear existing state for this app only
      await supabase.auth.signOut({ scope: 'local' });

      const options = {
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account consent',
            hd: 'encorelm.com',
          },
          redirectTo: 'https://extra-services-meeting.vercel.app',
          skipBrowserRedirect: false,
          scopes: 'email profile',
        },
      };

      const { error: authError } = await supabase.auth.signInWithOAuth(options);
      if (authError) throw authError;

      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
          const userEmail = session?.user?.email;
          
          const { data: allowedUser, error: dbError } = await supabase
            .from('allowed_users')
            .select('*')
            .eq('email', userEmail)
            .single();

          if (dbError || !allowedUser) {
            subscription.unsubscribe();
            await supabase.auth.signOut({ scope: 'local' });
            alert('Access denied. You are not authorized to access this application.');
          }
        }
      });

    } catch (error) {
      console.error('Error during sign in:', error);
      alert('An error occurred during sign in. Please try again.');
    }
  };

  return (
    // ... existing JSX remains the same ...
  )
}

export default AuthComponent