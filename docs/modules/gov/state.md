# State

## Proposals

`Proposal` objects are used to tally votes and generally track the proposal's state.
They contain an array of arbitrary `sdk.Msg`'s which the governance module will attempt
to resolve and then execute if the proposal passes. `Proposal`'s are identified by a
unique id and contains a series of timestamps: `submit_time`, `deposit_end_time`,
`voting_start_time`, `voting_end_time` which track the lifecycle of a proposal

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/gov.proto#L51-L101
```

A proposal will generally require more than just a set of messages to explain its
purpose but need some greater justification and allow a means for interested participants
to discuss and debate the proposal.
In most cases, **it is encouraged to have an off-chain system that supports the on-chain governance process**.
To accommodate for this, a proposal contains a special **`metadata`** field, a string,
which can be used to add context to the proposal. The `metadata` field allows custom use for networks,
however, it is expected that the field contains a URL or some form of CID using a system such as
[IPFS](https://docs.ipfs.io/concepts/content-addressing/). To support the case of
interoperability across networks, the SDK recommends that the `metadata` represents
the following `JSON` template:

```json
{
  "title": "...",
  "description": "...",
  "forum": "...", // a link to the discussion platform (i.e. Discord)
  "other": "..." // any extra data that doesn't correspond to the other fields
}
```

This makes it far easier for clients to support multiple networks.

The metadata has a maximum length that is chosen by the app developer, and
passed into the gov keeper as a config. The default maximum length in the SDK is 255 characters.

### Writing a module that uses governance

There are many aspects of a chain, or of the individual modules that you may want to
use governance to perform such as changing various parameters. This is very simple
to do. First, write out your message types and `MsgServer` implementation. Add an
`authority` field to the keeper which will be populated in the constructor with the
governance module account: `govKeeper.GetGovernanceAccount().GetAddress()`. Then for
the methods in the `msg_server.go`, perform a check on the message that the signer
matches `authority`. This will prevent any user from executing that message.

## Parameters and base types

`Parameters` define the rules according to which votes are run. There can only
be one active parameter set at any given time. If governance wants to change a
parameter set, either to modify a value or add/remove a parameter field, a new
parameter set has to be created and the previous one rendered inactive.

### DepositParams

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/gov.proto#L167-L181
```

### VotingParams

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/gov.proto#L183-L187
```

### TallyParams

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/gov.proto#L189-L209
```

Parameters are stored in a global `GlobalParams` KVStore.

Additionally, we introduce some basic types:

```go
type Vote byte

const (
    VoteYes         = 0x1
    VoteAbstain     = 0x2
    VoteNo          = 0x3
)

type ProposalType  string

const (
    ProposalTypePlainText       = "Text"
    ProposalTypeSoftwareUpgrade = "SoftwareUpgrade"
)

type ProposalStatus byte


const (
    StatusNil           ProposalStatus = 0x00
    StatusDepositPeriod ProposalStatus = 0x01  // Proposal is submitted. Participants can deposit on it but not vote
    StatusVotingPeriod  ProposalStatus = 0x02  // MinDeposit is reached, participants can vote
    StatusPassed        ProposalStatus = 0x03  // Proposal passed and successfully executed
    StatusRejected      ProposalStatus = 0x04  // Proposal has been rejected
    StatusFailed        ProposalStatus = 0x05  // Proposal passed but failed execution
)
```

## Deposit

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/gov.proto#L37-L49
```