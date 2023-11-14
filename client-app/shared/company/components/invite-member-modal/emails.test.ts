import { describe, it, expect } from "vitest";
import { getEmailAddresses } from "./emails";
import type { EmailType } from "./emails";

const rightResult: EmailType[] = [
  { value: "foo@bar.com", isValid: true },
  { value: "baz@bar.com", isValid: true },
];

describe("getEmailAddresses", () => {
  it("should return empty array with nullable value", () => {
    expect(getEmailAddresses("")).toEqual([]);
    expect(getEmailAddresses(undefined)).toEqual([]);
  });
  it("should split email string to email array separated by semicolon", () => {
    expect(getEmailAddresses("foo@bar.com;baz@bar.com")).toEqual(rightResult);
  });
  it("should split email string to email array separated by comma", () => {
    expect(getEmailAddresses("foo@bar.com,baz@bar.com")).toEqual(rightResult);
  });
  it("should split email string to email array separated by semicolon with space", () => {
    expect(getEmailAddresses("foo@bar.com; baz@bar.com")).toEqual(rightResult);
  });
  it("should split email string to email array separated by comma with space", () => {
    expect(getEmailAddresses("foo@bar.com, baz@bar.com")).toEqual(rightResult);
  });
  it("should split email string to email array separated by comma ends with comma", () => {
    expect(getEmailAddresses("foo@bar.com,baz@bar.com,")).toEqual(rightResult);
  });
  it("should split email string to email array separated by semicolon ends with semicolon", () => {
    expect(getEmailAddresses("foo@bar.com;baz@bar.com;")).toEqual(rightResult);
  });
  it("should split email string to email array separated by semicolon and new line", () => {
    expect(getEmailAddresses("foo@bar.com;\rbaz@bar.com;")).toEqual(rightResult);
    expect(getEmailAddresses("foo@bar.com;\r\nbaz@bar.com;")).toEqual(rightResult);
    expect(getEmailAddresses("foo@bar.com;\nbaz@bar.com;")).toEqual(rightResult);
  });
});
