import { mount, shallowMount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { createI18n } from "vue-i18n";
import { createWrapperFactory } from "@/core/utilities/tests";
import VcTableColumn from "./vc-table-column.vue";
import VcTable from "./vc-table.vue";

const i18n = createI18n({ locale: "en", legacy: false, messages: {}, missingWarn: false });

// Mutable flag so tests can emulate the mobile breakpoint; defaults to desktop.
const { breakpointState } = vi.hoisted(() => ({ breakpointState: { isMobile: false } }));

vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...actual,
    useBreakpoints: () => ({
      smaller: () => ({ value: breakpointState.isMobile }),
    }),
  };
});

afterEach(() => {
  breakpointState.isMobile = false;
});

const sharedStubs = {
  VcIcon: true,
  VcScrollbar: { template: "<div><slot /></div>" },
  VcPagination: true,
};

const createWrapper = createWrapperFactory(shallowMount, VcTable, {
  global: { stubs: sharedStubs },
});

/**
 * Mount VcTable with VcTableColumn children that have scoped slots.
 * This triggers the `hasColumnSlots` branch that produces `.vc-table__row` elements.
 *
 * Two nextTick cycles needed: first for VcTableColumn onMounted registration,
 * second for VcTable to re-render with registered columns.
 */
async function mountWithSlots(options: {
  items?: VcTableItemType[];
  columns?: Array<{ id: string; title: string }>;
  rowClass?:
    string | Record<string, boolean> | ((item: VcTableItemType, index: number) => string | Record<string, boolean>);
  rowStyle?:
    string | Record<string, string> | ((item: VcTableItemType, index: number) => string | Record<string, string>);
  onRowClick?: (item: VcTableItemType, index: number) => void;
}) {
  const cols = options.columns ?? [{ id: "name", title: "Name" }];
  const props: Record<string, unknown> = { items: options.items ?? [] };

  if (options.rowClass !== undefined) {
    props.rowClass = options.rowClass;
  }
  if (options.rowStyle !== undefined) {
    props.rowStyle = options.rowStyle;
  }

  const wrapper = mount(VcTable, {
    props,
    attrs: options.onRowClick ? { onRowClick: options.onRowClick } : {},
    slots: {
      default: () =>
        cols.map((col) =>
          h(
            VcTableColumn,
            { id: col.id, title: col.title },
            {
              default: ({ item }: { item: VcTableItemType }) => {
                const value = item[col.id];
                return h("span", typeof value === "string" || typeof value === "number" ? String(value) : "");
              },
            },
          ),
        ),
    },
    global: { stubs: sharedStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
  });

  await nextTick();
  await nextTick();

  return wrapper;
}

// ─── Test data ──────────────────────────────────────────────

const items: VcTableItemType[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];

// ─── 1. orderedColumns ──────────────────────────────────────

describe("orderedColumns", () => {
  it("preserves original order for unfixed columns", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A" },
          { id: "b", title: "B" },
          { id: "c", title: "C" },
        ],
        items,
      },
    });

    const titles = wrapper.findAll("th").map((th) => th.text());
    expect(titles).toEqual(["A", "B", "C"]);
  });

  it("reorders: fixed-start → center → fixed-end", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "center", title: "Center" },
          { id: "end", title: "End", fixed: "end", width: "80px" },
          { id: "start", title: "Start", fixed: "start", width: "100px" },
        ],
        items,
      },
    });

    const titles = wrapper.findAll("th").map((th) => th.text());
    expect(titles).toEqual(["Start", "Center", "End"]);
  });

  it("preserves relative order within each group", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "s2", title: "S2", fixed: "start", width: "100px" },
          { id: "c1", title: "C1" },
          { id: "e1", title: "E1", fixed: "end", width: "80px" },
          { id: "s1", title: "S1", fixed: "start", width: "100px" },
          { id: "c2", title: "C2" },
          { id: "e2", title: "E2", fixed: "end", width: "80px" },
        ],
        items,
      },
    });

    const titles = wrapper.findAll("th").map((th) => th.text());
    expect(titles).toEqual(["S2", "S1", "C1", "C2", "E1", "E2"]);
  });
});

// ─── 2. columnOffsets (calc() fix) ──────────────────────────

describe("columnOffsets", () => {
  it("sets first fixed-start offset to 0px", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A", fixed: "start", width: "150px" },
          { id: "b", title: "B" },
        ],
        items,
      },
    });

    expect(wrapper.findAll("th")[0].attributes("style")).toContain("inset-inline-start: 0px");
  });

  it("uses calc() for second fixed-start column with original units", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A", fixed: "start", width: "10rem" },
          { id: "b", title: "B", fixed: "start", width: "8rem" },
          { id: "c", title: "C" },
        ],
        items,
      },
    });

    const style = wrapper.findAll("th")[1].attributes("style") ?? "";
    expect(style).toContain("calc(10rem)");
  });

  it("accumulates mixed units: calc(100px + 9rem)", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A", fixed: "start", width: "100px" },
          { id: "b", title: "B", fixed: "start", width: "9rem" },
          { id: "c", title: "C", fixed: "start", width: "5em" },
          { id: "d", title: "D" },
        ],
        items,
      },
    });

    const headers = wrapper.findAll("th");
    expect(headers[0].attributes("style")).toContain("inset-inline-start: 0px");
    expect(headers[1].attributes("style")).toContain("calc(100px)");
    expect(headers[2].attributes("style")).toContain("calc(100px + 9rem)");
  });

  it("uses default 150px for fixed columns without explicit width", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A", fixed: "start" },
          { id: "b", title: "B", fixed: "start", width: "200px" },
          { id: "c", title: "C" },
        ],
        items,
      },
    });

    expect(wrapper.findAll("th")[1].attributes("style")).toContain("calc(150px)");
  });

  it("computes end offsets from right edge", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A" },
          { id: "e1", title: "E1", fixed: "end", width: "100px" },
          { id: "e2", title: "E2", fixed: "end", width: "80px" },
        ],
        items,
      },
    });

    const headers = wrapper.findAll("th");
    // Last (e2): 0px, second-to-last (e1): calc(80px)
    expect(headers[2].attributes("style")).toContain("inset-inline-end: 0px");
    expect(headers[1].attributes("style")).toContain("calc(80px)");
  });
});

// ─── 3. resolvedRowClass ────────────────────────────────────

describe("resolvedRowClass", () => {
  it("no extra classes without rowClass and without @row-click", async () => {
    const wrapper = await mountWithSlots({ items });
    const row = wrapper.find(".vc-table__row");

    expect(row.classes()).not.toContain("cursor-pointer");
  });

  it("applies string rowClass", async () => {
    const wrapper = await mountWithSlots({ items, rowClass: "highlighted" });
    const row = wrapper.find(".vc-table__row");

    expect(row.classes()).toContain("highlighted");
  });

  it("applies object rowClass", async () => {
    const wrapper = await mountWithSlots({
      items,
      rowClass: { "row-active": true, "row-disabled": false },
    });
    const row = wrapper.find(".vc-table__row");

    expect(row.classes()).toContain("row-active");
    expect(row.classes()).not.toContain("row-disabled");
  });

  it("applies function rowClass per row", async () => {
    const wrapper = await mountWithSlots({
      items,
      rowClass: (_item: VcTableItemType, index: number) => (index === 0 ? "first" : "other"),
    });
    const rows = wrapper.findAll(".vc-table__row");

    expect(rows[0].classes()).toContain("first");
    expect(rows[1].classes()).toContain("other");
  });

  it("adds cursor-pointer when @row-click listener is bound", async () => {
    const wrapper = await mountWithSlots({ items, onRowClick: () => {} });
    const row = wrapper.find(".vc-table__row");

    expect(row.classes()).toContain("cursor-pointer");
  });

  it("combines rowClass and cursor-pointer", async () => {
    const wrapper = await mountWithSlots({
      items,
      rowClass: "custom",
      onRowClick: () => {},
    });
    const row = wrapper.find(".vc-table__row");

    expect(row.classes()).toContain("custom");
    expect(row.classes()).toContain("cursor-pointer");
  });
});

// ─── 4. resolvedRowStyle ────────────────────────────────────

describe("resolvedRowStyle", () => {
  it("no style without rowStyle prop", async () => {
    const wrapper = await mountWithSlots({ items });
    const row = wrapper.find(".vc-table__row");

    expect(row.attributes("style")).toBeUndefined();
  });

  it("applies string rowStyle", async () => {
    const wrapper = await mountWithSlots({ items, rowStyle: "opacity: 0.5;" });
    const row = wrapper.find(".vc-table__row");

    expect(row.attributes("style")).toContain("opacity: 0.5");
  });

  it("applies object rowStyle", async () => {
    const wrapper = await mountWithSlots({ items, rowStyle: { color: "red" } });
    const row = wrapper.find(".vc-table__row");

    expect(row.attributes("style")).toContain("color: red");
  });

  it("applies function rowStyle per row", async () => {
    const wrapper = await mountWithSlots({
      items,
      rowStyle: (_item: VcTableItemType, index: number) =>
        index === 0 ? { fontWeight: "bold" } : { fontWeight: "normal" },
    });
    const rows = wrapper.findAll(".vc-table__row");

    expect(rows[0].attributes("style")).toContain("font-weight: bold");
    expect(rows[1].attributes("style")).toContain("font-weight: normal");
  });
});

