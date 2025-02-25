# Client

## CLI

A user can query and interact with the `gov` module using the CLI.

### Query

The `query` commands allow users to query `gov` state.

```bash
atomoned query gov --help
```

#### deposit

The `deposit` command allows users to query a deposit for a given proposal from a given depositor.

```bash
atomoned query gov deposit [proposal-id] [depositer-addr] [flags]
```

Example:

```bash
atomoned query gov deposit 1 atone1..
```

Example Output:

```bash
amount:
- amount: "100"
  denom: atone
depositor: atone1..
proposal_id: "1"
```

#### deposits

The `deposits` command allows users to query all deposits for a given proposal.

```bash
atomoned query gov deposits [proposal-id] [flags]
```

Example:

```bash
atomoned query gov deposits 1
```

Example Output:

```bash
deposits:
- amount:
  - amount: "100"
    denom: atone
  depositor: atone1..
  proposal_id: "1"
pagination:
  next_key: null
  total: "0"
```

#### param

The `param` command allows users to query a given parameter for the `gov` module.

```bash
atomoned query gov param [param-type] [flags]
```

Example:

```bash
atomoned query gov param voting
```

Example Output:

```bash
voting_period: "172800000000000"
```

#### params

The `params` command allows users to query all parameters for the `gov` module.

```bash
atomoned query gov params [flags]
```

Example:

```bash
atomoned query gov params
```

Example Output:

```bash
deposit_params:
  max_deposit_period: "172800000000000"
  min_deposit:
  - amount: "10000000"
    denom: atone
tally_params:
  quorum: "0.334000000000000000"
  threshold: "0.500000000000000000"
voting_params:
  voting_period: "172800000000000"
```

#### proposal

The `proposal` command allows users to query a given proposal.

```bash
atomoned query gov proposal [proposal-id] [flags]
```

Example:

```bash
atomoned query gov proposal 1
```

Example Output:

```bash
deposit_end_time: "2022-03-30T11:50:20.819676256Z"
final_tally_result:
  abstain_count: "0"
  no_count: "0"
  yes_count: "0"
id: "1"
messages:
- '@type': /cosmos.bank.v1beta1.MsgSend
  amount:
  - amount: "10"
    denom: atone
  from_address: atone1..
  to_address: atone1..
metadata: AQ==
status: PROPOSAL_STATUS_DEPOSIT_PERIOD
submit_time: "2022-03-28T11:50:20.819676256Z"
total_deposit:
- amount: "10"
  denom: atone
voting_end_time: null
voting_start_time: null
```

#### proposals

The `proposals` command allows users to query all proposals with optional filters.

```bash
atomoned query gov proposals [flags]
```

Example:

```bash
atomoned query gov proposals
```

Example Output:

```bash
pagination:
  next_key: null
  total: "0"
proposals:
- deposit_end_time: "2022-03-30T11:50:20.819676256Z"
  final_tally_result:
    abstain_count: "0"
    no_count: "0"
    yes_count: "0"
  id: "1"
  messages:
  - '@type': /cosmos.bank.v1beta1.MsgSend
    amount:
    - amount: "10"
      denom: atone
    from_address: atone1..
    to_address: atone1..
  metadata: AQ==
  status: PROPOSAL_STATUS_DEPOSIT_PERIOD
  submit_time: "2022-03-28T11:50:20.819676256Z"
  total_deposit:
  - amount: "10"
    denom: atone
  voting_end_time: null
  voting_start_time: null
- deposit_end_time: "2022-03-30T14:02:41.165025015Z"
  final_tally_result:
    abstain_count: "0"
    no_count: "0"
    yes_count: "0"
  id: "2"
  messages:
  - '@type': /cosmos.bank.v1beta1.MsgSend
    amount:
    - amount: "10"
      denom: atone
    from_address: atone1..
    to_address: atone1..
  metadata: AQ==
  status: PROPOSAL_STATUS_DEPOSIT_PERIOD
  submit_time: "2022-03-28T14:02:41.165025015Z"
  total_deposit:
  - amount: "10"
    denom: atone
  voting_end_time: null
  voting_start_time: null
```

#### proposer

The `proposer` command allows users to query the proposer for a given proposal.

```bash
atomoned query gov proposer [proposal-id] [flags]
```

Example:

```bash
atomoned query gov proposer 1
```

Example Output:

```bash
proposal_id: "1"
proposer: atone1..
```

#### tally

The `tally` command allows users to query the tally of a given proposal vote.

```bash
atomoned query gov tally [proposal-id] [flags]
```

Example:

