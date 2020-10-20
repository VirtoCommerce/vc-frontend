import Vue from "vue";
import Component from "vue-class-component";
import { namespace } from "vuex-class";
import ErrorDetail from "@libs/error-handling/components/error-detail/index.vue";
import { ADD_ERROR, REMOVE_ERROR } from "@libs/error-handling/store/definitions";
import { ErrorInfo, ReactiveErrorInfo } from "@libs/error-handling/store/types";

const errorHandlingModule = namespace("errorHandling");


@Component({
  name: "error-popup",
  components: {
    ErrorDetail
  }
})
export default class ErrorPopup extends Vue {

  constructor() {
    super();
    Vue.config.errorHandler = (err, _vm, info) => {
      this.addError(new ErrorInfo(info, undefined, undefined, undefined, err));
    };
  }

  @errorHandlingModule.Getter("errors")
  errors!: ReactiveErrorInfo[];

  @errorHandlingModule.Action(ADD_ERROR)
  addError!: (payload: ErrorInfo) => void;

  @errorHandlingModule.Action(REMOVE_ERROR)
  removeError!: () => void;

}
