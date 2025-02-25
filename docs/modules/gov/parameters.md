# Parameters

The governance module contains the following parameters:

| Key                              | Type             | Example                                 |
|----------------------------------|------------------|-----------------------------------------|
| min_deposit                      | array (coins)    | [{"denom":"uatone","amount":"10000000"}] |
| max_deposit_period               | string (time ns) | "172800000000000" (17280s)              |
| voting_period                    | string (time ns) | "172800000000000" (17280s)              |
| quorum                           | string (dec)     | "0.334000000000000000"                  |
| threshold                        | string (dec)     | "0.500000000000000000"                  |
| burn_proposal_deposit_prevote    | bool             | false                                   |
| burn_vote_quorum                 | bool             | false                                   |
| min_initial_deposit_ratio        | string (dec)     | "0.100000000000000000"                  |
| min_deposit_ratio                | string (dec)     | "0.010000000000000000"                  |
| constitution_amendment_quorum    | string (dec)     | "0.334000000000000000"                  |
| constitution_amendment_threshold | string (dec)     | "0.900000000000000000"                  |
| law_quorum                       | string (dec)     | "0.334000000000000000"                  |
| law_threshold                    | string (dec)     | "0.900000000000000000"                  |
| quorum_timeout                   | string (time ns) | "172800000000000" (17280s)              |
| max_voting_period_extension      | string (time ns) | "172800000000000" (17280s)              |
| quorum_check_count               | uint64           | 2                                       |


**NOTE**: The governance module contains parameters that are objects unlike other
modules. If only a subset of parameters are desired to be changed, only they need
to be included and not the entire parameter object structure.