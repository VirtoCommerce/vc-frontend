import { render, cleanup, configure } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import ListDetails from "./list-details.vue";
import type { LineItemType, WishlistType } from "@/core/api/graphql/types";
import "@testing-library/jest-dom/vitest";

configure({ testIdAttribute: "data-test-id" });

// Everything a vi.mock factory reaches for must live in the hoisted block — the factories run before this module's
// own top-level bindings exist.
const mocks = await vi.hoisted(async () => {
  const { ref, defineComponent: define, h: createElement } = await import("vue");

  const stub = (testId: string) => define({ setup: () => () => createElement("div", { "data-test-id": testId }) });

  return {
    // `list` and `listLoading` are module-scoped in the real composable: they outlive the page and are shared with
    // every other caller. That is the whole point of these tests, so the doubles are shared the same way.
    list: ref<WishlistType | undefined>(undefined),
    listLoading: ref(false),
    fetchWishList: vi.fn(),
    updateItemsInWishlist: vi.fn(),
    cart: ref(undefined),
    isCorporateMember: ref(false),
    Skeleton: stub("products-skeleton"),
    LineItems: stub("line-items"),
    Empty: define({ setup: () => () => createElement("div") }),
  };
});

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn(),
}));

vi.mock("@vueuse/core", async () => {
  const { ref } = await import("vue");
  return { breakpointsTailwind: {}, useBreakpoints: () => ({ smaller: () => ref(false) }) };
});

vi.mock("@/core/composables", () => ({
  useAnalytics: () => ({ analytics: vi.fn() }),
  useHistoricalEvents: () => ({ pushHistoricalEvent: vi.fn() }),
  usePageHead: vi.fn(),
}));

vi.mock("@/core/composables/useAnalyticsUtils", () => ({
  useAnalyticsUtils: () => ({ trackAddItemToCart: vi.fn(), trackAddItemsToCart: vi.fn() }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getModuleSettings: () => ({ continue_shopping_link: "" }) }),
}));

vi.mock("@/core/utilities", () => ({
  prepareLineItem: (item: LineItemType) => ({ ...item }),
  Logger: { error: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/shared/account/composables", () => ({ useUser: () => ({ isCorporateMember: mocks.isCorporateMember }) }));

vi.mock("@/shared/broadcast", () => ({ dataChangedEvent: "dataChanged", useBroadcast: () => ({ emit: vi.fn() }) }));

vi.mock("@/shared/cart", () => ({
  useShortCart: () => ({
    loading: mocks.listLoading,
    changing: mocks.listLoading,
    cart: mocks.cart,
    addItemsToCart: vi.fn(),
    addToCart: vi.fn(),
    changeItemQuantity: vi.fn(),
    createCartFromWishlist: vi.fn(),
    createCartFromWishlistLoading: mocks.isCorporateMember,
  }),
  getItemsForAddBulkItemsToCartResultsModal: vi.fn(),
}));

vi.mock("@/shared/common", () => ({ SaveChangesModal: mocks.Empty }));
vi.mock("@/shared/layout", () => ({ BackButtonInHeader: mocks.Empty }));
vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: vi.fn() }) }));

vi.mock("@/shared/wishlists", () => ({
  useWishlists: () => ({
    listLoading: mocks.listLoading,
    list: mocks.list,
    fetchWishList: mocks.fetchWishList,
    updateItemsInWishlist: mocks.updateItemsInWishlist,
  }),
  AddOrUpdateWishlistModal: mocks.Empty,
  DeleteWishlistProductModal: mocks.Empty,
  ShareWishlistModal: mocks.Empty,
  WishlistLineItems: mocks.LineItems,
  WishlistProductsSkeleton: mocks.Skeleton,
}));

function wishlist(id: string): WishlistType {
  return {
    id,
    name: "Spring assortment",
    items: [{ id: "li-1", productId: "prod-1", sku: "SKU-1", quantity: 1, product: { id: "prod-1" } }],
    sharingSetting: { id: `sharing-${id}`, scope: "Private", isOwner: true },
  } as unknown as WishlistType;
}

/** A fetch the test decides when to finish, so the in-flight frame can be asserted on. */
function deferFetch(listId: string) {
  let settle!: () => void;
  const finished = new Promise<void>((resolve) => {
    settle = () => {
      mocks.list.value = wishlist(listId);
      mocks.listLoading.value = false;
      resolve();
    };
  });

  mocks.fetchWishList.mockImplementation(() => {
    mocks.listLoading.value = true;
    return finished;
  });

  return async () => {
    settle();
    await nextTick();
    await nextTick();
  };
}

function renderPage(listId = "list-1") {
  return render(ListDetails, {
    props: { listId },
    global: {
      mocks: { $t: (key: string) => key, $router: { back: vi.fn() } },
      stubs: {
        VcLoaderOverlay: true,
        VcTypography: { template: "<div><slot /></div>" },
        VcWidget: { template: "<div><slot /></div>" },
        VcButton: true,
        VcPagination: true,
        VcEmptyView: true,
      },
    },
  });
}

function skeleton() {
  return document.querySelector("[data-test-id='products-skeleton']");
}

beforeEach(() => {
  mocks.list.value = undefined;
  mocks.listLoading.value = false;
  mocks.fetchWishList.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe("the products skeleton", () => {
  it("stands in while the list is being loaded for the first time", async () => {
    const finish = deferFetch("list-1");
    renderPage();
    await nextTick();

    expect(skeleton()).toBeInTheDocument();

    await finish();

    expect(skeleton()).toBeNull();
    expect(document.querySelector("[data-test-id='line-items']")).toBeInTheDocument();
  });

  it("stands in again on a revisit, when last visit's list is still in the shared state", async () => {
    // `list` survives navigation, so the ids match from the first render — but this page's own item buffer is
    // empty until the fetch lands, and without the skeleton the widget frame stands there with no rows in it.
    mocks.list.value = wishlist("list-1");
    const finish = deferFetch("list-1");

    renderPage();
    await nextTick();

    expect(skeleton()).toBeInTheDocument();

    await finish();

    expect(skeleton()).toBeNull();
  });

  it("stays away while another caller raises the shared loading flag", async () => {
    mocks.list.value = wishlist("list-1");
    renderPage();
    await nextTick();
    await nextTick();

    // What saving from the Rename or Share dialog does: `listLoading` belongs to every `useWishlists` caller, and
    // reacting to it here would swap the whole table for a skeleton behind the open dialog.
    mocks.listLoading.value = true;
    await nextTick();

    expect(skeleton()).toBeNull();
    expect(document.querySelector("[data-test-id='line-items']")).toBeInTheDocument();
  });
});
