import { resolve, join } from "path";
import packageJson from "../package.json";
import { compress } from "./compress";

const cwd = process.cwd();
const path = join(cwd, "dist");

const name = packageJson.name;
const version = packageJson.version;

const artifactFileName = `${name}-${version}`;

await compress(artifactFileName, (archive) => {
  const entries = [
    { folder: "assets", filter: /.*(?<!index\.html)$/ },
    { folder: "config" },
    { folder: "content" },
    { folder: "static" },
    { folder: "./" },
  ];
  entries.forEach(({ folder, filter }) => archive.addLocalFolder(resolve(path, folder), `default/${folder}`, filter));
});
