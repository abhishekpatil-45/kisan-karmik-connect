
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Search, MessageCircle, User, Home } from 'lucide-react';

const NavBar = () => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);
  
  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      setUserRole(data.role);
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className={`sticky top-0 z-50 bg-white ${isScrolled ? 'shadow' : ''} transition-shadow duration-300`}>
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="Agrisamadhana Logo" className="h-8" />
          <span className="font-bold text-xl hidden sm:inline">Agrisamadhana</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button 
                  variant={isActive('/dashboard') ? "default" : "ghost"} 
                  className="flex items-center"
                >
                  <Home className="mr-2 h-4 w-4" /> Home
                </Button>
              </Link>
              
              <Link to="/search">
                <Button 
                  variant={isActive('/search') ? "default" : "ghost"} 
                  className="flex items-center"
                >
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </Link>
              
              <Link to="/messages">
                <Button 
                  variant={isActive('/messages') ? "default" : "ghost"} 
                  className="flex items-center"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Messages
                </Button>
              </Link>
              
              <Link to="/profile">
                <Button 
                  variant={isActive('/profile') ? "default" : "ghost"} 
                  className="flex items-center"
                >
                  <User className="mr-2 h-4 w-4" /> Profile
                </Button>
              </Link>
              
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth?tab=login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/auth?tab=register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px]">
              <nav className="flex flex-col space-y-4 mt-6">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                      >
                        <Home className="mr-2 h-4 w-4" /> Home
                      </Button>
                    </Link>
                    
                    <Link to="/search" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                      >
                        <Search className="mr-2 h-4 w-4" /> Search
                      </Button>
                    </Link>
                    
                    <Link to="/messages" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" /> Messages
                      </Button>
                    </Link>
                    
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth?tab=login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/auth?tab=register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Register</Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
