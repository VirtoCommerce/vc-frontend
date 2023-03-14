// Generated from client-app/core/utilities/search/search-phrase/SearchPhrase.g4 by ANTLR 4.12.0
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import SearchPhraseListener from "./SearchPhraseListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class SearchPhraseParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly FD = 2;
	public static readonly VD = 3;
	public static readonly RD = 4;
	public static readonly RangeStart = 5;
	public static readonly RangeEnd = 6;
	public static readonly String = 7;
	public static readonly WS = 8;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_searchPhrase = 0;
	public static readonly RULE_phrase = 1;
	public static readonly RULE_keyword = 2;
	public static readonly RULE_filters = 3;
	public static readonly RULE_attributeFilter = 4;
	public static readonly RULE_rangeFilter = 5;
	public static readonly RULE_fieldName = 6;
	public static readonly RULE_attributeFilterValue = 7;
	public static readonly RULE_rangeFilterValue = 8;
	public static readonly RULE_range = 9;
	public static readonly RULE_rangeStart = 10;
	public static readonly RULE_rangeEnd = 11;
	public static readonly RULE_lower = 12;
	public static readonly RULE_upper = 13;
	public static readonly RULE_string = 14;
	public static readonly RULE_negation = 15;
	public static readonly literalNames: (string | null)[] = [ null, "'!'", 
                                                            "':'", "','" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             "FD", "VD", 
                                                             "RD", "RangeStart", 
                                                             "RangeEnd", 
                                                             "String", "WS" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"searchPhrase", "phrase", "keyword", "filters", "attributeFilter", "rangeFilter", 
		"fieldName", "attributeFilterValue", "rangeFilterValue", "range", "rangeStart", 
		"rangeEnd", "lower", "upper", "string", "negation",
	];
	public get grammarFileName(): string { return "SearchPhrase.g4"; }
	public get literalNames(): (string | null)[] { return SearchPhraseParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return SearchPhraseParser.symbolicNames; }
	public get ruleNames(): string[] { return SearchPhraseParser.ruleNames; }
	public get serializedATN(): number[] { return SearchPhraseParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, SearchPhraseParser._ATN, SearchPhraseParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public searchPhrase(): SearchPhraseContext {
		let localctx: SearchPhraseContext = new SearchPhraseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, SearchPhraseParser.RULE_searchPhrase);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 35;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===8) {
				{
				{
				this.state = 32;
				this.match(SearchPhraseParser.WS);
				}
				}
				this.state = 37;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 38;
			this.phrase();
			this.state = 43;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 1, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 39;
					this.match(SearchPhraseParser.WS);
					this.state = 40;
					this.phrase();
					}
					}
				}
				this.state = 45;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 1, this._ctx);
			}
			this.state = 49;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===8) {
				{
				{
				this.state = 46;
				this.match(SearchPhraseParser.WS);
				}
				}
				this.state = 51;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public phrase(): PhraseContext {
		let localctx: PhraseContext = new PhraseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, SearchPhraseParser.RULE_phrase);
		try {
			this.state = 54;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 52;
				this.keyword();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 53;
				this.filters();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public keyword(): KeywordContext {
		let localctx: KeywordContext = new KeywordContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, SearchPhraseParser.RULE_keyword);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 56;
			this.match(SearchPhraseParser.String);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public filters(): FiltersContext {
		let localctx: FiltersContext = new FiltersContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, SearchPhraseParser.RULE_filters);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 59;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===1) {
				{
				this.state = 58;
				this.negation();
				}
			}

			this.state = 63;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				{
				this.state = 61;
				this.attributeFilter();
				}
				break;
			case 2:
				{
				this.state = 62;
				this.rangeFilter();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public attributeFilter(): AttributeFilterContext {
		let localctx: AttributeFilterContext = new AttributeFilterContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, SearchPhraseParser.RULE_attributeFilter);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 65;
			this.fieldName();
			this.state = 66;
			this.match(SearchPhraseParser.FD);
			this.state = 67;
			this.attributeFilterValue();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public rangeFilter(): RangeFilterContext {
		let localctx: RangeFilterContext = new RangeFilterContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, SearchPhraseParser.RULE_rangeFilter);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 69;
			this.fieldName();
			this.state = 70;
			this.match(SearchPhraseParser.FD);
			this.state = 71;
			this.rangeFilterValue();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public fieldName(): FieldNameContext {
		let localctx: FieldNameContext = new FieldNameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, SearchPhraseParser.RULE_fieldName);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 73;
			this.match(SearchPhraseParser.String);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public attributeFilterValue(): AttributeFilterValueContext {
		let localctx: AttributeFilterValueContext = new AttributeFilterValueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, SearchPhraseParser.RULE_attributeFilterValue);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 75;
			this.string_();
			this.state = 80;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===3) {
				{
				{
				this.state = 76;
				this.match(SearchPhraseParser.VD);
				this.state = 77;
				this.string_();
				}
				}
				this.state = 82;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public rangeFilterValue(): RangeFilterValueContext {
		let localctx: RangeFilterValueContext = new RangeFilterValueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, SearchPhraseParser.RULE_rangeFilterValue);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 83;
			this.range();
			this.state = 88;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===3) {
				{
				{
				this.state = 84;
				this.match(SearchPhraseParser.VD);
				this.state = 85;
				this.range();
				}
				}
				this.state = 90;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public range(): RangeContext {
		let localctx: RangeContext = new RangeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, SearchPhraseParser.RULE_range);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 91;
			this.rangeStart();
			this.state = 95;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 92;
					this.match(SearchPhraseParser.WS);
					}
					}
				}
				this.state = 97;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
			}
			this.state = 99;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===7) {
				{
				this.state = 98;
				this.lower();
				}
			}

			this.state = 104;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===8) {
				{
				{
				this.state = 101;
				this.match(SearchPhraseParser.WS);
				}
				}
				this.state = 106;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 107;
			this.match(SearchPhraseParser.RD);
			this.state = 111;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 11, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 108;
					this.match(SearchPhraseParser.WS);
					}
					}
				}
				this.state = 113;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 11, this._ctx);
			}
			this.state = 115;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===7) {
				{
				this.state = 114;
				this.upper();
				}
			}

			this.state = 120;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===8) {
				{
				{
				this.state = 117;
				this.match(SearchPhraseParser.WS);
				}
				}
				this.state = 122;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 123;
			this.rangeEnd();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public rangeStart(): RangeStartContext {
		let localctx: RangeStartContext = new RangeStartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, SearchPhraseParser.RULE_rangeStart);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 125;
			this.match(SearchPhraseParser.RangeStart);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public rangeEnd(): RangeEndContext {
		let localctx: RangeEndContext = new RangeEndContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, SearchPhraseParser.RULE_rangeEnd);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 127;
			this.match(SearchPhraseParser.RangeEnd);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public lower(): LowerContext {
		let localctx: LowerContext = new LowerContext(this, this._ctx, this.state);
		this.enterRule(localctx, 24, SearchPhraseParser.RULE_lower);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 129;
			this.match(SearchPhraseParser.String);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public upper(): UpperContext {
		let localctx: UpperContext = new UpperContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, SearchPhraseParser.RULE_upper);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 131;
			this.match(SearchPhraseParser.String);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public string_(): StringContext {
		let localctx: StringContext = new StringContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, SearchPhraseParser.RULE_string);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 133;
			this.match(SearchPhraseParser.String);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public negation(): NegationContext {
		let localctx: NegationContext = new NegationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, SearchPhraseParser.RULE_negation);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 135;
			this.match(SearchPhraseParser.T__0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public static readonly _serializedATN: number[] = [4,1,8,138,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,1,0,5,0,34,8,
	0,10,0,12,0,37,9,0,1,0,1,0,1,0,5,0,42,8,0,10,0,12,0,45,9,0,1,0,5,0,48,8,
	0,10,0,12,0,51,9,0,1,1,1,1,3,1,55,8,1,1,2,1,2,1,3,3,3,60,8,3,1,3,1,3,3,
	3,64,8,3,1,4,1,4,1,4,1,4,1,5,1,5,1,5,1,5,1,6,1,6,1,7,1,7,1,7,5,7,79,8,7,
	10,7,12,7,82,9,7,1,8,1,8,1,8,5,8,87,8,8,10,8,12,8,90,9,8,1,9,1,9,5,9,94,
	8,9,10,9,12,9,97,9,9,1,9,3,9,100,8,9,1,9,5,9,103,8,9,10,9,12,9,106,9,9,
	1,9,1,9,5,9,110,8,9,10,9,12,9,113,9,9,1,9,3,9,116,8,9,1,9,5,9,119,8,9,10,
	9,12,9,122,9,9,1,9,1,9,1,10,1,10,1,11,1,11,1,12,1,12,1,13,1,13,1,14,1,14,
	1,15,1,15,1,15,0,0,16,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,0,0,135,
	0,35,1,0,0,0,2,54,1,0,0,0,4,56,1,0,0,0,6,59,1,0,0,0,8,65,1,0,0,0,10,69,
	1,0,0,0,12,73,1,0,0,0,14,75,1,0,0,0,16,83,1,0,0,0,18,91,1,0,0,0,20,125,
	1,0,0,0,22,127,1,0,0,0,24,129,1,0,0,0,26,131,1,0,0,0,28,133,1,0,0,0,30,
	135,1,0,0,0,32,34,5,8,0,0,33,32,1,0,0,0,34,37,1,0,0,0,35,33,1,0,0,0,35,
	36,1,0,0,0,36,38,1,0,0,0,37,35,1,0,0,0,38,43,3,2,1,0,39,40,5,8,0,0,40,42,
	3,2,1,0,41,39,1,0,0,0,42,45,1,0,0,0,43,41,1,0,0,0,43,44,1,0,0,0,44,49,1,
	0,0,0,45,43,1,0,0,0,46,48,5,8,0,0,47,46,1,0,0,0,48,51,1,0,0,0,49,47,1,0,
	0,0,49,50,1,0,0,0,50,1,1,0,0,0,51,49,1,0,0,0,52,55,3,4,2,0,53,55,3,6,3,
	0,54,52,1,0,0,0,54,53,1,0,0,0,55,3,1,0,0,0,56,57,5,7,0,0,57,5,1,0,0,0,58,
	60,3,30,15,0,59,58,1,0,0,0,59,60,1,0,0,0,60,63,1,0,0,0,61,64,3,8,4,0,62,
	64,3,10,5,0,63,61,1,0,0,0,63,62,1,0,0,0,64,7,1,0,0,0,65,66,3,12,6,0,66,
	67,5,2,0,0,67,68,3,14,7,0,68,9,1,0,0,0,69,70,3,12,6,0,70,71,5,2,0,0,71,
	72,3,16,8,0,72,11,1,0,0,0,73,74,5,7,0,0,74,13,1,0,0,0,75,80,3,28,14,0,76,
	77,5,3,0,0,77,79,3,28,14,0,78,76,1,0,0,0,79,82,1,0,0,0,80,78,1,0,0,0,80,
	81,1,0,0,0,81,15,1,0,0,0,82,80,1,0,0,0,83,88,3,18,9,0,84,85,5,3,0,0,85,
	87,3,18,9,0,86,84,1,0,0,0,87,90,1,0,0,0,88,86,1,0,0,0,88,89,1,0,0,0,89,
	17,1,0,0,0,90,88,1,0,0,0,91,95,3,20,10,0,92,94,5,8,0,0,93,92,1,0,0,0,94,
	97,1,0,0,0,95,93,1,0,0,0,95,96,1,0,0,0,96,99,1,0,0,0,97,95,1,0,0,0,98,100,
	3,24,12,0,99,98,1,0,0,0,99,100,1,0,0,0,100,104,1,0,0,0,101,103,5,8,0,0,
	102,101,1,0,0,0,103,106,1,0,0,0,104,102,1,0,0,0,104,105,1,0,0,0,105,107,
	1,0,0,0,106,104,1,0,0,0,107,111,5,4,0,0,108,110,5,8,0,0,109,108,1,0,0,0,
	110,113,1,0,0,0,111,109,1,0,0,0,111,112,1,0,0,0,112,115,1,0,0,0,113,111,
	1,0,0,0,114,116,3,26,13,0,115,114,1,0,0,0,115,116,1,0,0,0,116,120,1,0,0,
	0,117,119,5,8,0,0,118,117,1,0,0,0,119,122,1,0,0,0,120,118,1,0,0,0,120,121,
	1,0,0,0,121,123,1,0,0,0,122,120,1,0,0,0,123,124,3,22,11,0,124,19,1,0,0,
	0,125,126,5,5,0,0,126,21,1,0,0,0,127,128,5,6,0,0,128,23,1,0,0,0,129,130,
	5,7,0,0,130,25,1,0,0,0,131,132,5,7,0,0,132,27,1,0,0,0,133,134,5,7,0,0,134,
	29,1,0,0,0,135,136,5,1,0,0,136,31,1,0,0,0,14,35,43,49,54,59,63,80,88,95,
	99,104,111,115,120];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!SearchPhraseParser.__ATN) {
			SearchPhraseParser.__ATN = new ATNDeserializer().deserialize(SearchPhraseParser._serializedATN);
		}

		return SearchPhraseParser.__ATN;
	}


	static DecisionsToDFA = SearchPhraseParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class SearchPhraseContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public phrase_list(): PhraseContext[] {
		return this.getTypedRuleContexts(PhraseContext) as PhraseContext[];
	}
	public phrase(i: number): PhraseContext {
		return this.getTypedRuleContext(PhraseContext, i) as PhraseContext;
	}
	public WS_list(): TerminalNode[] {
	    	return this.getTokens(SearchPhraseParser.WS);
	}
	public WS(i: number): TerminalNode {
		return this.getToken(SearchPhraseParser.WS, i);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_searchPhrase;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterSearchPhrase) {
	 		listener.enterSearchPhrase(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitSearchPhrase) {
	 		listener.exitSearchPhrase(this);
		}
	}
}


