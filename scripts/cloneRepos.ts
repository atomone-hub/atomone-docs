import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

async function cloneRepo(externalRepoPath: string, folderName: string) {
  try {
    const cloneDir = path.join(process.cwd(), folderName);
    if (fs.existsSync(cloneDir)) {
      fs.rmSync(cloneDir, { recursive: true });
    }

    execSync(`git clone ${externalRepoPath} ${cloneDir}`, { stdio: "inherit" });
    console.log(`Successfully cloned ${externalRepoPath}`);
  } catch (error) {
    console.error(`Error cloning repository (${externalRepoPath}):`, error);
  }
}

async function start() {
  const promises = [
    cloneRepo("https://github.com/cosmos/cosmos-sdk", "cosmossdk"),
    cloneRepo("https://github.com/atomone-hub/atomone", "atomone"),
  ];
  await Promise.all(promises);
}

start();
