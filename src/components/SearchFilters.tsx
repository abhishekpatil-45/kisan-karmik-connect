
import React from 'react';
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
import { crops } from '@/data/crops';

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
}

const SearchFilters = ({ onSearch }: SearchFiltersProps) => {
  const [keyword, setKeyword] = React.useState('');
  const [selectedCrop, setSelectedCrop] = React.useState('');
  const [distance, setDistance] = React.useState([50]);
  const [experience, setExperience] = React.useState('');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const handleSearch = () => {
    onSearch({
      keyword,
      crop: selectedCrop,
      distance: distance[0],
      experience: experience ? parseInt(experience) : 0,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
          <div>
            <Label htmlFor="crop" className="text-sm font-medium">Crop Type</Label>
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
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
