import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildDebatePrompt } from '../config/promptTemplates.js';
import { getPersonality } from '../config/personalityConfig.js';

/**
 * AI Service Layer
 * 
 * This file acts as the boundary between our application and the Google Gemini API.
 * 
 * Why do we have this?
 * 1. Security: API keys stay on the server.
 * 2. Abstraction: If we ever switch to OpenAI, we only change this file, not the whole app.
 * 3. Error Handling: Centralized place to handle rate limits and timeouts.
 */

// Initialize the Gemini client.
const getAIClient = () => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured in .env');
  }
  return new GoogleGenerativeAI(apiKey);
};

const MODELS_TO_TRY = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-2.0-flash',
  'gemini-flash-latest'
];

const logGeminiEvent = (event, meta) => {
  console.info(`[Gemini] ${event}`, meta);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const executeWithFallback = async (genAI, prompt, generationConfig) => {
  let lastError;
  const maxRetries = 2; // Try each model up to 3 times total
  
  for (const modelName of MODELS_TO_TRY) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig 
        });
        console.info(`[Gemini] Attempting request with model: ${modelName} (Attempt ${attempt + 1})`);
        const result = await model.generateContent(prompt);
        return await result.response;
      } catch (error) {
        console.warn(`[Gemini] Model ${modelName} failed on attempt ${attempt + 1}:`, error.message);
        lastError = error;
        
        // Fatal errors - don't try other models
        if (error.status === 400 || error.status === 401 || error.status === 403) {
          throw error; 
        }
        
        // Not Found - model doesn't exist, break loop to try next model immediately
        if (error.status === 404 || error.message.includes('404')) {
          break;
        }

        // Rate limit or Service Unavailable - wait and retry
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.info(`[Gemini] Waiting ${Math.round(delay)}ms before retrying...`);
          await sleep(delay);
        }
      }
    }
  }
  throw lastError;
};

