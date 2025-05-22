import type ExtensionPoint from "@/shared/common/components/extension-point.vue";

declare module "vue" {
  // Global components is already declared interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    ExtensionPoint: typeof ExtensionPoint;
  }
}

export {};
