/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

// Function to process a Vue file and add @reference directive
async function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check if the file already has @reference directive
  if (content.includes('@reference')) {
    console.log(`Skipping ${filePath} - already has @reference directive`);
    return;
  }

  // Check if the file has a style block with @apply
  const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/;
  const styleMatch = content.match(styleBlockRegex);

  if (!styleMatch) {
    console.log(`Skipping ${filePath} - no style block found`);
    return;
  }

  const styleContent = styleMatch[1];
  if (!styleContent.includes('@apply')) {
    console.log(`Skipping ${filePath} - no @apply statements found`);
    return;
  }

  // Add @reference directive at the beginning of the style block
  const updatedContent = content.replace(
    styleBlockRegex,
    (match, styleContent) => {
      return match.replace(
        styleContent,
        `\n  @reference "tailwindcss";\n${styleContent}`
      );
    }
  );

  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated ${filePath}`);
}

// Main function to process all Vue files
async function main() {
  const vueFiles = await glob('client-app/**/*.vue');
  console.log(`Found ${vueFiles.length} Vue files\n`);

  for (const file of vueFiles) {
    await processFile(file);
  }

  console.log("\nFinished processing files");
}

main().catch(console.error);
