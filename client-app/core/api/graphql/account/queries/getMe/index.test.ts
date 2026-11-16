import { describe, expect, it, vi } from "vitest";
import { useGetMeQuery } from "./index";

const useLazyQuery = vi.hoisted(() => vi.fn());

vi.mock("@vue/apollo-composable", () => ({ useLazyQuery }));

vi.mock("../../../client", () => ({ graphqlClient: {} }));

describe("useGetMeQuery", () => {
  // The sign-in reads the user right after the tokens are issued: an error in one field must not drop the whole user.
  it("keeps the user when one of its fields fails", () => {
    useGetMeQuery();

    expect(useLazyQuery).toHaveBeenCalledWith(expect.anything(), {}, expect.objectContaining({ errorPolicy: "all" }));
  });
});
