export function getGroupByLetter(letter: string) {
  if (/^[A-Za-z]$/.test(letter)) {
    return letter.toUpperCase();
  } else if (/^\d$/.test(letter)) {
    return "numbers";
  } else {
    return "others";
  }
}
