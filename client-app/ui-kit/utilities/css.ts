export function isCssVariable(input: string): boolean {
  const regex = /^--[\w-]+$/;
  return regex.test(input);
}
