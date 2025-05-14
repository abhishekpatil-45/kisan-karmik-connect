
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { crops } from '@/data/crops';

const ProfileSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract role from URL params
  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role') || 'farmer';
  
  // Farmer profile states
  const [farmSize, setFarmSize] = useState('');
  const [farmingType, setFarmingType] = useState('');
  const [selectedFarmerCrops, setSelectedFarmerCrops] = useState<string[]>([]);
  const [farmerBio, setFarmerBio] = useState('');
  const [farmerLanguages, setFarmerLanguages] = useState<string[]>([]);

  // Laborer profile states
  const [experience, setExperience] = useState('');
  const [selectedLaborerCrops, setSelectedLaborerCrops] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [willRelocate, setWillRelocate] = useState(false);
  const [wageExpectation, setWageExpectation] = useState('');
  const [laborerBio, setLaborerBio] = useState('');
  const [laborerLanguages, setLaborerLanguages] = useState<string[]>([]);

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

  const handleFarmerCropToggle = (cropId: string) => {
    setSelectedFarmerCrops(prev => 
      prev.includes(cropId) 
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    );
  };

  const handleLaborerCropToggle = (cropId: string) => {
    setSelectedLaborerCrops(prev => 
      prev.includes(cropId) 
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    );
  };

  const handleLanguageToggle = (languageId: string, isLaborer: boolean) => {
    const setter = isLaborer ? setLaborerLanguages : setFarmerLanguages;
    const currentLanguages = isLaborer ? laborerLanguages : farmerLanguages;
    
    setter(prev => 
      prev.includes(languageId) 
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handleFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save this data to a database
    console.log('Farmer profile data:', {
      farmSize,
      farmingType,
      crops: selectedFarmerCrops,
      bio: farmerBio,
      languages: farmerLanguages
    });
    
    toast({
      title: "Profile created successfully!",
      description: "Your farmer profile is now complete.",
    });
    
    navigate('/dashboard');
  };

  const handleLaborerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save this data to a database
    console.log('Laborer profile data:', {
      experience,
      crops: selectedLaborerCrops,
      availability,
      willRelocate,
      wageExpectation,
      bio: laborerBio,
      languages: laborerLanguages
    });
    
    toast({
      title: "Profile created successfully!",
      description: "Your laborer profile is now complete.",
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">
              Complete Your {role === 'farmer' ? 'Farmer' : 'Laborer'} Profile
            </h1>
            
            {role === 'farmer' ? (
              <form onSubmit={handleFarmerSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="farm-size">Farm Size (in acres)</Label>
                  <Input 
                    id="farm-size" 
                    type="text"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Type of Farming</Label>
                  <RadioGroup value={farmingType} onValueChange={setFarmingType} required>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="traditional" id="traditional" />
                        <Label htmlFor="traditional">Traditional</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="organic" id="organic" />
                        <Label htmlFor="organic">Organic</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mechanized" id="mechanized" />
                        <Label htmlFor="mechanized">Mechanized</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mixed" id="mixed" />
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
                  />
                </div>
                
                <Button type="submit" className="w-full">Complete Farmer Profile</Button>
              </form>
            ) : (
              <form onSubmit={handleLaborerSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience in Agriculture</Label>
                  <Input 
                    id="experience" 
                    type="number"
                    min="0"
                    max="60"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
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
                        />
                        <Label htmlFor={`crop-${crop.id}`} className="text-sm">{crop.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select value={availability} onValueChange={setAvailability} required>
                    <SelectTrigger id="availability">
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
                    required
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
                  />
                </div>
                
                <Button type="submit" className="w-full">Complete Laborer Profile</Button>
              </form>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfileSetup;
