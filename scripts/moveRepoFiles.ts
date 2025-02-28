import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";

const MODULES_DOCS_PATH = path.join(process.cwd(), `/docs/modules`);

async function getFilesForPath(pathName: string, moduleName: string) {
  const cloneDir = path.join(process.cwd(), pathName);
  return await fg([
    path.join(cloneDir, `/x/**/${moduleName}/*.md`).replace(/\\/gm, "/"),
  ]);
}

async function updateFiles(moduleName: string, markdownFiles: string[]) {
  for (let filePath of markdownFiles) {
    let fileBaseName = path.basename(filePath);
    if (fileBaseName.toLowerCase().includes("changelog")) {
      continue;
    }

    if (fileBaseName.toLowerCase() === "readme.md") {
      fileBaseName = "index.md";
    }

    fs.cpSync(
      `${filePath.replace(/\\/gm, "/")}`,
      `${MODULES_DOCS_PATH}/${moduleName}/${fileBaseName}`,
      { force: true }
    );
  }
}

function purge(modules: string[]) {
  for (const moduleName of modules) {
    fs.rmSync(`${MODULES_DOCS_PATH}/${moduleName}`, {
      force: true,
      recursive: true,
    });
    fs.mkdirSync(`${MODULES_DOCS_PATH}/${moduleName}`, { recursive: true });
  }
}

async function start() {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const cosmosModules: { [moduleName: string]: string } =
    packageJson.cosmosModules;

  purge(Object.keys(cosmosModules));

  for (let moduleName of Object.keys(cosmosModules)) {
    const cosmosFiles = await getFilesForPath("cosmossdk", moduleName);
    const atomOneFiles = await getFilesForPath("atomone", moduleName);
    await updateFiles(moduleName, cosmosFiles);
    await updateFiles(moduleName, atomOneFiles); // This overwrites the cosmossdk files if present
  }

  console.log('Moved all files, and overwrote cosmos-sdk docs with atomone docs');
}

start();
