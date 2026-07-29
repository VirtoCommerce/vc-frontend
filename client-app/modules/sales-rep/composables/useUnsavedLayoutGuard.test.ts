import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useUnsavedLayoutGuard } from "./useUnsavedLayoutGuard";

type GuardType = () => Promise<boolean>;

const guards: GuardType[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- SaveChangesModal's props bag
const modal: { props: any; closed: number } = { props: undefined, closed: 0 };

vi.mock("vue-router", () => ({
  onBeforeRouteLeave: (guard: GuardType) => guards.push(guard),
  onBeforeRouteUpdate: (guard: GuardType) => guards.push(guard),
}));
vi.mock("@/shared/common", () => ({ SaveChangesModal: { name: "SaveChangesModal" } }));
vi.mock("@/shared/modal", () => ({
  useModal: () => ({
    openModal: (options: { props: unknown }) => {
      modal.props = options.props;
    },
    closeModal: () => {
      modal.closed += 1;
    },
  }),
}));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

beforeEach(() => {
  guards.length = 0;
  modal.props = undefined;
  modal.closed = 0;
});

function setup(saveResult: boolean) {
  const editing = ref(true);
  const save = vi.fn(async () => saveResult);
  const cancel = vi.fn(() => {
    editing.value = false;
  });

  useUnsavedLayoutGuard({ editing, save, cancel });

  return { editing, save, cancel, leave: guards[0] };
}

describe("useUnsavedLayoutGuard", () => {
  // The customer profile keeps its route across customers, so the update hook matters as much as leave.
  it("guards both leaving the route and changing its params", () => {
    setup(true);

    expect(guards).toHaveLength(2);
  });

  it("lets navigation through untouched when there is no draft", async () => {
    const { editing, leave } = setup(true);
    editing.value = false;

    await expect(leave()).resolves.toBe(true);
    expect(modal.props).toBeUndefined();
  });

  it("navigates on once the save succeeds", async () => {
    const { save, leave } = setup(true);

    const pending = leave();
    await modal.props.onConfirm();

    await expect(pending).resolves.toBe(true);
    expect(save).toHaveBeenCalledOnce();
    expect(modal.closed).toBe(1);
  });

  // A failed write deliberately keeps the draft and edit mode, so navigating on regardless would
  // unmount the page and discard the very arrangement the rep asked to save.
  it("stays put when the save fails, keeping the draft alive", async () => {
    const { cancel, leave } = setup(false);

    const pending = leave();
    await modal.props.onConfirm();

    await expect(pending).resolves.toBe(false);
    expect(cancel).not.toHaveBeenCalled();
  });

  it("drops the draft and navigates on when the rep declines to save", async () => {
    const { save, cancel, leave } = setup(true);

    const pending = leave();
    modal.props.onClose();

    await expect(pending).resolves.toBe(true);
    expect(cancel).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
  });
});
