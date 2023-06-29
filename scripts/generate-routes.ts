import fs from "fs";
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

function createFile(): void {
  const routes = getRoutes();
  const filePath = path.resolve(__dirname, "../config/routes.json");
  const fileContent = JSON.stringify(routes, null, "  ");

  console.log("Routes (RegExp):", routes);

  fs.writeFile(filePath, fileContent, (error) => {
    if (error) {
      throw error;
    }

    console.log(`The file "config/routes.json" has been created!`);
  });
}

createFile();
