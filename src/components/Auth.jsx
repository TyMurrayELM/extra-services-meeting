import { supabase } from '../lib/supabase'

// Import the image using a different syntax for Vite
const fullLogo = new URL('../assets/logos/full.png', import.meta.url).href

const AuthComponent = () => {
  const handleGoogleSignIn = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
            hd: 'encorelm.com',
          },
          redirectTo: 'https://extra-services-meeting.vercel.app',
        },
      });
  
      if (authError) throw authError;
  
      // Add event listener for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
          const userEmail = session?.user?.email;
          
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
      console.error('Error during sign in:', error.message);
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