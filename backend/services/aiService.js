import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const PRIMARY_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"

/**
 * Custom retry helper with exponential backoff
 */
const withRetry = async (fn, modelName, retries = 3, delay = 5000) => {
  try {
    return await fn();
  } catch (error) {
    const status = error.status || (error.response && error.response.status);
    
    // 400 = bad request — don't retry, fail fast
    // 429, 500, 503 are retryable
    const isRetryable = status === 503 || status === 429 || status === 500 || !status;
    
    if (retries > 0 && isRetryable) {
      console.warn(`[AI SERVICE] [${modelName}] Retrying after error ${status || 'Network/Unknown'}. ${retries} attempts left...`);
      // Wait for the specified delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, modelName, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Main AI call wrapper - Updated to use Groq API
 */
export const callAI = async (prompt, options = {}) => {
  if (!GROQ_API_KEY) {
    throw new Error("[AI SERVICE] GROQ_API_KEY is missing in .env");
  }

  const groq = new Groq({ apiKey: GROQ_API_KEY });
  const modelName = PRIMARY_MODEL;

  try {
    console.log(`[AI SERVICE] [GROQ] Attempting ${modelName}...`);
    
    const result = await withRetry(async () => {
      return await groq.chat.completions.create({
        messages: [
          { role: "user", content: prompt }
        ],
        model: modelName,
      });
    }, modelName);

    if (!result.choices || result.choices.length === 0) {
      throw new Error("AI response blocked or empty choices list");
    }

    const responseText = result.choices[0]?.message?.content;
    if (!responseText) throw new Error("Empty response text");
    
    console.log(`[AI SERVICE] [GROQ] Success with ${modelName}`);
    return responseText.trim();
  } catch (error) {
    console.error(`[AI SERVICE] [GROQ] ${modelName} failed. Error: ${error.message}`);
    throw error;
  }
};
/**
 * Helper to clean JSON from AI response
 */
export const parseAIJSON = (text) => {
  try {
    let cleaned = text.trim();
    // Handle markdown code blocks
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    
    // Fix common AI JSON errors
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1'); // Trailing commas
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("AI JSON Parse Error:", error, "Text:", text);
    throw new Error("AI returned invalid JSON format");
  }
};
