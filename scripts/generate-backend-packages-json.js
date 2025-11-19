import { existsSync, readFileSync, writeFileSync } from "fs";
import http from "http";
import https from "https";
import { dirname, join } from "path";
import { createInterface } from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blobPackagesUrl = "https://vc3prerelease.blob.core.windows.net/packages";

// ANSI color codes
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

function log(message) {
  console.log(`${GREEN}${message}${RESET}`);
}

function logError(message) {
  console.log(`${RED}${message}${RESET}`);
}

// Read backend URL from .env.local or .env file
function getBackendUrl() {
  const envLocalPath = join(__dirname, "..", ".env.local");
  const envPath = join(__dirname, "..", ".env");
  let envFilePath;

  if (existsSync(envLocalPath)) {
    log(`'.env.local' file exists. Using it to get backend URL...`);
    envFilePath = envLocalPath;
  } else {
    logError(`'.env.local' file does not exist. Using '.env' file...`);
    if (existsSync(envPath)) {
      log(`'.env' file exists. Using it to get backend URL...`);
      envFilePath = envPath;
    } else {
      logError(`'.env' file does not exist. Exiting...`);
      process.exit(1);
    }
  }

  log(`Getting backend URL from ${envFilePath} file...`);

  try {
    const envContent = readFileSync(envFilePath, "utf-8");
    const match = envContent.match(/APP_BACKEND_URL\s*=\s*(.+)/);
    if (!match) {
      throw new Error(`APP_BACKEND_URL not found in ${envFilePath} file`);
    }
    return match[1].trim().split(" ")[0];
  } catch (error) {
    console.error(`Error reading ${envFilePath} file: ${error.message}`);
    process.exit(1);
  }
}

// Prompt for user input
function prompt(question) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Prompt for password (masked input)
function promptPassword(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(question);

    // Set raw mode to capture individual keystrokes
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.setEncoding("utf8");

    let password = "";

    function cleanupAndExit() {
      if (stdin.isTTY) {
        stdin.setRawMode(false);
      }
      stdin.pause();
      stdin.removeListener("data", onData);
    }

    function isControlCharacter(charCode) {
      return (
        (charCode >= 0x00 && charCode <= 0x08) ||
        (charCode >= 0x0b && charCode <= 0x0c) ||
        (charCode >= 0x0e && charCode <= 0x1f) ||
        charCode === 0x7f
      );
    }

    function onData(key) {
      if (key === "\u0003" || key === "\u0004") {
        // Ctrl+C or Ctrl+D
        cleanupAndExit();
        process.exit();
      } else if (key === "\r" || key === "\n") {
        // Enter
        cleanupAndExit();
        stdout.write("\n");
        resolve(password);
      } else if (key === "\u007f" || key === "\b" || key === "\u001b[3~") {
        // Backspace or Delete
        if (password.length > 0) {
          password = password.slice(0, -1);
          stdout.write("\b \b");
        }
      } else if (key && key.length === 1) {
        // Check if character is not a control character
        const charCode = key.charCodeAt(0);
        if (!isControlCharacter(charCode)) {
          // Regular character (not control characters)
          password += key;
          stdout.write("*");
        }
      }
    }

    stdin.on("data", onData);
  });
}

// Make HTTP request with retry logic
async function httpRequest(url, options = {}, retries = 5, retryInterval = 5000) {
  const isHttps = url.startsWith("https://");
  const client = isHttps ? https : http;

  const urlObj = new URL(url);
  const headers = { ...options.headers };

  // Set Content-Length if body is provided
  if (options.body) {
    headers["Content-Length"] = Buffer.byteLength(options.body);
  }

  const requestOptions = {
    hostname: urlObj.hostname,
    port: urlObj.port || (isHttps ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    method: options.method || "GET",
    headers,
    rejectUnauthorized: false, // Equivalent to -SkipCertificateCheck in PowerShell
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const req = client.request(requestOptions, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(data));
              } catch {
                resolve(data);
              }
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          });
        });

        req.on("error", (error) => {
          reject(error);
        });

        if (options.body) {
          req.write(options.body);
        }

        req.end();
      });
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }
}

// Get authentication token
async function getAuthToken(appAuthUrl, username, password) {
  console.log(`Get-AuthToken: appAuthUrl ${appAuthUrl}`);

  const body = new URLSearchParams({
    username,
    password,
    grant_type: "password",
  });

  try {
    const response = await httpRequest(
      appAuthUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      },
      3,
      2000,
    );

    return response.access_token;
  } catch (error) {
    console.error(`Error getting auth token: ${error.message}`);
    throw error;
  }
}

// Fetch JSON from URL
async function fetchJson(url, retries = 5, retryInterval = 5000) {
  try {
    const response = await httpRequest(url, {}, retries, retryInterval);
    return typeof response === "string" ? JSON.parse(response) : response;
  } catch (error) {
    console.error(`Error fetching JSON from ${url}: ${error.message}`);
    throw error;
  }
}

// Get installed modules from systeminfo (case-insensitive)
function getInstalledModules(systeminfo) {
  let modules = systeminfo.installedModules || systeminfo.InstalledModules;
  if (!modules) {
    const keys = Object.keys(systeminfo || {});
    const installedModulesKey = keys.find((key) => key.toLowerCase() === "installedmodules");
    if (installedModulesKey) {
      modules = systeminfo[installedModulesKey];
    }
  }

  if (!modules) {
    console.error("Error: systeminfo.installedModules is undefined or null");
    console.error("Response structure:", JSON.stringify(systeminfo, null, 2));
    console.error("Available properties:", Object.keys(systeminfo || {}));
    process.exit(1);
  }
  if (!Array.isArray(modules)) {
    console.error("Error: systeminfo.installedModules is not an array");
    console.error("installedModules value:", modules);
    process.exit(1);
  }

  return modules;
}

