
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import SearchFilters from '@/components/SearchFilters';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
};

type FarmerProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
};

type JobWithFarmer = JobPost & {
  farmer: FarmerProfile | null;
};

// TypeScript type guards
const isValidCropCategory = (value: string): boolean => {
  const validCategories = [
    'paddy', 'sugarcane', 'cotton', 'wheat', 'maize', 
    'pulses', 'vegetables', 'fruits', 'horticulture', 'spices', 'oilseeds'
  ];
  return validCategories.includes(value);
};

const isValidLaborType = (value: string): boolean => {
  const validTypes = [
    'harvesting', 'sowing', 'weeding', 'fertilizing', 'irrigation',
    'pesticide_application', 'nursery_management', 'pruning', 'grading', 'packaging'
  ];
  return validTypes.includes(value);
};

const Jobs = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobWithFarmer[]>([]);
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
    fetchJobs(filters);
  }, []);

  const fetchJobs = async (searchFilters: any) => {
    setIsLoading(true);

    try {
      // Extract search parameters
      const { keyword, crop, location } = searchFilters;
      
      // Convert crop to appropriate format if needed
      const cropFilter = crop;
      const laborTypeFilter = searchFilters.preferred_work_type;
      
      // Basic query to get all open jobs
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
      
      // Apply filters
      if (cropFilter && isValidCropCategory(cropFilter) && cropFilter !== 'all-crops') {
        query = query.eq('crop_category', cropFilter);
      }
      
      if (laborTypeFilter && isValidLaborType(laborTypeFilter) && laborTypeFilter !== 'any-work-type') {
        query = query.eq('labor_type', laborTypeFilter);
      }
      
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      
      if (keyword) {
        query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Agricultural Jobs</h1>
          <SearchFilters 
            onSearch={handleFilterChange} 
            initialFilters={filters}
            targetRole="farmer" // Targeting farmer jobs
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
            <>
              {jobs.map(job => (
                <div key={job.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    {job.location && (
                      <div className="mb-1">📍 {job.location}</div>
                    )}
                    <div className="mb-1">📅 {formatDate(job.start_date)} 
                      {job.end_date && ` - ${formatDate(job.end_date)}`}
                    </div>
                    {job.pay_rate && job.pay_type && (
                      <div className="mb-1">💰 ₹{job.pay_rate} ({job.pay_type})</div>
                    )}
                    {job.crop_category && (
                      <div className="mb-1">🌱 Crop: {job.crop_category}</div>
                    )}
                    {job.labor_type && (
                      <div className="mb-1">👨‍🌾 Work: {job.labor_type}</div>
                    )}
                  </div>
                  
                  {job.description && (
                    <p className="mt-3 text-gray-600 text-sm line-clamp-2">{job.description}</p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">Posted by:</h3>
                    <div className="mt-2 text-sm">
                      <p>{job.farmer?.full_name || 'Unknown farmer'}</p>
                      {job.farmer?.phone && (
                        <p className="text-gray-500">{job.farmer.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Jobs;
