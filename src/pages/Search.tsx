
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
import { crops } from '@/data/crops';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const Search = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTarget, setSearchTarget] = useState<'laborers' | 'farmers'>('laborers');
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    crop: '',
    category: '',
    season: '',
    distance: 50,
    experience: 0
  });
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch search results when filters change
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call our enhanced search function
        const { data, error } = await supabase.functions.invoke('enhance-search', {
          body: {
            filters: searchFilters,
            searchTarget
          }
        });

        if (error) {
          throw new Error(error.message);
        }
        
        console.log('Search results:', data);
        
        // If we have data, process it
        if (data && data.data) {
          // Transform the data to match our ProfileCard component expectations
          const processedResults = data.data.map(profile => ({
            id: profile.id,
            name: profile.full_name || 'Unnamed User',
            location: profile.location || 'Unknown Location',
            // Using a placeholder image for now - in production, you'd have a user_avatar field
            image: `/avatars/${searchTarget === 'laborers' ? 'laborer' : 'farmer'}${Math.floor(Math.random() * 5) + 1}.jpg`,
            rating: Math.floor(Math.random() * 5) + 1, // Placeholder rating
            skills: profile.skills ? JSON.parse(profile.skills) : [],
            crops: profile.crops ? JSON.parse(profile.crops) : [],
            experience: profile.experience || 0
          }));
          
          setFilteredResults(processedResults);
        } else {
          setFilteredResults([]);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch results. Please try again later.');
        toast({
          title: "Search Error",
          description: "There was a problem with your search. Please try again.",
          variant: "destructive",
        });
        
        // Fall back to mock data if API fails
        import('@/data/mockData').then(({ farmers, laborers }) => {
          const mockData = searchTarget === 'laborers' ? laborers : farmers;
          setFilteredResults(mockData);
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have at least basic filter criteria
    fetchResults();
  }, [searchFilters, searchTarget, toast]);
  
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
    console.log('Searching with filters:', filters);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold mb-6">Find the Perfect Match</h1>
            
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
            
            <SearchFilters onSearch={handleSearch} />
          </div>
          
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {isLoading ? 'Searching...' : `${filteredResults.length} ${searchTarget} found`}
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
                onClick={() => handleSearch(searchFilters)}
              >
                Try Again
              </Button>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map(profile => {
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
