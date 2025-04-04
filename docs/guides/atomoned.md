---
outline: deep
---

# Chain Software

AtomOne is built using the Cosmos SDK as a fork of the `Cosmos Hub` at version `v15.2.0` (common commit hash 7281c9b).

The following modifications have been made to the Cosmos Hub software to create AtomOne:

1. Removed x/globalfee module and revert to older and simpler fee decorator
2. Removed Packet Forwarding Middleware
3. Removed Interchain Security module
4. Reverted to standard Cosmos SDK v0.47.10 without the Liquid Staking Module (LSM)
5. Changed Bech32 prefixes to atone (see cmd/atomoned/cmd/config.go)
6. Removed ability for validators to vote on proposals with delegations, they can only use their own stake

## Important Links

- [Latest AtomOne Chain Releases](https://github.com/atomone-hub/atomone/releases/)
- [Genesis Repository](https://github.com/atomone-hub/genesis)
- [Explore Validators](../validators/services.md)
- [Explore APIs](../validators/registry.md)

## Basic Usage

```
Usage:
  atomoned [command]

Available Commands:
  config      Create or query an application CLI configuration file
  debug       Tool for helping with debugging your application
  export      Export state to JSON
  genesis     Application's genesis-related subcommands
  help        Help about any command
  init        Initialize private validator, p2p, genesis, and application configuration files
  keys        Manage your application's keys
  prune       Prune app history states by keeping the recent heights and deleting old heights
  query       Querying subcommands
  rollback    rollback cosmos-sdk and tendermint state by one height
  rosetta     spin up a rosetta server
  snapshots   Manage local snapshots
  start       Run the full node
  status      Query remote node for status
  tendermint  Tendermint subcommands
  testnet     subcommands for starting or configuring local testnets
  tx          Transactions subcommands
  version     Print the application binary version information

Flags:
  -h, --help                help for atomoned
      --home string         directory for config and data (default "C:\\Users\\trevo\\.atomone")
      --log_format string   The logging format (json|plain) (default "plain")
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic) (default "info")
      --log_no_color        Disable colored logs
      --trace               print out full stack trace on errors

Use "atomoned [command] --help" for more information about a command.
```

## Basic Commands

Careful when pasting your private key into any CLI based software.

Additionally, ensure you clear CLI history after using CLI based software.


### Query Status

```sh
atomoned status --node=https://atomone-rpc.allinbits.com:443
```

### Query Account

```sh
atomoned query account <address> --node=https://atomone-rpc.allinbits.com:443
```

### Query Block

```sh
atomoned query block <height> --node=https://atomone-rpc.allinbits.com:443
```

### Query Transaction

```sh
atomoned query tx <tx_hash> --node=https://atomone-rpc.allinbits.com:443
```

### Query Validators

```sh
atomoned query staking validators --node=https://atomone-rpc.allinbits.com:443
```

### Query Proposal

```sh
atomoned query gov proposal <prop_number> --node=https://atomone-rpc.allinbits.com:443
```

### Send

```sh
atomoned tx bank send <pub_key> <receiver_address> 1000000uatone --node=https://atomone-rpc.allinbits.com:443 --from=<private_key>
```

### Vote

Vote options are `yes`, `no`, and `no_with_veto`.

```sh
atomoned tx gov vote <prop_number> <vote_option> --node=https://atomone-rpc.allinbits.com:443 --from=<private_key>
```

### Delegate / Stake

```sh
atomoned tx staking delegate <validator_address> <amount> --node=https://atomone-rpc.allinbits.com:443 --from=<private_key>
```

### Undelegate

```sh
atomoned tx staking undelegate <validator_address> <amount> --node=https://atomone-rpc.allinbits.com:443 --from=<private_key>
```

### Claim Rewards

```sh
atomoned tx distribution withdraw-rewards <validator_address> --node=https://atomone-rpc.allinbits.com:443 --from=<private_key>
```