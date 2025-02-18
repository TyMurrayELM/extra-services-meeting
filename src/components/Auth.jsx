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
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="mb-8 flex justify-center">
          <img 
            src={fullLogo} 
            alt="Company Logo" 
            className="h-48 w-auto"
          />
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-5 h-5"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

export default AuthComponent