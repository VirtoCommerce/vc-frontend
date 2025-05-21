import { describe, it, expect } from "vitest";
import { SortDirection } from "@/core/enums";
import { getSortingExpression } from "./sorting";

describe("getSortingExpression", () => {
  it("should return correct expression for ascending sort", () => {
    const sort = {
      column: "name",
      direction: SortDirection.Ascending,
    };
    expect(getSortingExpression(sort)).toBe("name:asc");
  });

  it("should return correct expression for descending sort", () => {
    const sort = {
      column: "price",
      direction: SortDirection.Descending,
    };
    expect(getSortingExpression(sort)).toBe("price:desc");
  });

  it("should handle column names with special characters", () => {
    const sort = {
      column: "created_date",
      direction: SortDirection.Ascending,
    };
    expect(getSortingExpression(sort)).toBe("created_date:asc");
  });

  it("should handle empty column name", () => {
    const sort = {
      column: "",
      direction: SortDirection.Ascending,
    };
    expect(getSortingExpression(sort)).toBe(":asc");
  });
});
