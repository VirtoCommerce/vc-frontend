import { computed, Ref, ref } from "vue";
import { ThemeContext } from "../types";

const themeContext: Ref<ThemeContext> = ref({});

export default () => {
  async function loadContext() {
    const response = await fetch("/storefrontapi/theme/context", {
      method: "GET",
      headers: {
        Accept: "text/plain",
      },
    });
    themeContext.value = await response.json();
  }
  return {
    loadContext,
    themeContext: computed(() => themeContext.value),
  };
};
