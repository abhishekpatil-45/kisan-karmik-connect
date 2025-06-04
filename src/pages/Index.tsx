import React, { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/FeatureCard';
import { Link } from 'react-router-dom';
import { User, Search, MessageCircle, Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, profileCompleted } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleProfileCompletionClick = () => {
    setIsNavigating(true);
    // The Link component will handle navigation, this just sets loading state
  };

  return (
    <div className="flex flex-col">
      {/* NavBar positioned absolutely over hero */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <NavBar />
      </div>
      
      <main>
        <HeroSection />
        
        {/* Profile Completion CTA - Only shown for logged in users */}
        {user && (
          <section className="py-6 bg-amber-50">
            <div className="container mx-auto px-4 text-center">
              {!profileCompleted ? (
                <>
                  <h3 className="text-xl font-bold mb-3">Complete Your Profile</h3>
                  <p className="text-gray-700 mb-4">
                    Set up your profile to start connecting with the right opportunities for your needs.
                  </p>
                  <Link to="/profile-completion" onClick={handleProfileCompletionClick}>
                    <Button 
                      className="bg-primary hover:bg-primary-600" 
                      disabled={isNavigating}
                    >
                      {isNavigating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Complete Your Profile'
                      )}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-3">Profile Complete</h3>
                  <p className="text-gray-700 mb-4">
                    Your profile is set up! You can view and edit your information anytime.
                  </p>
                  <Link to="/profile">
                    <Button className="bg-green-600 hover:bg-green-700">
                      View Your Profile
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </section>
        )}
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How Agrisamadhana Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard icon={<User size={24} />} title="Create Your Profile" description="Register as a farmer or laborer and build your profile showcasing your expertise and requirements." />
              <FeatureCard icon={<Search size={24} />} title="Find Perfect Matches" description="Search for laborers with specific crop expertise or find farmers growing crops you specialize in." className="md:transform md:translate-y-6" />
              <FeatureCard icon={<MessageCircle size={24} />} title="Connect & Collaborate" description="Send connection requests, message directly, and arrange work opportunities." />
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
              <Link to="/auth?tab=register">
                <Button size="lg" className="bg-accent hover:bg-accent-600 text-black w-full">
                  Get Started
                </Button>
              </Link>
              <Link to="/auth?tab=login">
                <Button size="lg" variant="outline" className="border-white w-full bg-orange-950 hover:bg-orange-800 text-slate-50">
                  Sign In
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
              
              
              {/* Testimonial 2 */}
              
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
