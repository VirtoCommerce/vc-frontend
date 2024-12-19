import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function generatePrompt(text: string, originLanguage: string, targetLanguage: string) {
  return `Translate the following text from ${originLanguage} to ${targetLanguage}, respecting the original text structure and formatting (e.g. i18n interpolation). Text, like "@:some_key" or "@:{'some_key'}" shouldn't be translated!. The context of using - ecommerce platform. Result should be only the translated text, without any additional comments or explanations. Text to translate: ${text}`;
}

export async function translate(text: string, originLanguage: string, targetLanguage: string) {
  const result = await model.generateContent(generatePrompt(text, originLanguage, targetLanguage));
  return result.response.text();
}
