import { execSync } from 'child_process';
import path from 'node:path';
import fs from 'node:fs';
import { repoTags } from '../../package.json';

type VersionResults = {
    'atomone': {
        [version: string]: string[]
    },
    'cosmos-sdk': {
        [version: string]: string[]
    } 
}


try {
    const trimmedResults: VersionResults = {
        'cosmos-sdk': {},
        'atomone': {}
    };

    for (let version of repoTags) {
        execSync(`git checkout ${version}`, {
            cwd: process.cwd() + `/atomone`,
            encoding: 'utf-8',
        });


        const cwd = process.cwd().replace(/\\/gm, '/');
        const resultJson = execSync(`go run ${cwd}/scripts/go/fetch_sdk_modules.go -- ${cwd}/atomone/app/modules.go`, {
            encoding: 'utf-8',
        });

        if (!trimmedResults['atomone'][version]) {
            trimmedResults['atomone'][version] = [];
        }

        if (!trimmedResults['cosmos-sdk'][version]) {
            trimmedResults['cosmos-sdk'][version] = [];
        }


        for (let result of JSON.parse(resultJson)) {
            if (result.includes('github.com/cosmos/cosmos-sdk/')) {
                if (!trimmedResults['cosmos-sdk'][version]) {
                    trimmedResults['cosmos-sdk'][version] = [];
                }

                trimmedResults['cosmos-sdk'][version].push(result.replace('github.com/cosmos/cosmos-sdk/x/', ''));
                continue;
            }
    
            if (result.includes('github.com/atomone-hub/atomone/')) {
                if (!trimmedResults['atomone'][version]) {
                    trimmedResults['atomone'][version] = [];
                }

                trimmedResults['atomone'][version].push(result.replace('github.com/atomone-hub/atomone/x/', ''));
                continue;
            }
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
