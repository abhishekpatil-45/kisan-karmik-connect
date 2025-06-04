
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkProfileCompletion, createUserProfile } from './authHelpers';

interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  profileCompleted: boolean;
  userRole: string | null;
}

interface AuthStateCallbacks {
  setSession: (session: Session | null) => void;
  setUser: (user: SupabaseUser | null) => void;
  setProfileCompleted: (completed: boolean) => void;
  setUserRole: (role: string | null) => void;
  setLoading: (loading: boolean) => void;
  navigate: (path: string, options?: any) => void;
  toast: (options: any) => void;
  location: { pathname: string };
}

export const setupAuthStateListener = (callbacks: AuthStateCallbacks) => {
  const {
    setSession,
    setUser,
    setProfileCompleted,
    setUserRole,
    setLoading,
    navigate,
    toast,
    location
  } = callbacks;

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check profile completion if user is logged in
      if (session?.user) {
        const { isComplete, role } = await checkProfileCompletion(session.user.id);
        setProfileCompleted(isComplete);
        setUserRole(role);
      } else {
        setProfileCompleted(false);
        setUserRole(null);
      }
      
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state and redirecting');
        // Clear any local auth data
        localStorage.removeItem('supabase.auth.token');
        
        // Reset states immediately
        setProfileCompleted(false);
        setUserRole(null);
        setSession(null);
        setUser(null);
        
        // Navigate to home page
        navigate('/', { replace: true });
        
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully",
        });
      }
      // If the user just signed in, redirect to home page
      else if (event === 'SIGNED_IN' && session) {
        try {
          const data = await createUserProfile(session.user.id);

          if (data) {
            setUserRole(data.role);
            const { isComplete } = await checkProfileCompletion(session.user.id);
            setProfileCompleted(isComplete);
          }

          // Always redirect to home page after login
          if (location.pathname === '/auth') {
            navigate('/');
          }
          
        } catch (error) {
          console.error('Error checking user profile:', error);
        }
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
};

export const performSignOut = async (callbacks: AuthStateCallbacks) => {
  const { setUser, setSession, setProfileCompleted, setUserRole, navigate, toast } = callbacks;

  try {
    console.log("Signing out...");
    
    // Clear local state immediately
    setUser(null);
    setSession(null);
    setProfileCompleted(false);
    setUserRole(null);
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase signOut error:', error);
      // Even if there's an error, we still want to clear local state and redirect
    }
    
    // Force navigation to home page
    navigate('/', { replace: true });
    
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    });
  } catch (error) {
    console.error('Error signing out:', error);
    // Clear state and redirect even if there's an error
    setUser(null);
    setSession(null);
    setProfileCompleted(false);
    setUserRole(null);
    navigate('/', { replace: true });
    
    toast({
      title: "Signed Out",
      description: "You have been signed out",
    });
  }
};
