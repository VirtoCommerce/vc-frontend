import Vue from "vue";
import VueRouter from "vue-router";
import i18n from "@i18n";
import { accessDeniedUrl } from 'core/constants';
import Category from '@catalog/views/category/index.vue';


Vue.use(VueRouter);

const routes = [
  {
    path: "/c/:catId",
    component: Category,
    props: true
  },
  {
    path: "/",
    component: Category
  }
];

const router = new VueRouter({
  mode: "hash",
  base: window.location.pathname,
  routes
});


export default router;
