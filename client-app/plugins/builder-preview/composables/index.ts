import { ref } from "vue";
import { useGetPreviewBuilderPage } from "@/core/api/graphql";
import { globals } from "@/core/globals";

export function usePreviewBuilderPage() {
  const loading = ref(false);
  const storeId = globals.storeId;

  async function loadPreviewPage(pageId: string) {
    loading.value = true;
    try {
      const { onResult, onError, load } = useGetPreviewBuilderPage({
        storeId,
        pageId,
      });
      onResult((result) => {
        loading.value = false;
        return result;
      });
      onError(() => {
        loading.value = false;
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
