import { merge } from "lodash-es";
import { createI18n } from "vue-i18n";
import type { mount } from "@vue/test-utils";
import type { Component } from "vue";

const i18n = createI18n({
  locale: "en",
  legacy: false,
  messages: {},
  missingWarn: false,
});

const defaults = {
  global: {
    mocks: {
      $t: (key: string, ...args: unknown[]) => `${key} ${args.join(", ")}`,
      $n: (count: number) => count,
      $d: (date: Date) => date,
      $route: {
        path: "/",
        name: "home",
        params: {},
        query: {},
      },
      $router: {
        push: () => {},
        replace: () => {},
      },
    },
    stubs: {
      "router-link": true,
      "router-view": true,
      transition: true,
      "transition-group": true,
    },
    directives: {
      "html-safe": true,
    },
    plugins: [i18n],
    renderStubDefaultSlot: true,
  },
};

export function createWrapperFactory<T extends Component>(
  mountFn: typeof mount,
  component: T,
  globalOverrides: Parameters<typeof mount>[1] = {},
): (overrides?: Parameters<typeof mount<T>>[1]) => ReturnType<typeof mount<T>> {
  return (overrides = {}) => mountFn(component, { ...merge({}, defaults, globalOverrides, overrides) });
}
