// sonarjs/null-dereference reads `.length` on these `string` parameters as a possible null
// dereference. Both are non-optional strings and every call site passes one; there is nothing to
// guard against, so the rule is off for this file rather than answered with dead checks.
/* eslint-disable sonarjs/null-dereference */

/** Character at `offset` counted from the end; total, so an out-of-range offset gives "". */
function charFromEnd(text: string, offset: number): string {
  return text.charAt(text.length - 1 - offset);
}

/**
 * What was just typed into a field that held `previous` and now holds `next`.
 *
 * A single insertion leaves the old text as a common prefix and suffix around the new characters,
 * so the middle of `next` is what the user typed — wherever the caret sat. Used where a field
 * shows a label until the user starts typing: the browser appends the keystroke to that label
 * (measured: a field holding "Belgium" delivers "Belgiumc"), and only "c" is the query.
 *
 * Returns "" when nothing was inserted (a deletion, or no change).
 */
export function insertedText(previous: string, next: string): string {
  if (!previous) {
    return next;
  }

  let start = 0;

  while (start < previous.length && start < next.length && previous.charAt(start) === next.charAt(start)) {
    start++;
  }

  let end = 0;

  while (
    end < previous.length - start &&
    end < next.length - start &&
    charFromEnd(previous, end) === charFromEnd(next, end)
  ) {
    end++;
  }

  return next.slice(start, next.length - end);
}
