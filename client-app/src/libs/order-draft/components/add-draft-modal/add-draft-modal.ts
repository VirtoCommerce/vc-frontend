import Vue from "vue";
import Component from "vue-class-component";
import { Validation } from "vuelidate"; //Don't remove this import
import { required } from "vuelidate/lib/validators";
import { storeName, locale, orderDraftType, startPageNumber, defaultPageSize } from "core/constants";
import { listClient } from "core/services/api-clients.service";
import { CartSearchCriteria } from '@core/api/api-clients';

@Component({
  validations: {
    draftName: {
      required,
      async isUnique(value) {
        if (value === '') return true;
        const criteria = new CartSearchCriteria({type: orderDraftType, pageNumber: startPageNumber, pageSize: defaultPageSize, name: value});
        criteria.keyword = value;
        const result = await listClient.searchLists(criteria, storeName, locale);
        return result.totalCount == 0;
      }
    }
  }
})
export default class AddDraftModal extends Vue {
  draftName = "";

  public resetForm(): void {
    this.draftName = "";
    this.$nextTick(() => {
      this.$v.$reset();
    });
  }

  public submitForm(): void {
    this.$emit("draftAdded", this.draftName);
    this.$bvModal.hide("addDraftModal");
  }

}
