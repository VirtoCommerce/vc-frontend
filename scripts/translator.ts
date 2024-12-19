import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash";
const SYSTEM_INSTRUCTION =
  "You are a professional translator. You prepare localization for e-commerce platform. You respect the original text and formatting (e.g. i18n interpolation). Text, like '@:some_key' or '@:{'some_key'}' shouldn't be translated. Result should be only the translated text, without any additional comments or explanations, don't add any symbols not present in the original text eg(\n, new lines, tabs, etc).";

const genAI = new GoogleGenerativeAI(process.env.APP_GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: SYSTEM_INSTRUCTION,
});

function generatePrompt(text: string, originLanguage: string, targetLanguage: string) {
  return `Translate from ${originLanguage} to ${targetLanguage}: ${text}`;
}

export async function translate(text: string, originLanguage: string, targetLanguage: string) {
  const response = await model.generateContent(generatePrompt(text, originLanguage, targetLanguage));
  // if original text doesn't end with \n, we need to remove \n from the response, because for some reason it's added by the model
  return text.endsWith("\n") ? response.response.text() : response.response.text().replace(/\n$/, "");
}
