import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ref } from "vue";
import AuthorizePage from "./authorize.vue";

const continuation = "/connect/authorize?client_id=claude&state=opaque%26state&code_challenge=pkce";
const query: { returnUrl: string | string[] | undefined } = { returnUrl: undefined };
const replace = vi.fn();
const navigate = vi.fn();
const error = ref<Error>();
const post = vi.fn(async () => ({ error }));
const fetch = vi.fn<(url: string, options: RequestInit) => { post: typeof post }>(() => ({ post }));

vi.mock("vue-router", () => ({
  useRoute: () => ({ query }),
  useRouter: () => ({ replace }),
}));
vi.mock("@/core/api/common", () => ({ useFetch: (url: string, options: RequestInit) => fetch(url, options) }));
vi.mock("@/core/utilities", async () => await import("@/core/utilities/same-origin"));

beforeEach(() => {
  vi.clearAllMocks();
  error.value = undefined;
  query.returnUrl = continuation;
  vi.stubGlobal("location", { origin: "https://shop.example", replace: navigate });
});

afterEach(() => vi.unstubAllGlobals());

async function openPage() {
  const wrapper = mount(AuthorizePage, { global: { stubs: { VcLoaderOverlay: true } } });
  await flushPromises();
  wrapper.unmount();
}

test("establishes the browser session before returning to the unchanged OAuth request", async () => {
  await openPage();
  expect(fetch).toHaveBeenCalledWith(`/connect/session?${new URLSearchParams({ returnUrl: continuation })}`, {
    headers: {},
  });
  expect(post).toHaveBeenCalledOnce();
  expect(navigate).toHaveBeenCalledWith(continuation);
  expect(replace).not.toHaveBeenCalled();
});

test.each([
  undefined,
  [continuation, continuation],
  "https://other.example/connect/authorize?state=x",
  "//other.example/connect/authorize?state=x",
  "/api/platform/security/users?state=x",
  "/connect/authorize?state=x#fragment",
])("rejects unsafe or ambiguous continuation %s", async (returnUrl) => {
  query.returnUrl = returnUrl;
  await openPage();
  expect(fetch).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
  expect(replace).toHaveBeenCalledWith("/400");
});

test("does not open consent when the session request fails", async () => {
  error.value = new Error("Unauthorized");
  await openPage();
  expect(navigate).not.toHaveBeenCalled();
  expect(replace).toHaveBeenCalledWith("/400");
});
