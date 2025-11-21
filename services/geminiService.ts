import { GoogleGenAI, Tool } from "@google/genai";
import { SearchResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const findCompanyLocations = async (companyName: string): Promise<SearchResult[]> => {
  if (!apiKey) {
    console.warn("No API Key available for Gemini.");
    return [];
  }

  const modelId = 'gemini-2.5-flash';
  
  const tools: Tool[] = [
    { googleMaps: {} }
  ];

  // We ask for an array of potential matches to handle multiple offices
  // Removed strict UK/Ireland prioritization to allow for International Galvanizers and broader testing
  const prompt = `
    Find business locations for "${companyName}" using Google Maps.
    Search globally. Do not restrict results to the UK or Ireland.
    
    Return a JSON array containing up to 5 distinct locations found.
    Each item in the array must be a valid JSON object with these keys:
    - placeName (string): The name of the location (e.g., "Headquarters", "London Branch", or the city name if generic).
    - street (string): The street address.
    - city (string): The city or town.
    - postalCode (string): The postal code.
    - country (string): The full country name (e.g., "United Kingdom", "Germany", "France").

    If no specific address is found, return an empty array [].
    Do not include markdown formatting (like \`\`\`json) in the response, just the raw JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: tools,
        temperature: 0,
      }
    });

    const text = response.text?.trim();
    
    if (!text) return [];

    // Attempt to clean up markdown if the model ignores instruction
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        return data;
      } else if (typeof data === 'object' && data !== null && Object.keys(data).length > 0) {
        // Handle case where model returns single object instead of array
        return [{
            placeName: data.placeName || companyName,
            street: data.street || '',
            city: data.city || '',
            postalCode: data.postalCode || '',
            country: data.country || 'United Kingdom'
        }];
      }
      return [];
    } catch (e) {
      console.error("Failed to parse address JSON:", e);
      return [];
    }
  } catch (error) {
    console.error("Gemini Address Lookup Error:", error);
    return [];
  }
};