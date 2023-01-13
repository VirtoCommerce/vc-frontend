import { Filter } from "@/core";

export class SearchPhraseParseResult {
  constructor(public keyword: string, public filters: Filter[]) {}
}
