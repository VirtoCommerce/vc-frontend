import type { Filter } from "@/core/types/search/filtering";

export class SearchPhraseParseResult {
  constructor(public keyword: string, public filters: Filter[]) {}
}
