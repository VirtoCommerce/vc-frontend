import { describe, it, expect } from "vitest";
import { parseEmails } from "./emails";
import type { EmailType } from "./emails";

const rightResult: EmailType[] = [
  { value: "foo@bar.com", isValid: true },
  { value: "baz@bar.com", isValid: true },
];

describe("emails", () => {
  it("should return empty array with nullable value", () => {
    expect(parseEmails("")).toEqual([]);
    expect(parseEmails(undefined)).toEqual([]);
  });
  it("should split email string to email array separated by semicolon", () => {
    expect(parseEmails("foo@bar.com;baz@bar.com")).toEqual(rightResult);
  });
  it("should split email string to email array separated by comma", () => {
    expect(parseEmails("foo@bar.com,baz@bar.com")).toEqual(rightResult);
  });
  it("should split email string to email array separated by semicolon with space", () => {
    expect(parseEmails("foo@bar.com; baz@bar.com")).toEqual(rightResult);
  });
  it("should split email string to email array separated by comma with space", () => {
    expect(parseEmails("foo@bar.com, baz@bar.com")).toEqual(rightResult);
  });
  it("should split email string to email array separated by comma ends with comma", () => {
    expect(parseEmails("foo@bar.com,baz@bar.com,")).toEqual(rightResult);
  });
  it("should split email string to email array separated by semicolon ends with semicolon", () => {
    expect(parseEmails("foo@bar.com;baz@bar.com;")).toEqual(rightResult);
  });
  it("should split email string to email array separated by semicolon and new line", () => {
    expect(parseEmails("foo@bar.com;\rbaz@bar.com;")).toEqual(rightResult);
    expect(parseEmails("foo@bar.com;\r\nbaz@bar.com;")).toEqual(rightResult);
    expect(parseEmails("foo@bar.com;\nbaz@bar.com;")).toEqual(rightResult);
  });
});
