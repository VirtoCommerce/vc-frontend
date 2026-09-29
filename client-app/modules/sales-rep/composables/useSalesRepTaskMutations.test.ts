import { describe, expect, it, vi, beforeEach } from "vitest";
import { Logger } from "@/core/utilities";
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

  // updateSalesRepTask replaces rather than patches, and its input mirrors what the read returns - so the record
  // goes back exactly as given. A field the caller left out is omitted, which the server reads as "cleared"; it no
  // longer has to be spelled as "" to get past a non-null schema.
  it("sends the record as given, without inventing values for the fields the caller left out", async () => {
    const { update } = useSalesRepTaskMutations();

    await update("task-1", { name: "Renamed", dueDate: "2026-09-04T09:00:00Z" });

    expect(passedCommand()).toEqual({
      command: {
        id: "task-1",
        name: "Renamed",
        dueDate: "2026-09-04T09:00:00Z",
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

  // The contract the dialogs rely on: a failed write answers false instead of throwing, so the caller keeps the
  // form open, and the failure is logged since useMutation's own toast is the only other trace of it.
  it("answers false and logs when the write fails", async () => {
    const logger = vi.spyOn(Logger, "error").mockImplementation(() => {});
    mutate.mockRejectedValueOnce(new Error("boom"));
    const { setCompleted } = useSalesRepTaskMutations();

    await expect(setCompleted("task-1", true)).resolves.toBe(false);

    expect(logger).toHaveBeenCalledWith(expect.stringContaining("changeSalesRepTaskStatus"), expect.any(Error));
    logger.mockRestore();
  });
});
