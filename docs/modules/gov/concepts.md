# Concepts

*Disclaimer: This is work in progress. Mechanisms are susceptible to change.*

The governance process is divided in a few steps that are outlined below:

* **Proposal submission:** Proposal is submitted to the blockchain with a
  deposit.
* **Vote:** Once deposit reaches a certain value (`MinDeposit`), proposal is
  confirmed and vote opens. Bonded Atone holders can then send `MsgVote`
  transactions to vote on the proposal.
* **Execution** After a period of time, the votes are tallied and depending
  on the result, the messages in the proposal will be executed.

## Proposal submission

### Right to submit a proposal

Every account can submit proposals by sending a `MsgSubmitProposal` transaction.
Once a proposal is submitted, it is identified by its unique `proposalID`.

### Proposal Messages

A proposal includes an array of `sdk.Msg`s which are executed automatically if the
proposal passes. The messages are executed by the governance `ModuleAccount` itself. Modules
such as `x/upgrade`, that want to allow certain messages to be executed by governance
only should add a whitelist within the respective msg server, granting the governance
module the right to execute the message once a quorum has been reached. The governance
module uses the `MsgServiceRouter` to check that these messages are correctly constructed
and have a respective path to execute on but do not perform a full validity check.

## Deposit

To prevent spam, proposals must be submitted with a deposit in the coins defined by
the `MinDeposit` param multiplied by the `MinInitialDepositRatio` param.

When a proposal is submitted, it has to be accompanied with a deposit that must be
greater than the `MinDeposit` multiplied by the `MinInitialDepositRatio` param,
but can be inferior to `MinDeposit` (since `MinDepositRatio` is a percentage).
The submitter doesn't need to pay for the entire deposit on their own. The newly
created proposal is stored in an *inactive proposal queue* and stays there until
its deposit passes the `MinDeposit`. Other token holders can increase the proposal's
deposit by sending a `Deposit` transaction. Deposits from token holders must always be
greater than `MinDeposit` multiplied by the `MinDepositRatio` param, or they will be
rejected. If a proposal doesn't pass the `MinDeposit` before the deposit end time
(the time when deposits are no longer accepted), the proposal will be destroyed: the
proposal will be removed from state and the deposit will be burned (see x/gov
`EndBlocker`). When a proposal deposit passes the `MinDeposit` threshold
(even during the proposal submission) before the deposit end time, the proposal will
be moved into the *active proposal queue* and the voting period will begin.

The deposit is kept in escrow and held by the governance `ModuleAccount` until the
proposal is finalized (passed or rejected).

### Deposit refund

When a proposal is finalized, the coins from the deposit are refunded
regardless of wether the proposal is approved or rejected.
All refunded or burned deposits are removed from the state. Events are issued
when burning or refunding a deposit.

## Vote

### Participants

*Participants* are users that have the right to vote on proposals. On the
AtomOne, participants are bonded Atone holders. Unbonded Atone holders and
other users do not get the right to participate in governance. However, they
can submit and deposit on proposals.

Note that when *participants* have bonded and unbonded Atones, their voting
power is calculated from their bonded Atone holdings only.

### Voting period

Once a proposal reaches `MinDeposit`, it immediately enters `Voting period`. We
define `Voting period` as the interval between the moment the vote opens and
the moment the vote closes. `Voting period` should always be shorter than
`Unbonding period` to prevent double voting. The initial value of
`Voting period` is 3 weeks, which is also set as a hard lower bound.

### Option set

The option set of a proposal refers to the set of choices a participant can
choose from when casting its vote.

The initial option set includes the following options:

* `Yes`
* `No`
* `Abstain`

`Abstain` option allows voters to signal that they do not intend to vote in
favor or against the proposal but accept the result of the vote.

### Weighted Votes

[ADR-037](https://github.com/cosmos/cosmos-sdk/blob/main/docs/architecture/adr-037-gov-split-vote.md)
introduces the weighted vote feature which allows a staker to split their votes
into several voting options. For example, it could use 70% of its voting power
to vote Yes and 30% of its voting power to vote No.

Often times the entity owning that address might not be a single individual.
For example, a company might have different stakeholders who want to vote
differently, and so it makes sense to allow them to split their
voting power. Currently, it is not possible for them to do "passthrough voting"
and giving their users voting rights over their tokens. However, with this system,
exchanges can poll their users for voting preferences, and then vote on-chain
proportionally to the results of the poll.

To represent weighted vote on chain, we use the following Protobuf message.

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/gov.proto#L27-L35
```

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/gov.proto#L134-L150
```

For a weighted vote to be valid, the `options` field must not contain duplicate
vote options, and the sum of weights of all options must be equal to 1.

## Quorum

Quorum is defined as the minimum percentage of voting power that needs to be
cast on a proposal for the result to be valid.

### Threshold

Threshold is defined as the minimum proportion of `Yes` votes (excluding
`Abstain` votes) for the proposal to be accepted.

Initially, the threshold is set at 66.7% of `Yes` votes, excluding `Abstain`
votes. Note, the value is derived from the `TallyParams` on-chain parameter,
which is modifiable by governance. This means that proposals are accepted if:

* There exist bonded tokens.
* Quorum has been achieved.
* The proportion of `Abstain` votes is inferior to 1/1.
* The proportion of `Yes` votes, excluding `Abstain` votes, at the end of
  the voting period is superior to 2/3.

### No inheritance

If a delegator does not vote, it won't inherit its validator vote.

Similarly, a validator's voting power is only equal to its own stake.

### Validator’s punishment for non-voting

At present, validators are not punished for failing to vote.

### Governance address

Later, we may add permissioned keys that could only sign txs from certain modules.
For the MVP, the `Governance address` will be the main validator address generated
at account creation. This address corresponds to a different PrivKey than the CometBFT
PrivKey which is responsible for signing consensus messages. Validators thus do not
have to sign governance transactions with the sensitive CometBFT PrivKey.

### Burnable Params

There are three parameters that define if the deposit of a proposal should
be burned or returned to the depositors.

* `BurnVoteQuorum` burns the proposal deposit if the proposal deposit if the vote does not reach quorum.
* `BurnProposalDepositPrevote` burns the proposal deposit if it does not enter the voting phase.

> Note: These parameters are modifiable via governance.
