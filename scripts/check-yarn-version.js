import { execSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Recreate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the installed Yarn version
function getInstalledYarnVersion() {
  try {
    return execSync("yarn --version").toString().trim();
  } catch (error) {
    console.error("Error checking installed Yarn version:", error);
    process.exit(1);
  }
}

// Get the required Yarn version from package.json (located in the main project folder)
function getRequiredYarnVersion() {
  try {
    // Resolve the path to the package.json file in the root folder
    const packageJsonPath = join(__dirname, "../package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    return packageJson.packageManager.split("@")[1];
  } catch (error) {
    console.error(
      'Error checking Yarn version in package.json. Please specify it like "packageManager": "yarn@4.4.0"',
      error,
    );
    process.exit(1);
  }
}

// Compare versions
function compareYarnVersions(installedVersion, requiredVersion) {
  const [installedMajor, installedMinor, installedPatch] = installedVersion.split(".").map(Number);
  const [requiredMajor, requiredMinor, requiredPatch] = requiredVersion.split(".").map(Number);

  if (
    installedMajor < requiredMajor ||
    (installedMajor === requiredMajor && installedMinor < requiredMinor) ||
    (installedMajor === requiredMajor && installedMinor === requiredMinor && installedPatch < requiredPatch)
  ) {
    console.error(
      `Your installed Yarn version (${installedVersion}) is less than the required version (${requiredVersion}). Please upgrade.`,
    );
    process.exit(1);
  }
}

// Run the checks
const installedVersion = getInstalledYarnVersion();
const requiredVersion = getRequiredYarnVersion();
compareYarnVersions(installedVersion, requiredVersion);
