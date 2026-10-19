import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useSelectAll } from "./useSelectAll";
import type { IUseSelectAllOptions } from "./useSelectAll";

function setup(overrides: Partial<IUseSelectAllOptions<string>> = {}) {
  return useSelectAll<string>({
    values: ["a", "b", "c"],
    activeRows: [false, false, false],
    selectedValues: [],
    filterValue: "",
    serverFilter: false,
    answerPending: false,
    total: undefined,
    selectedCount: undefined,
    ...overrides,
  });
}

describe("useSelectAll counter", () => {
  it("counts the options on screen without a total", () => {
    const { totalCount, selectedCount } = setup({ activeRows: [true, false, false], selectedValues: ["a"] });

    expect(totalCount.value).toBe(3);
    expect(selectedCount.value).toBe(1);
  });

  it("counts selected values that are not loaded against the total", () => {
    const { totalCount, selectedCount } = setup({
      total: 10,
      activeRows: [true, false, false],
      selectedValues: ["a", "x", "y"],
    });

    expect(totalCount.value).toBe(10);
    expect(selectedCount.value).toBe(3);
  });

  it("caps the selection at the total, but never below what is visibly selected", () => {
    expect(
      setup({ total: 2, activeRows: [true, false, false], selectedValues: ["a", "x", "y"] }).selectedCount.value,
    ).toBe(2);
    expect(setup({ total: 1, activeRows: [true, true, false], selectedValues: ["a", "b"] }).selectedCount.value).toBe(
      2,
    );
  });

  it("counts only the matches while a local query narrows the list", () => {
    const { totalCount, selectedCount } = setup({
      filterValue: "a",
      values: ["a"],
      activeRows: [true],
      selectedValues: ["a", "b"],
      total: 10,
    });

    expect(totalCount.value).toBe(1);
    expect(selectedCount.value).toBe(1);
  });

  it("takes the consumer's selected count under an answered server-side query", () => {
    const { totalCount, selectedCount } = setup({
      serverFilter: true,
      filterValue: "a",
      total: 20,
      selectedCount: 7,
      activeRows: [true, false, false],
    });

    expect(totalCount.value).toBe(20);
    expect(selectedCount.value).toBe(7);
  });

  it("keeps describing the previous query until the server answers", () => {
    const filterValue = ref("");
    const answerPending = ref(false);
    const { selectedCount } = setup({
      serverFilter: true,
      filterValue,
      answerPending,
      total: 20,
      selectedCount: 7,
      activeRows: [true, false, false],
      selectedValues: ["a", "x"],
    });

    answerPending.value = true;
    filterValue.value = "a";

    expect(selectedCount.value).toBe(2);

    answerPending.value = false;

    expect(selectedCount.value).toBe(7);
  });
});

describe("useSelectAll states", () => {
  it("is checked only when the whole set is selected, once the consumer counts it", () => {
    const fullPage = { activeRows: [true, true, true], selectedValues: ["a", "b", "c"], total: 5 };

    expect(setup({ activeRows: [true, true, true], selectedValues: ["a", "b", "c"] }).isAllSelected.value).toBe(true);
    expect(setup({ ...fullPage, selectedCount: 3 }).isAllSelected.value).toBe(false);
  });

  it("shows a fully selected page of an uncounted set as checked", () => {
    const { isAllSelected, isSomeSelected } = setup({
      activeRows: [true, true, true],
      selectedValues: ["a", "b", "c"],
      total: 5,
    });

    expect(isAllSelected.value).toBe(true);
    expect(isSomeSelected.value).toBe(false);
  });

  it("is indeterminate while part of the set is selected", () => {
    const { isAllSelected, isSomeSelected } = setup({ activeRows: [true, false, false], selectedValues: ["a"] });

    expect(isAllSelected.value).toBe(false);
    expect(isSomeSelected.value).toBe(true);
  });

  it("is disabled with no option on screen or while an answer is pending", () => {
    expect(setup({ values: [], activeRows: [] }).isDisabled.value).toBe(true);
    expect(setup({ answerPending: true }).isDisabled.value).toBe(true);
    expect(setup().isDisabled.value).toBe(false);
  });
});

describe("useSelectAll toggle", () => {
  it("adds the options on screen to the selection", () => {
    expect(setup({ activeRows: [false, true, false], selectedValues: ["x", "b"] }).toggle()).toEqual({
      values: ["x", "b", "a", "c"],
      selected: true,
    });
  });

  it("selects on a counted partial set even when every option on screen is selected", () => {
    expect(
      setup({ total: 100, selectedCount: 3, activeRows: [true, true, true], selectedValues: ["a", "b", "c"] }).toggle(),
    ).toEqual({ values: ["a", "b", "c"], selected: true });
  });

  it("clears a fully selected page of an uncounted set", () => {
    expect(setup({ total: 100, activeRows: [true, true, true], selectedValues: ["a", "b", "c"] }).toggle()).toEqual({
      values: [],
      selected: false,
    });
  });

  it("clears the whole selection once every option on screen is selected", () => {
    expect(setup({ activeRows: [true, true, true], selectedValues: ["a", "b", "c", "x"] }).toggle()).toEqual({
      values: [],
      selected: false,
    });
  });

  it("keeps what a query hides when clearing the matches", () => {
    expect(setup({ filterValue: "a", values: ["a"], activeRows: [true], selectedValues: ["a", "b"] }).toggle()).toEqual(
      { values: ["b"], selected: false },
    );
  });
});
