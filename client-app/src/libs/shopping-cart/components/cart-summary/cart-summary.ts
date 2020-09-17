import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { ShoppingCart } from 'core/api/api-clients';


@Component({
  name: "CartSummary"
})
export default class CartSummary extends Vue {

  @Prop()
  cart!: ShoppingCart;

}
