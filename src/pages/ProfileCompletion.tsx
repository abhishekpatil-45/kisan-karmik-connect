import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import RoleSelection from '@/components/RoleSelection';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { useProfileData } from '@/hooks/useProfileData';
import FarmerProfileForm from '@/components/profile/FarmerProfileForm';
import LaborerProfileForm from '@/components/profile/LaborerProfileForm';
import { Loader2 } from 'lucide-react';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, refreshProfile } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'laborer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRoleUpdating, setIsRoleUpdating] = useState(false);

  // Determine the role to use for data fetching
  const effectiveRole = useMemo(() => {
    return selectedRole || userRole;
  }, [selectedRole, userRole]);

  // Get profile data from custom hook - only when we have a role
  const profileData = useProfileData(effectiveRole);

  // Initialize selectedRole from userRole efficiently
  useEffect(() => {
    if (userRole && !selectedRole) {
      setSelectedRole(userRole as 'farmer' | 'laborer');
    }
  }, [userRole, selectedRole]);

  const handleRoleSelection = async (role: 'farmer' | 'laborer') => {
    if (!user) return;
    
    try {
      setIsRoleUpdating(true);
      setSelectedRole(role);
      
      // Save the role to the database immediately
      const { error } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh the profile data
      await refreshProfile();
      
      toast({
        title: "Role Selected",
        description: `You've selected to continue as a ${role}.`,
      });
    } catch (error: any) {
      console.error('Error setting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to set your role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRoleUpdating(false);
    }
  };

  // Memoized handlers to prevent unnecessary re-renders
  const handleFarmerCropToggle = useMemo(() => (cropId: string) => {
    profileData.setSelectedFarmerCrops(prev => 
      prev.includes(cropId) 
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    );
  }, [profileData.setSelectedFarmerCrops]);

  const handleLaborerCropToggle = useMemo(() => (cropId: string) => {
    profileData.setSelectedLaborerCrops(prev => 
      prev.includes(cropId) 
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    );
  }, [profileData.setSelectedLaborerCrops]);

  const handleLanguageToggle = useMemo(() => (languageId: string, isLaborer: boolean) => {
    const setter = isLaborer ? profileData.setLaborerLanguages : profileData.setFarmerLanguages;
    
    setter(prev => 
      prev.includes(languageId) 
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  }, [profileData.setLaborerLanguages, profileData.setFarmerLanguages]);

  const handleWorkTypeToggle = useMemo(() => (typeId: string) => {
    profileData.setPreferredWorkTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  }, [profileData.setPreferredWorkTypes]);

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRole) return;
    
    if (!profileData.farmerPhone || !profileData.farmerLocation || profileData.selectedFarmerCrops.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please provide your phone number, location, and select at least one crop to complete your profile.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: selectedRole,
          phone: profileData.farmerPhone,
          location: profileData.farmerLocation,
          skills: {
            crops: profileData.selectedFarmerCrops,
            farming_type: profileData.farmingType,
            farm_size: profileData.farmSize,
            bio: profileData.farmerBio,
            languages: profileData.farmerLanguages
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      await refreshProfile();
      
      toast({
        title: "Profile completed!",
        description: "Your farmer profile is now complete.",
      });
      
      navigate('/');
      
    } catch (error: any) {
      console.error('Error updating farmer profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaborerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRole) return;
    
    if (!profileData.laborerPhone || !profileData.laborerLocation || profileData.selectedLaborerCrops.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please provide your phone number, location, and select at least one crop to complete your profile.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: selectedRole,
          phone: profileData.laborerPhone,
          location: profileData.laborerLocation,
          experience: parseInt(profileData.experience) || 0,
          skills: {
            crops: profileData.selectedLaborerCrops,
            availability: profileData.availability,
            will_relocate: profileData.willRelocate,
            wage_expectation: profileData.wageExpectation,
            bio: profileData.laborerBio,
            languages: profileData.laborerLanguages,
            work_types: profileData.preferredWorkTypes
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      await refreshProfile();
      
      toast({
        title: "Profile completed!",
        description: "Your laborer profile is now complete.",
      });
      
      navigate('/');
      
    } catch (error: any) {
      console.error('Error updating laborer profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state while role is being updated or profile data is loading
  if (isRoleUpdating || (effectiveRole && profileData.isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">
          {isRoleUpdating ? 'Setting up your profile...' : 'Loading your profile...'}
        </span>
      </div>
    );
  }

  // Show role selection if no role is selected
  const shouldShowRoleSelection = !effectiveRole;

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        
        <main className="flex-1 bg-gray-50 py-8 px-4">
          {shouldShowRoleSelection ? (
            <RoleSelection onSelectRole={handleRoleSelection} />
          ) : (
            <div className="container mx-auto max-w-3xl">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">
                  Complete Your {selectedRole === 'laborer' ? 'Laborer' : 'Farmer'} Profile
                </h1>
                
                {selectedRole === 'laborer' ? (
                  <LaborerProfileForm
                    user={user}
                    isSubmitting={isSubmitting}
                    onSubmit={handleLaborerSubmit}
                    laborerPhone={profileData.laborerPhone}
                    setLaborerPhone={profileData.setLaborerPhone}
                    laborerLocation={profileData.laborerLocation}
                    setLaborerLocation={profileData.setLaborerLocation}
                    experience={profileData.experience}
                    setExperience={profileData.setExperience}
                    selectedLaborerCrops={profileData.selectedLaborerCrops}
                    handleLaborerCropToggle={handleLaborerCropToggle}
                    availability={profileData.availability}
                    setAvailability={profileData.setAvailability}
                    willRelocate={profileData.willRelocate}
                    setWillRelocate={profileData.setWillRelocate}
                    wageExpectation={profileData.wageExpectation}
                    setWageExpectation={profileData.setWageExpectation}
                    laborerBio={profileData.laborerBio}
                    setLaborerBio={profileData.setLaborerBio}
                    laborerLanguages={profileData.laborerLanguages}
                    handleLanguageToggle={handleLanguageToggle}
                    preferredWorkTypes={profileData.preferredWorkTypes}
                    handleWorkTypeToggle={handleWorkTypeToggle}
                  />
                ) : (
                  <FarmerProfileForm
                    user={user}
                    isSubmitting={isSubmitting}
                    onSubmit={handleFarmerSubmit}
                    farmerPhone={profileData.farmerPhone}
                    setFarmerPhone={profileData.setFarmerPhone}
                    farmerLocation={profileData.farmerLocation}
                    setFarmerLocation={profileData.setFarmerLocation}
                    farmSize={profileData.farmSize}
                    setFarmSize={profileData.setFarmSize}
                    farmingType={profileData.farmingType}
                    setFarmingType={profileData.setFarmingType}
                    selectedFarmerCrops={profileData.selectedFarmerCrops}
                    handleFarmerCropToggle={handleFarmerCropToggle}
                    farmerBio={profileData.farmerBio}
                    setFarmerBio={profileData.setFarmerBio}
                    farmerLanguages={profileData.farmerLanguages}
                    handleLanguageToggle={handleLanguageToggle}
                  />
                )}
              </div>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default ProfileCompletion;
