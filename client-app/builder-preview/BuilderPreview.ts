import Vue from "vue";

export default function(app: Vue.App): void {
  console.log("install buidler preview plugin");
  console.log(app);

  window.addEventListener("message", (event: MessageEvent) => {
    console.log("received message from template builder", event);
  });
}
