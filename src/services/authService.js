import { API_URL, handleResponse } from './api.js';

export const signupRequest = async (signupData) => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signupData),
  });
  return handleResponse(response);
};

export const loginRequest = async (loginData) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData),
  });
  return handleResponse(response);
};
