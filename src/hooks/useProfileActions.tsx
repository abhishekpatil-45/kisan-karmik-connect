
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProfileActions = (user: any, setProfileData: (data: any) => void, setIsEditing: (editing: boolean) => void) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFarmerSubmit = async (e: React.FormEvent, profileHookData: any) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: profileHookData.farmerPhone,
          location: profileHookData.farmerLocation,
          skills: {
            crops: profileHookData.selectedFarmerCrops,
            farming_type: profileHookData.farmingType,
            farm_size: profileHookData.farmSize,
            bio: profileHookData.farmerBio,
            languages: profileHookData.farmerLanguages
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Refresh profile data
      const { data: refreshedData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setProfileData(refreshedData);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your farmer profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaborerSubmit = async (e: React.FormEvent, profileHookData: any) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: profileHookData.laborerPhone,
          location: profileHookData.laborerLocation,
          experience: parseInt(profileHookData.experience) || 0,
          skills: {
            crops: profileHookData.selectedLaborerCrops,
            availability: profileHookData.availability,
            will_relocate: profileHookData.willRelocate,
            wage_expectation: profileHookData.wageExpectation,
            bio: profileHookData.laborerBio,
            languages: profileHookData.laborerLanguages,
            work_types: profileHookData.preferredWorkTypes
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Refresh profile data
      const { data: refreshedData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setProfileData(refreshedData);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your laborer profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleFarmerSubmit,
    handleLaborerSubmit
  };
};