// Convert modules array to hash
function processModulesIntoHash(modules) {
  const modulesHash = {};
  modules.forEach((module) => {
    modulesHash[module.id] = module.version;
  });
  return modulesHash;
}

// Process modules hash into release and blob modules
function processModules(modulesHash) {
  const updatedReleaseModules = [];
  const updatedBlobModules = [];

  for (const [moduleId, version] of Object.entries(modulesHash)) {
    const versionParts = version.split(".");
    if (versionParts.length > 2) {
      const thirdPart = versionParts[2];
      if (/[A-Za-z-]/.test(thirdPart)) {
        updatedBlobModules.push({
          Id: moduleId,
          BlobName: version,
        });
      } else if (/^\d+$/.test(thirdPart)) {
        const versionMatch = version.match(/^\d+\.\d+\.\d+/);
        if (versionMatch) {
          updatedReleaseModules.push({
            Id: moduleId,
            Version: versionMatch[0],
          });
        }
      }
    }
  }

  return { updatedReleaseModules, updatedBlobModules };
}

// Update packages.json with modules
function updatePackagesJsonWithModules(packagesJson, updatedReleaseModules, updatedBlobModules) {
  const azureBlobSource = packagesJson.Sources.find((s) => s.Name === "AzureBlob");
  if (azureBlobSource) {
    azureBlobSource.Modules = updatedBlobModules;
  }

  const githubReleasesSource = packagesJson.Sources.find((s) => s.Name === "GithubReleases");
  if (githubReleasesSource) {
    githubReleasesSource.Modules = updatedReleaseModules;
  }
}

// Check if version is alpha/blob version
function isAlphaVersion(version) {
  return version.split(".")[2]?.match(/[A-Za-z-]/);
}

// Handle local backend
async function handleLocalBackend(apiUrl) {
  log("Local backend detected. Please enter backend credentials...");
  const username = await prompt("Enter a backend username: ");
  const password = await promptPassword("Enter a backend password: ");

  const appAuthUrl = `${apiUrl}/connect/token`;
  const checkModulesUrl = `${apiUrl}/api/platform/diagnostics/systeminfo`;

  const authToken = await getAuthToken(appAuthUrl, username, password);
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  let systeminfo;
  try {
    systeminfo = await httpRequest(checkModulesUrl, { method: "GET", headers });
  } catch (error) {
    console.error(`Failed to get system info: ${error.message}`);
    process.exit(1);
  }

  const modules = getInstalledModules(systeminfo);
  const modulesHash = processModulesIntoHash(modules);
  const { updatedReleaseModules, updatedBlobModules } = processModules(modulesHash);

  log("Modules processing complete!");
  log(`Release modules count: ${updatedReleaseModules.length}`);
  log(`Blob modules count: ${updatedBlobModules.length}`);

  const packagesJson = await fetchJson(
    "https://raw.githubusercontent.com/VirtoCommerce/vc-modules/refs/heads/master/bundles/latest/package.json",
  );

  updatePackagesJsonWithModules(packagesJson, updatedReleaseModules, updatedBlobModules);

  const platformVersion = systeminfo.platformVersion;
  if (isAlphaVersion(platformVersion)) {
    packagesJson.PlatformAssetUrl = `${blobPackagesUrl}/VirtoCommerce.Platform.${platformVersion}.zip`;
  } else {
    packagesJson.PlatformVersion = platformVersion;
  }

  return packagesJson;
}

// Handle remote backend
async function handleRemoteBackend(apiUrl) {
  const virtoCloudEnvName = apiUrl.split("//")[1].split(".")[0];
  log(`Remote backend detected. Getting packages.json from '${virtoCloudEnvName}' branch...`);

  const packagesJsonUrl = `https://raw.githubusercontent.com/VirtoCommerce/vc-deploy-dev/refs/heads/${virtoCloudEnvName}/backend/packages.json`;

  try {
    return await fetchJson(packagesJsonUrl);
  } catch (error) {
    console.error(`Failed to get packages.json from ${packagesJsonUrl}: ${error.message}`);
    process.exit(1);
  }
}

// Post-process platform version
function postProcessPlatformVersion(packagesJson) {
  const platformVersion = packagesJson.PlatformVersion;
  if (isAlphaVersion(platformVersion)) {
    log("Platform version is an alpha. Adding PlatformAssetUrl to packages.json");
    packagesJson.PlatformAssetUrl = `${blobPackagesUrl}/VirtoCommerce.Platform.${platformVersion}.zip`;
  } else {
    log("Platform version is not an alpha. Keeping packages.json as is");
  }
}

// Save packages.json to file
function savePackagesJson(packagesJson) {
  log("Saving packages list to backend-packages.json...");
  writeFileSync(join(__dirname, "..", "backend-packages.json"), JSON.stringify(packagesJson, null, 2));
  log("Packages list saved to backend-packages.json");
}

// Main function
async function main() {
  const apiUrl = getBackendUrl();
  log(`Backend URL: ${apiUrl}`);

  const packagesJson = apiUrl.includes("localhost")
    ? await handleLocalBackend(apiUrl)
    : await handleRemoteBackend(apiUrl);

  postProcessPlatformVersion(packagesJson);
  savePackagesJson(packagesJson);
}

// Run the script
main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
