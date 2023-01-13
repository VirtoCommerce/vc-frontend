import antlr4 from "antlr4";

export default class SearchPhraseLexer extends antlr4.Lexer {
  static readonly EOF: antlr4.Token.EOF;
  static readonly T__0: 1;
  static readonly FD: 2;
  static readonly VD: 3;
  static readonly RD: 4;
  static readonly RangeStart: 5;
  static readonly RangeEnd: 6;
  static readonly String: 7;
  static readonly WS: 8;

  static grammarFileName: string;
  static channelNames: string[];
  static modeNames: string[];
  static literalNames: string[];
  static symbolicNames: string[];
  static ruleNames: string[];

  constructor(input: antlr4.InputStream | null);

  get atn(): antlr4.ATN;
}
