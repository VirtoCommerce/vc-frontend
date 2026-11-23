import { mount } from "@vue/test-utils";
import { vMaska } from "maska/vue";
import { defineComponent, h } from "vue";
import { createI18n } from "vue-i18n";
import * as UIKitComponents from "@/ui-kit/components";
import { createWrapperFactory } from "./wrapper-factory";
import type { VueWrapper } from "@vue/test-utils";
import VcSelect from "@/ui-kit/components/molecules/select/vc-select.vue";

// Import this harness by path, not through the test-mocks index, which carries the vue-i18n mock; the
// messages below need the real one.

export const ITEMS = ["Albania", "Belgium", "China"];

// vc-select.vue's SEARCH_DEBOUNCE_MS: a `<script setup>` constant cannot be imported.
export const SEARCH_DEBOUNCE_MS = 300;

// Real strings for the parameterised keys; with empty messages t() would return the bare key.
const countingI18n = createI18n({
  locale: "en",
  legacy: false,
  missingWarn: false,
  messages: {
    en: {
      ui_kit: {
        select: {
          items_selected: "{0} items selected",
          results_available: "{0} results available",
          no_results_found: "No results found",
          selected_of_total: "{selected} of {total}",
          select_all_label: "Select all, {selected} of {total}",
        },
      },
    },
  },
});

export const WITH_MESSAGES = { plugins: [countingI18n] };

// Integration mount on purpose: the trigger, popover, list and checkbox are not stubbed.
// Components go in as an object, not the uiKit plugin, which would duplicate html-safe under
// lodash.merge; only maska is needed. i18n has empty messages, so t() returns keys.
// attachTo: document.activeElement only tracks attached nodes, so a suite mounting with it
// enables auto-unmount, or a leftover instance would answer the next test's queries.
export const MOUNT_OPTIONS: Parameters<typeof mount>[1] = {
  attachTo: document.body,
  global: { components: UIKitComponents, directives: { maska: vMaska } },
};

export type SelectMountOptionsType = NonNullable<Parameters<typeof mount<typeof VcSelect>>[1]>;

export function noop() {
  return undefined;
}

// Mounted through a parent so reactive arrays reach the select as they are: the mount factory
// deep-merges props, which would copy them.
export function mountWithReactiveProps(
  props: () => Record<string, unknown>,
  slots?: () => Record<string, unknown> | undefined,
  global?: SelectMountOptionsType["global"],
) {
  const parent = defineComponent({ setup: () => () => h(VcSelect as never, props(), slots?.()) });

  return createWrapperFactory(mount, parent, MOUNT_OPTIONS)({ global });
}

// `selectAllProps` has a handler, as a paged Select all needs one; the warning tests go without it.
export const unhandledSelectAllProps = { items: ITEMS, multiple: true, withSelectAll: true };
export const selectAllProps = { ...unhandledSelectAllProps, onSelectAll: noop };

// No option carries the 39 `x` values.
export const SELECTED = ["Albania", ...Array.from({ length: 39 }, (_, index) => `x${index}`)];

// A server's answer per query. Each carries the query's selected matches, as `selected-count` asks
// of a paged consumer.
export const ANSWERS: Record<string, { items: string[]; total: number; selectedCount?: number }> = {
  "": { items: ITEMS, total: 500, selectedCount: SELECTED.length },
  a: { items: ["Albania", "Andorra", "Austria"], total: 10, selectedCount: 1 },
};

export function isSelectAllDisabled(wrapper: VueWrapper): boolean {
  return wrapper.get(".vc-select-all input").attributes("disabled") !== undefined;
}

export function announced(wrapper: VueWrapper): string {
  return wrapper.get('[aria-live="polite"]').text();
}
