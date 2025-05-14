
import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SearchFilters from '@/components/SearchFilters';
import ProfileCard from '@/components/ProfileCard';
import { useToast } from '@/hooks/use-toast';
import { farmers, laborers, Farmer, Laborer } from '@/data/mockData';
import { Filter, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';

const Search = () => {
  const { toast } = useToast();
  const [searchTarget, setSearchTarget] = useState<'laborers' | 'farmers'>('laborers');
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    crop: '',
    distance: 50,
    experience: 0
  });
  
  // Based on filters, get filtered results
  const getFilteredResults = () => {
    const data = searchTarget === 'laborers' ? laborers : farmers;
    
    return data.filter(item => {
      // Apply keyword filter to name and location
      if (searchFilters.keyword && 
          !item.name.toLowerCase().includes(searchFilters.keyword.toLowerCase()) && 
          !item.location.toLowerCase().includes(searchFilters.keyword.toLowerCase())) {
        return false;
      }
      
      // Apply crop filter
      if (searchFilters.crop) {
        const cropFields = searchTarget === 'laborers' 
          ? (item as Laborer).skills 
          : (item as Farmer).crops;
        if (!cropFields.includes(searchFilters.crop)) {
          return false;
        }
      }
      
      // Apply experience filter for laborers
      if (searchTarget === 'laborers' && searchFilters.experience > 0) {
        if ((item as Laborer).experience < searchFilters.experience) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  const filteredResults = getFilteredResults();
  
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
              {filteredResults.length} {searchTarget} found
            </h2>
            <Button variant="outline" size="sm" disabled>
              <Settings size={16} className="mr-2" /> Advanced Filters
            </Button>
          </div>
          
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map(profile => {
                // Determine skills or crops based on search target
                const skills = searchTarget === 'laborers' ? (profile as Laborer).skills : undefined;
                const crops = searchTarget === 'farmers' ? (profile as Farmer).crops : undefined;
                const experience = searchTarget === 'laborers' ? (profile as Laborer).experience : undefined;
                
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
