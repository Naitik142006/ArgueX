import { debateAPI, messageAPI, aiAPI } from './api.js';

/**
 * Create Debate Request
 * 
 * Calls the backend to create a new debate
 * 
 * @param {string} topic - Debate topic
 * @returns {Promise<object>} - Created debate
 */
export const createDebateRequest = async (topic) => {
  try {
    return await debateAPI.create(topic);
  } catch (error) {
    console.error('Create debate failed:', error);
    throw error;
  }
};

/**
 * Add Debate Message Request
 * 
 * Calls the backend to add a message to a debate
 * 
 * @param {string} debateId - Debate ID
 * @param {string} text - Message text
 * @returns {Promise<object>} - Updated debate
 */
export const addDebateMessageRequest = async (debateId, text) => {
  try {
    return await messageAPI.send(debateId, text);
  } catch (error) {
    console.error('Add message failed:', error);
    throw error;
  }
};

/**
 * Fetch User Debates
 * 
 * Calls the backend to get all debates for current user
 * 
 * @returns {Promise<array>} - User's debates
 */
export const fetchUserDebates = async () => {
  try {
    return await debateAPI.getAll();
  } catch (error) {
    console.error('Fetch debates failed:', error);
    throw error;
  }
};

/**
 * Trigger AI Reply
 */
export const requestAIReply = async (debateId) => {
  try {
    return await aiAPI.getReply(debateId);
  } catch (error) {
    console.error('AI reply failed:', error);
    throw error;
  }
};

/**
 * Analyze Debate
 */
export const requestDebateAnalysis = async (debateId) => {
  try {
    return await aiAPI.analyze(debateId);
  } catch (error) {
    console.error('AI analyze failed:', error);
    throw error;
  }
};
