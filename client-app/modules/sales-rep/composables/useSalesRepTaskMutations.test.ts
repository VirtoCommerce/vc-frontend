import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSalesRepTaskMutations } from "./useSalesRepTaskMutations";

const mutate = vi.hoisted(() => vi.fn(() => Promise.resolve()));
const useMutation = vi.hoisted(() => vi.fn(() => ({ mutate, loading: { value: false } })));

vi.mock("@vue/apollo-composable", () => ({ useMutation }));

/** The command the composable handed to the mutation. */
function passedCommand(): Record<string, unknown> {
  return (mutate.mock.calls.at(-1) as unknown[])[0] as Record<string, unknown>;
}

describe("useSalesRepTaskMutations", () => {
  beforeEach(() => {
    mutate.mockClear();
  });

  // updateSalesRepTask replaces rather than patches: description, type and priority are non-null in the schema,
  // so an omitted one is rejected outright. Left to the spread, a form that clears a field would send nothing
  // for it - Apollo drops undefined from the variables - and every such save would fail.
  it("sends every editable field on update, even the ones the caller left out", async () => {
    const { update } = useSalesRepTaskMutations();

    await update("task-1", { name: "Renamed", dueDate: "2026-09-04T09:00:00Z" });

    expect(passedCommand()).toEqual({
      command: {
        id: "task-1",
        name: "Renamed",
        dueDate: "2026-09-04T09:00:00Z",
        description: "",
        type: "",
        priority: "",
      },
    });
  });

  it("keeps the values the caller did provide", async () => {
    const { update } = useSalesRepTaskMutations();

    await update("task-1", {
      name: "Renamed",
      dueDate: "2026-09-04T09:00:00Z",
      description: "Escalate.",
      type: "Call",
      priority: "High",
    });

    expect(passedCommand()).toMatchObject({
      command: { description: "Escalate.", type: "Call", priority: "High" },
    });
  });

  // Create keeps them optional - there is nothing to lose - so it passes the input through untouched.
  it("passes a create input through as-is", async () => {
    const { create } = useSalesRepTaskMutations();

    await create({ name: "New", dueDate: "2026-09-04T09:00:00Z" });

    expect(passedCommand()).toEqual({ command: { name: "New", dueDate: "2026-09-04T09:00:00Z" } });
  });
});
