import { Behavior } from './behavior';

export class Feature {
  IsActive: boolean;
  Behavior: Behavior

  constructor(isActive: boolean, behavior: Behavior) {
    this.IsActive = isActive;
    this.Behavior = behavior;
  }
}


