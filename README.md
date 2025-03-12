# 🚀 AtomOne Docs

Welcome to **AtomOne Docs**! This is a **community-driven** effort to cover everything about AtomOne.

## 📋 Requirements

Before you get started, make sure you have the latest versions of the following installed:

- 🛠 [**golang**](https://go.dev/) - The programming language
- 📦 [**pnpm**](https://pnpm.io/) - Fast and efficient package manager

## ⚡ Installation

Get started by installing dependencies with **pnpm**:

```sh
pnpm install
```

## 🛠 Development

Run the development server:

```sh
pnpm dev
```

## 📦 Build

Build the project for production:

```sh
pnpm build
```

## 🔄 Updating Documentation Versions

Some of our docs are pulled from older versions of **cosmos-sdk**. To update them, simply run:

```sh
pnpm docs:update
```

### 🔍 What This Command Does:

1. Extracts the `cosmos-sdk` version from the `go.mod` file in the `atomone` repository.
2. Fetches the latest `atomone` repository.
3. Clones the `cosmos/cosmos-sdk` repository and switches to the extracted version.
4. Executes a `Go` script to collect enabled Cosmos modules and updates `package.json`.
5. Aggregates all necessary files to generate **fully automated** module documentation. 📖✨

## Custom Version Wrapping

Part of the documentation has access to a version wrapper.

The version wrapper allows for certain aspects of the documentation to show based on certain versions.

```md
<VersionWrap v="v1.0.0">
This documentation will only show in v1.0.0!
</VersionWrap>

<VersionWrap v="v2.0.0">
This documentation will only show in v2.0.0!
</VersionWrap>
```