
import { GoogleGenAI, Type } from "@google/genai";

// Use gemini-3-flash-preview for basic text generation tasks as per guidelines.
const MODEL_NAME = 'gemini-3-flash-preview';

export const generateListingDescription = async (productName: string, category: string): Promise<string> => {
  // Initialize GoogleGenAI with a named parameter as required.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a cool, punchy, and modern marketplace description for a boys' item named "${productName}" in the category "${category}". Keep it under 150 characters. Use a confident and minimalist tone.`,
    });
    // Use the .text property directly, not as a method.
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI description.";
  }
};

export const suggestPrice = async (productName: string): Promise<number> => {
    // Re-initialize client to ensure latest API key context if needed.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `What is a realistic second-hand marketplace price in USD for "${productName}"? Return ONLY the number.`,
      });
      const text = response.text || "";
      const price = parseFloat(text.replace(/[^0-9.]/g, ''));
      return isNaN(price) ? 0 : price;
    } catch (error) {
      console.error("Gemini Error:", error);
      return 0;
    }
  };

export const analyzeRawInput = async (input: string): Promise<{
    title: string;
    category: string;
    description: string;
    price: string;
    isVehicle: boolean;
} | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Analyze this user input for a marketplace listing: "${input}".
            
            1. Determine the best category from this exact list: [Vozila, Nekretnine, Mobilni uređaji, Odjeća i obuća, Tehnika, Servisi i usluge, Poslovi, Ostalo].
            2. Create a clean, professional Title.
            3. Create a short sales description.
            4. Estimate a price (number only).
            5. Set isVehicle to true if it is a car/motorcycle, else false.

            Return JSON format.`,
            config: { responseMimeType: "application/json" }
        });
        
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
};
