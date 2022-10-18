import { App } from "vue";
import { Router } from "vue-router";
import { useStaticPage, useTemplate } from "@/shared/static-content";
import { useFetch } from "@/core/composables";

const { enrichRequest } = useFetch();

enrichRequest((headers: Headers) => {
  headers.append("x-template-builder", "preview-mode");
  return headers;
});

export default {
  install: (app: App, options: { router: Router }) => {
    const bodyEl = document.getElementsByTagName("body").item(0);

    if (bodyEl) {
      bodyEl.style.visibility = "hidden";
      bodyEl.style.position = "relative";
      const interactiveBlocker = document.createElement("div");
      interactiveBlocker.style.position = "absolute";
      interactiveBlocker.style.top = "0";
      interactiveBlocker.style.left = "0";
      interactiveBlocker.style.bottom = "0";
      interactiveBlocker.style.right = "0";
      bodyEl.appendChild(interactiveBlocker);
    }

    window.addEventListener("message", (event: MessageEvent) => {
      if (event.origin !== document.location.origin || event.data.source !== "builder") {
        // note: it can be cause of some problems. investigate it.
        console.log("cancel message");
        return;
      }

      if (bodyEl) {
        bodyEl.style.visibility = "visible";
      }

      switch (event.data.type) {
        case "changed":
          if (!event.data.model.templateKey) {
            useStaticPage(event.data.model.template);
          } else {
            useTemplate(event.data.model.templateKey, event.data.model.template);
          }
          break;

        case "navigate":
          options.router.push(event.data.url);
          break;

        case "settings": {
          const keys = Object.entries(event.data.settings);

          keys.forEach(([key, value]) => {
            app.config.globalProperties.$cfg[key] = value;
          });

          keys
            .filter(([key]) => /^color/.test(key))
            .forEach(([key, value]) => {
              document.documentElement.style.setProperty(`--${key.replace(/_/g, "-")}`, value as string);
            });

          break;
        }
      }
    });

    window.parent.postMessage({ source: "preview", type: "loaded" }, window.location.origin);
  },
};
