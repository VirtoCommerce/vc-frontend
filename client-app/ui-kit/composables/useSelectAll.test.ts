import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useSelectAll } from "./useSelectAll";
import type { IUseSelectAllOptions } from "./useSelectAll";

function setup({
  items = ["a", "b", "c"],
  activeRows = [false, false, false],
  ...overrides
}: Partial<Omit<IUseSelectAllOptions<string>, "rows">> & { items?: string[]; activeRows?: boolean[] } = {}) {
  return useSelectAll<string>({
    rows: items.map((item, index) => ({ item, active: activeRows[index] ?? false })),
    selectedItems: [],
    isSameItem: (left, right) => left === right,
    filterValue: "",
    answeredQuery: "",
    serverFilter: false,
    answerPending: false,
    total: undefined,
    selectedCount: undefined,
    ...overrides,
  });
}

describe("useSelectAll counter", () => {
  it("counts the options on screen without a total", () => {
    const { totalCount, selectedCount } = setup({ activeRows: [true, false, false], selectedItems: ["a"] });

    expect(totalCount.value).toBe(3);
    expect(selectedCount.value).toBe(1);
  });

  it("counts selected items that are not loaded against the total", () => {
    const { totalCount, selectedCount } = setup({
      total: 10,
      activeRows: [true, false, false],
      selectedItems: ["a", "x", "y"],
    });

    expect(totalCount.value).toBe(10);
    expect(selectedCount.value).toBe(3);
  });

  it("caps the selection at the total, but never below what is visibly selected", () => {
    expect(
      setup({ total: 2, activeRows: [true, false, false], selectedItems: ["a", "x", "y"] }).selectedCount.value,
    ).toBe(2);
    expect(setup({ total: 1, activeRows: [true, true, false], selectedItems: ["a", "b"] }).selectedCount.value).toBe(2);
  });

  it("counts only the matches while a local query narrows the list", () => {
    const { totalCount, selectedCount } = setup({
      filterValue: "a",
      items: ["a"],
      activeRows: [true],
      selectedItems: ["a", "b"],
      total: 10,
    });

    expect(totalCount.value).toBe(1);
    expect(selectedCount.value).toBe(1);
  });

  it("takes the consumer's selected count under an answered server-side query", () => {
    const { totalCount, selectedCount } = setup({
      serverFilter: true,
      filterValue: "a",
      answeredQuery: "a",
      total: 20,
      selectedCount: 7,
      activeRows: [true, false, false],
    });

    expect(totalCount.value).toBe(20);
    expect(selectedCount.value).toBe(7);
  });

  it("counts the answered server-side query, not the typed one", () => {
    const answeredQuery = ref("");
    const { selectedCount } = setup({
      serverFilter: true,
      filterValue: "a",
      answeredQuery,
      total: 20,
      selectedCount: 7,
      activeRows: [true, false, false],
      selectedItems: ["a", "x"],
    });

    expect(selectedCount.value).toBe(2);

    answeredQuery.value = "a";

    expect(selectedCount.value).toBe(7);
  });
});

describe("useSelectAll states", () => {
  it("is checked only when the whole set is selected, once the consumer counts it", () => {
    const fullPage = { activeRows: [true, true, true], selectedItems: ["a", "b", "c"], total: 5 };

    expect(setup({ activeRows: [true, true, true], selectedItems: ["a", "b", "c"] }).isAllSelected.value).toBe(true);
    expect(setup({ ...fullPage, selectedCount: 3 }).isAllSelected.value).toBe(false);
  });

  it("shows a fully selected page of an uncounted set as checked", () => {
    const { isAllSelected, isSomeSelected } = setup({
      activeRows: [true, true, true],
      selectedItems: ["a", "b", "c"],
      total: 5,
    });

    expect(isAllSelected.value).toBe(true);
    expect(isSomeSelected.value).toBe(false);
  });

  it("is indeterminate while part of the set is selected", () => {
    const { isAllSelected, isSomeSelected } = setup({ activeRows: [true, false, false], selectedItems: ["a"] });

    expect(isAllSelected.value).toBe(false);
    expect(isSomeSelected.value).toBe(true);
  });

  it("is disabled with no option on screen or while an answer is pending", () => {
    expect(setup({ items: [], activeRows: [] }).isDisabled.value).toBe(true);
    expect(setup({ answerPending: true }).isDisabled.value).toBe(true);
    expect(setup().isDisabled.value).toBe(false);
  });
});

