import { execSync } from "child_process";

try {
  const version = execSync("yarn --version").toString().trim();
  const [major, minor] = version.split(".").map(Number);

  // Check if major version is less than 4 or if the minor version is less than 4 when major is 4
  if (major < 4 || (major === 4 && minor < 4)) {
    console.error(`Your Yarn version is ${version}. Please upgrade to Yarn v4.4.0 or higher.`);
    process.exit(1);
  }
} catch (error) {
  console.error("Error checking Yarn version:", error);
  process.exit(1);
}
