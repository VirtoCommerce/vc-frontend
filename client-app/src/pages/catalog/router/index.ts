import Vue from "vue";
import VueRouter from "vue-router";
import i18n from "@i18n";
import OrderReview from '@libs/checkout/components/OrderReview.vue';
import Payment from '@libs/checkout/components/Payment.vue';
import PersonalDetails from '@libs/checkout/components/PersonalDetails.vue';
import Shipping from '@libs/checkout/components/Shipping.vue';
import { accessDeniedUrl } from 'core/constants';
import Category from '@catalog/views/Category.vue';
import Checkout from '@catalog/views/Checkout.vue';


Vue.use(VueRouter);

const routes = [
  {
    name: "checkout",
    path: "/checkout",
    component: Checkout,
    children: [
      {
        name: "personal-details",
        path: "personal-details",
        component: PersonalDetails
      },
      {
        name: "shipping",
        path: "shipping",
        component: Shipping
      },
      {
        name: "payment",
        path: "payment",
        component: Payment
      },
      {
        name: "order-review",
        path: "order-review",
        component: OrderReview
      }
    ]
  },
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
