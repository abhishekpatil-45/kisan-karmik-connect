
// Security utility functions for input validation and sanitization

export const validateInput = {
  // Enhanced string validation with XSS protection
  string: (input: any, maxLength: number = 1000): string => {
    if (typeof input !== 'string') return '';
    const sanitized = input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
    return sanitized.slice(0, maxLength);
  },

  // Validate array of strings with length limits
  stringArray: (input: any, maxItems: number = 50): string[] => {
    if (!Array.isArray(input)) return [];
    return input
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .slice(0, maxItems)
      .map(item => validateInput.string(item, 100));
  },

  // Validate boolean input
  boolean: (input: any): boolean => {
    return typeof input === 'boolean' ? input : false;
  },

  // Enhanced numeric validation with range checks
  number: (input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    if (typeof num !== 'number' || isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  },

  // Enhanced email validation
  email: (input: any): string => {
    if (typeof input !== 'string') return '';
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const trimmed = input.trim().toLowerCase();
    return emailRegex.test(trimmed) && trimmed.length <= 254 ? trimmed : '';
  },

  // Enhanced phone validation for Indian numbers
  phone: (input: any): string => {
    if (typeof input !== 'string') return '';
    const cleanPhone = input.replace(/\D/g, '');
    
    // Indian phone number patterns
    const indianMobile = /^[6-9]\d{9}$/; // 10 digits starting with 6-9
    const indianWithCountry = /^91[6-9]\d{9}$/; // +91 followed by mobile
    const international = /^[\+]?[1-9][\d]{9,14}$/; // General international
    
    if (indianMobile.test(cleanPhone)) return '+91' + cleanPhone;
    if (indianWithCountry.test(cleanPhone)) return '+' + cleanPhone;
    if (international.test(cleanPhone)) return '+' + cleanPhone;
    
    return '';
  },

  // Validate location/address
  location: (input: any): string => {
    if (typeof input !== 'string') return '';
    const sanitized = validateInput.string(input, 200);
    // Remove potential script injections and suspicious patterns
    return sanitized.replace(/[<>]/g, '');
  },

  // Validate full name
  fullName: (input: any): string => {
    if (typeof input !== 'string') return '';
    const sanitized = input.trim().replace(/[<>]/g, '');
    // Allow only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    return nameRegex.test(sanitized) && sanitized.length <= 100 ? sanitized : '';
  },

  // Validate job title
  jobTitle: (input: any): string => {
    if (typeof input !== 'string') return '';
    const sanitized = validateInput.string(input, 200);
    return sanitized.replace(/[<>]/g, '');
  },

  // Validate job description
  jobDescription: (input: any): string => {
    if (typeof input !== 'string') return '';
    const sanitized = validateInput.string(input, 2000);
    return sanitized.replace(/[<>]/g, '');
  },

  // Validate review comment
  reviewComment: (input: any): string => {
    if (typeof input !== 'string') return '';
    const sanitized = validateInput.string(input, 1000);
    return sanitized.replace(/[<>]/g, '');
  },

  // Validate rating
  rating: (input: any): number => {
    const rating = validateInput.number(input, 1, 5);
    return Math.round(rating);
  }
};

export const sanitizeInput = {
  // Enhanced HTML sanitization
  html: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/style=/gi, '');
  },

  // Enhanced SQL injection prevention
  searchTerm: (input: string): string => {
    return input
      .replace(/['"`;\\]/g, '')
      .replace(/(--)|(\/\*)|(\*\/)/g, '')
      .replace(/(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/gi, '')
      .trim()
      .slice(0, 100);
  },

  // Sanitize file names
  fileName: (input: string): string => {
    return input
      .replace(/[^a-zA-Z0-9\-_\.]/g, '')
      .replace(/\.{2,}/g, '.')
      .slice(0, 255);
  }
};

export const securityChecks = {
  // Enhanced JSONB validation
  isValidJsonb: (data: any): boolean => {
    if (data === null || data === undefined) return true;
    if (typeof data !== 'object' || Array.isArray(data)) return false;
    
    try {
      JSON.stringify(data);
      return true;
    } catch {
      return false;
    }
  },

  // Check if user has permission to access resource
  canAccessResource: (userId: string, resourceOwnerId: string): boolean => {
    return userId === resourceOwnerId;
  },

  // Enhanced rate limiting with different limits for different actions
  rateLimitCheck: (() => {
    const attempts: Map<string, { count: number; resetTime: number }> = new Map();
    
    return (userId: string, action: string, limits: { [key: string]: { max: number; window: number } }): boolean => {
      const key = `${userId}:${action}`;
      const now = Date.now();
      const userAttempts = attempts.get(key);
      
      const limit = limits[action] || { max: 10, window: 60000 };
      
      if (!userAttempts || now > userAttempts.resetTime) {
        attempts.set(key, { count: 1, resetTime: now + limit.window });
        return true;
      }
      
      if (userAttempts.count >= limit.max) {
        return false;
      }
      
      userAttempts.count++;
      return true;
    };
  })(),

  // Validate file upload
  isValidFileUpload: (file: File, allowedTypes: string[], maxSize: number): boolean => {
    if (!allowedTypes.includes(file.type)) return false;
    if (file.size > maxSize) return false;
    
    // Check for suspicious file names
    const suspiciousPatterns = /\.(exe|bat|cmd|scr|pif|com)$/i;
    if (suspiciousPatterns.test(file.name)) return false;
    
    return true;
  },

  // Validate URL
  isValidUrl: (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
};

// Security monitoring
export const securityMonitor = {
  // Log suspicious activities
  logSuspiciousActivity: (userId: string, activity: string, details: any = {}): void => {
    console.warn(`[SECURITY ALERT] Suspicious activity detected:`, {
      userId,
      activity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details
    });
  },

  // Monitor failed attempts
  trackFailedAttempt: (type: string, identifier: string): void => {
    const key = `failed_${type}_${identifier}`;
    const count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, count.toString());
    
    if (count > 5) {
      securityMonitor.logSuspiciousActivity(identifier, `Multiple failed ${type} attempts`, { count });
    }
  },

  // Clear failed attempts on success
  clearFailedAttempts: (type: string, identifier: string): void => {
    const key = `failed_${type}_${identifier}`;
    localStorage.removeItem(key);
  }
};
