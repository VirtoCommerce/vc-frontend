import { createGlobalState } from "@vueuse/core";
import { readonly, ref } from "vue";
import type { Product } from "@/core/api/graphql/types";
import type { DefineComponent } from "vue";

export type ElementType = {
  id: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: DefineComponent<{ product: Product }, Record<string, any>, any>;
  shouldRender: (product: Product) => boolean;
};

function _useCustomProductCardComponents() {
  const customProductCardComponents = ref<{ [key: string]: ElementType }>({});

  function registerCustomProductCardComponent(element: ElementType) {
    if (!customProductCardComponents.value[element.id]) {
      customProductCardComponents.value[element.id] = element;
    }
  }

  return {
    customProductCardComponents: readonly(customProductCardComponents),
    registerCustomProductCardComponent,
  };
}

export const useCustomProductCardComponents = createGlobalState(_useCustomProductCardComponents);
