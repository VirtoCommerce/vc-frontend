export class Terms extends Array<string> {
  toString(): string {
    const result = this.join(",");
    return result;
  }
}
