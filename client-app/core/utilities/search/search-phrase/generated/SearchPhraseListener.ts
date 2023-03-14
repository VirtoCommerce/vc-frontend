// Generated from client-app/core/utilities/search/search-phrase/SearchPhrase.g4 by ANTLR 4.12.0

import {ParseTreeListener} from "antlr4";


import { SearchPhraseContext } from "./SearchPhraseParser";
import { PhraseContext } from "./SearchPhraseParser";
import { KeywordContext } from "./SearchPhraseParser";
import { FiltersContext } from "./SearchPhraseParser";
import { AttributeFilterContext } from "./SearchPhraseParser";
import { RangeFilterContext } from "./SearchPhraseParser";
import { FieldNameContext } from "./SearchPhraseParser";
import { AttributeFilterValueContext } from "./SearchPhraseParser";
import { RangeFilterValueContext } from "./SearchPhraseParser";
import { RangeContext } from "./SearchPhraseParser";
import { RangeStartContext } from "./SearchPhraseParser";
import { RangeEndContext } from "./SearchPhraseParser";
import { LowerContext } from "./SearchPhraseParser";
import { UpperContext } from "./SearchPhraseParser";
import { StringContext } from "./SearchPhraseParser";
import { NegationContext } from "./SearchPhraseParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `SearchPhraseParser`.
 */
export default class SearchPhraseListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.searchPhrase`.
	 * @param ctx the parse tree
	 */
	enterSearchPhrase?: (ctx: SearchPhraseContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.searchPhrase`.
	 * @param ctx the parse tree
	 */
	exitSearchPhrase?: (ctx: SearchPhraseContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.phrase`.
	 * @param ctx the parse tree
	 */
	enterPhrase?: (ctx: PhraseContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.phrase`.
	 * @param ctx the parse tree
	 */
	exitPhrase?: (ctx: PhraseContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.keyword`.
	 * @param ctx the parse tree
	 */
	enterKeyword?: (ctx: KeywordContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.keyword`.
	 * @param ctx the parse tree
	 */
	exitKeyword?: (ctx: KeywordContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.filters`.
	 * @param ctx the parse tree
	 */
	enterFilters?: (ctx: FiltersContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.filters`.
	 * @param ctx the parse tree
	 */
	exitFilters?: (ctx: FiltersContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.attributeFilter`.
	 * @param ctx the parse tree
	 */
	enterAttributeFilter?: (ctx: AttributeFilterContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.attributeFilter`.
	 * @param ctx the parse tree
	 */
	exitAttributeFilter?: (ctx: AttributeFilterContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.rangeFilter`.
	 * @param ctx the parse tree
	 */
	enterRangeFilter?: (ctx: RangeFilterContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.rangeFilter`.
	 * @param ctx the parse tree
	 */
	exitRangeFilter?: (ctx: RangeFilterContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.fieldName`.
	 * @param ctx the parse tree
	 */
	enterFieldName?: (ctx: FieldNameContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.fieldName`.
	 * @param ctx the parse tree
	 */
	exitFieldName?: (ctx: FieldNameContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.attributeFilterValue`.
	 * @param ctx the parse tree
	 */
	enterAttributeFilterValue?: (ctx: AttributeFilterValueContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.attributeFilterValue`.
	 * @param ctx the parse tree
	 */
	exitAttributeFilterValue?: (ctx: AttributeFilterValueContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.rangeFilterValue`.
	 * @param ctx the parse tree
	 */
	enterRangeFilterValue?: (ctx: RangeFilterValueContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.rangeFilterValue`.
	 * @param ctx the parse tree
	 */
	exitRangeFilterValue?: (ctx: RangeFilterValueContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.range`.
	 * @param ctx the parse tree
	 */
	enterRange?: (ctx: RangeContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.range`.
	 * @param ctx the parse tree
	 */
	exitRange?: (ctx: RangeContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.rangeStart`.
	 * @param ctx the parse tree
	 */
	enterRangeStart?: (ctx: RangeStartContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.rangeStart`.
	 * @param ctx the parse tree
	 */
	exitRangeStart?: (ctx: RangeStartContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.rangeEnd`.
	 * @param ctx the parse tree
	 */
	enterRangeEnd?: (ctx: RangeEndContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.rangeEnd`.
	 * @param ctx the parse tree
	 */
	exitRangeEnd?: (ctx: RangeEndContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.lower`.
	 * @param ctx the parse tree
	 */
	enterLower?: (ctx: LowerContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.lower`.
	 * @param ctx the parse tree
	 */
	exitLower?: (ctx: LowerContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.upper`.
	 * @param ctx the parse tree
	 */
	enterUpper?: (ctx: UpperContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.upper`.
	 * @param ctx the parse tree
	 */
	exitUpper?: (ctx: UpperContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.string`.
	 * @param ctx the parse tree
	 */
	enterString?: (ctx: StringContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.string`.
	 * @param ctx the parse tree
	 */
	exitString?: (ctx: StringContext) => void;
	/**
	 * Enter a parse tree produced by `SearchPhraseParser.negation`.
	 * @param ctx the parse tree
	 */
	enterNegation?: (ctx: NegationContext) => void;
	/**
	 * Exit a parse tree produced by `SearchPhraseParser.negation`.
	 * @param ctx the parse tree
	 */
	exitNegation?: (ctx: NegationContext) => void;
}

