<template>
  <b-toast :id="id"
           variant="danger"
           solid
           no-auto-hide
           toaster="b-toaster-top-center"
           @hidden="$emit('close')">
    <template v-slot:toast-title>
      <div class="d-flex flex-grow-1 align-items-center">
        <strong class="mr-auto">{{ $t("common.error.client.header") }}</strong>
        <small class="mr-2">{{ timeAgo }}</small>
      </div>
    </template>
    <div>
      {{ $t("common.error.client.description") }}
      <br>
      {{ $t("common.error.client.tip") }}
      <br>
      <b-button v-b-toggle="id + '-collapse'"
                variant="link"
                size="sm"
                class="toast-link mt-2 p-0">
        <font-awesome-icon v-if="!showDetails"
                           :icon="faCaretRight"
                           fixed-width></font-awesome-icon>
        <font-awesome-icon v-if="showDetails"
                           :icon="faCaretDown"
                           fixed-width></font-awesome-icon>
        &nbsp;{{ $t("common.error.client.details") }}
      </b-button>
      <b-collapse :id="id + '-collapse'"
                  v-model="showDetails">
        <!-- This code shouldn't be "properly" formatted and eslint will not automatically format it too, because of preformatted code tag -->
        <pre class="mt-2 mb-0"><code>{{ errorInfo.error && errorInfo.error.stack || $t("common.error.client.stack", [errorInfo.message, errorInfo.columnNumber, errorInfo.lineNumber, errorInfo.source]) }}</code></pre>
      </b-collapse>
    </div>
  </b-toast>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { Subscription } from "rxjs";
import { ReactiveErrorInfo } from "@init-app/store/types";

@Component({
  name: "ErrorInfo"
})
export default class ErrorInfo extends Vue {
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
</script>
