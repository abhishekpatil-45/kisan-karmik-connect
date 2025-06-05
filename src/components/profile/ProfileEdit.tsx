
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FarmerProfileForm from '@/components/profile/FarmerProfileForm';
import LaborerProfileForm from '@/components/profile/LaborerProfileForm';

interface ProfileEditProps {
  profileData: any;
  user: any;
  isSubmitting: boolean;
  profileHookData: any;
  onFarmerSubmit: (e: React.FormEvent) => void;
  onLaborerSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  handleFarmerLanguageToggle: (languageId: string, isLaborer: boolean) => void;
  handleLaborerLanguageToggle: (languageId: string, isLaborer: boolean) => void;
}

const ProfileEdit = ({
  profileData,
  user,
  isSubmitting,
  profileHookData,
  onFarmerSubmit,
  onLaborerSubmit,
  onCancel,
  handleFarmerLanguageToggle,
  handleLaborerLanguageToggle
}: ProfileEditProps) => {
  return (
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
            onSubmit={onFarmerSubmit}
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
            handleLanguageToggle={handleFarmerLanguageToggle}
          />
        ) : (
          <LaborerProfileForm
            user={user}
            isSubmitting={isSubmitting}
            onSubmit={onLaborerSubmit}
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
            handleLanguageToggle={handleLaborerLanguageToggle}
            preferredWorkTypes={profileHookData.preferredWorkTypes}
            handleWorkTypeToggle={profileHookData.handleWorkTypeToggle}
          />
        )}
        
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEdit;
