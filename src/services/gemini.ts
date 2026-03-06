import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TestCase {
  id: string;
  title: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  priority: "Low" | "Medium" | "High";
  type: "Functional" | "UI" | "Security" | "Performance" | "Edge Case";
}

export async function generateTestCases(requirement: string): Promise<TestCase[]> {
  const model = "gemini-3.1-pro-preview";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `You are an expert QA Engineer. Generate a list of comprehensive, high-quality test cases for the following software requirement:
      
      "${requirement}"
      
      Include functional, UI, security, and edge case scenarios. Ensure steps are clear and expected results are precise.
      
      Return ONLY a JSON array of objects with this structure:
      {
        "id": "TC-001",
        "title": "Short descriptive title",
        "preconditions": ["List of preconditions"],
        "steps": ["Step 1", "Step 2", ...],
        "expectedResult": "What should happen",
        "priority": "Low" | "Medium" | "High",
        "type": "Functional" | "UI" | "Security" | "Performance" | "Edge Case"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              preconditions: { type: Type.ARRAY, items: { type: Type.STRING } },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              expectedResult: { type: Type.STRING },
              priority: { type: Type.STRING },
              type: { type: Type.STRING },
            },
            required: ["id", "title", "preconditions", "steps", "expectedResult", "priority", "type"],
          },
        },
      },
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate test cases. Please try again later.");
  }
}
