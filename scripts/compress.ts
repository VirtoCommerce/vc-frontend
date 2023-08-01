import { default as zip } from "adm-zip";

const zipFile = new zip();
zipFile.addLocalFolder("./dist");
