# Useful Commands
> Here are some essential commands to help you manage your AtomOne node efficiently

## 🔑 Key management

#### Add new key

```sh
atomoned keys add wallet
```

#### Recover existing key

```sh
atomoned keys add wallet --recover
```

#### List all keys

```sh
atomoned keys list
```

#### Delete key

```sh
atomoned keys delete wallet
```

#### Export key to the file

```sh
atomoned keys export wallet
```

#### Import key from the file

```sh
atomoned keys import wallet wallet.backup
```

#### Query wallet balance

```sh
atomoned q bank balances $(atomoned keys show wallet -a)
```

## 👷 Validator management


- Please make sure you have adjusted **moniker**, **identity**, **details** and **website** to match your values.


#### Create new validator

```sh
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

```sh
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

```sh
atomoned tx slashing unjail --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Jail reason

```sh
atomoned query slashing signing-info $(atomoned tendermint show-validator)
```

#### List all active validators

```sh
atomoned q staking validators -oj --limit=3000 | jq '.validators[] | select(.status=="BOND_STATUS_BONDED")' | jq -r '(.tokens|tonumber/pow(10; 6)|floor|tostring) + " \t " + .description.moniker' | sort -gr | nl
```

#### List all inactive validators

```sh
atomoned q staking validators -oj --limit=3000 | jq '.validators[] | select(.status=="BOND_STATUS_UNBONDED")' | jq -r '(.tokens|tonumber/pow(10; 6)|floor|tostring) + " \t " + .description.moniker' | sort -gr | nl
```

#### View validator details

```sh
atomoned q staking validator $(atomoned keys show wallet --bech val -a)
```

## 💲 Token management

#### Withdraw rewards from all validators

```sh
atomoned tx distribution withdraw-all-rewards --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Withdraw commission and rewards from your validator

```sh
atomoned tx distribution withdraw-rewards $(atomoned keys show wallet --bech val -a) --commission --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Delegate tokens to yourself

```sh
atomoned tx staking delegate $(atomoned keys show wallet --bech val -a) 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Delegate tokens to validator

```sh
atomoned tx staking delegate <TO_VALOPER_ADDRESS> 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Redelegate tokens to another validator

```sh
atomoned tx staking redelegate $(atomoned keys show wallet --bech val -a) <TO_VALOPER_ADDRESS> 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Unbond tokens from your validator

```sh
atomoned tx staking unbond $(atomoned keys show wallet --bech val -a) 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Send tokens to the wallet

```sh
atomoned tx bank send wallet <TO_WALLET_ADDRESS> 1000000uatone --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

## 🗳 Governance

#### List all proposals

```sh
atomoned query gov proposals
```

#### View proposal by id

```sh
atomoned query gov proposal 1
```

#### Vote 'Yes'

```sh
atomoned tx gov vote 1 yes --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Vote 'No'

```sh
atomoned tx gov vote 1 no --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Vote 'Abstain'

```sh
atomoned tx gov vote 1 abstain --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

#### Vote 'NoWithVeto'

```sh
atomoned tx gov vote 1 NoWithVeto --from wallet --chain-id atomone-1 --gas-adjustment 1.4 --gas auto --gas-prices 0.025uatone -y
```

## ⚡️ Utility

#### Update Indexer

##### Disable indexer

```sh
sed -i -e 's|^indexer *=.*|indexer = "null"|' $HOME/.atomone/config/config.toml
```

##### Enable indexer

```sh
sed -i -e 's|^indexer *=.*|indexer = "kv"|' $HOME/.atomone/config/config.toml
```

#### Update pruning

```sh
sed -i \
  -e 's|^pruning *=.*|pruning = "custom"|' \
  -e 's|^pruning-keep-recent *=.*|pruning-keep-recent = "100"|' \
  -e 's|^pruning-keep-every *=.*|pruning-keep-every = "0"|' \
  -e 's|^pruning-interval *=.*|pruning-interval = "19"|' \
  $HOME/.atomone/config/app.toml
```

## 🚨 Maintenance

#### Get validator info

```sh
atomoned status 2>&1 | jq .ValidatorInfo
```

#### Get sync info

```sh
atomoned status 2>&1 | jq .SyncInfo
```

#### Get node peer

```sh
echo $(atomoned tendermint show-node-id)'@'$(curl -s ifconfig.me)':'$(cat $HOME/.atomone/config/config.toml | sed -n '/Address to listen for incoming connection/{n;p;}' | sed 's/.*://; s/".*//')
```

#### Check if validator key is correct

```sh
[[ $(atomoned q staking validator $(atomoned keys show wallet --bech val -a) -oj | jq -r .consensus_pubkey.key) = $(atomoned status | jq -r .ValidatorInfo.PubKey.value) ]] && echo -e "\n\e[1m\e[32mTrue\e[0m\n" || echo -e "\n\e[1m\e[31mFalse\e[0m\n"
```

#### Get live peers

```sh
curl -sS http://localhost:27657/net_info | jq -r '.result.peers[] | "\(.node_info.id)@\(.remote_ip):\(.node_info.listen_addr)"' | awk -F ':' '{print $1":"$(NF)}'
```

#### Set minimum gas price

```sh
sed -i -e "s/^minimum-gas-prices *=.*/minimum-gas-prices = \"0.025uatone\"/" $HOME/.atomone/config/app.toml
```

#### Enable prometheus

```sh
sed -i -e "s/prometheus = false/prometheus = true/" $HOME/.atomone/config/config.toml
```

#### Reset chain data

```sh
atomoned tendermint unsafe-reset-all --home $HOME/.atomone --keep-addr-book
```

#### Remove node

- Please, before proceeding with the next step! All chain data will be lost! Make sure you have backed up your **priv_validator_key.json**!


```sh
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

```sh
sudo systemctl daemon-reload
```

#### Enable service

```sh
sudo systemctl enable atomone
```

#### Disable service

```sh
sudo systemctl disable atomone
```

#### Start service

```sh
sudo systemctl start atomone
```

#### Stop service

```sh
sudo systemctl stop atomone
```

#### Restart service

```sh
sudo systemctl restart atomone
```

#### Check service status

```sh
sudo systemctl status atomone
```

#### Check service logs

```sh
sudo journalctl -u atomone -f --no-hostname -o cat
```
