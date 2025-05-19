
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
  allowedRoles?: string[];
};

const ProtectedRoute = ({ 
  children, 
  redirectTo = "/auth",
  allowedRoles
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setIsChecking(false);
          return;
        }

        setUserRole(data.role);
      } catch (error) {
        console.error('Error in role check:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Set a short timeout to ensure auth state has been checked
    const timer = setTimeout(() => {
      if (user) {
        checkUserRole();
      } else {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, loading]);

  if (loading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
