import { mount, shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import VcTableColumn from "./vc-table-column.vue";
import VcTable from "./vc-table.vue";

vi.mock("@vueuse/core", () => ({
  useBreakpoints: () => ({
    smaller: () => ({ value: false }),
  }),
}));

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
    | string
    | Record<string, boolean>
    | ((item: VcTableItemType, index: number) => string | Record<string, boolean>);
  rowStyle?:
    | string
    | Record<string, string>
    | ((item: VcTableItemType, index: number) => string | Record<string, string>);
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
    global: { stubs: sharedStubs, mocks: { $t: (key: string) => key } },
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
        sort: { column: "name", direction: "asc" } as VcTableSortInfoType,
      },
    });

    expect(wrapper.findAll("th")[0].attributes("aria-sort")).toBe("ascending");
  });

  it('returns "descending" for desc-sorted column', () => {
    const wrapper = createWrapper({
      props: {
        columns: sortableColumns,
        items,
        sort: { column: "name", direction: "desc" } as VcTableSortInfoType,
      },
    });

    expect(wrapper.findAll("th")[0].attributes("aria-sort")).toBe("descending");
  });

  it('returns "none" for non-sorted column', () => {
    const wrapper = createWrapper({
      props: {
        columns: sortableColumns,
        items,
        sort: { column: "name", direction: "asc" } as VcTableSortInfoType,
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
