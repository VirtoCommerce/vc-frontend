export function sleep(ms: number, resolvedValue?: any): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms, resolvedValue));
}
