import { Kind } from "graphql";
import { describe, expect, test } from "vitest";
import { GetMeDocument, GetPageContextDocument } from "@/core/api/graphql/types";
import type { DocumentNode, SelectionSetNode } from "graphql";

// `isAwaitingApproval` reads `contact.status`; every document that loads the current user must select it,
// or every customer looks unapproved after that load (the page-context query runs on each page load).
function contactSelectsStatus(document: DocumentNode): boolean {
  const fragments = new Map(
    document.definitions.flatMap((definition) =>
      definition.kind === Kind.FRAGMENT_DEFINITION ? [[definition.name.value, definition.selectionSet] as const] : [],
    ),
  );

  function visit(selectionSet: SelectionSetNode | undefined, insideContact: boolean): boolean {
    return (selectionSet?.selections ?? []).some((selection) => {
      if (selection.kind === Kind.FRAGMENT_SPREAD) {
        return visit(fragments.get(selection.name.value), insideContact);
      }
      if (selection.kind !== Kind.FIELD) {
        return visit(selection.selectionSet, insideContact);
      }
      if (insideContact && selection.name.value === "status") {
        return true;
      }
      return visit(selection.selectionSet, selection.name.value === "contact");
    });
  }

  return document.definitions.some(
    (definition) => definition.kind === Kind.OPERATION_DEFINITION && visit(definition.selectionSet, false),
  );
}

describe("documents that load the current user select contact.status", () => {
  test.each([
    ["GetMe", GetMeDocument],
    ["GetPageContext", GetPageContextDocument],
  ])("%s", (_name, document) => {
    expect(contactSelectsStatus(document as DocumentNode)).toBe(true);
  });
});
