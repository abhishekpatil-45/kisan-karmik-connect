
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { ProfileFormProps } from '@/types/profile';
import { crops } from '@/data/crops';

interface FarmerProfileFormProps extends ProfileFormProps {
  farmerPhone: string;
  setFarmerPhone: (value: string) => void;
  farmerLocation: string;
  setFarmerLocation: (value: string) => void;
  farmSize: string;
  setFarmSize: (value: string) => void;
  farmingType: string;
  setFarmingType: (value: string) => void;
  selectedFarmerCrops: string[];
  handleFarmerCropToggle: (cropId: string) => void;
  farmerBio: string;
  setFarmerBio: (value: string) => void;
  farmerLanguages: string[];
  handleLanguageToggle: (languageId: string, isLaborer: boolean) => void;
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

const FarmerProfileForm = ({
  onSubmit,
  isSubmitting,
  farmerPhone,
  setFarmerPhone,
  farmerLocation,
  setFarmerLocation,
  farmSize,
  setFarmSize,
  farmingType,
  setFarmingType,
  selectedFarmerCrops,
  handleFarmerCropToggle,
  farmerBio,
  setFarmerBio,
  farmerLanguages,
  handleLanguageToggle
}: FarmerProfileFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="farmer-phone" className="font-medium">Phone Number <span className="text-red-500">*</span></Label>
        <Input 
          id="farmer-phone" 
          type="tel" 
          placeholder="Your phone number" 
          value={farmerPhone}
          onChange={(e) => setFarmerPhone(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="farmer-location" className="font-medium">Location <span className="text-red-500">*</span></Label>
        <Input 
          id="farmer-location" 
          placeholder="Village, District, State" 
          value={farmerLocation}
          onChange={(e) => setFarmerLocation(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="farm-size">Farm Size (in acres)</Label>
        <Input 
          id="farm-size" 
          type="text"
          value={farmSize}
          onChange={(e) => setFarmSize(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Type of Farming</Label>
        <RadioGroup value={farmingType} onValueChange={setFarmingType}>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="traditional" id="traditional" disabled={isSubmitting} />
              <Label htmlFor="traditional">Traditional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="organic" id="organic" disabled={isSubmitting} />
              <Label htmlFor="organic">Organic</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mechanized" id="mechanized" disabled={isSubmitting} />
              <Label htmlFor="mechanized">Mechanized</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mixed" id="mixed" disabled={isSubmitting} />
              <Label htmlFor="mixed">Mixed</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-3">
        <Label>Crops You Grow (Select all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {crops.map(crop => (
            <div key={crop.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`crop-${crop.id}`} 
                checked={selectedFarmerCrops.includes(crop.id)}
                onCheckedChange={() => handleFarmerCropToggle(crop.id)}
                disabled={isSubmitting}
              />
              <Label htmlFor={`crop-${crop.id}`} className="text-sm">{crop.name}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <Label>Languages Spoken</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {languages.map(language => (
            <div key={language.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`lang-${language.id}`} 
                checked={farmerLanguages.includes(language.id)}
                onCheckedChange={() => handleLanguageToggle(language.id, false)}
                disabled={isSubmitting}
              />
              <Label htmlFor={`lang-${language.id}`} className="text-sm">{language.name}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="farmer-bio">About Your Farm</Label>
        <Textarea 
          id="farmer-bio" 
          placeholder="Describe your farm and what kind of help you need..." 
          value={farmerBio}
          onChange={(e) => setFarmerBio(e.target.value)}
          className="min-h-[120px]"
          disabled={isSubmitting}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
        ) : 'Complete Farmer Profile'}
      </Button>
    </form>
  );
};

export default FarmerProfileForm;