export class PhraseContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public keyword(): KeywordContext {
		return this.getTypedRuleContext(KeywordContext, 0) as KeywordContext;
	}
	public filters(): FiltersContext {
		return this.getTypedRuleContext(FiltersContext, 0) as FiltersContext;
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_phrase;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterPhrase) {
	 		listener.enterPhrase(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitPhrase) {
	 		listener.exitPhrase(this);
		}
	}
}


export class KeywordContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public String(): TerminalNode {
		return this.getToken(SearchPhraseParser.String, 0);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_keyword;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterKeyword) {
	 		listener.enterKeyword(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitKeyword) {
	 		listener.exitKeyword(this);
		}
	}
}


export class FiltersContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public attributeFilter(): AttributeFilterContext {
		return this.getTypedRuleContext(AttributeFilterContext, 0) as AttributeFilterContext;
	}
	public rangeFilter(): RangeFilterContext {
		return this.getTypedRuleContext(RangeFilterContext, 0) as RangeFilterContext;
	}
	public negation(): NegationContext {
		return this.getTypedRuleContext(NegationContext, 0) as NegationContext;
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_filters;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterFilters) {
	 		listener.enterFilters(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitFilters) {
	 		listener.exitFilters(this);
		}
	}
}


export class AttributeFilterContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public fieldName(): FieldNameContext {
		return this.getTypedRuleContext(FieldNameContext, 0) as FieldNameContext;
	}
	public FD(): TerminalNode {
		return this.getToken(SearchPhraseParser.FD, 0);
	}
	public attributeFilterValue(): AttributeFilterValueContext {
		return this.getTypedRuleContext(AttributeFilterValueContext, 0) as AttributeFilterValueContext;
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_attributeFilter;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterAttributeFilter) {
	 		listener.enterAttributeFilter(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitAttributeFilter) {
	 		listener.exitAttributeFilter(this);
		}
	}
}


