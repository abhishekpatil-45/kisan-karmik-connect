
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, User, Search, MessageCircle, Menu, LogOut } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';

const NavBar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Handle home button click based on user role
  const handleHomeClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
    
    setIsOpen(false);
  };

  return (
    <nav className="bg-primary shadow-md w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Agrisamadhana" className="h-8 w-8" />
            <Link to="/" className="font-bold text-xl text-white">Agrisamadhana</Link>
          </div>
          
          {isMobile ? (
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:bg-primary-600"
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                    onClick={handleHomeClick}
                  >
                    <Home className="inline mr-2 h-4 w-4" /> Home
                  </button>
                  
                  {user ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50" onClick={() => setIsOpen(false)}>
                        <User className="inline mr-2 h-4 w-4" /> Profile
                      </Link>
                      <Link to="/jobs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50" onClick={() => setIsOpen(false)}>
                        <Search className="inline mr-2 h-4 w-4" /> Jobs
                      </Link>
                      <Link to="/search" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50" onClick={() => setIsOpen(false)}>
                        <Search className="inline mr-2 h-4 w-4" /> Search
                      </Link>
                      <Link to="/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50" onClick={() => setIsOpen(false)}>
                        <MessageCircle className="inline mr-2 h-4 w-4" /> Messages
                      </Link>
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50"
                        onClick={() => { 
                          setIsOpen(false);
                          signOut();
                        }}
                      >
                        <LogOut className="inline mr-2 h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/auth" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50" onClick={() => setIsOpen(false)}>
                      <User className="inline mr-2 h-4 w-4" /> Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleHomeClick}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium text-white hover:bg-primary-600 py-2 px-4 rounded-md"
              >
                <Home className="mr-2 h-4 w-4" /> Home
              </button>
              
              {user ? (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" className="text-white hover:bg-primary-600">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Button>
                  </Link>
                  <Link to="/jobs">
                    <Button variant="ghost" className="text-white hover:bg-primary-600">
                      <Search className="mr-2 h-4 w-4" /> Jobs
                    </Button>
                  </Link>
                  <Link to="/search">
                    <Button variant="ghost" className="text-white hover:bg-primary-600">
                      <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                  </Link>
                  <Link to="/messages">
                    <Button variant="ghost" className="text-white hover:bg-primary-600">
                      <MessageCircle className="mr-2 h-4 w-4" /> Messages
                    </Button>
                  </Link>
                  <Button 
                    variant="secondary" 
                    className="bg-white text-primary-700 hover:bg-gray-100"
                    onClick={signOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="secondary" className="bg-white text-primary-700 hover:bg-gray-100">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
