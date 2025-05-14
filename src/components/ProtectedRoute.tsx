
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
};

const ProtectedRoute = ({ children, redirectTo = "/auth" }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Set a short timeout to ensure auth state has been checked
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
