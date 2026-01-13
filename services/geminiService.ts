
import { GoogleGenAI } from "@google/genai";
import { POCHEON_HILLS_DATA } from "./pocheonHillsData.ts";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getGolfAdvice = async (query: string) => {
  const ai = getAI();
  const courseContext = JSON.stringify(POCHEON_HILLS_DATA);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `당신은 '동물원 AI 캐디'입니다. 세계적인 프로 골프 코치이자 포천힐스 CC(Pocheon Hills CC) 전문 가이드입니다.
        
다음은 포천힐스 CC의 27개 홀 상세 정보입니다:
${courseContext}

사용자가 포천힐스에 대해 질문하면 위의 데이터를 바탕으로 답변하세요:
1. 사용자가 특정 홀에 대해 물어보면 위 데이터의 거리, 파, 설명, 공략법을 정확히 인용하세요.
2. 답변 끝에는 항상 "포천힐스 공식 홈페이지의 코스 맵 이미지를 검색하여 확인해 보세요"라는 멘트를 넣고 관련 링크를 제공하세요.
3. 구글 검색을 활용해 "포천힐스 [코스명] [홀번호] 지도" 키워드로 이미지나 야디지 북 링크를 찾아 사용자에게 전달하세요.
4. 모든 답변은 한국어로 제공하며, 골퍼들에게 실질적인 도움이 되는 조언을 제공하세요.
5. 포천힐스의 코스 특징(산악 지형, 경사 등)을 잘 녹여내어 전문성을 보여주세요.`,
        tools: [{ googleSearch: {} }]
      }
    });
    
    return {
      text: response.text || "죄송합니다. 요청을 처리할 수 없습니다.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "AI 캐디 연결에 실패했습니다. 나중에 다시 시도해주세요.", sources: [] };
  }
};

export const getCourseInfo = async (location: string) => {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${location} 주변의 최고 골프 코스는 어디인가요? 난이도와 시그니처 홀에 대한 간략한 정보를 한국어로 알려주세요.`,
        config: {
          tools: [{ googleMaps: {} }]
        }
      });
      return {
          text: response.text,
          sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      console.error("Gemini Maps API Error:", error);
      return { text: "코스 정보를 찾을 수 없습니다.", sources: [] };
    }
};
