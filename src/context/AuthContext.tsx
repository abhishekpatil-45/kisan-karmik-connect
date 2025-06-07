
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { authSecurity } from '@/utils/authSecurity';
import { securityMonitor } from '@/utils/securityHelpers';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  profileCompleted: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  // SECURITY: Session timeout monitoring
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        authSecurity.checkSessionTimeout();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
        authSecurity.logSecurityEvent('Session restored', { userId: session.user.id });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        authSecurity.logSecurityEvent('Auth state changed', { event, userId: session.user.id });
      } else {
        setUser(null);
        setUserRole(null);
        setProfileCompleted(false);
        if (event === 'SIGNED_OUT') {
          authSecurity.logSecurityEvent('User signed out');
          localStorage.removeItem('lastActivity');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, phone, location')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserRole(data.role);
        // Check if profile is completed based on role
        if (data.role === 'farmer') {
          setProfileCompleted(!!(data.full_name && data.phone && data.location));
        } else if (data.role === 'laborer') {
          setProfileCompleted(!!(data.full_name && data.phone && data.location));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      securityMonitor.logSuspiciousActivity(userId, 'Profile fetch failed', { error });
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      // SECURITY: Rate limiting for sign-in attempts
      if (!authSecurity.rateLimitAuth(email)) {
        const error = 'Too many sign-in attempts. Please try again later.';
        securityMonitor.trackFailedAttempt('signin', email);
        return { error };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        securityMonitor.trackFailedAttempt('signin', email);
        authSecurity.logSecurityEvent('Sign-in failed', { email, error: error.message });
        return { error: error.message };
      }

      securityMonitor.clearFailedAttempts('signin', email);
      authSecurity.logSecurityEvent('Sign-in successful', { email });
      localStorage.setItem('lastActivity', Date.now().toString());
      
      return {};
    } catch (error) {
      console.error('Sign-in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string): Promise<{ error?: string }> => {
    try {
      // SECURITY: Validate password strength
      const passwordValidation = authSecurity.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.errors[0] };
      }

      // SECURITY: Rate limiting for sign-up attempts
      if (!authSecurity.rateLimitAuth(email)) {
        const error = 'Too many sign-up attempts. Please try again later.';
        securityMonitor.trackFailedAttempt('signup', email);
        return { error };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        securityMonitor.trackFailedAttempt('signup', email);
        authSecurity.logSecurityEvent('Sign-up failed', { email, error: error.message });
        return { error: error.message };
      }

      securityMonitor.clearFailedAttempts('signup', email);
      authSecurity.logSecurityEvent('Sign-up successful', { email, role });
      
      return {};
    } catch (error) {
      console.error('Sign-up error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      authSecurity.logSecurityEvent('Sign-out initiated', { userId: user?.id });
      await supabase.auth.signOut();
      localStorage.removeItem('lastActivity');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile data
      await fetchUserProfile(user.id);
      authSecurity.logSecurityEvent('Profile updated', { userId: user.id });
    } catch (error) {
      console.error('Error updating profile:', error);
      securityMonitor.logSuspiciousActivity(user.id, 'Profile update failed', { error });
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    loading,
    profileCompleted,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
