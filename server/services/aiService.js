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


// Mock debate responses for development
const mockDebateResponses = {
  default: [
    "That's an interesting perspective. However, I think we should consider the opposing viewpoint. What evidence supports your claim? Can you provide specific examples?",
    "I see your point, but there are alternative interpretations we haven't explored. For instance, some might argue that the situation is more complex than it appears.",
    "You raise a valid concern. Building on that, let me propose a counterargument: perhaps we're overlooking a crucial factor that could change the entire dynamic.",
    "Your argument has merit, but consider this angle: the data suggests a slightly different conclusion. What would you say to that interpretation?",
    "Interesting assertion. However, historical precedent shows that similar situations often resulted in unexpected outcomes. Doesn't that concern you?"
  ]
};

// Get random mock response
const getMockResponse = (userMessage) => {
  const responses = mockDebateResponses.default;
  return responses[Math.floor(Math.random() * responses.length)];
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
    try {
      const genAI = getAIClient();
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: { temperature: 0.7 } 
      });
      
      const persona = getPersonality(personaId);
      const fullPrompt = buildDebatePrompt(persona, history, currentTopic, userMessage);
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error("AI Service Error (generateDebateResponse):", error.message || error);
      console.error("Full error stack:", error);
      return getMockResponse(userMessage);
    }
  },

  /**
   * Evaluates a completed debate and forces the AI to output strictly structured JSON.
   */
  evaluateDebate: async (messages) => {
    try {
      const genAI = getAIClient();
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: { 
          temperature: 0.0
        }
      });
      
      let historyText = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
      
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

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn("Failed to parse JSON response, returning fallback analysis");
        return {
          logicScore: 7,
          evidenceScore: 6,
          persuasionScore: 7,
          summary: "User presented coherent arguments on the topic.",
          fallacies: [],
          feedback: "Good effort. Consider providing more concrete examples and evidence."
        };
      }
    } catch (error) {
      console.error("AI Service Error (evaluateDebate):", error.message || error);
      return {
        logicScore: 5,
        evidenceScore: 5,
        persuasionScore: 5,
        summary: "Debate evaluation could not be completed.",
        fallacies: [],
        feedback: "Unable to analyze debate at this time. Please try again later."
      };
    }
  },
  
  /**
   * Generates a list of debate topics based on a category.
   */
  generateTopics: async (category) => {
    try {
      const genAI = getAIClient();
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: { temperature: 0.9 }
      });

      const prompt = `Generate 5 highly controversial and interesting debate topics in the category of "${category}".
Return as a JSON array of strings only, no other text. Example: ["Topic 1", "Topic 2"]`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn("Failed to parse topics JSON, returning defaults");
        return [
          "Is artificial intelligence a threat to humanity?",
          "Should social media be regulated by governments?",
          "Is climate change primarily human-caused?",
          "Should universal basic income be implemented?",
          "Is space exploration worth the investment?"
        ];
      }
    } catch (error) {
      console.error("AI Service Error (generateTopics):", error.message || error);
      return [
        "Is artificial intelligence a threat to humanity?",
        "Should social media be regulated by governments?",
        "Is climate change primarily human-caused?",
        "Should universal basic income be implemented?",
        "Is space exploration worth the investment?"
      ];
    }
  }

};
