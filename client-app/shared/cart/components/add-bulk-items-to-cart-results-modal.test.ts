import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import { writeThemeVariables } from "@/core/plugins/config.plugin";
import { VcButton } from "@/ui-kit/components";
import AddBulkItemsToCartResultsModal from "./add-bulk-items-to-cart-results-modal.vue";
import type { IThemeConfigPreset } from "@/core/types";

const HOSTILE_VALUE = "</style><script>window.parent.pwned = true</script>";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key, d: () => "date" }) }));
vi.mock("@/core/composables", () => ({
  useProductsRoutes: () => computed(() => ({})),
  useWhiteLabeling: () => ({ logoUrl: ref("/logo.svg") }),
}));

async function printResults() {
  const printDocument = document.implementation.createHTMLDocument("");
  const write = vi.spyOn(printDocument, "write");
  vi.spyOn(window, "open").mockReturnValue({ document: printDocument, focus: vi.fn() } as unknown as Window);

  const wrapper = mount(AddBulkItemsToCartResultsModal, {
    props: { listName: "List" },
    global: {
      mocks: { $t: (key: string) => key, $n: String },
      stubs: {
        VcModal: { template: '<div><slot name="actions" :close="() => {}" /></div>' },
        VcButton: true,
        VcExpansionPanels: true,
        VcExpansionPanel: true,
        VcIcon: true,
        VcBadge: true,
        RouterLink: true,
      },
    },
  });

  await wrapper
    .findAllComponents(VcButton)
    .find((button) => button.attributes("variant") === "outline")
    ?.trigger("click");

  return { printDocument, writtenHtml: String(write.mock.calls[0]?.[0]) };
}

describe("AddBulkItemsToCartResultsModal print", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("carries the theme variables to the print window ahead of the other styles", async () => {
    writeThemeVariables({ color_primary_500: "#123456" } as unknown as IThemeConfigPreset);

    const { printDocument } = await printResults();

    expect(printDocument.head.firstElementChild?.tagName).toBe("STYLE");
    expect(printDocument.head.firstElementChild?.textContent).toContain("#123456");
  });

  it("keeps the other page styles in the print window", async () => {
    const style = document.createElement("style");
    style.id = "page-styles";
    document.head.append(style);

    expect((await printResults()).printDocument.getElementById("page-styles")).not.toBeNull();
  });

  it("never writes the theme variables as HTML, so a value cannot close the style element", async () => {
    writeThemeVariables({ color_primary_500: HOSTILE_VALUE } as unknown as IThemeConfigPreset);

    const { printDocument, writtenHtml } = await printResults();

    expect(writtenHtml).not.toContain("<script>");
    expect(writtenHtml).not.toContain("vc-theme-variables");
    expect(printDocument.querySelectorAll("script")).toHaveLength(0);
  });
});
