
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { crops } from '@/data/crops'; 
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
  targetRole?: 'farmer' | 'laborer';
  initialFilters?: {
    keyword?: string;
    crop?: string;
    category?: string;
    season?: string;
    distance?: number;
    experience?: number;
    location?: string;
    preferred_work_type?: string;
    can_relocate?: boolean;
  };
}

const SearchFilters = ({ onSearch, targetRole, initialFilters = {} }: SearchFiltersProps) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [workTypes] = useState<string[]>(['Seasonal', 'Contract', 'Daily Wage']);
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      keyword: initialFilters.keyword || '',
      crop: initialFilters.crop || 'all-crops',
      category: initialFilters.category || '',
      season: initialFilters.season || '',
      distance: initialFilters.distance || 50,
      experience: initialFilters.experience || 0,
      location: initialFilters.location || '',
      preferred_work_type: initialFilters.preferred_work_type || 'any-work-type',
      can_relocate: initialFilters.can_relocate || false
    }
  });
  
  useEffect(() => {
    if (user) {
      fetchUserRole();
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
    }
  };
  
  // Determine search target based on user role or prop
  const searchTarget = targetRole || (userRole === 'farmer' ? 'laborer' : 'farmer');
  
  const handleSearch = (data: any) => {
    setIsLoading(true);
    setTimeout(() => {
      onSearch(data);
      setIsLoading(false);
    }, 500);
  };
  
  return (
    <form onSubmit={handleSubmit(handleSearch)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Keyword Search */}
        <div className="space-y-2">
          <Label htmlFor="keyword">Keyword</Label>
          <Input
            id="keyword"
            placeholder="Search by keyword..."
            {...register('keyword')}
          />
        </div>
        
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Enter location..."
            {...register('location')}
          />
        </div>
        
        {/* Crop Type */}
        <div className="space-y-2">
          <Label htmlFor="crop">Crop Type</Label>
          <Select 
            onValueChange={(value) => setValue('crop', value)}
            defaultValue={initialFilters.crop || "all-crops"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select crop type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-crops">All Crops</SelectItem>
              {crops.map((crop) => (
                <SelectItem key={crop.id} value={crop.id}>
                  {crop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* For farmers searching laborers - Show work type and relocate */}
        {searchTarget === 'laborer' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="preferred_work_type">Work Type</Label>
              <Select 
                onValueChange={(value) => setValue('preferred_work_type', value)}
                defaultValue={initialFilters.preferred_work_type || "any-work-type"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any-work-type">Any work type</SelectItem>
                  {workTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="can_relocate" 
                  onCheckedChange={(checked) => setValue('can_relocate', !!checked)}
                />
                <Label htmlFor="can_relocate">Willing to Relocate</Label>
              </div>
            </div>
            
            {/* Experience Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="experience">Minimum Experience (Years)</Label>
                <span className="text-sm">{watch('experience')} years</span>
              </div>
              <Slider
                id="experience"
                min={0}
                max={20}
                step={1}
                defaultValue={[initialFilters.experience || 0]}
                onValueChange={(values) => setValue('experience', values[0])}
              />
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </form>
  );
};

export default SearchFilters;
