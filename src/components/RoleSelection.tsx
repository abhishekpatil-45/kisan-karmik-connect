
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Tractor } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'farmer' | 'laborer') => void;
}

const RoleSelection = ({ onSelectRole }: RoleSelectionProps) => {
  const handleRoleClick = (role: 'farmer' | 'laborer') => {
    console.log('Role selected:', role);
    onSelectRole(role);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Role</h1>
        <p className="text-gray-600">
          Select whether you are a farmer looking for workers or a laborer seeking agricultural work.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Tractor className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-xl">I am a Farmer</CardTitle>
            <CardDescription>
              I own or manage farmland and need skilled agricultural workers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>• Find skilled laborers for your crops</li>
              <li>• Post job requirements and timelines</li>
              <li>• Connect with experienced agricultural workers</li>
              <li>• Manage seasonal workforce needs</li>
            </ul>
            <Button 
              onClick={() => handleRoleClick('farmer')} 
              className="w-full"
              size="lg"
            >
              Continue as Farmer
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <User className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-xl">I am a Laborer</CardTitle>
            <CardDescription>
              I provide agricultural services and am looking for work opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>• Showcase your agricultural skills and experience</li>
              <li>• Find work opportunities that match your expertise</li>
              <li>• Connect with farmers in your area</li>
              <li>• Build your professional reputation</li>
            </ul>
            <Button 
              onClick={() => handleRoleClick('laborer')} 
              className="w-full"
              size="lg"
              variant="outline"
            >
              Continue as Laborer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelection;
