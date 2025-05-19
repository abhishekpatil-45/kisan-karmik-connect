
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ProfileCard from '@/components/ProfileCard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { 
  Bell, 
  MessageCircle, 
  User, 
  Users, 
  CalendarCheck,
  Loader2 
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  location: string | null;
  rating: number | null;
  role: string;
  skills: string[] | Json | null;
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

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedProfiles, setRecommendedProfiles] = useState<RecommendedProfile[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchRecommendedProfiles();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      // Update the userProfile state with type-safe data
      setUserProfile({
        id: data.id,
        full_name: data.full_name,
        location: data.location,
        rating: data.rating,
        role: data.role,
        skills: data.skills,
        experience: data.experience
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchRecommendedProfiles = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data: userProfileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!userProfileData) throw new Error('User profile not found');
      
      const userRole = userProfileData.role;
      
      // Fetch opposite role profiles (farmers fetch laborers, laborers fetch farmers)
      const oppositeRole = userRole === 'farmer' ? 'laborer' : 'farmer';
      
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
        skills: oppositeRole === 'laborer' ? (profile.skills as string[] || []) : undefined,
        crops: oppositeRole === 'farmer' ? (profile.skills as string[] || []) : undefined,
        rating: profile.rating || 0,
        experience: oppositeRole === 'laborer' ? profile.experience : undefined
      }));
      
      setRecommendedProfiles(processed);
    } catch (error) {
      console.error('Error fetching recommended profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load recommended profiles. Please try again.",
        variant: "destructive",
      });
      setRecommendedProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConnect = (id: string) => {
    toast({
      title: "Connection Request Sent",
      description: "They will be notified of your interest.",
    });
  };
  
  const handleMessage = (id: string) => {
    // In a real app, we would redirect to a chat page
    console.log('Message user:', id);
  };
  
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Dashboard Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {userProfile?.full_name || 'User'}
            </h1>
            <p className="text-gray-600">
              {userProfile?.role === 'farmer'
                ? 'Here are some skilled laborers who match your crop requirements.'
                : 'Here are farmers looking for your expertise.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Recommendations */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Recommended {userProfile?.role === 'farmer' ? 'Laborers' : 'Farmers'}
                </h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading recommendations...</span>
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
                    <p className="text-gray-500">No recommendations found. Check back later.</p>
                  </div>
                )}
              </div>
              
              {/* Recent Activity */}
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
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img 
                      src={userProfile?.role === 'farmer' ? '/avatars/farmer1.jpg' : '/avatars/laborer1.jpg'} 
                      alt="Profile" 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{userProfile?.full_name || 'User'}</h3>
                    <p className="text-sm text-gray-600">
                      {userProfile?.role === 'farmer' ? 'Farmer' : 'Agricultural Laborer'}
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
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
