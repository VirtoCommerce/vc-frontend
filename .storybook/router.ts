import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/some/link",
    name: "SomeLink",
    component: {
      template: `<div>Some Link Page</div>`,
    },
  },
  {
    path: "/catalog",
    name: "Catalog",
    component: {
      template: `<div>Catalog Page</div>`,
    },
  },
  {
    path: "/product/:id",
    name: "Product",
    component: {
      template: `<div>Product Page - ID: {{ $route.params.id }}</div>`,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: {
      template: `<div>404 - Page Not Found</div>`,
    },
  },
];

export function createStorybookRouter() {
  return createRouter({
    routes,
    history: createWebHistory(),
  });
}
