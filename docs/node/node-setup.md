# AtomOne Node Setup Guide
> Replace YOUR_MONIKER_GOES_HERE with your validator name

```
MONIKER="YOUR_MONIKER_GOES_HERE"
```

# Install dependencies
## Update system and install build tools
```
sudo apt -q update
sudo apt -qy install curl git jq lz4 build-essential
sudo apt -qy upgrade
```
# Install Go
```
sudo rm -rf /usr/local/go
curl -Ls https://go.dev/dl/go1.22.10.linux-amd64.tar.gz | sudo tar -xzf - -C /usr/local
eval $(echo 'export PATH=$PATH:/usr/local/go/bin' | sudo tee /etc/profile.d/golang.sh)
eval $(echo 'export PATH=$PATH:$HOME/go/bin' | tee -a $HOME/.profile)
```
# Download and build binaries
```
# Clone project repository
cd $HOME
rm -rf atomone
git clone https://github.com/atomone-hub/atomone
cd atomone
git checkout v1.1.2

# Build binaries
make build

# Prepare binaries for Cosmovisor
mkdir -p $HOME/.atomone/cosmovisor/genesis/bin
mv build/atomoned $HOME/.atomone/cosmovisor/genesis/bin/
rm -rf build

# Create application symlinks
ln -s $HOME/.atomone/cosmovisor/genesis $HOME/.atomone/cosmovisor/current -f
sudo ln -s $HOME/.atomone/cosmovisor/current/bin/atomoned /usr/local/bin/atomoned -f
```
# Install Cosmovisor and create a service
```
# Download and install Cosmovisor
go install cosmossdk.io/tools/cosmovisor/cmd/cosmovisor@v1.6.0

# Create service
sudo tee /etc/systemd/system/atomone.service > /dev/null << EOF
[Unit]
Description=atomone node service
After=network-online.target

[Service]
User=$USER
ExecStart=$(which cosmovisor) run start
Restart=on-failure
RestartSec=10
LimitNOFILE=65535
Environment="DAEMON_HOME=$HOME/.atomone"
Environment="DAEMON_NAME=atomoned"
Environment="UNSAFE_SKIP_BACKUP=true"
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:$HOME/.atomone/cosmovisor/current/bin"

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable atomone.service
```
# Set node configuration
```
# Set node configuration
atomoned config set client chain-id atomone-1
atomoned config set client keyring-backend os
atomoned config set client node tcp://localhost:26657
```

# Initialize the node
```
# Initialize the node
atomoned init $MONIKER --chain-id atomone-1

# Download genesis and addrbook
curl -Ls https://ss.nodeist.net/atomone/genesis.json > $HOME/.atomone/config/genesis.json
curl -Ls https://ss.nodeist.net/atomone/addrbook.json > $HOME/.atomone/config/addrbook.json

# Add peers
PEERS="6a5b68893b69da2b0672ee0f7fec9b76663fb144@82.113.25.144:26656,8772ddb3e4331f6404dc280c1bc5626099e227bc@65.21.234.111:15656,ca1d8ab2fdc1cbff4c8283ddbcc8fd53a7d9a254@65.21.215.167:26656,a31d85900f6562b3a8b275617359643a5607ed40@146.70.243.163:26656,acdc4b1e0aa756a70d4c1b52f094a7ffbda76186@81.17.97.74:26656,a05191b9ec3023be00e9584d5255f7dfcd3a167e@135.181.138.95:2110"
sed -i -e "/^\[p2p\]/,/^\[/{s/^[[:space:]]*persistent_peers *=.*/persistent_peers = \"$PEERS\"/}" $HOME/.atomone/config/config.toml

# Set minimum gas price
sed -i -e "s|^minimum-gas-prices *=.*|minimum-gas-prices = \"0.001uatone\"|" $HOME/.atomone/config/app.toml

# Set pruning
sed -i \
  -e 's|^pruning *=.*|pruning = "custom"|' \
  -e 's|^pruning-keep-recent *=.*|pruning-keep-recent = "100"|' \
  -e 's|^pruning-keep-every *=.*|pruning-keep-every = "0"|' \
  -e 's|^pruning-interval *=.*|pruning-interval = "19"|' \
  $HOME/.atomone/config/app.toml
```
# Start service and check the logs
```
sudo systemctl start atomone.service && sudo journalctl -u atomone.service -f --no-hostname -o cat 
```
