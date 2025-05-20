
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SearchFilters from '@/components/SearchFilters';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Phone, MapPin, Briefcase, Clock, Calendar } from 'lucide-react';

// Type definitions
type SearchResult = {
  id: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  location: string | null;
  experience: number | null;
  created_at: string;
  updated_at: string;
  skills: any;
};

const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    crop: 'all-crops',
    category: '',
    season: '',
    distance: 50,
    experience: 0,
    location: '',
    preferred_work_type: 'any-work-type'
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setShowRoleSelector(true);
    }
  }, [user]);
  
  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setUserRole(data.role);
    } catch (err) {
      console.error('Error fetching user role:', err);
      setShowRoleSelector(true);
    }
  };
  
  const searchTargetRole = userRole === 'farmer' ? 'laborer' : 'farmer';
  
  const handleSearch = async (filters: any) => {
    setSearchFilters(filters);
    setIsLoading(true);
    
    try {
      // Determine search target based on user role
      const targetRole = userRole === 'farmer' ? 'laborer' : 'farmer';
      
      // Basic query to get user profiles of the target role
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', targetRole);
      
      // Apply filters
      if (filters.keyword) {
        query = query.or(`full_name.ilike.%${filters.keyword}%,skills->bio.ilike.%${filters.keyword}%`);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      // For crop based searches, only apply if it's not the "all-crops" value
      if (filters.crop && filters.crop !== 'all-crops') {
        // Using containment operator for JSONB array
        query = query.contains('skills', { crops: [filters.crop] });
      }
      
      // For work type based searches, only apply if it's not the "any-work-type" value
      if (filters.preferred_work_type && filters.preferred_work_type !== 'any-work-type') {
        // Using containment operator for JSONB array
        query = query.contains('skills', { work_types: [filters.preferred_work_type.toLowerCase()] });
      }
      
      if (filters.experience && filters.experience > 0) {
        query = query.gte('experience', filters.experience);
      }
      
      if (filters.can_relocate === true) {
        query = query.eq('skills->>will_relocate', 'true');
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };
  
  const getCropNames = (skills: any) => {
    if (!skills || !skills.crops || !Array.isArray(skills.crops)) return 'N/A';
    
    return skills.crops.slice(0, 3).map((cropId: string) => {
      const crop = cropId;
      return crop;
    }).join(', ') + (skills.crops.length > 3 ? '...' : '');
  };

  const getWorkTypes = (skills: any) => {
    if (!skills || !skills.work_types || !Array.isArray(skills.work_types)) return 'N/A';
    
    return skills.work_types.slice(0, 2).map((type: string) => {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }).join(', ') + (skills.work_types.length > 2 ? '...' : '');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Find {searchTargetRole === 'laborer' ? 'Farm Workers' : 'Farmer Jobs'}
          </h1>
          <p className="text-gray-600 mb-6">
            {searchTargetRole === 'laborer' 
              ? 'Search for skilled agricultural laborers based on crops, location, and more.'
              : 'Find farming opportunities and connect with local farmers.'
            }
          </p>
          
          <SearchFilters 
            onSearch={handleSearch}
            targetRole={searchTargetRole}
            initialFilters={searchFilters}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Searching...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="col-span-full bg-gray-50 p-8 text-center rounded-lg">
              <h3 className="text-xl font-medium text-gray-700">No results found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
            </div>
          ) : (
            <>
              {searchResults.map(result => (
                <Card key={result.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/avatars/${result.role}${Math.floor(Math.random() * 5) + 1}.jpg`} alt={result.full_name || ''} />
                        <AvatarFallback>{(result.full_name || '?').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{result.full_name || 'Anonymous User'}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                            {result.location || 'Location not specified'}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    {result.role === 'laborer' ? (
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="mr-1 text-gray-700">Experience:</span>
                          <span>{result.experience || 0} years</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="mr-1 text-gray-700">Crops:</span>
                          <span>{getCropNames(result.skills)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="mr-1 text-gray-700">Work Type:</span>
                          <span>{getWorkTypes(result.skills)}</span>
                        </div>
                        
                        {result.skills?.will_relocate && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-2">
                            ✓ Can Relocate
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="mr-1 text-gray-700">Crops:</span>
                          <span>{getCropNames(result.skills)}</span>
                        </div>
                        
                        {result.skills?.farming_type && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {result.skills.farming_type} farming
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    <Button onClick={() => handleViewProfile(result.id)} className="w-full">
                      View Profile
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
