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
          // const source = template.value;
          // const index = source.content.findIndex((x: any) => x.id === event.data.model.id);
          // if (index !== -1) {
          //   const section = source.content[index];
          //   const newSection = { ...section, ...event.data.model };
          //   template.value = {
          //     ...source,
          //     content: [...source.content.slice(0, index), newSection, ...source.content.slice(index + 1)],
          //   };
          // }
        } else if (event.data.type === "navigate") {
          console.log("navigate to", event.data.url);
          options.router.push(event.data.url);
        }
      }
    });
  },
};
