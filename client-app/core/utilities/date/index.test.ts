import { describe, it, expect } from "vitest";
import { toStartDateFilterValue, toEndDateFilterValue, toDateISOString, isDateString } from "./index";

describe("Date Utility Functions (Timezone Independent Tests)", () => {
  describe("toStartDateFilterValue", () => {
    it("should return undefined when no date is provided", () => {
      expect(toStartDateFilterValue()).toBeUndefined();
    });

    it.each([
      { name: "a valid date string", input: "2022-12-13" },
      { name: "a date string with leading zeros", input: "2022-01-05" },
      { name: "a leap year date", input: "2024-02-29" },
      { name: "a year boundary date", input: "2022-12-31" },
    ])("should convert $name ($input) to the correct ISO string based on local midnight", ({ input }) => {
      // Create a Date object for local midnight
      const localMidnight = new Date(`${input}T00:00:00.000`);
      const expected = localMidnight.toISOString();
      expect(toStartDateFilterValue(input)).toBe(expected);
    });

    it("should throw an error when an invalid date string is provided", () => {
      const invalidInput = "invalid-date";
      expect(() => toStartDateFilterValue(invalidInput)).toThrow();
    });
  });

  describe("toEndDateFilterValue", () => {
    it("should return undefined when no date is provided", () => {
      expect(toEndDateFilterValue()).toBeUndefined();
    });

    it.each([
      { name: "a valid date string", input: "2022-12-13" },
      { name: "a month end date", input: "2022-04-30" },
      { name: "a year end date", input: "2022-12-31" },
      { name: "a leap year boundary date", input: "2024-02-29" },
    ])(
      "should convert $name ($input) to the correct ISO string representing the end of day based on local time",
      ({ input }) => {
        const localMidnight = new Date(`${input}T00:00:00.000`);
        // Compute the end of day: next day midnight minus 1 millisecond
        const nextDay = new Date(localMidnight.getTime());
        nextDay.setDate(nextDay.getDate() + 1);
        const expectedDate = new Date(nextDay.getTime() - 1);
        const expected = expectedDate.toISOString();
        expect(toEndDateFilterValue(input)).toBe(expected);
      },
    );

    it("should throw an error when an invalid date string is provided", () => {
      const invalidInput = "invalid-date";
      expect(() => toEndDateFilterValue(invalidInput)).toThrow();
    });
  });

  describe("toDateISOString", () => {
    it.each([
      { name: "an ISO datetime string", isoDateTime: "2022-12-13T12:34:56.789Z" },
      { name: "an ISO string without milliseconds", isoDateTime: "2022-12-13T12:34:56Z" },
      { name: "an offset timezone ISO string", isoDateTime: "2022-12-13T12:34:56+02:00" },
    ])("should extract the date portion from $name ($isoDateTime)", ({ isoDateTime }) => {
      expect(toDateISOString(isoDateTime)).toBe("2022-12-13");
    });

    it("should work with just the date part", () => {
      const dateOnly = "2022-12-13";
      expect(toDateISOString(dateOnly)).toBe("2022-12-13");
    });

    it("should handle dates at UTC boundaries", () => {
      const isoDateTime = "2022-12-31T23:59:59.999Z";
      expect(toDateISOString(isoDateTime)).toBe("2022-12-31");
    });
  });

  describe("isDateString", () => {
    it("should return true for a valid ISO 8601 date string", () => {
      const validISO = new Date("2022-12-13T00:00:00.000").toISOString();
      expect(isDateString(validISO)).toBe(true);
    });

    it("should return false for an ISO-like string with invalid date values", () => {
      const invalidISO = "2022-13-40T00:00:00.000Z";
      expect(isDateString(invalidISO)).toBe(false);
    });

    it("should return false for a non-date string", () => {
      expect(isDateString("not-a-date")).toBe(false);
    });

    it('should return false when the string is valid in local format but missing the "Z" suffix', () => {
      const localDate = "2022-12-13T00:00:00.000";
      expect(isDateString(localDate)).toBe(false);
    });

    it("should handle ISO strings with different time precision correctly", () => {
      // Full precision
      expect(isDateString(new Date("2022-12-13T12:34:56.789Z").toISOString())).toBe(true);
      // Without milliseconds
      expect(isDateString(new Date("2022-12-13T12:34:56Z").toISOString())).toBe(true);
      const dateWithoutSeconds = new Date("2022-12-13T12:34Z");
      expect(dateWithoutSeconds.toISOString().includes(":00.")).toBe(true);
    });

    it("should return false for date strings with timezone offsets", () => {
      expect(isDateString("2022-12-13T12:34:56+02:00")).toBe(false);
    });

    it("should return false for date-only strings", () => {
      expect(isDateString("2022-12-13")).toBe(false);
    });

    it("should return false for Unix timestamps", () => {
      expect(isDateString("1670932800000")).toBe(false);
    });

    it("should return false for ISO date strings with invalid components", () => {
      //invalid day
      expect(isDateString("2022-12-32T12:34:56.789Z")).toBe(false);
      // invalid month
      expect(isDateString("2022-13-13T12:34:56.789Z")).toBe(false);
      // invalid hour
      expect(isDateString("2022-12-13T25:34:56.789Z")).toBe(false);
      // invalid minute
      expect(isDateString("2022-12-13T12:60:56.789Z")).toBe(false);
      // invalid second
      expect(isDateString("2022-12-13T12:34:60.789Z")).toBe(false);
    });
  });
});
