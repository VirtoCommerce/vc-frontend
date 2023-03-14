import { CharStream, CommonTokenStream, ParseTreeWalker } from "antlr4";
import { SearchPhraseListener } from "./SearchPhraseListener";
import { SearchPhraseParseResult } from "./SearchPhraseParserResult";
import { SearchPhraseLexer, SearchPhraseParserBase } from "./generated";

export class SearchPhraseParser {
  static readonly INSTANCE = new SearchPhraseParser();

  parse(input: string): SearchPhraseParseResult {
    const stream = new CharStream(input);
    const lexer = new SearchPhraseLexer(stream);
    const tokens = new CommonTokenStream(lexer);
    const parser = new SearchPhraseParserBase(tokens);
    parser.buildParseTrees = true;
    const listener = new SearchPhraseListener();

    ParseTreeWalker.DEFAULT.walk(listener, parser.searchPhrase());

    return new SearchPhraseParseResult(listener.keywords.join(" "), listener.filters);
  }
}