export class RangeFilterContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public fieldName(): FieldNameContext {
		return this.getTypedRuleContext(FieldNameContext, 0) as FieldNameContext;
	}
	public FD(): TerminalNode {
		return this.getToken(SearchPhraseParser.FD, 0);
	}
	public rangeFilterValue(): RangeFilterValueContext {
		return this.getTypedRuleContext(RangeFilterValueContext, 0) as RangeFilterValueContext;
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_rangeFilter;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterRangeFilter) {
	 		listener.enterRangeFilter(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitRangeFilter) {
	 		listener.exitRangeFilter(this);
		}
	}
}


export class FieldNameContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public String(): TerminalNode {
		return this.getToken(SearchPhraseParser.String, 0);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_fieldName;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterFieldName) {
	 		listener.enterFieldName(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitFieldName) {
	 		listener.exitFieldName(this);
		}
	}
}


export class AttributeFilterValueContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public string__list(): StringContext[] {
		return this.getTypedRuleContexts(StringContext) as StringContext[];
	}
	public string_(i: number): StringContext {
		return this.getTypedRuleContext(StringContext, i) as StringContext;
	}
	public VD_list(): TerminalNode[] {
	    	return this.getTokens(SearchPhraseParser.VD);
	}
	public VD(i: number): TerminalNode {
		return this.getToken(SearchPhraseParser.VD, i);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_attributeFilterValue;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterAttributeFilterValue) {
	 		listener.enterAttributeFilterValue(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitAttributeFilterValue) {
	 		listener.exitAttributeFilterValue(this);
		}
	}
}


