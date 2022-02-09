import Vue from "vue";

export default function install(app: Vue.App): void {
  console.log(app);

  window.addEventListener("message", (event: MessageEvent) => {
    console.log(event);
  });
}
