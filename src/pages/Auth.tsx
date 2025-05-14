
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
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, loading } = useAuth();
  
  // Extract role from URL params if present
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role');
  
  const [tab, setTab] = useState<string>(roleParam === 'laborer' ? 'register-laborer' : (roleParam === 'farmer' ? 'register-farmer' : 'login'));
  
  // Form states for login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  
  // Form states for farmer registration
  const [farmerName, setFarmerName] = useState('');
  const [farmerEmail, setFarmerEmail] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [farmerLocation, setFarmerLocation] = useState('');
  const [registeringFarmer, setRegisteringFarmer] = useState(false);
  
  // Form states for laborer registration
  const [laborerName, setLaborerName] = useState('');
  const [laborerEmail, setLaborerEmail] = useState('');
  const [laborerPhone, setLaborerPhone] = useState('');
  const [laborerPassword, setLaborerPassword] = useState('');
  const [laborerLocation, setLaborerLocation] = useState('');
  const [registeringLaborer, setRegisteringLaborer] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing fields",
        description: "Please provide both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSigningIn(true);
      await signIn(loginEmail, loginPassword);
      // The redirection is handled in the auth context
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled in the auth context
    } finally {
      setSigningIn(false);
    }
  };
  
  const handleFarmerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerEmail || !farmerPassword || !farmerName) {
      toast({
        title: "Missing fields",
        description: "Please provide your name, email, and password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setRegisteringFarmer(true);
      await signUp(farmerEmail, farmerPassword, { 
        fullName: farmerName,
        role: 'farmer'
      });
      
      // After successful signup, redirect to login tab
      setTab('login');
      setLoginEmail(farmerEmail);
      
    } catch (error) {
      console.error('Farmer registration error:', error);
      // Error is already handled in the auth context
    } finally {
      setRegisteringFarmer(false);
    }
  };
  
  const handleLaborerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laborerEmail || !laborerPassword || !laborerName) {
      toast({
        title: "Missing fields",
        description: "Please provide your name, email, and password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setRegisteringLaborer(true);
      await signUp(laborerEmail, laborerPassword, { 
        fullName: laborerName,
        role: 'laborer'
      });
      
      // After successful signup, redirect to login tab
      setTab('login');
      setLoginEmail(laborerEmail);
      
    } catch (error) {
      console.error('Laborer registration error:', error);
      // Error is already handled in the auth context
    } finally {
      setRegisteringLaborer(false);
    }
  };
  
  if (loading && user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    );
  }
  
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
                      disabled={signingIn}
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
                      disabled={signingIn}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={signingIn}
                  >
                    {signingIn ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</>
                    ) : 'Login'}
                  </Button>
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
                      disabled={registeringFarmer}
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
                      disabled={registeringFarmer}
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
                      disabled={registeringFarmer}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    You'll be able to add your phone number and location after registration.
                  </p>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registeringFarmer}
                  >
                    {registeringFarmer ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
                    ) : 'Register as Farmer'}
                  </Button>
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
                      disabled={registeringLaborer}
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
                      disabled={registeringLaborer}
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
                      disabled={registeringLaborer}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    You'll be able to add your phone number and location after registration.
                  </p>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registeringLaborer}
                  >
                    {registeringLaborer ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
                    ) : 'Register as Laborer'}
                  </Button>
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
