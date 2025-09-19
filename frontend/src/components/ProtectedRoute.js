import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component is used to protect routes that require authentication
// It also checks if the user has the correct role to access the route
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified, check if user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on user role
    const redirectPath = user.role === 'customer' ? '/customer/dashboard' : '/seller/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // If user is authenticated and has the required role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;