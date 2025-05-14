
import React from 'react';
import HeroSection from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/FeatureCard';
import { Link } from 'react-router-dom';
import { User, Search, MessageCircle, Star } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1">
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How Agrisamadhana Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<User size={24} />}
                title="Create Your Profile"
                description="Register as a farmer or laborer and build your profile showcasing your expertise and requirements."
              />
              <FeatureCard 
                icon={<Search size={24} />}
                title="Find Perfect Matches"
                description="Search for laborers with specific crop expertise or find farmers growing crops you specialize in."
                className="md:transform md:translate-y-6"
              />
              <FeatureCard 
                icon={<MessageCircle size={24} />}
                title="Connect & Collaborate"
                description="Send connection requests, message directly, and arrange work opportunities."
              />
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Agricultural Employment?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of farmers and laborers already using Agrisamadhana to find the perfect match for their agricultural needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/auth?role=farmer">
                <Button size="lg" className="bg-accent hover:bg-accent-600 text-black w-full">
                  Register as Farmer
                </Button>
              </Link>
              <Link to="/auth?role=laborer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full">
                  Register as Laborer
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">5.0</span>
                </div>
                <p className="text-gray-700 mb-4">
                  "Agrisamadhana helped me find skilled rice cultivation experts during peak season. The platform is easy to use and I received responses within days."
                </p>
                <div className="flex items-center">
                  <img src="/avatars/testimonial1.jpg" alt="Farmer" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-semibold">Ramesh P.</div>
                    <div className="text-sm text-gray-600">Rice Farmer, Karnataka</div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">5.0</span>
                </div>
                <p className="text-gray-700 mb-4">
                  "As a laborer specialized in coffee harvesting, I was able to find consistent work through Agrisamadhana. The app matches me with farms that value my specific skills."
                </p>
                <div className="flex items-center">
                  <img src="/avatars/testimonial2.jpg" alt="Laborer" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-semibold">Lakshmi M.</div>
                    <div className="text-sm text-gray-600">Agricultural Laborer, Tamil Nadu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
