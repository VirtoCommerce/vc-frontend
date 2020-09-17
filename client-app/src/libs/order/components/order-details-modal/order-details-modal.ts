import Vue from "vue";
import Component from "vue-class-component";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import OrderDetailsItem from "libs/order/components/order-details/order-details-item/index.vue";
import OrderDetailsTotals from "libs/order/components/order-details/order-details-totals/index.vue";

@Component({
  props: {
    order: Object,
    showDetails: Boolean,
    showOrderDetails: Boolean
  },
  components: {
    OrderDetailsItem,
    OrderDetailsTotals
  }
})
export default class OrderDetails extends Vue {
  faAngleUp = faAngleUp;
  faAngleDown = faAngleDown;


  onHide(){
    this.$emit("hide");
  }

}
