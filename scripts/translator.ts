import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.0-flash";
const SYSTEM_INSTRUCTION =
  "You are a professional translator specializing in e-commerce localization. Your task is to provide translations that are short, concise, and adhere to commonly accepted e-commerce terminology. Ensure that the original text formatting (e.g., i18n interpolation) are preserved. Do not translate placeholders such as '@:some_key' or '@:{'some_key'}'. The output should be the translated text only, without any additional comments, explanations, or symbols not present in the original text. 'From' and 'to' languages are set in ISO 639-1 language codes.";

const genAI = new GoogleGenerativeAI(process.env.APP_GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: {
    temperature: 0.0, // disable randomness
  },
});

function generatePrompt(text: string, originLanguage: string, targetLanguage: string) {
  return `Translate from ${originLanguage} to ${targetLanguage}: "${text}"`;
}

export async function translate(text: string, originLanguage: string, targetLanguage: string) {
  const response = await model.generateContent(generatePrompt(text, originLanguage, targetLanguage));
  // if original text doesn't end with \n, we need to remove \n from the response, because for some reason it's added by the model
  return text.endsWith("\n") ? response.response.text() : response.response.text().replace(/\n$/, "");
}
