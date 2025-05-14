
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, MapPin, Phone, User, Calendar, Briefcase, Award } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!profileId) {
          setError("No profile ID provided");
          setLoading(false);
          return;
        }
        
        // Fetch basic profile information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (!profileData) {
          throw new Error("Profile not found");
        }
        
        // Set the profile data
        setProfile(profileData);
        
        // Here you would fetch additional profile data from other tables if needed
        // Such as farmer_details or laborer_details
        
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [profileId]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="flex flex-col w-full">
          <NavBar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile...</span>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="flex min-h-screen">
        <div className="flex flex-col w-full">
          <NavBar />
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h2 className="text-xl font-bold text-center">Profile Not Found</h2>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <p className="text-gray-600 mb-4 text-center">
                  {error || "The requested profile could not be found."}
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col w-full">
        <NavBar />
        
        <main className="flex-1 bg-gray-50 py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`h-24 ${profile.role === 'farmer' ? 'bg-primary-500' : 'bg-accent-500'}`}>
                {isOwnProfile && (
                  <div className="flex justify-end p-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => navigate('/profile-setup')}
                      className="bg-white"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                      <User className="h-12 w-12 text-gray-500" />
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4 md:mb-2">
                    <h1 className="text-2xl font-bold">{profile.full_name || "Name not provided"}</h1>
                    <div className="text-gray-600 capitalize">{profile.role}</div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                      
                      {profile.location && (
                        <div className="flex items-start mb-3">
                          <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                          <div>
                            <div className="font-medium">Location</div>
                            <div className="text-gray-600">{profile.location}</div>
                          </div>
                        </div>
                      )}
                      
                      {profile.phone && (
                        <div className="flex items-start mb-3">
                          <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                          <div>
                            <div className="font-medium">Phone</div>
                            <div className="text-gray-600">{profile.phone}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start mb-3">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <div className="font-medium">Member Since</div>
                          <div className="text-gray-600">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-4">
                        {profile.role === 'farmer' ? 'Farm Information' : 'Work Information'}
                      </h2>
                      
                      {profile.role === 'farmer' ? (
                        // Farmer specific information would go here
                        <p className="text-gray-600">
                          Additional farm details will be displayed here once available.
                        </p>
                      ) : (
                        // Laborer specific information would go here
                        <p className="text-gray-600">
                          Additional work details will be displayed here once available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

const ProtectedProfilePage = () => {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
};

export default ProtectedProfilePage;
