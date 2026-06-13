/**
 * API Layer for ArgueX
 * * This file is the BRAIN of frontend-backend communication.
 * All HTTP requests go through here.
 * * Benefits:
 * - Centralized configuration (change BASE_URL once)
 * - Consistent error handling everywhere
 * - Easy to add authentication headers
 * - Reusable across all components
 * - Professional architecture
 */

// ============================================================
// CONFIGURATION
// ============================================================

/**
 * BASE_URL: The root address of our backend
 * * When we're developing: http://localhost:5000
 * When deployed: https://arguex-backend.com
 * * Change this ONE place, works everywhere!
 */
const API_BASE_URL = `/api`;

/**
 * API timeout in milliseconds
 * If request takes longer, cancel it
 */
const REQUEST_TIMEOUT = 10000; // 10 seconds

// ============================================================
// HELPER FUNCTION: Generic fetch wrapper
// ============================================================

/**
 * makeRequest()
 * * This is the CORE function that handles ALL network communication.
 * * Why separate it?
 * - Consistency: All requests follow same pattern
 * - Error handling: All errors handled same way
 * - Token injection: Add auth token to EVERY request automatically
 * - Debugging: Easy to log all requests
 * * @param {string} endpoint - The API endpoint (e.g.,'/auth/login')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} body - Data to send (for POST/PUT)
 * @returns {Promise<object>} - Response data from backend
 * * @throws {Error} - If request fails
 */
async function makeRequest(endpoint, method ='GET', body = null) {
 try {
 // STEP 1: Prepare the request
 const url =`${API_BASE_URL}${endpoint}`;
 const options = {
 method,
 headers: {'Content-Type':'application/json',
 },
 };

 // STEP 2: Add authentication token if it exists
 // (User logged in = token in localStorage)
 const token = localStorage.getItem('token');
 if (token) {
 options.headers['Authorization'] =`Bearer ${token}`;
 }

 // STEP 3: Add body if it's POST/PUT request
 if (body) {
 options.body = JSON.stringify(body);
 }

 // STEP 4: Make the actual HTTP request
 console.log(`📤 [${method}] ${url}`);
 const response = await fetch(url, options);

 // STEP 5: Handle HTTP errors (404, 500, etc.)
 if (!response.ok) {
 // Response says error (status 400, 401, 500, etc.)
 let errorData;
 try {
 errorData = await response.json();
 } catch {
 errorData = { message:'Unknown error' };
 }

 const error = new Error(errorData.message ||`HTTP ${response.status}`);
 error.status = response.status;
 error.data = errorData;
 console.error(`❌ Error [${response.status}]:`, errorData);
 throw error;
 }

 // STEP 6: Parse and return successful response
 const data = await response.json();
 console.log(`✅ Response:`, data);
 return data;

 } catch (error) {
 // Network error or JSON parse error
 console.error('🚨 Request failed:', error);
 throw error;
 }
}

// ============================================================
// AUTHENTICATION API CALLS
// ============================================================

/**
 * AUTH: Signup
 * * What happens:
 * 1. Frontend sends email, password, username to backend
 * 2. Backend hashes password with bcryptjs
 * 3. Backend creates new user in MongoDB
 * 4. Backend returns token + user data
 * 5. Frontend stores token in localStorage
 * 6. User is now logged in!
 * * @param {string} email - User's email
 * @param {string} password - User's password (will be hashed on backend)
 * @param {string} username - User's display name
 * @returns {Promise<object>} - { token, user: {_id, username, email} }
 */
const authAPI = {
 signup: async (email, password, username) => {
 return makeRequest('/auth/signup','POST', {
 email,
 password,
 username, // Backend expects'username', not'name'
 });
 },

 /**
 * AUTH: Login
 * * What happens:
 * 1. Frontend sends email + password
 * 2. Backend finds user by email in MongoDB
 * 3. Backend compares password with bcryptjs
 * 4. If match: create JWT token, return token + user
 * 5. If no match: return 401 error
 * * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} - { token, user }
 */
 login: async (email, password) => {
 return makeRequest('/auth/login','POST', {
 email,
 password,
 });
 },

 /**
 * AUTH: Get current logged-in user
 * * What happens:
 * 1. Frontend sends request with token in header
 * 2. Backend middleware verifies token
 * 3. Backend extracts userId from token
 * 4. Backend fetches user from MongoDB
 * 5. Returns user data
 * * Used for:
 * - Loading user profile on app startup
 * - Checking if user is still logged in
 * - Getting fresh user data
 * * @returns {Promise<object>} - { _id, email, name, createdAt }
 */
 getMe: async () => {
 return makeRequest('/auth/me','GET');
 },

 /**
 * AUTH: Logout
 * * What happens:
 * 1. Frontend clears token from localStorage
 * 2. Frontend navigates to login page
 * 3. Backend doesn't really"logout" (tokens don't have sessions)
 * 4. Token just expires after 7 days (set in backend)
 * * Note: Most of logout happens in FRONTEND
 */
 logout: async () => {
 // Clear token from frontend
 localStorage.removeItem('token');
 localStorage.removeItem('user');
 // Backend doesn't need to know - token just becomes invalid
 },
};

