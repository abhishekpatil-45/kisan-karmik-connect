
import React, { useState } from 'react';
import { Check, Filter, Search } from 'lucide-react';
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

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
}

const SearchFilters = ({ onSearch }: SearchFiltersProps) => {
  const [keyword, setKeyword] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [distance, setDistance] = useState([50]);
  const [experience, setExperience] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
      distance: distance[0],
      experience: experience ? parseInt(experience) : 0,
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
    
    // Also trigger a search with reset filters
    onSearch({
      keyword: '',
      crop: '',
      category: '',
      season: '',
      distance: 50,
      experience: 0,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
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
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="category" className="text-sm font-medium">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {cropCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="season" className="text-sm font-medium">Season</Label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger id="season">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Seasons</SelectItem>
                {cropSeasons.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
