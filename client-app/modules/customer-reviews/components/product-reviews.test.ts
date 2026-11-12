import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ProductReviews from "./product-reviews.vue";

const reviewsApi = vi.hoisted(() => ({
  fetchCustomerReviews: vi.fn(() => Promise.resolve()),
  canLeaveFeedback: vi.fn(() => Promise.resolve(true)),
  fetchImageUploadOptions: vi.fn(() => Promise.resolve()),
  isAuthenticated: { value: true },
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key, d: (value: unknown) => String(value) }) }));
vi.mock("@/shared/account", () => ({ useUser: () => ({ isAuthenticated: reviewsApi.isAuthenticated }) }));
vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: vi.fn() }) }));
vi.mock("@/shared/files", () => ({
  useFiles: () => ({
    files: ref([]),
    options: ref({}),
    uploadedFiles: ref([]),
    fetchOptions: reviewsApi.fetchImageUploadOptions,
    addFiles: vi.fn(),
    validateFiles: vi.fn(),
    uploadFiles: vi.fn(),
    removeFiles: vi.fn(),
  }),
}));
vi.mock("../useCustomerReviews", () => ({
  useCustomerReviews: () => ({
    fetching: ref(false),
    pagesCount: ref(0),
    pageNumber: ref(1),
    reviews: ref([]),
    canLeaveFeedback: reviewsApi.canLeaveFeedback,
    createCustomerReview: vi.fn(),
    fetchCustomerReviews: reviewsApi.fetchCustomerReviews,
  }),
}));

function mountReviews(productId: string) {
  return shallowMount(ProductReviews, {
    props: { productId },
    global: { mocks: { $t: (key: string) => key, $d: (value: unknown) => String(value) } },
  });
}

describe("ProductReviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reviewsApi.isAuthenticated.value = true;
  });

  it("loads the product's reviews and whether the visitor can leave one when it mounts", async () => {
    mountReviews("p1");
    await flushPromises();

    expect(reviewsApi.fetchCustomerReviews).toHaveBeenCalledWith(expect.objectContaining({ entityId: "p1", page: 1 }));
    expect(reviewsApi.canLeaveFeedback).toHaveBeenCalledWith("p1", "Product");
    expect(reviewsApi.fetchImageUploadOptions).toHaveBeenCalledOnce();
  });

  it("loads the reviews of another product from its first page", async () => {
    const wrapper = mountReviews("p1");
    await flushPromises();

    await wrapper.setProps({ productId: "p2" });
    await flushPromises();

    expect(reviewsApi.fetchCustomerReviews).toHaveBeenLastCalledWith(
      expect.objectContaining({ entityId: "p2", page: 1 }),
    );
  });

  it("does not ask whether an anonymous visitor can leave a review", async () => {
    reviewsApi.isAuthenticated.value = false;

    mountReviews("p1");
    await flushPromises();

    expect(reviewsApi.fetchCustomerReviews).toHaveBeenCalledOnce();
    expect(reviewsApi.canLeaveFeedback).not.toHaveBeenCalled();
  });
});
