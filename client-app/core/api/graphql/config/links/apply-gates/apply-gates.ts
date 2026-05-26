import { Kind, visit } from "graphql";
import type { DocumentNode, FieldNode, FragmentDefinitionNode, OperationDefinitionNode } from "graphql";

const GATE_DIRECTIVE_NAME = "gate";
const GATE_MODULE_ARG_NAME = "module";

function getGateModuleId(field: FieldNode): string | undefined {
  const gate = field.directives?.find((directive) => directive.name.value === GATE_DIRECTIVE_NAME);
  if (!gate) {
    return undefined;
  }

  const moduleArg = gate.arguments?.find((arg) => arg.name.value === GATE_MODULE_ARG_NAME);
  if (moduleArg?.value.kind !== Kind.STRING) {
    return undefined;
  }

  return moduleArg.value.value;
}

function removeUnusedFragments(document: DocumentNode): DocumentNode {
  const fragmentsByName = new Map<string, FragmentDefinitionNode>();
  for (const definition of document.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      fragmentsByName.set(definition.name.value, definition);
    }
  }

  if (fragmentsByName.size === 0) {
    return document;
  }

  const reachable = new Set<string>();
  const queue: (OperationDefinitionNode | FragmentDefinitionNode)[] = [];

  for (const definition of document.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      queue.push(definition);
    }
  }

  while (queue.length > 0) {
    const node = queue.shift()!;
    visit(node, {
      FragmentSpread(spread) {
        const name = spread.name.value;
        if (reachable.has(name)) {
          return;
        }
        reachable.add(name);
        const fragment = fragmentsByName.get(name);
        if (fragment) {
          queue.push(fragment);
        }
      },
    });
  }

  if (reachable.size === fragmentsByName.size) {
    return document;
  }

  return {
    ...document,
    definitions: document.definitions.filter(
      (definition) => definition.kind !== Kind.FRAGMENT_DEFINITION || reachable.has(definition.name.value),
    ),
  };
}

/**
 * Walks the document, and for every field annotated with `@gate(module: "...")`:
 * - if the module is in `installedModuleIds` — strips the directive, keeps the field;
 * - otherwise — drops the entire field, so the server never sees a selection
 *   referencing a type that may not exist in the schema.
 *
 * After field stripping, prunes FragmentDefinitions that are no longer referenced
 * from any operation (directly or transitively) — strict GraphQL servers reject
 * documents with unused fragments.
 *
 * `@gate` is a client-side annotation registered via `_clientDirectives.graphql`
 * for codegen validation only; it must never reach the server.
 */
export function applyGates(document: DocumentNode, installedModuleIds: ReadonlySet<string>): DocumentNode {
  let stripped = false;

  const next = visit(document, {
    Field(node) {
      const moduleId = getGateModuleId(node);
      if (!moduleId) {
        return undefined;
      }

      if (installedModuleIds.has(moduleId)) {
        return {
          ...node,
          directives: node.directives?.filter((directive) => directive.name.value !== GATE_DIRECTIVE_NAME),
        };
      }

      stripped = true;
      return null;
    },
  });

  return stripped ? removeUnusedFragments(next) : next;
}
