
import React, { useState, useEffect } from 'react';
import { Check, Filter, Search, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { crops, cropCategories, cropSeasons } from '@/data/crops';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Constants } from '@/integrations/supabase/types';

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
  initialFilters?: any;
}

const SearchFilters = ({ onSearch, initialFilters = {} }: SearchFiltersProps) => {
  const [keyword, setKeyword] = useState(initialFilters.keyword || '');
  const [selectedCrop, setSelectedCrop] = useState(initialFilters.crop || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [selectedSeason, setSelectedSeason] = useState(initialFilters.season || '');
  const [distance, setDistance] = useState([initialFilters.distance || 50]);
  const [experience, setExperience] = useState(initialFilters.experience?.toString() || '');
  const [location, setLocation] = useState(initialFilters.location || '');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    initialFilters.dateFrom ? new Date(initialFilters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    initialFilters.dateTo ? new Date(initialFilters.dateTo) : undefined
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    // Update from initialFilters when they change
    if (initialFilters) {
      if (initialFilters.crop !== undefined) setSelectedCrop(initialFilters.crop);
      if (initialFilters.keyword !== undefined) setKeyword(initialFilters.keyword);
      if (initialFilters.category !== undefined) setSelectedCategory(initialFilters.category);
      if (initialFilters.season !== undefined) setSelectedSeason(initialFilters.season);
      if (initialFilters.distance !== undefined) setDistance([initialFilters.distance]);
      if (initialFilters.experience !== undefined) setExperience(initialFilters.experience.toString());
    }
  }, [initialFilters]);

  const handleSearch = () => {
    // Convert crop, category, and season IDs to names for more accurate search
    const cropName = selectedCrop ? crops.find(c => c.id === selectedCrop)?.name : '';
    const categoryName = selectedCategory ? cropCategories.find(c => c.id === selectedCategory)?.name : '';
    const seasonName = selectedSeason ? cropSeasons.find(s => s.id === selectedSeason)?.name : '';

    onSearch({
      keyword: keyword,
      crop: selectedCrop,
      cropName: cropName,
      category: selectedCategory,
      categoryName: categoryName,
      season: selectedSeason,
      seasonName: seasonName,
      location: location,
      distance: distance[0],
      experience: experience ? parseInt(experience) : 0,
      dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '',
      dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : '',
    });
  };

  // Add a reset filters function
  const resetFilters = () => {
    setKeyword('');
    setSelectedCrop('');
    setSelectedCategory('');
    setSelectedSeason('');
    setDistance([50]);
    setExperience('');
    setLocation('');
    setDateFrom(undefined);
    setDateTo(undefined);
    
    // Also trigger a search with reset filters
    onSearch({
      keyword: '',
      crop: '',
      category: '',
      season: '',
      location: '',
      distance: 50,
      experience: 0,
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, location..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={isFilterOpen ? "border-primary-500 text-primary-500" : ""}
        >
          <Filter className="h-4 w-4" />
        </Button>
        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
          <div>
            <Label htmlFor="crop" className="text-sm font-medium">Crop</Label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger id="crop">
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Crops</SelectItem>
                {Constants.public.Enums.crop_category.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop.charAt(0).toUpperCase() + crop.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="labor_type" className="text-sm font-medium">Labor Type</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="labor_type">
                <SelectValue placeholder="Select labor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {Constants.public.Enums.labor_type.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Input
              id="location"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'PPP') : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-medium">Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'PPP') : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="distance" className="text-sm font-medium">
              Distance (up to {distance[0]} km)
            </Label>
            <Slider
              id="distance"
              defaultValue={[50]}
              max={100}
              step={10}
              value={distance}
              onValueChange={setDistance}
              className="py-4"
            />
          </div>

          <div>
            <Label htmlFor="experience" className="text-sm font-medium">
              Experience
            </Label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger id="experience">
                <SelectValue placeholder="Any experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any experience</SelectItem>
                <SelectItem value="1">1+ years</SelectItem>
                <SelectItem value="2">2+ years</SelectItem>
                <SelectItem value="5">5+ years</SelectItem>
                <SelectItem value="10">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
