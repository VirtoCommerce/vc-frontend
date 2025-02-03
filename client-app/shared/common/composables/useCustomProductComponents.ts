import { createGlobalState } from "@vueuse/core";
import { shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { DefineComponent } from "vue";

export type ElementType = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: DefineComponent<{ product: Product }, Record<string, any>, any>;
  shouldRender?: (product: Product) => boolean;
  props?: Record<string, unknown>;
};

function _useCustomProductComponents() {
  const customProductComponents = shallowRef<{ [key: string]: ElementType }>({});

  function registerComponent(element: ElementType) {
    if (!customProductComponents.value[element.id]) {
      customProductComponents.value[element.id] = element;
    } else {
      Logger.warn(`useCustomProductComponents: Custom product component with id ${element.id} already registered`);
    }
  }

  function getComponent(id: string) {
    return customProductComponents.value[id]?.component;
  }

  function isComponentRegistered(id: string) {
    return customProductComponents.value[id] !== undefined;
  }

  function shouldRenderComponent(id: string, product: Product) {
    return typeof customProductComponents.value[id]?.shouldRender === "function"
      ? customProductComponents.value[id]?.shouldRender(product)
      : true;
  }

  function getComponentProps(id: string) {
    return customProductComponents.value[id]?.props;
  }

  return {
    registerComponent,
    getComponent,
    isComponentRegistered,
    shouldRenderComponent,
    getComponentProps,
  };
}

export const useCustomProductComponents = createGlobalState(_useCustomProductComponents);
