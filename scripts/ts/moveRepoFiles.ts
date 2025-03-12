import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import { execSync } from 'child_process';

const MODULES_DOCS_PATH = path.join(process.cwd(), `/docs/modules`);

/**
 * Returns all markdown files for a given path
 *
 * @param {string} pathName
 * @param {string} moduleName
 * @return {*}
 */
async function getFilesForPath(pathName: string, moduleName: string) {
    const cloneDir = path.join(process.cwd(), pathName);
    return await fg([path.join(cloneDir, `/x/**/${moduleName}/*.md`).replace(/\\/gm, '/')]);
}

/**
 * Cleans up the file by removing extra header.
 * 
 * Additionally, removes extra frontmatter.
 *
 * @param {string} filePath
 * @return {*} 
 */
function cleanupVersionFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath.replace(/\\/gm, '/'), 'utf-8');
  const splitFileContent = fileContent.split('\n');

  // Start - Handle Header Removal
  while(!splitFileContent[0].includes('# ')) {
    splitFileContent.shift();
  }

  splitFileContent.shift();
  // End - Handle Header Removal

  // Fixes `4` tick bug with some documents
  for(let i = 0; i < splitFileContent.length; i++) {
    if (splitFileContent[i].includes('````')) {
      splitFileContent[i] = splitFileContent[i].replace('````', '```');
    }
  }

  return splitFileContent.join('\n');
}

/**
 * Takes the module path, and markdown files associated with the file,
 * creates a folder called `versions` and reads the content and makes a 'partitioned file'.
 *
 * The partitioned file path is appended to the main module file.
 *
 * This creates a partitioned main file which allows for easy version swapping.
 *
 * @param {string} moduleName
 * @param {string[]} markdownFiles
 * @param {string} version
 */
async function updateFiles(moduleName: string, markdownFiles: string[], version: string) {
    for (let filePath of markdownFiles) {
        let fileBaseName = path.basename(filePath);
        if (fileBaseName.toLowerCase().includes('changelog')) {
            continue;
        }

        if (fileBaseName.toLowerCase() === 'readme.md') {
            fileBaseName = 'index.md';
        }

        // fs.mkdirSync(`${MODULES_DOCS_PATH}/${moduleName}/versions`, {
        //     recursive: true,
        // });

        // fs.writeFileSync(
        //     `${MODULES_DOCS_PATH}/${moduleName}/versions/${fileBaseName.replace('.md', '')}-${version}.md`,
        //     cleanupVersionFile(filePath)
        // );

        if (!fs.existsSync(`${MODULES_DOCS_PATH}/${moduleName}/${fileBaseName}`)) {
          fs.appendFileSync(`${MODULES_DOCS_PATH}/${moduleName}/${fileBaseName}`, `# x/\`${moduleName}\` \r\n`)
        }

        let mainFile =
            `\n<VersionWrap v="${version}">\r\n` +
            cleanupVersionFile(filePath) +
            `\r\n</VersionWrap>\r\n`;
        fs.appendFileSync(`${MODULES_DOCS_PATH}/${moduleName}/${fileBaseName}`, mainFile);
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

/**
 * Reads the `go.mod` file and returns the SDK version.
 *
 * @param {string} [branchOrTag="main"]
 * @return {*}
 */
async function getSdkVersion(branchOrTag = 'main') {
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
    for (let line of data.split('\n')) {
        if (!line.includes('github.com/cosmos/cosmos-sdk')) {
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

/**
 * Builds documentation data dynamically by reading versions from all package.json, fetching sdk version, and changing repo branch with git checkout.
 *
 */
async function start() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    purge([...packageJson.cosmosModules['cosmos-sdk'], ...packageJson.cosmosModules['atomone']]);

    for (let version of packageJson.repoTags) {
        const sdkVersion = await getSdkVersion(version);
        execSync(`git checkout ${sdkVersion}`, {
            cwd: process.cwd() + `/cosmos-sdk`,
            encoding: 'utf-8',
        });

        for (let repoName of ['cosmos-sdk', 'atomone']) {
            for (let moduleName of packageJson.cosmosModules[repoName]) {
                const files = await getFilesForPath(repoName, moduleName);
                if (files.length <= 0) {
                    console.log(`Skipping Module ${moduleName}, no docs found.`);
                    continue;
                }

                await updateFiles(moduleName, files, version);
            }
        }
    }

    console.log('Moved all files, and overwrote cosmos-sdk docs with atomone docs');
}

start();
