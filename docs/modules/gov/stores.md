# Stores

:::note
Stores are KVStores in the multi-store. The key to find the store is the first parameter in the list
:::

We will use one KVStore `Governance` to store four mappings:

* A mapping from `proposalID|'proposal'` to `Proposal`.
* A mapping from `proposalID|'addresses'|address` to `Vote`. This mapping allows
  us to query all addresses that voted on the proposal along with their vote by
  doing a range query on `proposalID:addresses`.
* A mapping from `ParamsKey|'Params'` to `Params`. This map allows to query all
  x/gov params.
* A mapping from `VotingPeriodProposalKeyPrefix|proposalID` to a single byte. This allows
  us to know if a proposal is in the voting period or not with very low gas cost.

For pseudocode purposes, here are the two function we will use to read or write in stores:

* `load(StoreKey, Key)`: Retrieve item stored at key `Key` in store found at key `StoreKey` in the multistore
* `store(StoreKey, Key, value)`: Write value `Value` at key `Key` in store found at key `StoreKey` in the multistore

### Proposal Processing Queue

**Store:**

* `ProposalProcessingQueue`: A queue `queue[proposalID]` containing all the
  `ProposalIDs` of proposals that reached `MinDeposit`. During each `EndBlock`,
  all the proposals that have reached the end of their voting period are processed.
  To process a finished proposal, the application tallies the votes, computes the
  votes of each validator and checks if every validator in the validator set has
  voted. If the proposal is accepted, deposits are refunded. Finally, the proposal
  content `Handler` is executed.

And the pseudocode for the `ProposalProcessingQueue`:

```go
  in EndBlock do

    for finishedProposalID in GetAllFinishedProposalIDs(block.Time)
      proposal = load(Governance, <proposalID|'proposal'>) // proposal is a const key

      validators = Keeper.getAllValidators()
      tmpValMap := map(sdk.AccAddress)stakingtypes.ValidatorI

      // Tally
      voterIterator = rangeQuery(Governance, <proposalID|'addresses'>) //return all the addresses that voted on the proposal
      for each (voterAddress, vote) in voterIterator
        delegations = stakingKeeper.getDelegations(voterAddress) // get all delegations for current voter

        for each delegation in delegations
          proposal.updateTally(vote, delegation.Shares)

        _, isVal = stakingKeeper.getValidator(voterAddress)
        if (isVal)
          tmpValMap(voterAddress).Vote = vote

      tallyingParam = load(GlobalParams, 'TallyingParam')

      // Check if proposal is accepted or rejected
      totalNonAbstain := proposal.YesVotes + proposal.NoVotes
      if (proposal.Votes.YesVotes/totalNonAbstain > tallyingParam.Threshold)
        //  proposal was accepted at the end of the voting period
        //  refund deposits (non-voters already punished)
        for each (amount, depositor) in proposal.Deposits
          depositor.AtoneBalance += amount

        stateWriter, err := proposal.Handler()
        if err != nil
            // proposal passed but failed during state execution
            proposal.CurrentStatus = ProposalStatusFailed
         else
            // proposal pass and state is persisted
            proposal.CurrentStatus = ProposalStatusAccepted
            stateWriter.save()
      else
        // proposal was rejected
        proposal.CurrentStatus = ProposalStatusRejected

      store(Governance, <proposalID|'proposal'>, proposal)
```

### Legacy Proposal

A legacy proposal is the old implementation of governance proposal.
Contrary to proposal that can contain any messages, a legacy proposal allows
to submit a set of pre-defined proposals. These proposal are defined by their types.

While proposals should use the new implementation of the governance proposal, we need
still to use legacy proposal in order to submit a `software-upgrade` and a
`cancel-software-upgrade` proposal.

