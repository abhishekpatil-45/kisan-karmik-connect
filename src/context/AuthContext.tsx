
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { setupAuthStateListener, performSignOut } from './auth/authStateManager';
import { checkProfileCompletion } from './auth/authHelpers';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  loading: boolean;
  profileCompleted: boolean;
  userRole: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Function to refresh profile data
  const refreshProfile = async () => {
    if (session?.user) {
      const { isComplete, role } = await checkProfileCompletion(session.user.id);
      setProfileCompleted(isComplete);
      setUserRole(role);
    }
  };

  const signOut = async () => {
    await performSignOut({
      setUser,
      setSession,
      setProfileCompleted,
      setUserRole,
      navigate,
      toast
    });
  };

  useEffect(() => {
    const cleanup = setupAuthStateListener({
      setSession,
      setUser,
      setProfileCompleted,
      setUserRole,
      setLoading,
      navigate,
      toast,
      location
    });
    
    // Check for existing session at initialization
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { isComplete, role } = await checkProfileCompletion(session.user.id);
        setProfileCompleted(isComplete);
        setUserRole(role);
      }
      
      setLoading(false);
    });

    return cleanup;
  }, [navigate, toast, location]);

  const value: AuthContextType = { 
    session, 
    user, 
    loading, 
    profileCompleted, 
    userRole, 
    signOut,
    refreshProfile
  };

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
