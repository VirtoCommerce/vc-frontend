import { decodeCssEscapes, preprocessCss, skipString } from "./css-values";

type GroupKindType = "has" | "list" | "opaque";

interface IGroup {
  kind: GroupKindType;
  /** Nothing read yet in the current selector of the argument. */
  isAtStart: boolean;
  /** Of the parentheses opened inside an opaque argument. */
  depth: number;
}

/** Arguments the browser matches against the whole page: compound selectors only, so no part can reach outside. */
const SELECTOR_LIST_PSEUDOS = new Set([
  "is",
  "where",
  "not",
  "matches",
  "any",
  "-webkit-any",
  "-moz-any",
  "host",
  "host-context",
  "slotted",
  "cue",
  "current",
  "past",
  "future",
  "nth-child-of",
  "nth-last-child-of",
]);
/** Arguments that hold no selector. */
const OPAQUE_PSEUDOS = new Set([
  "nth-child",
  "nth-last-child",
  "nth-of-type",
  "nth-last-of-type",
  "nth-col",
  "nth-last-col",
  "lang",
  "dir",
  "state",
  "part",
  "highlight",
  "picker",
  "view-transition-group",
  "view-transition-image-pair",
  "view-transition-old",
  "view-transition-new",
  "active-view-transition-type",
]);
const NTH_OF_PSEUDOS = new Set(["nth-child-of", "nth-last-child-of"]);
const COMBINATORS = new Set([" ", ">", "+", "~"]);
const SIBLING_COMBINATORS = new Set(["+", "~"]);
const PSEUDO_REGEX = /::?([-\w]+)(\()?/y;
const ESCAPE_REGEX = /\\(?:[\da-f]{1,6}\s?|.)?/isy;
/** `:nth-child(2n of S)`: what follows `of` is a selector list. */
const NTH_OF_REGEX = /:(nth-(?:last-)?child)\([^()]*?\bof\b ?/g;
const SPACE_REGEX = /\s+/g;
/** Spaces around these are no descendant combinator; a space after `)` is one. */
const SPACED_PUNCTUATION_REGEX = / ?([,>+~]) ?/g;
const SPACE_IN_PARENTHESES_REGEX = /(?<=\() | (?=\))/g;
const IDENT_CHAR_REGEX = /^[\w-]$|^[^\0-\x7f]$/;

interface IScanState {
  groups: IGroup[];
  /** Something read in the current top-level selector. */
  hasContent: boolean;
  /** The current top-level selector starts with `:scope` or `&`. */
  isAnchored: boolean;
  isInFirstCompound: boolean;
}

/**
 * `@scope` keeps only the element a rule styles inside the section; every other part of its selector matches
 * against the whole page. So `:scope` or `&` comes only first, a `:has()` looks at no sibling, `:nth-child(… of …)`
 * counts no sibling of the section's root, and an `:is()`, `:where()` or `:not()` holds no combinator.
 */
export function isContainedSelector(selectorText: string): boolean {
  const skeleton = toSelectorSkeleton(selectorText).replace(NTH_OF_REGEX, ":$1-of(");
  const state: IScanState = { groups: [], hasContent: false, isAnchored: false, isInFirstCompound: true };
  let index = 0;

  while (index < skeleton.length) {
    const next = readToken(skeleton, index, state);

    if (next === undefined) {
      return false;
    }
    index = next;
  }

  return state.groups.length === 0;
}

/** The index after the token at `index`; `undefined` when the token reaches outside the section. */
function readToken(skeleton: string, index: number, state: IScanState): number | undefined {
  const char = skeleton[index];
  const group = state.groups.at(-1);

  if (group?.kind === "opaque") {
    skipOpaqueChar(char, group, state);
    return index + 1;
  }

  if (char === ",") {
    startSelector(state);
    return index + 1;
  }

  PSEUDO_REGEX.lastIndex = index;
  const pseudo = char === ":" ? PSEUDO_REGEX.exec(skeleton) : null;

  if (!(pseudo ? readPseudo(pseudo[1], !!pseudo[2], state) : readChar(char, state))) {
    return undefined;
  }

  state.hasContent = true;
  if (group) {
    group.isAtStart = false;
  }

  return index + (pseudo?.[0].length ?? 1);
}

function readPseudo(name: string, isFunction: boolean, state: IScanState): boolean {
  if (name === "scope") {
    return anchor(state);
  }

  if (!isFunction) {
    return true;
  }

  const kind = toGroupKind(name);

  if (!kind || (NTH_OF_PSEUDOS.has(name) && state.isAnchored && state.isInFirstCompound)) {
    return false;
  }

  state.groups.push({ kind, isAtStart: true, depth: 0 });
  return true;
}

function readChar(char: string, state: IScanState): boolean {
  switch (char) {
    case "&":
      return anchor(state);
    case "(":
      return false;
    case ")":
      return !!state.groups.pop();
    default:
      return COMBINATORS.has(char) ? readCombinator(char, state) : true;
  }
}

function readCombinator(char: string, state: IScanState): boolean {
  const group = state.groups.at(-1);

  if (!group) {
    state.isInFirstCompound &&= !state.hasContent;
    return true;
  }

  return group.kind === "has" && !(group.isAtStart && SIBLING_COMBINATORS.has(char));
}

/** `:scope` or `&`: only as the first thing of a top-level selector. */
function anchor(state: IScanState): boolean {
  if (state.groups.length || state.hasContent) {
    return false;
  }

  state.isAnchored = true;
  return true;
}

function startSelector(state: IScanState): void {
  const group = state.groups.at(-1);

  if (group) {
    group.isAtStart = true;
  } else {
    Object.assign(state, { hasContent: false, isAnchored: false, isInFirstCompound: true });
  }
}

function skipOpaqueChar(char: string, group: IGroup, state: IScanState): void {
  if (char === "(") {
    group.depth++;
  } else if (char === ")" && group.depth-- === 0) {
    state.groups.pop();
  }
}

function toGroupKind(name: string): GroupKindType | undefined {
  if (name === "has") {
    return "has";
  }

  if (SELECTOR_LIST_PSEUDOS.has(name)) {
    return "list";
  }

  return OPAQUE_PSEUDOS.has(name) ? "opaque" : undefined;
}

/** `toSkeleton` of a selector as the browser serializes it. */
export function toSelectorSkeleton(selectorText: string): string {
  return toSkeleton(preprocessCss(selectorText));
}

/**
 * The selector without strings, attribute values, comments or escapes, lowercase and with only the spaces that
 * are descendant combinators. An escaped character counts as part of a name, never as syntax.
 */
function toSkeleton(selector: string): string {
  const parts: string[] = [];
  let index = 0;

  while (index < selector.length) {
    const [part, next] = readSkeletonPart(selector, index);

    parts.push(part);
    index = next;
  }

  return parts
    .join("")
    .replace(SPACE_REGEX, " ")
    .replace(SPACED_PUNCTUATION_REGEX, "$1")
    .replace(SPACE_IN_PARENTHESES_REGEX, "")
    .trim();
}

function readSkeletonPart(selector: string, index: number): [part: string, next: number] {
  const char = selector[index];

  if (char === "\\") {
    ESCAPE_REGEX.lastIndex = index;
    const escape = ESCAPE_REGEX.exec(selector)?.[0] ?? char;
    const decoded = decodeCssEscapes(escape);

    return [IDENT_CHAR_REGEX.test(decoded) ? decoded.toLowerCase() : "_", index + escape.length];
  }

  if (char === '"' || char === "'") {
    return ['""', skipString(selector, index)];
  }

  if (char === "[") {
    return ["[]", skipAttribute(selector, index)];
  }

  if (selector.startsWith("/*", index)) {
    const end = selector.indexOf("*/", index + 2);
    return [" ", end < 0 ? selector.length : end + 2];
  }

  return [char.toLowerCase(), index + 1];
}

function skipAttribute(selector: string, start: number): number {
  let index = start + 1;

  while (index < selector.length && selector[index] !== "]") {
    if (selector[index] === '"' || selector[index] === "'") {
      index = skipString(selector, index);
    } else {
      index += selector[index] === "\\" ? 2 : 1;
    }
  }

  return index + 1;
}
