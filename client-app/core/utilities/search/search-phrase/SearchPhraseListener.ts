import { NotFilter, RangeBound, RangeFilter, RangeFilterValue, TermFilter } from "@/core/types";
import { SearchPhraseListenerBase } from "./generated";
import type {
  KeywordContext,
  FiltersContext,
  AttributeFilterContext,
  RangeContext,
  RangeFilterContext,
} from "./generated";
import type { Filter } from "@/core/types";

export class SearchPhraseListener extends SearchPhraseListenerBase {
  public keywords: string[] = [];

  public filters: Filter[] = [];

  exitKeyword = (context: KeywordContext): void => {
    this.keywords.push(this.unescape(context.getText()));
  };

  exitFilters = (context: FiltersContext): void => {
    const negation = context.negation();
    const attributeFilter = context.attributeFilter();
    const rangeFilter = context.rangeFilter();

    let filter: Filter | null = null;

    if (attributeFilter !== null) {
      filter = this.getTermFilter(attributeFilter);
    } else if (rangeFilter !== null) {
      filter = this.getRangeFilter(rangeFilter);
    }

    if (filter !== null) {
      if (negation !== null) {
        filter = new NotFilter(filter);
      }

      this.filters.push(filter);
    }
  };

  private getTermFilter(attributeFilter: AttributeFilterContext): TermFilter | null {
    const fieldName = attributeFilter.fieldName();
    const attributeValue = attributeFilter.attributeFilterValue();

    if (fieldName && attributeValue) {
      const values = attributeValue.string__list();
      return new TermFilter(
        this.unescape(fieldName.getText()),
        values.map((value) => this.unescape(value.getText()))
      );
    }

    return null;
  }

  private getRangeFilter(rangeFilter: RangeFilterContext): RangeFilter | null {
    const fieldName = rangeFilter.fieldName();
    const rangeFilterValue = rangeFilter.rangeFilterValue();

    let result: RangeFilter | null = null;

    if (fieldName && rangeFilterValue) {
      const values = rangeFilterValue.range_list();

      result = new RangeFilter(
        this.unescape(fieldName.getText()),
        values.map((value) => this.getRangeFilterValue(value)).filter(Boolean)
      );
    }

    return result;
  }

  private getRangeFilterValue(range: RangeContext): RangeFilterValue | null {
    const lowerText = range.lower().getText();
    const upperText = range.upper().getText();
    const includeLower = range.rangeStart().getText() === "[";
    const includeUpper = range.rangeEnd().getText() === "]";

    const lower = this.parseRangeBoundValue(lowerText);
    const upper = this.parseRangeBoundValue(upperText);

    const result: RangeFilterValue | null =
      lower || upper
        ? new RangeFilterValue(new RangeBound(includeLower, lower), new RangeBound(includeUpper, upper))
        : null;

    return result;
  }

  private parseRangeBoundValue(text: string): unknown | null {
    let result: unknown | null = null;

    result = Number.parseFloat(text);

    if (isNaN(result as number)) {
      result = Date.parse(text);

      if (!isNaN(result as number)) {
        result = new Date(result as number);
      }
    }

    return result;
  }

  private unescape(value: string): string {
    if (value) {
      return value
        .replace(/(?:^")|(?:"$)/, "")
        .replace("\\r", "\r")
        .replace("\\n", "\n")
        .replace("\\t", "\t")
        .replace("\\\\", "\\");
    }
    return value;
  }
}
