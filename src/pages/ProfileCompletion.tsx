
import React, { useState } from 'react';
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
  const { user } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'laborer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get profile data from custom hook - passing selectedRole as roleParam
  const {
    isLoading,
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
  } = useProfileData(selectedRole);

  const handleRoleSelection = async (role: 'farmer' | 'laborer') => {
    if (!user) return;
    
    try {
      // First create or update the profile with the selected role
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: role,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setSelectedRole(role);
      
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
    }
  };

  const handleFarmerCropToggle = (cropId: string) => {
    setSelectedFarmerCrops(prev => 
      prev.includes(cropId) 
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    );
  };

  const handleLaborerCropToggle = (cropId: string) => {
    setSelectedLaborerCrops(prev => 
      prev.includes(cropId) 
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    );
  };

  const handleLanguageToggle = (languageId: string, isLaborer: boolean) => {
    const setter = isLaborer ? setLaborerLanguages : setFarmerLanguages;
    
    setter(prev => 
      prev.includes(languageId) 
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handleWorkTypeToggle = (typeId: string) => {
    setPreferredWorkTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!farmerPhone || !farmerLocation) {
      toast({
        title: 'Missing information',
        description: 'Please provide your phone number and location to complete your profile.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update profile with basic and farmer-specific information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: farmerPhone,
          location: farmerLocation,
          skills: {
            crops: selectedFarmerCrops,
            farming_type: farmingType,
            farm_size: farmSize,
            bio: farmerBio,
            languages: farmerLanguages
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
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
    if (!user) return;
    
    if (!laborerPhone || !laborerLocation) {
      toast({
        title: 'Missing information',
        description: 'Please provide your phone number and location to complete your profile.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update profile with basic and laborer-specific information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: laborerPhone,
          location: laborerLocation,
          experience: parseInt(experience) || 0,
          skills: {
            crops: selectedLaborerCrops,
            availability: availability,
            will_relocate: willRelocate,
            wage_expectation: wageExpectation,
            bio: laborerBio,
            languages: laborerLanguages,
            work_types: preferredWorkTypes
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
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
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        
        <main className="flex-1 bg-gray-50 py-8 px-4">
          {!selectedRole && !userRole ? (
            <RoleSelection onSelectRole={handleRoleSelection} />
          ) : (
            <div className="container mx-auto max-w-3xl">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">
                  Complete Your {(selectedRole || userRole) === 'laborer' ? 'Laborer' : 'Farmer'} Profile
                </h1>
                
                {(selectedRole || userRole) === 'laborer' ? (
                  <LaborerProfileForm
                    user={user}
                    isSubmitting={isSubmitting}
                    onSubmit={handleLaborerSubmit}
                    laborerPhone={laborerPhone}
                    setLaborerPhone={setLaborerPhone}
                    laborerLocation={laborerLocation}
                    setLaborerLocation={setLaborerLocation}
                    experience={experience}
                    setExperience={setExperience}
                    selectedLaborerCrops={selectedLaborerCrops}
                    handleLaborerCropToggle={handleLaborerCropToggle}
                    availability={availability}
                    setAvailability={setAvailability}
                    willRelocate={willRelocate}
                    setWillRelocate={setWillRelocate}
                    wageExpectation={wageExpectation}
                    setWageExpectation={setWageExpectation}
                    laborerBio={laborerBio}
                    setLaborerBio={setLaborerBio}
                    laborerLanguages={laborerLanguages}
                    handleLanguageToggle={handleLanguageToggle}
                    preferredWorkTypes={preferredWorkTypes}
                    handleWorkTypeToggle={handleWorkTypeToggle}
                  />
                ) : (
                  <FarmerProfileForm
                    user={user}
                    isSubmitting={isSubmitting}
                    onSubmit={handleFarmerSubmit}
                    farmerPhone={farmerPhone}
                    setFarmerPhone={setFarmerPhone}
                    farmerLocation={farmerLocation}
                    setFarmerLocation={setFarmerLocation}
                    farmSize={farmSize}
                    setFarmSize={setFarmSize}
                    farmingType={farmingType}
                    setFarmingType={setFarmingType}
                    selectedFarmerCrops={selectedFarmerCrops}
                    handleFarmerCropToggle={handleFarmerCropToggle}
                    farmerBio={farmerBio}
                    setFarmerBio={setFarmerBio}
                    farmerLanguages={farmerLanguages}
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
