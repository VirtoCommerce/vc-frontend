export class Behavior {
  Requires: string[];
  Replaces: string[];

  constructor(requires: string[], replaces: string[]) {
    this.Requires = requires;
    this.Replaces = replaces;
  }
}
