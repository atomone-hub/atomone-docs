---
outline: deep
---

# Client

## gRPC

- Query/ConversionRate: Returns the current conversion rate.  
- Query/Params: Returns `mint_disabled` and `txfee_exceptions`.

## REST

Endpoints mirror the gRPC queries, allowing retrieval of conversion rate and parameters.

- `/atomone/photon/v1/conversion_rate`: Returns the current conversion rate.
- `/atomone/photon/v1/params`: Returns `mint_disabled` and `txfee_exceptions`.