```bash
atomoned query gov tally 1
```

Example Output:

```bash
abstain: "0"
"no": "0"
"yes": "1"
```

#### vote

The `vote` command allows users to query a vote for a given proposal.

```bash
atomoned query gov vote [proposal-id] [voter-addr] [flags]
```

Example:

```bash
atomoned query gov vote 1 atone1..
```

Example Output:

```bash
option: VOTE_OPTION_YES
options:
- option: VOTE_OPTION_YES
  weight: "1.000000000000000000"
proposal_id: "1"
voter: atone1..
```

#### votes

The `votes` command allows users to query all votes for a given proposal.

```bash
atomoned query gov votes [proposal-id] [flags]
```

Example:

```bash
atomoned query gov votes 1
```

Example Output:

```bash
pagination:
  next_key: null
  total: "0"
votes:
- option: VOTE_OPTION_YES
  options:
  - option: VOTE_OPTION_YES
    weight: "1.000000000000000000"
  proposal_id: "1"
  voter: atone1..
```

### Transactions

The `tx` commands allow users to interact with the `gov` module.

```bash
atomoned tx gov --help
```

#### deposit

The `deposit` command allows users to deposit tokens for a given proposal.

```bash
atomoned tx gov deposit [proposal-id] [deposit] [flags]
```

Example:

```bash
atomoned tx gov deposit 1 10000000atone --from atone1..
```

#### draft-proposal

The `draft-proposal` command allows users to draft any type of proposal.
The command returns a `draft_proposal.json`, to be used by `submit-proposal` after being completed.
The `draft_metadata.json` is meant to be uploaded to [IPFS](#metadata).

```bash
atomoned tx gov draft-proposal
```

#### generate-constitution-amendment

The `generate-constitution-amendment` command allows users to generate a constitution amendment
proposal message from the current constitution, either queried or provided as an `.md` file through
the flag `--current-constitution` and the provided updated constitution `.md` file.

```bash
atomoned tx gov generate-constitution-amendment path/to/updated/constitution.md
```

#### submit-proposal

The `submit-proposal` command allows users to submit a governance proposal along with some messages and metadata.
Messages, metadata and deposit are defined in a JSON file.

```bash
atomoned tx gov submit-proposal [path-to-proposal-json] [flags]
```

Example:

```bash
atomoned tx gov submit-proposal /path/to/proposal.json --from atone1..
```

where `proposal.json` contains:

```json
{
  "messages": [
    {
      "@type": "/cosmos.bank.v1beta1.MsgSend",
      "from_address": "atone1...", // The gov module module address
      "to_address": "atone1...",
      "amount":[{"denom": "atone","amount": "10"}]
    }
  ],
  "metadata": "AQ==",
  "deposit": "10atone",
  "title": "Proposal Title",
  "summary": "Proposal Summary"
}
```

:::note
By default the metadata, summary and title are both limited by 255 characters, this can be overridden by the application developer.
:::

#### submit-legacy-proposal

The `submit-legacy-proposal` command allows users to submit a governance legacy proposal along with an initial deposit.

```bash
atomoned tx gov submit-legacy-proposal [command] [flags]
```

Example:

```bash
atomoned tx gov submit-legacy-proposal --title="Test Proposal" --description="testing" --type="Text" --deposit="100000000atone" --from atone1..
```

Example (`cancel-software-upgrade`):

```bash
atomoned tx gov submit-legacy-proposal cancel-software-upgrade --title="Test Proposal" --description="testing" --deposit="100000000atone" --from atone1..
```

Example (`param-change`):

```bash
atomoned tx gov submit-legacy-proposal param-change proposal.json --from atone1..
```

```json
{
  "title": "Test Proposal",
  "description": "testing, testing, 1, 2, 3",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": 100
    }
  ],
  "deposit": "10000000atone"
}
```

Example (`software-upgrade`):

```bash
atomoned tx gov submit-legacy-proposal software-upgrade v2 --title="Test Proposal" --description="testing, testing, 1, 2, 3" --upgrade-height 1000000 --from atone1..
```

#### vote

The `vote` command allows users to submit a vote for a given governance proposal.

```bash
atomoned tx gov vote [command] [flags]
```

Example:

```bash
atomoned tx gov vote 1 yes --from atone1..
```

#### weighted-vote

The `weighted-vote` command allows users to submit a weighted vote for a given governance proposal.

```bash
atomoned tx gov weighted-vote [proposal-id] [weighted-options] [flags]
```

Example:

```bash
atomoned tx gov weighted-vote 1 yes=0.5,no=0.5 --from atone1..
```