// ─── 5. getColumnStyle ──────────────────────────────────────

describe("getColumnStyle", () => {
  it("returns sticky style for fixed-start column", () => {
    const wrapper = createWrapper({
      props: {
        columns: [{ id: "a", title: "A", fixed: "start", width: "120px" }],
        items,
      },
    });

    const style = wrapper.find("th").attributes("style") ?? "";
    expect(style).toContain("position: sticky");
    expect(style).toContain("z-index: 3");
    expect(style).toContain("inset-inline-start: 0px");
    expect(style).toContain("width: 120px");
    expect(style).toContain("min-width: 120px");
    expect(style).toContain("max-width: 120px");
  });

  it("returns sticky style for fixed-end column", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A" },
          { id: "b", title: "B", fixed: "end", width: "100px" },
        ],
        items,
      },
    });

    const style = wrapper.findAll("th")[1].attributes("style") ?? "";
    expect(style).toContain("inset-inline-end: 0px");
  });

  it("returns only min-width for non-fixed column with width", () => {
    const wrapper = createWrapper({
      props: {
        columns: [{ id: "a", title: "A", width: "200px" }],
        items,
      },
    });

    const style = wrapper.find("th").attributes("style") ?? "";
    expect(style).toContain("min-width: 200px");
    expect(style).not.toContain("position: sticky");
  });

  it("returns no style for column without width or fixed", () => {
    const wrapper = createWrapper({
      props: {
        columns: [{ id: "a", title: "A" }],
        items,
      },
    });

    expect(wrapper.find("th").attributes("style")).toBeUndefined();
  });
});

// ─── 6. getColumnFixedClasses ───────────────────────────────

describe("getColumnFixedClasses", () => {
  it("adds --fixed and --fixed--start to last fixed-start column", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A", fixed: "start", width: "100px" },
          { id: "b", title: "B" },
        ],
        items,
      },
    });

    const th = wrapper.findAll("th")[0];
    expect(th.classes()).toContain("vc-table__title--fixed");
    expect(th.classes()).toContain("vc-table__title--fixed--start");
  });

  it("adds --fixed and --fixed--end to first fixed-end column", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A" },
          { id: "b", title: "B", fixed: "end", width: "100px" },
        ],
        items,
      },
    });

    const th = wrapper.findAll("th")[1];
    expect(th.classes()).toContain("vc-table__title--fixed");
    expect(th.classes()).toContain("vc-table__title--fixed--end");
  });

  it("does not add fixed classes to unfixed columns", () => {
    const wrapper = createWrapper({
      props: {
        columns: [
          { id: "a", title: "A", fixed: "start", width: "100px" },
          { id: "b", title: "B" },
          { id: "c", title: "C", fixed: "end", width: "100px" },
        ],
        items,
      },
    });

    const center = wrapper.findAll("th")[1];
    expect(center.classes()).not.toContain("vc-table__title--fixed");
  });
});

// ─── 7. getAriaSort ─────────────────────────────────────────

describe("getAriaSort", () => {
  const sortableColumns: VcTableColumnType[] = [
    { id: "name", title: "Name", sortable: true },
    { id: "price", title: "Price", sortable: true },
  ];

  it('returns "ascending" for asc-sorted column', () => {
    const wrapper = createWrapper({
      props: {
        columns: sortableColumns,
        items,
        sort: { column: "name", direction: "asc" },
      },
    });

    expect(wrapper.findAll("th")[0].attributes("aria-sort")).toBe("ascending");
  });

  it('returns "descending" for desc-sorted column', () => {
    const wrapper = createWrapper({
      props: {
        columns: sortableColumns,
        items,
        sort: { column: "name", direction: "desc" },
      },
    });

    expect(wrapper.findAll("th")[0].attributes("aria-sort")).toBe("descending");
  });

  it('returns "none" for non-sorted column', () => {
    const wrapper = createWrapper({
      props: {
        columns: sortableColumns,
        items,
        sort: { column: "name", direction: "asc" },
      },
    });

    expect(wrapper.findAll("th")[1].attributes("aria-sort")).toBe("none");
  });

  it('returns "none" when sort prop is not provided', () => {
    const wrapper = createWrapper({
      props: { columns: sortableColumns, items },
    });

    expect(wrapper.findAll("th")[0].attributes("aria-sort")).toBe("none");
  });
});

// ─── 8. Empty / Error states ────────────────────────────────

// Expose VcEmptyView's text/icon + forward its `#button` slot, with a real <button>
// for VcButton so retry clicks propagate to VcTable's `@retry` emit.
const stateStubs = {
  ...sharedStubs,
  VcEmptyView: {
    props: ["variant", "icon", "text"],
    template: `
      <div class="empty-view-stub" :data-variant="variant" :data-icon="icon">
        <span class="empty-view-stub__text">{{ text }}</span>
        <slot name="button" />
      </div>
    `,
  },
  VcButton: { template: '<button class="button-stub"><slot /></button>' },
};

