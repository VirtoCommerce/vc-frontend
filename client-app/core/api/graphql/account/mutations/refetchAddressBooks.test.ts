import { describe, expect, it, vi } from "vitest";
import { OperationNames } from "@/core/api/graphql/types";
import { refetchAddressBooks } from "./refetchAddressBooks";

const { refetchQueriesMock } = vi.hoisted(() => ({ refetchQueriesMock: vi.fn() }));

vi.mock("@/core/api/graphql/client", () => ({
  apolloClient: { refetchQueries: refetchQueriesMock },
}));

vi.mock("@/core/api/graphql/utils", () => ({
  filterActiveQueryNames: (_client: unknown, names: string[]) => names,
}));

describe("refetchAddressBooks", () => {
  it("refetches personal and organization address lists on the cached client", () => {
    refetchAddressBooks();

    expect(refetchQueriesMock).toHaveBeenCalledWith({
      include: [OperationNames.Query.GetCurrentUserAddresses, OperationNames.Query.GetCurrentOrganizationAddresses],
    });
  });
});
