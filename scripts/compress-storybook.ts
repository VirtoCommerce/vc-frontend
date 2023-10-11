import packageJson from "../package.json";
import { getArtifactFileName, compress } from "./compress";

const name = packageJson.name;
const version = packageJson.version;

const artifactFileName = getArtifactFileName(`${name}-storybook-${version}`);

await compress(artifactFileName, (archive) => {
  archive.addLocalFolder("storybook-static");
});