// Desktop columns + a `mobile-item` slot so both branches have content to fall back from.
// Set `breakpointState.isMobile = true` before calling for the mobile branch.
async function mountState(options: {
  items?: VcTableItemType[];
  error?: boolean;
  loading?: boolean;
  onRetry?: () => void;
  desktopEmptySlot?: boolean;
  errorSlot?: boolean;
}) {
  const props: Record<string, unknown> = { items: options.items ?? [] };
  if (options.error !== undefined) {
    props.error = options.error;
  }
  if (options.loading !== undefined) {
    props.loading = options.loading;
  }

  const slots: Record<string, (scope?: { item: VcTableItemType }) => unknown> = {
    default: () =>
      h(
        VcTableColumn,
        { id: "name", title: "Name" },
        { default: ({ item }: { item: VcTableItemType }) => h("span", String(item.name ?? "")) },
      ),
    "mobile-item": (scope) => h("div", { class: "mobile-item" }, String(scope?.item.name ?? "")),
  };

  if (options.desktopEmptySlot) {
    slots["desktop-empty"] = () => h("tr", { class: "custom-empty" }, [h("td", "Custom empty")]);
  }
  if (options.errorSlot) {
    slots["error"] = () => h("div", { class: "custom-error" }, "Custom error");
  }

  const wrapper = mount(VcTable, {
    props,
    attrs: options.onRetry ? { onRetry: options.onRetry } : {},
    slots,
    global: { stubs: stateStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
  });

  await nextTick();
  await nextTick();

  return wrapper;
}

describe("error state (desktop)", () => {
  it("renders default error and hides data rows and empty when error=true", async () => {
    const wrapper = await mountState({ items, error: true });

    const emptyView = wrapper.find(".empty-view-stub");
    expect(emptyView.exists()).toBe(true);
    expect(emptyView.attributes("data-variant")).toBe("error");
    expect(emptyView.find(".empty-view-stub__text").text()).toBe("ui_kit.table.error");
    expect(wrapper.find(".vc-table__row").exists()).toBe(false);
  });

  it("prioritizes error over empty when items is empty", async () => {
    const wrapper = await mountState({ items: [], error: true });

    const emptyView = wrapper.find(".empty-view-stub");
    expect(emptyView.attributes("data-variant")).toBe("error");
    expect(emptyView.find(".empty-view-stub__text").text()).toBe("ui_kit.table.error");
  });

  it("prioritizes loading over error (renders skeleton, not error)", async () => {
    const wrapper = await mountState({ items: [], error: true, loading: true });

    expect(wrapper.find(".vc-table__skeleton").exists()).toBe(true);
    expect(wrapper.find(".empty-view-stub").exists()).toBe(false);
  });

  it("wraps the desktop error state in a full-width state cell", async () => {
    const wrapper = await mountState({ items: [], error: true });

    expect(wrapper.find("td.vc-table__state-cell").exists()).toBe(true);
  });

  it("does not render the retry button without a @retry listener", async () => {
    const wrapper = await mountState({ items: [], error: true });

    expect(wrapper.find(".button-stub").exists()).toBe(false);
  });

  it("renders the retry button and emits `retry` on click when a @retry listener is bound", async () => {
    const onRetry = vi.fn();
    const wrapper = await mountState({ items: [], error: true, onRetry });

    const button = wrapper.find(".button-stub");
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe("ui_kit.table.retry");

    await button.trigger("click");

    expect(wrapper.emitted("retry")).toHaveLength(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders the #error slot instead of the default error inside the state cell", async () => {
    const wrapper = await mountState({ items: [], error: true, errorSlot: true });

    const stateCell = wrapper.find("td.vc-table__state-cell");
    expect(stateCell.exists()).toBe(true);
    expect(stateCell.find(".custom-error").exists()).toBe(true);
    expect(wrapper.find(".empty-view-stub").exists()).toBe(false);
  });
});

describe("empty state (desktop)", () => {
  it("renders the default empty view when no #desktop-empty slot is provided", async () => {
    const wrapper = await mountState({ items: [] });

    const emptyView = wrapper.find(".empty-view-stub");
    expect(emptyView.exists()).toBe(true);
    expect(emptyView.attributes("data-variant")).toBe("search");
    expect(emptyView.find(".empty-view-stub__text").text()).toBe("ui_kit.table.empty");
    expect(wrapper.find("td.vc-table__state-cell").exists()).toBe(true);
  });

  it("renders the #desktop-empty slot instead of the default empty view", async () => {
    const wrapper = await mountState({ items: [], desktopEmptySlot: true });

    expect(wrapper.find(".custom-empty").exists()).toBe(true);
    expect(wrapper.find(".empty-view-stub").exists()).toBe(false);
  });

  it("does not render the empty view when items are present", async () => {
    const wrapper = await mountState({ items });

    expect(wrapper.find(".empty-view-stub").exists()).toBe(false);
    expect(wrapper.find(".vc-table__row").exists()).toBe(true);
  });
});

describe("error / empty states (mobile)", () => {
  it("renders the default mobile error and emits `retry` on click", async () => {
    breakpointState.isMobile = true;
    const onRetry = vi.fn();
    const wrapper = await mountState({ items: [], error: true, onRetry });

    const emptyView = wrapper.find(".empty-view-stub");
    expect(emptyView.attributes("data-variant")).toBe("error");
    expect(wrapper.find(".mobile-item").exists()).toBe(false);

    const button = wrapper.find(".button-stub");
    expect(button.exists()).toBe(true);

    await button.trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });

  it("prioritizes mobile error over empty when items is empty", async () => {
    breakpointState.isMobile = true;
    const wrapper = await mountState({ items: [], error: true });

    expect(wrapper.find(".empty-view-stub").attributes("data-variant")).toBe("error");
  });

  it("renders the #error slot instead of the default mobile error", async () => {
    breakpointState.isMobile = true;
    const wrapper = await mountState({ items: [], error: true, errorSlot: true });

    expect(wrapper.find(".custom-error").exists()).toBe(true);
    expect(wrapper.find(".empty-view-stub").exists()).toBe(false);
  });

  it("renders the default mobile empty view when no error and no items", async () => {
    breakpointState.isMobile = true;
    const wrapper = await mountState({ items: [] });

    const emptyView = wrapper.find(".empty-view-stub");
    expect(emptyView.exists()).toBe(true);
    expect(emptyView.attributes("data-variant")).toBe("search");
    expect(emptyView.find(".empty-view-stub__text").text()).toBe("ui_kit.table.empty");
  });
});

// ─── 9. Row selection ───────────────────────────────────────

// Selection-control stubs: mirror the bound props and emit `change` from a real
// <button>, so tests can toggle and assert checked/indeterminate/disabled without
// the full VcCheckbox / VcRadioButton internals.
const selectionStubs = {
  ...sharedStubs,
  VcCheckbox: {
    props: ["modelValue", "indeterminate", "disabled", "ariaLabel"],
    emits: ["change"],
    template: `
      <button
        class="checkbox-stub"
        :data-checked="String(modelValue)"
        :data-indeterminate="String(!!indeterminate)"
        :data-disabled="String(!!disabled)"
        :aria-label="ariaLabel"
        @click="$emit('change', !modelValue)"
      />
    `,
  },
  // The table toggles the radio on native `click` (a real radio's `change` can't fire
  // when re-clicking the already-checked radio), so the stub only needs to be clickable.
  VcRadioButton: {
    props: ["modelValue", "value", "disabled", "ariaLabel"],
    template: `
      <button
        class="radio-stub"
        :data-checked="String(modelValue === value)"
        :data-disabled="String(!!disabled)"
        :aria-label="ariaLabel"
      />
    `,
  },
  // Lightweight state stubs so empty/error branches render without the real molecules.
  VcEmptyView: { props: ["variant", "text"], template: '<div class="empty-view-stub" :data-variant="variant" />' },
  VcButton: { template: '<button class="button-stub"><slot /></button>' },
};

// Single VcTableColumn child (desktop, slot-based) plus optional #desktop-item /
// #mobile-item slots exposing the selection scope.
async function mountSelectable(options: {
  items?: VcTableItemType[];
  selectionMode?: VcTableSelectionModeType;
  selection?: VcTableSelectionKeyType[];
  isRowSelectable?: (item: VcTableItemType) => boolean;
  onRowClick?: (item: VcTableItemType, index: number) => void;
  desktopItemSlot?: boolean;
  mobileItemSlot?: boolean;
  desktopBodySlot?: boolean;
  headerSlot?: "with-selection" | "without-selection" | "no-cells";
  fixedStartColumn?: boolean;
  loading?: boolean;
  error?: boolean;
}) {
  const props: Record<string, unknown> = { items: options.items ?? items };
  if (options.selectionMode !== undefined) {
    props.selectionMode = options.selectionMode;
  }
  if (options.selection !== undefined) {
    props.selection = options.selection;
  }
  if (options.isRowSelectable !== undefined) {
    props.isRowSelectable = options.isRowSelectable;
  }
  if (options.loading !== undefined) {
    props.loading = options.loading;
  }
  if (options.error !== undefined) {
    props.error = options.error;
  }

  // With a #desktop-item slot (or an opaque #desktop-body), register the column without a
  // default slot so the column-slot tbody branch (which wins over both) stays inactive.
  const slots: Record<string, unknown> = {
    default: () =>
      h(
        VcTableColumn,
        { id: "name", title: "Name", fixed: options.fixedStartColumn ? "start" : undefined },
        options.desktopItemSlot || options.desktopBodySlot
          ? {}
          : { default: ({ item }: { item: VcTableItemType }) => h("span", String(item.name ?? "")) },
      ),
  };

  if (options.desktopBodySlot) {
    slots["desktop-body"] = () =>
      (options.items ?? items).map((item) =>
        h("tr", { class: "desktop-body-row" }, [h("td", { class: "desktop-body-cell" }, String(item.name ?? ""))]),
      );
  }

  if (options.desktopItemSlot) {
    slots["desktop-item"] = (scope: VcTableItemSlotScopeType<VcTableItemType>) =>
      h("tr", { class: ["desktop-item-slot", { "is-selected": scope.selected, "is-selectable": scope.selectable }] }, [
        h(
          "button",
          { class: "desktop-item-slot__toggle", onClick: () => scope.toggle() },
          String(scope.item.name ?? ""),
        ),
      ]);
  }

  // Custom header, with or without the leading selection cell the body still renders.
  if (options.headerSlot) {
    const keepsSelectionCell = options.headerSlot === "with-selection";

    slots.header = (scope: VcTableHeaderSlotScopeType) => {
      if (options.headerSlot === "no-cells") {
        return h("thead", { class: "custom-head" });
      }

      return h("thead", { class: "custom-head" }, [
        h("tr", [
          ...(keepsSelectionCell && scope.showSelectionColumn
            ? [
                h("th", { scope: "col", ...scope.selectionColumnAttrs }, [
                  // The built-in header shows a select-all only in `multiple`; mirror that.
                  ...(scope.selectionMode === "multiple"
                    ? [
                        h("button", {
                          class: "custom-select-all",
                          "data-checked": String(scope.isAllSelected),
                          "data-indeterminate": String(scope.isSomeSelected),
                          "data-disabled": String(!scope.canSelectAll),
                          onClick: () => scope.toggleSelectAll(),
                        }),
                      ]
                    : []),
                ]),
              ]
            : []),
          h("th", { class: "custom-head__title" }, "Name"),
        ]),
      ]);
    };
  }

  if (options.mobileItemSlot) {
    slots["mobile-item"] = (scope: VcTableItemSlotScopeType<VcTableItemType>) =>
      h("div", { class: ["mobile-item-slot", { "is-selected": scope.selected, "is-selectable": scope.selectable }] }, [
        h(
          "button",
          { class: "mobile-item-slot__toggle", onClick: () => scope.toggle() },
          String(scope.item.name ?? ""),
        ),
      ]);
  }

  const wrapper = mount(VcTable, {
    props,
    attrs: options.onRowClick ? { onRowClick: options.onRowClick } : {},
    slots,
    global: { stubs: selectionStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
  });

  await nextTick();
  await nextTick();

  return wrapper;
}

describe("row selection — multiple (desktop)", () => {
  it("toggles a row on: emits update:selection and selectionChange with select meta", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    // First data-row checkbox (header checkbox is inside <thead>, rows are inside <tbody>).
    const rowCheckbox = wrapper.find("tbody .checkbox-stub");
    await rowCheckbox.trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["1"]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[0]).toEqual(["1"]);
    expect(change[1]).toEqual([items[0]]);
    expect(change[2]).toEqual({ action: "select", row: items[0] });
  });

  it("toggles a row off: removes its key and emits deselect meta", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: ["1", "2"] });

    const rowCheckbox = wrapper.find("tbody .checkbox-stub");
    await rowCheckbox.trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["2"]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "deselect", row: items[0] });
  });

  it("marks selected rows with vc-table__row--selected", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: ["2"] });

    const rows = wrapper.findAll(".vc-table__row");
    expect(rows[0].classes()).not.toContain("vc-table__row--selected");
    expect(rows[1].classes()).toContain("vc-table__row--selected");
  });
});

