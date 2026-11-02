// One definition for `yarn check:css-important` (CI, pre-commit) and the agents' edit hook (.claude/hooks/guard-styles.mjs).
// Plain JS without dependencies: the hook loads it on every edit, on any Node version.

const IMPORTANT = /!\s*important/gi;
/** Where a CSS value ends: at the end of the string or before `;`, `}` or a quote. Prose ("instead of !important.") does not. */
const IMPORTANT_VALUE = /!\s*important(?=\s*(?:[;}"'`]|$))/gi;
/** `[…]` with one nested level: `[state=open]`, `['']`, `[&[data-x='y']]`. */
const BRACKET = String.raw`\[(?:[^[\]\s]|\[[^[\]\s]*\])+\]`;
/** `!` after the variants (`lg:`, `group-hover/item:`, `[&>*]:`, `data-[state=open]:`); the rest is one whole token. */
const IMPORTANT_MODIFIER = new RegExp(String.raw`^(?:(?:[\w\-/@*.]|${BRACKET})+:)*!(\S+)$`);
/** `-mt-4`, `w-[calc(100%-1rem)]`, `content-['']`. */
const UTILITY = new RegExp(String.raw`^-?[a-z][\w\-./%#]*(?:${BRACKET}[\w\-./%#]*)*$`);
/** `[mask-type:alpha]`. */
const ARBITRARY_PROPERTY = /^\[[\w-]+:[^\]\s]+\]$/;
const IMPORTANT_WORD = /^important(?![\w-])/i;

/**
 * Every `!important` in CSS text, in any spacing and case: `!important`, `! IMPORTANT`, `#{!important}`.
 * @param {string} text
 * @returns {RegExpExecArray[]}
 */
export function matchImportant(text) {
  return [...text.matchAll(IMPORTANT)];
}

/**
 * Every `!important` that ends a CSS value in a string that may be prose: `"color: red !important;"`, `'red !important'`.
 * @param {string} text
 * @returns {RegExpExecArray[]}
 */
export function matchImportantValue(text) {
  return [...text.matchAll(IMPORTANT_VALUE)];
}

/**
 * A class-list token with Tailwind's important modifier: `!mt-4`, `lg:!hidden`, `data-[state=open]:!block`.
 * Negation in template code (`v-if="!open"`, `!items[i]">`) is no whole token, so it never matches.
 * @param {string} token
 * @returns {boolean}
 */
export function isImportantUtility(token) {
  const utility = IMPORTANT_MODIFIER.exec(token)?.[1];

  // `!important` itself is a flag, reported by matchImportant.
  return !!utility && !IMPORTANT_WORD.test(utility) && (UTILITY.test(utility) || ARBITRARY_PROPERTY.test(utility));
}
