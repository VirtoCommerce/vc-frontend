import { getArtifactFileName, compress } from "./compress";
import packageJson from "../package.json";

const name = packageJson.name;
const version = packageJson.version;

const artifactFileName = getArtifactFileName(`${name}-storybook-${version}`);

compress(artifactFileName, (archive) => {
  archive.addLocalFolder("storybook-static");
});
