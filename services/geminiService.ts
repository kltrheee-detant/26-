
import { GoogleGenAI, Type } from "@google/genai";
import { POCHEON_HILLS_DATA } from "./pocheonHillsData.ts";

export const getGolfAdvice = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const courseContext = JSON.stringify(POCHEON_HILLS_DATA);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `당신은 '동물원 AI 캐디'입니다. 골프장 정보와 맛집 정보를 제공합니다.`,
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

// 골프장 주변 맛집 검색 함수 (Maps Grounding 활용)
export const searchRestaurants = async (courseName: string, mealType: '점심' | '저녁') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `${courseName} 골프장 주변에서 ${mealType} 식사하기 좋은 맛집 3곳을 추천해주세요. 
  각 장소의 이름, 정확한 주소, 특징을 한국어로 알려주세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }]
      },
    });

    // groundingChunks에서 장소 데이터 추출
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const text = response.text || "";

    return {
      text,
      places: chunks.filter((c: any) => c.maps).map((c: any) => ({
        title: c.maps.title,
        uri: c.maps.uri
      }))
    };
  } catch (error) {
    console.error("Restaurant Search Error:", error);
    return { text: "맛집 정보를 가져오는데 실패했습니다.", places: [] };
  }
};
