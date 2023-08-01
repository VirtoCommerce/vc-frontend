import { promises as fs } from "fs";
import path from "path";
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
  const filePath = path.resolve(__dirname, "../config/routes.json");
  const fileContent = JSON.stringify(routes, null, "  ");

  console.log("Routes (RegExp):", routes);

  await fs.writeFile(filePath, fileContent);

  console.log(`The file "config/routes.json" has been created!`);
}

await createFile();

process.exit();
