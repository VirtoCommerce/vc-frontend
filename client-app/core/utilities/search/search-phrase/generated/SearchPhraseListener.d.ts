import antlr4 from "antlr4";
import SearchPhraseParser from "./SearchPhraseParser";

export default class SearchPhraseListener extends antlr4.tree.ParseTreeListener {
  enterSearchPhrase(context: SearchPhraseParser.SearchPhraseContext): void;
  exitSearchPhrase(context: SearchPhraseParser.SearchPhraseContext): void;
  enterPhrase(context: SearchPhraseParser.PhraseContext): void;
  exitPhrase(context: SearchPhraseParser.PhraseContext): void;
  enterKeyword(context: SearchPhraseParser.KeywordContext): void;
  exitKeyword(context: SearchPhraseParser.KeywordContext): void;
  enterFilters(context: SearchPhraseParser.FiltersContext): void;
  exitFilters(context: SearchPhraseParser.FiltersContext): void;
  enterAttributeFilter(context: SearchPhraseParser.AttributeFilterContext): void;
  exitAttributeFilter(context: SearchPhraseParser.AttributeFilterContext): void;
  enterRangeFilter(context: SearchPhraseParser.RangeFilterContext): void;
  exitRangeFilter(context: SearchPhraseParser.RangeFilterContext): void;
  enterFieldName(context: SearchPhraseParser.FieldNameContext): void;
  exitFieldName(context: SearchPhraseParser.FieldNameContext): void;
  enterAttributeFilterValue(context: SearchPhraseParser.AttributeFilterValueContext): void;
  exitAttributeFilterValue(context: SearchPhraseParser.AttributeFilterValueContext): void;
  enterRangeFilterValue(context: SearchPhraseParser.RangeFilterValueContext): void;
  exitRangeFilterValue(context: SearchPhraseParser.RangeFilterValueContext): void;
  enterRange(context: SearchPhraseParser.RangeContext): void;
  exitRange(context: SearchPhraseParser.RangeContext): void;
  enterRangeStart(context: SearchPhraseParser.RangeStartContext): void;
  exitRangeStart(context: SearchPhraseParser.RangeStartContext): void;
  enterRangeEnd(context: SearchPhraseParser.RangeEndContext): void;
  exitRangeEnd(context: SearchPhraseParser.RangeEndContext): void;
  enterLower(context: SearchPhraseParser.LowerContext): void;
  exitLower(context: SearchPhraseParser.LowerContext): void;
  enterUpper(context: SearchPhraseParser.UppperContext): void;
  exitUpper(context: SearchPhraseParser.UppperContext): void;
  enterString(context: SearchPhraseParser.StringContext): void;
  exitString(context: SearchPhraseParser.StringContext): void;
  enterNegation(context: SearchPhraseParser.NegationContext): void;
  exitNegation(context: SearchPhraseParser.NegationContext): void;
}
