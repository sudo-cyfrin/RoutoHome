import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
});

export interface TransportStep {
  instruction: string;
  location?: string;
  isTransfer?: boolean;
}

export interface TransportOption {
  type: string;
  route: string;
  price: string;
  time: string;
  description?: string;
  detailedSteps?: TransportStep[];
}

export async function getTransportRoutes(from: string, to: string): Promise<TransportOption[]> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is not set. Returning mock data.");
    return [
      { 
        type: 'Bus', 
        route: 'Route 42 - Downtown', 
        price: '12.0', 
        time: '10 min',
        detailedSteps: [
          { instruction: "Walk to the nearest bus stop at Sector 5", location: "Sector 5 Stop" },
          { instruction: "Board Bus 42 towards Downtown", location: "Bus 42" },
          { instruction: "Get off at Central Square", location: "Central Square" }
        ]
      },
      { 
        type: 'Train', 
        route: 'Express Line - Central', 
        price: '10.0', 
        time: '5 min',
        detailedSteps: [
          { instruction: "Go to Platform 2 at the Metro Station", location: "Platform 2" },
          { instruction: "Take the Express Line towards Central", location: "Express Line" }
        ]
      },
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find realistic public transport routes from "${from}" to "${to}". 
      Include options for Bus, Train, Metro, and Taxi/Auto if applicable. 
      Provide approximate cost in local currency (assume INR if not specified) and travel time.
      For each route, provide a step-by-step guide (detailedSteps) explaining exactly what to do, where to go, and any transfers (changes) required.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "Type of transport (e.g., Bus, Train, Metro, Taxi/Auto)",
              },
              route: {
                type: Type.STRING,
                description: "Route name or number",
              },
              price: {
                type: Type.STRING,
                description: "Approximate price (numeric string)",
              },
              time: {
                type: Type.STRING,
                description: "Approximate travel time (e.g., '20 min')",
              },
              description: {
                type: Type.STRING,
                description: "Brief description of the route or safety note",
              },
              detailedSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    instruction: { type: Type.STRING, description: "What the user should do" },
                    location: { type: Type.STRING, description: "Where this happens" },
                    isTransfer: { type: Type.BOOLEAN, description: "Whether this step involves changing transport" },
                  },
                  required: ["instruction"],
                },
              },
            },
            required: ["type", "route", "price", "time", "detailedSteps"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching transport routes:", error);
    return [];
  }
}
