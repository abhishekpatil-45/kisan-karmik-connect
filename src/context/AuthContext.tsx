
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Define the function before using it
  const setupAuthStateListener = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          // Handle sign out event
          navigate('/');
          toast({
            title: "Signed Out",
            description: "You have been signed out successfully",
          });
        }
        // If the user just signed in, check if they have a profile
        else if (event === 'SIGNED_IN' && session) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

            // If profile exists and user is on auth page, redirect to home page
            if (data && (location.pathname === '/auth' || location.pathname === '/')) {
              navigate('/'); // Redirect to homepage after login
            }
            // If no profile, redirect to profile setup
            else if (!data && window.location.pathname !== '/profile-setup') {
              navigate('/profile-setup');
            }
          } catch (error) {
            console.error('Error checking user profile:', error);
            navigate('/profile-setup');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  };

  useEffect(() => {
    const cleanup = setupAuthStateListener();
    
    // Check for existing session at initialization
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return cleanup;
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // The auth state listener will handle redirection and session clearing
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = { session, user, loading, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
