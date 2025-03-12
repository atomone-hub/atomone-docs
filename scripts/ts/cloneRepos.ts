import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Clones a repository if it exists, otherwise does a simple fetch to update tags.
 *
 * @param {string} externalRepoPath
 * @param {string} folderName
 */
async function cloneRepo(externalRepoPath: string, folderName: string) {
    try {
        const cloneDir = path.join(process.cwd(), folderName);
        if (fs.existsSync(cloneDir)) {
            execSync(`git fetch`, { cwd: process.cwd() + `/${folderName}`, stdio: 'inherit' });
            console.log(`Updated Data for ${externalRepoPath}`);
        } else {
            execSync(`git clone ${externalRepoPath} ${cloneDir}`, { stdio: 'inherit' });
            console.log(`Successfully cloned ${externalRepoPath}`);
        }
    } catch (error) {
        console.error(`Error cloning repository (${externalRepoPath}):`, error);
    }
}

async function start() {
    const promises = [
        cloneRepo('https://github.com/atomone-hub/atomone', 'atomone'),
        cloneRepo('https://github.com/cosmos/cosmos-sdk', 'cosmos-sdk'),
    ];

    await Promise.all(promises);
}

start();
