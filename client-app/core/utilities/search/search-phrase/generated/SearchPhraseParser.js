// Generated from java-escape by ANTLR 4.11.1
// jshint ignore: start
import antlr4 from 'antlr4';
import SearchPhraseListener from './SearchPhraseListener.js';
const serializedATN = [4,1,8,138,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,
2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,
13,7,13,2,14,7,14,2,15,7,15,1,0,5,0,34,8,0,10,0,12,0,37,9,0,1,0,1,0,1,0,
5,0,42,8,0,10,0,12,0,45,9,0,1,0,5,0,48,8,0,10,0,12,0,51,9,0,1,1,1,1,3,1,
55,8,1,1,2,1,2,1,3,3,3,60,8,3,1,3,1,3,3,3,64,8,3,1,4,1,4,1,4,1,4,1,5,1,5,
1,5,1,5,1,6,1,6,1,7,1,7,1,7,5,7,79,8,7,10,7,12,7,82,9,7,1,8,1,8,1,8,5,8,
87,8,8,10,8,12,8,90,9,8,1,9,1,9,5,9,94,8,9,10,9,12,9,97,9,9,1,9,3,9,100,
8,9,1,9,5,9,103,8,9,10,9,12,9,106,9,9,1,9,1,9,5,9,110,8,9,10,9,12,9,113,
9,9,1,9,3,9,116,8,9,1,9,5,9,119,8,9,10,9,12,9,122,9,9,1,9,1,9,1,10,1,10,
1,11,1,11,1,12,1,12,1,13,1,13,1,14,1,14,1,15,1,15,1,15,0,0,16,0,2,4,6,8,
10,12,14,16,18,20,22,24,26,28,30,0,0,135,0,35,1,0,0,0,2,54,1,0,0,0,4,56,
1,0,0,0,6,59,1,0,0,0,8,65,1,0,0,0,10,69,1,0,0,0,12,73,1,0,0,0,14,75,1,0,
0,0,16,83,1,0,0,0,18,91,1,0,0,0,20,125,1,0,0,0,22,127,1,0,0,0,24,129,1,0,
0,0,26,131,1,0,0,0,28,133,1,0,0,0,30,135,1,0,0,0,32,34,5,8,0,0,33,32,1,0,
0,0,34,37,1,0,0,0,35,33,1,0,0,0,35,36,1,0,0,0,36,38,1,0,0,0,37,35,1,0,0,
0,38,43,3,2,1,0,39,40,5,8,0,0,40,42,3,2,1,0,41,39,1,0,0,0,42,45,1,0,0,0,
43,41,1,0,0,0,43,44,1,0,0,0,44,49,1,0,0,0,45,43,1,0,0,0,46,48,5,8,0,0,47,
46,1,0,0,0,48,51,1,0,0,0,49,47,1,0,0,0,49,50,1,0,0,0,50,1,1,0,0,0,51,49,
1,0,0,0,52,55,3,4,2,0,53,55,3,6,3,0,54,52,1,0,0,0,54,53,1,0,0,0,55,3,1,0,
0,0,56,57,5,7,0,0,57,5,1,0,0,0,58,60,3,30,15,0,59,58,1,0,0,0,59,60,1,0,0,
0,60,63,1,0,0,0,61,64,3,8,4,0,62,64,3,10,5,0,63,61,1,0,0,0,63,62,1,0,0,0,
64,7,1,0,0,0,65,66,3,12,6,0,66,67,5,2,0,0,67,68,3,14,7,0,68,9,1,0,0,0,69,
70,3,12,6,0,70,71,5,2,0,0,71,72,3,16,8,0,72,11,1,0,0,0,73,74,5,7,0,0,74,
13,1,0,0,0,75,80,3,28,14,0,76,77,5,3,0,0,77,79,3,28,14,0,78,76,1,0,0,0,79,
82,1,0,0,0,80,78,1,0,0,0,80,81,1,0,0,0,81,15,1,0,0,0,82,80,1,0,0,0,83,88,
3,18,9,0,84,85,5,3,0,0,85,87,3,18,9,0,86,84,1,0,0,0,87,90,1,0,0,0,88,86,
1,0,0,0,88,89,1,0,0,0,89,17,1,0,0,0,90,88,1,0,0,0,91,95,3,20,10,0,92,94,
5,8,0,0,93,92,1,0,0,0,94,97,1,0,0,0,95,93,1,0,0,0,95,96,1,0,0,0,96,99,1,
0,0,0,97,95,1,0,0,0,98,100,3,24,12,0,99,98,1,0,0,0,99,100,1,0,0,0,100,104,
1,0,0,0,101,103,5,8,0,0,102,101,1,0,0,0,103,106,1,0,0,0,104,102,1,0,0,0,
104,105,1,0,0,0,105,107,1,0,0,0,106,104,1,0,0,0,107,111,5,4,0,0,108,110,
5,8,0,0,109,108,1,0,0,0,110,113,1,0,0,0,111,109,1,0,0,0,111,112,1,0,0,0,
112,115,1,0,0,0,113,111,1,0,0,0,114,116,3,26,13,0,115,114,1,0,0,0,115,116,
1,0,0,0,116,120,1,0,0,0,117,119,5,8,0,0,118,117,1,0,0,0,119,122,1,0,0,0,
120,118,1,0,0,0,120,121,1,0,0,0,121,123,1,0,0,0,122,120,1,0,0,0,123,124,
3,22,11,0,124,19,1,0,0,0,125,126,5,5,0,0,126,21,1,0,0,0,127,128,5,6,0,0,
128,23,1,0,0,0,129,130,5,7,0,0,130,25,1,0,0,0,131,132,5,7,0,0,132,27,1,0,
0,0,133,134,5,7,0,0,134,29,1,0,0,0,135,136,5,1,0,0,136,31,1,0,0,0,14,35,
43,49,54,59,63,80,88,95,99,104,111,115,120];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

