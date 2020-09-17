import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { IOrganizationContactsSearchCriteria } from 'core/api/api-clients';

@Component
export default class UsersFilter extends Vue {

  @Prop()
  searchCriteria!: IOrganizationContactsSearchCriteria;

  public emitChanges(searchCriteria: IOrganizationContactsSearchCriteria): void {
    this.$emit("searchCriteriaChanged", searchCriteria);
  }

  public changeKeyword(keyword: string): void {
    const searchCriteria = { ...this.searchCriteria, keyword };
    this.emitChanges(searchCriteria);
  }

}