describe("useSelectAll toggle", () => {
  it("adds the options on screen to the selection", () => {
    expect(setup({ activeRows: [false, true, false], selectedItems: ["x", "b"] }).toggle()).toEqual({
      items: ["x", "b", "a", "c"],
      action: "select-all",
    });
  });

  it("selects on a counted partial set even when every option on screen is selected", () => {
    expect(
      setup({ total: 100, selectedCount: 3, activeRows: [true, true, true], selectedItems: ["a", "b", "c"] }).toggle(),
    ).toEqual({ items: ["a", "b", "c"], action: "select-all" });
  });

  it("clears a fully selected page of an uncounted set", () => {
    expect(setup({ total: 100, activeRows: [true, true, true], selectedItems: ["a", "b", "c"] }).toggle()).toEqual({
      items: [],
      action: "deselect-all",
    });
  });

  it("clears the whole selection once every option on screen is selected", () => {
    expect(setup({ activeRows: [true, true, true], selectedItems: ["a", "b", "c", "x"] }).toggle()).toEqual({
      items: [],
      action: "deselect-all",
    });
  });

  it("keeps what a query hides when clearing the matches", () => {
    expect(setup({ filterValue: "a", items: ["a"], activeRows: [true], selectedItems: ["a", "b"] }).toggle()).toEqual({
      items: ["b"],
      action: "deselect-all",
    });
  });
});

describe("useSelectAll over items refetched as new objects", () => {
  type CountryType = { id: string; name: string };

  const sameId = (left: CountryType, right: CountryType) => left.id === right.id;
  const albania = { id: "1", name: "Albania" };
  const belgium = { id: "2", name: "Belgium" };
  const albaniaBefore = { id: "1", name: "Albania, loaded before" };

  function setupCountries(overrides: Partial<IUseSelectAllOptions<CountryType>>) {
    return useSelectAll<CountryType>({
      rows: [
        { item: albania, active: true },
        { item: belgium, active: false },
      ],
      selectedItems: [albaniaBefore],
      isSameItem: sameId,
      filterValue: "",
      answeredQuery: "",
      serverFilter: false,
      answerPending: false,
      total: undefined,
      selectedCount: undefined,
      ...overrides,
    });
  }

  it("adds only the items the selection does not hold yet, keeping its own objects", () => {
    expect(setupCountries({}).toggle()).toEqual({ items: [albaniaBefore, belgium], action: "select-all" });
  });

  it("adds an item two rows hold once, comparing the unselected rows only with each other", () => {
    const isSameItem = vi.fn(sameId);
    const { toggle } = setupCountries({
      isSameItem,
      rows: [
        { item: albania, active: true },
        { item: belgium, active: false },
        { item: { id: "2", name: "Belgium, on another row" }, active: false },
      ],
    });

    expect(toggle()).toEqual({ items: [albaniaBefore, belgium], action: "select-all" });
    expect(isSameItem).toHaveBeenCalled();
    expect(isSameItem.mock.calls.flat()).not.toContain(albaniaBefore);
    expect(isSameItem.mock.calls.flat()).not.toContain(albania);
  });

  it("clears the matches of a query by identity, keeping the items it hides", () => {
    const { toggle } = setupCountries({
      filterValue: "alb",
      rows: [{ item: albania, active: true }],
      selectedItems: [albaniaBefore, belgium],
    });

    expect(toggle()).toEqual({ items: [belgium], action: "deselect-all" });
  });
});
