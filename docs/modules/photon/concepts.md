---
outline: deep
---

# Concepts

## ATONE to PHOTON conversion

PHOTON is minted by burning ATONE at a conversion rate:

```go
photon_minted = atone_burned * (photon_max_supply - photon_supply) / atone_supply
```

This ensures PHOTON’s supply never exceeds 1 B tokens. The module checks for
non-zero PHOTON to mint before completing the transaction. This is because
rounding errors can cause the calculated amount to be zero when burning small
fractions of ATONE’s supply.

## Fee enforcement

An AnteDecorator ensures PHOTON (`uphoton`) is the only fee token for most
transactions. A small set of messages (initially just `MsgMintPhoton`) can
be set as exceptions and accept other fees such ATONE, as defined by the 
`txfee_exceptions` parameter.