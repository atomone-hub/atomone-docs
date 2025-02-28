import * as fs from 'fs';
import * as path from 'path';

const MODULES_ENDPOINT = `https://rest.cosmos.directory/atomone/cosmos/upgrade/v1beta1/module_versions`
const STATUS_RPC_ENDPOINT = `https://rpc.cosmos.directory/atomone/status`

async function fetchModuleVersions() {
  try {
    const response = await fetch(MODULES_ENDPOINT);
    if (!response.ok) {
      throw new Error('Could not fetch module versions from endpoint.');
    }
    
    const data = await response.json();
    const moduleVersions = data.module_versions as { name: string, version: string}[];
    const modules: { [key: string]: string } = {};

    for(let module of moduleVersions) {
        console.log(`package.json | ${module.name} - v${module.version}`);
        modules[module.name] = module.version;
    }

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.cosmosModules = modules;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log('package.json | cosmosModules Updated');
  } catch (error) {
    console.error('Error fetching module versions or updating package.json:', error);
  }
}

async function fetchCosmosSdkVersion() {
  try {
    const response = await fetch(STATUS_RPC_ENDPOINT);
    
    if (!response.ok) {
      throw new Error('Could not fetch status from rpc endpoint.');
    }
    
    const data = await response.json();
    const nodeInfo = data.result.node_info;

    const cosmosSdkVersion = nodeInfo.version;
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    packageJson.cosmosSdkVersion = cosmosSdkVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log('package.json | cosmosSdkVersion Updated');
  } catch (error) {
    console.error('Error fetching Cosmos SDK version or updating package.json:', error);
  }
}

async function updateData() {
  console.log('package.json | Fetching Chain Versions');
  await fetchModuleVersions();
  await fetchCosmosSdkVersion();
  console.log('package.json | Updates Complete');
}

updateData();