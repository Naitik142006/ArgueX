export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = data.message || 'Server error';
    throw new Error(error);
  }
  return data;
};
