/**
 * ProtectedRoute.jsx
 * * A wrapper component that checks if user is authenticated
 * before allowing access to a page.
 * * Usage:
 * <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
 * * How it works:
 * 1. Check if user is logged in (useAuth)
 * 2. While checking (isLoading), show loading spinner
 * 3. If logged in: show the page
 * 4. If not logged in: redirect to login
 * * Why needed?
 * - Prevent unauthenticated users from accessing pages
 * - Create seamless redirect to login
 * - Professional user experience
 */

import React from'react';
import { Navigate } from'react-router-dom';
import { useAuth } from'../context/AuthContext.jsx';

/**
 * ProtectedRoute Component
 * * Props:
 * - children: The component to protect
 * * Returns:
 * - If loading: Loading spinner
 * - If logged in: The protected component
 * - If not logged in: Redirect to /login
 */
function ProtectedRoute({ children }) {
 const { isLoggedIn, isLoading, user } = useAuth();

 // ============================================================
 // LOADING STATE
 // ============================================================
 /**
 * While checking if user is logged in, show spinner
 * * Why?
 * - App might be checking token with backend
 * - Don't want to flash login page then dashboard
 * - User sees loading screen instead
 */
 if (isLoading) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-slate-950">
 <div className="text-center">
 <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500 mx-auto mb-4"></div>
 <p className="text-slate-400">Loading...</p>
 </div>
 </div>
 );
 }

 // ============================================================
 // NOT LOGGED IN - REDIRECT TO LOGIN
 // ============================================================

 /**
 * If user is NOT logged in, redirect to login page
 * * The user will:
 * 1. Try to access /dashboard
 * 2. We check: isLoggedIn = false
 * 3. Redirect to /login
 * 4. User sees login form
 * 5. User logs in
 * 6. Token stored in localStorage
 * 7. User can now access /dashboard
 */
 if (!isLoggedIn || !user) {
 // Redirect to login, but remember where user was trying to go
 // (using'state' - not used yet but good practice)
 return <Navigate to="/login" replace />;
 }

 // ============================================================
 // LOGGED IN - SHOW PROTECTED COMPONENT
 // ============================================================

 /**
 * User is logged in and token is valid
 * Show the protected component (dashboard, profile, etc.)
 */
 return children;
}

export default ProtectedRoute;
