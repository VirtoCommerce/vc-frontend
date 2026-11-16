import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { toReportingMonth } from "../reporting";
import ReportingTable from "./reporting-table.vue";
import type { ReportingMonthSlotType } from "../reporting";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, n: (value: number) => String(value), d: (date: Date) => date.toJSON() }),
}));

function slot(month: number, state: ReportingMonthSlotType["state"] = "closed"): ReportingMonthSlotType {
  return { year: 2026, month, state, from: "", to: "", lyFrom: "", lyTo: "", daysPassed: 15, daysInMonth: 30 };
}

const MONTHS = [
  toReportingMonth(slot(0), { totals: { amount: 1200, count: 3 }, lastYear: { amount: 1000, count: 2 } }),
  // Last year had no sales this month.
  toReportingMonth(slot(1), { totals: { amount: 800, count: 2 }, lastYear: { amount: 0, count: 0 } }),
  toReportingMonth(slot(2, "current"), { totals: { amount: 500, count: 1 } }),
  toReportingMonth(slot(3, "upcoming"), {}),
];

// Renders the rows the table is handed, one cell per field the specs read.
const VcTableStub = {
  props: ["items"],
  template: `<div>
    <div v-for="item in items" :key="item.id" class="row">
      <span class="last-year">{{ item.lastYear }}</span>
    </div>
  </div>`,
};

function mountTable() {
  return mount(ReportingTable, {
    props: { months: MONTHS, currencyCode: "USD" },
    global: { stubs: { VcTable: VcTableStub, VcTableColumn: true, VcPriceDisplay: true } },
  });
}

describe("ReportingTable", () => {
  it("lists the months that have started, and no upcoming one", () => {
    expect(mountTable().findAll(".row")).toHaveLength(3);
  });

  it("shows last year's sales as a dash where last year had none", () => {
    const lastYear = mountTable()
      .findAll(".last-year")
      .map((cell) => cell.text());

    expect(lastYear).toEqual(["1000", "—", "—"]);
  });
});
