import { isRef, ref, unref, watchEffect } from "vue";
import { MaybeRef } from "@vueuse/core";

const template = ref({
  settings: {
    name: "Custom page",
  },
  content: [
    {
      id: "block-2",
      name: "text",
      type: "text",
      header: "Header",
      text: "<p>Block content text</p>",
    },
    {
      id: "block-1",
      name: "Image",
      type: "image",
      image: "https://ik.imagekit.io/je8lpsqkoi/assets/pages/19_qRTyG7N7X6-2_j9uMkjajn9.png",
    },
  ],
});

export function useTemplate(url: MaybeRef<string>): any {
  function load() {
    const $url = unref(url);

    if ($url) {
      fetch($url)
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
