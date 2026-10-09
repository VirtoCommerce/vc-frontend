// Minimal React type declarations for Storybook docs page.
// Avoids installing @types/react as a project dependency.
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "react" {
  interface IContext<T> {
    _type: T;
  }
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export function useContext<T>(context: IContext<T>): T;
}
