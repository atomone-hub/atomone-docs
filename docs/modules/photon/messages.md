---
outline: deep
---

# Messages

## MsgMintPhoton

Burns a specified ATONE amount in exchange for newly minted PHOTON. The minted
tokens go to the caller’s account. If `mint_disabled` is `true`, this message fails.

## Parameters

| Key              | Type       | Default               |
|------------------|-----------|------------------------|
| mint_disabled    | bool       | false                 |
| txfee_exceptions | []string   | ["MsgMintPhoton"]     |