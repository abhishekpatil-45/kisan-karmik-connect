import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
import { Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Json } from '@/integrations/supabase/types';

// Define interfaces for the skills data structure
interface FarmerSkills {
  crops?: string[];
  farming_type?: string;
  farm_size?: string;
  bio?: string;
  languages?: string[];
}

interface LaborerSkills {
  crops?: string[];
  availability?: string;
  will_relocate?: boolean;
  wage_expectation?: string;
  bio?: string;
  languages?: string[];
  work_types?: string[];
}

// Type guard function to check if skills is a specific type
const isFarmerSkills = (skills: { [key: string]: Json; } | Json[] | null): skills is FarmerSkills => {
  return skills !== null && !Array.isArray(skills);
};

const isLaborerSkills = (skills: { [key: string]: Json; } | Json[] | null): skills is LaborerSkills => {
  return skills !== null && !Array.isArray(skills);
};

const ProfileSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Extract role from URL params
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Farmer profile states
  const [farmSize, setFarmSize] = useState('');
  const [farmingType, setFarmingType] = useState('');
  const [selectedFarmerCrops, setSelectedFarmerCrops] = useState<string[]>([]);
  const [farmerBio, setFarmerBio] = useState('');
  const [farmerLanguages, setFarmerLanguages] = useState<string[]>([]);
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerLocation, setFarmerLocation] = useState('');

  // Laborer profile states
  const [experience, setExperience] = useState('');
  const [selectedLaborerCrops, setSelectedLaborerCrops] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [willRelocate, setWillRelocate] = useState(false);
  const [wageExpectation, setWageExpectation] = useState('');
  const [laborerBio, setLaborerBio] = useState('');
  const [laborerLanguages, setLaborerLanguages] = useState<string[]>([]);
  const [laborerPhone, setLaborerPhone] = useState('');
  const [laborerLocation, setLaborerLocation] = useState('');
  const [preferredWorkTypes, setPreferredWorkTypes] = useState<string[]>([]);

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

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserProfile(data);
        setUserRole(data.role);
        
        // If URL param doesn't match user's actual role, redirect with the correct role
        if (roleParam !== data.role) {
          navigate(`/profile-setup?role=${data.role}`, { replace: true });
          return;
        }
        
        if (data.role === 'farmer') {
          if (data.phone) setFarmerPhone(data.phone);
          if (data.location) setFarmerLocation(data.location);
          
          // Load additional farmer profile data if available
          if (data.skills && isFarmerSkills(data.skills)) {
            if (data.skills.crops) setSelectedFarmerCrops(data.skills.crops as string[]);
            if (data.skills.farming_type) setFarmingType(data.skills.farming_type as string);
            if (data.skills.farm_size) setFarmSize(data.skills.farm_size as string);
            if (data.skills.bio) setFarmerBio(data.skills.bio as string);
            if (data.skills.languages) setFarmerLanguages(data.skills.languages as string[]);
          }
        } else if (data.role === 'laborer') {
          if (data.phone) setLaborerPhone(data.phone);
          if (data.location) setLaborerLocation(data.location);
          if (data.experience) setExperience(data.experience.toString());
          
          // Load additional laborer profile data if available
          if (data.skills && isLaborerSkills(data.skills)) {
            if (data.skills.crops) setSelectedLaborerCrops(data.skills.crops as string[]);
            if (data.skills.availability) setAvailability(data.skills.availability as string);
            if (data.skills.will_relocate !== undefined) setWillRelocate(data.skills.will_relocate as boolean);
            if (data.skills.wage_expectation) setWageExpectation(data.skills.wage_expectation as string);
            if (data.skills.bio) setLaborerBio(data.skills.bio as string);
            if (data.skills.languages) setLaborerLanguages(data.skills.languages as string[]);
            if (data.skills.work_types) setPreferredWorkTypes(data.skills.work_types as string[]);
          }
        }
        
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile information.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast, navigate, roleParam]);

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
    
    setter(prev => 
      prev.includes(languageId) 
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  const handleWorkTypeToggle = (typeId: string) => {
    setPreferredWorkTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!farmerPhone || !farmerLocation) {
      toast({
        title: 'Missing information',
        description: 'Please provide your phone number and location to complete your profile.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update profile with basic and farmer-specific information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: farmerPhone,
          location: farmerLocation,
          skills: {
            crops: selectedFarmerCrops,
            farming_type: farmingType,
            farm_size: farmSize,
            bio: farmerBio,
            languages: farmerLanguages
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      toast({
        title: "Profile updated!",
        description: "Your farmer profile is now complete.",
      });
      
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Error updating farmer profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaborerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!laborerPhone || !laborerLocation) {
      toast({
        title: 'Missing information',
        description: 'Please provide your phone number and location to complete your profile.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update profile with basic and laborer-specific information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: laborerPhone,
          location: laborerLocation,
          experience: parseInt(experience) || 0,
          skills: {
            crops: selectedLaborerCrops,
            availability: availability,
            will_relocate: willRelocate,
            wage_expectation: wageExpectation,
            bio: laborerBio,
            languages: laborerLanguages,
            work_types: preferredWorkTypes
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      toast({
        title: "Profile updated!",
        description: "Your laborer profile is now complete.",
      });
      
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Error updating laborer profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your profile...</span>
      </div>
    );
  }

  // Determine if we're showing farmer or laborer form
  const isLaborer = userRole === 'laborer';

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        
        <main className="flex-1 bg-gray-50 py-8 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-6">
                Complete Your {isLaborer ? 'Laborer' : 'Farmer'} Profile
              </h1>
              
              {isLaborer ? (
                <form onSubmit={handleLaborerSubmit} className="space-y-6">
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
              ) : (
                <form onSubmit={handleFarmerSubmit} className="space-y-6">
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
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default ProfileSetup;
