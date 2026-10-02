export declare const CODEGEN_CONFIG: {
  dedupeFragments: boolean;
  identifierName: string;
  maybeValue: string;
  scalars: Record<string, string>;
  skipTypename: boolean;
  useTypeImports: boolean;
  skipGraphQLImport: boolean;
};

/** A plugin name, or a name mapped to its options — graphql-codegen's own `OutputConfig`. */
export declare const CODEGEN_PLUGINS: (string | { [name: string]: Record<string, unknown> })[];
