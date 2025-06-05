
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isFarmerSkills, isLaborerSkills } from '@/types/profile';

export const useProfileLoader = (id: string | undefined, user: any, profileHookData: any) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If no ID provided, fetch current user's profile
        const userId = id || user?.id;
        
        if (!userId) {
          setError('No user ID provided');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Profile not found');
          } else {
            throw error;
          }
          return;
        }

        setProfileData(data);
        
        // Initialize form data if editing own profile
        if (!id && data) {
          if (data.role === 'farmer') {
            profileHookData.setFarmerPhone(data.phone || '');
            profileHookData.setFarmerLocation(data.location || '');
            if (data.skills && isFarmerSkills(data.skills)) {
              profileHookData.setSelectedFarmerCrops(data.skills.crops || []);
              profileHookData.setFarmingType(data.skills.farming_type || '');
              profileHookData.setFarmSize(data.skills.farm_size || '');
              profileHookData.setFarmerBio(data.skills.bio || '');
              profileHookData.setFarmerLanguages(data.skills.languages || []);
            }
          } else if (data.role === 'laborer') {
            profileHookData.setLaborerPhone(data.phone || '');
            profileHookData.setLaborerLocation(data.location || '');
            profileHookData.setExperience(data.experience?.toString() || '');
            if (data.skills && isLaborerSkills(data.skills)) {
              profileHookData.setSelectedLaborerCrops(data.skills.crops || []);
              profileHookData.setAvailability(data.skills.availability || '');
              profileHookData.setWillRelocate(data.skills.will_relocate || false);
              profileHookData.setWageExpectation(data.skills.wage_expectation || '');
              profileHookData.setLaborerBio(data.skills.bio || '');
              profileHookData.setLaborerLanguages(data.skills.languages || []);
              profileHookData.setPreferredWorkTypes(data.skills.work_types || []);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, user?.id]);

  return {
    profileData,
    setProfileData,
    isLoading,
    error
  };
};
