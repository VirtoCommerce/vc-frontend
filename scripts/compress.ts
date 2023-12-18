import { resolve } from "path";
import AdmZip from "adm-zip";
import chalk from "chalk";
export async function compress(artifactFileName: string, add: (archive: AdmZip) => void) {
  const cwd = process.cwd();

  console.log("Preparing to compress...");

  const artifactsPath = resolve(cwd, "artifacts");
  const artifactPath = resolve(artifactsPath, `${artifactFileName}.zip`);

  console.log(chalk.cyan("Artifact path:"), artifactPath);

  const archive = new AdmZip();

  add(archive);

  try {
    console.log("Compressing...");

    await archive.writeZipPromise(artifactPath);

    console.log(chalk.green("Successfully compressed!"));
  } catch (error) {
    console.error(chalk.red("Compression failed!"));
    throw error;
  }
}
