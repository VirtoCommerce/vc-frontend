import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesRepShareList } from "./useSalesRepShareList";

const mutationMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const mutate = vi.fn();
  const loading = ref(false);
  const useMutation = vi.fn(() => ({ mutate, loading }));
  return { mutate, loading, useMutation };
});

vi.mock("@vue/apollo-composable", () => ({ useMutation: mutationMock.useMutation }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US" } }));

const FAILED_RESULT = { succeeded: false, sharedWithOrganizationIds: [], warnings: [] };

beforeEach(() => {
  mutationMock.mutate.mockReset();
  mutationMock.loading.value = false;
  mutationMock.useMutation.mockClear();
});

describe("useSalesRepShareList", () => {
  it("merges globals (storeId/cultureName) into the command and returns the result", async () => {
    const payload = {
      succeeded: true,
      listId: "list-1",
      sharingKey: "key-1",
      sharingUrl: "https://store/shared-list/key-1",
      sharedWithOrganizationIds: ["org-1", "org-2"],
      warnings: [],
    };
    mutationMock.mutate.mockResolvedValue({ data: { shareListWithCustomers: payload } });

    const { shareList } = useSalesRepShareList();
    const result = await shareList({
      listId: "list-1",
      organizationIds: ["org-1", "org-2"],
      sendEmail: true,
      sendPush: true,
      message: "Check these out",
    });

    expect(result).toEqual(payload);
    expect(mutationMock.mutate).toHaveBeenCalledWith({
      command: {
        listId: "list-1",
        organizationIds: ["org-1", "org-2"],
        sendEmail: true,
        sendPush: true,
        message: "Check these out",
        storeId: "B2B-store",
        cultureName: "en-US",
      },
    });
  });

  it("normalizes null link fields to undefined and defaults collections, keeping warnings", async () => {
    mutationMock.mutate.mockResolvedValue({
      data: {
        shareListWithCustomers: {
          succeeded: true,
          listId: null,
          sharingKey: null,
          sharingUrl: null,
          sharedWithOrganizationIds: ["org-1"],
          warnings: ["EmailUnavailable"],
        },
      },
    });

    const { shareList } = useSalesRepShareList();
    const result = await shareList({ listId: "list-1", organizationIds: ["org-1"], sendEmail: true, sendPush: false });

    expect(result).toEqual({
      succeeded: true,
      listId: undefined,
      sharingKey: undefined,
      sharingUrl: undefined,
      sharedWithOrganizationIds: ["org-1"],
      warnings: ["EmailUnavailable"],
    });
  });

  it("settles to a failed result when the server returns no data", async () => {
    const { shareList } = useSalesRepShareList();

    mutationMock.mutate.mockResolvedValue({ data: null });
    expect(await shareList({ listId: "list-1", organizationIds: ["org-1"], sendEmail: true, sendPush: false })).toEqual(
      FAILED_RESULT,
    );

    mutationMock.mutate.mockResolvedValue(null);
    expect(await shareList({ listId: "list-1", organizationIds: ["org-1"], sendEmail: true, sendPush: false })).toEqual(
      FAILED_RESULT,
    );
  });

  it("returns a failed result (not throws) when the mutation rejects, so the UI can surface the failure", async () => {
    mutationMock.mutate.mockRejectedValue(new Error("PLATFORM error resolving field"));

    const { shareList } = useSalesRepShareList();
    await expect(
      shareList({ listId: "list-1", organizationIds: ["org-1"], sendEmail: true, sendPush: false }),
    ).resolves.toEqual(FAILED_RESULT);
  });

  it("exposes the mutation loading flag", () => {
    const { loading } = useSalesRepShareList();
    expect(loading.value).toBe(false);
    mutationMock.loading.value = true;
    expect(loading.value).toBe(true);
  });
});
