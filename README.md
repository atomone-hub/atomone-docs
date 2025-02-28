# AtomOne Docs

This documentation is a community effort which covers all things AtomOne.

## Installation

Install using [pnpm](https://pnpm.io/) and then move on from there.

```sh
pnpm install
```

## Development

```sh
pnpm dev
```

## Build

```sh
pnpm build
```

## Updating Documentation Versions

We pull some of our docs from older versions of `cosmos-sdk`.

In order to do this, simply run the command below and it will pull the files down and update and distribute them accordingly.

```sh
pnpm docs:update
```

The command does the following:

1. Updates the `cosmosSdkVersion` in `package.json`
2. Updates the `cosmosModules` in `package.json`
3. Pulls down `cosmos-sdk` by version.
4. Grabs all markdown documentation for each given module type
5. Distributes to predefined folder in the `scripts/distributeDocs.ts` file.