import { ref } from 'vue';
import { ChainRegistry } from '../types/chainRegistry';

const CHAIN_REGISTRY_URL = `https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/atomone/chain.json`;

const data = ref<ChainRegistry>();
const isLoading = ref(true);
const error = ref(null);

export const useChainData = () => {
    const fetchData = async () => {
        try {
            const response = await fetch(CHAIN_REGISTRY_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            data.value = await response.json();
        } catch (err) {
            error.value = err.message;
        } finally {
            isLoading.value = false;
        }
    };

    fetchData();

    return { data, isLoading, error };
};
