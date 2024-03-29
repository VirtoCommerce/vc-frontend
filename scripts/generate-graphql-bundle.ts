import { writeFile, readdir } from "fs/promises";
import { join, parse, posix, relative, sep } from "path";
import chalk from "chalk";
import {
  createSourceFile,
  createPrinter,
  ScriptTarget,
  ScriptKind,
  transform,
  addSyntheticLeadingComment,
  SyntaxKind,
} from "typescript";
import { GRAPHQL_DIRECTORY, GRAPHQL_TYPES_DIRECTORY } from "../client-app/core/constants/graphql";
import type { TransformerFactory, SourceFile } from "typescript";

const sourceFilePath = `${GRAPHQL_TYPES_DIRECTORY}/index.ts`;

// In-memory source file
let sourceFile = createSourceFile(sourceFilePath, "", ScriptTarget.Latest, true, ScriptKind.TS);

// List generated files
const graphqlRelatedFilePaths = await readdir(GRAPHQL_DIRECTORY, { recursive: true }); // [account\queries\getMe\getMeQuery.generated.ts, ...]
const graphqlGeneratedFilePaths = graphqlRelatedFilePaths
  .filter((path) => path.toLowerCase().endsWith(".generated.ts"))
  .map((path) => join(GRAPHQL_DIRECTORY, path)) // client-app\core\api\graphql\account\queries\getMe\getMeQuery.generated.ts
  .map((path) => relative(GRAPHQL_TYPES_DIRECTORY, path)) // ..\account\queries\getMe\getMeQuery.generated.ts
  .map((path) => {
    const { dir, name } = parse(path);
    const result = posix.join(...dir.split(sep), name);
    if (!result.startsWith("..")) {
      return `./${result}`; // ./base.generated
    }
    return result; // ../account/queries/getMe/getMeQuery.generated
  });

// Generate exports
const generate: TransformerFactory<SourceFile> = (context) => (node) => {
  const { factory } = context;

  const exports = graphqlGeneratedFilePaths.map((graphqlGeneratedFilePath) =>
    // export * from "../account/queries/getMe/getMeQuery.generated"
    factory.createExportDeclaration(undefined, false, undefined, factory.createStringLiteral(graphqlGeneratedFilePath)),
  );

  // Add comment about auto generation to the top of the file
  addSyntheticLeadingComment(
    exports[0],
    SyntaxKind.MultiLineCommentTrivia,
    `
  This file is auto-generated. Do not edit manually.
  This file is for backward compatibility only!
  Please use the generated files directly instead for better tree-shaking.
`,
    true,
  );

  return factory.updateSourceFile(node, exports);
};

// Add exports to source file
({
  transformed: [sourceFile],
} = transform(sourceFile, [generate]));

// Code generator
const printer = createPrinter({ removeComments: false });

// Generate source code
const sourceCode = printer.printFile(sourceFile);

// Write to file
await writeFile(sourceFilePath, sourceCode);

console.log(`${chalk.green("✔")} Generate bundle`);
