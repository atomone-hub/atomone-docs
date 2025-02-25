---
outline: deep
order: 99
---

# Gov Module

## Abstract

This paper specifies the Governance module for AtomOne, a fork
of the module of the Cosmos SDK, which was first described in the
[Cosmos Whitepaper](https://cosmos.network/about/whitepaper) in
June 2016.

The module enables Cosmos SDK based blockchain to support an on-chain governance
system. In this system, holders of the native staking token of the chain can vote
on proposals on a 1 token 1 vote basis. Next is a list of features the module
currently supports:

* **Proposal submission:** Users can submit proposals with a deposit. Once the
minimum deposit is reached, the proposal enters voting period. The minimum deposit
can be reached by collecting deposits from different users (including proposer) within deposit period.
* **Vote:** Participants can vote on proposals that reached `MinDeposit` and entered voting period.
* **Claiming deposit:** Users that deposited on proposals can recover their
deposits if the proposal was accepted or rejected. If the proposal never entered voting period
(minimum deposit not reached within deposit period), the deposit is burned.

This module is in use in [AtomOne](https://github.com/atomone-hub/atomone)).
Features that may be added in the future are described in [Future Improvements](#future-improvements).












## Future Improvements

The current documentation only describes the minimum viable product for the
governance module. Future improvements may include:

* **`BountyProposals`:** If accepted, a `BountyProposal` creates an open
  bounty. The `BountyProposal` specifies how many Atones will be given upon
  completion. These Atones will be taken from the `reserve pool`. After a
  `BountyProposal` is accepted by governance, anybody can submit a
  `SoftwareUpgradeProposal` with the code to claim the bounty. Note that once a
  `BountyProposal` is accepted, the corresponding funds in the `reserve pool`
  are locked so that payment can always be honored. In order to link a
  `SoftwareUpgradeProposal` to an open bounty, the submitter of the
  `SoftwareUpgradeProposal` will use the `Proposal.LinkedProposal` attribute.
  If a `SoftwareUpgradeProposal` linked to an open bounty is accepted by
  governance, the funds that were reserved are automatically transferred to the
  submitter.
* **Complex delegation:** Delegators could choose other representatives than
  their validators. Ultimately, the chain of representatives would always end
  up to a validator, but delegators could inherit the vote of their chosen
  representative before they inherit the vote of their validator. In other
  words, they would only inherit the vote of their validator if their other
  appointed representative did not vote.
* **Better process for proposal review:** There would be two parts to
  `proposal.Deposit`, one for anti-spam (same as in MVP) and an other one to
  reward third party auditors.