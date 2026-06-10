import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log(`Testing model: ${modelName}...`);
    const result = await model.generateContent("Hello! Please reply with 'API is working'.");
    const response = await result.response;
    console.log(`Success with ${modelName}! Response:`, response.text());
    return true;
  } catch (error) {
    console.error(`Error with ${modelName}:`, error.message);
    return false;
  }
}

async function runTests() {
  const models = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
  for (const m of models) {
    await testModel(m);
  }
}

runTests();
