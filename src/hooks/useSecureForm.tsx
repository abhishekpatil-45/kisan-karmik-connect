
import { useState, useCallback } from 'react';
import { validateInput, securityChecks, securityMonitor } from '@/utils/securityHelpers';
import { authSecurity } from '@/utils/authSecurity';
import { useAuth } from '@/context/AuthContext';

interface ValidationRule {
  validator: (value: any) => string;
  required?: boolean;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export const useSecureForm = (initialValues: any, validationRules: ValidationRules) => {
  const { user } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string, value: any): string => {
    const rule = validationRules[name];
    if (!rule) return '';

    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${name} is required`;
    }

    return rule.validator(value);
  }, [validationRules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  const handleChange = useCallback((name: string, value: any) => {
    // Apply security validation based on field type
    let sanitizedValue = value;
    
    switch (name) {
      case 'email':
        sanitizedValue = validateInput.email(value);
        break;
      case 'phone':
        sanitizedValue = validateInput.phone(value);
        break;
      case 'full_name':
      case 'fullName':
        sanitizedValue = validateInput.fullName(value);
        break;
      case 'location':
        sanitizedValue = validateInput.location(value);
        break;
      case 'title':
        sanitizedValue = validateInput.jobTitle(value);
        break;
      case 'description':
        sanitizedValue = validateInput.jobDescription(value);
        break;
      case 'comment':
        sanitizedValue = validateInput.reviewComment(value);
        break;
      case 'rating':
        sanitizedValue = validateInput.rating(value);
        break;
      default:
        if (typeof value === 'string') {
          sanitizedValue = validateInput.string(value);
        }
    }

    setValues((prev: any) => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (
    onSubmit: (values: any) => Promise<void>,
    rateLimitAction?: string
  ) => {
    if (!validateForm()) {
      securityMonitor.logSuspiciousActivity(
        user?.id || 'anonymous',
        'Form submission with validation errors',
        { errors, values: Object.keys(values) }
      );
      return;
    }

    // Check rate limiting if specified
    if (rateLimitAction && user) {
      const rateLimits = {
        profile_update: { max: 10, window: 300000 }, // 10 updates per 5 minutes
        job_post: { max: 5, window: 3600000 }, // 5 job posts per hour
        message_send: { max: 50, window: 300000 }, // 50 messages per 5 minutes
        review_submit: { max: 10, window: 3600000 }, // 10 reviews per hour
      };

      if (!securityChecks.rateLimitCheck(user.id, rateLimitAction, rateLimits)) {
        setErrors({ general: 'Too many requests. Please try again later.' });
        securityMonitor.logSuspiciousActivity(
          user.id,
          'Rate limit exceeded',
          { action: rateLimitAction }
        );
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
      securityMonitor.clearFailedAttempts('form_submission', user?.id || 'anonymous');
    } catch (error) {
      console.error('Form submission error:', error);
      securityMonitor.trackFailedAttempt('form_submission', user?.id || 'anonymous');
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, errors, validateForm, user]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    validateForm,
    setErrors
  };
};

// Common validation rules
export const commonValidationRules = {
  email: {
    validator: (value: string) => {
      const sanitized = validateInput.email(value);
      if (!sanitized && value) return 'Please enter a valid email address';
      return '';
    },
    required: true
  },
  
  phone: {
    validator: (value: string) => {
      const sanitized = validateInput.phone(value);
      if (!sanitized && value) return 'Please enter a valid phone number';
      return '';
    }
  },
  
  fullName: {
    validator: (value: string) => {
      const sanitized = validateInput.fullName(value);
      if (!sanitized && value) return 'Please enter a valid name (letters, spaces, hyphens only)';
      if (sanitized && sanitized.length < 2) return 'Name must be at least 2 characters long';
      return '';
    },
    required: true
  },
  
  location: {
    validator: (value: string) => {
      if (value && value.length < 2) return 'Location must be at least 2 characters long';
      return '';
    }
  },
  
  password: {
    validator: (value: string) => {
      const { isValid, errors } = authSecurity.validatePasswordStrength(value);
      return isValid ? '' : errors[0];
    },
    required: true
  },
  
  rating: {
    validator: (value: number) => {
      if (value < 1 || value > 5) return 'Rating must be between 1 and 5';
      return '';
    },
    required: true
  }
};
