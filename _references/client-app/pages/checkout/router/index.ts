import Vue from "vue";
import VueRouter from "vue-router";
import Checkout from '../views/Checkout.vue';
import OrderReview from '../views/OrderReview.vue';
import Payment from '../views/Payment.vue';
import PersonalDetails from '../views/PersonalDetails.vue';
import Shipping from '../views/Shipping.vue';
import ThankYou from '../views/ThankYou.vue';


Vue.use(VueRouter);

const routes = [
  {
    name: "checkout",
    path: "/",
    redirect: '/personal-details',
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
  }
];

const router = new VueRouter({
  //mode: "hash",
  mode: 'history',
  base: window.location.pathname,
  routes
});


export default router;
