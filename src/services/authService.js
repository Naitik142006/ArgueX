/**
 * Authentication Service for ArgueX
 * * Bridges between components and API layer.
 * Handles auth-specific logic like token storage.
 */

import { authAPI } from'./api.js';

/**
 * SIGNUP REQUEST
 * * Flow:
 * 1. Receives email, password, name from component
 * 2. Calls authAPI.signup() (which handles network)
 * 3. On success: extracts token and stores it
 * 4. Returns response to component
 * 5. Component can then navigate to dashboard
 * * @param {object} signupData - { email, password, name }
 * @returns {Promise<object>} - { token, user }
 */
export const signupRequest = async (signupData) => {
 try {
 const response = await authAPI.signup(
 signupData.email,
 signupData.password,
 signupData.username // Pass username from component
 );
 // Store token for future requests
 if (response.token) {
 localStorage.setItem('token', response.token);
 localStorage.setItem('user', JSON.stringify(response.user));
 }
 return response;
 } catch (error) {
 console.error('Signup failed:', error);
 throw error;
 }
};

/**
 * LOGIN REQUEST
 * * Flow:
 * 1. Receives email and password from component
 * 2. Calls authAPI.login() (which handles network)
 * 3. On success: stores token
 * 4. Returns response to component
 * * @param {object} loginData - { email, password }
 * @returns {Promise<object>} - { token, user }
 */
export const loginRequest = async (loginData) => {
 try {
 const response = await authAPI.login(loginData.email, loginData.password);
 // Store token for future requests
 if (response.token) {
 localStorage.setItem('token', response.token);
 localStorage.setItem('user', JSON.stringify(response.user));
 }
 return response;
 } catch (error) {
 console.error('Login failed:', error);
 throw error;
 }
};

/**
 * GET CURRENT USER
 * * Used to:
 * - Check if user is still logged in
 * - Restore user data on app reload
 * - Verify token is valid
 * * @returns {Promise<object>} - { _id, email, username, ... }
 */
export const getCurrentUser = async () => {
 try {
 const user = await authAPI.getMe();
 localStorage.setItem('user', JSON.stringify(user));
 return user;
 } catch (error) {
 console.error('Failed to get current user:', error);
 // If token is invalid, clear it
 if (error.status === 401) {
 localStorage.removeItem('token');
 localStorage.removeItem('user');
 }
 throw error;
 }
};

/**
 * LOGOUT
 * * Clears user session from frontend
 */
export const logoutUser = () => {
 authAPI.logout();
};
