
// Security utility functions for input validation and sanitization

export const validateInput = {
  // Validate string input with length limits
  string: (input: any, maxLength: number = 1000): string => {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength);
  },

  // Validate array of strings
  stringArray: (input: any): string[] => {
    if (!Array.isArray(input)) return [];
    return input.filter(item => typeof item === 'string' && item.trim().length > 0);
  },

  // Validate boolean input
  boolean: (input: any): boolean => {
    return typeof input === 'boolean' ? input : false;
  },

  // Validate numeric input
  number: (input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
    const num = typeof input === 'string' ? parseInt(input, 10) : input;
    if (typeof num !== 'number' || isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  },

  // Validate email format
  email: (input: any): string => {
    if (typeof input !== 'string') return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input.trim()) ? input.trim().toLowerCase() : '';
  },

  // Validate phone number (basic format)
  phone: (input: any): string => {
    if (typeof input !== 'string') return '';
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = input.replace(/\D/g, '');
    return phoneRegex.test(cleanPhone) ? cleanPhone : '';
  }
};

export const sanitizeInput = {
  // Basic HTML sanitization (remove script tags and dangerous attributes)
  html: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  },

  // SQL injection prevention for search terms
  searchTerm: (input: string): string => {
    return input
      .replace(/['"`;\\]/g, '')
      .trim()
      .slice(0, 100);
  }
};

export const securityChecks = {
  // Check if JSONB data is valid object
  isValidJsonb: (data: any): boolean => {
    return data !== null && typeof data === 'object' && !Array.isArray(data);
  },

  // Check if user has permission to access resource
  canAccessResource: (userId: string, resourceOwnerId: string): boolean => {
    return userId === resourceOwnerId;
  },

  // Rate limiting check (simple in-memory implementation)
  rateLimitCheck: (() => {
    const attempts: Map<string, { count: number; resetTime: number }> = new Map();
    
    return (userId: string, maxAttempts: number = 10, windowMs: number = 60000): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(userId);
      
      if (!userAttempts || now > userAttempts.resetTime) {
        attempts.set(userId, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (userAttempts.count >= maxAttempts) {
        return false;
      }
      
      userAttempts.count++;
      return true;
    };
  })()
};
