import { render, cleanup, configure } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Lists from "./lists.vue";
import type { WishlistType } from "@/core/api/graphql/types";
import "@testing-library/jest-dom/vitest";

configure({ testIdAttribute: "data-test-id" });

// Everything a vi.mock factory reaches for must live in the hoisted block — the factories run before this module's
// own top-level bindings exist.
const mocks = await vi.hoisted(async () => {
  const { ref, defineComponent: define, h: createElement } = await import("vue");

  return {
    // Module-scoped in the real composable and shared with every caller, including the dialogs opened from here.
    lists: ref<WishlistType[]>([]),
    loading: ref(false),
    fetchWishlists: vi.fn(),
    Card: define({
      props: { list: { type: Object, required: true } },
      setup: (props) => () =>
        createElement("div", { "data-test-id": "wishlist-card", "data-list-id": (props.list as WishlistType).id }),
    }),
    Skeleton: define({ setup: () => () => createElement("div", { "data-test-id": "wishlist-card-skeleton" }) }),
    Empty: define({ setup: () => () => createElement("div") }),
  };
});

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock("@/core/composables", async () => {
  const { ref } = await import("vue");
  return { usePageHead: vi.fn(), useThemeContext: () => ({ themeContext: ref({ settings: {} }) }) };
});

vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: vi.fn() }) }));

vi.mock("@/shared/wishlists", () => ({
  useWishlists: () => ({ loading: mocks.loading, lists: mocks.lists, fetchWishlists: mocks.fetchWishlists }),
  AddOrUpdateWishlistModal: mocks.Empty,
  DeleteWishlistsModal: mocks.Empty,
  ShareWishlistModal: mocks.Empty,
  UnsuccessfulCreateWishlistModal: mocks.Empty,
  WishlistCard: mocks.Card,
  WishlistCardSkeleton: mocks.Skeleton,
}));

function wishlist(id: string): WishlistType {
  return { id, name: id } as WishlistType;
}

/** The real `fetchWishlists`: raises the shared flag, then replaces `lists` wholesale once the test settles it. */
function deferFetch(...ids: string[]) {
  let settle!: () => void;
  const finished = new Promise<void>((resolve) => {
    settle = () => {
      mocks.lists.value = ids.map(wishlist);
      mocks.loading.value = false;
      resolve();
    };
  });

  mocks.fetchWishlists.mockImplementation(() => {
    mocks.loading.value = true;
    return finished;
  });

  return async () => {
    settle();
    await nextTick();
    await nextTick();
  };
}

function renderPage() {
  return render(Lists, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { VcTypography: true, VcButton: true, VcEmptyView: true },
    },
  });
}

/** The page after its own fetch has landed. */
async function renderLoaded(...ids: string[]) {
  mocks.lists.value = ids.map(wishlist);
  mocks.fetchWishlists.mockResolvedValue(undefined);
  renderPage();
  await nextTick();
  await nextTick();
}

function skeletons() {
  return document.querySelectorAll("[data-test-id='wishlist-card-skeleton']");
}

function card(id: string) {
  return document.querySelector(`[data-test-id='wishlist-card'][data-list-id='${id}']`);
}

beforeEach(() => {
  mocks.lists.value = [];
  mocks.loading.value = false;
  mocks.fetchWishlists.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("the list card skeletons", () => {
  it("stand in while the lists are loaded for the first time", async () => {
    const finish = deferFetch("list-1");
    renderPage();
    await nextTick();

    expect(skeletons()).not.toHaveLength(0);

    await finish();

    expect(skeletons()).toHaveLength(0);
    expect(card("list-1")).toBeInTheDocument();
  });

  it("stand in again on a revisit, when last visit's lists are still in the shared state", async () => {
    mocks.lists.value = [wishlist("list-1")];
    const finish = deferFetch("list-1");

    renderPage();
    await nextTick();

    expect(skeletons()).not.toHaveLength(0);
    expect(card("list-1")).toBeNull();

    await finish();

    expect(skeletons()).toHaveLength(0);
  });

  it("keep away while a dialog's save refetches, so the card the dialog was opened from stays the same element", async () => {
    await renderLoaded("list-1", "list-2");

    const opener = card("list-1");
    expect(opener).toBeInTheDocument();

    // What saving from the Share or Rename dialog does: the refetch raises the shared flag behind the open dialog.
    // Swapping the cards out would detach the menu trigger the modal hands the focus back to once it closes.
    const finishRefetch = deferFetch("list-1", "list-2");
    void mocks.fetchWishlists();
    await nextTick();

    expect(skeletons()).toHaveLength(0);
    expect(card("list-1")).toBe(opener);

    await finishRefetch();

    expect(card("list-1")).toBe(opener);
  });

  it("stand in when another caller loads while there is no card to keep", async () => {
    await renderLoaded();

    // Creating the first list from the empty view: nothing on screen to preserve, so the page shows it is loading.
    mocks.loading.value = true;
    await nextTick();

    expect(skeletons()).not.toHaveLength(0);
  });
});
