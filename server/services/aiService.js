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

const GEMINI_MODEL = 'gemini-2.5-flash';

const logGeminiEvent = (event, meta) => {
  console.info(`[Gemini] ${event}`, Object.assign({ model: GEMINI_MODEL }, meta));
};

export const aiService = {

  /**
   * Generates a conversational response from the AI.
   * @param {Array} history - The chat history
   * @param {String} personaId - The ID of the personality (e.g., 'einstein')
   * @param {String} currentTopic - The topic of the debate
   * @param {String} userMessage - The latest user message
   */
  generateDebateResponse: async (history, personaId, currentTopic, userMessage) => {
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: { temperature: 0.7 } 
    });

    const persona = getPersonality(personaId);
    const fullPrompt = buildDebatePrompt(persona, history, currentTopic, userMessage);

    logGeminiEvent('generateDebateResponse.request', {
      temperature: 0.7,
      persona: personaId,
      topic: currentTopic,
      historyLength: history.length,
    });

    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      console.info('[Gemini] generateDebateResponse.success', {
        responseLength: text.length,
      });
      return text;
    } catch (error) {
      console.error('AI Service Error (generateDebateResponse):', error.message || error);
      console.error('Full error stack:', error);
      throw new Error(`Gemini generateDebateResponse failed: ${error.message || error}`);
    }
  },

  /**
   * Evaluates a completed debate and forces the AI to output strictly structured JSON.
   */
  evaluateDebate: async (messages) => {
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: { temperature: 0.0 }
    });

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
  "summary": "<A 2-sentence summary of the user's main arguments>",
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
      const result = await model.generateContent(prompt);
      const text = await result.response.text();

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
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: { temperature: 0.9 }
    });

    const prompt = `Generate 5 highly controversial and interesting debate topics in the category of "${category}".
Return as a JSON array of strings only, no other text. Example: ["Topic 1", "Topic 2"]`;

    logGeminiEvent('generateTopics.request', {
      temperature: 0.9,
      category,
    });

    try {
      const result = await model.generateContent(prompt);
      const text = await result.response.text();

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
  }

};
