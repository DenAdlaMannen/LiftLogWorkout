
import { GoogleGenAI, Type } from "@google/genai";
import { Workout } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateWorkout = async (goal: string): Promise<Partial<Workout>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a gym workout routine for the following goal: ${goal}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                targetReps: { type: Type.INTEGER },
                targetWeight: { type: Type.INTEGER },
                sets: { type: Type.INTEGER }
              },
              required: ["name", "targetReps", "targetWeight", "sets"]
            }
          }
        },
        required: ["name", "description", "exercises"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Invalid response from AI");
  }
};
