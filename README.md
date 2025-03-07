# AtomOne Docs

This documentation is a community effort which covers all things AtomOne.

## Requirements

- Grab the latest version of [golang](https://go.dev/) and install it.
- Grab the latest version of [pnpm](https://pnpm.io/) and install it.

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

1. Grabs the `cosmos sdk version` from the `go.mod` file in the `atomone` repository
2. Grabs the latest `atomone` repository
3. Grabs the `cosmos/cosmos-sdk` repository, and flips branch to `cosmos sdk version` extract from step 1
4. Runs a `go` script to collect all the cosmos modules enabled, places them in the `package.json`
5. Moves all files from both repositories, and aggregates them to create fully automated module documentation.