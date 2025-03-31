# Atomone Upgrade Instructions

This document outlines the steps to upgrade your Atomone node. By using Cosmovisor, you can easily manage upgrades by simply building the new binaries and placing them in the appropriate Cosmovisor upgrade directory.

## Upgrade Steps

### 1. Clone the Project Repository
First, clone the Atomone project repository to your machine by running the following commands:

```
cd $HOME
rm -rf atomone
git clone https://github.com/atomone-hub/atomone
cd atomone
git checkout v1.1.2
```


### 2. Build the Binaries
Once the repository is cloned, you need to build the binaries for the new version. Use the following command to do so:
```
make build
```

### 3. Prepare the Binaries for Cosmovisor
After building the binaries, move them to the appropriate directory for Cosmovisor to manage. Run the following commands:
```
mkdir -p $HOME/.atomone/cosmovisor/upgrades/v1.1.2/bin
mv build/atomoned $HOME/.atomone/cosmovisor/upgrades/v1.1.2/bin/
rm -rf build
```

### 4. Upgrade Complete
After completing the above steps, Cosmovisor will automatically handle the upgrade when the upgrade block height is reached, and the new version will be launched without manual intervention.
