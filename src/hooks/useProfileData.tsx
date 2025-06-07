
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isFarmerSkills, isLaborerSkills } from '@/types/profile';
import { validateInput, securityChecks, securityMonitor } from '@/utils/securityHelpers';

export const useProfileData = (roleParam: string | null) => {
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Farmer profile states
  const [farmSize, setFarmSize] = useState('');
  const [farmingType, setFarmingType] = useState('');
  const [selectedFarmerCrops, setSelectedFarmerCrops] = useState<string[]>([]);
  const [farmerBio, setFarmerBio] = useState('');
  const [farmerLanguages, setFarmerLanguages] = useState<string[]>([]);
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerLocation, setFarmerLocation] = useState('');

  // Laborer profile states
  const [experience, setExperience] = useState('');
  const [selectedLaborerCrops, setSelectedLaborerCrops] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [willRelocate, setWillRelocate] = useState(false);
  const [wageExpectation, setWageExpectation] = useState('');
  const [laborerBio, setLaborerBio] = useState('');
  const [laborerLanguages, setLaborerLanguages] = useState<string[]>([]);
  const [laborerPhone, setLaborerPhone] = useState('');
  const [laborerLocation, setLaborerLocation] = useState('');
  const [preferredWorkTypes, setPreferredWorkTypes] = useState<string[]>([]);

  // SECURITY: Enhanced type guards and validation for JSONB data
  const isValidSkillsObject = (skills: any): boolean => {
    return securityChecks.isValidJsonb(skills);
  };

  const safeArrayAccess = (arr: any, maxItems: number = 50): string[] => {
    return validateInput.stringArray(arr, maxItems);
  };

  const safeStringAccess = (str: any, maxLength: number = 1000): string => {
    return validateInput.string(str, maxLength);
  };

  const safeBooleanAccess = (bool: any): boolean => {
    return validateInput.boolean(bool);
  };

  const safeNumberAccess = (num: any, min: number = 0, max: number = 100): number => {
    return validateInput.number(num, min, max);
  };

  // SECURITY: Sanitized handler functions for toggling crops, languages, and work types
  const handleFarmerCropToggle = useCallback((crop: string) => {
    const sanitizedCrop = validateInput.string(crop, 50);
    if (!sanitizedCrop) return;
    
    setSelectedFarmerCrops(prev => {
      const newCrops = prev.includes(sanitizedCrop) 
        ? prev.filter(c => c !== sanitizedCrop)
        : [...prev, sanitizedCrop];
      
      // Limit to maximum 20 crops for security
      return newCrops.slice(0, 20);
    });
  }, []);

  const handleLaborerCropToggle = useCallback((crop: string) => {
    const sanitizedCrop = validateInput.string(crop, 50);
    if (!sanitizedCrop) return;
    
    setSelectedLaborerCrops(prev => {
      const newCrops = prev.includes(sanitizedCrop) 
        ? prev.filter(c => c !== sanitizedCrop)
        : [...prev, sanitizedCrop];
      
      // Limit to maximum 20 crops for security
      return newCrops.slice(0, 20);
    });
  }, []);

  const handleLanguageToggle = useCallback((language: string, role: 'farmer' | 'laborer') => {
    const sanitizedLanguage = validateInput.string(language, 50);
    if (!sanitizedLanguage) return;
    
    if (role === 'farmer') {
      setFarmerLanguages(prev => {
        const newLanguages = prev.includes(sanitizedLanguage) 
          ? prev.filter(l => l !== sanitizedLanguage)
          : [...prev, sanitizedLanguage];
        
        // Limit to maximum 10 languages for security
        return newLanguages.slice(0, 10);
      });
    } else {
      setLaborerLanguages(prev => {
        const newLanguages = prev.includes(sanitizedLanguage) 
          ? prev.filter(l => l !== sanitizedLanguage)
          : [...prev, sanitizedLanguage];
        
        // Limit to maximum 10 languages for security
        return newLanguages.slice(0, 10);
      });
    }
  }, []);

  const handleWorkTypeToggle = useCallback((workType: string) => {
    const sanitizedWorkType = validateInput.string(workType, 50);
    if (!sanitizedWorkType) return;
    
    setPreferredWorkTypes(prev => {
      const newWorkTypes = prev.includes(sanitizedWorkType) 
        ? prev.filter(w => w !== sanitizedWorkType)
        : [...prev, sanitizedWorkType];
      
      // Limit to maximum 15 work types for security
      return newWorkTypes.slice(0, 15);
    });
  }, []);

  // SECURITY: Enhanced fetch function with additional validation
  const fetchUserProfile = useCallback(async () => {
    if (!user) {
      return;
    }

    // SECURITY: Rate limiting for profile fetches
    if (!securityChecks.rateLimitCheck(user.id, 'profile_fetch', {
      profile_fetch: { max: 30, window: 300000 } // 30 fetches per 5 minutes
    })) {
      securityMonitor.logSuspiciousActivity(user.id, 'Profile fetch rate limit exceeded');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserProfile(data);
        
        // Only populate form fields if we have a matching role
        const currentRole = roleParam || userRole || data.role;
        
        if (currentRole === 'farmer') {
          if (data.phone) setFarmerPhone(validateInput.phone(data.phone));
          if (data.location) setFarmerLocation(validateInput.location(data.location));
          
          // SECURITY: Enhanced JSONB access with comprehensive validation
          if (data.skills && isValidSkillsObject(data.skills) && isFarmerSkills(data.skills)) {
            setSelectedFarmerCrops(safeArrayAccess(data.skills.crops, 20));
            setFarmingType(safeStringAccess(data.skills.farming_type, 100));
            setFarmSize(safeStringAccess(data.skills.farm_size, 100));
            setFarmerBio(safeStringAccess(data.skills.bio, 2000));
            setFarmerLanguages(safeArrayAccess(data.skills.languages, 10));
          }
        } else if (currentRole === 'laborer') {
          if (data.phone) setLaborerPhone(validateInput.phone(data.phone));
          if (data.location) setLaborerLocation(validateInput.location(data.location));
          if (data.experience) setExperience(safeNumberAccess(data.experience, 0, 50).toString());
          
          // SECURITY: Enhanced JSONB access with comprehensive validation
          if (data.skills && isValidSkillsObject(data.skills) && isLaborerSkills(data.skills)) {
            setSelectedLaborerCrops(safeArrayAccess(data.skills.crops, 20));
            setAvailability(safeStringAccess(data.skills.availability, 100));
            setWillRelocate(safeBooleanAccess(data.skills.will_relocate));
            setWageExpectation(safeStringAccess(data.skills.wage_expectation, 100));
            setLaborerBio(safeStringAccess(data.skills.bio, 2000));
            setLaborerLanguages(safeArrayAccess(data.skills.languages, 10));
            setPreferredWorkTypes(safeArrayAccess(data.skills.work_types, 15));
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      securityMonitor.logSuspiciousActivity(
        user.id,
        'Profile fetch error',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      toast({
        title: 'Error',
        description: 'Failed to load profile information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, userRole, roleParam, toast]);

  // Only fetch when we have a user and role information
  useEffect(() => {
    if (user && (userRole || roleParam)) {
      fetchUserProfile();
    }
  }, [user, userRole, roleParam, fetchUserProfile]);

  return {
    isLoading,
    userProfile,
    userRole,
    
    // Farmer data
    farmSize,
    setFarmSize: (value: string) => setFarmSize(validateInput.string(value, 100)),
    farmingType,
    setFarmingType: (value: string) => setFarmingType(validateInput.string(value, 100)),
    selectedFarmerCrops,
    setSelectedFarmerCrops: (crops: string[]) => setSelectedFarmerCrops(validateInput.stringArray(crops, 20)),
    farmerBio,
    setFarmerBio: (value: string) => setFarmerBio(validateInput.string(value, 2000)),
    farmerLanguages,
    setFarmerLanguages: (languages: string[]) => setFarmerLanguages(validateInput.stringArray(languages, 10)),
    farmerPhone,
    setFarmerPhone: (value: string) => setFarmerPhone(validateInput.phone(value)),
    farmerLocation,
    setFarmerLocation: (value: string) => setFarmerLocation(validateInput.location(value)),
    
    // Laborer data
    experience,
    setExperience: (value: string) => setExperience(validateInput.number(value, 0, 50).toString()),
    selectedLaborerCrops,
    setSelectedLaborerCrops: (crops: string[]) => setSelectedLaborerCrops(validateInput.stringArray(crops, 20)),
    availability,
    setAvailability: (value: string) => setAvailability(validateInput.string(value, 100)),
    willRelocate,
    setWillRelocate: (value: boolean) => setWillRelocate(validateInput.boolean(value)),
    wageExpectation,
    setWageExpectation: (value: string) => setWageExpectation(validateInput.string(value, 100)),
    laborerBio,
    setLaborerBio: (value: string) => setLaborerBio(validateInput.string(value, 2000)),
    laborerLanguages,
    setLaborerLanguages: (languages: string[]) => setLaborerLanguages(validateInput.stringArray(languages, 10)),
    laborerPhone,
    setLaborerPhone: (value: string) => setLaborerPhone(validateInput.phone(value)),
    laborerLocation,
    setLaborerLocation: (value: string) => setLaborerLocation(validateInput.location(value)),
    preferredWorkTypes,
    setPreferredWorkTypes: (types: string[]) => setPreferredWorkTypes(validateInput.stringArray(types, 15)),

    // Handler functions
    handleFarmerCropToggle,
    handleLaborerCropToggle,
    handleLanguageToggle,
    handleWorkTypeToggle
  };
};
