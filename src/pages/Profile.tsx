
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ProfileCard from '@/components/ProfileCard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Loader2, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  Briefcase, 
  Award, 
  Edit,
  Bell,
  MessageCircle,
  Users
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  location: string | null;
  rating: number | null;
  role: string;
  skills: string[] | any | null;
  experience: number | null;
}

interface RecommendedProfile {
  id: string;
  name: string;
  location: string;
  image: string;
  role: 'farmer' | 'laborer';
  skills?: string[];
  crops?: string[];
  rating: number;
  experience?: number;
}

const Profile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedProfiles, setRecommendedProfiles] = useState<RecommendedProfile[]>([]);
  
  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;

  // Function to handle array or JSON data from Supabase
  const getSkillsArray = (skills: any): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

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
        
        // If viewing own profile, fetch recommended profiles
        if (isOwnProfile) {
          fetchRecommendedProfiles(profileData);
        }
        
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
  }, [profileId, isOwnProfile, toast]);
  
  const fetchRecommendedProfiles = async (userProfile: Profile) => {
    if (!user) return;
    
    try {
      // Fetch opposite role profiles (farmers fetch laborers, laborers fetch farmers)
      const oppositeRole = userProfile.role === 'farmer' ? 'laborer' : 'farmer';
      
      // Fetch profiles with opposite role
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', oppositeRole)
        .limit(4);
      
      if (error) throw error;
      
      // Transform data to match the RecommendedProfile interface
      const processed: RecommendedProfile[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unnamed User',
        location: profile.location || 'Unknown Location',
        image: `/avatars/${oppositeRole}${Math.floor(Math.random() * 5) + 1}.jpg`,
        role: oppositeRole as 'farmer' | 'laborer',
        skills: oppositeRole === 'laborer' ? getSkillsArray(profile.skills) : undefined,
        crops: oppositeRole === 'farmer' ? getSkillsArray(profile.skills) : undefined,
        rating: profile.rating || 0,
        experience: oppositeRole === 'laborer' ? profile.experience : undefined
      }));
      
      setRecommendedProfiles(processed);
    } catch (error) {
      console.error('Error fetching recommended profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load recommended profiles.",
        variant: "destructive",
      });
    }
  };
  
  const handleConnect = (id: string) => {
    toast({
      title: "Connection Request Sent",
      description: "They will be notified of your interest.",
    });
  };
  
  const handleMessage = (id: string) => {
    // Redirect to messages page
    navigate('/messages');
  };
  
  // Helper function to render skills/crops
  const renderTagsList = (items: string[] | null) => {
    if (!items || !items.length) return <p className="text-gray-500">None specified</p>;
    
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {items.map((item, index) => (
          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-full">
            {item}
          </span>
        ))}
      </div>
    );
  };
  
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
                <Button onClick={() => navigate('/')}>
                  Return to Homepage
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
        
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {/* Dashboard Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {profile?.full_name || 'User'}
              </h1>
              <p className="text-gray-600">
                {profile?.role === 'farmer'
                  ? 'Here are some skilled laborers who match your crop requirements.'
                  : 'Here are farmers looking for your expertise.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Recommendations */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Recommended {profile?.role === 'farmer' ? 'Laborers' : 'Farmers'}
                  </h2>
                  
                  {!isOwnProfile ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">When viewing another user's profile, recommendations are not displayed.</p>
                    </div>
                  ) : recommendedProfiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendedProfiles.map((profile) => (
                        <ProfileCard
                          key={profile.id}
                          name={profile.name}
                          location={profile.location}
                          image={profile.image}
                          role={profile.role}
                          skills={profile.skills}
                          crops={profile.crops}
                          rating={profile.rating}
                          experience={profile.experience}
                          onConnect={() => handleConnect(profile.id)}
                          onMessage={() => handleMessage(profile.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No recommendations found. Check back later or use the Search feature to find matches.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => fetchRecommendedProfiles(profile)}
                      >
                        Refresh
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Recent Activity - Only show for own profile */}
                {isOwnProfile && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Profile updated</p>
                          <p className="text-sm text-gray-600">Your profile information has been updated.</p>
                          <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50">
                        <div className="bg-green-100 p-2 rounded-full">
                          <MessageCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Message system activated</p>
                          <p className="text-sm text-gray-600">You can now send messages to connections.</p>
                          <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <CalendarCheck size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Account created</p>
                          <p className="text-sm text-gray-600">Welcome to Agrisamadhana!</p>
                          <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar - Show for own profile */}
              {isOwnProfile && (
                <div className="space-y-6">
                  {/* Profile Summary */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <img 
                          src={profile?.role === 'farmer' ? '/avatars/farmer1.jpg' : '/avatars/laborer1.jpg'} 
                          alt="Profile" 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{profile?.full_name || 'User'}</h3>
                        <p className="text-sm text-gray-600">
                          {profile?.role === 'farmer' ? 'Farmer' : 'Agricultural Laborer'}
                        </p>
                      </div>
                    </div>
                    
                    <Link to="/profile">
                      <Button variant="outline" className="w-full mb-2">View Profile</Button>
                    </Link>
                    <Link to="/profile-setup">
                      <Button variant="outline" className="w-full">Edit Profile</Button>
                    </Link>
                  </div>
                  
                  {/* Notifications */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Notifications</h3>
                      <div className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">3 new</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
                        <Bell size={16} className="text-primary-600" />
                        <p className="text-sm">New connection request</p>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
                        <Bell size={16} className="text-primary-600" />
                        <p className="text-sm">New message received</p>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
                        <Bell size={16} className="text-primary-600" />
                        <p className="text-sm">Profile view notification</p>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="w-full mt-3 text-gray-600">
                      View all notifications
                    </Button>
                  </div>
                  
                  {/* Connections */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Your Connections</h3>
                      <Users size={16} className="text-gray-600" />
                    </div>
                    
                    {recommendedProfiles.length > 0 ? (
                      <>
                        <div className="flex -space-x-2 mb-3">
                          {recommendedProfiles.slice(0, Math.min(5, recommendedProfiles.length)).map((profile, i) => (
                            <img 
                              key={i}
                              src={profile.image} 
                              alt={`Connection ${i+1}`}
                              className="h-8 w-8 rounded-full border-2 border-white"
                            />
                          ))}
                          {recommendedProfiles.length > 5 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-xs font-medium text-gray-600 border-2 border-white">
                              +{recommendedProfiles.length - 5}
                            </div>
                          )}
                        </div>
                        
                        <Button variant="ghost" size="sm" className="w-full text-gray-600">
                          Manage connections
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 mb-3">No connections yet.</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Detailed profile information (for both own and others' profiles) */}
              {!isOwnProfile && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                  
                  <div className="space-y-4">
                    {profile.location && (
                      <div className="flex items-start mb-3">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <div className="font-medium">Location</div>
                          <div className="text-gray-600">{profile.location}</div>
                        </div>
                      </div>
                    )}
                    
                    {profile.role === 'farmer' ? (
                      <>
                        <div className="flex items-start mb-3">
                          <Briefcase className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                          <div>
                            <div className="font-medium">Crops Grown</div>
                            {renderTagsList(getSkillsArray(profile.skills))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {profile.experience != null && (
                          <div className="flex items-start mb-3">
                            <Award className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                            <div>
                              <div className="font-medium">Experience</div>
                              <div className="text-gray-600">{profile.experience} years</div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start mb-3">
                          <Briefcase className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                          <div>
                            <div className="font-medium">Skills</div>
                            {renderTagsList(getSkillsArray(profile.skills))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="flex space-x-2 mt-4">
                      <Button variant="default" className="w-full" onClick={() => handleConnect(profile.id)}>
                        Connect
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => handleMessage(profile.id)}>
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