describe("row selection — select-all (multiple)", () => {
  it("selects all selectable rows on the current page and emits select-all meta", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    const headerCheckbox = wrapper.find("thead .checkbox-stub");
    expect(headerCheckbox.attributes("data-checked")).toBe("false");
    expect(headerCheckbox.attributes("data-indeterminate")).toBe("false");

    await headerCheckbox.trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["1", "2", "3"]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "select-all" });
  });

  it("header checkbox is checked when all rows are selected", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: ["1", "2", "3"] });

    const headerCheckbox = wrapper.find("thead .checkbox-stub");
    expect(headerCheckbox.attributes("data-checked")).toBe("true");
    expect(headerCheckbox.attributes("data-indeterminate")).toBe("false");
  });

  it("header checkbox is indeterminate on partial selection", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: ["1"] });

    const headerCheckbox = wrapper.find("thead .checkbox-stub");
    expect(headerCheckbox.attributes("data-checked")).toBe("false");
    expect(headerCheckbox.attributes("data-indeterminate")).toBe("true");
  });

  it("deselects the current page and emits deselect-all meta", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: ["1", "2", "3"] });

    await wrapper.find("thead .checkbox-stub").trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "deselect-all" });
  });

  it("excludes disabled rows from select-all", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      isRowSelectable: (item) => item.id !== "2",
    });

    await wrapper.find("thead .checkbox-stub").trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["1", "3"]]);
  });

  it("header checkbox is checked when all selectable (non-disabled) rows are selected", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: ["1", "3"],
      isRowSelectable: (item) => item.id !== "2",
    });

    const headerCheckbox = wrapper.find("thead .checkbox-stub");
    expect(headerCheckbox.attributes("data-checked")).toBe("true");
  });
});

// Regression: `getItemKey` stringifies keys but `selection` accepts `(string | number)[]`,
// so numeric keys must still match/toggle/clear (`Set([1]).has("1")` is false without normalization).
const numericItems: VcTableItemType[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

describe("row selection — numeric keys (multiple)", () => {
  it("marks rows selected when the parent supplies numeric keys", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      items: numericItems,
      selection: [1, 2],
    });

    const rows = wrapper.findAll(".vc-table__row");
    expect(rows[0].classes()).toContain("vc-table__row--selected");
    expect(rows[1].classes()).toContain("vc-table__row--selected");
    expect(rows[2].classes()).not.toContain("vc-table__row--selected");
  });

  it("toggling a new row emits normalized string keys without duplicates", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      items: numericItems,
      selection: [1],
    });

    await wrapper.findAll("tbody .checkbox-stub")[1].trigger("click");

    // Both keys must be strings — no `[1, "2"]` mismatch.
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["1", "2"]]);
  });

  it("toggling an already-selected numeric row removes it (no lingering numeric key)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      items: numericItems,
      selection: [1],
    });

    await wrapper.findAll("tbody .checkbox-stub")[0].trigger("click");

    // Must fully clear — not leave `1` alongside a new `"1"`.
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);
  });

  it("header checkbox reflects a fully numeric selection as checked", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      items: numericItems,
      selection: [1, 2, 3],
    });

    const headerCheckbox = wrapper.find("thead .checkbox-stub");
    expect(headerCheckbox.attributes("data-checked")).toBe("true");
    expect(headerCheckbox.attributes("data-indeterminate")).toBe("false");
  });

  it("deselect-all clears a fully numeric selection (no stale numeric keys)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      items: numericItems,
      selection: [1, 2, 3],
    });

    await wrapper.find("thead .checkbox-stub").trigger("click");

    // Without normalization the numeric keys would survive the string-based filter.
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "deselect-all" });
  });
});

describe("row selection — numeric keys (single)", () => {
  it("marks the numeric-key row selected and deselects it via the slot toggle", async () => {
    // deselect via slot toggle; numeric key `2` must match already-selected `"2"`
    const wrapper = await mountSelectable({
      selectionMode: "single",
      items: numericItems,
      selection: [2],
      desktopItemSlot: true,
    });

    const slotRows = wrapper.findAll(".desktop-item-slot");
    expect(slotRows[1].classes()).toContain("is-selected");

    await slotRows[1].find(".desktop-item-slot__toggle").trigger("click");
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);
  });
});

describe("row selection — single (desktop)", () => {
  it("renders radio controls and no header select-all", async () => {
    const wrapper = await mountSelectable({ selectionMode: "single", selection: [] });

    expect(wrapper.find("tbody .radio-stub").exists()).toBe(true);
    expect(wrapper.find("thead .checkbox-stub").exists()).toBe(false);
    expect(wrapper.find("thead .radio-stub").exists()).toBe(false);
  });

  it("selecting a row replaces the previous selection (array stays <= 1)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "single", selection: ["1"] });

    const radios = wrapper.findAll("tbody .radio-stub");
    await radios[2].trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["3"]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "select", row: items[2] });
  });

  it("re-clicking the already-selected row via the radio deselects it", async () => {
    const wrapper = await mountSelectable({ selectionMode: "single", selection: ["1"] });

    await wrapper.findAll("tbody .radio-stub")[0].trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "deselect", row: items[0] });
  });
});

describe("row selection — single (slot toggle deselect)", () => {
  it("deselects the selected row via the #desktop-item slot toggle", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "single",
      selection: ["1"],
      desktopItemSlot: true,
    });

    const slotRows = wrapper.findAll(".desktop-item-slot");
    expect(slotRows[0].classes()).toContain("is-selected");

    await slotRows[0].find(".desktop-item-slot__toggle").trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "deselect", row: items[0] });
  });

  it("deselects the selected row via the #mobile-item slot toggle", async () => {
    breakpointState.isMobile = true;
    const wrapper = await mountSelectable({
      selectionMode: "single",
      selection: ["1"],
      mobileItemSlot: true,
    });

    const slotItems = wrapper.findAll(".mobile-item-slot");
    expect(slotItems[0].classes()).toContain("is-selected");

    await slotItems[0].find(".mobile-item-slot__toggle").trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "deselect", row: items[0] });
  });
});

describe("row selection — isRowSelectable=false", () => {
  it("disables the control of a non-selectable row (multiple)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      isRowSelectable: (item) => item.id !== "2",
    });

    const rowCheckboxes = wrapper.findAll("tbody .checkbox-stub");
    expect(rowCheckboxes[0].attributes("data-disabled")).toBe("false");
    expect(rowCheckboxes[1].attributes("data-disabled")).toBe("true");
  });

  it("disables the control of a non-selectable row (single)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "single",
      selection: [],
      isRowSelectable: (item) => item.id !== "2",
    });

    const radios = wrapper.findAll("tbody .radio-stub");
    expect(radios[1].attributes("data-disabled")).toBe("true");
  });

  it("does not emit when a disabled row's toggle is invoked", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      isRowSelectable: (item) => item.id !== "1",
    });

    // The first row is not selectable; clicking its (disabled) control must not commit.
    await wrapper.findAll("tbody .checkbox-stub")[0].trigger("click");

    expect(wrapper.emitted("update:selection")).toBeUndefined();
    expect(wrapper.emitted("selectionChange")).toBeUndefined();
  });

  it("keeps the control enabled for a selected non-selectable row while disabling an unselected one (multiple)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: ["2"],
      isRowSelectable: (item) => item.id === "1",
    });

    const rowCheckboxes = wrapper.findAll("tbody .checkbox-stub");
    expect(rowCheckboxes[1].attributes("data-disabled")).toBe("false");
    expect(rowCheckboxes[2].attributes("data-disabled")).toBe("true");
  });

  it("keeps the control enabled for a selected non-selectable row while disabling an unselected one (single)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "single",
      selection: ["2"],
      isRowSelectable: (item) => item.id === "1",
    });

    const radios = wrapper.findAll("tbody .radio-stub");
    expect(radios[1].attributes("data-disabled")).toBe("false");
    expect(radios[2].attributes("data-disabled")).toBe("true");
  });
});

