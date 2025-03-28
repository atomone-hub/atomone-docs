# Useful Commands for AtomOne Node
> Here are some essential commands to help you manage your AtomOne node efficiently

## 🔑 Key management

#### Add new key

```bash
atomoned keys add wallet
```

#### Recover existing key

```bash
atomoned keys add wallet --recover
```

#### List all keys

```bash
atomoned keys list
```

#### Delete key

```bash
atomoned keys delete wallet
```

#### Export key to the file

```bash
atomoned keys export wallet
```

#### Import key from the file

```bash
atomoned keys import wallet wallet.backup
```

#### Query wallet balance

```bash
atomoned q bank balances $(atomoned keys show wallet -a)
```

## 👷 Validator management


- Please make sure you have adjusted **moniker**, **identity**, **details** and **website** to match your values.


#### Create new validator

```bash
atomoned tx staking create-validator \
--amount 1000000uatone \
--pubkey $(atomoned tendermint show-validator) \
--moniker "YOUR_MONIKER_NAME" \
--identity "YOUR_KEYBASE_ID" \
--details "YOUR_DETAILS" \
--website "YOUR_WEBSITE_URL" \
--chain-id atomone-1 \
--commission-rate 0.05 \
--commission-max-rate 0.20 \
--commission-max-change-rate 0.01 \
--min-self-delegation 1 \
--from wallet \
--gas-adjustment 1.4 \
--gas auto \
--gas-prices 0.025uatone \
-y
```

#### Edit existing validator

```bash
atomoned tx staking edit-validator \
--new-moniker "YOUR_MONIKER_NAME" \
--identity "YOUR_KEYBASE_ID" \
--details "YOUR_DETAILS" \
--website "YOUR_WEBSITE_URL"
--chain-id atomone-1 \
--commission-rate 0.05 \
--from wallet \
--gas-adjustment 1.4 \
--gas auto \
--gas-prices 0.025uatone \
-y
```

#### Unjail validator

```bash
atomoned tx slashing unjail --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Jail reason

```bash
atomoned query slashing signing-info $(atomoned tendermint show-validator)
```

#### List all active validators

```bash
atomoned q staking validators -oj --limit=3000 | jq '.validators[] | select(.status=="BOND_STATUS_BONDED")' | jq -r '(.tokens|tonumber/pow(10; 6)|floor|tostring) + " \t " + .description.moniker' | sort -gr | nl
```

#### List all inactive validators

```bash
atomoned q staking validators -oj --limit=3000 | jq '.validators[] | select(.status=="BOND_STATUS_UNBONDED")' | jq -r '(.tokens|tonumber/pow(10; 6)|floor|tostring) + " \t " + .description.moniker' | sort -gr | nl
```

#### View validator details

```bash
atomoned q staking validator $(atomoned keys show wallet --bech val -a)
```

## 💲 Token management

#### Withdraw rewards from all validators

```bash
atomoned tx distribution withdraw-all-rewards --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Withdraw commission and rewards from your validator

```bash
atomoned tx distribution withdraw-rewards $(atomoned keys show wallet --bech val -a) --commission --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Delegate tokens to yourself

```bash
atomoned tx staking delegate $(atomoned keys show wallet --bech val -a) 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Delegate tokens to validator

```bash
atomoned tx staking delegate <TO_VALOPER_ADDRESS> 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Redelegate tokens to another validator

```bash
atomoned tx staking redelegate $(atomoned keys show wallet --bech val -a) <TO_VALOPER_ADDRESS> 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Unbond tokens from your validator

```bash
atomoned tx staking unbond $(atomoned keys show wallet --bech val -a) 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Send tokens to the wallet

```bash
atomoned tx bank send wallet <TO_WALLET_ADDRESS> 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

## 🗳 Governance

#### List all proposals

```bash
atomoned query gov proposals
```

#### View proposal by id

```bash
atomoned query gov proposal 1
```

#### Vote 'Yes'

```bash
atomoned tx gov vote 1 yes --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Vote 'No'

```bash
atomoned tx gov vote 1 no --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Vote 'Abstain'

```bash
atomoned tx gov vote 1 abstain --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Vote 'NoWithVeto'

```bash
atomoned tx gov vote 1 NoWithVeto --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

## ⚡️ Utility

#### Update Indexer

##### Disable indexer

```bash
sed -i -e 's|^indexer *=.*|indexer = "null"|' $HOME/.canine/config/config.toml
```

##### Enable indexer

```bash
sed -i -e 's|^indexer *=.*|indexer = "kv"|' $HOME/.canine/config/config.toml
```

#### Update pruning

```bash
sed -i \
  -e 's|^pruning *=.*|pruning = "custom"|' \
  -e 's|^pruning-keep-recent *=.*|pruning-keep-recent = "100"|' \
  -e 's|^pruning-keep-every *=.*|pruning-keep-every = "0"|' \
  -e 's|^pruning-interval *=.*|pruning-interval = "19"|' \
  $HOME/.canine/config/app.toml
```

## 🚨 Maintenance

#### Get validator info

```bash
atomoned status 2>&1 | jq .ValidatorInfo
```

#### Get sync info

```bash
atomoned status 2>&1 | jq .SyncInfo
```

#### Get node peer

```bash
echo $(atomoned tendermint show-node-id)'@'$(curl -s ifconfig.me)':'$(cat $HOME/.canine/config/config.toml | sed -n '/Address to listen for incoming connection/{n;p;}' | sed 's/.*://; s/".*//')
```

#### Check if validator key is correct

```bash
[[ $(atomoned q staking validator $(atomoned keys show wallet --bech val -a) -oj | jq -r .consensus_pubkey.key) = $(atomoned status | jq -r .ValidatorInfo.PubKey.value) ]] && echo -e "\n\e[1m\e[32mTrue\e[0m\n" || echo -e "\n\e[1m\e[31mFalse\e[0m\n"
```

#### Get live peers

```bash
curl -sS http://localhost:27657/net_info | jq -r '.result.peers[] | "\(.node_info.id)@\(.remote_ip):\(.node_info.listen_addr)"' | awk -F ':' '{print $1":"$(NF)}'
```

#### Set minimum gas price

```bash
sed -i -e "s/^minimum-gas-prices *=.*/minimum-gas-prices = \"0.025uatone\"/" $HOME/.canine/config/app.toml
```

#### Enable prometheus

```bash
sed -i -e "s/prometheus = false/prometheus = true/" $HOME/.canine/config/config.toml
```

#### Reset chain data

```bash
atomoned tendermint unsafe-reset-all --home $HOME/.canine --keep-addr-book
```

#### Remove node

- Please, before proceeding with the next step! All chain data will be lost! Make sure you have backed up your **priv_validator_key.json**!


```bash
cd $HOME
sudo systemctl stop atomone
sudo systemctl disable atomone
sudo rm /etc/systemd/system/atomone.service
sudo systemctl daemon-reload
rm -f $(which atomoned)
rm -rf $HOME/.atomone
rm -rf $HOME/atomone
```

## ⚙️ Service Management

#### Reload service configuration

```bash
sudo systemctl daemon-reload
```

#### Enable service

```bash
sudo systemctl enable atomone
```

#### Disable service

```bash
sudo systemctl disable atomone
```

#### Start service

```bash
sudo systemctl start atomone
```

#### Stop service

```bash
sudo systemctl stop atomone
```

#### Restart service

```bash
sudo systemctl restart atomone
```

#### Check service status

```bash
sudo systemctl status atomone
```

#### Check service logs

```bash
sudo journalctl -u atomone -f --no-hostname -o cat
```