export const aiService = {

  /**
   * Generates a conversational response from the AI.
   * @param {Array} history - The chat history
   * @param {String} personaId - The ID of the personality (e.g., 'coach')
   * @param {String} currentTopic - The topic of the debate
   * @param {String} userMessage - The latest user message
   */
  generateDebateResponse: async (history, personaId, currentTopic, userMessage) => {
    const genAI = getAIClient();
    
    const persona = getPersonality(personaId);
    const fullPrompt = buildDebatePrompt(persona, history, currentTopic, userMessage);

    logGeminiEvent('generateDebateResponse.request', {
      temperature: 0.7,
      persona: personaId,
      topic: currentTopic,
      historyLength: history.length,
    });

    try {
      const response = await executeWithFallback(genAI, fullPrompt, { temperature: 0.7 });
      const text = response.text();

      console.info('[Gemini] generateDebateResponse.success', {
        responseLength: text.length,
      });
      return text;
    } catch (error) {
      console.error('AI Service Error (generateDebateResponse):', error.message || error);
      throw new Error(`Gemini generateDebateResponse failed: ${error.message || error}`);
    }
  },

  /**
   * Evaluates a completed debate and forces the AI to output strictly structured JSON.
   */
  evaluateDebate: async (messages) => {
    const genAI = getAIClient();

    const historyText = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `You are an expert debate judge and logician.
Analyze the following debate history between a User and an AI.

DEBATE HISTORY:
${historyText}

INSTRUCTIONS:
Evaluate the User's performance. You must return your evaluation strictly as a valid JSON object matching this exact structure, with no markdown formatting around it:
{
  "logicScore": <number 0-10>,
  "evidenceScore": <number 0-10>,
  "persuasionScore": <number 0-10>,
  "clarityScore": <number 0-10>,
  "winner": "<'user' or 'ai' or 'draw'>",
  "summary": "<A 2-sentence summary of the debate and why the winner won>",
  "fallacies": [
    { "name": "<Name of fallacy>", "explanation": "<Why the user committed this fallacy>" }
  ],
  "feedback": "<1 paragraph of constructive feedback for the user>"
}`;

    logGeminiEvent('evaluateDebate.request', {
      temperature: 0.0,
      historyLength: messages.length,
    });

    try {
      const response = await executeWithFallback(genAI, prompt, { 
        temperature: 0.0,
        responseMimeType: "application/json"
      });
      const text = response.text();

      console.info('[Gemini] evaluateDebate.success', {
        responseLength: text.length,
      });

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('AI Service Error (evaluateDebate.parse): invalid JSON', parseError.message);
        console.error('Gemini raw response:', text);
        throw new Error(`Gemini evaluateDebate returned invalid JSON: ${parseError.message}`);
      }
    } catch (error) {
      console.error('AI Service Error (evaluateDebate):', error.message || error);
      console.error('Full error stack:', error);
      throw new Error(`Gemini evaluateDebate failed: ${error.message || error}`);
    }
  },
  
  /**
   * Generates a list of debate topics based on a category.
   */
  generateTopics: async (category) => {
    // ... [existing generateTopics code] ...
    const genAI = getAIClient();

    const prompt = `Generate 5 highly controversial and interesting debate topics in the category of "${category}".
Return as a JSON array of strings only, no other text. Example: ["Topic 1", "Topic 2"]`;

    logGeminiEvent('generateTopics.request', {
      temperature: 0.9,
      category,
    });

    try {
      const response = await executeWithFallback(genAI, prompt, { temperature: 0.9 });
      const text = response.text();

      console.info('[Gemini] generateTopics.success', {
        responseLength: text.length,
      });

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('AI Service Error (generateTopics.parse): invalid JSON', parseError.message);
        console.error('Gemini raw response:', text);
        throw new Error(`Gemini generateTopics returned invalid JSON: ${parseError.message}`);
      }
    } catch (error) {
      console.error('AI Service Error (generateTopics):', error.message || error);
      console.error('Full error stack:', error);
      throw new Error(`Gemini generateTopics failed: ${error.message || error}`);
    }
  },

  /**
   * Evaluates a multiplayer group debate and ranks participants.
   */
  evaluateGroupDebate: async (messages) => {
    const genAI = getAIClient();

    const historyText = messages.map(m => `${m.sender} (${m.userId}): ${m.text}`).join('\n');
    const prompt = `You are an expert debate judge and logician.
Analyze the following live group debate transcript.

DEBATE HISTORY:
${historyText}

INSTRUCTIONS:
Evaluate the performance of EACH participant. Rank them from 1st place to last place based on their logic, evidence, and persuasion.
You must return your evaluation strictly as a valid JSON object matching this exact structure, with no markdown formatting around it:
{
  "summary": "<A 2-3 sentence summary of the group debate and the prevailing arguments>",
  "rankings": [
    {
      "userId": "<The exact userId provided in the transcript>",
      "username": "<The exact username/sender provided in the transcript>",
      "rank": <number, 1 for winner, 2 for second, etc.>,
      "logicScore": <number 0-10>,
      "feedback": "<1 paragraph of constructive feedback for this specific user>"
    }
  ]
}`;

    logGeminiEvent('evaluateGroupDebate.request', {
      temperature: 0.0,
      historyLength: messages.length,
    });

    try {
      const response = await executeWithFallback(genAI, prompt, { 
        temperature: 0.0,
        responseMimeType: "application/json"
      });
      const text = response.text();

      console.info('[Gemini] evaluateGroupDebate.success', {
        responseLength: text.length,
      });

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('AI Service Error (evaluateGroup.parse): invalid JSON', parseError.message);
        console.error('Gemini raw response:', text);
        throw new Error(`Gemini evaluateGroupDebate returned invalid JSON: ${parseError.message}`);
      }
    } catch (error) {
      console.error('AI Service Error (evaluateGroupDebate):', error.message || error);
      throw new Error(`Gemini evaluateGroupDebate failed: ${error.message || error}`);
    }
  }

};
