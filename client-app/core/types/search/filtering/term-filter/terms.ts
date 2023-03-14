export class Terms extends Array<string> {
  toString(): string {
    return this.join(",");
  }
}
