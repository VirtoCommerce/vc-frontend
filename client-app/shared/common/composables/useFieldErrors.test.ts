import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFieldErrors } from "./useFieldErrors";

const h = vi.hoisted(() => ({ notifyError: vi.fn() }));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ error: h.notifyError }) }));

// What Apollo rejects with when the server returns one error per failed rule
function apolloError(...extensions: Record<string, unknown>[]): unknown {
  return { graphQLErrors: extensions.map((item) => ({ message: "message", extensions: item })) };
}

function invalid(field: string, errorCode = "InvalidCharacters"): Record<string, unknown> {
  return { code: "VALIDATION", field, errorCode };
}

beforeEach(() => {
  h.notifyError.mockReset();
});

describe("useFieldErrors", () => {
  describe("showSaveErrors", () => {
    it("returns a translated message for each input of the form and shows no toast", () => {
      const { showSaveErrors } = useFieldErrors();

      const messages = showSaveErrors(apolloError(invalid("firstName"), invalid("lastName", "HtmlTagsNotAllowed")), [
        "firstName",
        "lastName",
      ]);

      expect(messages).toEqual({
        firstName: "common.messages.invalid_characters",
        lastName: "common.messages.html_tags_not_allowed",
      });
      expect(h.notifyError).not.toHaveBeenCalled();
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
      expect(h.notifyError).not.toHaveBeenCalled();
    });

    // The server's own text is English only, so an unknown rule gets the generic field message
    it("shows the invalid value message for a rule it has no text for", () => {
      const { showSaveErrors } = useFieldErrors();

      const messages = showSaveErrors(apolloError(invalid("lastName", "MaximumLengthValidator")), ["lastName"]);

      expect(messages).toEqual({ lastName: "common.messages.invalid_value" });
    });

    // E.g. a phone set in the admin that the profile form has no input for: still reported, never silent
    it("shows a toast for a rejected field the form has no input for", () => {
      const { showSaveErrors } = useFieldErrors();

      const messages = showSaveErrors(apolloError(invalid("lastName"), invalid("phones[0]")), ["lastName"]);

      expect(messages).toEqual({ lastName: "common.messages.invalid_characters" });
      expect(h.notifyError).toHaveBeenCalledOnce();
      expect(h.notifyError).toHaveBeenCalledWith(expect.objectContaining({ text: "common.messages.invalid_data" }));
    });

    it("says that addresses were rejected when an address field has no input", () => {
      const { showSaveErrors } = useFieldErrors();

      showSaveErrors(apolloError(invalid("addresses[1].firstName")), ["firstName"], "addresses[0].");

      expect(h.notifyError).toHaveBeenCalledWith(
        expect.objectContaining({ text: "common.messages.invalid_addresses" }),
      );
    });

    it("shows the generic toast for a failure that isn't rejected input", () => {
      const { showSaveErrors } = useFieldErrors();

      const messages = showSaveErrors(new Error("Failed to fetch"), ["firstName"]);

      expect(messages).toEqual({});
      expect(h.notifyError).toHaveBeenCalledWith(
        expect.objectContaining({ text: "common.messages.something_went_wrong" }),
      );
    });
  });

  // The global error toast uses it for errors no form shows
  describe("getErrorNotificationText", () => {
    it("names addresses, other data, or nothing", () => {
      const { getErrorNotificationText } = useFieldErrors();

      expect(getErrorNotificationText([{ field: "addresses[2].lastName" }])).toBe("common.messages.invalid_addresses");
      expect(getErrorNotificationText([{ field: "name" }])).toBe("common.messages.invalid_data");
      expect(getErrorNotificationText([])).toBe("common.messages.something_went_wrong");
    });
  });
});
