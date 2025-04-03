export type ChainRegistry = {
    $schema: string;
    chain_name: string;
    chain_type: string;
    chain_id: string;
    website: string;
    pretty_name: string;
    status: string;
    network_type: string;
    bech32_prefix: string;
    daemon_name: string;
    node_home: string;
    key_algos: Array<string>;
    slip44: number;
    fees: {
        fee_tokens: Array<{
            denom: string;
            fixed_min_gas_price: number;
            low_gas_price: number;
            average_gas_price: number;
            high_gas_price: number;
        }>;
    };
    staking: {
        staking_tokens: Array<{
            denom: string;
        }>;
    };
    codebase: {
        git_repo: string;
        recommended_version: string;
        compatible_versions: Array<string>;
        binaries: {
            'linux/amd64': string;
            'linux/arm64': string;
            'darwin/amd64': string;
            'darwin/arm64': string;
            'windows/amd64': string;
            'windows/arm64': string;
        };
        genesis: {
            genesis_url: string;
        };
        consensus: {
            type: string;
            version: string;
        };
        sdk: {
            type: string;
            version: string;
        };
    };
    logo_URIs: {
        png: string;
        svg: string;
    };
    description: string;
    peers: {
        seeds: Array<{
            id: string;
            address: string;
            provider: string;
        }>;
        persistent_peers: Array<{
            id: string;
            address: string;
            provider?: string;
        }>;
    };
    apis: {
        rpc: Array<{
            address: string;
            provider: string;
        }>;
        rest: Array<{
            address: string;
            provider: string;
        }>;
        grpc: Array<{
            address: string;
            provider: string;
        }>;
    };
    explorers: Array<{
        kind: string;
        url: string;
        tx_page: string;
        account_page: string;
    }>;
    images: Array<{
        png: string;
        svg: string;
    }>;
};
