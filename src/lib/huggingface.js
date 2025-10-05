import { auth } from "./firebase";
import { getChatResponse } from "./gemini";

export const analyzeWithFlanT5 = async (text) => {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  try {
    if (!navigator.onLine) {
      throw new Error("No internet connection detected. Please check your network settings.");
    }

    return await getChatResponse(`Analyze this document and provide a summary: ${text}`);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};