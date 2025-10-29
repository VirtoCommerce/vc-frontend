import { ref } from "vue";
import { searchProducts } from "@/core/api/graphql/catalog/queries/searchProducts";
import type { Product } from "@/core/api/graphql/types";

export function useRandomProduct() {
  const product = ref<Product | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    try {
      loading.value = true;
      error.value = null;
      product.value = null;

      // eslint-disable-next-line sonarjs/pseudo-random
      const randomPage = Math.floor(Math.random() * 100) + 1;
      const connection = await searchProducts({ itemsPerPage: 1, page: randomPage }, { withImages: true });
      product.value = connection.items?.[0] ?? null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  return { product, loading, error, load };
}
