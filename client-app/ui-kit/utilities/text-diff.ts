/** Character at `offset` counted from the end; total, so an out-of-range offset gives "". */
function charFromEnd(text: string, offset: number): string {
  // eslint-disable-next-line sonarjs/null-dereference -- misreads `.length` on a non-optional string
  return text.charAt(text.length - 1 - offset);
}

function isHighSurrogate(code: number): boolean {
  return code >= 0xd800 && code <= 0xdbff;
}

function isLowSurrogate(code: number): boolean {
  return code >= 0xdc00 && code <= 0xdfff;
}

/**
 * The text inserted into a field that held `previous` and now holds `next`, wherever the caret sat
 * (a field showing "Belgium" delivers "Belgiumc" for a typed "c"). "" when nothing was inserted.
 *
 * Pass `replaced`, the selection `[start, end]` in `previous` just before the edit, whenever it is
 * known: without it a character typed over a whole selected label that equals the label's first or
 * last character ("B" over "Belgium") reads as a deletion.
 */
export function insertedText(previous: string, next: string, replaced?: readonly [number, number]): string {
  if (!previous) {
    return next;
  }

  if (replaced) {
    const [start, end] = replaced;
    // A deletion gives a length of zero or less, which slices to "".
    // eslint-disable-next-line sonarjs/null-dereference -- misreads `.length` on non-optional strings
    return next.slice(start, start + next.length - (previous.length - (end - start)));
  }

  let start = 0;

  while (start < previous.length && start < next.length && previous.charAt(start) === next.charAt(start)) {
    start++;
  }

  // The halves of an astral character (an emoji) compare one by one; never cut between them.
  if (start > 0 && isHighSurrogate(next.charCodeAt(start - 1))) {
    start--;
  }

  let end = 0;

  while (
    end < previous.length - start &&
    end < next.length - start &&
    charFromEnd(previous, end) === charFromEnd(next, end)
  ) {
    end++;
  }

  if (end > 0 && isLowSurrogate(next.charCodeAt(next.length - end))) {
    end--;
  }

  return next.slice(start, next.length - end);
}
