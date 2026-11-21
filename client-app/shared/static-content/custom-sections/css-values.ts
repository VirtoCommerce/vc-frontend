import { toAssetUrl } from "./urls";

interface IFunctionCall {
  name: string;
  argument: string;
}

/** Functions whose argument names what the browser loads. */
const IMAGE_FUNCTIONS = new Set(["url", "image-set", "-webkit-image-set", "image", "cross-fade", "src"]);
/** IE's script in CSS, and Firefox's live picture of any element of the page. */
const REFUSED_FUNCTIONS = new Set(["expression", "element", "-moz-element"]);
/** Whatever would decide an image's address only when the page renders. */
const DYNAMIC_CALL_REGEX = /(?:^|[^\w-])(?:var|attr|env|if|--[\w-]*)\(/i;
/** Starts only at a name's start, so a long word costs one pass, not one per letter. */
const FUNCTION_START_REGEX = /(?<![-\w])([-\w]+)\(/g;
const ESCAPE_REGEX = /\\(?:([\da-f]{1,6})\s?|(.))/gis;
const STRING_REGEX = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g;
const QUOTED_REGEX = /^(["'])(.*)\1$/s;
const DATA_IMAGE_REGEX = /^data:image\//i;
const MAX_CODE_POINT = 0x10ffff;
const DEPTH_CHANGES: Record<string, number> = { "(": 1, ")": -1 };

/** `image-s\65t(` is `image-set(`: a value kept as written, as one holding `var()` is, still has its escapes. */
export function decodeCssEscapes(text: string): string {
  return text.replaceAll(ESCAPE_REGEX, (_, hex: string | undefined, character: string | undefined) => {
    if (hex === undefined) {
      return character ?? "";
    }

    const codePoint = Number.parseInt(hex, 16);
    return codePoint > 0 && codePoint <= MAX_CODE_POINT ? String.fromCodePoint(codePoint) : "�";
  });
}

/** Every function call in the value, nested ones too, with its argument read up to the matching parenthesis. */
export function findFunctionCalls(value: string): IFunctionCall[] {
  return [...value.matchAll(FUNCTION_START_REGEX)].map((match) => ({
    name: match[1].toLowerCase(),
    argument: readArgument(value, match.index + match[0].length),
  }));
}

/** An image the section may show: its own site's or the asset library's, or an inline `data:image/`. */
export function isAllowedImageUrl(url: string): boolean {
  const trimmed = url.trim();
  return !!toAssetUrl(trimmed) || DATA_IMAGE_REGEX.test(trimmed);
}

/** Whether a declaration's value loads only allowed images and runs nothing. */
export function isAllowedValue(value: string): boolean {
  return findFunctionCalls(decodeCssEscapes(value)).every(({ name, argument }) => {
    if (REFUSED_FUNCTIONS.has(name)) {
      return false;
    }

    if (!IMAGE_FUNCTIONS.has(name)) {
      return true;
    }

    if (DYNAMIC_CALL_REGEX.test(argument)) {
      return false;
    }

    // `url()` holds one address; the others name theirs as strings, and their nested `url()` is a call of its own.
    return name === "url"
      ? isAllowedImageUrl(QUOTED_REGEX.exec(argument.trim())?.[2] ?? argument)
      : [...argument.matchAll(STRING_REGEX)].every((match) => isAllowedImageUrl(match[1] ?? match[2] ?? ""));
  });
}

function readArgument(value: string, start: number): string {
  let depth = 1;
  let index = start;

  while (index < value.length && depth > 0) {
    const character = value[index];

    if (character === '"' || character === "'") {
      index = skipString(value, index);
    } else {
      depth += DEPTH_CHANGES[character] ?? 0;
      index++;
    }
  }

  return value.slice(start, depth === 0 ? index - 1 : index);
}

/** The index after the string that opens at `start`, its escapes skipped. */
function skipString(value: string, start: number): number {
  const quote = value[start];
  let index = start + 1;

  while (index < value.length && value[index] !== quote) {
    index += value[index] === "\\" ? 2 : 1;
  }

  return index + 1;
}
