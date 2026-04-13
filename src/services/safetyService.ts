import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
});
export interface SafetyArea {
  name: string;
  distance: string;
  risk: 'High' | 'Medium' | 'Low';
}

export interface SafetyAssessment {
  recommendation: string;
  proneAreas: SafetyArea[];
}

export async function getSafetyAssessment(location: string): Promise<SafetyAssessment> {
  const isCoordinates = location.startsWith('Coordinates:');
  const prompt = isCoordinates 
    ? `Provide a safety assessment for the area around these coordinates: "${location}". 
       Identify the likely neighborhood or city name if possible.
       Include a general safety recommendation and a list of 3 specific "prone areas" (could be fictional but realistic for the city if known) with their risk levels (High, Medium, Low) and approximate distance from these coordinates.`
    : `Provide a safety assessment for the area: "${location}". 
       Include a general safety recommendation and a list of 3 specific "prone areas" (could be fictional but realistic for the city if known) with their risk levels (High, Medium, Low) and approximate distance from the center of "${location}".`;

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return {
      recommendation: "Stay alert and use well-lit routes. (Mock data - API key missing)",
      proneAreas: [
        { name: 'Central Park North', distance: '100m', risk: 'High' },
        { name: 'Old Market Square', distance: '400m', risk: 'Medium' },
      ]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: {
              type: Type.STRING,
              description: "General safety advice for this location",
            },
            proneAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  distance: { type: Type.STRING },
                  risk: { 
                    type: Type.STRING,
                    enum: ['High', 'Medium', 'Low']
                  },
                },
                required: ["name", "distance", "risk"],
              },
            },
          },
          required: ["recommendation", "proneAreas"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching safety assessment:", error);
    return {
      recommendation: "Unable to fetch real-time safety data. Please stay in well-lit areas.",
      proneAreas: []
    };
  }
}
