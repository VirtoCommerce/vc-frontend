import antlr4 from "antlr4";

class SearchPhraseParser extends antlr4.Parser {
  static readonly EOF: antlr4.Token.EOF;
  static readonly T__0: 1;
  static readonly FD: 2;
  static readonly VD: 3;
  static readonly RD: 4;
  static readonly RangeStart: 5;
  static readonly RangeEnd: 6;
  static readonly String: 7;
  static readonly WS: 8;

  static readonly RULE_searchPhrase: 0;
  static readonly RULE_phrase: 1;
  static readonly RULE_keyword: 2;
  static readonly RULE_filters: 3;
  static readonly RULE_attributeFilter: 4;
  static readonly RULE_rangeFilter: 5;
  static readonly RULE_fieldName: 6;
  static readonly RULE_attributeFilterValue: 7;
  static readonly RULE_rangeFilterValue: 8;
  static readonly RULE_range: 9;
  static readonly RULE_rangeStart: 10;
  static readonly RULE_rangeEnd: 11;
  static readonly RULE_lower: 12;
  static readonly RULE_upper: 13;
  static readonly RULE_string: 14;
  static readonly RULE_negation: 15;

  static grammarFileName: string;
  static literalNames: string[];
  static symbolicNames: string[];
  static ruleNames: string[];

  _interp: antlr4.ParserATNSimulator;
  literalNames: string[];
  symbolicNames: string[];
  ruleNames: string[];

  get atn(): antlr4.ATN;

  constructor(input: antlr4.CommonTokenStream);

  searchPhrase(): SearchPhraseParser.SearchPhraseContext;
  phrase(): SearchPhraseParser.PhraseContext;
  keyword(): SearchPhraseParser.KeywordContext;
  filters(): SearchPhraseParser.FiltersContext;
  attributeFilter(): SearchPhraseParser.AttributeFilterContext;
  rangeFilter(): SearchPhraseParser.RangeFilterContext;
  fieldName(): FieldNameContext;
  attributeFilterValue(): AttributeFilterValueContext;
  rangeFilterValue(): RangeFilterValueContext;
  range(): RangeContext;
  rangeStart(): RangeStartContext;
  rangeEnd(): RangeEndContext;
  lower(): LowerContext;
  upper(): UppperContext;
  string(): StringContext;
  negation(): NegationContext;
}

declare namespace SearchPhraseParser {
  class SearchPhraseContext extends antlr4.ParserRuleContext {
    constructor(parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    phrase(): PhraseContext[];
    phrase(i: number): PhraseContext;
    WS(): antlr4.Token[];
    WS(i: number): antlr4.Token;
  }

  class PhraseContext extends antlr4.ParserRuleContext {
    constructor(parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    keyword(): KeywordContext;
    filters(): FiltersContext;
  }

  class KeywordContext extends antlr4.ParserRuleContext {
    constructor(parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    String(): antlr4.Token;
  }

  class FiltersContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    attributeFilter(): AttributeFilterContext;
    rangeFilter(): RangeFilterContext;
    negation(): NegationContext;
  }

  class AttributeFilterContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    fieldName(): FieldNameContext;
    FD(): antlr4.Token;
    attributeFilterValue(): AttributeFilterValueContext;
  }

  class RangeFilterContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    fieldName(): FieldNameContext;
    FD(): antlr4.Token;
    rangeFilterValue(): RangeFilterValueContext;
  }

  class FieldNameContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    String(): antlr4.Token;
  }

  class AttributeFilterValueContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    string(): StringContext[];
    string(i: number): StringContext;
    VD(): antlr4.Token[];
    VD(i: number): antlr4.Token;
  }

  class RangeFilterValueContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    range(): RangeContext[];
    range(i: number): RangeContext;
    VD(): antlr4.Token[];
    VD(i: number): antlr4.Token;
  }

  class RangeContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    rangeStart(): RangeStartContext;
    RD(): antlr4.Token;
    rangeEnd(): RangeEndContext;
    WS(): antlr4.Token[];
    WS(i: number): antlr4.Token;
    lower(): LowerContext;
    upper(): UpperContext;
  }

  class RangeStartContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    RangeStart(): antlr4.Token;
  }

  class RangeEndContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    RangeEnd(): antlr4.Token;
  }

  class LowerContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    String(): antlr4.Token;
  }

  class UpperContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    String(): antlr4.Token;
  }

  class StringContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);

    String(): antlr4.Token;
  }

  class NegationContext extends antlr4.ParserRuleContext {
    constructor(public parser: SearchPhraseParser, parent?: antlr4.RuleContext, invokingState?: number);
  }
}

export default SearchPhraseParser;
