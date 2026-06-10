import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

async function listModels() {
  try {
    const fetch = globalThis.fetch;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.AI_API_KEY}`);
    const data = await response.json();
    console.log("Available models:");
    data.models.forEach(m => {
      console.log(`- ${m.name.replace('models/', '')} (supported: ${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch (e) {
    console.error("Failed to list models:", e);
  }
}

listModels();
