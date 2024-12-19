import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.APP_GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function generatePrompt(text: string, originLanguage: string, targetLanguage: string) {
  return `Translate the following text to ${targetLanguage} from ${originLanguage}: ${text}, respecting the original text structure and formatting (e.g. i18n interpolation). The context of using - ecommerce platform. Result should be only the translated text, without any additional comments or explanations.`;
}

export async function translate(text: string, originLanguage: string, targetLanguage: string) {
  const result = await model.generateContent(generatePrompt(text, originLanguage, targetLanguage));
  return result.response.text();
}
