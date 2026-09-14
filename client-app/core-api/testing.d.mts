import type { Component } from "vue";

export declare function createWrapperFactory<T extends Component>(
  mount: typeof import("@vue/test-utils").mount,
  component: T,
  globalOverrides?: Parameters<typeof import("@vue/test-utils").mount>[1],
): (
  overrides?: Parameters<typeof import("@vue/test-utils").mount<T>>[1],
) => ReturnType<typeof import("@vue/test-utils").mount<T>>;

export declare function createShallowWrapperFactory<T extends Component>(
  shallowMount: typeof import("@vue/test-utils").shallowMount,
  component: T,
  globalOverrides?: Parameters<typeof import("@vue/test-utils").shallowMount>[1],
): (
  overrides?: Parameters<typeof import("@vue/test-utils").shallowMount<T>>[1],
) => ReturnType<typeof import("@vue/test-utils").shallowMount<T>>;
