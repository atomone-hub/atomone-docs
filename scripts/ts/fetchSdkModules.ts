import { execSync } from 'child_process';
import path from 'node:path';
import fs from 'node:fs';

try {
    const cwd = process.cwd().replace(/\\/gm, '/');
    const resultJson = execSync(`go run ${cwd}/scripts/go/fetch_sdk_modules.go -- ${cwd}/atomone/app/modules.go`, {
        encoding: 'utf-8',
    });

    const trimmedResults: { [repoName: string]: string[] } = {
        'cosmos-sdk': [],
        atomone: [],
    };

    for (let result of JSON.parse(resultJson)) {
        if (result.includes('github.com/cosmos/cosmos-sdk/')) {
            trimmedResults['cosmos-sdk'].push(result.replace('github.com/cosmos/cosmos-sdk/x/', ''));
            continue;
        }

        if (result.includes('github.com/atomone-hub/atomone/')) {
            trimmedResults['atomone'].push(result.replace('github.com/atomone-hub/atomone/x/', ''));
            continue;
        }
    }

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    packageJson.cosmosModules = trimmedResults;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log(trimmedResults);
} catch (error) {
    console.error('Error executing Go command:', error);
    process.exit(1);
}
