
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isFarmerSkills, isLaborerSkills } from '@/types/profile';

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

  // Handler functions for toggling crops, languages, and work types
  const handleFarmerCropToggle = (crop: string) => {
    setSelectedFarmerCrops(prev => 
      prev.includes(crop) 
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    );
  };

  const handleLaborerCropToggle = (crop: string) => {
    setSelectedLaborerCrops(prev => 
      prev.includes(crop) 
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    );
  };

  const handleLanguageToggle = (language: string, role: 'farmer' | 'laborer') => {
    if (role === 'farmer') {
      setFarmerLanguages(prev => 
        prev.includes(language) 
          ? prev.filter(l => l !== language)
          : [...prev, language]
      );
    } else {
      setLaborerLanguages(prev => 
        prev.includes(language) 
          ? prev.filter(l => l !== language)
          : [...prev, language]
      );
    }
  };

  const handleWorkTypeToggle = (workType: string) => {
    setPreferredWorkTypes(prev => 
      prev.includes(workType) 
        ? prev.filter(w => w !== workType)
        : [...prev, workType]
    );
  };

  // SECURITY FIX: Add type guards for JSONB data
  const isValidSkillsObject = (skills: any): boolean => {
    return skills && typeof skills === 'object' && !Array.isArray(skills);
  };

  const safeArrayAccess = (arr: any): string[] => {
    return Array.isArray(arr) ? arr.filter(item => typeof item === 'string') : [];
  };

  const safeStringAccess = (str: any): string => {
    return typeof str === 'string' ? str : '';
  };

  const safeBooleanAccess = (bool: any): boolean => {
    return typeof bool === 'boolean' ? bool : false;
  };

  // Memoized function to load user profile data
  const fetchUserProfile = useCallback(async () => {
    if (!user) {
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
          if (data.phone) setFarmerPhone(safeStringAccess(data.phone));
          if (data.location) setFarmerLocation(safeStringAccess(data.location));
          
          // SECURITY FIX: Safe JSONB access with type checking
          if (data.skills && isValidSkillsObject(data.skills) && isFarmerSkills(data.skills)) {
            setSelectedFarmerCrops(safeArrayAccess(data.skills.crops));
            setFarmingType(safeStringAccess(data.skills.farming_type));
            setFarmSize(safeStringAccess(data.skills.farm_size));
            setFarmerBio(safeStringAccess(data.skills.bio));
            setFarmerLanguages(safeArrayAccess(data.skills.languages));
          }
        } else if (currentRole === 'laborer') {
          if (data.phone) setLaborerPhone(safeStringAccess(data.phone));
          if (data.location) setLaborerLocation(safeStringAccess(data.location));
          if (data.experience) setExperience(data.experience.toString());
          
          // SECURITY FIX: Safe JSONB access with type checking
          if (data.skills && isValidSkillsObject(data.skills) && isLaborerSkills(data.skills)) {
            setSelectedLaborerCrops(safeArrayAccess(data.skills.crops));
            setAvailability(safeStringAccess(data.skills.availability));
            setWillRelocate(safeBooleanAccess(data.skills.will_relocate));
            setWageExpectation(safeStringAccess(data.skills.wage_expectation));
            setLaborerBio(safeStringAccess(data.skills.bio));
            setLaborerLanguages(safeArrayAccess(data.skills.languages));
            setPreferredWorkTypes(safeArrayAccess(data.skills.work_types));
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      // SECURITY FIX: Don't expose detailed error information
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
    setFarmSize,
    farmingType,
    setFarmingType,
    selectedFarmerCrops,
    setSelectedFarmerCrops,
    farmerBio,
    setFarmerBio,
    farmerLanguages,
    setFarmerLanguages,
    farmerPhone,
    setFarmerPhone,
    farmerLocation,
    setFarmerLocation,
    
    // Laborer data
    experience,
    setExperience,
    selectedLaborerCrops,
    setSelectedLaborerCrops,
    availability,
    setAvailability,
    willRelocate,
    setWillRelocate,
    wageExpectation,
    setWageExpectation,
    laborerBio,
    setLaborerBio,
    laborerLanguages,
    setLaborerLanguages,
    laborerPhone,
    setLaborerPhone,
    laborerLocation,
    setLaborerLocation,
    preferredWorkTypes,
    setPreferredWorkTypes,

    // Handler functions
    handleFarmerCropToggle,
    handleLaborerCropToggle,
    handleLanguageToggle,
    handleWorkTypeToggle
  };
};
