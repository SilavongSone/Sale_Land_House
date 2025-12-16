import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: string | string[]; // Single role or array of allowed roles
  requireAuth?: boolean; // Just require authentication without role check
}

export default function ProtectedRoute({ 
  children, 
  role,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, currentUser, isLoading } = useAuthStore();

  // If still checking auth status (from App.tsx initAuth), show nothing
  // The App.tsx loading screen will handle this
  if (isLoading) {
    return null;
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (role && currentUser) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    const userRole = currentUser.role.toLowerCase();
    
    if (!allowedRoles.some(r => r.toLowerCase() === userRole)) {
      // Redirect based on user's actual role
      if (userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === "user" || userRole === "staff") {
        return <Navigate to="/user/home" replace />;
      } else if (userRole === "manager") {
        return <Navigate to="/manager/dashboard" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  return <>{children}</>;
}