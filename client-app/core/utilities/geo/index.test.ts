import { describe, it, expect } from "vitest";
import { geoLocationStringToLatLng } from "./index";

describe("geoLocationStringToLatLng", () => {
  describe("Valid inputs", () => {
    it("should parse positive latitude and negative longitude", () => {
      const geoLocation = "40.7128,-74.0060";
      const result = geoLocationStringToLatLng(geoLocation);
      expect(result).toEqual({ lat: 40.7128, lng: -74.006 });
    });

    it("should parse negative latitude and positive longitude", () => {
      const geoLocation = "-33.8688,151.2093";
      const result = geoLocationStringToLatLng(geoLocation);
      expect(result).toEqual({ lat: -33.8688, lng: 151.2093 });
    });

    it("should parse both negative coordinates", () => {
      const geoLocation = "-34.6037,-58.3816";
      const result = geoLocationStringToLatLng(geoLocation);
      expect(result).toEqual({ lat: -34.6037, lng: -58.3816 });
    });

    it("should parse both positive coordinates", () => {
      const geoLocation = "35.6762,139.6503";
      const result = geoLocationStringToLatLng(geoLocation);
      expect(result).toEqual({ lat: 35.6762, lng: 139.6503 });
    });

    it("should handle coordinates with trailing zeros", () => {
      const geoLocation = "40.0000,-74.0000";
      const result = geoLocationStringToLatLng(geoLocation);
      expect(result).toEqual({ lat: 40, lng: -74 });
    });

    it("should handle integer coordinates", () => {
      const geoLocation = "40,-74";
      const result = geoLocationStringToLatLng(geoLocation);
      expect(result).toEqual({ lat: 40, lng: -74 });
    });

    it("should handle coordinates with whitespace", () => {
      const geoLocation = " 40.7128 , -74.0060 ";
      const result = geoLocationStringToLatLng(geoLocation);
      expect(result).toEqual({ lat: 40.7128, lng: -74.006 });
    });

    it("should handle extreme valid latitude values", () => {
      const northPole = "90,0";
      const southPole = "-90,0";

      expect(geoLocationStringToLatLng(northPole)).toEqual({ lat: 90, lng: 0 });
      expect(geoLocationStringToLatLng(southPole)).toEqual({ lat: -90, lng: 0 });
    });

    it("should handle extreme valid longitude values", () => {
      const eastBoundary = "0,180";
      const westBoundary = "0,-180";

      expect(geoLocationStringToLatLng(eastBoundary)).toEqual({ lat: 0, lng: 180 });
      expect(geoLocationStringToLatLng(westBoundary)).toEqual({ lat: 0, lng: -180 });
    });

    it("should handle coordinates at origin", () => {
      const origin = "0,0";
      const result = geoLocationStringToLatLng(origin);
      expect(result).toEqual({ lat: 0, lng: 0 });
    });
  });

  describe("Invalid inputs - format errors", () => {
    it("should throw error for empty string", () => {
      expect(() => geoLocationStringToLatLng("")).toThrow("Invalid input: geoLocation must be a non-empty string");
    });

    it("should throw error for whitespace-only string", () => {
      expect(() => geoLocationStringToLatLng("   ")).toThrow(
        "Invalid input: geoLocation cannot be empty or only whitespace",
      );
    });

    it("should throw error for string without comma", () => {
      expect(() => geoLocationStringToLatLng("40.7128")).toThrow(
        "Invalid format: geoLocation must contain exactly one comma separating latitude and longitude",
      );
    });

    it("should throw error for string with multiple commas", () => {
      expect(() => geoLocationStringToLatLng("40.7128,-74.0060,extra")).toThrow(
        "Invalid format: geoLocation must contain exactly one comma separating latitude and longitude",
      );
    });

    it("should throw error for empty latitude", () => {
      expect(() => geoLocationStringToLatLng(",-74.0060")).toThrow(
        "Invalid format: both latitude and longitude must be provided",
      );
    });

    it("should throw error for empty longitude", () => {
      expect(() => geoLocationStringToLatLng("40.7128,")).toThrow(
        "Invalid format: both latitude and longitude must be provided",
      );
    });

    it("should throw error for both empty coordinates", () => {
      expect(() => geoLocationStringToLatLng(",")).toThrow(
        "Invalid format: both latitude and longitude must be provided",
      );
    });

    it("should throw error for whitespace-only latitude", () => {
      expect(() => geoLocationStringToLatLng("   ,-74.0060")).toThrow(
        "Invalid format: both latitude and longitude must be provided",
      );
    });

    it("should throw error for whitespace-only longitude", () => {
      expect(() => geoLocationStringToLatLng("40.7128,   ")).toThrow(
        "Invalid format: both latitude and longitude must be provided",
      );
    });
  });

  describe("Invalid inputs - non-numeric values", () => {
    it("should throw error for non-numeric latitude", () => {
      expect(() => geoLocationStringToLatLng("abc,-74.0060")).toThrow(
        "Invalid coordinates: latitude and longitude must be valid numbers",
      );
    });

    it("should throw error for non-numeric longitude", () => {
      expect(() => geoLocationStringToLatLng("40.7128,abc")).toThrow(
        "Invalid coordinates: latitude and longitude must be valid numbers",
      );
    });

    it("should throw error for both non-numeric coordinates", () => {
      expect(() => geoLocationStringToLatLng("abc,def")).toThrow(
        "Invalid coordinates: latitude and longitude must be valid numbers",
      );
    });

    it("should throw error for mixed valid and invalid coordinates", () => {
      expect(() => geoLocationStringToLatLng("40.7128,not-a-number")).toThrow(
        "Invalid coordinates: latitude and longitude must be valid numbers",
      );
    });
  });

  describe("Invalid inputs - out of range coordinates", () => {
    it("should throw error for latitude above 90", () => {
      expect(() => geoLocationStringToLatLng("91,0")).toThrow("Invalid latitude: must be between -90 and 90 degrees");
    });

    it("should throw error for latitude below -90", () => {
      expect(() => geoLocationStringToLatLng("-91,0")).toThrow("Invalid latitude: must be between -90 and 90 degrees");
    });

    it("should throw error for longitude above 180", () => {
      expect(() => geoLocationStringToLatLng("0,181")).toThrow(
        "Invalid longitude: must be between -180 and 180 degrees",
      );
    });

    it("should throw error for longitude below -180", () => {
      expect(() => geoLocationStringToLatLng("0,-181")).toThrow(
        "Invalid longitude: must be between -180 and 180 degrees",
      );
    });

    it("should throw error for both coordinates out of range", () => {
      expect(() => geoLocationStringToLatLng("100,200")).toThrow(
        "Invalid latitude: must be between -90 and 90 degrees",
      );
    });
  });

  describe("Type checking", () => {
    it("should return correct interface type", () => {
      const result = geoLocationStringToLatLng("40.7128,-74.0060");
      expect(typeof result?.lat).toBe("number");
      expect(typeof result?.lng).toBe("number");
      expect(result).toHaveProperty("lat");
      expect(result).toHaveProperty("lng");
    });
  });

  describe("Edge cases with special numbers", () => {
    it("should handle very small decimal values", () => {
      const result = geoLocationStringToLatLng("0.000001,-0.000001");
      expect(result).toEqual({ lat: 0.000001, lng: -0.000001 });
    });

    it("should handle coordinates with many decimal places", () => {
      const result = geoLocationStringToLatLng("40.712812345,-74.006012345");
      expect(result).toEqual({ lat: 40.712812345, lng: -74.006012345 });
    });

    it("should throw error for infinity values", () => {
      expect(() => geoLocationStringToLatLng("Infinity,-74.0060")).toThrow(
        "Invalid latitude: must be between -90 and 90 degrees",
      );
    });

    it("should throw error for negative infinity values", () => {
      expect(() => geoLocationStringToLatLng("-Infinity,-74.0060")).toThrow(
        "Invalid latitude: must be between -90 and 90 degrees",
      );
    });
  });
});
