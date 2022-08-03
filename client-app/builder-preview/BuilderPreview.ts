import { App } from "vue";
import { useStaticPage } from "@/core/composables";

export default {
  install: (app: App, options: any) => {
    console.log("install buidler preview plugin");
    console.log(app);
    options.router.push("/");

    window.addEventListener("message", (event: MessageEvent) => {
      if (event.origin !== document.location.origin) {
        // note: it can be cause of some problems. investigate it.
        return;
      }
      if (event.data.source === "builder") {
        if (event.data.type === "changed") {
          useStaticPage(event.data.model.template);
        } else if (event.data.type === "navigate") {
          console.log("navigate to", event.data.url);
          options.router.push(event.data.url);
        }
      }
    });
  },
};
