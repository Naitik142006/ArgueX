/**
 * Prompt Engineering & Context Management
 * 
 * This file handles the construction of the final prompt sent to the LLM.
 * 
 * CORE PRINCIPLES OF PROMPT ENGINEERING USED HERE:
 * 1. Role Assignment: "You are [Persona]" - Grounds the AI in a specific behavior.
 * 2. Strict Constraints: "Do NOT do X, ALWAYS do Y" - Prevents hallucinations and off-topic tangents.
 * 3. Context Management: We limit the history to the last N messages to fit the Context Window.
 * 4. Formatting Instructions: Telling the AI exactly how to structure its output.
 */

// Maximum number of previous messages to send to the AI to prevent exceeding Token Limits.
const MAX_CONTEXT_MESSAGES = 10;

/**
 * Builds the comprehensive system and user prompt for a debate reply.
 * 
 * @param {Object} persona - The personality object from personalityConfig.js
 * @param {Array} history - Array of previous message objects { sender, text }
 * @param {String} currentTopic - The topic being debated
 * @param {String} userMessage - The latest message from the user
 * @returns {String} - The fully assembled prompt
 */
export const buildDebatePrompt = (persona, history, currentTopic, userMessage) => {
  // 1. SYSTEM PROMPT (The Invisible Instructions)
  let prompt = `SYSTEM INSTRUCTIONS:
${persona.basePrompt}

CRITICAL RULES:
1. You are debating the topic: "${currentTopic}". Stay strictly on topic.
2. Keep your response concise (under 150 words). This is a fast-paced debate.
3. Do not act like an AI assistant. You are fully embodying the persona.
4. Do not offer to help or ask "How can I assist you?". Only debate.

`;

  // 2. CONTEXT MANAGEMENT (Memory)
  prompt += `--- PREVIOUS CONVERSATION HISTORY ---\n`;
  
  if (!history || history.length === 0) {
    prompt += `(No previous history. This is the start of the debate.)\n`;
  } else {
    // We trim the history array to only include the last MAX_CONTEXT_MESSAGES
    // to save tokens and keep the AI focused on the immediate context.
    const trimmedHistory = history.slice(-MAX_CONTEXT_MESSAGES);
    
    trimmedHistory.forEach(msg => {
      // Differentiate between User and AI in the history
      const role = msg.sender === 'User' ? 'User' : persona.name;
      prompt += `${role}: ${msg.text}\n`;
    });
  }
  
  prompt += `-------------------------------------\n\n`;

  // 3. USER PROMPT (The immediate input to respond to)
  prompt += `LATEST USER MESSAGE:\nUser: ${userMessage}\n\n`;
  prompt += `Now, generate your response as ${persona.name}:`;

  return prompt;
};
