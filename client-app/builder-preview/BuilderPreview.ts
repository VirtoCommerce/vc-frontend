import { App } from "vue";
import { useStaticPage } from "@/core/composables";

export default {
  install: (_app: App, options: any) => {
    const bodyEl = document.getElementsByTagName("body").item(0);
    if (bodyEl) {
      bodyEl.style.visibility = "hidden";
    }
    window.addEventListener("message", (event: MessageEvent) => {
      if (event.origin !== document.location.origin || event.data.source !== "builder") {
        // note: it can be cause of some problems. investigate it.
        return;
      }
      if (bodyEl) {
        bodyEl.style.visibility = "visible";
      }
      switch (event.data.type) {
        case "changed":
          useStaticPage(event.data.model.template);
          break;
        case "navigate":
          options.router.push(event.data.url);
          break;
      }
    });
    window.parent.postMessage({ source: "preview", type: "loaded" }, window.location.origin);
  },
};
