import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'
import AuthComponent from './Auth'

const ProtectedRoute = ({ children }) => {
  // For local development only - skip auth
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Authentication bypassed');
    return children;
  }

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthorization = async (session) => {
      if (session?.user?.email) {
        const { data: allowedUser, error } = await supabase
          .from('allowed_users')
          .select('*')
          .eq('email', session.user.email)
          .single();
  
        if (!allowedUser || error) {
          await supabase.auth.signOut();
          setUser(null);
          alert('Access denied. You are not authorized to access this application.');
          return;
        }
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
  
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAuthorization(session);
    });
  
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      checkAuthorization(session);
    });
  
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <AuthComponent />
  }

  return children
}

export default ProtectedRoute