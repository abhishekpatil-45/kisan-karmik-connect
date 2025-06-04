import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2, User, MapPin, Phone, Calendar, PencilIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FarmerProfileForm from '@/components/profile/FarmerProfileForm';
import LaborerProfileForm from '@/components/profile/LaborerProfileForm';
import { useProfileData } from '@/hooks/useProfileData';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get profile data from custom hook
  const profileHookData = useProfileData(profileData?.role);

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
            if (data.skills) {
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
            if (data.skills) {
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

  const handleFarmerSubmit = async (e: React.FormEvent) => {
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

  const handleLaborerSubmit = async (e: React.FormEvent) => {
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <main className="flex-1 bg-gray-50 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!profileData) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <main className="flex-1 bg-gray-50 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">Profile not found</p>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const isOwnProfile = !id || id === user?.id;

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        
        <main className="flex-1 bg-gray-50 py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Edit {profileData.role === 'farmer' ? 'Farmer' : 'Laborer'} Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profileData.role === 'farmer' ? (
                    <FarmerProfileForm
                      user={user}
                      isSubmitting={isSubmitting}
                      onSubmit={handleFarmerSubmit}
                      farmerPhone={profileHookData.farmerPhone}
                      setFarmerPhone={profileHookData.setFarmerPhone}
                      farmerLocation={profileHookData.farmerLocation}
                      setFarmerLocation={profileHookData.setFarmerLocation}
                      farmSize={profileHookData.farmSize}
                      setFarmSize={profileHookData.setFarmSize}
                      farmingType={profileHookData.farmingType}
                      setFarmingType={profileHookData.setFarmingType}
                      selectedFarmerCrops={profileHookData.selectedFarmerCrops}
                      handleFarmerCropToggle={profileHookData.handleFarmerCropToggle}
                      farmerBio={profileHookData.farmerBio}
                      setFarmerBio={profileHookData.setFarmerBio}
                      farmerLanguages={profileHookData.farmerLanguages}
                      handleLanguageToggle={profileHookData.handleLanguageToggle}
                    />
                  ) : (
                    <LaborerProfileForm
                      user={user}
                      isSubmitting={isSubmitting}
                      onSubmit={handleLaborerSubmit}
                      laborerPhone={profileHookData.laborerPhone}
                      setLaborerPhone={profileHookData.setLaborerPhone}
                      laborerLocation={profileHookData.laborerLocation}
                      setLaborerLocation={profileHookData.setLaborerLocation}
                      experience={profileHookData.experience}
                      setExperience={profileHookData.setExperience}
                      selectedLaborerCrops={profileHookData.selectedLaborerCrops}
                      handleLaborerCropToggle={profileHookData.handleLaborerCropToggle}
                      availability={profileHookData.availability}
                      setAvailability={profileHookData.setAvailability}
                      willRelocate={profileHookData.willRelocate}
                      setWillRelocate={profileHookData.setWillRelocate}
                      wageExpectation={profileHookData.wageExpectation}
                      setWageExpectation={profileHookData.setWageExpectation}
                      laborerBio={profileHookData.laborerBio}
                      setLaborerBio={profileHookData.setLaborerBio}
                      laborerLanguages={profileHookData.laborerLanguages}
                      handleLanguageToggle={profileHookData.handleLanguageToggle}
                      preferredWorkTypes={profileHookData.preferredWorkTypes}
                      handleWorkTypeToggle={profileHookData.handleWorkTypeToggle}
                    />
                  )}
                  
                  <div className="flex justify-end space-x-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {profileData.full_name || 'User Profile'}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {profileData.role === 'farmer' ? 'Farmer' : 'Laborer'}
                        </Badge>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileData.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                    
                    {profileData.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    
                    {profileData.experience && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{profileData.experience} years experience</span>
                      </div>
                    )}
                  </div>

                  {/* Skills and Crops */}
                  {profileData.skills && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {profileData.role === 'farmer' ? 'Crops Grown' : 'Crop Experience'}
                      </h3>
                      {profileData.skills.crops && Array.isArray(profileData.skills.crops) && (
                        <div className="flex flex-wrap gap-2">
                          {profileData.skills.crops.map((crop: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {profileData.skills?.bio && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">About</h3>
                      <p className="text-gray-700">{profileData.skills.bio}</p>
                    </div>
                  )}

                  {/* Role-specific information */}
                  {profileData.role === 'farmer' && profileData.skills && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.skills.farm_size && (
                        <div>
                          <h4 className="font-medium">Farm Size</h4>
                          <p className="text-gray-600">{profileData.skills.farm_size} acres</p>
                        </div>
                      )}
                      {profileData.skills.farming_type && (
                        <div>
                          <h4 className="font-medium">Farming Type</h4>
                          <p className="text-gray-600">{profileData.skills.farming_type}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {profileData.role === 'laborer' && profileData.skills && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.skills.availability && (
                        <div>
                          <h4 className="font-medium">Availability</h4>
                          <p className="text-gray-600">{profileData.skills.availability}</p>
                        </div>
                      )}
                      {profileData.skills.wage_expectation && (
                        <div>
                          <h4 className="font-medium">Wage Expectation</h4>
                          <p className="text-gray-600">{profileData.skills.wage_expectation}</p>
                        </div>
                      )}
                      {profileData.skills.will_relocate !== undefined && (
                        <div>
                          <h4 className="font-medium">Willing to Relocate</h4>
                          <p className="text-gray-600">{profileData.skills.will_relocate ? 'Yes' : 'No'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;