# Messages

## Proposal Submission

Proposals can be submitted by any account via a `MsgSubmitProposal` transaction.

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/tx.proto#L53-L82
```

All `sdk.Msgs` passed into the `messages` field of a `MsgSubmitProposal` message
must be registered in the app's `MsgServiceRouter`. Each of these messages must
have one signer, namely the gov module account. And finally, the metadata length
must not be larger than the `maxMetadataLen` config passed into the gov keeper.

**State modifications:**

* Generate new `proposalID`
* Create new `Proposal`
* Initialise `Proposal`'s attributes
* Decrease balance of sender by `InitialDeposit`
* If `MinDeposit` is reached:
    * Push `proposalID` in `ProposalProcessingQueue`
* Transfer `InitialDeposit` from the `Proposer` to the governance `ModuleAccount`

A `MsgSubmitProposal` transaction can be handled according to the following
pseudocode.

```go
// PSEUDOCODE //
// Check if MsgSubmitProposal is valid. If it is, create proposal //

upon receiving txGovSubmitProposal from sender do

  if !correctlyFormatted(txGovSubmitProposal)
    // check if proposal is correctly formatted and the messages have routes to other modules. Includes fee payment.
    // check if all messages' unique Signer is the gov acct.
    // check if the metadata is not too long.
    throw

  initialDeposit = txGovSubmitProposal.InitialDeposit
  if (initialDeposit.Atones <= 0) OR (sender.AtoneBalance < initialDeposit.Atones)
    // InitialDeposit is negative or null OR sender has insufficient funds
    throw

  if (txGovSubmitProposal.Type != ProposalTypePlainText) OR (txGovSubmitProposal.Type != ProposalTypeSoftwareUpgrade)

  sender.AtoneBalance -= initialDeposit.Atones

  depositParam = load(GlobalParams, 'DepositParam')

  proposalID = generate new proposalID
  proposal = NewProposal()

  proposal.Messages = txGovSubmitProposal.Messages
  proposal.Metadata = txGovSubmitProposal.Metadata
  proposal.TotalDeposit = initialDeposit
  proposal.SubmitTime = <CurrentTime>
  proposal.DepositEndTime = <CurrentTime>.Add(depositParam.MaxDepositPeriod)
  proposal.Deposits.append({initialDeposit, sender})
  proposal.Submitter = sender
  proposal.YesVotes = 0
  proposal.NoVotes = 0
  proposal.AbstainVotes = 0
  proposal.CurrentStatus = ProposalStatusOpen

  store(Proposals, <proposalID|'proposal'>, proposal) // Store proposal in Proposals mapping
  return proposalID
```

## Deposit

Once a proposal is submitted, if
`Proposal.TotalDeposit < ActiveParam.MinDeposit`, Atone holders can send
`MsgDeposit` transactions to increase the proposal's deposit.

A proposal can only be sumbitted if the proposer deposits at least
`ActiveParam.MinDeposit` * `ActiveParam.MinInitialDepositRatio`, where
`ActiveParam.MinInitialDepositRatio` must be a valid percentage between 0 and 1.

Any deposit from Atone holders (including the proposer) need to be of at least
`ActiveParam.MinDeposit` * `ActiveParam.MinDepositRatio`, where
`ActiveParam.MinDepositRatio` must be a valid percentage between 0 and 1.

Generally it is expected that
`ActiveParam.MinDepositRatio` <= `ActiveParam.MinInitialDepositRatio`



```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/tx.proto#L150-L165
```

**State modifications:**

* Decrease balance of sender by `deposit`
* Add `deposit` of sender in `proposal.Deposits`
* Increase `proposal.TotalDeposit` by sender's `deposit`
* If `MinDeposit` is reached:
    * Push `proposalID` in `ProposalProcessingQueueEnd`
* Transfer `Deposit` from the `proposer` to the governance `ModuleAccount`

A `MsgDeposit` transaction has to go through a number of checks to be valid.
These checks are outlined in the following pseudocode.

```go
// PSEUDOCODE //
// Check if MsgDeposit is valid. If it is, increase deposit and check if MinDeposit is reached

upon receiving txGovDeposit from sender do
  // check if proposal is correctly formatted. Includes fee payment.

  if !correctlyFormatted(txGovDeposit)
    throw

  proposal = load(Proposals, <txGovDeposit.ProposalID|'proposal'>) // proposal is a const key, proposalID is variable

  if (proposal == nil)
    // There is no proposal for this proposalID
    throw

  if (txGovDeposit.Deposit.Atones <= 0) OR (sender.AtoneBalance < txGovDeposit.Deposit.Atones) OR (proposal.CurrentStatus != ProposalStatusOpen)

    // deposit is negative or null
    // OR sender has insufficient funds
    // OR proposal is not open for deposit anymore

    throw

  depositParam = load(GlobalParams, 'DepositParam')

  if (CurrentBlock >= proposal.SubmitBlock + depositParam.MaxDepositPeriod)
    proposal.CurrentStatus = ProposalStatusClosed

  else
    // sender can deposit
    sender.AtoneBalance -= txGovDeposit.Deposit.Atones

    proposal.Deposits.append({txGovVote.Deposit, sender})
    proposal.TotalDeposit.Plus(txGovDeposit.Deposit)

    if (proposal.TotalDeposit >= depositParam.MinDeposit)
      // MinDeposit is reached, vote opens

      proposal.VotingStartBlock = CurrentBlock
      proposal.CurrentStatus = ProposalStatusActive
      ProposalProcessingQueue.push(txGovDeposit.ProposalID)

  store(Proposals, <txGovVote.ProposalID|'proposal'>, proposal)
```

## Vote

Once `ActiveParam.MinDeposit` is reached, voting period starts. From there,
bonded Atone holders are able to send `MsgVote` transactions to cast their
vote on the proposal.

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/tx.proto#L106-L123
```

**State modifications:**

* Record `Vote` of sender

:::note
Gas cost for this message has to take into account the future tallying of the vote in EndBlocker.
:::

Next is a pseudocode outline of the way `MsgVote` transactions are handled:

```go
  // PSEUDOCODE //
  // Check if MsgVote is valid. If it is, count vote//

  upon receiving txGovVote from sender do
    // check if proposal is correctly formatted. Includes fee payment.

    if !correctlyFormatted(txGovDeposit)
      throw

    proposal = load(Proposals, <txGovDeposit.ProposalID|'proposal'>)

    if (proposal == nil)
      // There is no proposal for this proposalID
      throw


    if  (proposal.CurrentStatus == ProposalStatusActive)


        // Sender can vote if
        // Proposal is active
        // Sender has some bonds

        store(Governance, <txGovVote.ProposalID|'addresses'|sender>, txGovVote.Vote)   // Voters can vote multiple times. Re-voting overrides previous vote. This is ok because tallying is done once at the end.
```