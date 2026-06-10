import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function PublicRoute({ children }) {
  const { isLoggedIn, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-400 animate-spin"></div>
      </div>
    );
  }

  // If logged in, prevent access to public pages (Landing, Login, Signup)
  // and redirect directly to the dashboard
  if (isLoggedIn && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
