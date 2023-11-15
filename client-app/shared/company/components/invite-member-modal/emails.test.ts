import { describe, it, expect } from "vitest";
import { getInvalidEmails, parseEmails } from "./emails";
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
  describe("parseEmails should split email string to email array", () => {
    it("should return empty array with nullable value", () => {
      expect(parseEmails("")).toEqual([]);
      expect(parseEmails(undefined)).toEqual([]);
    });
    it("separated by semicolon", () => {
      expect(parseEmails("foo@bar.com;baz@bar.com")).toEqual(rightResult);
    });
    it("separated by comma", () => {
      expect(parseEmails("foo@bar.com,baz@bar.com")).toEqual(rightResult);
    });
    it("separated by semicolon with space", () => {
      expect(parseEmails("foo@bar.com; baz@bar.com")).toEqual(rightResult);
    });
    it("separated by comma with space", () => {
      expect(parseEmails("foo@bar.com, baz@bar.com")).toEqual(rightResult);
    });
    it("separated by comma ends with comma", () => {
      expect(parseEmails("foo@bar.com,baz@bar.com,")).toEqual(rightResult);
    });
    it("separated by semicolon ends with semicolon", () => {
      expect(parseEmails("foo@bar.com;baz@bar.com;")).toEqual(rightResult);
    });
    it("separated by semicolon and new line", () => {
      expect(parseEmails("foo@bar.com;\rbaz@bar.com;")).toEqual(rightResult);
      expect(parseEmails("foo@bar.com;\r\nbaz@bar.com;")).toEqual(rightResult);
      expect(parseEmails("foo@bar.com;\nbaz@bar.com;")).toEqual(rightResult);
    });
    it("include invalid emails", () => {
      expect(parseEmails("foo@bar.com; baz.bar.com; baz#bar.com;")).toEqual(resultWithInvalid);
    });
    it("remove extra spaces", () => {
      expect(parseEmails("   foo@bar.com ;   baz@bar.com  ;  ")).toEqual(rightResult);
    });
  });

  describe("getInvalidEmails", () => {
    it("should return string with invalid emails", () => {
      expect(getInvalidEmails(resultWithInvalid)).toEqual("baz.bar.com, baz#bar.com");
    });
  });
});
