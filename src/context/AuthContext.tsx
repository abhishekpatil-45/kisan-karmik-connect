
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  // Helper function to safely check if skills has crops
  const hasValidCrops = (skills: any): boolean => {
    return skills && 
           typeof skills === 'object' && 
           !Array.isArray(skills) &&
           Array.isArray(skills.crops) && 
           skills.crops.length > 0;
  };

  // Check if user profile is complete
  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return false;
      }

      if (!data) {
        setProfileCompleted(false);
        setUserRole(null);
        return false;
      }

      setUserRole(data.role);

      // Profile is complete only if user has a role AND all required fields
      if (data.role === 'farmer') {
        const isComplete = !!(
          data.phone && 
          data.location && 
          hasValidCrops(data.skills)
        );
        setProfileCompleted(isComplete);
        return isComplete;
      } else if (data.role === 'laborer') {
        const isComplete = !!(
          data.phone && 
          data.location && 
          hasValidCrops(data.skills)
        );
        setProfileCompleted(isComplete);
        return isComplete;
      } else {
        // User has no role assigned, profile is incomplete
        setProfileCompleted(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setProfileCompleted(false);
      setUserRole(null);
      return false;
    }
  };

  // Function to refresh profile data
  const refreshProfile = async () => {
    if (session?.user) {
      await checkProfileCompletion(session.user.id);
    }
  };

  // Define the function before using it
  const setupAuthStateListener = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check profile completion if user is logged in
        if (session?.user) {
          await checkProfileCompletion(session.user.id);
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
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error && error.code !== 'PGRST116') {
              // Create a basic profile if none exists (excluding "not found" error)
              const { error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  role: null, // Role will be set during profile completion
                });
              
              if (createError) {
                console.error('Error creating profile:', createError);
              }
            }

            if (data) {
              setUserRole(data.role);
              await checkProfileCompletion(session.user.id);
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

  useEffect(() => {
    const cleanup = setupAuthStateListener();
    
    // Check for existing session at initialization
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkProfileCompletion(session.user.id);
      }
      
      setLoading(false);
    });

    return cleanup;
  }, [navigate]);

  const signOut = async () => {
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
