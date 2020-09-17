import Vue from "vue";
import VueRouter from "vue-router";
import i18n from "@i18n";
import { accessDeniedUrl } from 'core/constants';
import Permissions from "libs/authorization/constants/permissions"
import FeatureNames from "libs/feature/constants/featureNames"
import Admin from '@account/views/account-admin/index.vue';
import AccountInfo from "@account/views/account-details/index.vue";
import AccountDrafts from '@account/views/account-drafts/index.vue';
import History from '@account/views/account-history/index.vue';
import AccountInvoices from '@account/views/account-invoices/index.vue';
import AccountOrders from "@account/views/account-orders/index.vue";
import AccountPayments from '@account/views/account-payments/index.vue';
import AccountUsers from "@account/views/account-users/index.vue";

Vue.use(VueRouter);

// eslint-disable-next-line
const isPermitted = (featureName: string, ...permissions: string[]) => {
  const authorizationResult = Vue.$can(...permissions);
  const isFeatureActiveResult = Vue.$isActive(featureName);
  return authorizationResult && isFeatureActiveResult;
}

const accessHandler = (permitted: boolean, next: any) => {
  if (permitted) {
    next();
  } else {
    window.location.assign(accessDeniedUrl);
  }
}

const routes = [
  {
    path: "/history",
    component: History,
    redirect: '/orders',
    children: [
      {
        path: '/orders',
        component: AccountOrders,
        meta: {
          title: i18n.t('account.menu_titles.orders')
        },
        // eslint-disable-next-line
        beforeEnter: (to: any, from: any, next: any) => {
          const permitted = isPermitted(FeatureNames.OrderBrowsing, Permissions.CanViewOrders)
          accessHandler(permitted, next);
        }
      },
      {
        path: '/invoices',
        component: AccountInvoices,
        meta: {
          title: i18n.t('account.menu_titles.invoices')
        },
        // eslint-disable-next-line
        beforeEnter: (to: any, from: any, next: any) => {
          const permitted = isPermitted(FeatureNames.InvoiceBrowsing, Permissions.CanViewOrders);
          accessHandler(permitted, next);
        }
      },
      {
        path: '/payments',
        component: AccountPayments,
        meta: {
          title: i18n.t('account.menu_titles.payments')
        },
        // eslint-disable-next-line
        beforeEnter: (to: any, from: any, next: any) => {
          const permitted = isPermitted(FeatureNames.PaymentBrowsing, Permissions.CanViewOrders);
          accessHandler(permitted, next);
        }
      },
      {
        path: "/drafts",
        component: AccountDrafts,
        meta: {
          title: i18n.t('account.menu_titles.drafts')
        }
      }
    ]
  },
  {
    path: "/admin",
    component: Admin,
    redirect: '/users',
    children: [
      {
        path: '/users',
        component: AccountUsers,
        meta: {
          title: i18n.t('account.menu_titles.users')
        },
        beforeEnter: (to: any, from: any, next: any) => {
          const permitted = isPermitted(FeatureNames.ManageUsers, Permissions.CanViewUsers);
          accessHandler(permitted, next);
        }
      },
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
