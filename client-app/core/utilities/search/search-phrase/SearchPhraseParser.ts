import antlr4 from "antlr4";
import { SearchPhraseLexer, SearchPhraseParser as SearchPhraseParserBase } from "./generated";
import { SearchPhraseListener } from "./SearchPhraseListener";
import { SearchPhraseParseResult } from "./SearchPhraseParserResult";

export class SearchPhraseParser {
  static readonly INSTANCE = new SearchPhraseParser();

  parse(input: string): SearchPhraseParseResult {
    const stream = new antlr4.InputStream(input);
    const lexer = new SearchPhraseLexer(stream);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new SearchPhraseParserBase(tokens);
    parser.buildParseTrees = true;
    const listener = new SearchPhraseListener();

    antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, parser.searchPhrase());

    const result = new SearchPhraseParseResult(listener.keywords.join(" "), listener.filters);

    return result;
  }
}
