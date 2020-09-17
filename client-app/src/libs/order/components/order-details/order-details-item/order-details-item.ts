import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { OrderLineItem } from "core/api/api-clients";

@Component
export default class OrderDetailsItem extends Vue {
  @Prop()
  item!: OrderLineItem;
}
