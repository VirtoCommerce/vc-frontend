import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesRepCommunication } from "./useSalesRepCommunication";

const mutationMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const mutate = vi.fn();
  const loading = ref(false);
  const useMutation = vi.fn(() => ({ mutate, loading }));
  return { mutate, loading, useMutation };
});

vi.mock("@vue/apollo-composable", () => ({ useMutation: mutationMock.useMutation }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US" } }));

beforeEach(() => {
  mutationMock.mutate.mockReset();
  mutationMock.loading.value = false;
  mutationMock.useMutation.mockClear();
});

describe("useSalesRepCommunication", () => {
  it("merges globals (storeId/cultureName) into the command and returns the boolean result", async () => {
    mutationMock.mutate.mockResolvedValue({ data: { sendCustomerCommunication: true } });

    const { sendCommunication } = useSalesRepCommunication();
    const succeeded = await sendCommunication({
      organizationId: "org-1",
      sendEmail: true,
      sendPush: false,
      title: "New releases",
      message: "Check https://example.com/list",
    });

    expect(succeeded).toBe(true);
    expect(mutationMock.mutate).toHaveBeenCalledWith({
      command: {
        organizationId: "org-1",
        sendEmail: true,
        sendPush: false,
        title: "New releases",
        message: "Check https://example.com/list",
        storeId: "B2B-store",
        cultureName: "en-US",
      },
    });
  });

  it("settles to false when the server returns no data", async () => {
    mutationMock.mutate.mockResolvedValue({ data: { sendCustomerCommunication: false } });

    const { sendCommunication } = useSalesRepCommunication();
    expect(await sendCommunication({ organizationId: "org-1", sendEmail: false, sendPush: true, message: "Hi" })).toBe(
      false,
    );

    mutationMock.mutate.mockResolvedValue(null);
    expect(await sendCommunication({ organizationId: "org-1", sendEmail: false, sendPush: true, message: "Hi" })).toBe(
      false,
    );
  });

  it("returns false (not throws) when the mutation rejects, so the UI can surface the failure", async () => {
    mutationMock.mutate.mockRejectedValue(new Error("PLATFORM error resolving field"));

    const { sendCommunication } = useSalesRepCommunication();
    await expect(
      sendCommunication({ organizationId: "org-1", sendEmail: true, sendPush: false, message: "Hi" }),
    ).resolves.toBe(false);
  });

  it("exposes the mutation loading flag", () => {
    const { loading } = useSalesRepCommunication();
    expect(loading.value).toBe(false);
    mutationMock.loading.value = true;
    expect(loading.value).toBe(true);
  });
});
