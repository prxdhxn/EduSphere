
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  /**
   * Generates a quiz based on a given topic using Gemini
   */
  async generateQuiz(topic: string, count: number = 5) {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-preview',
      contents: `Generate a quiz with ${count} questions about: ${topic}. 
      The output must be a valid JSON array of objects with the following structure:
      {
        "text": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0 (index of the correct option)
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER }
            },
            required: ["text", "options", "correctAnswer"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      return [];
    }
  },

  /**
   * Summarizes notes or explains concepts
   */
  async explainConcept(concept: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the following educational concept in a simple, easy-to-understand way for a student: ${concept}. 
      Use bullet points for key takeaways. Keep it under 200 words.`,
    });
    return response.text;
  }
};