More information on how to submit proposals in the [client section](#client).

### Quorum Checks and Voting Period Extension

The module provides an extension mechanism for the voting period. By enforcing a delay
when quorum is reached too close to the end of the voting period, we ensure that the
community has enough time to understand all the proposal's implications and potentially
react accordingly without the worry of an imminent end to the voting period.

- `QuorumTimeout`: This parameter defines the time window after which, if the quorum
  is reached, the voting end time is extended. This value must be strictly less than
  `params.VotingPeriod`.
- `MaxVotingPeriodExtension`: This parameter defines the maximum amount of time by
  which a proposal's voting end time can be extended. This value must be greater or
  equal than `VotingPeriod - QuorumTimeout`.
- `QuorumCheckCount`: This parameter specifies the number of times a proposal
  should be checked for achieving quorum after the expiration of `QuorumTimeout`.
  It is used to determine the intervals at which these checks will take place. The
  intervals are calculated as `(VotingPeriod - QuorumTimeout) / QuorumCheckCount`.
  This avoids the need to check for quorum at the end of each block, which would have
  a significant impact on performance. Furthermore, if this value is set to 0, the
  quorum check and voting period extension system is considered *disabled*.

**Store:**

We also introduce a new `keeper.QuorumCheckQueue` similar to `keeper.ActiveProposalsQueue`
and `keeper.InactiveProposalsQueue`. This queue stores proposals that are due to be
checked for quorum. The key for each proposal in the queue is a pair containing the time
at which the proposal should be checked for quorum as the first part, and the `proposal.Id`
as the second. The value will instead be a `QuorumCheckQueueEntry` struct that will store:

- `QuorumTimeoutTime`, indicating the time at which this proposal will pass the
  `QuorumTimeout` and computed as `proposal.VotingStartTime + QuorumTimeout`
- `QuorumCheckCount`, a copy of the value of the module parameter with the same
  name at the time of first insertion of this proposal in the `QuorumCheckQueue`
- `QuorumChecksDone`, indicating the number of quorum checks that have been already
  performed, initially 0

When a proposal is added to the `keeper.ActiveProposalsQueue`, it is also added to the
`keeper.QuorumCheckQueue`. The time part of the key for the proposal in the
`QuorumCheckQueue` is initially calculated as `proposal.VotingStartTime + QuorumTimeout`
(i.e. the `QuorumTimeoutTime`), therefore scheduling the first quorum check to happen
right after `QuorumTimeout` has expired.

In the `EndBlocker()` function of the `x/gov` module, we add a new call to
`keeper.IterateQuorumCheckQueue()` between the calls to `keeper.IterateInactiveProposalsQueue()`
and `keeper.IterateActiveProposalsQueue(`, where we iterate over proposals
that are due to be checked for quorum, meaning that their time part of the key is
before the current block time.

If a proposal has reached quorum (approximately) before or right at the
`QuorumTimeout`- i.e. the `QuorumChecksDone` is 0, meaning more precisely
that no previous quorum checks were performed - remove it from the `QuorumCheckQueue`
and do nothing, the proposal should end as expected.

If a proposal has reached quorum after the `QuorumTimeout` - i.e.
`QuorumChecksDone` > 0 - update the `proposal.VotingEndTime` as
`ctx.BlockTime() + MaxVotingPeriodExtension` and remove it from the
`keeper.QuorumCheckQueue`.

If a proposal is still active and has not yet reached quorum, remove the corresponding
item from `keeper.QuorumCheckQueue`, modify the last `QuorumCheckQueueEntry` value by
incrementing `QuorumChecksDone` to record this latest unsuccessful quorum check, and add
the proposal back to `keeper.QuorumCheckQueue` with updated keys and value.

To compute the time part of the new key, add a quorum check interval - which is computed as
`(VotingPeriod - QuorumTimeout) / QuorumCheckCount` - to the time part of the last key used in
`keeper.QuorumCheckQueue` for this proposal. Specifically, use the formula
`lastKey.K1.Add((VotingPeriod - QuorumTimeout) / QuorumCheckCount)`. As previously stated,
the value will remain the same struct as before, with `QuorumChecksDone` incremented by 1 to reflect
the additional unsuccessful quorum check that was performed.

If a proposal has passed its `VoteEndTime` and has not reached quorum, it should be removed from
`keeper.QuorumCheckQueue` without any additional actions. The proposal's failure will be handled
in the subsequent `keeper.IterateActiveProposalsQueue`.

### Constitution

A `constitution` string can be set at genesis with arbitrary content and is intended to be used
to store the chain established constitution upon launch.
The `constitution` can be updated through Constitution Amendment Proposals which must include
a valid patch of the `constitution` string expressed in **unified diff** format.
Example (from [gnu.org](https://www.gnu.org/software/diffutils/manual/html_node/Example-Unified.html)):

```
--- lao	2002-02-21 23:30:39.942229878 -0800
+++ tzu	2002-02-21 23:30:50.442260588 -0800
@@ -1,7 +1,6 @@
-The Way that can be told of is not the eternal Way;
-The name that can be named is not the eternal name.
 The Nameless is the origin of Heaven and Earth;
-The Named is the mother of all things.
+The named is the mother of all things.
+
 Therefore let there always be non-being,
   so we may see their subtlety,
 And let there always be being,
@@ -9,3 +8,6 @@
 The two are the same,
 But after they are produced,
   they have different names.
+They both may be called deep and profound.
+Deeper and more profound,
+The door of all subtleties!
```

### Law and Constitution Amendment Proposals

If Law or Constitution Amendment Proposals are submitted - by providing either a 
`MsgProposeLaw` or a `MsgProposeConstitutionAmendment` in the `MsgSubmitProposal.messages`
field, the related proposal will be tallied using specific quorum and threshold values
instead of the default ones for regular proposals. More specifically, the following parameters
are added to enable this behavior:

- `constitution_amendment_quorum` which defines the quorum for constitution amendment proposals
- `constitution_amendment_threshold` which defines the minimum proportion of Yes votes for a
  Constitution Amendment proposal to pass.
- `law_quorum` which defines the quorum for law proposals
- `law_threshold` which defines the minimum proportion of Yes votes for a Law proposal to pass.

The `MsgProposeLaw` just contains for now an `authority` field indicating who will execute the
`sdk.Msg` (which should be the governance module account), and has no effects for now. The conent
of Laws is entirely defined in the proposal `summary`. Example: 

```
{
   "authority": "cosmos10d07y265gmmuvt4z0w9aw880jnsr700j6zn9kn"
}
```

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/tx.proto#L195-L202
```

The `MsgProposeConstitutionAmendment` contains the `authority` field and also an `amendment` field
that needs to be a string representing a valid patch for the `constitution` expressed in 
unified diff format. Example:

```
{
   "authority": "cosmos10d07y265gmmuvt4z0w9aw880jnsr700j6zn9kn",
   "amendment": "--- src\\n+++ dst\\n@@ -1 +1 @@\\n-Old Constitution\\n+Modified Constitution\\n\"
}
```

```protobuf reference
https://github.com/atomone-hub/atomone/blob/b9631ed2e3b781cd82a14316f6086802d8cb4dcf/proto/atomone/gov/v1/tx.proto#L209-L219
```

Upon execution of the `MsgProposeConstitutionAmendment` (which will happen if the proposal passes)
The `constitution` string will be updated by applying the patch defined in the `amendment` string.
An error will be returned if the `amendment` string is malformed, so constitution amendment proposals
need to be crafted with care.