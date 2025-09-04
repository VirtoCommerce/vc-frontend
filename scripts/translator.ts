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

type BatchItemType = { key: string; text: string };

function generateBatchPrompt(
  items: BatchItemType[],
  originLanguage: string,
  targetLanguage: string,
) {
  const example = JSON.stringify(["Texto traducido 1", "Texto traducido 2"], null, 0);
  return [
    `Translate each item's "text" from ${originLanguage} to ${targetLanguage}. Use its "key" as contextual information (i18n path) to choose the most appropriate translation.`,
    "Rules:",
    "- Preserve original formatting, punctuation, and placeholders (e.g., @:key, @:{'key'}).",
    "- Keep line breaks exactly as in the source strings.",
    "- Prefer the shortest natural translation that preserves meaning in the given context.",
    "- Use commonly accepted phrasing for the e-commerce domain.",
    "- Return ONLY a valid JSON array of strings, in the same order, with no extra text.",
    "",
    `Input JSON array of items: ${JSON.stringify(items)}`,
    "",
    `Return format example (do not include comments): ${example}`,
  ].join("\n");
}

function tryParseJsonArray(text: string): string[] {
  // Remove code fences if present and trim
  const cleaned = text.trim().replace(/^```(?:json)?\n?/i, "").replace(/```$/i, "").trim();
  // Try direct parse
  try {
    const parsedUnknown: unknown = JSON.parse(cleaned);
    if (Array.isArray(parsedUnknown) && parsedUnknown.every((x) => typeof x === "string")) {
      return parsedUnknown;
    }
  } catch {
    void 0; // ignore and try fallback
  }
  // Fallback: extract the largest JSON array substring
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = cleaned.slice(start, end + 1);
    try {
      const parsedUnknown: unknown = JSON.parse(candidate);
      if (Array.isArray(parsedUnknown) && parsedUnknown.every((x) => typeof x === "string")) {
        return parsedUnknown;
      }
    } catch {
      void 0; // ignore and fall through to error
    }
  }
  throw new Error("Failed to parse batch translation JSON output");
}

export async function translateBatch(
  texts: string[],
  contexts: string[],
  originLanguage: string,
  targetLanguage: string,
): Promise<string[]> {
  if (texts.length === 0) {
    return [];
  }
  if (texts.length !== contexts.length) {
    throw new Error(`translateBatch: contexts length ${contexts.length} does not match texts length ${texts.length}`);
  }
  const items: BatchItemType[] = texts.map((text, index) => ({ key: contexts[index], text }));
  const response = await model.generateContent(generateBatchPrompt(items, originLanguage, targetLanguage));
  const raw = response.response.text();
  const parsed = tryParseJsonArray(raw);
  if (parsed.length !== texts.length) {
    throw new Error(`Batch translation length mismatch: expected ${texts.length}, got ${parsed.length}`);
  }
  return parsed;
}
