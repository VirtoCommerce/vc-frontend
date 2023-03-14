// Generated from client-app/core/utilities/search/search-phrase/SearchPhrase.g4 by ANTLR 4.12.0
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import {
	ATN,
	ATNDeserializer,
	CharStream,
	DecisionState, DFA,
	Lexer,
	LexerATNSimulator,
	RuleContext,
	PredictionContextCache,
	Token
} from "antlr4";
export default class SearchPhraseLexer extends Lexer {
	public static readonly T__0 = 1;
	public static readonly FD = 2;
	public static readonly VD = 3;
	public static readonly RD = 4;
	public static readonly RangeStart = 5;
	public static readonly RangeEnd = 6;
	public static readonly String = 7;
	public static readonly WS = 8;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: string[] = [ null, "'!'", "':'", "','" ];
	public static readonly symbolicNames: string[] = [ null, null, "FD", "VD", 
                                                    "RD", "RangeStart", 
                                                    "RangeEnd", "String", 
                                                    "WS" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "FD", "VD", "RD", "RangeStart", "RangeEnd", "String", "SimpleString", 
		"QuotedString", "Esc", "WS",
	];


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(this, SearchPhraseLexer._ATN, SearchPhraseLexer.DecisionsToDFA, new PredictionContextCache());
	}

	public get grammarFileName(): string { return "SearchPhrase.g4"; }

	public get literalNames(): (string | null)[] { return SearchPhraseLexer.literalNames; }
	public get symbolicNames(): (string | null)[] { return SearchPhraseLexer.symbolicNames; }
	public get ruleNames(): string[] { return SearchPhraseLexer.ruleNames; }

	public get serializedATN(): number[] { return SearchPhraseLexer._serializedATN; }

	public get channelNames(): string[] { return SearchPhraseLexer.channelNames; }

	public get modeNames(): string[] { return SearchPhraseLexer.modeNames; }

	public static readonly _serializedATN: number[] = [4,0,8,66,6,-1,2,0,7,
	0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,
	9,2,10,7,10,1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,3,1,3,1,3,3,3,34,8,3,1,4,1,4,
	1,5,1,5,1,6,1,6,3,6,42,8,6,1,7,4,7,45,8,7,11,7,12,7,46,1,8,1,8,1,8,5,8,
	52,8,8,10,8,12,8,55,9,8,1,8,1,8,1,9,1,9,1,9,1,10,4,10,63,8,10,11,10,12,
	10,64,0,0,11,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,0,17,0,19,0,21,8,1,0,6,2,
	0,40,40,91,91,2,0,41,41,93,93,7,0,9,9,32,34,40,41,44,44,58,58,91,91,93,
	93,2,0,34,34,92,92,5,0,34,34,92,92,110,110,114,114,116,116,2,0,9,9,32,32,
	68,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,
	0,0,0,13,1,0,0,0,0,21,1,0,0,0,1,23,1,0,0,0,3,25,1,0,0,0,5,27,1,0,0,0,7,
	33,1,0,0,0,9,35,1,0,0,0,11,37,1,0,0,0,13,41,1,0,0,0,15,44,1,0,0,0,17,48,
	1,0,0,0,19,58,1,0,0,0,21,62,1,0,0,0,23,24,5,33,0,0,24,2,1,0,0,0,25,26,5,
	58,0,0,26,4,1,0,0,0,27,28,5,44,0,0,28,6,1,0,0,0,29,30,5,84,0,0,30,34,5,
	79,0,0,31,32,5,116,0,0,32,34,5,111,0,0,33,29,1,0,0,0,33,31,1,0,0,0,34,8,
	1,0,0,0,35,36,7,0,0,0,36,10,1,0,0,0,37,38,7,1,0,0,38,12,1,0,0,0,39,42,3,
	15,7,0,40,42,3,17,8,0,41,39,1,0,0,0,41,40,1,0,0,0,42,14,1,0,0,0,43,45,8,
	2,0,0,44,43,1,0,0,0,45,46,1,0,0,0,46,44,1,0,0,0,46,47,1,0,0,0,47,16,1,0,
	0,0,48,53,5,34,0,0,49,52,3,19,9,0,50,52,8,3,0,0,51,49,1,0,0,0,51,50,1,0,
	0,0,52,55,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,0,54,56,1,0,0,0,55,53,1,0,0,
	0,56,57,5,34,0,0,57,18,1,0,0,0,58,59,5,92,0,0,59,60,7,4,0,0,60,20,1,0,0,
	0,61,63,7,5,0,0,62,61,1,0,0,0,63,64,1,0,0,0,64,62,1,0,0,0,64,65,1,0,0,0,
	65,22,1,0,0,0,7,0,33,41,46,51,53,64,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!SearchPhraseLexer.__ATN) {
			SearchPhraseLexer.__ATN = new ATNDeserializer().deserialize(SearchPhraseLexer._serializedATN);
		}

		return SearchPhraseLexer.__ATN;
	}


	static DecisionsToDFA = SearchPhraseLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}