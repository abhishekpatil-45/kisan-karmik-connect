
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { isFarmerSkills, isLaborerSkills } from '@/types/profile';

export const useProfileData = (roleParam: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
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

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserProfile(data);
        setUserRole(data.role);
        
        // If URL param doesn't match user's actual role, redirect with the correct role
        if (roleParam !== data.role) {
          navigate(`/profile-setup?role=${data.role}`, { replace: true });
          return;
        }
        
        if (data.role === 'farmer') {
          if (data.phone) setFarmerPhone(data.phone);
          if (data.location) setFarmerLocation(data.location);
          
          // Load additional farmer profile data if available
          if (data.skills && isFarmerSkills(data.skills)) {
            if (data.skills.crops) setSelectedFarmerCrops(data.skills.crops as string[]);
            if (data.skills.farming_type) setFarmingType(data.skills.farming_type as string);
            if (data.skills.farm_size) setFarmSize(data.skills.farm_size as string);
            if (data.skills.bio) setFarmerBio(data.skills.bio as string);
            if (data.skills.languages) setFarmerLanguages(data.skills.languages as string[]);
          }
        } else if (data.role === 'laborer') {
          if (data.phone) setLaborerPhone(data.phone);
          if (data.location) setLaborerLocation(data.location);
          if (data.experience) setExperience(data.experience.toString());
          
          // Load additional laborer profile data if available
          if (data.skills && isLaborerSkills(data.skills)) {
            if (data.skills.crops) setSelectedLaborerCrops(data.skills.crops as string[]);
            if (data.skills.availability) setAvailability(data.skills.availability as string);
            if (data.skills.will_relocate !== undefined) setWillRelocate(data.skills.will_relocate as boolean);
            if (data.skills.wage_expectation) setWageExpectation(data.skills.wage_expectation as string);
            if (data.skills.bio) setLaborerBio(data.skills.bio as string);
            if (data.skills.languages) setLaborerLanguages(data.skills.languages as string[]);
            if (data.skills.work_types) setPreferredWorkTypes(data.skills.work_types as string[]);
          }
        }
        
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile information.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast, navigate, roleParam]);

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
    setPreferredWorkTypes
  };
};
