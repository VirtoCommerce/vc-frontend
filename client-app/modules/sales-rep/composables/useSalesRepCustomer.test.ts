import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useSalesRepCustomer } from "./useSalesRepCustomer";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref: r } = await import("vue");
  const result = r<
    | {
        salesRepCustomer?: {
          organizationId: string;
          organizationName?: string;
          iconUrl?: string;
          accountType?: string;
          phone?: string;
          address?: { city?: string; regionName?: string };
          primaryContact?: { id: string; fullName?: string; name?: string };
        } | null;
      }
    | undefined
  >(undefined);
  const loading = r(false);
  const onError = vi.fn();
  const useQuery = vi.fn(() => ({ result, loading, onError }));
  return { result, loading, onError, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));
// The operation is imported as a raw document; useQuery is mocked, so a stub is enough.
vi.mock("../api/graphql/queries/salesRepCustomer/salesRepCustomerQuery.graphql", () => ({ default: {} }));

/** The reactive `variables` computed the composable handed to useQuery. */
function passedVariables(): { organizationId: string } {
  const call = (queryMock.useQuery.mock.calls.at(-1) ?? []) as unknown[];
  const variables = call[1] as { value: { organizationId: string } } | undefined;
  if (!variables) {
    throw new Error("useQuery was not called with variables");
  }
  return variables.value;
}

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.loading.value = false;
  queryMock.useQuery.mockClear();
  queryMock.onError.mockClear();
});

describe("useSalesRepCustomer", () => {
  it("queries by organization id and reacts to a getter source", () => {
    const organizationId = ref("org-1");
    useSalesRepCustomer(() => organizationId.value);

    expect(passedVariables()).toEqual({ organizationId: "org-1" });

    organizationId.value = "org-2";
    expect(passedVariables()).toEqual({ organizationId: "org-2" });
  });

  it("maps the details to the view shape, tolerating a missing name", () => {
    const { customer } = useSalesRepCustomer("org-1");

    queryMock.result.value = {
      salesRepCustomer: {
        organizationId: "org-1",
        organizationName: "The Cottage Shop LLC",
        iconUrl: "https://cdn.example/org-1.png",
        accountType: "Garden Center",
        phone: "(804) 462-1612",
        address: { city: "Richmond", regionName: "Virginia" },
        primaryContact: { id: "c-1", fullName: "Aubrey Kane" },
      },
    };
    expect(customer.value).toEqual({
      organizationId: "org-1",
      organizationName: "The Cottage Shop LLC",
      iconUrl: "https://cdn.example/org-1.png",
      accountType: "Garden Center",
      phone: "(804) 462-1612",
      // Structured address formatted as "City, Region".
      shipTo: "Richmond, Virginia",
      primaryContactName: "Aubrey Kane",
    });

    // No fullName on the contact -> the name falls back to `name`.
    queryMock.result.value = {
      salesRepCustomer: { organizationId: "org-1", primaryContact: { id: "c-1", name: "A. Kane" } },
    };
    expect(customer.value?.primaryContactName).toBe("A. Kane");

    // Only the id present: every optional field settles to an empty string.
    queryMock.result.value = { salesRepCustomer: { organizationId: "org-1" } };
    expect(customer.value).toEqual({
      organizationId: "org-1",
      organizationName: "",
      iconUrl: "",
      accountType: "",
      phone: "",
      shipTo: "",
      primaryContactName: "",
    });
  });

  it("flags notFound only once loading settles with no customer (rep not served / unknown org)", () => {
    const { customer, notFound } = useSalesRepCustomer("org-x");

    // Still loading -> not yet "not found".
    queryMock.loading.value = true;
    expect(notFound.value).toBe(false);

    // Loaded, server returned null.
    queryMock.loading.value = false;
    queryMock.result.value = { salesRepCustomer: null };
    expect(customer.value).toBeUndefined();
    expect(notFound.value).toBe(true);
  });

  it("passes loading through and registers an error handler", () => {
    const { loading } = useSalesRepCustomer("org-1");

    queryMock.loading.value = true;
    expect(loading.value).toBe(true);

    expect(queryMock.onError).toHaveBeenCalledTimes(1);
  });
});
