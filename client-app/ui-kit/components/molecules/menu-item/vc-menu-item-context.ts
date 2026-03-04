import type { InjectionKey, Ref } from "vue";

export const INTERACTIVE_PARENT_KEY: InjectionKey<Ref<boolean>> = Symbol("interactiveParent");
