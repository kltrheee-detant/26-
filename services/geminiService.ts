
import { GoogleGenAI } from "@google/genai";
import { POCHEON_HILLS_DATA } from "./pocheonHillsData.ts";

export const getGolfAdvice = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `당신은 '동물원 AI 캐디'입니다. 골프장 정보와 공략법을 제공합니다.`,
        tools: [{ googleSearch: {} }]
      }
    });
    
    return {
      text: response.text || "죄송합니다. 요청을 처리할 수 없습니다.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "AI 캐디 연결에 실패했습니다.", sources: [] };
  }
};
