
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Safely retrieve API Key to prevent crash if process is undefined
const getApiKey = () => {
  try {
    // Check if process is defined (e.g. via define plugin replacement or node env)
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("Environment variable access failed", e);
  }
  return '';
};

const API_KEY = getApiKey();

// Initialize lazily to prevent crash during module loading if key is invalid/empty
let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
};

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;
  
  const ai = getAI();
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `你是一个高端数字艺术作品集的策展人。
      你的语气精致、极简且充满洞察力。请始终使用中文与用户交流。
      帮助用户整理他们的作品，或者讨论视觉美学。`,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!API_KEY) {
    return "档案系统离线。（未配置 API 密钥）";
  }

  try {
    const chat = initializeChat();
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "传输中断。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "信号丢失，请稍后再试。";
  }
};

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<{ title: string; description: string }> => {
  if (!API_KEY) return { title: "无题", description: "上传成功。" };

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: "分析这张图片。返回一个 JSON 对象，包含 'title'（最多 4 个字的中文标题，抽象/艺术性）和 'description'（一句简短的中文诗意描述）。" }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Analysis Error:", error);
    return { title: "视觉资源", description: "一个已上传的媒体文件。" };
  }
};
