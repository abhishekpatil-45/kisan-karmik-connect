
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Github, Mail } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      // Set focus on the register tab if the URL parameter is present
    }
  }, [searchParams]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      // Show success toast
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Navigate to the home page (navigation will be handled by AuthContext)
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleSignUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        },
      });
      
      if (error) throw error;
      
      setShowConfirmation(true);
      toast({
        title: "Registration Successful",
        description: "Please check your email for verification.",
      });
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleReturnToLogin = () => {
    setShowConfirmation(false);
    navigate('/auth?tab=login', { replace: true });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-1 grid place-items-center bg-gray-100 py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Authentication</CardTitle>
            <CardDescription className="text-center">
              {showConfirmation ? (
                <>
                  Registration successful! Check your email for verification.
                  <Separator className="my-4" />
                  <Button 
                    variant="link" 
                    className="text-blue-500 p-0 h-auto font-normal"
                    onClick={handleReturnToLogin}
                  >
                    Return to Login
                  </Button>
                </>
              ) : (
                "Enter your credentials to sign in or register"
              )}
            </CardDescription>
          </CardHeader>
          {!showConfirmation && (
            <CardContent className="grid gap-4">
              <Tabs defaultValue={searchParams.get('tab') || "login"} className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="mail@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleSignIn(email, password)} className="w-full">Sign In</Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" type="button" disabled className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    Github
                  </Button>
                  <Button variant="outline" type="button" disabled className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </TabsContent>
                <TabsContent value="register" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="mail@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleSignUp(email, password)} className="w-full">
                    Create Account
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
          <CardFooter className="flex justify-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-800">
              Return to homepage
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Auth;
