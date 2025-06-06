
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfileData } from '@/hooks/useProfileData';
import { useProfileLoader } from '@/hooks/useProfileLoader';
import { useProfileActions } from '@/hooks/useProfileActions';
import ProfileView from '@/components/profile/ProfileView';
import ProfileEdit from '@/components/profile/ProfileEdit';
import JobHistoryTab from '@/components/JobHistoryTab';
import SuccessStoriesTab from '@/components/SuccessStoriesTab';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Get profile data from custom hook
  const profileHookData = useProfileData(null);

  // Load profile data
  const { profileData, setProfileData, isLoading, error } = useProfileLoader(id, user, profileHookData);

  // Profile actions
  const { isSubmitting, handleFarmerSubmit, handleLaborerSubmit } = useProfileActions(user, setProfileData, setIsEditing);

  const handleFarmerLanguageToggle = (languageId: string, isLaborer: boolean) => {
    profileHookData.handleLanguageToggle(languageId, isLaborer ? 'laborer' : 'farmer');
  };

  const handleLaborerLanguageToggle = (languageId: string, isLaborer: boolean) => {
    profileHookData.handleLanguageToggle(languageId, isLaborer ? 'laborer' : 'farmer');
  };

  const onFarmerSubmit = async (e: React.FormEvent) => await handleFarmerSubmit(e, profileHookData);
  const onLaborerSubmit = async (e: React.FormEvent) => await handleLaborerSubmit(e, profileHookData);

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
            {isOwnProfile ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="history">Job History</TabsTrigger>
                  <TabsTrigger value="success">Success Stories</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  {isEditing ? (
                    <ProfileEdit
                      profileData={profileData}
                      user={user}
                      isSubmitting={isSubmitting}
                      profileHookData={profileHookData}
                      onFarmerSubmit={onFarmerSubmit}
                      onLaborerSubmit={onLaborerSubmit}
                      onCancel={() => setIsEditing(false)}
                      handleFarmerLanguageToggle={handleFarmerLanguageToggle}
                      handleLaborerLanguageToggle={handleLaborerLanguageToggle}
                    />
                  ) : (
                    <ProfileView
                      profileData={profileData}
                      isOwnProfile={isOwnProfile}
                      onEditClick={() => setIsEditing(true)}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardContent className="p-6">
                      <JobHistoryTab />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="success">
                  <Card>
                    <CardContent className="p-6">
                      <SuccessStoriesTab />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <ProfileView
                profileData={profileData}
                isOwnProfile={isOwnProfile}
                onEditClick={() => setIsEditing(true)}
              />
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
