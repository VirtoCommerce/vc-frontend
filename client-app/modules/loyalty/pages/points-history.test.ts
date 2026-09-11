import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import PointsHistory from "./points-history.vue";
import type { LoyaltyOperationLog } from "../api/graphql/types";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    historyLogs: ref<LoyaltyOperationLog[]>([]),
  };
});

vi.mock("../composables/useLoyaltyPointsHistory", async () => {
  const { computed, ref } = await import("vue");
  return {
    useLoyaltyPointsHistory: () => ({
      fetchHistory: vi.fn(),
      sort: ref(undefined),
      loading: ref(false),
      historyLogs: computed(() => state.historyLogs.value),
      pages: ref(1),
      page: ref(1),
    }),
  };
});

vi.mock("../composables/useLoyaltyBalance", async () => {
  const { ref } = await import("vue");
  return {
    useLoyaltyBalance: () => ({
      fetchLoyaltyBalance: vi.fn(),
      loading: ref(false),
      currentBalance: ref(0),
    }),
  };
});

const createWrapper = createWrapperFactory(mount, PointsHistory, {
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcTypography: true,
      VcWidget: { template: '<div><slot name="default-container" /></div>' },
      // Rendered rather than stubbed away: the assertion is about the text the Operation cell carries,
      // and both the desktop row and the mobile card read it from the same getOperation() helper.
      VcTable: {
        props: ["items"],
        template:
          '<div><table><tbody class="desktop"><slot name="desktop-body" /></tbody></table>' +
          '<div class="mobile"><template v-for="item in items" :key="item.id">' +
          '<slot name="mobile-item" :item="item" /></template></div></div>',
      },
    },
  },
});

const log = (id: string, object?: LoyaltyOperationLog["object"]): LoyaltyOperationLog => ({
  id,
  amount: 10,
  createdDate: "2026-01-01T00:00:00Z",
  operationType: "Earned",
  object,
});

const desktopOperations = (wrapper: ReturnType<typeof createWrapper>) =>
  wrapper.findAll("tbody.desktop tr").map((row) => row.findAll("td")[0].text());

const mobileOperations = (wrapper: ReturnType<typeof createWrapper>) =>
  wrapper.findAll(".mobile > div").map((card) => card.findAll("span")[1].text());

beforeEach(() => {
  state.historyLogs.value = [];
});

// Mission-granted rows arrive with object.type "Mission" and no orderNumber. getOperation() had no
// branch for them, so the Operation cell fell through to the raw, unlocalized object type (VCST-5916).
describe("PointsHistory operation cell", () => {
  it("labels a mission-granted row with the localized mission reward text", () => {
    state.historyLogs.value = [log("1", { type: "Mission" })];

    expect(desktopOperations(createWrapper())).toEqual(["loyalty.points-history.mission"]);
  });

  it("labels the mission row on the mobile card too", () => {
    state.historyLogs.value = [log("1", { type: "Mission" })];

    expect(mobileOperations(createWrapper())).toEqual(["loyalty.points-history.mission"]);
  });

  it("keeps the order number for an order-driven row and the label for a registration row", () => {
    state.historyLogs.value = [
      log("1", { type: "CustomerOrder", orderNumber: "CO-TEST-1" }),
      log("2", { type: "Registration" }),
    ];

    expect(desktopOperations(createWrapper())).toEqual(["CO-TEST-1", "loyalty.points-history.registration"]);
  });

  it("leaves the cell empty when the row carries no object", () => {
    state.historyLogs.value = [log("1")];

    expect(desktopOperations(createWrapper())).toEqual([""]);
  });
});

type LocaleMessagesType = { loyalty?: { "points-history"?: Record<string, unknown> } };

const localesDir = path.join(process.cwd(), "client-app", "modules", "loyalty", "locales");

// Every other points-history label ships translated in all locales; an English-only addition would
// leak untranslated text into the table via the default-language fallback.
describe("PointsHistory mission label locales", () => {
  it("ships a mission label in every loyalty locale file", () => {
    const files = readdirSync(localesDir).filter((file) => /\.json$/.test(file));
    const untranslated: string[] = [];

    for (const file of files) {
      const messages = JSON.parse(readFileSync(path.join(localesDir, file), "utf8")) as LocaleMessagesType;
      const label = messages.loyalty?.["points-history"]?.mission;

      if (typeof label !== "string" || label.trim() === "") {
        untranslated.push(file);
      }
    }

    expect(files.length).toBeGreaterThan(1);
    expect(untranslated).toEqual([]);
  });
});
