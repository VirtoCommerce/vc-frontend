import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { graphqlErrorEvent } from "@/shared/broadcast";
import { setupBroadcastGlobalListeners } from "./broadcast";
import type { INotification } from "@/shared/notification";
import type { GraphQLFormattedError } from "graphql";

const h = vi.hoisted(() => ({
  listeners: new Map<string, (data: unknown) => void>(),
  notifyError: vi.fn(),
  report: vi.fn(),
}));

vi.mock("@vue/apollo-composable", () => ({ useApolloClient: () => ({ client: {} }) }));
vi.mock("vue-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-router")>()),
  useRouter: () => ({ currentRoute: { value: {} }, push: vi.fn() }),
}));
vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock("@/core/globals", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/globals")>();
  return { ...actual, globals: { ...actual.globals, i18n: { global: { t: (key: string) => key } } } };
});
vi.mock("@/core/composables", () => ({
  useReturnUrl: () => ({ getReturnUrl: vi.fn() }),
  useSupportReports: () => ({ report: h.report }),
}));
vi.mock("@/core/api/graphql", async () => ({
  filterActiveQueryNames: vi.fn(),
  getFieldValidationErrors: (await import("@/core/api/graphql/utils")).getFieldValidationErrors,
}));
vi.mock("@/shared/account", () => ({
  useUser: () => ({ fetchUser: vi.fn(), user: ref({}) }),
  useSignMeOut: () => ({ signMeOut: vi.fn() }),
}));
vi.mock("@/shared/broadcast", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/broadcast")>()),
  useBroadcast: () => ({
    on: (event: string, listener: (data: unknown) => void) => h.listeners.set(event, listener),
  }),
}));
vi.mock("@/shared/common", async () => ({
  useFieldErrors: (await import("@/shared/common/composables/useFieldErrors")).useFieldErrors,
}));
vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ error: h.notifyError, update: vi.fn() }) }));

function rejectedInput(field: string): GraphQLFormattedError {
  return { message: "message", extensions: { code: "VALIDATION", field, errorCode: "InvalidCharacters" } };
}

// The GraphQL errors of one response, as the Apollo error link sends them, and the toast they show
function showToast(...errors: GraphQLFormattedError[]): INotification {
  h.listeners.get(graphqlErrorEvent)?.(errors);

  expect(h.notifyError).toHaveBeenCalledOnce();
  return h.notifyError.mock.calls[0][0] as INotification;
}

// The global toast for GraphQL errors no form shows: rejected input is for the user to correct, anything else is a
// problem the user can report
describe("graphqlErrorEvent", () => {
  beforeAll(() => {
    setupBroadcastGlobalListeners();
  });

  beforeEach(() => {
    h.notifyError.mockReset();
    h.report.mockReset();
  });

  it("names the addresses and offers no report for rejected address input", () => {
    const notification = showToast(rejectedInput("addresses[0].firstName"));

    expect(notification.text).toBe("common.messages.invalid_addresses");
    expect(notification.button).toBeUndefined();
  });

  it("reports every error of the response when it also failed for another reason", () => {
    const errors = [rejectedInput("lastName"), { message: "boom" }];

    const notification = showToast(...errors);
    notification.button?.clickHandler?.("notification-1", new Event("click"));

    expect(notification.text).toBe("common.messages.invalid_data");
    expect(h.report).toHaveBeenCalledWith({ error: errors });
  });

  it("shows the generic text and a report button for an error that isn't rejected input", () => {
    const notification = showToast({ message: "boom" });

    expect(notification.text).toBe("common.messages.something_went_wrong");
    expect(notification.button).toBeDefined();
  });

  // An older backend sends VALIDATION without naming the field
  it("treats a VALIDATION error that names no field as a plain error", () => {
    const notification = showToast({ message: "Error trying to resolve field.", extensions: { code: "VALIDATION" } });

    expect(notification.text).toBe("common.messages.something_went_wrong");
    expect(notification.button).toBeDefined();
  });
});
