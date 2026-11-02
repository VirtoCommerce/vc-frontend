import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useSignInMethods } from "./useSignInMethods";

const renameMutate = vi.hoisted(() => vi.fn());
const deleteMutate = vi.hoisted(() => vi.fn());
const notifyError = vi.hoisted(() => vi.fn());

vi.mock("@/core/api/graphql/account", () => ({
  useGetSignInMethodsQuery: () => ({ result: ref(), loading: ref(false), refetch: vi.fn() }),
  useRenameSignInKeyMutation: () => ({ mutate: renameMutate, loading: ref(false) }),
  useDeleteSignInKeyMutation: () => ({ mutate: deleteMutate, loading: ref(false) }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => `translated ${key}`,
    te: (key: string) => key === "identity_error.last_sign_in_key",
  }),
}));

vi.mock("@/shared/notification", () => ({
  useNotifications: () => ({ error: notifyError }),
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn() },
}));

const operations = [
  {
    name: "renameKey",
    mutate: renameMutate,
    resultField: "renameSignInKey",
    run: (signInMethods: ReturnType<typeof useSignInMethods>) => signInMethods.renameKey("Passkey", "key-1", "Laptop"),
  },
  {
    name: "deleteKey",
    mutate: deleteMutate,
    resultField: "deleteSignInKey",
    run: (signInMethods: ReturnType<typeof useSignInMethods>) => signInMethods.deleteKey("Passkey", "key-1"),
  },
];

describe.each(operations)("useSignInMethods.$name", ({ mutate, resultField, run }) => {
  beforeEach(() => {
    mutate.mockReset();
    notifyError.mockReset();
  });

  it("returns true and shows nothing when the operation succeeds", async () => {
    mutate.mockResolvedValue({ data: { [resultField]: { succeeded: true } } });
    const signInMethods = useSignInMethods();

    const succeeded = await run(signInMethods);

    expect(succeeded).toBe(true);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("shows the translated error when the operation fails with a known code", async () => {
    mutate.mockResolvedValue({
      data: { [resultField]: { succeeded: false, errors: [{ code: "last_sign_in_key", description: "Last key" }] } },
    });
    const signInMethods = useSignInMethods();

    const succeeded = await run(signInMethods);

    expect(succeeded).toBe(false);
    expect(notifyError).toHaveBeenCalledWith({ text: "translated identity_error.last_sign_in_key" });
  });

  it("shows the backend description when the operation fails with an unknown code", async () => {
    mutate.mockResolvedValue({
      data: { [resultField]: { succeeded: false, errors: [{ code: "unknown_code", description: "Backend text" }] } },
    });
    const signInMethods = useSignInMethods();

    const succeeded = await run(signInMethods);

    expect(succeeded).toBe(false);
    expect(notifyError).toHaveBeenCalledWith({ text: "Backend text" });
  });

  it("returns false and leaves the toast to the global error handler when the request throws", async () => {
    mutate.mockRejectedValue(new Error("Network error"));
    const signInMethods = useSignInMethods();

    const succeeded = await run(signInMethods);

    expect(succeeded).toBe(false);
    expect(notifyError).not.toHaveBeenCalled();
  });
});
