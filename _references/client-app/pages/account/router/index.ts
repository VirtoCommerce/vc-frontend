import Vue from "vue";
import VueRouter from "vue-router";
import MyAccount from '../views/MyAccount.vue';


Vue.use(VueRouter);

const routes = [
  {
    name: 'my-account',
    path: '/my-account/:pageName?',
    component: MyAccount,
    props: true
  },
  {
    path: "/",
    component: MyAccount
  }
];

const router = new VueRouter({
  //mode: "hash",
  mode: 'history',
  base: window.location.pathname,
  routes
});


export default router;
