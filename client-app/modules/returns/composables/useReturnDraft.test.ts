import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, shallowRef } from "vue";
import { RETURN_ACTION } from "@/modules/returns/constants";
import { useReturnDraft } from "./useReturnDraft";

const mocks = vi.hoisted(() => ({
  updateReturn: vi.fn(),
  flushNow: vi.fn(),
}));

// Stands in for Apollo under keepPreviousResult: until the next id's response lands, the previous
// return is still what the query reports.
const queryResult = shallowRef<{ return: ReturnType<typeof makeReturn> } | undefined>();

vi.mock("@/modules/returns/api/graphql/queries/getReturn", () => ({
  useGetReturnQuery: () => ({ result: queryResult, loading: ref(false), refetch: vi.fn() }),
}));

vi.mock("@/modules/returns/api/graphql/queries/getReturnableItems", () => ({
  useGetReturnableItemsQuery: () => ({ result: ref(undefined), refetch: vi.fn() }),
}));

vi.mock("@/modules/returns/api/graphql/mutations/updateReturn", () => ({
  useUpdateReturnMutation: () => ({ mutate: mocks.updateReturn, loading: ref(false) }),
}));

vi.mock("@/modules/returns/api/graphql/mutations/submitReturn", () => ({
  useSubmitReturnMutation: () => ({ mutate: vi.fn(), loading: ref(false) }),
}));

vi.mock("@/modules/returns/composables/useReturnReasons", () => ({
  useReturnReasons: () => ({ requiresComment: () => false }),
}));

vi.mock("@/modules/returns/composables/useReturnErrors", () => ({
  useReturnErrors: () => ({ report: vi.fn() }),
  getReturnErrorDetails: () => ({}),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getSettingValue: () => undefined }),
}));

vi.mock("@/core/api/graphql/config/links/queued-mutations/queued-mutations", () => ({
  queuedMutationsController: { flushNow: mocks.flushNow },
}));

vi.mock("@/core/globals", () => ({ globals: { cultureName: "en-US" } }));

function makeReturn(id: string, lineId: string) {
  return {
    id,
    orderId: `order-${id}`,
    customerReference: `ref-${id}`,
    customerComment: `comment-${id}`,
    availableActions: [
      { name: RETURN_ACTION.EDIT, isAvailable: true },
      { name: RETURN_ACTION.SUBMIT, isAvailable: true },
    ],
    items: [
      {
        orderLineItemId: lineId,
        name: `line-${lineId}`,
        quantity: 1,
        reasonCode: "",
        reasonComment: "",
        serialNumber: "",
        attachments: [],
      },
    ],
  };
}

function setup(initialId: string) {
  const returnId = ref(initialId);
  const scope = effectScope();
  const draft = scope.run(() => useReturnDraft(returnId))!;

  return { returnId, draft, scope };
}

describe("useReturnDraft when the route reuses the page for another draft", () => {
  beforeEach(() => {
    mocks.updateReturn.mockReset().mockResolvedValue({});
    mocks.flushNow.mockReset();
    queryResult.value = { return: makeReturn("A", "line-a") };
  });

  it("does not save the previous draft's form under the new id while the new one loads", async () => {
    const { returnId, draft, scope } = setup("A");
    expect(draft.lines.value.map((line) => line.orderLineItemId)).toEqual(["line-a"]);

    returnId.value = "B";
    await nextTick();

    expect(await draft.save()).toBe(false);
    expect(mocks.updateReturn).not.toHaveBeenCalled();

    scope.stop();
  });

  it("stops reporting the previous draft once the id has moved on", async () => {
    const { returnId, draft, scope } = setup("A");

    returnId.value = "B";
    await nextTick();

    expect(draft.orderReturn.value).toBeUndefined();
    expect(draft.canEdit.value).toBe(false);
    expect(draft.lines.value).toEqual([]);
    expect(draft.customerReference.value).toBe("");

    scope.stop();
  });

  it("seeds the new draft when its result arrives and saves it under its own id", async () => {
    const { returnId, draft, scope } = setup("A");

    returnId.value = "B";
    await nextTick();
    queryResult.value = { return: makeReturn("B", "line-b") };
    await nextTick();

    expect(draft.lines.value.map((line) => line.orderLineItemId)).toEqual(["line-b"]);
    expect(draft.customerReference.value).toBe("ref-B");

    expect(await draft.save()).toBe(true);
    expect(mocks.updateReturn).toHaveBeenCalledWith({
      command: expect.objectContaining({
        returnId: "B",
        customerReference: "ref-B",
        items: [expect.objectContaining({ orderLineItemId: "line-b" })],
      }) as unknown,
    });

    scope.stop();
  });

  it("reseeds when coming back to a draft already seeded before", async () => {
    const { returnId, draft, scope } = setup("A");
    draft.customerReference.value = "typed on A";

    returnId.value = "B";
    await nextTick();
    queryResult.value = { return: makeReturn("B", "line-b") };
    await nextTick();

    returnId.value = "A";
    queryResult.value = { return: makeReturn("A", "line-a") };
    await nextTick();

    expect(draft.customerReference.value).toBe("ref-A");
    expect(draft.lines.value.map((line) => line.orderLineItemId)).toEqual(["line-a"]);

    scope.stop();
  });
});