// ============================================================
// DEBATE API CALLS
// ============================================================

const debateAPI = {
 /**
 * Get all debates
 * * What happens:
 * 1. Frontend requests all debates
 * 2. Backend queries MongoDB collection'debates'
 * 3. Returns array of debates
 * * Used for:
 * - Dashboard page (show all active debates)
 * - Debate list view
 * * @returns {Promise<array>} - [{ _id, title, creator, createdAt, ... }]
 */
 getAll: async () => {
 return makeRequest('/debates','GET');
 },

 /**
 * Get single debate by ID
 * * What happens:
 * 1. Frontend requests debate with specific ID
 * 2. Backend finds debate in MongoDB
 * 3. Returns debate data including all messages
 * * Used for:
 * - DebatePage (show specific debate conversation)
 * * @param {string} debateId - The debate's MongoDB ID
 * @returns {Promise<object>} - { _id, title, messages: [], creator, ... }
 */
 getById: async (debateId) => {
 return makeRequest(`/debates/${debateId}`,'GET');
 },

 /**
 * Create new debate
 * * What happens:
 * 1. Frontend sends title + description
 * 2. Backend creates debate document in MongoDB
 * 3. Backend sets creator to current user (from token)
 * 4. Backend initializes empty messages array
 * 5. Returns created debate
 * * Used for:
 * -"Create Debate" button on dashboard
 * * @param {string} title - Debate title
 * @param {string} description - Debate description
 * @returns {Promise<object>} - Created debate object
 */
 create: async (topic) => {
 return makeRequest('/debates','POST', {
 topic,
 });
 },

 /**
 * Update debate
 * * @param {string} debateId - Debate to update
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated debate
 */
 update: async (debateId, updates) => {
 return makeRequest(`/debates/${debateId}`,'PUT', updates);
 },

 /**
 * Delete debate
 * * @param {string} debateId - Debate to delete
 * @returns {Promise<object>} - Confirmation
 */
 delete: async (debateId) => {
 return makeRequest(`/debates/${debateId}`,'DELETE');
 },
};

// ============================================================
// MESSAGE API CALLS (For debates)
// ============================================================

const messageAPI = {
 /**
 * Send message in a debate
 * * What happens:
 * 1. Frontend sends message text + debateId
 * 2. Backend finds debate in MongoDB
 * 3. Backend creates message object with:
 * - text: user's message
 * - sender: current user ID (from token)
 * - createdAt: timestamp
 * 4. Backend pushes message to debate.messages array
 * 5. Backend saves debate document
 * 6. Returns updated debate with new message
 * * Used for:
 * - Sending debate messages
 * * @param {string} debateId - Which debate
 * @param {string} text - Message content
 * @returns {Promise<object>} - Updated debate with new message
 */
 send: async (debateId, text) => {
 return makeRequest(`/debates/${debateId}`,'POST', {
 text,
 });
 },

 /**
 * Get all messages in a debate
 * * @param {string} debateId - Which debate
 * @returns {Promise<array>} - Array of messages
 */
 getAll: async (debateId) => {
 return makeRequest(`/debates/${debateId}`,'GET');
 },
};

// ============================================================
// USER API CALLS
// ============================================================

const userAPI = {
 /**
 * Get user profile
 * * @param {string} userId - User's MongoDB ID
 * @returns {Promise<object>} - User data
 */
 getProfile: async (userId) => {
 return makeRequest(`/users/${userId}`,'GET');
 },

 /**
 * Update user profile
 * * @param {string} userId - User's MongoDB ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated user
 */
 updateProfile: async (userId, updates) => {
 return makeRequest(`/users/${userId}`,'PUT', updates);
 },

 /**
 * Get global leaderboard
 */
 getLeaderboard: async () => {
 return makeRequest('/users/leaderboard','GET');
 },

 /**
 * Get personal analytics
 */
 getAnalytics: async () => {
 return makeRequest('/users/me/analytics','GET');
 },

 /**
 * Get user's debate history
 * * @param {string} userId - User's MongoDB ID
 * @returns {Promise<array>} - User's debates
 */
 getDebateHistory: async (userId) => {
 return makeRequest(`/users/${userId}/debates`,'GET');
 },
};

// ============================================================
// AI API CALLS
// ============================================================

const aiAPI = {
 /**
 * Generate debate topics
 */
 getTopics: async (category) => {
 return makeRequest('/ai/topics','POST', { category });
 },

 /**
 * Trigger AI to reply to a debate
 */
 getReply: async (debateId) => {
 return makeRequest(`/ai/${debateId}/reply`,'POST');
 },

 /**
 * Analyze and score a completed debate
 */
 analyze: async (debateId) => {
 return makeRequest(`/ai/${debateId}/analyze`,'POST');
 }
};

// ============================================================
// EXPORT: Make API available to entire app
// ============================================================

/**
 * Export all API functions grouped by category
 * * Usage in components:
 * import { authAPI, debateAPI } from'@/services/api';
 * * await authAPI.login(email, password);
 * await debateAPI.getAll();
 * await messageAPI.send(debateId, text);
 */
export { authAPI, debateAPI, messageAPI, userAPI, aiAPI };

// Also export makeRequest for custom API calls
export default makeRequest;
