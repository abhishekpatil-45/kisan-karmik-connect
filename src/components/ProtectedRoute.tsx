
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompleteProfile?: boolean;
}

const ProtectedRoute = ({ children, requireCompleteProfile = false }: ProtectedRouteProps) => {
  const { user, loading, profileCompleted } = useAuth();
  
  // Show loading state if we're still checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  // Redirect to auth if user is not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If page requires complete profile and profile is not complete, redirect to profile setup
  if (requireCompleteProfile && !profileCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