describe("row selection — selectability gates addition only (contract)", () => {
  it("cannot ADD a non-selectable, unselected row via the slot toggle", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      isRowSelectable: (item) => item.id !== "2",
      desktopItemSlot: true,
    });

    const slotRows = wrapper.findAll(".desktop-item-slot");
    await slotRows[1].find(".desktop-item-slot__toggle").trigger("click");

    expect(wrapper.emitted("update:selection")).toBeUndefined();
    expect(wrapper.emitted("selectionChange")).toBeUndefined();
  });

  it("CAN deselect a non-selectable row that is already in the selection (multiple)", async () => {
    // trapped state: selected + non-selectable
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: ["2"],
      isRowSelectable: (item) => item.id !== "2",
      desktopItemSlot: true,
    });

    const slotRows = wrapper.findAll(".desktop-item-slot");
    expect(slotRows[1].classes()).toContain("is-selected");
    expect(slotRows[1].classes()).not.toContain("is-selectable");

    await slotRows[1].find(".desktop-item-slot__toggle").trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "deselect", row: items[1] });
  });

  it("CAN deselect a non-selectable row that is already selected (single)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "single",
      selection: ["2"],
      isRowSelectable: (item) => item.id !== "2",
      desktopItemSlot: true,
    });

    const slotRows = wrapper.findAll(".desktop-item-slot");
    expect(slotRows[1].classes()).toContain("is-selected");
    expect(slotRows[1].classes()).not.toContain("is-selectable");

    await slotRows[1].find(".desktop-item-slot__toggle").trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "deselect", row: items[1] });
  });

  it("deselect-all clears a stuck non-selectable page key, keeping off-page selections", async () => {
    // "2" = stuck non-selectable page key, "99" = off-page
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: ["1", "2", "3", "99"],
      isRowSelectable: (item) => item.id !== "2",
    });

    const headerCheckbox = wrapper.find("thead .checkbox-stub");
    expect(headerCheckbox.attributes("data-checked")).toBe("true");

    await headerCheckbox.trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["99"]]);

    const change = wrapper.emitted("selectionChange")?.[0] as [
      VcTableSelectionKeyType[],
      VcTableItemType[],
      VcTableSelectionMetaType<VcTableItemType>,
    ];
    expect(change[2]).toEqual({ action: "deselect-all" });
  });
});

describe("row selection — persistence", () => {
  it("does not reset selection when items change", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: ["1", "2"] });

    await wrapper.setProps({ items: [{ id: "1", name: "Alice" }] });
    await nextTick();

    // Selection is owned by the parent; the component must not emit a reset.
    expect(wrapper.emitted("update:selection")).toBeUndefined();

    // The still-visible selected row keeps its selected marker.
    const rows = wrapper.findAll(".vc-table__row");
    expect(rows).toHaveLength(1);
    expect(rows[0].classes()).toContain("vc-table__row--selected");
  });
});

describe("row selection — @rowClick interaction", () => {
  it("clicking the selection control does not trigger rowClick", async () => {
    const onRowClick = vi.fn();
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [], onRowClick });

    await wrapper.find("tbody .checkbox-stub").trigger("click");

    expect(onRowClick).not.toHaveBeenCalled();
    expect(wrapper.emitted("rowClick")).toBeUndefined();
    // The toggle itself still fired.
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["1"]]);
  });

  it("clicking elsewhere on the row still triggers rowClick", async () => {
    const onRowClick = vi.fn();
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [], onRowClick });

    await wrapper.findAll(".vc-table__row")[0].trigger("click");

    expect(wrapper.emitted("rowClick")?.[0]).toEqual([items[0], 0]);
  });
});

describe("row selection — #desktop-item slot scope", () => {
  it("exposes selected / toggle / selectable and toggle mutates selection", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: ["2"],
      isRowSelectable: (item) => item.id !== "3",
      desktopItemSlot: true,
    });

    const slotRows = wrapper.findAll(".desktop-item-slot");
    expect(slotRows).toHaveLength(3);

    // selected scope
    expect(slotRows[0].classes()).not.toContain("is-selected");
    expect(slotRows[1].classes()).toContain("is-selected");

    // selectable scope
    expect(slotRows[1].classes()).toContain("is-selectable");
    expect(slotRows[2].classes()).not.toContain("is-selectable");

    // toggle scope — invoking it commits a change for the first row (key "1")
    await slotRows[0].find(".desktop-item-slot__toggle").trigger("click");
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["2", "1"]]);
  });
});

describe("row selection — #mobile-item slot scope", () => {
  it("exposes selected / toggle / selectable and toggle mutates selection", async () => {
    breakpointState.isMobile = true;
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: ["1"],
      isRowSelectable: (item) => item.id !== "2",
      mobileItemSlot: true,
    });

    const slotItems = wrapper.findAll(".mobile-item-slot");
    expect(slotItems).toHaveLength(3);

    expect(slotItems[0].classes()).toContain("is-selected");
    expect(slotItems[1].classes()).not.toContain("is-selectable");

    // Toggle the third (selectable, unselected) item → adds key "3".
    await slotItems[2].find(".mobile-item-slot__toggle").trigger("click");
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["1", "3"]]);
  });
});

describe("row selection — disabled (selectionMode undefined)", () => {
  it("does not render a selection column and behaves as before (desktop)", async () => {
    const wrapper = await mountSelectable({ selection: [] });

    expect(wrapper.find(".vc-table__selection-cell").exists()).toBe(false);
    expect(wrapper.find("tbody .checkbox-stub").exists()).toBe(false);
    expect(wrapper.find("tbody .radio-stub").exists()).toBe(false);
    // Regular data rows still render.
    expect(wrapper.findAll(".vc-table__row")).toHaveLength(3);
  });

  it("scope defaults to selected=false / selectable=true in #desktop-item", async () => {
    const wrapper = await mountSelectable({ desktopItemSlot: true });

    const slotRows = wrapper.findAll(".desktop-item-slot");
    slotRows.forEach((row) => {
      expect(row.classes()).not.toContain("is-selected");
      expect(row.classes()).toContain("is-selectable");
    });
  });
});

// ─── 10. Roving-tabindex keyboard navigation ────────────────

// Dispatch a real (cancelable) keydown so `event.defaultPrevented` is observable;
// vue-test-utils' `trigger` doesn't hand back the event.
function pressKey(el: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
}

function rowTabindexes(wrapper: ReturnType<typeof mount>): (string | undefined)[] {
  return wrapper.findAll(".vc-table__row").map((row) => row.attributes("tabindex"));
}

function activeIndexFromDom(wrapper: ReturnType<typeof mount>): number {
  return rowTabindexes(wrapper).indexOf("0");
}

describe("keyboard nav — roving tabindex", () => {
  it("keeps exactly one row tabindex=0 (multiple)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    expect(rowTabindexes(wrapper)).toEqual(["0", "-1", "-1"]);
  });

  it("keeps exactly one row tabindex=0 (single)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "single", selection: [] });

    expect(rowTabindexes(wrapper)).toEqual(["0", "-1", "-1"]);
  });

  it("exposes a single tab entry on the first row by default (Tab enters once)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    const tabindexes = rowTabindexes(wrapper);
    expect(tabindexes.filter((value) => value === "0")).toHaveLength(1);
    expect(activeIndexFromDom(wrapper)).toBe(0);
  });

  it("returns focus to the active row, not the last (Shift+Tab)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    await wrapper.findAll(".vc-table__row")[1].trigger("focusin");

    expect(rowTabindexes(wrapper)).toEqual(["-1", "0", "-1"]);
  });
});

