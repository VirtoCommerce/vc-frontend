import { resolve } from "path";
import packageJson from "../package.json";
import { compress } from "./compress";

const cwd = process.cwd();

const name = packageJson.name;
const version = packageJson.version;

const artifactFileName = `${name}-${version}`;

await compress(artifactFileName, (archive) => {
  const entries = [
    { folder: "assets", filter: /.*(?<!index\.html)$/ },
    { folder: "config" },
    { folder: "content" },
    { folder: "layout" },
    { folder: "locales" },
    { folder: "snippets" },
    { folder: "templates" },
  ];
  entries.forEach(({ folder, filter }) => archive.addLocalFolder(resolve(cwd, folder), `default/${folder}`, filter));
});
