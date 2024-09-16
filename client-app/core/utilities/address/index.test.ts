import { describe, it, expect } from "vitest";
import { toInputAddress, getAddressName, isEqualAddresses, isMemberAddressType } from "./index";
import type { AnyAddressType } from "../../types";
import type { MemberAddressType, InputMemberAddressType, OrderAddressType } from "@/core/api/graphql/types";

describe("toInputAddress", () => {
  it("should convert a AnyAddressType to InputMemberAddressType correctly", () => {
    const address: AnyAddressType = {
      id: "123",
      isDefault: true,
      isFavorite: false,
      firstName: "John",
      lastName: "Doe",
      city: "New York",
      line1: "123 Main St",
      countryCode: "US",
      description: "Home Address",
      postalCode: "10001",
    };

    const expected: InputMemberAddressType = {
      key: "123",
      firstName: "John",
      lastName: "Doe",
      city: "New York",
      line1: "123 Main St",
      countryCode: "US",
      description: "Home Address",
      postalCode: "10001",
    };

    const result = toInputAddress(address);

    expect(result).toEqual(expected);
  });

  it("should handle addresses with optional fields missing", () => {
    const address: AnyAddressType = {
      id: "456",
      isDefault: false,
      isFavorite: true,
      city: "Los Angeles",
      line1: "456 Elm St",
      countryCode: "US",
      postalCode: "90001",
    };

    const expected: InputMemberAddressType = {
      key: "456",
      city: "Los Angeles",
      line1: "456 Elm St",
      countryCode: "US",
      postalCode: "90001",
    };

    const result = toInputAddress(address);

    expect(result).toEqual(expected);
    expect(result.firstName).toBeUndefined();
    expect(result.lastName).toBeUndefined();
    expect(result.description).toBeUndefined();
  });
});

describe("getAddressName", () => {
  it("should return a concatenated address name with all fields present", () => {
    const address: AnyAddressType = {
      countryCode: "US",
      regionName: "California",
      city: "San Francisco",
      line1: "789 Market St",
    };

    const result = getAddressName(address);

    expect(result).toBe("US, California, San Francisco, 789 Market St");
  });

  it("should handle address with some missing fields properly", () => {
    const address: AnyAddressType = {
      countryCode: "US",
      regionName: "California",
    };

    const result = getAddressName(address);

    expect(result).toBe("US, California");
  });

  it("should return an empty string if all fields are missing or falsy", () => {
    const address: AnyAddressType = {};

    const result = getAddressName(address);

    expect(result).toBe("");
  });
});

describe("isEqualAddresses", () => {
  const baseAddress: AnyAddressType = {
    firstName: "Alice",
    lastName: "Wonderland",
    city: "Wonder City",
    line1: "123 Fantasy Rd",
    line2: "Suite 100",
    countryCode: "FA",
    regionId: "FAN",
    postalCode: "00000",
    phone: "123-456-7890",
    email: "alice@example.com",
    description: "Primary Residence",
  };

  it("should return true for identical addresses with default options", () => {
    const address1 = { ...baseAddress };
    const address2 = { ...baseAddress };

    const result = isEqualAddresses(address1, address2);

    expect(result).toBe(true);
  });

  it("should return false when a verifiable property differs", () => {
    const address1 = { ...baseAddress };
    const address2 = { ...baseAddress, city: "Different City" };

    const result = isEqualAddresses(address1, address2);

    expect(result).toBe(false);
  });

  it("should ignore description by default", () => {
    const address1 = { ...baseAddress };
    const address2 = { ...baseAddress, description: "Secondary Residence" };

    const result = isEqualAddresses(address1, address2);

    expect(result).toBe(true);
  });

  it("should consider description when skipDescription is false", () => {
    const address1 = { ...baseAddress };
    const address2 = { ...baseAddress, description: "Secondary Residence" };

    const result = isEqualAddresses(address1, address2, { skipDescription: false });

    expect(result).toBe(false);
  });

  it("should handle addresses of different types", () => {
    const address1: MemberAddressType = {
      id: "1",
      isDefault: true,
      isFavorite: false,
      firstName: "Charlie",
      lastName: "Brown",
      city: "Peanuts Town",
      line1: "1 Snoopy St",
      countryCode: "US",
      postalCode: "12345",
    };

    const address2: OrderAddressType = {
      id: "2",
      firstName: "Charlie",
      lastName: "Brown",
      city: "Peanuts Town",
      line1: "1 Snoopy St",
      countryCode: "US",
      postalCode: "12345",
    };

    const result = isEqualAddresses(address1, address2);

    expect(result).toBe(true);
  });

  it("should return false if one address lacks a verifiable property", () => {
    const address1 = { ...baseAddress };
    const address2 = { ...baseAddress };
    delete address2.email;

    const result = isEqualAddresses(address1, address2);

    expect(result).toBe(false);
  });

  it("should return true if both addresses are missing the same optional fields", () => {
    const address1 = { ...baseAddress };
    const address2 = { ...baseAddress };
    delete address1.line2;
    delete address2.line2;

    const result = isEqualAddresses(address1, address2);

    expect(result).toBe(true);
  });
});

describe("isMemberAddressType", () => {
  it("should return true if address has a description property", () => {
    const address: AnyAddressType = {
      description: "Office Address",
    };

    const result = isMemberAddressType(address);

    expect(result).toBe(true);
  });

  it("should return false if address lacks the description property", () => {
    const address: AnyAddressType = {
      firstName: "Bob",
      lastName: "Builder",
    };

    const result = isMemberAddressType(address);

    expect(result).toBe(false);
  });

  it("should return true even if description is undefined", () => {
    const addressWithUndefined: AnyAddressType = {
      description: undefined,
    };

    expect(isMemberAddressType(addressWithUndefined)).toBe(true);
  });
});
