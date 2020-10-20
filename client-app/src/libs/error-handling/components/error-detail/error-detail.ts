import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { Subscription } from "rxjs";
import { ReactiveErrorInfo } from "@libs/error-handling/store/types";

@Component({
  name: "ErrorDetail"
})
export default class ErrorDetail extends Vue {
  faCaretRight = faCaretRight;
  faCaretDown = faCaretDown;

  @Prop({ required: true })
  id!: string;

  @Prop()
  errorInfo!: ReactiveErrorInfo;

  timeAgo = "";
  timestampSubscription!: Subscription;

  showDetails = false;

  mounted() {
    this.$bvToast.show(this.id);
    this.timestampSubscription = this.errorInfo.timestamp$.subscribe(timestamp => {
      this.timeAgo = this.$moment(timestamp).fromNow();
    });
  }

  beforeDestroy() {
    this.timestampSubscription.unsubscribe();
  }
}
