import Vue from "vue";
import Component from "vue-class-component";
import { LocaleMessages } from "vue-i18n";
import { Prop } from "vue-property-decorator";
import i18n from "@i18n";
import { IPaymentSearchCriteria } from 'core/api/api-clients';
import { locale } from "core/constants";

@Component
export default class PaymentsFilter extends Vue {
  @Prop()
  searchCriteria!: IPaymentSearchCriteria;

  isDateValid: boolean | null = null;

  datepickerLabels: LocaleMessages | {} = {};

  locale = locale;

  mounted() {
    this.setDatepickerLocalization();
  }

  public emitChanges(searchCriteria: IPaymentSearchCriteria): void {
    this.$emit("searchCriteriaChanged", searchCriteria);
  }

  public dateChanged(startDate?: Date | null, endDate?: Date | null): void {
    if (startDate && endDate) {
      this.isDateValid = startDate <= endDate;
      if (this.isDateValid) {
        const searchCriteria = { ...this.searchCriteria, startDate, endDate };
        this.emitChanges(searchCriteria);
      }
    } else {
      this.isDateValid = endDate != null || startDate != null || null;
      const searchCriteria = {
        ...this.searchCriteria,
        startDate,
        endDate
      };
      this.emitChanges(searchCriteria);
    }
  }

  public changeStartDate(date?: Date): void {
    if (this.searchCriteria.startDate?.getTime() !== date?.getTime()){
      this.dateChanged(date, this.searchCriteria.endDate);
    }
  }

  public changeEndDate(date?: Date): void {
    if (this.searchCriteria.endDate?.getTime() !== this.prepareEndDate(date)?.getTime()) {
      this.dateChanged(this.searchCriteria.startDate, this.prepareEndDate(date));
    }
  }

  private setDatepickerLocalization(): void {
    this.datepickerLabels = i18n.te("account.payments.datepicker") ? i18n.t("account.payments.datepicker") : {};
  }

  private prepareEndDate(endDate?: Date): Date | undefined {
    return endDate != null ? this.$moment(endDate).add(1, "days").subtract(1, "seconds").toDate() : endDate;
  }
}
