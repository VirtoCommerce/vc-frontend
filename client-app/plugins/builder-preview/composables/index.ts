import { ref } from "vue";
import { useGetPreviewBuilderPage } from "@/core/api/graphql";
import { globals } from "@/core/globals";

export function usePreviewBuilderPage() {
  const loading = ref(false);
  const storeId = globals.storeId;

  async function loadPreviewPage(pageId: string) {
    loading.value = true;
    try {
      const { load } = useGetPreviewBuilderPage({
        storeId,
        pageId,
      });
      return await load();
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    loadPreviewPage,
  };
}
