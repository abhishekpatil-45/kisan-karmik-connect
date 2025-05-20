import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    setupAuthStateListener();
  }, [setupAuthStateListener]);

  const setupAuthStateListener = useCallback(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // If the user just signed in, check if they have a profile
        if (event === 'SIGNED_IN' && session) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

            // If profile exists and user is on auth page, redirect to home page
            if (data && window.location.pathname === '/auth') {
              navigate('/');  // Changed from '/dashboard' to '/'
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
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
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
