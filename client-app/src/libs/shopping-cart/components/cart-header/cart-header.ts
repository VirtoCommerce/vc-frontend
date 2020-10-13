import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { CartType  } from '@core/api/graphql/types';


@Component({
  name: "CartHeader"
})
export default class CartHeader extends Vue {
  @Prop()
  cart!: CartType;

  @Prop()
  title!: string;

  public onClearCartClicked(): void {
    this.$emit("clear-cart-clicked");
  }
}
