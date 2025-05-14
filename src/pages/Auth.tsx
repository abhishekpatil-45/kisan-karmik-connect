
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract role from URL params if present
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role');
  
  const [tab, setTab] = useState<string>(roleParam === 'laborer' ? 'register-laborer' : (roleParam === 'farmer' ? 'register-farmer' : 'login'));
  
  // Form states for login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Form states for farmer registration
  const [farmerName, setFarmerName] = useState('');
  const [farmerEmail, setFarmerEmail] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [farmerLocation, setFarmerLocation] = useState('');
  
  // Form states for laborer registration
  const [laborerName, setLaborerName] = useState('');
  const [laborerEmail, setLaborerEmail] = useState('');
  const [laborerPhone, setLaborerPhone] = useState('');
  const [laborerPassword, setLaborerPassword] = useState('');
  const [laborerLocation, setLaborerLocation] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would handle login with API here
    console.log('Logging in with:', { loginEmail, loginPassword });
    
    toast({
      title: "Logged in successfully",
      description: "Welcome back to Agrisamadhana!",
    });
    
    // Navigate to dashboard based on user role (will be dynamic in real app)
    navigate('/dashboard');
  };
  
  const handleFarmerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would handle registration with API here
    console.log('Registering farmer:', { farmerName, farmerEmail, farmerPhone, farmerPassword, farmerLocation });
    
    toast({
      title: "Registration successful!",
      description: "Please complete your farmer profile.",
    });
    
    // Navigate to profile completion page
    navigate('/profile-setup?role=farmer');
  };
  
  const handleLaborerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would handle registration with API here
    console.log('Registering laborer:', { laborerName, laborerEmail, laborerPhone, laborerPassword, laborerLocation });
    
    toast({
      title: "Registration successful!",
      description: "Please complete your laborer profile.",
    });
    
    // Navigate to profile completion page
    navigate('/profile-setup?role=laborer');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to Agrisamadhana
            </CardTitle>
            <CardDescription className="text-center">
              Connect farmers with skilled agricultural laborers
            </CardDescription>
          </CardHeader>
          
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register-farmer">Farmer Registration</TabsTrigger>
              <TabsTrigger value="register-laborer">Laborer Registration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full">Login</Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register-farmer">
              <form onSubmit={handleFarmerRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmer-name">Full Name</Label>
                    <Input 
                      id="farmer-name" 
                      placeholder="Your full name" 
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmer-email">Email</Label>
                    <Input 
                      id="farmer-email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={farmerEmail}
                      onChange={(e) => setFarmerEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmer-phone">Phone Number</Label>
                    <Input 
                      id="farmer-phone" 
                      type="tel" 
                      placeholder="Your phone number" 
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmer-location">Location</Label>
                    <Input 
                      id="farmer-location" 
                      placeholder="Village, District, State" 
                      value={farmerLocation}
                      onChange={(e) => setFarmerLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmer-password">Password</Label>
                    <Input 
                      id="farmer-password" 
                      type="password" 
                      value={farmerPassword}
                      onChange={(e) => setFarmerPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full">Register as Farmer</Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register-laborer">
              <form onSubmit={handleLaborerRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="laborer-name">Full Name</Label>
                    <Input 
                      id="laborer-name" 
                      placeholder="Your full name" 
                      value={laborerName}
                      onChange={(e) => setLaborerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="laborer-email">Email</Label>
                    <Input 
                      id="laborer-email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={laborerEmail}
                      onChange={(e) => setLaborerEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="laborer-phone">Phone Number</Label>
                    <Input 
                      id="laborer-phone" 
                      type="tel" 
                      placeholder="Your phone number" 
                      value={laborerPhone}
                      onChange={(e) => setLaborerPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="laborer-location">Location</Label>
                    <Input 
                      id="laborer-location" 
                      placeholder="Village, District, State" 
                      value={laborerLocation}
                      onChange={(e) => setLaborerLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="laborer-password">Password</Label>
                    <Input 
                      id="laborer-password" 
                      type="password" 
                      value={laborerPassword}
                      onChange={(e) => setLaborerPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full">Register as Laborer</Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
