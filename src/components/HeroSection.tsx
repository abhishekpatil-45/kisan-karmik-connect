
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: `url('/lovable-uploads/d4d9a0b2-f048-4433-b335-2e5fca764782.png')` }}>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Language selector - top left */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <Globe className="w-4 h-4 mr-2" />
          English
        </Button>
      </div>
      
      {/* Main content - centered */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4 text-center">
          
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-wider">
            AGRISAMADHANA
          </h1>
          
          {/* Subheading */}
          <h2 className="text-xl md:text-2xl lg:text-3xl text-white mb-6 font-medium">
            Connecting Farmers and Agricultural Laborers
          </h2>
          
          {/* Description */}
          <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Our platform bridges the gap between farmers and agricultural laborers 
            in rural India, providing a reliable and easy-to-use service for job 
            posting, searching, and booking.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/category-selection?flow=worker">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
              >
                I'm a Farmer
              </Button>
            </Link>
            <Link to="/category-selection?flow=job">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
              >
                I'm a Laborer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
