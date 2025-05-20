
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { ProfileFormProps } from '@/types/profile';
import { crops } from '@/data/crops';

interface LaborerProfileFormProps extends ProfileFormProps {
  laborerPhone: string;
  setLaborerPhone: (value: string) => void;
  laborerLocation: string;
  setLaborerLocation: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  selectedLaborerCrops: string[];
  handleLaborerCropToggle: (cropId: string) => void;
  availability: string;
  setAvailability: (value: string) => void;
  willRelocate: boolean;
  setWillRelocate: (value: boolean) => void;
  wageExpectation: string;
  setWageExpectation: (value: string) => void;
  laborerBio: string;
  setLaborerBio: (value: string) => void;
  laborerLanguages: string[];
  handleLanguageToggle: (languageId: string, isLaborer: boolean) => void;
  preferredWorkTypes: string[];
  handleWorkTypeToggle: (typeId: string) => void;
}

const languages = [
  { id: 'hindi', name: 'Hindi' },
  { id: 'english', name: 'English' },
  { id: 'tamil', name: 'Tamil' },
  { id: 'telugu', name: 'Telugu' },
  { id: 'kannada', name: 'Kannada' },
  { id: 'malayalam', name: 'Malayalam' },
  { id: 'punjabi', name: 'Punjabi' },
  { id: 'marathi', name: 'Marathi' },
  { id: 'gujarati', name: 'Gujarati' },
  { id: 'urdu', name: 'Urdu' }
];

const workTypes = [
  { id: 'seasonal', name: 'Seasonal' },
  { id: 'full-time', name: 'Full-time' },
  { id: 'part-time', name: 'Part-time' },
  { id: 'contract', name: 'Contract' },
  { id: 'daily-wage', name: 'Daily wage' }
];

const LaborerProfileForm = ({
  onSubmit,
  isSubmitting,
  laborerPhone,
  setLaborerPhone,
  laborerLocation,
  setLaborerLocation,
  experience,
  setExperience,
  selectedLaborerCrops,
  handleLaborerCropToggle,
  availability,
  setAvailability,
  willRelocate,
  setWillRelocate,
  wageExpectation,
  setWageExpectation,
  laborerBio,
  setLaborerBio,
  laborerLanguages,
  handleLanguageToggle,
  preferredWorkTypes,
  handleWorkTypeToggle
}: LaborerProfileFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="laborer-phone" className="font-medium">Phone Number <span className="text-red-500">*</span></Label>
        <Input 
          id="laborer-phone" 
          type="tel" 
          placeholder="Your phone number" 
          value={laborerPhone}
          onChange={(e) => setLaborerPhone(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="laborer-location" className="font-medium">Location <span className="text-red-500">*</span></Label>
        <Input 
          id="laborer-location" 
          placeholder="Village, District, State" 
          value={laborerLocation}
          onChange={(e) => setLaborerLocation(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
    
      <div className="space-y-2">
        <Label htmlFor="experience">Years of Experience in Agriculture</Label>
        <Input 
          id="experience" 
          type="number"
          min="0"
          max="60"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-3">
        <Label>Crops You Have Experience With (Select all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {crops.map(crop => (
            <div key={crop.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`crop-${crop.id}`} 
                checked={selectedLaborerCrops.includes(crop.id)}
                onCheckedChange={() => handleLaborerCropToggle(crop.id)}
                disabled={isSubmitting}
              />
              <Label htmlFor={`crop-${crop.id}`} className="text-sm">{crop.name}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <Label>Preferred Work Type (Select all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {workTypes.map(type => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`work-type-${type.id}`} 
                checked={preferredWorkTypes.includes(type.id)}
                onCheckedChange={() => handleWorkTypeToggle(type.id)}
                disabled={isSubmitting}
              />
              <Label htmlFor={`work-type-${type.id}`} className="text-sm">{type.name}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger id="availability" disabled={isSubmitting}>
            <SelectValue placeholder="Select your availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="year-round">Year-round</SelectItem>
            <SelectItem value="seasonal">Seasonal</SelectItem>
            <SelectItem value="weekends">Weekends only</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="relocate" 
          checked={willRelocate}
          onCheckedChange={(checked) => setWillRelocate(checked as boolean)}
          disabled={isSubmitting}
        />
        <Label htmlFor="relocate">I am willing to relocate for work</Label>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="wage">Daily Wage Expectation (in ₹)</Label>
        <Input 
          id="wage" 
          type="text"
          placeholder="e.g., ₹500/day"
          value={wageExpectation}
          onChange={(e) => setWageExpectation(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-3">
        <Label>Languages Spoken</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {languages.map(language => (
            <div key={language.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`lang-${language.id}`} 
                checked={laborerLanguages.includes(language.id)}
                onCheckedChange={() => handleLanguageToggle(language.id, true)}
                disabled={isSubmitting}
              />
              <Label htmlFor={`lang-${language.id}`} className="text-sm">{language.name}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="laborer-bio">About Your Experience</Label>
        <Textarea 
          id="laborer-bio" 
          placeholder="Describe your agricultural skills and experience..." 
          value={laborerBio}
          onChange={(e) => setLaborerBio(e.target.value)}
          className="min-h-[120px]"
          disabled={isSubmitting}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
        ) : 'Complete Laborer Profile'}
      </Button>
    </form>
  );
};

export default LaborerProfileForm;
