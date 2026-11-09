import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { createI18n } from "vue-i18n";
import { useReportingFormatters } from "./useReportingFormatters";

function formatters(): ReturnType<typeof useReportingFormatters> {
  let result: ReturnType<typeof useReportingFormatters> | undefined;
  const Host = defineComponent({
    setup() {
      result = useReportingFormatters();
      return () => null;
    },
  });
  mount(Host, { global: { plugins: [createI18n({ legacy: false, locale: "en-US" })] } });
  return result!;
}

describe("useReportingFormatters", () => {
  it("prints every percent with one decimal", () => {
    const { share, change, signedChange } = formatters();

    expect(share(0.71)).toBe("71.0%");
    expect(change(5.5)).toBe("↑ 5.5%");
    expect(change(-4.44)).toBe("↓ 4.4%");
    expect(signedChange(23)).toBe("+23.0%");
  });

  it("prints a change that rounds to zero without an arrow or a sign", () => {
    const { change, signedChange } = formatters();

    expect(change(0.03)).toBe("0.0%");
    expect(change(-0.03)).toBe("0.0%");
    expect(signedChange(0)).toBe("0.0%");
  });

  it("prints a missing amount as a dash", () => {
    expect(formatters().money(null, "USD")).toBe("—");
  });
});
