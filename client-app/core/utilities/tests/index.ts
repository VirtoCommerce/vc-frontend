import merge from "lodash/merge";
import { createI18n } from "vue-i18n";
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
      $d: (date: unknown) => date,
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
  mount: typeof import("@vue/test-utils").mount,
  component: T,
  globalOverrides: Parameters<typeof mount>[1] = {},
) {
  return (overrides: Parameters<typeof mount<T>>[1] = {}) =>
    mount(component, {
      ...merge({}, defaults, globalOverrides, overrides),
    });
}

export function createShallowWrapperFactory<T extends Component>(
  shallowMount: typeof import("@vue/test-utils").shallowMount,
  component: T,
  globalOverrides: Parameters<typeof shallowMount>[1] = {},
) {
  return (overrides: Parameters<typeof shallowMount<T>>[1] = {}) =>
    shallowMount(component, {
      ...merge({}, defaults, globalOverrides, overrides),
    });
}
