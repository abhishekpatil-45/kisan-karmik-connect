
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ProfileCard from '@/components/ProfileCard';
import { useToast } from '@/hooks/use-toast';
import { farmers, laborers } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { 
  Bell, 
  MessageCircle, 
  User, 
  Users, 
  CalendarCheck 
} from 'lucide-react';

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  // In a real app, we would get the user role from authentication
  const [userRole] = useState<'farmer' | 'laborer'>('farmer');
  
  // Mock data based on user role
  const recommendedProfiles = userRole === 'farmer' ? laborers : farmers;
  
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Dashboard Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {userRole === 'farmer' ? 'Rajesh' : 'Venkatesh'}</h1>
            <p className="text-gray-600">
              {userRole === 'farmer'
                ? 'Here are some skilled laborers who match your crop requirements.'
                : 'Here are farmers looking for your expertise.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Recommendations */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Recommended {userRole === 'farmer' ? 'Laborers' : 'Farmers'}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedProfiles.slice(0, 4).map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      name={profile.name}
                      location={profile.location}
                      image={profile.image}
                      role={userRole === 'farmer' ? 'laborer' : 'farmer'}
                      skills={userRole === 'farmer' ? profile.skills : undefined}
                      crops={userRole === 'farmer' ? undefined : profile.crops}
                      rating={profile.rating}
                      experience={userRole === 'farmer' ? profile.experience : undefined}
                      onConnect={() => handleConnect(profile.id)}
                      onMessage={() => handleMessage(profile.id)}
                    />
                  ))}
                </div>
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
                      <p className="font-medium">New connection request</p>
                      <p className="text-sm text-gray-600">Lakshmi N. sent you a connection request.</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50">
                    <div className="bg-green-100 p-2 rounded-full">
                      <MessageCircle size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">New message</p>
                      <p className="text-sm text-gray-600">Abdul K. sent you a message.</p>
                      <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <CalendarCheck size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Work completed</p>
                      <p className="text-sm text-gray-600">You marked your work with Ramesh B. as complete.</p>
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
                      src={userRole === 'farmer' ? '/avatars/farmer1.jpg' : '/avatars/laborer1.jpg'} 
                      alt="Profile" 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{userRole === 'farmer' ? 'Rajesh Kumar' : 'Venkatesh K.'}</h3>
                    <p className="text-sm text-gray-600">{userRole === 'farmer' ? 'Farmer' : 'Agricultural Laborer'}</p>
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
                
                <div className="flex -space-x-2 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img 
                      key={i}
                      src={`/avatars/${userRole === 'farmer' ? 'laborer' : 'farmer'}${i}.jpg`} 
                      alt={`Connection ${i}`}
                      className="h-8 w-8 rounded-full border-2 border-white"
                    />
                  ))}
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-xs font-medium text-gray-600 border-2 border-white">
                    +3
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full text-gray-600">
                  Manage connections
                </Button>
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
