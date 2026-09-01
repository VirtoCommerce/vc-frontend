import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { localDayKeyToIso } from "../tasks";
import SalesRepTaskModal from "./sales-rep-task-modal.vue";
import type { SalesRepTaskType } from "../types/tasks";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

const mutations = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    setCompleted: vi.fn(),
    loading: ref(false),
  };
});

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return { types: ref<string[]>([]), success: vi.fn() };
});

vi.mock("../composables/useSalesRepTaskMutations", () => ({
  useSalesRepTaskMutations: () => mutations,
}));
vi.mock("../composables/useSalesRepTaskTypes", async () => {
  const { ref } = await import("vue");
  return { useSalesRepTaskTypes: () => ({ types: state.types, loading: ref(false), error: ref(null) }) };
});
vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ success: state.success, error: vi.fn() }) }));

const modal = vi.hoisted(() => ({ openModal: vi.fn(), closeModal: vi.fn(), closeConfirmation: vi.fn() }));
vi.mock("@/shared/modal", () => ({ useModal: () => modal }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key, d: () => "Oct 15", n: String }) }));

const closeMock = vi.hoisted(() => vi.fn());

// Stands in for VcModal: renders both slots and exposes the close() the component calls through its ref.
const VcModalStub = {
  props: ["title"],
  methods: { close: closeMock },
  template: '<div class="modal" :data-title="title"><slot /><slot name="actions" :close="close" /></div>',
};

// One stub for every field: they differ only in which value they carry, and the label identifies them.
const FieldStub = {
  props: ["modelValue", "label", "items"],
  emits: ["update:modelValue"],
  template:
    '<input class="field" :data-label="label" :value="modelValue"' +
    " @input=\"$emit('update:modelValue', $event.target.value)\" />",
};

function makeTask(overrides: Partial<SalesRepTaskType> = {}): SalesRepTaskType {
  return {
    id: "task-1",
    name: "Call ACME about the renewal",
    description: "Ask about the Q4 order",
    type: "Finance",
    priority: "High",
    dueDate: localDayKeyToIso("2026-10-15"),
    isActive: true,
    completed: undefined,
    createdDate: "2026-10-01T00:00:00Z",
    modifiedDate: undefined,
    status: "upcoming",
    ...overrides,
  };
}

// Plain mount (not createWrapperFactory): this file mocks the vue-i18n module, and the shared factory's
// defaults build a real i18n plugin from it.
function createWrapper(props: Record<string, unknown> = {}) {
  return mount(SalesRepTaskModal, {
    props,
    global: {
      renderStubDefaultSlot: false,
      stubs: {
        VcModal: VcModalStub,
        VcInput: FieldStub,
        VcDatePicker: FieldStub,
        VcSelect: FieldStub,
        VcTextarea: FieldStub,
        VcIcon: true,
      },
      // Real buttons: the actions are genuine <button>s the tests click, and Save reads its own disabled state.
      components: { VcButton },
    },
  });
}

type WrapperType = ReturnType<typeof createWrapper>;

const field = (wrapper: WrapperType, label: string) => wrapper.get(`[data-label$="${label}"]`);

function button(wrapper: WrapperType, key: string) {
  const found = wrapper.findAll("button").find((candidate) => candidate.text().includes(key));
  if (!found) {
    throw new Error(`No button for ${key}`);
  }
  return found;
}

async function save(wrapper: WrapperType) {
  await button(wrapper, "form.save_button").trigger("click");
  await flushPromises();
}

/** Delete asks first, so the test has to answer: click the button, then run the confirmation's onConfirm. */
async function confirmDelete(wrapper: WrapperType) {
  await wrapper.get(".sales-rep-task-modal__delete").trigger("click");

  const opened = modal.openModal.mock.calls.at(-1)?.[0] as {
    component: string;
    props: { onConfirm: () => Promise<void> };
  };
  expect(opened.component).toBe("VcConfirmationModal");

  await opened.props.onConfirm();
  await flushPromises();
}

beforeEach(() => {
  state.types.value = [];
  state.success.mockClear();
  closeMock.mockClear();
  mutations.loading.value = false;
  mutations.create.mockClear().mockResolvedValue(true);
  mutations.update.mockClear().mockResolvedValue(true);
  mutations.remove.mockClear().mockResolvedValue(true);
  modal.closeConfirmation.mockClear();
  modal.openModal.mockClear().mockReturnValue(modal.closeConfirmation);
});

