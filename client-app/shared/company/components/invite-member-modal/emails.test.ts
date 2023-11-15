import { describe, it, expect } from "vitest";
import { getInvalidEmails, parseEmails, normalizeEmails } from "./emails";
import type { EmailType } from "./emails";

const rightResult: EmailType[] = [
  { value: "foo@bar.com", isValid: true },
  { value: "baz@bar.com", isValid: true },
];

const resultWithInvalid: EmailType[] = [
  { value: "foo@bar.com", isValid: true },
  { value: "baz.bar.com", isValid: false },
  { value: "baz#bar.com", isValid: false },
];

describe("emails", () => {
  describe("parseEmails", () => {
    describe("parses emails separated by:", () => {
      it("semicolon", () => {
        expect(parseEmails("foo@bar.com;baz@bar.com")).toEqual(rightResult);
      });

      it("comma", () => {
        expect(parseEmails("foo@bar.com,baz@bar.com")).toEqual(rightResult);
      });

      it("semicolon with space", () => {
        expect(parseEmails("foo@bar.com; baz@bar.com")).toEqual(rightResult);
      });

      it("comma with space", () => {
        expect(parseEmails("foo@bar.com, baz@bar.com")).toEqual(rightResult);
      });

      it("comma ends with comma", () => {
        expect(parseEmails("foo@bar.com,baz@bar.com,")).toEqual(rightResult);
      });

      it("semicolon ends with semicolon", () => {
        expect(parseEmails("foo@bar.com;baz@bar.com;")).toEqual(rightResult);
      });

      it("semicolon and new line", () => {
        expect(parseEmails("foo@bar.com;\rbaz@bar.com;")).toEqual(rightResult);
        expect(parseEmails("foo@bar.com;\r\nbaz@bar.com;")).toEqual(rightResult);
        expect(parseEmails("foo@bar.com;\nbaz@bar.com;")).toEqual(rightResult);
      });
    });

    it("includes invalid emails", () => {
      expect(parseEmails("foo@bar.com; baz.bar.com; baz#bar.com;")).toEqual(resultWithInvalid);
    });

    it("removes extra spaces", () => {
      expect(parseEmails("   foo@bar.com ;   baz@bar.com  ;  ")).toEqual(rightResult);
      expect(parseEmails("   foo@bar.com ;    \n  baz@bar.com  ;")).toEqual(rightResult);
    });

    it("returns empty array if no value provided", () => {
      expect(parseEmails("")).toEqual([]);
      expect(parseEmails()).toEqual([]);
    });
  });

  describe("getInvalidEmails", () => {
    it("returns string with invalid emails", () => {
      expect(getInvalidEmails(resultWithInvalid)).toEqual("baz.bar.com, baz#bar.com");
    });
  });

  describe("normalizeEmails", () => {
    it("returns string array of valid emails", () => {
      expect(normalizeEmails(parseEmails("foo@bar.com; baz@bar.com;"))).toEqual(["foo@bar.com", "baz@bar.com"]);
      expect(normalizeEmails(parseEmails("foo@bar.com; baz{ invalid }bar.com;"))).toEqual(["foo@bar.com"]);
    });

    it("converts emails to lowercase", () => {
      expect(normalizeEmails(parseEmails("Foo@bar.com; Baz@bar.com;"))).toEqual(["foo@bar.com", "baz@bar.com"]);
    });
  });
});
