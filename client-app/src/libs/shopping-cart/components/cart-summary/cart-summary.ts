import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { CartType } from "core/api/graphql/types";


@Component({
  name: "CartSummary"
})
export default class CartSummary extends Vue {

  @Prop()
  cart!: CartType;

}
