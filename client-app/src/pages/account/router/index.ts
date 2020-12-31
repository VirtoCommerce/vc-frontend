import Vue from "vue";
import VueRouter from "vue-router";
import MyAccount from '../views/MyAccount.vue';


Vue.use(VueRouter);

const routes = [
  {
    name: 'my-account',
    path: '/my-account/:pageName?',
    component: MyAccount
  },
  {
    path: "/",
    component: MyAccount
  }
];

const router = new VueRouter({
  mode: "hash",
  base: window.location.pathname,
  routes
});


export default router;