describe("keyboard nav — arrows move focus only", () => {
  it("ArrowDown/ArrowUp move focus without mutating selection or aria-selected (multiple)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });
    const rows = wrapper.findAll(".vc-table__row");

    const before = rows.map((row) => row.attributes("aria-selected"));

    pressKey(rows[0].element, "ArrowDown");
    await nextTick();

    expect(activeIndexFromDom(wrapper)).toBe(1);
    expect(wrapper.emitted("update:selection")).toBeUndefined();

    await wrapper.findAll(".vc-table__row")[1].trigger("focusin");
    pressKey(wrapper.findAll(".vc-table__row")[1].element, "ArrowUp");
    await nextTick();

    expect(activeIndexFromDom(wrapper)).toBe(0);
    expect(wrapper.emitted("update:selection")).toBeUndefined();
    expect(wrapper.findAll(".vc-table__row").map((row) => row.attributes("aria-selected"))).toEqual(before);
  });

  it("preventDefaults ArrowDown/ArrowUp (page scroll is suppressed)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "single", selection: [] });
    const rows = wrapper.findAll(".vc-table__row");

    expect(pressKey(rows[0].element, "ArrowDown").defaultPrevented).toBe(true);
    expect(pressKey(rows[0].element, "ArrowUp").defaultPrevented).toBe(true);
  });

  it("ArrowDown on the last row is a no-op (no wrap)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    const last = wrapper.findAll(".vc-table__row")[2];
    await last.trigger("focusin");
    pressKey(last.element, "ArrowDown");
    await nextTick();

    expect(activeIndexFromDom(wrapper)).toBe(2);
  });

  it("ArrowUp on the first row is a no-op (no wrap)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    const first = wrapper.findAll(".vc-table__row")[0];
    pressKey(first.element, "ArrowUp");
    await nextTick();

    expect(activeIndexFromDom(wrapper)).toBe(0);
  });

  it("Home focuses the first row, End the last", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    const middle = wrapper.findAll(".vc-table__row")[1];
    await middle.trigger("focusin");

    pressKey(wrapper.findAll(".vc-table__row")[1].element, "End");
    await nextTick();
    expect(activeIndexFromDom(wrapper)).toBe(2);

    pressKey(wrapper.findAll(".vc-table__row")[2].element, "Home");
    await nextTick();
    expect(activeIndexFromDom(wrapper)).toBe(0);
  });
});

describe("keyboard nav — Space commits selection", () => {
  it("toggles the selectable row and preventDefaults (multiple)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    const event = pressKey(wrapper.findAll(".vc-table__row")[0].element, " ");
    await nextTick();

    expect(event.defaultPrevented).toBe(true);
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["1"]]);
  });

  it("is a no-op on a non-selectable, unselected row", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      isRowSelectable: (item) => item.id !== "2",
    });

    pressKey(wrapper.findAll(".vc-table__row")[1].element, " ");
    await nextTick();

    expect(wrapper.emitted("update:selection")).toBeUndefined();
  });

  it("still deselects a non-selectable row that is already selected", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: ["2"],
      isRowSelectable: (item) => item.id !== "2",
    });

    pressKey(wrapper.findAll(".vc-table__row")[1].element, " ");
    await nextTick();

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[]]);
  });

  it("replaces the previous single selection (array stays length 1)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "single", selection: ["1"] });

    pressKey(wrapper.findAll(".vc-table__row")[2].element, " ");
    await nextTick();

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["3"]]);
  });
});

describe("keyboard nav — Enter", () => {
  it("emits rowClick and does NOT select when a @row-click listener is bound", async () => {
    const onRowClick = vi.fn();
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [], onRowClick });

    const event = pressKey(wrapper.findAll(".vc-table__row")[0].element, "Enter");
    await nextTick();

    expect(event.defaultPrevented).toBe(true);
    expect(wrapper.emitted("rowClick")?.[0]).toEqual([items[0], 0]);
    expect(wrapper.emitted("update:selection")).toBeUndefined();
  });

  it("selects when no @row-click listener is bound and selection is on", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    pressKey(wrapper.findAll(".vc-table__row")[1].element, "Enter");
    await nextTick();

    expect(wrapper.emitted("rowClick")).toBeUndefined();
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["2"]]);
  });
});

describe("keyboard nav — controls stay out of the tab order", () => {
  it("gives radios unique names and does not select a neighbor on ArrowDown (single)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "single", selection: [] });

    const names = wrapper.findAll("tbody .radio-stub").map((radio) => radio.attributes("name"));
    expect(names.every(Boolean)).toBe(true);
    expect(new Set(names).size).toBe(names.length);

    pressKey(wrapper.findAll(".vc-table__row")[0].element, "ArrowDown");
    await nextTick();

    expect(wrapper.emitted("update:selection")).toBeUndefined();
  });

  it("marks row controls tabindex=-1 so a control click adds no extra tab stop (multiple)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    const control = wrapper.find("tbody .checkbox-stub");
    expect(control.attributes("tabindex")).toBe("-1");

    await control.trigger("click");

    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["1"]]);
  });

  it("radio controls are tabindex=-1 (single)", async () => {
    const wrapper = await mountSelectable({ selectionMode: "single", selection: [] });

    wrapper.findAll("tbody .radio-stub").forEach((radio) => {
      expect(radio.attributes("tabindex")).toBe("-1");
    });
  });

  it("keeps the select-all checkbox as its own tab stop, outside the roving group", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    // Header checkbox has no tabindex → default (natural) tab stop, not roving (-1).
    expect(wrapper.find("thead .checkbox-stub").attributes("tabindex")).toBeUndefined();
    wrapper.findAll("tbody .checkbox-stub").forEach((control) => {
      expect(control.attributes("tabindex")).toBe("-1");
    });
  });
});

describe("keyboard nav — accessible control label", () => {
  it("uses the per-row resolver when rowSelectionLabel is provided", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });
    await wrapper.setProps({ rowSelectionLabel: (_item: VcTableItemType, index: number) => `custom-${index}` });
    await nextTick();

    expect(wrapper.findAll("tbody .checkbox-stub").map((control) => control.attributes("aria-label"))).toEqual([
      "custom-0",
      "custom-1",
      "custom-2",
    ]);
  });

  it("falls back to the numbered i18n key, not a constant label", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    // Resolves the numbered key (`select_row_number`), never a fixed "Select row".
    wrapper.findAll("tbody .checkbox-stub").forEach((control) => {
      expect(control.attributes("aria-label")).toBe("ui_kit.table.select_row_number");
      expect(control.attributes("aria-label")).not.toBe("Select row");
    });
  });
});

describe("keyboard nav — rowClick + selection coexist", () => {
  it("drops role=button, keeps one tab stop and aria-selected", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: ["2"], onRowClick: () => {} });

    const rows = wrapper.findAll(".vc-table__row");
    rows.forEach((row) => {
      expect(row.attributes("role")).toBeUndefined();
    });

    expect(rowTabindexes(wrapper).filter((value) => value === "0")).toHaveLength(1);
    expect(rows.map((row) => row.attributes("aria-selected"))).toEqual(["false", "true", "false"]);
  });
});

describe("keyboard nav — aria-selected gating", () => {
  it("omits aria-selected when selectionMode is undefined", async () => {
    const wrapper = await mountSelectable({});

    wrapper.findAll(".vc-table__row").forEach((row) => {
      expect(row.attributes("aria-selected")).toBeUndefined();
    });
  });
});

describe("keyboard nav — page change resets the active row", () => {
  it("resets activeRowIndex to a valid row and preserves off-page selection", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: ["99"] });

    await wrapper.findAll(".vc-table__row")[2].trigger("focusin");
    expect(activeIndexFromDom(wrapper)).toBe(2);

    await wrapper.setProps({
      items: [
        { id: "10", name: "Dan" },
        { id: "11", name: "Eve" },
      ],
    });
    await nextTick();

    // A single, valid active row after the page swap.
    expect(rowTabindexes(wrapper)).toEqual(["0", "-1"]);
    expect(activeIndexFromDom(wrapper)).toBe(0);

    // Parent-owned selection is untouched by the page change.
    expect(wrapper.emitted("update:selection")).toBeUndefined();
  });
});

describe("keyboard nav — disabled without selection or rowClick", () => {
  it("has no roving tabindex and no aria-selected (prior behavior)", async () => {
    const wrapper = await mountSelectable({});

    wrapper.findAll(".vc-table__row").forEach((row) => {
      expect(row.attributes("tabindex")).toBeUndefined();
      expect(row.attributes("aria-selected")).toBeUndefined();
      expect(row.attributes("role")).toBeUndefined();
    });

    pressKey(wrapper.findAll(".vc-table__row")[0].element, "ArrowDown");
    await nextTick();

    expect(wrapper.emitted("update:selection")).toBeUndefined();
  });
});

// ─── 11. Selection column gating (showSelectionColumn) ──────

describe("selection column gating — present with inline column slots", () => {
  it("renders the leading selection cell in the header and every data row", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [] });

    expect(wrapper.find("thead .vc-table__selection-cell").exists()).toBe(true);
    // header = selection cell + 1 data column
    expect(wrapper.findAll("thead th")).toHaveLength(2);

    // Every row carries a leading selection cell aligned with the header.
    expect(wrapper.findAll("tbody .vc-table__cell.vc-table__selection-cell")).toHaveLength(3);
  });

  it("keeps the multiple select-all header checkbox and indeterminate state working", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: ["1"] });

    const headerCheckbox = wrapper.find("thead .checkbox-stub");
    expect(headerCheckbox.exists()).toBe(true);
    expect(headerCheckbox.attributes("data-indeterminate")).toBe("true");
  });
});

