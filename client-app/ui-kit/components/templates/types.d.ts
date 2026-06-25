import type * as Components from ".";

declare module "vue" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcEmptyPage: typeof Components.VcEmptyPage;
    VcLayout: typeof Components.VcLayout;
  }
}

export {};
