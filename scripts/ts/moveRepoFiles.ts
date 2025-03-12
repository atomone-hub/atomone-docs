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

async function getSdkVersion(branchOrTag = "main") {
  let result: Response;
  if (!branchOrTag.includes('v')) {
    result = await fetch(`https://raw.githubusercontent.com/atomone-hub/atomone/refs/heads/${branchOrTag}/go.mod`);
  } else {
    result = await fetch(`https://raw.githubusercontent.com/atomone-hub/atomone/refs/tags/${branchOrTag}/go.mod`);
  } 

  if (!result.ok) {
    console.error(`Failed to fetch go.mod file from GitHub`);
    process.exit(1);
  }

  const data = await result.text();
  for(let line of data.split('\n')) {
    if (!line.includes("github.com/cosmos/cosmos-sdk")) {
      continue;
    }

    const splitResults = line.trim().split(' ');
    if (splitResults.length <= 1) {
      continue;
    }

    return splitResults[1];
  }

  console.error(`Failed to extract version from go.mod file.`);
  process.exit(1);
}

async function start() {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  purge([...packageJson.cosmosModules['cosmos-sdk'], ...packageJson.cosmosModules['atomone']]);

  for (let repoName of ['cosmos-sdk', 'atomone']) {
    for (let moduleName of packageJson.cosmosModules[repoName]) {
      const files = await getFilesForPath(repoName, moduleName);
      if (files.length <= 0) {
        console.log(`Skipping Module ${moduleName}, no docs found.`);
        continue;
      }

      await updateFiles(moduleName, files);
    }
  }

  console.log('Moved all files, and overwrote cosmos-sdk docs with atomone docs');
}

start();
