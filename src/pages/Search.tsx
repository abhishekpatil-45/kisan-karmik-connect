import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SearchFilters from '@/components/SearchFilters';
import ProfileCard from '@/components/ProfileCard';
import { useToast } from '@/hooks/use-toast';
import { Filter, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Constants } from '@/integrations/supabase/types';

interface Profile {
  id: string;
  full_name: string | null;
  location: string | null;
  role: string;
  skills: string[] | null;
  experience: number | null;
  rating: number | null;
}

interface SearchResult {
  id: string;
  name: string;
  location: string;
  image: string;
  role: 'laborer' | 'farmer';
  skills?: string[];
  crops?: string[];
  rating: number;
  experience?: number;
}

const Search = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'farmer' | 'laborer' | null>(null);
  const [searchTarget, setSearchTarget] = useState<'laborers' | 'farmers'>('laborers');
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    crop: '',
    category: '',
    season: '',
    distance: 50,
    experience: 0,
    location: '',
    preferred_work_type: 'any-work-type'
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user's role when component mounts
  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);
  
  // Set search target based on user's role
  useEffect(() => {
    if (userRole === 'farmer') {
      setSearchTarget('laborers');
    } else if (userRole === 'laborer') {
      setSearchTarget('farmers');
    }
  }, [userRole]);
  
  // Fetch search results when filters change or search target changes
  useEffect(() => {
    if (searchTarget) {
      performSearch();
    }
  }, [searchFilters, searchTarget]);
  
  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data && (data.role === 'farmer' || data.role === 'laborer')) {
        setUserRole(data.role);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  };
  
  const performSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const role = searchTarget === 'laborers' ? 'laborer' : 'farmer';
      
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', role);
      
      // Apply filters
      if (searchFilters.keyword) {
        query = query.or(`full_name.ilike.%${searchFilters.keyword}%,location.ilike.%${searchFilters.keyword}%`);
      }
      
      if (searchFilters.location) {
        query = query.ilike('location', `%${searchFilters.location}%`);
      }
      
      // For crop based searches, only apply if it's not the "all-crops" value
      if (searchFilters.crop && searchFilters.crop !== 'all-crops') {
        // Adjust this query based on how crops are stored in your database
        // This is a simplified example
        query = query.contains('skills', [searchFilters.crop]);
      }
      
      // For work type based searches, only apply if it's not the "any-work-type" value
      if (searchFilters.preferred_work_type && searchFilters.preferred_work_type !== 'any-work-type') {
        query = query.eq('preferred_work_type', searchFilters.preferred_work_type);
      }
      
      if (searchFilters.experience > 0) {
        query = query.gte('experience', searchFilters.experience);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our SearchResult interface
      const processed: SearchResult[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unnamed User',
        location: profile.location || 'Unknown Location',
        image: `/avatars/${role}${Math.floor(Math.random() * 5) + 1}.jpg`,
        role: role as 'farmer' | 'laborer',
        skills: role === 'laborer' ? (profile.skills as string[] || []) : undefined,
        crops: role === 'farmer' ? (profile.skills as string[] || []) : undefined,
        rating: profile.rating || 0,
        experience: role === 'laborer' ? profile.experience : undefined
      }));
      
      setSearchResults(processed);
    } catch (err) {
      console.error('Error performing search:', err);
      setError('Failed to perform search. Please try again.');
      toast({
        title: "Search Error",
        description: "There was a problem with your search. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
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
    toast({
      title: "Message sent",
      description: "Your message has been sent.",
    });
  };
  
  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold mb-6">Find the Perfect Match</h1>
            
            {user && userRole ? (
              <div className="mb-6">
                <p className="mb-2">You are searching as a {userRole}:</p>
                <RadioGroup 
                  value={searchTarget} 
                  onValueChange={(value) => setSearchTarget(value as 'laborers' | 'farmers')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="laborers" id="laborers" />
                    <Label htmlFor="laborers">Find Laborers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="farmers" id="farmers" />
                    <Label htmlFor="farmers">Find Farmers</Label>
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <div className="mb-6">
                <RadioGroup 
                  value={searchTarget} 
                  onValueChange={(value) => setSearchTarget(value as 'laborers' | 'farmers')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="laborers" id="laborers" />
                    <Label htmlFor="laborers">Find Laborers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="farmers" id="farmers" />
                    <Label htmlFor="farmers">Find Farmers</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            <SearchFilters onSearch={handleSearch} />
          </div>
          
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {isLoading ? 'Searching...' : `${searchResults.length} ${searchTarget} found`}
            </h2>
            <Button variant="outline" size="sm" disabled>
              <Settings size={16} className="mr-2" /> Advanced Filters
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-3 text-xl text-gray-600">Searching for matches...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="text-red-500 mb-4">
                <Filter size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Error fetching results</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => performSearch()}
              >
                Try Again
              </Button>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map(profile => {
                // Determine skills or crops based on search target
                const skills = searchTarget === 'laborers' ? profile.skills : undefined;
                const crops = searchTarget === 'farmers' ? profile.crops : undefined;
                const experience = searchTarget === 'laborers' ? profile.experience : undefined;
                
                return (
                  <ProfileCard
                    key={profile.id}
                    name={profile.name}
                    location={profile.location}
                    image={profile.image}
                    role={searchTarget === 'laborers' ? 'laborer' : 'farmer'}
                    skills={skills}
                    crops={crops}
                    rating={profile.rating}
                    experience={experience}
                    onConnect={() => handleConnect(profile.id)}
                    onMessage={() => handleMessage(profile.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="text-gray-400 mb-4">
                <Filter size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
