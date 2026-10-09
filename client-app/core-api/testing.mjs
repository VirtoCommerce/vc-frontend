/**
 * `@vc-frontend/core/testing` — mount helpers for a plugin's own specs.
 *
 * Ships as real source, unlike the root export: a plugin's tests run with no host to inject
 * anything. `@vue/test-utils` arrives as an argument rather than an import so this file does
 * not depend on the consumer's copy.
 */
import { merge } from "lodash-es";
import { createI18n } from "vue-i18n";

const i18n = createI18n({
  locale: "en",
  legacy: false,
  messages: {},
  missingWarn: false,
});

const defaults = {
  global: {
    mocks: {
      $t: (key, ...args) => `${key} ${args.join(", ")}`,
      $n: (count) => count,
      $d: (date) => date,
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

export function createWrapperFactory(mount, component, globalOverrides = {}) {
  return (overrides = {}) => mount(component, { ...merge({}, defaults, globalOverrides, overrides) });
}

export function createShallowWrapperFactory(shallowMount, component, globalOverrides = {}) {
  return (overrides = {}) => shallowMount(component, { ...merge({}, defaults, globalOverrides, overrides) });
}
