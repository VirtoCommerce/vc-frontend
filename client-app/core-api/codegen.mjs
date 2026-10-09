/**
 * graphql-codegen settings shared by the host and by plugins that query their own xAPI scope.
 * Published so a plugin's codegen.ts stays a URL and an output path — the scalar mappings have to
 * match the host's, or the same backend value gets two different TypeScript types.
 */
export const CODEGEN_CONFIG = {
  dedupeFragments: true,
  identifierName: "OperationNames",
  maybeValue: "T",
  scalars: {
    BigInt: "number",
    Byte: "number",
    Date: "string",
    DateOnly: "string",
    Decimal: "number",
    DynamicPropertyValue: "string | number | boolean | null",
    Guid: "string",
    Half: "number",
    Long: "number",
    Milliseconds: "number",
    ModuleSettingValue: "string | number | boolean | null",
    OptionalDecimal: "number | undefined",
    OptionalNullableDecimal: "number | null | undefined",
    OptionalString: "string | undefined",
    PropertyValue: "string | number | boolean | null",
    SByte: "number",
    Seconds: "number",
    Short: "number",
    TimeOnly: "string",
    UInt: "number",
    ULong: "number",
    Uri: "string",
    UShort: "number",
  },
  skipTypename: true,
  useTypeImports: true,
  skipGraphQLImport: true,
};

/** TypedDocumentNode output, so a document carries its own result and variables types. */
export const CODEGEN_PLUGINS = [
  { add: { content: "// This file is auto-generated. Do not edit manually.\n" } },
  "typescript",
  "typescript-operations",
  "typed-document-node",
  "named-operations-object",
];
