import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 32000; // 32 seconds
const REQUEST_QUEUE = [];
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForRequestSlot() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();
}

async function retryWithExponentialBackoff(fn, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
  try {
    await waitForRequestSlot();
    return await fn();
  } catch (error) {
    if (retries === 0) {
      if (error.message.includes('429')) {
        throw new Error('API rate limit reached. Please try again in a few moments.');
      }
      throw error;
    }
    
    if (error.message.includes('429')) {
      const nextDelay = Math.min(delay * 2, MAX_RETRY_DELAY);
      console.log(`Rate limited. Retrying in ${nextDelay}ms...`);
      await sleep(nextDelay);
      return retryWithExponentialBackoff(fn, retries - 1, nextDelay);
    }
    
    throw error;
  }
}

export async function getChatResponse(message, imageData = null) {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please check your environment variables.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const chat = model.startChat();

  try {
    const result = await retryWithExponentialBackoff(async () => {
      if (imageData) {
        const { mimeType, data } = imageData;
        return await chat.sendMessageStream([
          message,
          {
            inlineData: {
              mimeType,
              data
            }
          }
        ]);
      }
      return await chat.sendMessage(message);
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in Gemini API:", error);
    if (error.message.includes("NOT_FOUND")) {
      throw new Error("Unable to connect to Gemini API. Please check your API key and try again.");
    } else if (error.message.includes("INVALID_ARGUMENT")) {
      throw new Error("Invalid request. Please check your input and try again.");
    } else if (error.message.includes("PERMISSION_DENIED")) {
      throw new Error("Access denied. Please check your API key permissions.");
    } else if (error.message.includes("400")) {
      throw new Error("Bad request. Please check your input format and API configuration.");
    } else if (error.message.includes("429")) {
      throw new Error("API rate limit reached. Please try again later.");
    } else if (error.message.includes("DOCUMENT_TOO_LARGE")) {
      throw new Error("Document exceeds size limit. Please try with a smaller document.");
    }
    throw new Error(`API request failed: ${error.message}`);
  }
}