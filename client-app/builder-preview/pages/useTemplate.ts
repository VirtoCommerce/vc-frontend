import { isRef, ref, unref, watchEffect } from "vue";
import { MaybeRef } from "@vueuse/core";

const template = ref<Record<string, any>>({});

export function useTemplate(url: MaybeRef<string>) {
  function load() {
    const $url = unref(url);

    if ($url) {
      fetch("/storefrontapi/content/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permalink: $url }),
      })
        .then((response) => response.json())
        .then((result) => {
          template.value = result;
        });
    }
  }

  if (isRef(url)) {
    watchEffect(load);
  } else {
    load();
  }

  return { template };
}
