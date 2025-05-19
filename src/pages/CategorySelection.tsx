
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Constants } from '@/integrations/supabase/types';

// Get the enum values directly from Supabase types
const cropCategories = Constants.public.Enums.crop_category;
const laborTypes = Constants.public.Enums.labor_type;

const CategorySelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("crops");
  
  // Get the role from query parameters or fall back to user role
  const searchParams = new URLSearchParams(location.search);
  const flowType = searchParams.get('flow') || 'worker'; // 'worker' or 'job'
  const isWorkerFlow = flowType === 'worker'; // If true, farmer looking for workers

  const handleCategorySelect = (category: string, type: 'crop' | 'labor') => {
    setIsLoading(true);
    
    if (isWorkerFlow) {
      // Farmer looking for workers
      if (type === 'crop') {
        navigate(`/search?searchTarget=laborers&crop=${category}`);
      } else {
        navigate(`/search?searchTarget=laborers&laborType=${category}`);
      }
    } else {
      // Laborer looking for jobs
      if (type === 'crop') {
        navigate(`/jobs?crop=${category}`);
      } else {
        navigate(`/jobs?laborType=${category}`);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to="/" className="text-primary hover:underline mb-2 inline-flex items-center">
              <span className="mr-2">←</span> Back to Home
            </Link>
            <h1 className="text-3xl font-bold mt-4">
              {isWorkerFlow ? 'Find Agricultural Workers' : 'Find Agricultural Jobs'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isWorkerFlow 
                ? 'Select a category to find laborers with expertise in specific crops or tasks'
                : 'Select a category to find jobs related to specific crops or tasks'
              }
            </p>
          </div>

          <Tabs defaultValue="crops" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="crops">By Crop Type</TabsTrigger>
              <TabsTrigger value="tasks">By Labor Task</TabsTrigger>
            </TabsList>
            
            <TabsContent value="crops" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cropCategories.map((crop) => (
                  <Card 
                    key={crop} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCategorySelect(crop, 'crop')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <img 
                          src={`/crops/${crop}.svg`} 
                          alt={crop}
                          className="w-8 h-8"
                          onError={(e) => {
                            // Fallback if image doesn't exist
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <h3 className="font-semibold capitalize">{crop.replace('_', ' ')}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {laborTypes.map((task) => (
                  <Card 
                    key={task} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCategorySelect(task, 'labor')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                        <img 
                          src={`/tasks/${task}.svg`} 
                          alt={task}
                          className="w-8 h-8"
                          onError={(e) => {
                            // Fallback if image doesn't exist
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <h3 className="font-semibold capitalize">{task.replace('_', ' ')}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {isLoading && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                <span>Loading results...</span>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategorySelection;
