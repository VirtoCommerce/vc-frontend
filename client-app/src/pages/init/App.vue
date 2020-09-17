<template>
  <div>
    <error-info v-for="(error, index) in errors"
                :id="'error-'+index"
                :key="error.timestamp"
                :index="index"
                :error-info="error"
                @close="removeError(error)">
    </error-info>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ErrorInfo from "libs/error-handling/components/error-info.vue";
import { REMOVE_ERROR } from "@init-app/store/definitions";
import { ReactiveErrorInfo } from "@init-app/store/types";

@Component({
  name: "InitApp",
  components: {
    ErrorInfo
  }
})
export default class App extends Vue {

  get errors() {
    return this.$store.getters.errors;
  }

  removeError(error: ReactiveErrorInfo) {
    this.$store.dispatch(REMOVE_ERROR, error);
  }
}
</script>
