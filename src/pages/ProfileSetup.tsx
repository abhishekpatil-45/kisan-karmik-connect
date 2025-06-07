import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { useProfileData } from '@/hooks/useProfileData';
import FarmerProfileForm from '@/components/profile/FarmerProfileForm';
import LaborerProfileForm from '@/components/profile/LaborerProfileForm';

const ProfileSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Extract role from URL params
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get profile data from custom hook
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
  } = useProfileData(roleParam);

  const handleFarmerCropToggle = (cropId: string) => {
    const newCrops = selectedFarmerCrops.includes(cropId) 
      ? selectedFarmerCrops.filter(id => id !== cropId)
      : [...selectedFarmerCrops, cropId];
    setSelectedFarmerCrops(newCrops);
  };

  const handleLaborerCropToggle = (cropId: string) => {
    const newCrops = selectedLaborerCrops.includes(cropId) 
      ? selectedLaborerCrops.filter(id => id !== cropId)
      : [...selectedLaborerCrops, cropId];
    setSelectedLaborerCrops(newCrops);
  };

  const handleLanguageToggle = (languageId: string, isLaborer: boolean) => {
    if (isLaborer) {
      const newLanguages = laborerLanguages.includes(languageId) 
        ? laborerLanguages.filter(id => id !== languageId)
        : [...laborerLanguages, languageId];
      setLaborerLanguages(newLanguages);
    } else {
      const newLanguages = farmerLanguages.includes(languageId) 
        ? farmerLanguages.filter(id => id !== languageId)
        : [...farmerLanguages, languageId];
      setFarmerLanguages(newLanguages);
    }
  };

  const handleWorkTypeToggle = (typeId: string) => {
    const newTypes = preferredWorkTypes.includes(typeId) 
      ? preferredWorkTypes.filter(id => id !== typeId)
      : [...preferredWorkTypes, typeId];
    setPreferredWorkTypes(newTypes);
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
        title: "Profile updated!",
        description: "Your farmer profile is now complete.",
      });
      
      navigate('/dashboard');
      
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
        title: "Profile updated!",
        description: "Your laborer profile is now complete.",
      });
      
      navigate('/dashboard');
      
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
        <span className="ml-2">Loading your profile...</span>
      </div>
    );
  }

  // Determine if we're showing farmer or laborer form
  const isLaborer = userRole === 'laborer';

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        
        <main className="flex-1 bg-gray-50 py-8 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-6">
                Complete Your {isLaborer ? 'Laborer' : 'Farmer'} Profile
              </h1>
              
              {isLaborer ? (
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
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default ProfileSetup;
