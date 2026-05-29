/**
 * AuthContext.jsx
 * 
 * Global Authentication State Management
 * 
 * This file contains:
 * 1. AuthContext - The container for auth state
 * 2. AuthProvider - Makes auth state available to entire app
 * 3. useAuth hook - Easy access to auth state from any component
 * 
 * Why Context?
 * - Avoids prop drilling (passing props through every component)
 * - Authentication state available EVERYWHERE
 * - Changes to auth state update entire app
 * - Professional architecture
 * 
 * Architecture:
 * App.jsx wrapped in <AuthProvider>
 *   ├─ Navbar can use useAuth()
 *   ├─ DashboardPage can use useAuth()
 *   ├─ LoginPage can use useAuth()
 *   └─ ANY component can use useAuth()
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, logoutUser, signupRequest, loginRequest } from '../services/authService.js';

/**
 * AuthContext: The container for authentication state
 * 
 * This is just a container. We fill it with data in AuthProvider.
 * Think of it like an empty box that we'll put auth data into.
 */
const AuthContext = createContext();

/**
 * AuthProvider: Wrapper component that provides auth state to all children
 * 
 * Props:
 * - children: All components wrapped inside <AuthProvider>
 * 
 * State:
 * - user: Current logged-in user (null if not logged in)
 * - isLoggedIn: Boolean - is user authenticated?
 * - isLoading: Boolean - is auth check happening?
 * - error: String - any auth error
 */
export function AuthProvider({ children }) {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  /**
   * user: The current logged-in user data
   * 
   * Structure when logged in:
   * {
   *   _id: "mongodb_id",
   *   username: "john_debater",
   *   email: "john@example.com",
   *   createdAt: "2024-05-28..."
   * }
   * 
   * Structure when not logged in: null
   */
  const [user, setUser] = useState(null);

  /**
   * isLoggedIn: Simple boolean to track if user is authenticated
   * 
   * Used for:
   * - Checking in components: if (isLoggedIn) {...}
   * - Protected routes
   * - Conditional rendering
   */
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * isLoading: Are we checking authentication?
   * 
   * Used for:
   * - App startup: checking if token still valid
   * - Showing loading spinner
   * - Preventing flash of login page then dashboard
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * error: Any authentication error
   * 
   * Cleared when:
   * - User logs in successfully
   * - User logs out
   */
  const [error, setError] = useState(null);

  // ============================================================
  // INITIALIZATION: Check if user is already logged in
  // ============================================================

  /**
   * useEffect: Runs once when app starts
   * 
   * Purpose:
   * - User might close browser and come back
   * - We have token in localStorage
   * - Need to check if token is still valid
   * - If valid: restore user session (no login needed!)
   * - If invalid: token expired, user needs to login again
   * 
   * Why?
   * - Prevent "flash" of login page then dashboard
   * - Provides seamless user experience
   * - User stays logged in even after browser close
   */
  useEffect(() => {
    restoreUserSession();
  }, []); // Empty dependency array = run only on mount

  /**
   * restoreUserSession: Check if user still logged in
   * 
   * Flow:
   * 1. Get token from localStorage
   * 2. If no token: user not logged in
   * 3. If token exists: verify it's still valid with backend
   * 4. Backend checks token signature and expiration
   * 5. If valid: restore user data
   * 6. If invalid: clear localStorage, user needs to login
   */
  const restoreUserSession = async () => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        // No token = not logged in
        setIsLoading(false);
        return;
      }

      // Token exists! Try to verify it with backend
      const userData = await getCurrentUser();
      
      // Backend confirmed token is valid
      // Restore user session
      setUser(userData);
      setIsLoggedIn(true);
      setError(null);

    } catch (error) {
      // Token invalid or expired
      console.error('Session restore failed:', error);
      
      // Clear localStorage (token is no good)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset state
      setUser(null);
      setIsLoggedIn(false);
      setError(null); // Don't show error on startup
      
    } finally {
      // Whether success or fail, we're done loading
      setIsLoading(false);
    }
  };

  // ============================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================

  /**
   * signup: Handle user registration
   * 
   * Called from:
   * - SignupPage when user clicks "Create Account"
   * 
   * Same flow as login:
   * 1. Set loading state
   * 2. Send signup data to backend via authService
   * 3. Backend creates user + returns token
   * 4. authService stores token in localStorage
   * 5. Update auth state with user data
   * 6. Return user data
   * 
   * @param {object} signupData - { username, email, password }
   * @returns {Promise<object>} - User data
   * @throws {Error} - If signup fails
   */
  const signup = async (signupData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call authService which handles API + token storage
      const data = await signupRequest(signupData);

      // Update auth state with user data
      setUser(data.user || data);
      setIsLoggedIn(true);
      setError(null);

      return data;

    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * login: Handle user login
   * 
   * Called from:
   * - LoginPage when user clicks "Login"
   * 
   * Flow:
   * 1. Set loading state
   * 2. Send credentials via authService
   * 3. Backend validates and returns token
   * 4. authService stores token in localStorage
   * 5. Update auth state with user data
   * 6. Return user data
   * 
   * @param {object} credentials - { email, password }
   * @returns {Promise<object>} - User data
   * @throws {Error} - If login fails
   */
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call authService which handles API + token storage
      const data = await loginRequest(credentials);

      // Update auth state with user data
      setUser(data.user || data);
      setIsLoggedIn(true);
      setError(null);

      return data;

    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * logout: Handle user logout
   * 
   * Called from:
   * - Navbar logout button
   * 
   * Flow:
   * 1. Clear localStorage (token deleted)
   * 2. Clear auth state
   * 3. User is now logged out
   */
  const logout = () => {
    logoutUser(); // Clear localStorage
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
  };

  // ============================================================
  // PROVIDE DATA TO ALL CHILDREN
  // ============================================================

  /**
   * Context value: What data is available to all components
   * 
   * Components access via: const { user, login, logout } = useAuth();
   * 
   * Value includes:
   * - user: Current user object
   * - isLoggedIn: Boolean
   * - isLoading: Boolean (auth check in progress)
   * - error: Error message if any
   * - login: Function to login
   * - signup: Function to signup
   * - logout: Function to logout
   */
  const value = {
    user,
    isLoggedIn,
    isLoading,
    error,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// CUSTOM HOOK: useAuth
// ============================================================

/**
 * useAuth: Custom hook to access auth state
 * 
 * Usage in any component:
 * function MyComponent() {
 *   const { user, isLoggedIn, logout } = useAuth();
 *   
 *   if (isLoggedIn) {
 *     return <div>Welcome, {user.username}</div>;
 *   }
 *   return <div>Please login</div>;
 * }
 * 
 * Benefits:
 * - No prop drilling
 * - Clean syntax
 * - Available everywhere (inside AuthProvider)
 * 
 * @returns {object} - Auth context value
 * @throws {Error} - If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth() must be used inside <AuthProvider>. ' +
      'Make sure your app is wrapped with AuthProvider in main.jsx'
    );
  }

  return context;
}

export default AuthContext;
