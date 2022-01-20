export interface IValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
}

export interface ItemAction {
  icon: string;
  title: string;
  bgColor: string;
  position: "left" | "right";
  clickHandler(item: any): any;
}

export interface ISortInfo {
  column: string;
  direction: string;
}
