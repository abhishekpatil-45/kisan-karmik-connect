
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SearchFilters from '@/components/SearchFilters';
import JobCard from '@/components/JobCard';
import { Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type JobPost = {
  id: string;
  title: string;
  description: string | null;
  farmer_id: string;
  crop_category: string | null;
  labor_type: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  pay_rate: number | null;
  pay_type: string | null;
  status: string | null;
  created_at: string;
  farmer: {
    id: string;
    full_name: string | null;
    phone: string | null;
    location: string | null;
  } | null;
};

const Jobs = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [userLocation, setUserLocation] = useState<string>('');
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    crop: searchParams.get('crop') || 'all-crops',
    category: searchParams.get('category') || '',
    season: searchParams.get('season') || '',
    distance: 50,
    experience: 0,
    location: searchParams.get('location') || '',
  });

  useEffect(() => {
    fetchUserLocation();
    fetchJobs(filters);
  }, []);

  const fetchUserLocation = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      if (data?.location) {
        setUserLocation(data.location);
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  };

  const fetchJobs = async (searchFilters: any) => {
    setIsLoading(true);

    try {
      const { keyword, crop, location } = searchFilters;
      
      let query = supabase
        .from('jobs')
        .select(`
          *,
          farmer:farmer_id (
            id,
            full_name,
            phone,
            location
          )
        `)
        .eq('status', 'open');
      
      if (crop && crop !== 'all-crops') {
        query = query.eq('crop_category', crop);
      }
      
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      
      if (keyword) {
        query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch jobs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({
      ...filters,
      ...newFilters
    });
    fetchJobs(newFilters);
  };

  const findJobsNearMe = () => {
    if (!userLocation) {
      toast({
        title: 'Location not set',
        description: 'Please update your profile with your location to use this feature.',
        variant: 'destructive',
      });
      return;
    }

    const newFilters = {
      ...filters,
      location: userLocation
    };
    setFilters(newFilters);
    fetchJobs(newFilters);
    
    toast({
      title: 'Searching near you',
      description: `Finding jobs in ${userLocation}`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">Find Agricultural Jobs</h1>
            {userLocation && (
              <Button 
                onClick={findJobsNearMe}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Find Jobs Near Me
              </Button>
            )}
          </div>
          <SearchFilters 
            onSearch={handleFilterChange} 
            initialFilters={filters}
            targetRole="farmer"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="col-span-full bg-gray-50 p-8 text-center rounded-lg">
              <h3 className="text-xl font-medium text-gray-700">No jobs found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
            </div>
          ) : (
            jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Jobs;
