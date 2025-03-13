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

## Updating Versions

If you need to show new versions, head on into `package.json` and find the `repoTags` section.

Update which versions you want to display based on the [AtomOne Repository](https://github.com/atomone-hub/atomone).

**Example**

```
  "repoTags": [
    "v2.0.0-alpha.3",
    "v2.0.0-alpha.2",
    "v2.0.0-alpha.1",
    "v1.1.1",
    "v1.1.0"
  ],
```

Everything else will update after you run `pnpm docs:update`.