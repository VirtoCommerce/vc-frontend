import { App } from "vue";
import { useTemplate } from "./pages/useTemplate";

export default {
  install: (app: App, options: any) => {
    console.log("install buidler preview plugin");
    console.log(app);
    options.router.push("/demo-page");

    window.addEventListener("message", (event: MessageEvent) => {
      if (event.data.source === "builder") {
        console.log("received message from template builder", event);
        if (event.data.type === "changed") {
          const { template } = useTemplate("");
          template.value = event.data.model.template;
        } else if (event.data.type === "navigate") {
          console.log("navigate to", event.data.url);
          options.router.push(event.data.url);
        }
      }
    });
  },
};