export class RangeFilterValueContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public range_list(): RangeContext[] {
		return this.getTypedRuleContexts(RangeContext) as RangeContext[];
	}
	public range(i: number): RangeContext {
		return this.getTypedRuleContext(RangeContext, i) as RangeContext;
	}
	public VD_list(): TerminalNode[] {
	    	return this.getTokens(SearchPhraseParser.VD);
	}
	public VD(i: number): TerminalNode {
		return this.getToken(SearchPhraseParser.VD, i);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_rangeFilterValue;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterRangeFilterValue) {
	 		listener.enterRangeFilterValue(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitRangeFilterValue) {
	 		listener.exitRangeFilterValue(this);
		}
	}
}


export class RangeContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public rangeStart(): RangeStartContext {
		return this.getTypedRuleContext(RangeStartContext, 0) as RangeStartContext;
	}
	public RD(): TerminalNode {
		return this.getToken(SearchPhraseParser.RD, 0);
	}
	public rangeEnd(): RangeEndContext {
		return this.getTypedRuleContext(RangeEndContext, 0) as RangeEndContext;
	}
	public WS_list(): TerminalNode[] {
	    	return this.getTokens(SearchPhraseParser.WS);
	}
	public WS(i: number): TerminalNode {
		return this.getToken(SearchPhraseParser.WS, i);
	}
	public lower(): LowerContext {
		return this.getTypedRuleContext(LowerContext, 0) as LowerContext;
	}
	public upper(): UpperContext {
		return this.getTypedRuleContext(UpperContext, 0) as UpperContext;
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_range;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterRange) {
	 		listener.enterRange(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitRange) {
	 		listener.exitRange(this);
		}
	}
}


