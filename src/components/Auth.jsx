import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Import the image using a different syntax for Vite
const fullLogo = new URL('../assets/logos/full.png', import.meta.url).href

const AuthComponent = () => {
  // Add effect to clear any existing sessions
  useEffect(() => {
    const clearExistingSession = async () => {
      try {
        await supabase.auth.signOut();
        localStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        console.log('Cleared existing session and storage');
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    };
    
    clearExistingSession();
  }, []);

  const handleGoogleSignIn = async () => {
    console.log('Starting auth flow...');
    try {
      const options = {
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account',
            hd: 'encorelm.com',
          },
          redirectTo: 'https://extra-services-meeting.vercel.app',
        },
      };
      console.log('Auth options:', options);

      const { data: authData, error: authError } = await supabase.auth.signInWithOAuth(options);
      console.log('Auth response:', { authData, authError });

      if (authError) throw authError;

      // Add event listener for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', { event, session });
        if (event === 'SIGNED_IN') {
          const userEmail = session?.user?.email;
          console.log('User signed in:', userEmail);
          
          // Check if user's email is in allowed_users table
          const { data: allowedUser, error: dbError } = await supabase
            .from('allowed_users')
            .select('*')
            .eq('email', userEmail)
            .single();

          if (dbError || !allowedUser) {
            // If not allowed, sign them out
            await supabase.auth.signOut();
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