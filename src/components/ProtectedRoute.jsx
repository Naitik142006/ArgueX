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
/**
 * ProtectedRoute Component
 * Props:
 * - children: The component to protect
 * - adminOnly: if true, only admins can access; non-admins get redirect to /dashboard
 * Returns:
 * - If loading: Loading spinner
 * - If not logged in: Redirect to /login
 * - If adminOnly and not admin: Redirect to /dashboard
 * - If admin and NOT adminOnly route: Redirect to /admin/feedback
 * - Otherwise: The protected component
 */
function ProtectedRoute({ children, adminOnly = false }) {
 const { isLoggedIn, isLoading, user } = useAuth();

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

 if (!isLoggedIn || !user) {
 return <Navigate to="/login" replace />;
 }

 // Admin visiting a normal user route → send to admin dashboard
 if (user.isAdmin && !adminOnly) {
 return <Navigate to="/admin/feedback" replace />;
 }

 // Non-admin visiting an admin-only route → send to dashboard
 if (adminOnly && !user.isAdmin) {
 return <Navigate to="/dashboard" replace />;
 }

 return children;
}

export default ProtectedRoute;
