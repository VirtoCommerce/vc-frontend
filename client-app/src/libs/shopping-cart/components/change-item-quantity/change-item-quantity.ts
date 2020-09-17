import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Emit, Watch } from "vue-property-decorator";
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";


@Component({
  name: "ChangeItemQuantity"
})
export default class ChangeItemQuantity extends Vue {
  @Prop()
  quantity!: number;


  @Watch("quantity")
  watchQuantity(value: number) {
    this.model = value;
  }

  model = 0;

  plusIcon = faPlusCircle;

  minusIcon = faMinusCircle;

  mounted (){
    this.model = this.quantity;
  }

  public increment(): void {
    this.model++;
    this.onQuantityChanged(this.model);
  }

  public decrement(): void {
    if (this.model > 1) {
      this.model--;
      this.onQuantityChanged(this.model);
    }
  }

  public textChanged(value: string): void {
    const intValue = parseInt(value, 10)
    if( !isNaN(intValue) ) {
      this.model = intValue;
      this.onQuantityChanged(this.model);
    } else {
      this.$forceUpdate();
    }

  }

  public onQuantityChanged(value: number): void {
    this.$emit("quantity-changed", value);
  }
}