describe("selection column gating — suppressed under #desktop-body", () => {
  // Selection + #desktop-body logs a one-shot DEV warning on mount; silence it here.
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("renders no selection cell in the header and header/body columns stay aligned", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [], desktopBodySlot: true });

    expect(wrapper.find("thead .vc-table__selection-cell").exists()).toBe(false);
    expect(wrapper.find(".vc-table__selection-cell").exists()).toBe(false);

    // Header exposes only the real column; body rows carry a single matching cell.
    expect(wrapper.findAll("thead th")).toHaveLength(1);
    const bodyRows = wrapper.findAll("tbody .desktop-body-row");
    expect(bodyRows).toHaveLength(3);
    bodyRows.forEach((row) => {
      expect(row.findAll("td")).toHaveLength(1);
    });
  });

  it("omits the multiple select-all header checkbox", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [], desktopBodySlot: true });

    expect(wrapper.find("thead .checkbox-stub").exists()).toBe(false);
  });

  it("renders a skeleton without a leading selection cell while loading", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      desktopBodySlot: true,
      loading: true,
    });

    expect(wrapper.find(".vc-table__skeleton").exists()).toBe(true);
    expect(wrapper.find(".vc-table__skeleton-cell.vc-table__selection-cell").exists()).toBe(false);
    expect(wrapper.find("thead .vc-table__selection-cell").exists()).toBe(false);
  });

  it("spans the error state cell over the real columns only (no +1 for selection)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      items: [],
      error: true,
      desktopBodySlot: true,
    });

    expect(wrapper.find("td.vc-table__state-cell").attributes("colspan")).toBe("1");
  });

  it("spans the empty state cell over the real columns only (no +1 for selection)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      items: [],
      desktopBodySlot: true,
    });

    expect(wrapper.find("td.vc-table__state-cell").attributes("colspan")).toBe("1");
  });
});

describe("selection column gating — state colspan includes selection with column slots", () => {
  it("spans the empty state cell over columns + the selection cell", async () => {
    const wrapper = await mountSelectable({ selectionMode: "multiple", selection: [], items: [] });

    // 1 data column + leading selection column.
    expect(wrapper.find("td.vc-table__state-cell").attributes("colspan")).toBe("2");
  });
});

describe("selection column gating — header cell present under #desktop-item", () => {
  it("keeps the leading selection header cell (the consumer supplies the row cell via slot scope)", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: ["2"],
      isRowSelectable: (item) => item.id !== "3",
      desktopItemSlot: true,
    });

    expect(wrapper.find("thead .vc-table__selection-cell").exists()).toBe(true);

    // The slot scope stays functional: selected / selectable reflect state and toggle commits.
    const slotRows = wrapper.findAll(".desktop-item-slot");
    expect(slotRows[1].classes()).toContain("is-selected");
    expect(slotRows[2].classes()).not.toContain("is-selectable");

    await slotRows[0].find(".desktop-item-slot__toggle").trigger("click");
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([["2", "1"]]);
  });
});

describe("selection column gating — no phantom offset for fixed columns under #desktop-body", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("does not seed the selection column width into fixed-start offsets", async () => {
    const wrapper = mount(VcTable, {
      props: {
        selectionMode: "multiple",
        selection: [],
        items,
        columns: [
          { id: "a", title: "A", fixed: "start", width: "150px" },
          { id: "b", title: "B" },
        ],
      },
      slots: {
        "desktop-body": () =>
          items.map((item) => h("tr", { class: "desktop-body-row" }, [h("td", String(item.name ?? ""))])),
      },
      global: { stubs: selectionStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
    });

    await nextTick();

    const firstTh = wrapper.findAll("th")[0];
    // Leading fixed-start column sits flush at 0px — not shifted by SELECTION_COLUMN_WIDTH (3rem).
    expect(firstTh.attributes("style")).toContain("inset-inline-start: 0px");
    expect(firstTh.attributes("style")).not.toContain("3rem");
    expect(wrapper.find("thead .vc-table__selection-cell").exists()).toBe(false);
  });
});

describe("selection column gating — DEV warning", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("DEV", true);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("warns exactly once for selection + #desktop-body", async () => {
    await mountSelectable({ selectionMode: "multiple", selection: [], desktopBodySlot: true });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/desktop-body/);
  });

  it("does not warn for selection + #desktop-item", async () => {
    await mountSelectable({ selectionMode: "multiple", selection: [], desktopItemSlot: true });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn for selection + VcTableColumn slots", async () => {
    await mountSelectable({ selectionMode: "multiple", selection: [] });

    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe("#header slot — selection scope", () => {
  it("keeps header and body aligned when the custom header renders the selection cell", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      headerSlot: "with-selection",
    });

    expect(wrapper.findAll("thead th")).toHaveLength(2);
    wrapper.findAll("tbody .vc-table__row").forEach((row) => {
      expect(row.findAll("td")).toHaveLength(2);
    });
  });

  it("gives the custom selection cell the same class and width as the built-in one", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      headerSlot: "with-selection",
    });

    const headerCell = wrapper.find("thead th.vc-table__selection-cell");

    expect(headerCell.exists()).toBe(true);
    expect(headerCell.classes()).toContain("vc-table__title");
    expect(headerCell.attributes("style")).toContain("width: var(--vc-table-selection-cell-width, 3rem)");
  });

  it("reports select-all state through the scope", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: ["1"],
      headerSlot: "with-selection",
    });

    const selectAll = wrapper.find(".custom-select-all");
    expect(selectAll.attributes("data-checked")).toBe("false");
    expect(selectAll.attributes("data-indeterminate")).toBe("true");

    await wrapper.setProps({ selection: ["1", "2", "3"] });

    expect(wrapper.find(".custom-select-all").attributes("data-checked")).toBe("true");
    expect(wrapper.find(".custom-select-all").attributes("data-indeterminate")).toBe("false");
  });

  it("selects every selectable row through the scope's toggleSelectAll", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      headerSlot: "with-selection",
    });

    await wrapper.find(".custom-select-all").trigger("click");

    expect(wrapper.emitted("update:selection")?.[0][0]).toEqual(["1", "2", "3"]);
    expect(wrapper.emitted("selectionChange")?.[0][2]).toEqual({ action: "select-all" });
  });

  it("reports canSelectAll as false when no row is selectable", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      isRowSelectable: () => false,
      headerSlot: "with-selection",
    });

    expect(wrapper.find(".custom-select-all").attributes("data-disabled")).toBe("true");
  });

  it("passes the sticky selection-cell attributes through the scope, like the default header", async () => {
    const custom = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      headerSlot: "with-selection",
      fixedStartColumn: true,
    });
    const builtIn = await mountSelectable({ selectionMode: "multiple", selection: [], fixedStartColumn: true });

    const customCell = custom.find("thead th.vc-table__selection-cell");
    const builtInCell = builtIn.find("thead th.vc-table__selection-cell");

    expect(customCell.classes()).toContain("vc-table__title--fixed");
    expect(customCell.attributes("style")).toContain("position: sticky");
    expect(new Set(customCell.classes())).toEqual(new Set(builtInCell.classes()));
    expect(customCell.attributes("style")).toBe(builtInCell.attributes("style"));
  });

  it("reports showSelectionColumn as false when selection is off", async () => {
    const wrapper = await mountSelectable({ headerSlot: "with-selection" });

    expect(wrapper.find(".custom-select-all").exists()).toBe(false);
    expect(wrapper.findAll("thead th")).toHaveLength(1);
    wrapper.findAll("tbody .vc-table__row").forEach((row) => {
      expect(row.findAll("td")).toHaveLength(1);
    });
  });

  it("keeps the selection cell in single mode, where there is no select-all", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "single",
      selection: [],
      headerSlot: "with-selection",
    });

    expect(wrapper.find("thead th.vc-table__selection-cell").exists()).toBe(true);
    expect(wrapper.findAll("thead th")).toHaveLength(2);
    wrapper.findAll("tbody .vc-table__row").forEach((row) => {
      expect(row.findAll("td")).toHaveLength(2);
    });
  });
});

