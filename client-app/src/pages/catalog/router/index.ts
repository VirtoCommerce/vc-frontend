import Vue from "vue";
import VueRouter from "vue-router";
import i18n from "@i18n";
import { accessDeniedUrl } from 'core/constants';
import Category from '../views/Category.vue';
import Checkout from '../views/Checkout.vue';
import OrderReview from '../views/checkout/OrderReview.vue';
import Payment from '../views/checkout/Payment.vue';
import PersonalDetails from '../views/checkout/PersonalDetails.vue';
import Shipping from '../views/checkout/Shipping.vue';
import ThankYou from '../views/checkout/ThankYou.vue';


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
      },
      {
        path: 'thank-you',
        name: 'thank-you',
        component: ThankYou
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
