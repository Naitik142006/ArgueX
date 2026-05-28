import { API_URL, authHeader, handleResponse } from './api.js';

export const createDebateRequest = async (topic, token) => {
  const response = await fetch(`${API_URL}/api/debates`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ topic }),
  });
  return handleResponse(response);
};

export const addDebateMessageRequest = async (debateId, text, token) => {
  const response = await fetch(`${API_URL}/api/debates/${debateId}`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ text }),
  });
  return handleResponse(response);
};

export const fetchUserDebates = async (token) => {
  const response = await fetch(`${API_URL}/api/debates`, {
    method: 'GET',
    headers: authHeader(token),
  });
  return handleResponse(response);
};