describe("toggleSelectAll — mode guard", () => {
  // Mount with a header slot that just captures the scope, so the exposed
  // `toggleSelectAll` can be called directly in modes that render no control.
  async function mountCapturingHeaderScope(selectionMode?: VcTableSelectionModeType) {
    let scope: VcTableHeaderSlotScopeType | undefined;
    const props: Record<string, unknown> = { items, selection: [] };

    if (selectionMode !== undefined) {
      props.selectionMode = selectionMode;
    }

    const wrapper = mount(VcTable, {
      props,
      slots: {
        default: () =>
          h(
            VcTableColumn,
            { id: "name", title: "Name" },
            { default: ({ item }: { item: VcTableItemType }) => h("span", String(item.name ?? "")) },
          ),
        header: (headerScope: VcTableHeaderSlotScopeType) => {
          scope = headerScope;
          return h("thead", [h("tr", [h("th"), h("th")])]);
        },
      },
      global: { stubs: selectionStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
    });

    await nextTick();
    await nextTick();

    return { wrapper, getScope: () => scope };
  }

  it("is a no-op in single mode, so a custom header cannot bulk-select", async () => {
    const { wrapper, getScope } = await mountCapturingHeaderScope("single");

    getScope()?.toggleSelectAll();
    await nextTick();

    expect(wrapper.emitted("update:selection")).toBeUndefined();
    expect(wrapper.emitted("selectionChange")).toBeUndefined();
  });

  it("is a no-op when selection is disabled", async () => {
    const { wrapper, getScope } = await mountCapturingHeaderScope();

    getScope()?.toggleSelectAll();
    await nextTick();

    expect(wrapper.emitted("update:selection")).toBeUndefined();
  });

  it("still selects every selectable row in multiple mode", async () => {
    const { wrapper, getScope } = await mountCapturingHeaderScope("multiple");

    getScope()?.toggleSelectAll();
    await nextTick();

    expect(wrapper.emitted("update:selection")?.[0][0]).toEqual(["1", "2", "3"]);
  });
});

describe("#header slot — DEV warning", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("DEV", true);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("warns when the custom header drops the selection cell the body keeps", async () => {
    await mountSelectable({ selectionMode: "multiple", selection: [], headerSlot: "without-selection" });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/#header/);
  });

  it("does not warn when the custom header renders the selection cell", async () => {
    await mountSelectable({ selectionMode: "multiple", selection: [], headerSlot: "with-selection" });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn for a custom header without selection", async () => {
    await mountSelectable({ headerSlot: "without-selection" });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn for a header that renders no cells at all", async () => {
    await mountSelectable({ selectionMode: "multiple", selection: [], headerSlot: "no-cells" });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn for a hand-written selection cell that keeps the counts aligned", async () => {
    mount(VcTable, {
      props: { items, selectionMode: "multiple", selection: [] },
      slots: {
        default: () =>
          h(
            VcTableColumn,
            { id: "name", title: "Name" },
            { default: ({ item }: { item: VcTableItemType }) => h("span", String(item.name ?? "")) },
          ),
        // No `selectionColumnAttrs` spread — alignment is judged by cell count, not by a marker.
        header: () => h("thead", [h("tr", [h("th", { class: "hand-written-selection" }), h("th", "Name")])]),
      },
      global: { stubs: selectionStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
    });

    await nextTick();
    await nextTick();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn for a grouped header whose selection cell spans both rows", async () => {
    mount(VcTable, {
      props: { items, selectionMode: "multiple", selection: [] },
      slots: {
        default: () =>
          h(
            VcTableColumn,
            { id: "name", title: "Name" },
            { default: ({ item }: { item: VcTableItemType }) => h("span", String(item.name ?? "")) },
          ),
        header: () =>
          h("thead", [
            h("tr", [h("th", { rowspan: 2, class: "grouped-selection" }), h("th", "Group")]),
            h("tr", [h("th", "Name")]),
          ]),
      },
      global: { stubs: selectionStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
    });

    await nextTick();
    await nextTick();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("warns for a grouped header that drops the selection cell", async () => {
    mount(VcTable, {
      props: { items, selectionMode: "multiple", selection: [] },
      slots: {
        default: () =>
          h(
            VcTableColumn,
            { id: "name", title: "Name" },
            { default: ({ item }: { item: VcTableItemType }) => h("span", String(item.name ?? "")) },
          ),
        header: () => h("thead", [h("tr", [h("th", "Group")]), h("tr", [h("th", "Name")])]),
      },
      global: { stubs: selectionStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
    });

    await nextTick();
    await nextTick();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/#header/);
  });

  it("does not warn for #desktop-item rows, which carry no injected selection cell", async () => {
    await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      desktopItemSlot: true,
      headerSlot: "without-selection",
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("warns when selection is enabled after mount", async () => {
    const wrapper = await mountSelectable({ selection: [], headerSlot: "without-selection" });

    expect(warnSpy).not.toHaveBeenCalled();

    await wrapper.setProps({ selectionMode: "multiple" });
    await nextTick();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/#header/);
  });

  it("warns only once across re-renders", async () => {
    const wrapper = await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      headerSlot: "without-selection",
    });

    await wrapper.setProps({ selection: ["1"] });
    await wrapper.setProps({ selection: ["1", "2"] });
    await nextTick();

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("stays silent in production builds", async () => {
    vi.stubEnv("DEV", false);

    await mountSelectable({ selectionMode: "multiple", selection: [], headerSlot: "without-selection" });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("warns while the default skeleton renders selection cells the header lacks", async () => {
    mount(VcTable, {
      props: {
        items,
        columns: [{ id: "name", title: "Name" }],
        selectionMode: "multiple",
        selection: [],
        loading: true,
      },
      slots: { header: () => h("thead", [h("tr", [h("th", "Name")])]) },
      global: { stubs: selectionStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
    });

    await nextTick();
    await nextTick();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/#header/);
  });

  it("does not warn while a custom #desktop-skeleton owns the loading rows", async () => {
    mount(VcTable, {
      props: {
        items,
        columns: [{ id: "name", title: "Name" }],
        selectionMode: "multiple",
        selection: [],
        loading: true,
      },
      slots: {
        header: () => h("thead", [h("tr", [h("th", "Name")])]),
        "desktop-skeleton": () => h("tr", [h("td", "…")]),
      },
      global: { stubs: selectionStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
    });

    await nextTick();
    await nextTick();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("warns only about #desktop-body, not header misalignment, when both apply", async () => {
    await mountSelectable({
      selectionMode: "multiple",
      selection: [],
      desktopBodySlot: true,
      headerSlot: "without-selection",
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/desktop-body/);
  });
});

describe("hideDefaultHeader with selection", () => {
  it("drops the header and its select-all, keeping the selection cell on every row", async () => {
    const wrapper = mount(VcTable, {
      props: { items, selectionMode: "multiple", selection: [], hideDefaultHeader: true },
      slots: {
        default: () =>
          h(
            VcTableColumn,
            { id: "name", title: "Name" },
            { default: ({ item }: { item: VcTableItemType }) => h("span", String(item.name ?? "")) },
          ),
      },
      global: { stubs: selectionStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.find("thead").exists()).toBe(false);
    wrapper.findAll("tbody .vc-table__row").forEach((row) => {
      expect(row.findAll("td")).toHaveLength(2);
      expect(row.find("td.vc-table__selection-cell").exists()).toBe(true);
    });
  });
});

// ─── Footer (pagination / page-limit) ───────────────────────

async function mountFooter(options: {
  items?: VcTableItemType[];
  error?: boolean;
  pages?: number;
  page?: number;
  pageLimit?: number | null;
}) {
  const props: Record<string, unknown> = { items: options.items ?? items };
  if (options.error !== undefined) {
    props.error = options.error;
  }
  if (options.pages !== undefined) {
    props.pages = options.pages;
  }
  if (options.page !== undefined) {
    props.page = options.page;
  }
  if (options.pageLimit !== undefined) {
    props.pageLimit = options.pageLimit;
  }

  const wrapper = mount(VcTable, {
    props,
    slots: {
      "desktop-item": (scope: { item: VcTableItemType } | undefined) =>
        h("div", { class: "desktop-item" }, String(scope?.item.name ?? "")),
    },
    global: { stubs: sharedStubs, plugins: [i18n], mocks: { $t: (key: string) => key } },
  });

  await nextTick();
  await nextTick();

  return wrapper;
}

describe("footer pagination", () => {
  it("hides pagination when error=true even with items and multiple pages", async () => {
    const wrapper = await mountFooter({ items, error: true, pages: 3 });

    expect(wrapper.find("vc-pagination-stub").exists()).toBe(false);
  });

  it("renders pagination when error=false with items and multiple pages", async () => {
    const wrapper = await mountFooter({ items, error: false, pages: 3 });

    expect(wrapper.find("vc-pagination-stub").exists()).toBe(true);
  });

  it("hides page-limit message when error=true even at the page limit", async () => {
    const wrapper = await mountFooter({ items, error: true, pages: 3, page: 2, pageLimit: 2 });

    expect(wrapper.find(".vc-table__page-limit-message").exists()).toBe(false);
  });

  it("renders page-limit message when error=false at the page limit", async () => {
    const wrapper = await mountFooter({ items, error: false, pages: 3, page: 2, pageLimit: 2 });

    expect(wrapper.find(".vc-table__page-limit-message").exists()).toBe(true);
  });
});
