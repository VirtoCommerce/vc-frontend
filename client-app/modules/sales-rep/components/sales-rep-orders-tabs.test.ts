import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, reactive, ref } from "vue";
import { provideLayoutSettings } from "../composables/useLayoutSettings";
import LayoutBlock from "./layout-block.vue";
import SalesRepOrders from "./sales-rep-orders.vue";
import type { ILayoutSettingsType } from "../composables/useLayoutSettings";
import type { SalesRepRuleType } from "../types";
import type { SalesRepBlockSettingsType } from "../types/layout";
import type { PropType } from "vue";

const CATALOG: SalesRepRuleType[] = [
  { name: "New", label: "New" },
  { name: "Processing", label: "Processing" },
];

// The only apollo consumers here; the sort and period composables are pure.
const mocks = vi.hoisted(() => ({
  filterRules: [] as SalesRepRuleType[],
  ordersOptions: undefined as { filter?: () => string | undefined; first?: () => number | undefined } | undefined,
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key, te: () => false }) }));

vi.mock("../composables/useSalesRepRules", () => ({
  useSalesRepRules: (_domain: string, kind: string) => ({
    rules: ref(kind === "filter" ? mocks.filterRules : []),
    loading: ref(false),
  }),
}));

vi.mock("../composables/useSalesRepOrders", () => ({
  useSalesRepOrders: (options: typeof mocks.ordersOptions) => {
    mocks.ordersOptions = options;
    return { orders: ref([]), loading: ref(false), error: ref<Error | null>(null) };
  },
}));

const global = {
  stubs: {
    LayoutWidget: { template: '<div><slot name="default-container" /></div>' },
    VcEmptyView: true,
    VcTable: true,
    VcTableColumn: true,
    VcIcon: true,
    VcLink: true,
  },
};

/** The settings seam is a provide, so a real `LayoutBlock` has to install it. */
const Surface = defineComponent({
  props: {
    settings: { type: Object as PropType<ILayoutSettingsType>, required: true },
    editing: { type: Boolean, default: false },
  },

  setup(props) {
    // eslint-disable-next-line vue/no-setup-props-reactivity-loss -- each mount installs one fixed seam
    provideLayoutSettings(props.settings);

    return () =>
      h(
        LayoutBlock,
        { blockId: "orders", title: "Recent orders", editing: props.editing },
        {
          default: () => h(SalesRepOrders, { title: "Recent orders", filterable: true }),
        },
      );
  },
});

function mountOrders(options: { editing?: boolean; draft?: string[]; saved?: string[] } = {}) {
  const draft = reactive<SalesRepBlockSettingsType>({ maxRows: 5, hiddenTabs: options.draft ?? [] });
  const saved = reactive<SalesRepBlockSettingsType>({ maxRows: 5, hiddenTabs: options.saved ?? [] });
  const update = vi.fn((_id: string, patch: Partial<SalesRepBlockSettingsType>) => Object.assign(draft, patch));

  const wrapper = mount(Surface, {
    props: {
      settings: {
        valuesOf: () => draft,
        savedValuesOf: () => saved,
        maxRowsOf: () => ({ kind: "maxRows", default: 5, min: 1, max: 20 }) as const,
        update,
      },
      editing: options.editing ?? false,
    },
    global,
  });

  return { wrapper, draft, saved, update, filter: () => mocks.ordersOptions?.filter?.() };
}

describe("the order status tabs of a widget inside a layout", () => {
  it("keeps the chosen chip when the rep unchecks that tab and cancels", async () => {
    mocks.filterRules = CATALOG;
    const { wrapper, draft, filter } = mountOrders();

    await wrapper.findAll(".sales-rep-rule-chips__tab")[2].trigger("click");
    expect(filter()).toBe("Processing");

    // Unchecked while editing: the draft moves, the saved document does not.
    await wrapper.setProps({ editing: true });
    draft.hiddenTabs = ["Processing"];
    await nextTick();
    expect(filter()).toBe("Processing");

    // Cancel.
    draft.hiddenTabs = [];
    await wrapper.setProps({ editing: false });
    expect(filter()).toBe("Processing");
    expect(wrapper.findAll(".sales-rep-rule-chips__tab")).toHaveLength(3);
  });

  // The chips' count element is opt-in (documents category tabs); rules without counts render none.
  it("renders no count element when the rules carry no counts", () => {
    mocks.filterRules = CATALOG;
    const { wrapper } = mountOrders();

    expect(wrapper.find(".sales-rep-rule-chips__count").exists()).toBe(false);
  });

  it("clears the chosen chip once the tab is saved away", async () => {
    mocks.filterRules = CATALOG;
    const { wrapper, saved, filter } = mountOrders();

    await wrapper.findAll(".sales-rep-rule-chips__tab")[2].trigger("click");
    expect(filter()).toBe("Processing");

    saved.hiddenTabs = ["Processing"];
    await nextTick();

    expect(filter()).toBeUndefined();
    expect(wrapper.findAll(".sales-rep-rule-chips__tab")).toHaveLength(2);
  });

  // A tray restore: edit mode already on, catalog already cached, so neither watch source changes again.
  it("prunes a retired tab name on a mount that is already in edit mode", async () => {
    mocks.filterRules = CATALOG;
    const { update } = mountOrders({ editing: true, draft: ["Processing", "Retired"] });

    await nextTick();

    expect(update).toHaveBeenCalledWith("orders", { hiddenTabs: ["Processing"] });
  });

  it("leaves the selection alone on a mount outside edit mode", async () => {
    mocks.filterRules = CATALOG;
    const { update } = mountOrders({ draft: ["Processing", "Retired"] });

    await nextTick();

    expect(update).not.toHaveBeenCalled();
  });

  // An empty catalog means the query has not resolved, not that every status was retired.
  it("prunes nothing while the catalog is still unloaded", async () => {
    mocks.filterRules = [];
    const { update } = mountOrders({ editing: true, draft: ["Processing"] });

    await nextTick();

    expect(update).not.toHaveBeenCalled();
  });
});
