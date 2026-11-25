import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { useScopeHandOver } from "./useScopeHandOver";
import { useSearchScore } from "./useSearchScore";
import type { VueWrapper } from "@vue/test-utils";

const { searchScopeData, isScopePending, holdScope } = useSearchScore();

const isWaiting = ref(true);
let isScopePendingOnNextPageSetup: boolean | undefined;
let wrapper: VueWrapper | undefined;

const NextPage = defineComponent({
  setup() {
    isScopePendingOnNextPageSetup = isScopePending.value;
    return () => h("div", { "data-test-id": "next-page" });
  },
});

const Host = defineComponent({
  setup() {
    useScopeHandOver(isWaiting);
    return () => (isWaiting.value ? h("div", { "data-test-id": "loader" }) : h(NextPage));
  },
});

function mountHost(): void {
  wrapper = mount(Host);
}

function mountWithHandedOverScope(): void {
  const releaseHandOver = holdScope();
  mountHost();
  releaseHandOver();
}

beforeEach(() => {
  isWaiting.value = true;
  isScopePendingOnNextPageSetup = undefined;
  searchScopeData.value = { queryScope: "", searchScope: [] };
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  expect(isScopePending.value).toBe(false);
});

describe("useScopeHandOver", () => {
  it("holds a handed-over scope while waiting", () => {
    mountWithHandedOverScope();

    expect(isScopePending.value).toBe(true);
  });

  it("holds the category scope while waiting", () => {
    searchScopeData.value = {
      queryScope: "",
      searchScope: [{ id: "category-1", label: "Category", filter: "category.id:category-1", type: "category" }],
    };
    mountHost();

    searchScopeData.value = { queryScope: "", searchScope: [] };

    expect(isScopePending.value).toBe(true);
  });

  it("does not hold when there is no scope to hand over", () => {
    mountHost();

    expect(isScopePending.value).toBe(false);
  });

  it("releases the scope once the next page has rendered", async () => {
    mountWithHandedOverScope();

    isWaiting.value = false;
    await nextTick();

    expect(wrapper?.find("[data-test-id='next-page']").exists()).toBe(true);
    expect(isScopePendingOnNextPageSetup).toBe(true);
    expect(isScopePending.value).toBe(false);
  });

  it("releases the scope when unmounted while waiting", async () => {
    mountWithHandedOverScope();

    wrapper?.unmount();
    wrapper = undefined;
    await flushPromises();

    expect(isScopePending.value).toBe(false);
  });
});
