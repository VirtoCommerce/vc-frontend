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
  it("merges globals (storeId/cultureName) into the command and returns the per-channel result", async () => {
    const payload = { succeeded: true, pushSent: false, emailSent: true, warnings: [] };
    mutationMock.mutate.mockResolvedValue({ data: { sendCustomerCommunication: payload } });

    const { sendCommunication } = useSalesRepCommunication();
    const result = await sendCommunication({
      organizationId: "org-1",
      sendEmail: true,
      sendPush: false,
      title: "New releases",
      message: "Check https://example.com/list",
    });

    expect(result).toEqual(payload);
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

  it("passes a partial-success result (with warnings) straight through", async () => {
    const payload = { succeeded: true, pushSent: true, emailSent: false, warnings: ["EmailUnavailable"] };
    mutationMock.mutate.mockResolvedValue({ data: { sendCustomerCommunication: payload } });

    const { sendCommunication } = useSalesRepCommunication();
    expect(
      await sendCommunication({ organizationId: "org-1", sendEmail: true, sendPush: true, message: "Hi" }),
    ).toEqual(payload);
  });

  it("settles to a failed result when the server returns no data", async () => {
    const failed = { succeeded: false, pushSent: false, emailSent: false, warnings: [] };

    mutationMock.mutate.mockResolvedValue({ data: null });
    const { sendCommunication } = useSalesRepCommunication();
    expect(
      await sendCommunication({ organizationId: "org-1", sendEmail: false, sendPush: true, message: "Hi" }),
    ).toEqual(failed);

    mutationMock.mutate.mockResolvedValue(null);
    expect(
      await sendCommunication({ organizationId: "org-1", sendEmail: false, sendPush: true, message: "Hi" }),
    ).toEqual(failed);
  });

  it("returns a failed result (not throws) when the mutation rejects, so the UI can surface the failure", async () => {
    mutationMock.mutate.mockRejectedValue(new Error("PLATFORM error resolving field"));

    const { sendCommunication } = useSalesRepCommunication();
    await expect(
      sendCommunication({ organizationId: "org-1", sendEmail: true, sendPush: false, message: "Hi" }),
    ).resolves.toEqual({ succeeded: false, pushSent: false, emailSent: false, warnings: [] });
  });

  it("exposes the mutation loading flag", () => {
    const { loading } = useSalesRepCommunication();
    expect(loading.value).toBe(false);
    mutationMock.loading.value = true;
    expect(loading.value).toBe(true);
  });
});
