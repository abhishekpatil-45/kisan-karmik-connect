import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
const HeroSection = () => {
  return <div className="relative bg-gradient-to-r from-primary-700 to-primary-900 text-white">
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Connect with <span className="text-accent">Agricultural Talent</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 text-gray-100">
              Agrisamadhana connects farmers with skilled agricultural laborers based on crop expertise, 
              solving labor shortages and improving farming efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/category-selection?flow=worker">
                <Button size="lg" className="bg-accent hover:bg-accent-600 text-black w-full sm:w-auto">
                  Find Workers
                </Button>
              </Link>
              <Link to="/category-selection?flow=job">
                <Button size="lg" variant="outline" className="border-white text-white w-full sm:w-auto bg-amber-950 hover:bg-amber-800">
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img alt="Farmers and laborers working together" className="max-w-full md:max-w-md rounded-lg shadow-xl" src="/lovable-uploads/7ce02e0b-09ba-4ba3-ae29-ba1a82b2456c.jpg" />
          </div>
        </div>
      </div>
    </div>;
};
export default HeroSection;