export class RangeStartContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public RangeStart(): TerminalNode {
		return this.getToken(SearchPhraseParser.RangeStart, 0);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_rangeStart;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterRangeStart) {
	 		listener.enterRangeStart(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitRangeStart) {
	 		listener.exitRangeStart(this);
		}
	}
}


export class RangeEndContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public RangeEnd(): TerminalNode {
		return this.getToken(SearchPhraseParser.RangeEnd, 0);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_rangeEnd;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterRangeEnd) {
	 		listener.enterRangeEnd(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitRangeEnd) {
	 		listener.exitRangeEnd(this);
		}
	}
}


export class LowerContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public String(): TerminalNode {
		return this.getToken(SearchPhraseParser.String, 0);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_lower;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterLower) {
	 		listener.enterLower(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitLower) {
	 		listener.exitLower(this);
		}
	}
}


export class UpperContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public String(): TerminalNode {
		return this.getToken(SearchPhraseParser.String, 0);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_upper;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterUpper) {
	 		listener.enterUpper(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitUpper) {
	 		listener.exitUpper(this);
		}
	}
}


export class StringContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public String(): TerminalNode {
		return this.getToken(SearchPhraseParser.String, 0);
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_string;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterString) {
	 		listener.enterString(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitString) {
	 		listener.exitString(this);
		}
	}
}


export class NegationContext extends ParserRuleContext {
	constructor(parser?: SearchPhraseParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return SearchPhraseParser.RULE_negation;
	}
	public enterRule(listener: SearchPhraseListener): void {
	    if(listener.enterNegation) {
	 		listener.enterNegation(this);
		}
	}
	public exitRule(listener: SearchPhraseListener): void {
	    if(listener.exitNegation) {
	 		listener.exitNegation(this);
		}
	}
}
