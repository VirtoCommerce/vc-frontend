import { beforeEach, describe, expect, it, vi } from "vitest";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import { graphqlErrorEvent, TabsType, unhandledErrorEvent } from "@/shared/broadcast";
import { useFieldErrors } from "./useFieldErrors";
import type { GraphQLFormattedError } from "graphql";

const h = vi.hoisted(() => ({ emit: vi.fn() }));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
// The global error toasts listen to these events, see broadcast.ts
vi.mock("@/shared/broadcast", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/broadcast")>()),
  useBroadcast: () => ({ emit: h.emit }),
}));

function graphQLError(extensions: Record<string, unknown>): GraphQLFormattedError {
  return { message: "message", extensions };
}

function invalid(field: string, errorCode = "InvalidCharacters"): GraphQLFormattedError {
  return graphQLError({ code: "VALIDATION", field, errorCode });
}

// What Apollo rejects with when the server returns one error per failed rule
function apolloError(...graphQLErrors: GraphQLFormattedError[]): unknown {
  return { graphQLErrors, networkError: null };
}

beforeEach(() => {
  h.emit.mockReset();
});

describe("useFieldErrors", () => {
  describe("showSaveErrors", () => {
    it("returns a translated message for each input of the form and shows no toast", () => {
      const { showSaveErrors } = useFieldErrors();

      const messages = showSaveErrors(
        apolloError(invalid("firstName"), invalid("lastName", "HtmlTagsNotAllowed"), invalid("email", "InvalidEmail")),
        ["firstName", "lastName", "email"],
      );

      expect(messages).toEqual({
        firstName: "common.messages.invalid_characters",
        lastName: "common.messages.html_tags_not_allowed",
        email: "common.messages.email_is_not_correct",
      });
      expect(h.emit).not.toHaveBeenCalled();
    });

    // A page that saves one address gets its failures as addresses[0].<input name>
    it("names the inputs by the field path without the prefix", () => {
      const { showSaveErrors } = useFieldErrors();

      const messages = showSaveErrors(
        apolloError(invalid("addresses[0].city", "UnsafeContent")),
        ["city"],
        "addresses[0].",
      );

      expect(messages).toEqual({ city: "common.messages.unsafe_content" });
      expect(h.emit).not.toHaveBeenCalled();
    });

    // The server's own text is English only, so an unknown rule gets the generic field message
    it("shows the invalid value message for a rule it has no text for", () => {
      const { showSaveErrors } = useFieldErrors();

      const messages = showSaveErrors(apolloError(invalid("lastName", "MaximumLengthValidator")), ["lastName"]);

      expect(messages).toEqual({ lastName: "common.messages.invalid_value" });
    });

    // An input shows one message: the first of its failed rules, as with vee-validate's own errors
    it("keeps the first message when an input fails two rules", () => {
      const { showSaveErrors } = useFieldErrors();

      const messages = showSaveErrors(
        apolloError(invalid("lastName", "InvalidCharacters"), invalid("lastName", "HtmlTagsNotAllowed")),
        ["lastName"],
      );

      expect(messages).toEqual({ lastName: "common.messages.invalid_characters" });
    });

    // E.g. a phone set in the admin that the profile form has no input for: still reported, never silent
    it("sends a rejected field the form has no input for to the global error toast", () => {
      const { showSaveErrors } = useFieldErrors();
      const phone = invalid("phones[0]");

      const messages = showSaveErrors(apolloError(invalid("lastName"), phone), ["lastName"]);

      expect(messages).toEqual({ lastName: "common.messages.invalid_characters" });
      expect(h.emit.mock.calls).toEqual([[graphqlErrorEvent, [phone], TabsType.ALL]]);
    });

    it("sends a field of another address to the global error toast", () => {
      const { showSaveErrors } = useFieldErrors();
      const otherAddress = invalid("addresses[1].firstName");

      const messages = showSaveErrors(apolloError(otherAddress), ["firstName"], "addresses[0].");

      expect(messages).toEqual({});
      expect(h.emit.mock.calls).toEqual([[graphqlErrorEvent, [otherAddress], TabsType.ALL]]);
    });

    // E.g. a VALIDATION error from an older backend, which doesn't name the field
    it("sends an error that isn't rejected input to the global error toast", () => {
      const { showSaveErrors } = useFieldErrors();
      const validation = graphQLError({ code: GraphQLErrorCode.Validation });

      showSaveErrors(apolloError(validation), ["firstName"]);

      expect(h.emit.mock.calls).toEqual([[graphqlErrorEvent, [validation], TabsType.ALL]]);
    });

    // The unhandled error toast offers "Report a problem" only when it gets the error
    it("shows the unhandled error toast with the network error", () => {
      const { showSaveErrors } = useFieldErrors();

      showSaveErrors({ graphQLErrors: [], networkError: new TypeError("Failed to fetch") }, ["firstName"]);

      expect(h.emit.mock.calls).toEqual([
        [unhandledErrorEvent, expect.stringContaining("Failed to fetch"), TabsType.ALL],
      ]);
    });

    it("shows the unhandled error toast with the server error", () => {
      const { showSaveErrors } = useFieldErrors();
      const unhandled = graphQLError({ code: GraphQLErrorCode.Unhandled });

      showSaveErrors(apolloError(unhandled), ["firstName"]);

      expect(h.emit.mock.calls).toEqual([[unhandledErrorEvent, JSON.stringify([unhandled]), TabsType.ALL]]);
    });

    // The error link has already redirected to sign-in, the no-access page, the blocked page or the password change
    it.each([
      GraphQLErrorCode.Unauthorized,
      GraphQLErrorCode.Forbidden,
      GraphQLErrorCode.UserLocked,
      GraphQLErrorCode.PasswordExpired,
    ])("shows nothing for %s", (code) => {
      const { showSaveErrors } = useFieldErrors();

      showSaveErrors(apolloError(graphQLError({ code })), ["firstName"]);

      expect(h.emit).not.toHaveBeenCalled();
    });
  });

  // The global error toast uses it for errors no form shows
  describe("getErrorNotification", () => {
    it("names addresses, other data, or nothing", () => {
      const { getErrorNotification } = useFieldErrors();

      expect(getErrorNotification([{ field: "addresses[2].lastName" }]).text).toBe("common.messages.invalid_addresses");
      expect(getErrorNotification([{ field: "name" }]).text).toBe("common.messages.invalid_data");
      expect(getErrorNotification([]).text).toBe("common.messages.something_went_wrong");
    });

    it("names addresses when any of the rejected fields is an address field", () => {
      const { getErrorNotification } = useFieldErrors();

      const notification = getErrorNotification([{ field: "addresses[0].city" }, { field: "name" }]);

      expect(notification.text).toBe("common.messages.invalid_addresses");
    });
  });
});