export default class SearchPhraseParser extends antlr4.Parser {

    static grammarFileName = "java-escape";
    static literalNames = [ null, "'!'", "':'", "','" ];
    static symbolicNames = [ null, null, "FD", "VD", "RD", "RangeStart", 
                             "RangeEnd", "String", "WS" ];
    static ruleNames = [ "searchPhrase", "phrase", "keyword", "filters", 
                         "attributeFilter", "rangeFilter", "fieldName", 
                         "attributeFilterValue", "rangeFilterValue", "range", 
                         "rangeStart", "rangeEnd", "lower", "upper", "string", 
                         "negation" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = SearchPhraseParser.ruleNames;
        this.literalNames = SearchPhraseParser.literalNames;
        this.symbolicNames = SearchPhraseParser.symbolicNames;
    }

    get atn() {
        return atn;
    }



	searchPhrase() {
	    let localctx = new SearchPhraseContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, SearchPhraseParser.RULE_searchPhrase);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 35;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===8) {
	            this.state = 32;
	            this.match(SearchPhraseParser.WS);
	            this.state = 37;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 38;
	        this.phrase();
	        this.state = 43;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,1,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 39;
	                this.match(SearchPhraseParser.WS);
	                this.state = 40;
	                this.phrase(); 
	            }
	            this.state = 45;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,1,this._ctx);
	        }

	        this.state = 49;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===8) {
	            this.state = 46;
	            this.match(SearchPhraseParser.WS);
	            this.state = 51;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	phrase() {
	    let localctx = new PhraseContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, SearchPhraseParser.RULE_phrase);
	    try {
	        this.state = 54;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,3,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 52;
	            this.keyword();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 53;
	            this.filters();
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	keyword() {
	    let localctx = new KeywordContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, SearchPhraseParser.RULE_keyword);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 56;
	        this.match(SearchPhraseParser.String);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	filters() {
	    let localctx = new FiltersContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, SearchPhraseParser.RULE_filters);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 59;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===1) {
	            this.state = 58;
	            this.negation();
	        }

	        this.state = 63;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,5,this._ctx);
	        switch(la_) {
	        case 1:
	            this.state = 61;
	            this.attributeFilter();
	            break;

	        case 2:
	            this.state = 62;
	            this.rangeFilter();
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	attributeFilter() {
	    let localctx = new AttributeFilterContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, SearchPhraseParser.RULE_attributeFilter);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 65;
	        this.fieldName();
	        this.state = 66;
	        this.match(SearchPhraseParser.FD);
	        this.state = 67;
	        this.attributeFilterValue();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	rangeFilter() {
	    let localctx = new RangeFilterContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, SearchPhraseParser.RULE_rangeFilter);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 69;
	        this.fieldName();
	        this.state = 70;
	        this.match(SearchPhraseParser.FD);
	        this.state = 71;
	        this.rangeFilterValue();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	fieldName() {
	    let localctx = new FieldNameContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, SearchPhraseParser.RULE_fieldName);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 73;
	        this.match(SearchPhraseParser.String);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	attributeFilterValue() {
	    let localctx = new AttributeFilterValueContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, SearchPhraseParser.RULE_attributeFilterValue);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 75;
	        this.string();
	        this.state = 80;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===3) {
	            this.state = 76;
	            this.match(SearchPhraseParser.VD);
	            this.state = 77;
	            this.string();
	            this.state = 82;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	rangeFilterValue() {
	    let localctx = new RangeFilterValueContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 16, SearchPhraseParser.RULE_rangeFilterValue);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 83;
	        this.range();
	        this.state = 88;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===3) {
	            this.state = 84;
	            this.match(SearchPhraseParser.VD);
	            this.state = 85;
	            this.range();
	            this.state = 90;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	range() {
	    let localctx = new RangeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 18, SearchPhraseParser.RULE_range);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 91;
	        this.rangeStart();
	        this.state = 95;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,8,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 92;
	                this.match(SearchPhraseParser.WS); 
	            }
	            this.state = 97;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,8,this._ctx);
	        }

	        this.state = 99;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===7) {
	            this.state = 98;
	            this.lower();
	        }

	        this.state = 104;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===8) {
	            this.state = 101;
	            this.match(SearchPhraseParser.WS);
	            this.state = 106;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 107;
	        this.match(SearchPhraseParser.RD);
	        this.state = 111;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,11,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 108;
	                this.match(SearchPhraseParser.WS); 
	            }
	            this.state = 113;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,11,this._ctx);
	        }

	        this.state = 115;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===7) {
	            this.state = 114;
	            this.upper();
	        }

	        this.state = 120;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===8) {
	            this.state = 117;
	            this.match(SearchPhraseParser.WS);
	            this.state = 122;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 123;
	        this.rangeEnd();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	rangeStart() {
	    let localctx = new RangeStartContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, SearchPhraseParser.RULE_rangeStart);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 125;
	        this.match(SearchPhraseParser.RangeStart);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	rangeEnd() {
	    let localctx = new RangeEndContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 22, SearchPhraseParser.RULE_rangeEnd);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 127;
	        this.match(SearchPhraseParser.RangeEnd);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	lower() {
	    let localctx = new LowerContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 24, SearchPhraseParser.RULE_lower);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 129;
	        this.match(SearchPhraseParser.String);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	upper() {
	    let localctx = new UpperContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 26, SearchPhraseParser.RULE_upper);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 131;
	        this.match(SearchPhraseParser.String);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	string() {
	    let localctx = new StringContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 28, SearchPhraseParser.RULE_string);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 133;
	        this.match(SearchPhraseParser.String);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	negation() {
	    let localctx = new NegationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 30, SearchPhraseParser.RULE_negation);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 135;
	        this.match(SearchPhraseParser.T__0);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

SearchPhraseParser.EOF = antlr4.Token.EOF;
SearchPhraseParser.T__0 = 1;
SearchPhraseParser.FD = 2;
SearchPhraseParser.VD = 3;
SearchPhraseParser.RD = 4;
SearchPhraseParser.RangeStart = 5;
SearchPhraseParser.RangeEnd = 6;
SearchPhraseParser.String = 7;
SearchPhraseParser.WS = 8;

SearchPhraseParser.RULE_searchPhrase = 0;
SearchPhraseParser.RULE_phrase = 1;
SearchPhraseParser.RULE_keyword = 2;
SearchPhraseParser.RULE_filters = 3;
SearchPhraseParser.RULE_attributeFilter = 4;
SearchPhraseParser.RULE_rangeFilter = 5;
SearchPhraseParser.RULE_fieldName = 6;
SearchPhraseParser.RULE_attributeFilterValue = 7;
SearchPhraseParser.RULE_rangeFilterValue = 8;
SearchPhraseParser.RULE_range = 9;
SearchPhraseParser.RULE_rangeStart = 10;
SearchPhraseParser.RULE_rangeEnd = 11;
SearchPhraseParser.RULE_lower = 12;
SearchPhraseParser.RULE_upper = 13;
SearchPhraseParser.RULE_string = 14;
SearchPhraseParser.RULE_negation = 15;

class SearchPhraseContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_searchPhrase;
    }

	phrase = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(PhraseContext);
	    } else {
	        return this.getTypedRuleContext(PhraseContext,i);
	    }
	};

	WS = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(SearchPhraseParser.WS);
	    } else {
	        return this.getToken(SearchPhraseParser.WS, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterSearchPhrase(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitSearchPhrase(this);
		}
	}


}



class PhraseContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_phrase;
    }

	keyword() {
	    return this.getTypedRuleContext(KeywordContext,0);
	};

	filters() {
	    return this.getTypedRuleContext(FiltersContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterPhrase(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitPhrase(this);
		}
	}


}



class KeywordContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_keyword;
    }

	String() {
	    return this.getToken(SearchPhraseParser.String, 0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterKeyword(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitKeyword(this);
		}
	}


}



class FiltersContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_filters;
    }

	attributeFilter() {
	    return this.getTypedRuleContext(AttributeFilterContext,0);
	};

	rangeFilter() {
	    return this.getTypedRuleContext(RangeFilterContext,0);
	};

	negation() {
	    return this.getTypedRuleContext(NegationContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterFilters(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitFilters(this);
		}
	}


}



class AttributeFilterContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_attributeFilter;
    }

	fieldName() {
	    return this.getTypedRuleContext(FieldNameContext,0);
	};

	FD() {
	    return this.getToken(SearchPhraseParser.FD, 0);
	};

	attributeFilterValue() {
	    return this.getTypedRuleContext(AttributeFilterValueContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterAttributeFilter(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitAttributeFilter(this);
		}
	}


}



class RangeFilterContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_rangeFilter;
    }

	fieldName() {
	    return this.getTypedRuleContext(FieldNameContext,0);
	};

	FD() {
	    return this.getToken(SearchPhraseParser.FD, 0);
	};

	rangeFilterValue() {
	    return this.getTypedRuleContext(RangeFilterValueContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterRangeFilter(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitRangeFilter(this);
		}
	}


}



class FieldNameContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_fieldName;
    }

	String() {
	    return this.getToken(SearchPhraseParser.String, 0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterFieldName(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitFieldName(this);
		}
	}


}



class AttributeFilterValueContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_attributeFilterValue;
    }

	string = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StringContext);
	    } else {
	        return this.getTypedRuleContext(StringContext,i);
	    }
	};

	VD = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(SearchPhraseParser.VD);
	    } else {
	        return this.getToken(SearchPhraseParser.VD, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterAttributeFilterValue(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitAttributeFilterValue(this);
		}
	}


}



class RangeFilterValueContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_rangeFilterValue;
    }

	range = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(RangeContext);
	    } else {
	        return this.getTypedRuleContext(RangeContext,i);
	    }
	};

	VD = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(SearchPhraseParser.VD);
	    } else {
	        return this.getToken(SearchPhraseParser.VD, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterRangeFilterValue(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitRangeFilterValue(this);
		}
	}


}



class RangeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_range;
    }

	rangeStart() {
	    return this.getTypedRuleContext(RangeStartContext,0);
	};

	RD() {
	    return this.getToken(SearchPhraseParser.RD, 0);
	};

	rangeEnd() {
	    return this.getTypedRuleContext(RangeEndContext,0);
	};

	WS = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(SearchPhraseParser.WS);
	    } else {
	        return this.getToken(SearchPhraseParser.WS, i);
	    }
	};


	lower() {
	    return this.getTypedRuleContext(LowerContext,0);
	};

	upper() {
	    return this.getTypedRuleContext(UpperContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterRange(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitRange(this);
		}
	}


}



class RangeStartContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_rangeStart;
    }

	RangeStart() {
	    return this.getToken(SearchPhraseParser.RangeStart, 0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterRangeStart(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitRangeStart(this);
		}
	}


}



class RangeEndContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_rangeEnd;
    }

	RangeEnd() {
	    return this.getToken(SearchPhraseParser.RangeEnd, 0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterRangeEnd(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitRangeEnd(this);
		}
	}


}



class LowerContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_lower;
    }

	String() {
	    return this.getToken(SearchPhraseParser.String, 0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterLower(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitLower(this);
		}
	}


}



class UpperContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_upper;
    }

	String() {
	    return this.getToken(SearchPhraseParser.String, 0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterUpper(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitUpper(this);
		}
	}


}



class StringContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_string;
    }

	String() {
	    return this.getToken(SearchPhraseParser.String, 0);
	};

	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterString(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitString(this);
		}
	}


}



class NegationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchPhraseParser.RULE_negation;
    }


	enterRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.enterNegation(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof SearchPhraseListener ) {
	        listener.exitNegation(this);
		}
	}


}




SearchPhraseParser.SearchPhraseContext = SearchPhraseContext; 
SearchPhraseParser.PhraseContext = PhraseContext; 
SearchPhraseParser.KeywordContext = KeywordContext; 
SearchPhraseParser.FiltersContext = FiltersContext; 
SearchPhraseParser.AttributeFilterContext = AttributeFilterContext; 
SearchPhraseParser.RangeFilterContext = RangeFilterContext; 
SearchPhraseParser.FieldNameContext = FieldNameContext; 
SearchPhraseParser.AttributeFilterValueContext = AttributeFilterValueContext; 
SearchPhraseParser.RangeFilterValueContext = RangeFilterValueContext; 
SearchPhraseParser.RangeContext = RangeContext; 
SearchPhraseParser.RangeStartContext = RangeStartContext; 
SearchPhraseParser.RangeEndContext = RangeEndContext; 
SearchPhraseParser.LowerContext = LowerContext; 
SearchPhraseParser.UpperContext = UpperContext; 
SearchPhraseParser.StringContext = StringContext; 
SearchPhraseParser.NegationContext = NegationContext; 
