import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

async function cloneRepo(externalRepoPath: string, folderName: string, branch: string) {
  try {
    const cloneDir = path.join(process.cwd(), folderName);
    if (fs.existsSync(cloneDir)) {
      fs.rmSync(cloneDir, { recursive: true });
    }

    execSync(`git clone --single-branch --branch ${branch} ${externalRepoPath} ${cloneDir}`, { stdio: "inherit" });
    console.log(`Successfully cloned ${externalRepoPath}`);
  } catch (error) {
    console.error(`Error cloning repository (${externalRepoPath}):`, error);
  }
}

async function getSdkVersion() {
  const result = await fetch('https://raw.githubusercontent.com/atomone-hub/atomone/refs/heads/main/go.mod');
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
  const sdkVersion = await getSdkVersion();
  console.log(sdkVersion);

  const promises = [
    cloneRepo("https://github.com/atomone-hub/atomone", "atomone", "main"),
    cloneRepo("https://github.com/cosmos/cosmos-sdk", "cosmos-sdk", sdkVersion),
  ];

  await Promise.all(promises);
}

start();
