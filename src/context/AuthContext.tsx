
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const setupAuthListener = async () => {
      // First set up the auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (event === 'SIGNED_IN' && currentSession) {
            // Check if user needs to complete profile setup
            setTimeout(() => {
              checkProfileCompletion(currentSession.user.id);
            }, 0);
          }
          
          if (event === 'SIGNED_OUT') {
            navigate('/auth');
          }
        }
      );
      
      // Then check for existing session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Check if user needs to complete profile setup
        await checkProfileCompletion(currentSession.user.id);
      }
      
      setLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuthListener();
  }, [navigate]);
  
  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      // If user has a role assigned but lacks details, redirect to appropriate profile setup
      if (profile) {
        if (!profile.phone || !profile.location) {
          // Redirect to the role-specific profile setup page
          navigate(`/profile-setup?role=${profile.role}`);
        } else {
          // If profile is complete, redirect to dashboard
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back to Agrisamadhana!",
      });
      
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Unable to sign in. Please check your credentials.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setLoading(true);
      
      // Ensure role is correctly passed to user metadata
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: metadata.fullName,
            role: metadata.role // This ensures role is properly set in auth metadata
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to sign up. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
