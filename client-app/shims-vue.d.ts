/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, any>, Record<string, any>, any>;
  export default component;
}
