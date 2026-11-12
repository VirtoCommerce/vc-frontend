import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguages } from "@/core/composables/useLanguages";
import { useStaticPage } from "./useStaticPage";
import type { IPageTemplate } from "../types";

vi.mock("@/core/composables/useLanguages", async () => {
  const { ref } = await import("vue");
  const currentLanguage = ref({ cultureName: "de-DE" });
  const defaultStoreCulture = ref("en-US");
  return { useLanguages: () => ({ currentLanguage, defaultStoreCulture }) };
});

function setLanguage(cultureName: string): void {
  (useLanguages().currentLanguage as unknown as { value: { cultureName: string } }).value = { cultureName };
}

function page(title: unknown): IPageTemplate {
  return {
    settings: { id: "settings", type: "settings", header: "Willkommen" },
    content: [{ id: "s1", type: "slider", title, slides: [{ title, url: "/sale" }] }],
  };
}

describe("useStaticPage", () => {
  beforeEach(() => {
    setLanguage("de-DE");
    useStaticPage().staticPage.value = undefined;
    useStaticPage().staticPagePreview.value = undefined;
  });

  it("shows a page's plain texts as they are", () => {
    useStaticPage().staticPage.value = page("Angebote");

    expect(useStaticPage().staticPage.value).toEqual(page("Angebote"));
  });

  it("shows a text per language copied from a template in the current language", () => {
    useStaticPage().staticPage.value = page({ "en-US": "Sale", "de-DE": "Angebote" });

    expect(useStaticPage().staticPage.value).toEqual(page("Angebote"));
  });

  it("shows a previewed page's text per language in the current language", () => {
    setLanguage("fr-FR");
    useStaticPage().staticPagePreview.value = page({ "en-US": "Sale", "de-DE": "Angebote" });

    expect(useStaticPage().staticPage.value).toEqual(page("Sale"));
  });
});
