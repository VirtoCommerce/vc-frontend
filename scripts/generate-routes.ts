import { writeFile } from "fs/promises";
import { resolve } from "path";
import chalk from "chalk";
import { createRouterMatcher } from "vue-router";
import { mainRoutes } from "../client-app/router/routes";

function getRoutes(): string[] {
  const excludedPaths = ["/", "/403", "/404", "/500", "/:pathMatch(.*)*"];
  const matcher = createRouterMatcher(mainRoutes, {
    strict: false,
    sensitive: false,
  });

  return matcher
    .getRoutes()
    .filter((route) => !excludedPaths.includes(route.record.path))
    .map((route) => route.re.toString());
}

async function createFile(): Promise<void> {
  const routes = getRoutes();
  const filePath = resolve(__dirname, "../config/routes.json");
  const fileContent = JSON.stringify(routes, null, "  ");

  console.log("Routes (regular expression):", routes);

  await writeFile(filePath, fileContent);
}

try {
  console.log("Generating routes...");

  await createFile();

  console.log(chalk.green("Routes successfully generated!"));
} catch (error) {
  console.error(chalk.red("Routes generation failed!"));
  throw error;
} finally {
  // Because of dependency hell we need to exit the process manually
  process.exit();
}
