// One definition for `yarn check:important` (CI, pre-commit) and the agents' edit hook (.claude/hooks/guard-styles.mjs).
// No dependencies, so the hook loads it on every edit at no cost.

const IMPORTANT = /!\s*important/gi;
/** `!` after the variants; the rest is matched as a whole token, so `v-if="!open"` and `!items[i]">` never match. */
const IMPORTANT_MODIFIER = /^(?:[^\s"'`=!]*:)?!(\S+)$/;
/** `-mt-4`, `w-[calc(100%-1rem)]`. */
const UTILITY = /^-?[a-z][\w\-./%#]*(?:\[[^\]\s"'<>=]+\][\w\-./%#]*)*$/;
/** `[mask-type:alpha]`. */
const ARBITRARY_PROPERTY = /^\[[\w-]+:[^\]\s"'<>]+\]$/;

/** Every `!important` in the text, in any spacing and case: `!important`, `! IMPORTANT`, `#{!important}`. */
export function matchImportant(text: string): RegExpExecArray[] {
  return [...text.matchAll(IMPORTANT)];
}

/** A class-list token with Tailwind's important modifier: `!mt-4`, `lg:!hidden`, `[&>*]:!p-0`. */
export function isImportantUtility(token: string): boolean {
  const utility = IMPORTANT_MODIFIER.exec(token)?.[1];

  return (
    !!utility &&
    // `!important` itself is a flag, reported by matchImportant.
    utility.toLowerCase() !== "important" &&
    (UTILITY.test(utility) || ARBITRARY_PROPERTY.test(utility))
  );
}