describe("SalesRepTaskModal create", () => {
  it("pre-selects the day the rep opened it from", () => {
    const wrapper = createWrapper({ defaultDay: "2026-10-20" });

    expect(field(wrapper, "due_date_label").attributes("value")).toBe("2026-10-20");
    // Nobody has to pick an importance to write a note down.
    expect(field(wrapper, "priority_label").attributes("value")).toBe("Normal");
  });

  it("sends the picked day as the instant the API stores, never the raw day key", async () => {
    const wrapper = createWrapper({ defaultDay: "2026-10-15" });
    await field(wrapper, "name_label").setValue("  Call ACME  ");

    await save(wrapper);

    expect(mutations.create).toHaveBeenCalledWith({
      // Trimmed here as well as server-side: VcInput emits exactly what was typed.
      name: "Call ACME",
      dueDate: localDayKeyToIso("2026-10-15"),
      priority: "Normal",
      type: undefined,
      description: undefined,
    });
    expect(mutations.create.mock.calls[0][0].dueDate).not.toBe("2026-10-15");
  });

  it("confirms the write, tells the caller to refetch and closes", async () => {
    const onSaved = vi.fn();
    const wrapper = createWrapper({ defaultDay: "2026-10-15", onSaved });
    await field(wrapper, "name_label").setValue("Call ACME");

    await save(wrapper);

    expect(state.success).toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalled();
  });

  // The caller shows one day at a time, so a task written to another one has to say where it went.
  it("reports the day it wrote, not the day it opened on", async () => {
    const onSaved = vi.fn();
    const wrapper = createWrapper({ defaultDay: "2026-10-15", onSaved });
    await field(wrapper, "name_label").setValue("Call ACME");
    await field(wrapper, "due_date_label").setValue("2026-11-02");

    await save(wrapper);

    expect(onSaved).toHaveBeenCalledWith("2026-11-02");
  });

  // useMutation already raises the global error toast; what matters here is that the rep does not lose the form.
  it("keeps the form open when the write failed", async () => {
    const onSaved = vi.fn();
    mutations.create.mockResolvedValue(false);
    const wrapper = createWrapper({ defaultDay: "2026-10-15", onSaved });
    await field(wrapper, "name_label").setValue("Call ACME");

    await save(wrapper);

    expect(state.success).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(closeMock).not.toHaveBeenCalled();
  });

  it("does not write a task with no title", async () => {
    const wrapper = createWrapper({ defaultDay: "2026-10-15" });

    await save(wrapper);

    expect(mutations.create).not.toHaveBeenCalled();
    expect(closeMock).not.toHaveBeenCalled();
  });

  it("offers no Delete before there is anything to delete", () => {
    const wrapper = createWrapper({ defaultDay: "2026-10-15" });

    expect(wrapper.find(".sales-rep-task-modal__delete").exists()).toBe(false);
  });
});

describe("SalesRepTaskModal edit", () => {
  it("seeds every field from the task, with the due date back on the rep's calendar", () => {
    const wrapper = createWrapper({ task: makeTask() });

    expect(wrapper.get(".modal").attributes("data-title")).toBe("sales_rep.tasks.form.edit_title");
    expect(field(wrapper, "name_label").attributes("value")).toBe("Call ACME about the renewal");
    expect(field(wrapper, "due_date_label").attributes("value")).toBe("2026-10-15");
    expect(field(wrapper, "priority_label").attributes("value")).toBe("High");
    expect(field(wrapper, "description_label").attributes("value")).toBe("Ask about the Q4 order");
  });

  it("updates the same task rather than creating another", async () => {
    const wrapper = createWrapper({ task: makeTask() });
    await field(wrapper, "name_label").setValue("Call ACME back");

    await save(wrapper);

    expect(mutations.create).not.toHaveBeenCalled();
    expect(mutations.update).toHaveBeenCalledWith("task-1", expect.objectContaining({ name: "Call ACME back" }));
  });

  // Deleting is not undoable and the button shares a row with Save, so the click alone must not do it.
  it("asks before deleting anything", async () => {
    const wrapper = createWrapper({ task: makeTask() });

    await wrapper.get(".sales-rep-task-modal__delete").trigger("click");
    await flushPromises();

    expect(modal.openModal).toHaveBeenCalled();
    expect(mutations.remove).not.toHaveBeenCalled();
  });

  it("deletes once confirmed, then tells the caller to refetch and closes", async () => {
    const onSaved = vi.fn();
    const wrapper = createWrapper({ task: makeTask(), onSaved });

    await confirmDelete(wrapper);

    expect(mutations.remove).toHaveBeenCalledWith("task-1");
    // No day: a delete leaves no row for the caller to navigate to.
    expect(onSaved).toHaveBeenCalledWith();
    expect(modal.closeConfirmation).toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalled();
  });

  it("keeps both dialogs open when the delete failed", async () => {
    mutations.remove.mockResolvedValue(false);
    const wrapper = createWrapper({ task: makeTask() });

    await confirmDelete(wrapper);

    expect(modal.closeConfirmation).not.toHaveBeenCalled();
    expect(closeMock).not.toHaveBeenCalled();
  });
});

describe("SalesRepTaskModal type vocabulary", () => {
  // The shipped TaskManagement.TaskTypes defaults are back-office flavoured, so a deployment that never
  // configured them should not show a select with nothing worth choosing.
  it("hides the type field when nobody has configured the dictionary", () => {
    const wrapper = createWrapper({ defaultDay: "2026-10-15" });

    expect(wrapper.find('[data-label$="type_label"]').exists()).toBe(false);
  });

  it("offers the type field once the dictionary has values", async () => {
    state.types.value = ["Finance", "Follow-up"];
    const wrapper = createWrapper({ defaultDay: "2026-10-15" });
    await field(wrapper, "name_label").setValue("Call ACME");
    await field(wrapper, "type_label").setValue("Follow-up");

    await save(wrapper);

    expect(mutations.create).toHaveBeenCalledWith(expect.objectContaining({ type: "Follow-up" }));
  });
});
