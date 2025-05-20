import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Filter, Search, Loader2, Calendar, MapPin, DollarSign, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import SearchFilters from '@/components/SearchFilters';
import { useAuth } from '@/context/AuthContext';
import { Constants } from '@/integrations/supabase/types';

// Get the valid crop categories and labor types from Supabase types
const validCropCategories = Constants.public.Enums.crop_category;
const validLaborTypes = Constants.public.Enums.labor_type;

interface Job {
  id: string;
  title: string;
  description: string;
  crop_category: string;
  labor_type: string;
  location: string;
  start_date: string;
  end_date: string | null;
  pay_rate: number | null;
  pay_type: string | null;
  status: string;
  farmer_id: string;
  farmer_name?: string;
  farmer_rating?: number;
}

const Jobs = () => {
  const { toast } = useToast();
  const location = useLocation();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = new URLSearchParams(location.search);
  const cropFilter = searchParams.get('crop') || '';
  const laborTypeFilter = searchParams.get('laborType') || '';
  
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    crop: cropFilter,
    cropName: cropFilter,
    category: '',
    location: '',
    distance: 50,
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [cropFilter, laborTypeFilter, searchFilters]);

  // Helper function to validate crop category against allowed values
  const isValidCropCategory = (crop: string): crop is typeof validCropCategories[number] => {
    return validCropCategories.includes(crop as any);
  };

  // Helper function to validate labor type against allowed values
  const isValidLaborType = (labor: string): labor is typeof validLaborTypes[number] => {
    return validLaborTypes.includes(labor as any);
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          profiles:farmer_id (full_name, rating)
        `)
        .eq('status', 'open');
      
      // Apply filters
      if (cropFilter && isValidCropCategory(cropFilter) && cropFilter !== 'all-crops') {
        query = query.eq('crop_category', cropFilter);
      }
      
      if (laborTypeFilter && isValidLaborType(laborTypeFilter) && laborTypeFilter !== 'any-work-type') {
        query = query.eq('labor_type', laborTypeFilter);
      }
      
      if (searchFilters.keyword) {
        query = query.or(`title.ilike.%${searchFilters.keyword}%,description.ilike.%${searchFilters.keyword}%`);
      }
      
      if (searchFilters.location) {
        query = query.ilike('location', `%${searchFilters.location}%`);
      }
      
      if (searchFilters.dateFrom) {
        query = query.gte('start_date', searchFilters.dateFrom);
      }
      
      if (searchFilters.dateTo) {
        query = query.lte('start_date', searchFilters.dateTo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process data to include farmer details
      const processedJobs = data.map(job => ({
        ...job,
        farmer_name: job.profiles?.full_name || 'Unknown Farmer',
        farmer_rating: job.profiles?.rating || 0,
      }));
      
      setJobs(processedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again.');
      toast({
        title: "Error",
        description: "There was a problem loading jobs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
  };

  const handleApply = (jobId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for jobs.",
        variant: "default",
      });
      return;
    }
    
    toast({
      title: "Application Submitted",
      description: "Your job application has been sent to the farmer.",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold mb-6">Find Agricultural Jobs</h1>
            
            <SearchFilters 
              onSearch={handleSearch} 
              initialFilters={{
                keyword: '',
                crop: cropFilter,
                category: '',
                season: '',
                distance: 50,
                experience: 0
              }}
            />
          </div>
          
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {isLoading ? 'Searching...' : `${jobs.length} jobs found`}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-3 text-xl text-gray-600">Loading jobs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="text-red-500 mb-4">
                <Filter size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Error fetching jobs</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => fetchJobs()}
              >
                Try Again
              </Button>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="h-3 bg-primary-500"></div>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <Badge variant={job.status === 'open' ? 'default' : 'outline'}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">Posted by {job.farmer_name}</div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {job.description && (
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Tag size={16} className="mr-2" />
                        <span className="capitalize">{job.crop_category?.replace('_', ' ')}</span>
                        {job.labor_type && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="capitalize">{job.labor_type?.replace('_', ' ')}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <span>
                          {formatDate(job.start_date)}
                          {job.end_date && ` to ${formatDate(job.end_date)}`}
                        </span>
                      </div>
                      
                      {job.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      
                      {job.pay_rate && job.pay_type && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign size={16} className="mr-2" />
                          <span>₹{job.pay_rate} {job.pay_type === 'daily' ? 'per day' : 
                            job.pay_type === 'hourly' ? 'per hour' :
                            job.pay_type === 'fixed' ? 'fixed rate' : 'per unit'}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => handleApply(job.id)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="text-gray-400 mb-4">
                <Filter size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Jobs;
