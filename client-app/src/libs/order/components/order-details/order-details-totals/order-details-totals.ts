import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { CustomerOrder } from "core/api/api-clients";

@Component
export default class OrderDetailsTotals extends Vue {
  @Prop()
  order!: CustomerOrder;

}
