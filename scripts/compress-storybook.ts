import packageJson from "../package.json";
import { compress } from "./compress";

const name = packageJson.name;
const version = packageJson.version;

const artifactFileName = `${name}-storybook-${version}`;

await compress(artifactFileName, (archive) => {
  archive.addLocalFolder("storybook-static");
});
