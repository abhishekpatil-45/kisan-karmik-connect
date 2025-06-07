
// Authentication security utilities
import { supabase } from '@/integrations/supabase/client';

export const authSecurity = {
  // Password strength validation
  validatePasswordStrength: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Rate limiting for authentication attempts
  rateLimitAuth: (() => {
    const attempts: Map<string, { count: number; resetTime: number }> = new Map();
    
    return (identifier: string, maxAttempts: number = 5, windowMs: number = 300000): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier);
      
      if (!userAttempts || now > userAttempts.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (userAttempts.count >= maxAttempts) {
        return false;
      }
      
      userAttempts.count++;
      return true;
    };
  })(),

  // Session timeout management
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  checkSessionTimeout: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    const lastActivity = localStorage.getItem('lastActivity');
    const now = Date.now();
    
    if (lastActivity && (now - parseInt(lastActivity)) > authSecurity.SESSION_TIMEOUT) {
      await supabase.auth.signOut();
      localStorage.removeItem('lastActivity');
      return false;
    }
    
    localStorage.setItem('lastActivity', now.toString());
    return true;
  },

  // Log security events
  logSecurityEvent: (event: string, details: any = {}): void => {
    console.log(`[SECURITY] ${event}:`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...details
    });
  }
};
