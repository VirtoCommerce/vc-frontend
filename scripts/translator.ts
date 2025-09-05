import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL_NAME = "gemini-2.0-flash";
const DEFAULT_TEMPERATURE = 0.0;

const modelName = process.env.FIX_LOCALES_MODEL_NAME || DEFAULT_MODEL_NAME;
const temperature = Number.parseFloat(process.env.FIX_LOCALES_TEMPERATURE ?? "invalid");
const finalTemperature = !Number.isNaN(temperature) ? temperature : DEFAULT_TEMPERATURE;

console.log(`⚙ Using model: "${modelName}", temperature: ${finalTemperature}`);

const SYSTEM_INSTRUCTION = `You are a professional translator specializing in e-commerce localization.
Your translations must be short, concise, and use commonly accepted e-commerce terminology.
Preserve all original formatting, punctuation, placeholders (e.g., @:key, i18n interpolation), and line breaks exactly as in the source strings.
Your output must strictly follow the format requested in the user prompt, without any additional commentary, explanations, or markdown fences.`;

const genAI = new GoogleGenerativeAI(process.env.APP_GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({
  model: modelName,
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: {
    temperature: finalTemperature,
  },
});

export type BatchItemType = { key: string; text: string };

function generateBatchPrompt(
  items: BatchItemType[],
  originLanguage: string,
  targetLanguage: string,
) {
  const example = JSON.stringify(["Texto traducido 1", "Texto traducido 2"]);
  return `Translate each item's "text" from ${originLanguage} to ${targetLanguage}, using its "key" for context.
Return a valid JSON array of strings in the same order as the input.

Input: ${JSON.stringify(items)}
Example Output: ${example}`;
}

function parseStringArray(jsonString: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(jsonString);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }
  } catch {
    // Not a valid JSON, ignore and return null
  }
  return null;
}

function tryParseJsonArray(text: string): string[] {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/i, "").replace(/```$/i, "").trim();

  const directParseResult = parseStringArray(cleaned);
  if (directParseResult) {
    return directParseResult;
  }

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end > start) {
    const candidate = cleaned.slice(start, end + 1);
    const fallbackParseResult = parseStringArray(candidate);
    if (fallbackParseResult) {
      return fallbackParseResult;
    }
  }

  throw new Error("Failed to parse batch translation JSON output");
}

export async function translateBatch(
  items: BatchItemType[],
  originLanguage: string,
  targetLanguage: string,
): Promise<string[]> {
  if (items.length === 0) {
    return [];
  }

  const response = await model.generateContent(generateBatchPrompt(items, originLanguage, targetLanguage));
  const raw = response.response.text();
  const parsed = tryParseJsonArray(raw);
  if (parsed.length !== items.length) {
    throw new Error(`Batch translation length mismatch: expected ${items.length}, got ${parsed.length}`);
  }
  return parsed;
}
