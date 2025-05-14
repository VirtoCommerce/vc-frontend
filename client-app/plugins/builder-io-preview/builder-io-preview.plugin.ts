import type { App } from "vue";
import type { Router } from "vue-router";
import VpPagesBuilderIo from "@/pages/matcher/virto-pages/vp-builder-io.vue";

// eslint-disable-next-line no-restricted-exports
export default {
  install: (app: App, options: { router: Router }) => {
    const routes = options.router.getRoutes();
    const matcher = routes.find((x) => x.name === "Matcher")!;
    matcher.meta.public = true;
    if (matcher.components) {
      matcher.components.default = VpPagesBuilderIo;
    }
  },
};
