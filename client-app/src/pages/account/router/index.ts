import Vue from "vue";
import VueRouter from "vue-router";
import i18n from "@i18n";
import { accessDeniedUrl } from 'core/constants';
import Admin from '@account/views/account-admin/index.vue';
import AccountInfo from "@account/views/account-details/index.vue";

Vue.use(VueRouter);


const routes = [

  {
    path: "/admin",
    component: Admin,
    redirect: '/details',
    children: [
      {
        path: '/details',
        component: AccountInfo,
        meta: {
          title: i18n.t('account.menu_titles.details')
        }
      }
    ]
  },
  {
    path: "/",
    redirect: "/details"
  }
];

const router = new VueRouter({
  mode: "hash",
  base: window.location.pathname,
  routes
});

// eslint-disable-next-line
router.beforeEach((toRoute, fromRoute, next) => {
  window.document.title = toRoute.meta && toRoute.meta.title ?
    toRoute.meta.title : i18n.t('account.menu_titles.details');
  next();
})

export default router;
