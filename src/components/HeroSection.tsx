
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Language Selector - Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <Globe className="h-4 w-4 mr-2" />
          English
        </Button>
      </div>

      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/lovable-uploads/6a46a92e-7d28-4da6-982d-3fa744b67b36.jpg')"
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
          AGRISAMADHANA
        </h1>
        
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 text-gray-100">
          Connecting Farmers and Agricultural Laborers
        </h2>
        
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-200">
          Our platform bridges the gap between farmers and agricultural laborers in rural India, 
          providing a reliable and easy-to-use service for job posting, searching, and booking.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/category-selection?flow=farmer">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-8 py-4 text-lg font-semibold"
            >
              I'm a Farmer
            </Button>
          </Link>
          <Link to="/category-selection?flow=laborer">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-8 py-4 text-lg font-semibold"
            >
              I'm a Laborer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
