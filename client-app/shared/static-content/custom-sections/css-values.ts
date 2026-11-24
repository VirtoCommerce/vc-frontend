import { toAssetUrl, trimAsciiWhitespace } from "./urls";

interface IValueState {
  /** The calls and parentheses open at the reader's place, innermost last. */
  calls: string[];
  /** How many image functions are open. */
  imageDepth: number;
}

type CssTokenType =
  | { type: "function"; name: string }
  | { type: "url"; url: string | undefined }
  | { type: "string"; text: string }
  | { type: "open" | "close" };

/** Functions whose argument names what the browser loads. */
const IMAGE_FUNCTIONS = new Set([
  "url",
  "image-set",
  "-webkit-image-set",
  "image",
  "cross-fade",
  "-webkit-cross-fade",
  "src",
]);
/** IE's script in CSS, and Firefox's live picture of any element of the page. */
const REFUSED_FUNCTIONS = new Set(["expression", "element", "-moz-element"]);
/** Whatever would decide an image's address only when the page renders. */
const DYNAMIC_FUNCTIONS = new Set(["var", "inherit", "attr", "env", "if"]);
const ESCAPE_REGEX = /\\(?:([\da-f]{1,6})\s?|(.))/gis;
/** One escape at the reader's place: a `\` before a newline is none. */
const ONE_ESCAPE_REGEX = /\\(?:[\da-f]{1,6}\s?|[^\n])/iy;
const NAME_CHAR_REGEX = /^[-\w]$|^[^\0-\x7f]$/;
/** CSS whitespace, after the line breaks are read as `\n`. */
const WHITESPACE_REGEX = /^[\t\n ]$/;
const SPACES_REGEX = /[\t\n ]*/y;
const URL_STOP_REGEX = /^["'(]$/;
const DATA_IMAGE_REGEX = /^data:image\//i;
const LINE_BREAK_REGEX = /\r\n?|\f/g;
const NULL_REGEX = /\0/g;
const MAX_CODE_POINT = 0x10ffff;

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

/** An image the section may show: the asset library's, or an inline `data:image/`. */
function isAllowedImageUrl(url: string, assetsBaseUrl: string | undefined): boolean {
  const trimmed = trimAsciiWhitespace(url);
  // An image needs no fragment; `data:image/svg+xml,…#id` may load as a document whose images reach any host.
  return !!toAssetUrl(trimmed, assetsBaseUrl) || (DATA_IMAGE_REGEX.test(trimmed) && !trimmed.includes("#"));
}

/**
 * Whether a declaration's value loads only allowed images and runs nothing. Read token by token, once, as the
 * browser reads it: a name inside a string or a comment is no call, and an escaped quote opens no string.
 */
export function isAllowedValue(value: string, assetsBaseUrl: string | undefined): boolean {
  const text = preprocessCss(value);
  const state: IValueState = { calls: [], imageDepth: 0 };
  let index = 0;

  while (index < text.length) {
    const [token, next] = readToken(text, index);

    if (token && !isAllowedToken(token, state, assetsBaseUrl)) {
      return false;
    }
    index = next;
  }

  return true;
}

/** As CSS Syntax 3 reads its input before it tokenizes: every line break as `\n`, and NUL as U+FFFD. */
export function preprocessCss(css: string): string {
  return css.replaceAll(LINE_BREAK_REGEX, "\n").replaceAll(NULL_REGEX, "\uFFFD");
}

/** The index after the string that opens at `start`, its escapes skipped. */
export function skipString(value: string, start: number): number {
  return readString(value, start)[1];
}

function isAllowedToken(token: CssTokenType, state: IValueState, assetsBaseUrl: string | undefined): boolean {
  switch (token.type) {
    case "function":
      if (REFUSED_FUNCTIONS.has(token.name) || (state.imageDepth > 0 && isDynamicFunction(token.name))) {
        return false;
      }
      state.calls.push(token.name);
      state.imageDepth += IMAGE_FUNCTIONS.has(token.name) ? 1 : 0;
      return true;
    case "open":
      state.calls.push("");
      return true;
    case "close":
      state.imageDepth -= IMAGE_FUNCTIONS.has(state.calls.pop() ?? "") ? 1 : 0;
      return true;
    case "url":
      return token.url !== undefined && isAllowedImageUrl(token.url, assetsBaseUrl);
    case "string":
      // Inside an image function a string is an address too.
      return state.imageDepth === 0 || isAllowedImageUrl(token.text, assetsBaseUrl);
  }
}

function isDynamicFunction(name: string): boolean {
  return DYNAMIC_FUNCTIONS.has(name) || name.startsWith("--");
}

/** The token at `index` that matters here, if any, and the index after it. */
function readToken(value: string, index: number): [token: CssTokenType | undefined, next: number] {
  const char = value[index];

  if (value.startsWith("/*", index)) {
    const end = value.indexOf("*/", index + 2);
    return [undefined, end < 0 ? value.length : end + 2];
  }

  if (char === '"' || char === "'") {
    const [text, next] = readString(value, index);
    return [{ type: "string", text }, next];
  }

  if (NAME_CHAR_REGEX.test(char) || readEscape(value, index)) {
    return readNameToken(value, index);
  }

  if (char === "(" || char === ")") {
    return [{ type: char === "(" ? "open" : "close" }, index + 1];
  }

  return [undefined, index + 1];
}

/** A name followed by `(` is a call; `url(` with no quote holds its address unquoted, up to `)`. */
function readNameToken(value: string, index: number): [token: CssTokenType | undefined, next: number] {
  const [name, next] = readName(value, index);

  if (value[next] !== "(") {
    return [undefined, next];
  }

  const lowerName = name.toLowerCase();
  SPACES_REGEX.lastIndex = next + 1;
  const afterSpaces = next + 1 + (SPACES_REGEX.exec(value)?.[0].length ?? 0);

  if (lowerName === "url" && value[afterSpaces] !== '"' && value[afterSpaces] !== "'") {
    const [url, end] = readUrl(value, afterSpaces);
    return [{ type: "url", url }, end];
  }

  return [{ type: "function", name: lowerName }, next + 1];
}

function readName(value: string, start: number): [name: string, next: number] {
  const parts: string[] = [];
  let index = start;

  while (index < value.length) {
    const escape = readEscape(value, index);

    if (escape) {
      parts.push(escape[0]);
      index = escape[1];
    } else if (NAME_CHAR_REGEX.test(value[index])) {
      parts.push(value[index]);
      index++;
    } else {
      break;
    }
  }

  return [parts.join(""), index];
}

/** The text of the string that opens at `start`, its escapes decoded, and the index after it. */
function readString(value: string, start: number): [text: string, next: number] {
  const quote = value[start];
  const parts: string[] = [];
  let index = start + 1;

  while (index < value.length && value[index] !== quote && value[index] !== "\n") {
    const escape = readEscape(value, index);

    if (escape) {
      parts.push(escape[0]);
      index = escape[1];
    } else if (value[index] === "\\") {
      // A `\` before a newline continues the string; one at the end is dropped.
      index += 2;
    } else {
      parts.push(value[index]);
      index++;
    }
  }

  return [parts.join(""), value[index] === quote ? index + 1 : index];
}

/** An unquoted address, up to `)`; `undefined` when a quote, a `(` or a space inside makes it a bad one. */
function readUrl(value: string, start: number): [url: string | undefined, next: number] {
  const parts: string[] = [];
  let index = start;
  let isBad = false;

  while (index < value.length && value[index] !== ")") {
    const escape = readEscape(value, index);
    const char = value[index];

    if (escape) {
      parts.push(escape[0]);
      index = escape[1];
      continue;
    }

    if (WHITESPACE_REGEX.test(char)) {
      SPACES_REGEX.lastIndex = index;
      index += SPACES_REGEX.exec(value)?.[0].length ?? 1;
      isBad ||= index < value.length && value[index] !== ")";
      continue;
    }

    isBad ||= URL_STOP_REGEX.test(char) || char === "\\";
    parts.push(char);
    index++;
  }

  return [isBad ? undefined : parts.join(""), index + 1];
}

function readEscape(value: string, index: number): [char: string, next: number] | undefined {
  ONE_ESCAPE_REGEX.lastIndex = index;
  const escape = value[index] === "\\" ? ONE_ESCAPE_REGEX.exec(value)?.[0] : undefined;

  return escape ? [decodeCssEscapes(escape), index + escape.length] : undefined;
}
