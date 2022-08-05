import { App } from "vue";
import { useStaticPage } from "@/core/composables";

export default {
  install: (_app: App, options: any) => {
    console.log("install buidler preview plugin");
    const bodyEl = document.getElementsByTagName("body").item(0);
    if (bodyEl) {
      bodyEl.style.visibility = "hidden";
    }

    window.addEventListener("message", (event: MessageEvent) => {
      if (event.data.source === "builder") {
        if (bodyEl) {
          bodyEl.style.visibility = "visible";
        }
        if (event.data.type === "changed") {
          useStaticPage(event.data.model.template);
        } else if (event.data.type === "navigate") {
          if (event.data.url !== options.router.currentRoute.fullPath) {
            console.log("navigate to", event.data.url);
            options.router.push(event.data.url);
          }
        }
      }
    });

    window.parent.postMessage({ source: "preview", type: "loaded" }, window.location.origin);

    // todo: add ability to send messages when something occurs in storefront, for example react to navigate event
  },
};
