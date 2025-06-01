
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

      // Helper function to safely check if skills has crops
      const hasValidCrops = (skills: any): boolean => {
        return skills && 
               typeof skills === 'object' && 
               !Array.isArray(skills) &&
               Array.isArray(skills.crops) && 
               skills.crops.length > 0;
      };

      // Determine if profile is complete based on role-specific requirements
      if (data.role === 'farmer') {
        // For farmers, require phone, location, and at least one crop
        const isComplete = !!(
          data.phone && 
          data.location && 
          hasValidCrops(data.skills)
        );
        setProfileCompleted(isComplete);
        setUserRole(data.role);
        return isComplete;
      } else if (data.role === 'laborer') {
        // For laborers, require phone, location, and at least one crop skill
        const isComplete = !!(
          data.phone && 
          data.location && 
          hasValidCrops(data.skills)
        );
        setProfileCompleted(isComplete);
        setUserRole(data.role);
        return isComplete;
      }
      
      setUserRole(data.role);
      return false;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  };

  // Define the function before using it
  const setupAuthStateListener = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
          // Clear any local auth data
          localStorage.removeItem('supabase.auth.token');
          
          // Handle sign out event - force navigate to home
          navigate('/', { replace: true });
          
          // Reset states
          setProfileCompleted(false);
          setUserRole(null);
          
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
                  role: 'farmer', // Default role, will be updated when user selects
                });
              
              if (createError) {
                console.error('Error creating profile:', createError);
              }
            }

            if (data) {
              setUserRole(data.role);
              await checkProfileCompletion(session.user.id);
            }

            // Always redirect to home page after login (not profile setup)
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Force clear user state immediately instead of waiting for the listener
      setUser(null);
      setSession(null);
      setProfileCompleted(false);
      setUserRole(null);
      
      // Force navigation to home page
      navigate('/', { replace: true });
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = { 
    session, 
    user, 
    loading, 
    profileCompleted, 
    userRole, 
    signOut 
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
