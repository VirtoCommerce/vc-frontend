import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import { Logger } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { DefineComponent } from "vue";

export type ElementType = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: DefineComponent<{ product: Product }, Record<string, any>, any>;
  shouldRender: (product: Product) => boolean;
};

function _useCustomProductComponents() {
  const customProductComponents = ref<{ [key: string]: ElementType }>({});

  function registerCustomProductComponent(element: ElementType) {
    if (!customProductComponents.value[element.id]) {
      customProductComponents.value[element.id] = element;
    } else {
      Logger.warn(`useCustomProductComponents: Custom product component with id ${element.id} already registered`);
    }
  }

  function getCustomProductComponent(id: string) {
    return customProductComponents.value[id]?.component;
  }

  function isCustomProductComponentRegistered(id: string) {
    return customProductComponents.value[id] !== undefined;
  }

  function shouldRenderCustomProductComponent(id: string, product: Product) {
    return customProductComponents.value[id]?.shouldRender(product);
  }

  return {
    registerCustomProductComponent,
    getCustomProductComponent,
    isCustomProductComponentRegistered,
    shouldRenderCustomProductComponent,
  };
}

export const useCustomProductComponents = createGlobalState(_useCustomProductComponents);
